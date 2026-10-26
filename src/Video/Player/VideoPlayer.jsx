import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
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
} from "lucide-react";
import { formatDuration } from "../uploadVideo";

// Simple HLS player on the native <video> element.
//  - hls.js where supported (Chrome, Edge, Firefox, Android); native HLS on iPhone/iPad
//  - play/pause, seek bar with buffered range, ±10 s, volume, speed, quality, fullscreen
//  - keyboard: Space/K play, ←/→ 10 s, ↑/↓ volume, F fullscreen, M mute
//  - double-tap left/right third on phones to skip 10 s
//  - resumes where the viewer left off (per video, on this device)
//  - playback cookies are renewed before they expire, and once more if a request is refused
//
// Props: src (HLS manifest URL), signedQuery (CloudFront signature as URL parameters), videoId,
//        title, expiresAt, renew (async () => { expiresAt })
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const HIDE_AFTER_MS = 3000;
const RENEW_BEFORE_MS = 10 * 60 * 1000;

const positionKey = (videoId) => `video-position-${videoId}`;
const savedPosition = (videoId) => {
  try {
    return Number(localStorage.getItem(positionKey(videoId))) || 0;
  } catch {
    return 0;
  }
};
const savePosition = (videoId, seconds) => {
  try {
    if (seconds > 0) localStorage.setItem(positionKey(videoId), String(Math.floor(seconds)));
    else localStorage.removeItem(positionKey(videoId));
  } catch {
    // storage blocked: resume just won't work
  }
};

