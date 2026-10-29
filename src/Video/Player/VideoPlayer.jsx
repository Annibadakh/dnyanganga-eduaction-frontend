import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import logo from "../../Images/logo3.png";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { formatDuration } from "../uploadVideo";

// HLS player on the native <video> element, with YouTube-style controls.
//  - hls.js where supported (Chrome, Edge, Firefox, Android); native HLS on iPhone/iPad
//  - settings menu: quality, playback speed, aspect ratio (fit / crop / stretch / 16:9 / 4:3)
//  - seek bar: drag shows the time and seeks once on release; hover shows the time (mouse)
//  - tap / click on the picture shows or hides the controls (phones: centre ⟲ ▶ ⟳); double-click
//    = fullscreen; phones: double-tap left/right skips 10 s
//    (taps add up: 10, 20, 30 s), hold for 2× speed, pinch in fullscreen to crop / fit
//  - fullscreen on a phone turns to landscape (portrait videos stay portrait); turning the
//    phone sideways while playing goes fullscreen where the browser allows it
//  - keyboard: Space/K play, ←/→ or J/L 10 s, ↑/↓ volume, 0–9 jump to 0–90 %, F fullscreen, M mute
//  - resumes where the viewer left off (per video, on this device)
//  - playback access is renewed before it expires, and once more if a request is refused
//
// Props: src (HLS manifest URL), signedQuery (CloudFront signature as URL parameters), videoId,
//        title, expiresAt, renew (async () => { expiresAt })
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const FITS = [
  { value: "contain", label: "Fit (original)" },
  { value: "cover", label: "Fill screen (crop)" },
  { value: "fill", label: "Stretch" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
];
const FIXED_RATIOS = { "16:9": 16 / 9, "4:3": 4 / 3 };
const HIDE_AFTER_MS = 3000;
const RENEW_BEFORE_MS = 10 * 60 * 1000;
const DOUBLE_TAP_MS = 300;
const HOLD_MS = 500;

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null; // storage blocked: settings / resume just aren't remembered
    }
  },
  set(key, value) {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // storage blocked
    }
  },
};
const positionKey = (videoId) => `video-position-${videoId}`;
const savedPosition = (videoId) => Number(store.get(positionKey(videoId))) || 0;
const savePosition = (videoId, seconds) =>
  store.set(positionKey(videoId), seconds > 0 ? String(Math.floor(seconds)) : null);
const savedFit = () => {
  const value = store.get("video-fit");
  return FITS.some((f) => f.value === value) ? value : "contain";
};

const isTouchDevice = () => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

