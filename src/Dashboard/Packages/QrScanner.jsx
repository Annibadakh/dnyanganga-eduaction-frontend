import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import jsQR from "jsqr";
import { Camera, X } from "lucide-react";

// Full-screen camera QR scanner (jsQR decodes every frame — same on Android, iPhone and iPad).
// onScan(text) is called for each new code; the same code is ignored for 2.5 s so one sticker
// held in front of the camera is read once. Stays open for continuous scanning when
// `continuous` is set (challan), closes after the first read otherwise.
// When onScan returns a promise of { ok, message }, the result is shown on the scanner
// (green = added, scan the next one / red = problem) with a beep and vibration.
// Camera picker: shown when the device has more than one camera (phone front / back / wide,
// a USB or external camera on a PC). The choice is remembered on this device.
const SAME_CODE_PAUSE_MS = 2500;
const CAMERA_KEY = "dg_scanner_camera";

const readSavedCamera = () => {
  try {
    return localStorage.getItem(CAMERA_KEY) || "";
  } catch {
    return "";
  }
};
const saveCamera = (id) => {
  try {
    if (id) localStorage.setItem(CAMERA_KEY, id);
    else localStorage.removeItem(CAMERA_KEY);
  } catch {
    /* remembering is optional */
  }
};

const listCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "videoinput" && d.deviceId)
      .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
  } catch {
    return [];
  }
};

let audioCtx;
const beep = (ok) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const tones = ok ? [[1200, 0]] : [[300, 0], [300, 0.22]];
    tones.forEach(([freq, delay]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(audioCtx.destination);
      const t = audioCtx.currentTime + delay;
      osc.start(t);
      osc.stop(t + (ok ? 0.12 : 0.18));
    });
  } catch {
    /* sound is optional */
  }
};

const RESULT_STYLE = {
  checking: "bg-blue-600",
  ok: "bg-green-600",
  error: "bg-red-600",
};

const QrScanner = ({ onScan, onClose, continuous = false, title = "Scan package QR", count }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastRef = useRef({ text: "", at: 0 });
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [result, setResult] = useState(null); // { state: checking|ok|error, message }
  const seqRef = useRef(0);
  const [cameras, setCameras] = useState([]); // [{ deviceId, label }]
  const [cameraId, setCameraId] = useState(readSavedCamera); // requested camera ("" = back camera)
  const [activeId, setActiveId] = useState(""); // camera actually streaming

  // An external camera plugged in / removed while the scanner is open
  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return undefined;
    const refresh = () => listCameras().then(setCameras);
    md.addEventListener("devicechange", refresh);
    return () => md.removeEventListener("devicechange", refresh);
  }, []);

  const chooseCamera = (id) => {
    saveCamera(id);
    setCameraId(id);
  };

  const handleScan = (text) => {
    const out = onScan(text);
    if (!continuous || !out || typeof out.then !== "function") return; // single scan: the caller shows the result
    const seq = ++seqRef.current;
    setResult({ state: "checking", message: `Checking ${text.split("|").pop()}...` });
    out.then(
      (r) => {
        const ok = !!r?.ok;
        beep(ok);
        if (navigator.vibrate) navigator.vibrate(ok ? 80 : [120, 80, 120]);
        if (seq === seqRef.current) setResult({ state: ok ? "ok" : "error", message: r?.message || (ok ? "Added" : "Not added") });
      },
      () => seq === seqRef.current && setResult({ state: "error", message: "Couldn't check the package" }),
    );
  };

  useEffect(() => {
    let stream;
    let frame;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        // decode a down-scaled frame: fast enough on low-end phones
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const found = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
        if (found?.data) {
          const now = Date.now();
          const last = lastRef.current;
          if (found.data !== last.text || now - last.at > SAME_CODE_PAUSE_MS) {
            lastRef.current = { text: found.data, at: now };
            setFlash(found.data);
            handleScan(found.data);
            if (!continuous) {
              stopped = true;
              onClose();
              return;
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api");
        setError("");
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: cameraId ? { deviceId: { exact: cameraId }, ...size } : { facingMode: { ideal: "environment" }, ...size },
            audio: false,
          });
        } catch (err) {
          // the remembered camera is gone (external camera unplugged): fall back to the back camera
          if (!cameraId || err?.name === "NotAllowedError") throw err;
          saveCamera("");
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, ...size }, audio: false });
        }
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute("playsinline", "true"); // iOS: no full-screen player
        await video.play();
        // camera names are readable only after the permission is given
        setActiveId(stream.getVideoTracks()[0]?.getSettings?.().deviceId || cameraId);
        setCameras(await listCameras());
        frame = requestAnimationFrame(tick);
      } catch (err) {
        if (stopped) return;
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission denied. Allow the camera in the browser settings, or type the code."
            : err?.name === "NotReadableError"
              ? "This camera is in use by another app. Close it or pick another camera."
              : "Camera not available on this device (it needs https). Type the code instead.",
        );
        setCameras(await listCameras());
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // restarts only when another camera is picked; onScan / onClose are read at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between text-white px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} className="p-1" aria-label="Close scanner">
          <X size={26} />
        </button>
      </div>
      {cameras.length > 1 && (
        <div className="flex items-center gap-2 px-4 pb-3 text-white">
          <Camera size={20} className="shrink-0" />
          <select
            value={cameras.some((c) => c.deviceId === activeId) ? activeId : ""}
            onChange={(e) => chooseCamera(e.target.value)}
            className="flex-1 min-w-0 bg-gray-800 text-white border border-gray-600 rounded-lg p-2 text-sm"
            aria-label="Select camera"
          >
            {!cameras.some((c) => c.deviceId === activeId) && <option value="">Select camera</option>}
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!error && (
          <div className="absolute w-64 h-64 max-w-[75vw] max-h-[75vw] border-4 border-white/80 rounded-xl pointer-events-none" />
        )}
        {error && <p className="absolute inset-x-4 text-center text-white bg-red-600/90 rounded-lg p-4">{error}</p>}
      </div>
      {result && (
        <div className={`${RESULT_STYLE[result.state]} text-white text-center px-4 py-3 text-base font-semibold`} role="status">
          {result.message}
        </div>
      )}
      <div className="text-center text-white text-sm px-4 py-3 min-h-[48px]">
        {typeof count === "number" && <p className="font-semibold mb-1">Packages in this challan: {count}</p>}
        {!result && (flash ? `Read: ${flash.split("|").pop()}` : "Hold the QR sticker inside the square")}
        {continuous && (
          <button type="button" onClick={onClose} className="block mx-auto mt-2 bg-primary px-6 py-2 rounded-lg">
            Done
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default QrScanner;