const VideoPlayer = ({ src, signedQuery, videoId, title, expiresAt, renew }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const hideTimer = useRef(null);
  const lastTap = useRef({ time: 0, side: null });
  const lastSaved = useRef(0);
  const renewing = useRef(false);
  const queryRef = useRef(signedQuery);
  queryRef.current = signedQuery; // renewed signature is used by the next request without a reload

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
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [menu, setMenu] = useState(null); // null | "settings"
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState("");
  const [skipHint, setSkipHint] = useState(null); // "-10" | "+10"
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

  // renew the playback cookies shortly before they expire
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
    const on = (name, fn) => video.addEventListener(name, fn);
    const off = (name, fn) => video.removeEventListener(name, fn);

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
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onCanPlay = () => setWaiting(false);
    const onEnded = () => {
      setPlaying(false);
      savePosition(videoId, 0);
    };
    const onVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onRate = () => setRate(video.playbackRate);

    const handlers = {
      loadedmetadata: onLoaded,
      durationchange: () => setDuration(video.duration || 0),
      timeupdate: onTime,
      progress: onProgress,
      play: onPlay,
      pause: onPause,
      waiting: onWaiting,
      playing: onPlaying,
      canplay: onCanPlay,
      ended: onEnded,
      volumechange: onVolume,
      ratechange: onRate,
    };
    Object.entries(handlers).forEach(([n, f]) => on(n, f));
    return () => Object.entries(handlers).forEach(([n, f]) => off(n, f));
  }, [videoId]);

  // fullscreen state
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ---------- actions ----------
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
        setMenu(null);
      }
    }, HIDE_AFTER_MS);
  }, []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    showControls();
  }, [showControls]);

  const skip = useCallback(
    (seconds) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || Infinity);
      setSkipHint(seconds < 0 ? "-10" : "+10");
      setTimeout(() => setSkipHint(null), 600);
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

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (container?.requestFullscreen) container.requestFullscreen().catch(() => {});
    else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
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

  const seekTo = (value) => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) video.currentTime = value;
  };

  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
    const keys = {
      " ": togglePlay,
      k: togglePlay,
      ArrowLeft: () => skip(-10),
      ArrowRight: () => skip(10),
      ArrowUp: () => changeVolume((videoRef.current?.volume || 0) + 0.1),
      ArrowDown: () => changeVolume((videoRef.current?.volume || 0) - 0.1),
      f: toggleFullscreen,
      m: toggleMute,
    };
    const action = keys[e.key] || keys[e.key.toLowerCase?.()];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // taps on the picture: one tap shows/hides the controls (touch) or plays/pauses (mouse);
  // a quick second tap on the left/right third skips 10 s
  const onSurfacePointerUp = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const side = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "middle";
    const now = Date.now();
    const double = now - lastTap.current.time < 300 && lastTap.current.side === side;
    lastTap.current = { time: now, side };

    if (double && side !== "middle" && e.pointerType !== "mouse") {
      skip(side === "left" ? -10 : 10);
      return;
    }
    if (e.pointerType === "mouse") togglePlay();
    else if (controlsVisible && playing) setControlsVisible(false);
    else showControls();
  };

  const playedPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const qualityLabel = level === -1 ? `Auto${activeHeight ? ` (${activeHeight}p)` : ""}` : `${levels.find((l) => l.index === level)?.height}p`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={showControls}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full bg-black overflow-hidden select-none outline-none ${
        fullscreen ? "h-full" : "aspect-video rounded-lg shadow-lg"
      } ${controlsVisible || !playing ? "cursor-default" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
      />

      {/* tap / click surface */}
      <div className="absolute inset-0" onPointerUp={onSurfacePointerUp} />

      {/* loading */}
      {waiting && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* big play button when paused */}
      {!playing && !waiting && !error && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
          aria-label="Play"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" />
        </button>
      )}

      {/* skip hint */}
      {skipHint && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${skipHint === "-10" ? "left-[12%]" : "right-[12%]"} bg-black/60 text-white text-sm font-semibold px-3 py-2 rounded-full pointer-events-none`}
        >
          {skipHint === "-10" ? "« 10 s" : "10 s »"}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80">
          <p className="text-white text-center text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* title */}
      {title && (controlsVisible || !playing) && (
        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <p className="text-white text-sm sm:text-base font-semibold truncate">{title}</p>
        </div>
      )}

      {/* controls */}
      <div
        className={`absolute bottom-0 inset-x-0 px-2 sm:px-4 pb-2 pt-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
          controlsVisible || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* seek bar */}
        <div className="relative h-4 flex items-center group">
          <div className="absolute inset-x-0 h-1 group-hover:h-1.5 rounded-full bg-white/25 transition-all">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${playedPct}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={current}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="video-seek absolute inset-x-0 w-full h-4 opacity-0 cursor-pointer"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-white mt-1">
          <button type="button" onClick={togglePlay} className="p-2 hover:text-blue-300" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
          </button>
          <button type="button" onClick={() => skip(-10)} className="p-2 hover:text-blue-300" aria-label="Back 10 seconds">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => skip(10)} className="p-2 hover:text-blue-300" aria-label="Forward 10 seconds">
            <RotateCw className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-1">
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
              className="w-20 accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <span className="text-xs sm:text-sm tabular-nums ml-1 whitespace-nowrap">
            {formatDuration(current)} / {formatDuration(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1 relative">
            <button
              type="button"
              onClick={() => setMenu(menu ? null : "settings")}
              className="p-2 hover:text-blue-300 flex items-center gap-1"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
              {rate !== 1 && <span className="text-xs font-semibold">{rate}×</span>}
            </button>
            <button type="button" onClick={toggleFullscreen} className="p-2 hover:text-blue-300" aria-label="Fullscreen">
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {menu === "settings" && (
              <div className="absolute bottom-12 right-0 w-56 max-h-72 overflow-y-auto bg-black/90 rounded-lg p-2 text-sm shadow-xl z-10">
                <p className="px-2 pt-1 pb-1 text-xs uppercase tracking-wider text-gray-400">Speed</p>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {SPEEDS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => chooseSpeed(s)}
                      className={`py-1.5 rounded ${rate === s ? "bg-primary" : "hover:bg-white/10"}`}
                    >
                      {s === 1 ? "Normal" : `${s}×`}
                    </button>
                  ))}
                </div>
                {levels.length > 0 && (
                  <>
                    <p className="px-2 pt-1 pb-1 text-xs uppercase tracking-wider text-gray-400">Quality</p>
                    <button
                      type="button"
                      onClick={() => chooseLevel(-1)}
                      className={`w-full text-left px-2 py-1.5 rounded ${level === -1 ? "bg-primary" : "hover:bg-white/10"}`}
                    >
                      Auto{activeHeight && level === -1 ? ` (${activeHeight}p)` : ""}
                    </button>
                    {levels.map((l) => (
                      <button
                        type="button"
                        key={l.index}
                        onClick={() => chooseLevel(l.index)}
                        className={`w-full text-left px-2 py-1.5 rounded ${level === l.index ? "bg-primary" : "hover:bg-white/10"}`}
                      >
                        {l.height}p
                      </button>
                    ))}
                  </>
                )}
                {levels.length > 0 && <p className="px-2 pt-2 text-xs text-gray-400">Now: {qualityLabel}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