const VideoPlayer = ({ src, signedQuery, videoId, title, expiresAt, renew }) => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const hideTimer = useRef(null);
  const lastTap = useRef({ time: 0, side: null });
  const skipTimer = useRef(null);
  const holdTimer = useRef(null);
  const holding = useRef(null); // playback rate before the 2× hold
  const pinch = useRef(null); // starting finger distance
  const lastSaved = useRef(0);
  const renewing = useRef(false);
  const scrubRef = useRef(null);
  const queryRef = useRef(signedQuery);
  queryRef.current = signedQuery; // renewed signature is used by the next request without a reload

  const [touch] = useState(isTouchDevice);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [levels, setLevels] = useState([]); // [{ index, height }]
  const [level, setLevel] = useState(-1); // -1 = Auto
  const [activeHeight, setActiveHeight] = useState(null);
  const [fit, setFit] = useState(savedFit);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [menu, setMenu] = useState(null); // null | "main" | "quality" | "speed" | "fit"
  const [waiting, setWaiting] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [error, setError] = useState("");
  const [skipHint, setSkipHint] = useState(null); // { side: "left" | "right", seconds }
  const [fastHold, setFastHold] = useState(false);
  const [scrub, setScrub] = useState(null); // seconds while the seek bar is dragged
  const [hover, setHover] = useState(null); // { pct, time } mouse over the seek bar
  const [reloadToken, setReloadToken] = useState(0);
  const resumeAt = useRef(null);

  // ---------- source ----------
  const renewAccess = useCallback(async () => {
    if (!renew || renewing.current) return false;
    renewing.current = true;
    try {
      await renew();
      return true;
    } catch {
      return false;
    } finally {
      renewing.current = false;
    }
  }, [renew]);

  // reload the stream after access was renewed, continuing from the same second
  const reloadAfterRenew = useCallback(async () => {
    const video = videoRef.current;
    resumeAt.current = { time: video?.currentTime || 0, play: video ? !video.paused : false };
    if (await renewAccess()) setReloadToken((n) => n + 1);
    else setError("Your viewing session expired. Please reload the page.");
  }, [renewAccess]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;
    setError("");
    setWaiting(true);
    let retriedNetwork = false;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Signature goes on every request (manifests and segments) instead of cookies, so the video
        // domain can answer with "Access-Control-Allow-Origin: *" (CloudFront managed SimpleCORS)
        xhrSetup: (xhr, url) => {
          const query = queryRef.current;
          xhr.open("GET", query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url, true);
          if (!query) xhr.withCredentials = true; // older server without signedQuery: fall back to the cookies
        },
        capLevelToPlayerSize: true,
        startLevel: -1,
        // a bit more buffer ahead → fewer stalls on mobile data
        maxBufferLength: 30,
        backBufferLength: 30,
      });
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(
          data.levels
            .map((l, index) => ({ index, height: l.height }))
            .sort((a, b) => b.height - a.height),
        );
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setActiveHeight(hls.levels[data.level]?.height || null);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        const status = data.response?.code;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && (status === 403 || status === 401)) {
          reloadAfterRenew();
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !retriedNetwork) {
          retriedNetwork = true;
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setError("The video couldn't be loaded. Check your connection and try again.");
        }
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src; // iPhone / iPad: native HLS, cookies go with the requests
      const onError = () => reloadAfterRenew();
      video.addEventListener("error", onError);
      return () => {
        video.removeEventListener("error", onError);
        video.removeAttribute("src");
        video.load();
      };
    }

    setError("This browser can't play the video. Please use Chrome, Edge, Firefox or Safari.");
    return undefined;
  }, [src, reloadToken, reloadAfterRenew]);

  // renew the playback access shortly before it expires
  useEffect(() => {
    if (!expiresAt || !renew) return undefined;
    const ms = new Date(expiresAt).getTime() - Date.now() - RENEW_BEFORE_MS;
    const timer = setTimeout(() => renewAccess(), Math.max(ms, 30 * 1000));
    return () => clearTimeout(timer);
  }, [expiresAt, renew, renewAccess]);

  // ---------- video events ----------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      const resume = resumeAt.current;
      if (resume) {
        video.currentTime = resume.time;
        if (resume.play) video.play().catch(() => {});
        resumeAt.current = null;
      } else {
        const saved = savedPosition(videoId);
        if (saved > 5 && (!video.duration || saved < video.duration - 10)) video.currentTime = saved;
      }
    };
    const onTime = () => {
      setCurrent(video.currentTime);
      if (Math.abs(video.currentTime - lastSaved.current) >= 5) {
        lastSaved.current = video.currentTime;
        savePosition(videoId, video.currentTime);
      }
    };
    const onProgress = () => {
      const b = video.buffered;
      for (let i = 0; i < b.length; i++) {
        if (b.start(i) <= video.currentTime && video.currentTime <= b.end(i)) {
          setBuffered(b.end(i));
          return;
        }
      }
    };

    const handlers = {
      loadedmetadata: onLoaded,
      durationchange: () => setDuration(video.duration || 0),
      timeupdate: onTime,
      progress: onProgress,
      play: () => setPlaying(true),
      pause: () => {
        setPlaying(false);
        setControlsVisible(true); // paused → controls come back
      },
      waiting: () => setWaiting(true),
      seeking: () => setWaiting(true),
      playing: () => setWaiting(false),
      canplay: () => setWaiting(false),
      seeked: () => setWaiting(false),
      ended: () => {
        setPlaying(false);
        savePosition(videoId, 0);
      },
      volumechange: () => {
        setVolume(video.volume);
        setMuted(video.muted);
      },
      ratechange: () => {
        if (holding.current == null) setRate(video.playbackRate);
      },
    };
    Object.entries(handlers).forEach(([n, f]) => video.addEventListener(n, f));
    return () => Object.entries(handlers).forEach(([n, f]) => video.removeEventListener(n, f));
  }, [videoId]);

  // spinner only for waits longer than a moment, so quick seeks don't flicker
  useEffect(() => {
    if (!waiting) {
      setSpinner(false);
      return undefined;
    }
    const t = setTimeout(() => setSpinner(true), 250);
    return () => clearTimeout(t);
  }, [waiting]);

  // size of the picture area, for the fixed aspect ratios
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setFrame({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ---------- fullscreen + orientation ----------
  const lockOrientation = useCallback(async () => {
    const video = videoRef.current;
    const portraitVideo = video && video.videoHeight > video.videoWidth;
    try {
      await window.screen.orientation?.lock?.(portraitVideo ? "portrait" : "landscape");
    } catch {
      // desktop / iPhone: no orientation lock — the phone turns with the device
    }
  }, []);

  const unlockOrientation = () => {
    try {
      window.screen.orientation?.unlock?.();
    } catch {
      // nothing locked
    }
  };

  const enterFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    try {
      if (container?.requestFullscreen) await container.requestFullscreen({ navigationUI: "hide" });
      else if (container?.webkitRequestFullscreen) await container.webkitRequestFullscreen(); // older Safari / iPad
      else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen(); // iPhone: native player, turns with the phone
        return;
      } else return;
      if (touch) await lockOrientation();
    } catch {
      // refused (no user gesture, iframe without permission…)
    }
  }, [touch, lockOrientation]);

  const exitFullscreen = useCallback(() => {
    unlockOrientation();
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else document.webkitExitFullscreen?.();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreenElement()) exitFullscreen();
    else enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const onChange = () => {
      const isFull = fullscreenElement() === containerRef.current;
      setFullscreen(isFull);
      if (!isFull) unlockOrientation();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // like YouTube: phone turned sideways while playing → fullscreen (browsers that allow it
  // without a tap); turned back upright → leave fullscreen
  useEffect(() => {
    const orientation = window.screen.orientation;
    if (!touch || !orientation) return undefined;
    const onRotate = () => {
      const video = videoRef.current;
      const landscape = orientation.type.startsWith("landscape");
      if (landscape && video && !video.paused && !fullscreenElement()) enterFullscreen();
    };
    orientation.addEventListener("change", onRotate);
    return () => orientation.removeEventListener("change", onRotate);
  }, [touch, enterFullscreen]);

  // ---------- actions ----------
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && scrubRef.current == null) {
        setControlsVisible(false);
        setMenu(null);
      }
    }, HIDE_AFTER_MS);
  }, []);
  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(skipTimer.current);
      clearTimeout(holdTimer.current);
    },
    [],
  );

  // when playback starts (play button, resume, keyboard…) the controls and header fade out after a moment
  useEffect(() => {
    if (playing) showControls();
  }, [playing, showControls]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    showControls();
  }, [showControls]);

  // skip; repeated skips in the same direction add up in the hint (10, 20, 30 s…)
  const skip = useCallback(
    (seconds) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || Infinity);
      const side = seconds < 0 ? "left" : "right";
      setSkipHint((prev) => ({ side, seconds: prev?.side === side ? prev.seconds + Math.abs(seconds) : Math.abs(seconds) }));
      clearTimeout(skipTimer.current);
      skipTimer.current = setTimeout(() => setSkipHint(null), 700);
      showControls();
    },
    [showControls],
  );

  const changeVolume = useCallback((value) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(Math.max(value, 0), 1);
    video.muted = video.volume === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
  }, []);

  const chooseSpeed = (value) => {
    if (videoRef.current) videoRef.current.playbackRate = value;
    setMenu(null);
  };

  const chooseLevel = (index) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index; // -1 = automatic
    setLevel(index);
    setMenu(null);
  };

  const chooseFit = (value) => {
    setFit(value);
    store.set("video-fit", value);
    setMenu(null);
  };

  // seek bar: dragging only moves the marker; the video seeks once, on release
  const startScrub = (value) => {
    scrubRef.current = value;
    setScrub(value);
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
  };
  const endScrub = () => {
    const value = scrubRef.current;
    if (value == null) return;
    scrubRef.current = null;
    setScrub(null);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = value;
      setCurrent(value);
    }
    showControls();
  };

  const onSeekHover = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setHover({ pct: pct * 100, time: pct * duration });
  };

  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
    const video = videoRef.current;
    if (/^[0-9]$/.test(e.key) && video && Number.isFinite(video.duration)) {
      e.preventDefault();
      video.currentTime = (Number(e.key) / 10) * video.duration;
      showControls();
      return;
    }
    const keys = {
      " ": togglePlay,
      k: togglePlay,
      j: () => skip(-10),
      l: () => skip(10),
      ArrowLeft: () => skip(-10),
      ArrowRight: () => skip(10),
      ArrowUp: () => changeVolume((video?.volume || 0) + 0.1),
      ArrowDown: () => changeVolume((video?.volume || 0) - 0.1),
      f: toggleFullscreen,
      m: toggleMute,
      Escape: () => setMenu(null),
    };
    // the seek bar handles its own arrow keys
    if (e.target.type === "range" && e.key.startsWith("Arrow")) return;
    const action = keys[e.key] || keys[e.key.toLowerCase?.()];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // ---------- touch / click on the picture ----------
  // hold → 2× while held; tap / click → show or hide the controls; double-click → fullscreen;
  // quick second tap on the left/right third (phones) → skip 10 s
  const endHold = () => {
    clearTimeout(holdTimer.current);
    if (holding.current == null) return false;
    if (videoRef.current) videoRef.current.playbackRate = holding.current;
    holding.current = null;
    setFastHold(false);
    return true;
  };

  const onSurfacePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.paused || pinch.current) return;
      holding.current = video.playbackRate;
      video.playbackRate = 2;
      setFastHold(true);
    }, HOLD_MS);
  };

  const onSurfacePointerUp = (e) => {
    if (endHold()) return; // it was a hold, not a tap
    if (menu) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const side = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "middle";
    const now = Date.now();
    const double = now - lastTap.current.time < DOUBLE_TAP_MS && lastTap.current.side === side;
    lastTap.current = { time: now, side };

    if (e.pointerType !== "mouse" && side !== "middle" && (double || skipHint?.side === side)) {
      skip(side === "left" ? -10 : 10);
      return;
    }
    // tap / click on the picture: controls shown → hide them, hidden → show them
    if (controlsVisible) {
      clearTimeout(hideTimer.current);
      setControlsVisible(false);
    } else showControls();
  };

  // pinch in fullscreen: spread → fill screen (crop), pinch → fit
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      endHold();
      const [a, b] = e.touches;
      pinch.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }
  };
  const onTouchMove = (e) => {
    if (!pinch.current || e.touches.length !== 2 || !fullscreen) return;
    const [a, b] = e.touches;
    const ratio = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.current;
    if (ratio > 1.15 && fit !== "cover") setFit("cover");
    if (ratio < 0.87 && fit !== "contain") setFit("contain");
  };
  const onTouchEnd = (e) => {
    if (e.touches.length < 2) pinch.current = null;
  };

  // ---------- render ----------
  const shown = controlsVisible || menu != null || scrub != null;
  const seekTime = scrub ?? current;
  const playedPct = duration ? (seekTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const levelLabel = (index) => `${levels.find((l) => l.index === index)?.height}p`;
  const qualityLabel = level === -1 ? `Auto${activeHeight ? ` (${activeHeight}p)` : ""}` : levelLabel(level);
  const speedLabel = rate === 1 ? "Normal" : `${rate}×`;
  const fitLabel = FITS.find((f) => f.value === fit)?.label;
  const hd = (level === -1 ? activeHeight : levels.find((l) => l.index === level)?.height) >= 720;

  // a fixed ratio is drawn as the largest box of that ratio inside the picture area
  const ratio = FIXED_RATIOS[fit];
  const videoStyle =
    ratio && frame.w && frame.h
      ? (() => {
          const width = Math.min(frame.w, frame.h * ratio);
          return { width, height: width / ratio, objectFit: "fill" };
        })()
      : { width: "100%", height: "100%", objectFit: ratio ? "contain" : fit };


  const menuRow = (label, value, target) => (
    <button
      type="button"
      onClick={() => setMenu(target)}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded hover:bg-white/10"
    >
      <span>{label}</span>
      <span className="flex items-center gap-1 text-gray-300 text-xs sm:text-sm">
        {value}
        <ChevronRight className="w-4 h-4" />
      </span>
    </button>
  );
  const menuBack = (label) => (
    <button
      type="button"
      onClick={() => setMenu("main")}
      className="w-full flex items-center gap-1 px-2 py-2 mb-1 border-b border-white/15 font-semibold hover:bg-white/10 rounded-t"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
  const menuOption = (key, label, selected, onClick) => (
    <button
      type="button"
      key={key}
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-left"
    >
      <Check className={`w-4 h-4 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`} />
      {label}
    </button>
  );

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      // real mouse only: phones fire a fake mouse move after every tap, which would show
      // the controls again right after a tap hid them
      onPointerMove={(e) => e.pointerType === "mouse" && showControls()}
      onContextMenu={(e) => e.preventDefault()}
      className={`w-full flex flex-col bg-black overflow-hidden select-none outline-none ${
        fullscreen ? "h-full" : "rounded-lg shadow-lg"
      }`}
    >
      <div
        ref={frameRef}
        className={`relative w-full overflow-hidden ${fullscreen ? "flex-1 min-h-0" : "aspect-video"} ${
          shown ? "cursor-default" : "cursor-none"
        }`}
        style={{ touchAction: fullscreen ? "none" : "manipulation" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            style={videoStyle}
            className="block transition-[width,height] duration-200"
            playsInline
            preload="metadata"
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
          />
        </div>

        {/* tap / click surface */}
        <div
          className="absolute inset-0"
          onPointerDown={onSurfacePointerDown}
          onPointerUp={onSurfacePointerUp}
          onDoubleClick={() => !touch && toggleFullscreen()}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
        />

        {/* loading */}
        {spinner && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* phones: centre controls, like YouTube */}
        {touch && shown && !error && (
          <div className="absolute inset-0 flex items-center justify-center gap-10 sm:gap-16 pointer-events-none">
            <button
              type="button"
              onClick={() => skip(-10)}
              className="pointer-events-auto p-3 rounded-full bg-black/40 text-white"
              aria-label="Back 10 seconds"
            >
              <RotateCcw className="w-7 h-7" />
            </button>
            {spinner ? (
              <span className="w-16 h-16" />
            ) : (
              <button
                type="button"
                onClick={togglePlay}
                className="pointer-events-auto w-16 h-16 rounded-full bg-black/50 text-white flex items-center justify-center"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => skip(10)}
              className="pointer-events-auto p-3 rounded-full bg-black/40 text-white"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* mouse: big play button when paused */}
        {!touch && shown && !playing && !spinner && !error && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
            aria-label="Play"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" />
          </button>
        )}

        {/* double-tap skip hint, on the side that was tapped */}
        {skipHint && (
          <div
            className={`absolute inset-y-0 ${skipHint.side === "left" ? "left-0 rounded-r-[50%]" : "right-0 rounded-l-[50%]"} w-1/3 bg-white/10 flex items-center justify-center pointer-events-none`}
          >
            <span className="flex flex-col items-center text-white text-sm font-semibold">
              {skipHint.side === "left" ? <RotateCcw className="w-6 h-6 mb-1" /> : <RotateCw className="w-6 h-6 mb-1" />}
              {skipHint.seconds} seconds
            </span>
          </div>
        )}

        {/* hold for 2× */}
        {fastHold && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-semibold px-3 py-1.5 rounded-full pointer-events-none">
            2× »
          </div>
        )}

        {/* error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80">
            <p className="text-white text-center text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* brand header — same on every video: logo, company name, video title. Over the picture
            on a see-through background; shown with the controls, hidden while the video plays */}
        <div
          className={`absolute top-0 inset-x-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pt-2 pb-6 bg-gradient-to-b from-black/75 via-black/40 to-transparent pointer-events-none transition-opacity duration-200 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* the logo has dark lettering, so it keeps a small white backing on the dark header */}
          <img src={logo} className="h-8 sm:h-10 shrink-0 bg-white/90 rounded px-1 py-0.5" alt="Dnyanganga logo" draggable={false} />
          <div className="flex-1 min-w-0 text-center">
            <p className="text-white font-bold text-sm sm:text-lg leading-tight truncate">Dnyanganga Education Pvt. Ltd.</p>
            {title && <p className="text-gray-200 text-xs sm:text-sm leading-tight truncate">{title}</p>}
          </div>
          {/* same width as the logo on the right, so the text sits in the true centre */}
          <img src={logo} className="h-8 sm:h-10 shrink-0 px-1 py-0.5 invisible" alt="" aria-hidden="true" draggable={false} />
        </div>

        {/* controls */}
        <div
          className={`absolute bottom-0 inset-x-0 px-2 sm:px-4 pb-1 sm:pb-2 pt-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
            shown ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* seek bar */}
          <div className="relative h-5 flex items-center group" onPointerMove={(e) => e.pointerType === "mouse" && onSeekHover(e)}
            onPointerLeave={() => setHover(null)}>
            <div
              className={`absolute inset-x-0 rounded-full bg-white/25 transition-all ${
                scrub != null ? "h-1.5" : "h-1 group-hover:h-1.5"
              }`}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
              {hover && <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${hover.pct}%` }} />}
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${playedPct}%` }} />
            </div>
            {/* knob */}
            <div
              className={`absolute w-3.5 h-3.5 -ml-[7px] rounded-full bg-primary ring-2 ring-white/80 pointer-events-none transition-transform ${
                scrub != null || touch ? "scale-100" : "scale-0 group-hover:scale-100"
              }`}
              style={{ left: `${playedPct}%` }}
            />
            {/* time bubble while dragging or hovering */}
            {(scrub != null || hover) && duration > 0 && (
              <div
                className="absolute bottom-6 -translate-x-1/2 bg-black/80 text-white text-xs font-semibold tabular-nums px-2 py-1 rounded pointer-events-none"
                style={{ left: `${Math.min(Math.max(scrub != null ? playedPct : hover.pct, 4), 96)}%` }}
              >
                {formatDuration(scrub != null ? scrub : hover.time)}
              </div>
            )}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={seekTime}
              onChange={(e) => startScrub(Number(e.target.value))}
              onPointerUp={endScrub}
              onTouchEnd={endScrub}
              onKeyUp={endScrub}
              onBlur={endScrub}
              className="absolute inset-x-0 w-full h-5 opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-white">
            {!touch && (
              <>
                <button type="button" onClick={togglePlay} className="p-2 hover:text-blue-300" aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
                </button>
                <button type="button" onClick={() => skip(-10)} className="p-2 hover:text-blue-300" aria-label="Back 10 seconds">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => skip(10)} className="p-2 hover:text-blue-300" aria-label="Forward 10 seconds">
                  <RotateCw className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 group/vol">
                  <button type="button" onClick={toggleMute} className="p-2 hover:text-blue-300" aria-label={muted ? "Unmute" : "Mute"}>
                    {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100 transition-all duration-200 accent-white cursor-pointer"
                    aria-label="Volume"
                  />
                </div>
              </>
            )}

            <span className="text-xs sm:text-sm tabular-nums px-1 whitespace-nowrap">
              {formatDuration(seekTime)} / {formatDuration(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1 relative">
              <button
                type="button"
                onClick={() => setMenu(menu ? null : "main")}
                className="p-2 hover:text-blue-300 relative"
                aria-label="Settings"
              >
                <Settings className={`w-5 h-5 transition-transform duration-200 ${menu ? "rotate-45" : ""}`} />
                {hd && (
                  <span className="absolute top-0.5 right-0 bg-primary text-[9px] font-bold leading-none px-1 py-0.5 rounded">HD</span>
                )}
              </button>
              <button type="button" onClick={toggleFullscreen} className="p-2 hover:text-blue-300" aria-label="Fullscreen">
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {menu && (
                <div
                  className="absolute bottom-12 right-0 w-60 sm:w-64 max-h-[60vh] overflow-y-auto bg-black/90 rounded-lg p-1.5 text-sm text-white shadow-xl z-10"
                  onPointerUp={(e) => e.stopPropagation()}
                >
                  {menu === "main" && (
                    <>
                      {levels.length > 0 && menuRow("Quality", qualityLabel, "quality")}
                      {menuRow("Playback speed", speedLabel, "speed")}
                      {menuRow("Aspect ratio", fitLabel, "fit")}
                    </>
                  )}
                  {menu === "quality" && (
                    <>
                      {menuBack("Quality")}
                      {levels.map((l) => menuOption(l.index, `${l.height}p${l.height >= 720 ? " HD" : ""}`, level === l.index, () => chooseLevel(l.index)))}
                      {menuOption("auto", `Auto${activeHeight && level === -1 ? ` (${activeHeight}p)` : ""}`, level === -1, () => chooseLevel(-1))}
                    </>
                  )}
                  {menu === "speed" && (
                    <>
                      {menuBack("Playback speed")}
                      {SPEEDS.map((s) => menuOption(s, s === 1 ? "Normal" : `${s}×`, rate === s, () => chooseSpeed(s)))}
                    </>
                  )}
                  {menu === "fit" && (
                    <>
                      {menuBack("Aspect ratio")}
                      {FITS.map((f) => menuOption(f.value, f.label, fit === f.value, () => chooseFit(f.value)))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
