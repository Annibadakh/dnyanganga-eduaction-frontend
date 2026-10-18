import { useEffect, useRef, useState } from "react";
import api from "../../Api";

// Draw-to-sign pad (finger / stylus / mouse). On "Save Signature" the drawing is
// uploaded as a PNG to uploads/signature and onSaved(url) receives the stored path.
const SignaturePad = ({ savedUrl, onSaved, onCleared }) => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Size the canvas to its container (crisp on high-DPI phones/tablets)
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ratio = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    const height = 180;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    setIsEmpty(true); // resizing clears the drawing
  };

  useEffect(() => {
    if (savedUrl) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [savedUrl]);

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPoint(e);
    // a single tap still leaves a dot
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.arc(lastPoint.current.x, lastPoint.current.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#111827";
    ctx.fill();
    setIsEmpty(false);
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const point = getPoint(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  };

  const handlePointerUp = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setError("");
  };

  const handleSave = async () => {
    if (isEmpty) {
      setError("Please sign in the box first");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // White background so the PNG prints cleanly on the PDF
      const src = canvasRef.current;
      const out = document.createElement("canvas");
      out.width = src.width;
      out.height = src.height;
      const octx = out.getContext("2d");
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, out.width, out.height);
      octx.drawImage(src, 0, 0);

      const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
      const formData = new FormData();
      formData.append("type", "signature"); // must come before the file (multer reads it first)
      formData.append("file", new File([blob], `${Date.now()}.png`, { type: "image/png" }));

      const res = await api.post("/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data.imageUrl) throw new Error("Upload failed");
      onSaved(res.data.imageUrl);
    } catch (err) {
      console.error("Signature upload failed:", err);
      setError("Failed to save signature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Saved → show the stored signature with a re-sign option
  if (savedUrl) {
    return (
      <div className="w-full md:w-1/2">
        <div className="border rounded bg-white p-2 flex justify-center">
          <img
            src={`${imgUrl}${savedUrl}`}
            alt="Signature"
            className="max-h-[140px] w-auto object-contain"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <p className="text-sm text-green-600 font-medium">✓ Signature saved</p>
          <button
            type="button"
            onClick={onCleared}
            className="w-full sm:w-auto px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm"
          >
            Sign Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2">
      <div ref={wrapperRef} className="w-full border-2 border-dashed border-gray-300 rounded bg-white">
        <canvas
          ref={canvasRef}
          className="block touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Sign inside the box using your finger, stylus or mouse.</p>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={saving}
          className="w-full sm:w-auto px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm disabled:opacity-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || isEmpty}
          className="w-full sm:w-auto px-4 py-2 rounded bg-primary hover:bg-opacity-90 text-white text-sm disabled:opacity-50 grid place-items-center"
        >
          {saving ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            "Save Signature"
          )}
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
