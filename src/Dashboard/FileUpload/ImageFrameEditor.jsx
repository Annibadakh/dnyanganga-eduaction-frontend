import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, RotateCw, Check, X, CropIcon } from 'lucide-react';

// Default aspect ratios per image type
const ASPECT_RATIOS = {
  students: { w: 3, h: 4, label: '3:4' },
  receipt:  { w: 4, h: 3, label: '4:3' },
  document: { w: 210, h: 297, label: 'A4' },
  photo:    { w: 4, h: 3, label: '4:3' },
  default:  { w: 1, h: 1, label: '1:1' },
};

const HANDLE_RADIUS = 14; // large enough for mobile touch

export default function ImageFrameEditor({ imageSrc, imageType = 'photo', onConfirm, onCancel }) {
  const canvasRef     = useRef(null);
  const containerRef  = useRef(null);
  const imgRef        = useRef(null);
  const frameRef      = useRef(null);
  const dragState     = useRef(null);
  const animFrameRef  = useRef(null);

  const [imgLoaded, setImgLoaded]     = useState(false);
  const [rotation, setRotation]       = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [, forceUpdate]               = useState(0);
  const redraw = useCallback(() => forceUpdate(n => n + 1), []);

  // ── Load image ────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imageSrc;
  }, [imageSrc]);

  // ── Size canvas to container ──────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width  = rect.width;
      canvasRef.current.height = rect.height;
      setCanvasReady(true);
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redraw]);

  // ── Init frame once image + canvas are ready ──────────────────────────────
  useEffect(() => {
    if (!imgLoaded || !canvasReady || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio  = ASPECT_RATIOS[imageType] || ASPECT_RATIOS.default;
    const cw = canvas.width, ch = canvas.height;
    const pad = 28;

    const maxW   = cw - pad * 2;
    const maxH   = ch - pad * 2;
    const aspect = ratio.w / ratio.h;

    let fw = maxW, fh = fw / aspect;
    if (fh > maxH) { fh = maxH; fw = fh * aspect; }

    frameRef.current = {
      x: (cw - fw) / 2,
      y: (ch - fh) / 2,
      w: fw,
      h: fh,
    };
    redraw();
  }, [imgLoaded, canvasReady, imageType, redraw]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current || !frameRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const cw = canvas.width, ch = canvas.height;
    const frame  = frameRef.current;
    const img    = imgRef.current;

    ctx.clearRect(0, 0, cw, ch);

    // Light gray background (matches form page background)
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, cw, ch);

    // Image — centred + rotated, no zoom
    const cx = cw / 2, cy = ch / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    const scale = Math.min(cw / img.width, ch / img.height) * 1.05;
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    // Dark overlay outside frame
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.rect(frame.x, frame.y, frame.w, frame.h);
    ctx.fill('evenodd');
    ctx.restore();

    // Frame border — blue
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);
    ctx.restore();

    // Rule-of-thirds grid
    ctx.save();
    ctx.strokeStyle = 'rgba(37,99,235,0.22)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(frame.x + (frame.w / 3) * i, frame.y);
      ctx.lineTo(frame.x + (frame.w / 3) * i, frame.y + frame.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(frame.x, frame.y + (frame.h / 3) * i);
      ctx.lineTo(frame.x + frame.w, frame.y + (frame.h / 3) * i);
      ctx.stroke();
    }
    ctx.restore();

    // L-shaped corner brackets
    const corners = getCorners(frame);
    const L = 20;
    ctx.save();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    [
      ['tl', [1, 0], [0, 1]],
      ['tr', [-1, 0], [0, 1]],
      ['bl', [1, 0], [0, -1]],
      ['br', [-1, 0], [0, -1]],
    ].forEach(([key, dx, dy]) => {
      const { x, y } = corners[key];
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx[0] * L, y + dx[1] * L); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dy[0] * L, y + dy[1] * L); ctx.stroke();
    });
    ctx.restore();

    // Touch-friendly circular handles
    Object.values(corners).forEach(({ x, y }) => {
      // Halo
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, HANDLE_RADIUS + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37,99,235,0.15)';
      ctx.fill();
      ctx.restore();

      // White circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(37,99,235,0.35)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // Blue ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgLoaded, rotation, frameRef.current, canvasReady]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getCorners(frame) {
    return {
      tl: { x: frame.x,           y: frame.y },
      tr: { x: frame.x + frame.w, y: frame.y },
      bl: { x: frame.x,           y: frame.y + frame.h },
      br: { x: frame.x + frame.w, y: frame.y + frame.h },
    };
  }

  function hitCorner(frame, px, py) {
    for (const [key, { x, y }] of Object.entries(getCorners(frame))) {
      if (Math.hypot(px - x, py - y) <= HANDLE_RADIUS + 8) return key;
    }
    return null;
  }

  function hitFrame(frame, px, py) {
    return px > frame.x && px < frame.x + frame.w && py > frame.y && py < frame.y + frame.h;
  }

  function getPos(e) {
    const rect   = canvasRef.current.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    const scaleX = canvasRef.current.width  / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    if (!frameRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const corner   = hitCorner(frameRef.current, x, y);
    if (corner) {
      dragState.current = { type: 'corner', corner, startX: x, startY: y, startFrame: { ...frameRef.current } };
    } else if (hitFrame(frameRef.current, x, y)) {
      dragState.current = { type: 'frame', startX: x, startY: y, startFrame: { ...frameRef.current } };
    }
  };

  const onPointerMove = (e) => {
    if (!dragState.current || !frameRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ds = dragState.current;
    const sf = ds.startFrame;
    const dx = x - ds.startX, dy = y - ds.startY;
    const canvas  = canvasRef.current;
    const minSize = 60;

    if (ds.type === 'frame') {
      frameRef.current = {
        ...sf,
        x: Math.max(0, Math.min(canvas.width  - sf.w, sf.x + dx)),
        y: Math.max(0, Math.min(canvas.height - sf.h, sf.y + dy)),
      };
    } else {
      let { x: fx, y: fy, w: fw, h: fh } = sf;
      const c = ds.corner;

      if (c === 'tl') {
        fx = Math.min(sf.x + sf.w - minSize, sf.x + dx);
        fy = Math.min(sf.y + sf.h - minSize, sf.y + dy);
        fw = sf.x + sf.w - fx;
        fh = sf.y + sf.h - fy;
      } else if (c === 'tr') {
        fy = Math.min(sf.y + sf.h - minSize, sf.y + dy);
        fw = Math.max(minSize, sf.w + dx);
        fh = sf.y + sf.h - fy;
      } else if (c === 'bl') {
        fx = Math.min(sf.x + sf.w - minSize, sf.x + dx);
        fw = sf.x + sf.w - fx;
        fh = Math.max(minSize, sf.h + dy);
      } else if (c === 'br') {
        fw = Math.max(minSize, sf.w + dx);
        fh = Math.max(minSize, sf.h + dy);
      }

      fw = Math.min(fw, canvas.width  - fx);
      fh = Math.min(fh, canvas.height - fy);
      frameRef.current = { x: fx, y: fy, w: fw, h: fh };
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(redraw);
  };

  const onPointerUp = () => { dragState.current = null; };

  const onMouseMove = (e) => {
    onPointerMove(e);
    if (!frameRef.current || !canvasRef.current) return;
    const { x, y } = getPos(e);
    const corner = hitCorner(frameRef.current, x, y);
    if (corner) {
      canvasRef.current.style.cursor = (corner === 'tl' || corner === 'br') ? 'nwse-resize' : 'nesw-resize';
    } else if (hitFrame(frameRef.current, x, y)) {
      canvasRef.current.style.cursor = 'move';
    } else {
      canvasRef.current.style.cursor = 'default';
    }
  };

  // ── Export cropped region ─────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!canvasRef.current || !imgRef.current || !frameRef.current) return;
    const frame  = frameRef.current;
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const cw = canvas.width, ch = canvas.height;

    const out = document.createElement('canvas');
    out.width  = Math.round(frame.w);
    out.height = Math.round(frame.h);
    const ctx = out.getContext('2d');

    ctx.save();
    ctx.translate(cw / 2 - frame.x, ch / 2 - frame.y);
    ctx.rotate((rotation * Math.PI) / 180);
    const scale = Math.min(cw / img.width, ch / img.height) * 1.05;
    ctx.drawImage(img, -(img.width * scale) / 2, -(img.height * scale) / 2, img.width * scale, img.height * scale);
    ctx.restore();

    out.toBlob((blob) => {
      const file = new File([blob], `framed_${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
      onConfirm(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.92);
  };

  const ratio = ASPECT_RATIOS[imageType] || ASPECT_RATIOS.default;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      background: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* ── Header (mirrors form's bg-primary header) ── */}
      <div style={{
        background: 'var(--color-primary, #1e40af)',
        color: '#ffffff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CropIcon size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Frame Photo</div>
            <div style={{ fontSize: 11, opacity: 0.78, marginTop: 2 }}>
              Default {ratio.label} &nbsp;·&nbsp; drag corners to adjust freely
            </div>
          </div>
        </div>

        <button
          onClick={onCancel}
          type='button'
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <X size={15} /> Cancel
        </button>
      </div>

      {/* ── Tip bar ── */}
      <div style={{
        background: '#eff6ff',
        borderBottom: '1px solid #bfdbfe',
        padding: '7px 16px',
        flexShrink: 0,
      }}>
        <p style={{ margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
          <strong>Drag corners</strong> to resize &nbsp;·&nbsp;
          <strong>Drag inside frame</strong> to reposition &nbsp;·&nbsp;
          <strong>Rotate</strong> to straighten
        </p>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#f3f4f6' }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
          onMouseDown={onPointerDown}
          onMouseMove={onMouseMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />

        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid #bfdbfe', borderTopColor: '#2563eb',
              animation: '_spin 0.8s linear infinite',
            }} />
            <span style={{ color: '#6b7280', fontSize: 13 }}>Loading image…</span>
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div style={{
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px 16px',
        flexShrink: 0,
      }}>

        {/* Rotation controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            minWidth: 46,
          }}>
            Rotate
          </span>

          {/* −90 */}
          <button
          type='button'
            onClick={() => setRotation(r => r - 90)}
            style={ctrlBtn}
            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
          >
            <RotateCcw size={15} color="#2563eb" />
            <span style={{ fontSize: 12, color: '#374151' }}>−90°</span>
          </button>

          {/* Slider */}
          <input
            type="range" min={-180} max={180} step={1}
            value={rotation}
            onChange={e => setRotation(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
          />

          {/* +90 */}
          <button
          type='button'

            onClick={() => setRotation(r => r + 90)}
            style={ctrlBtn}
            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
          >
            <RotateCw size={15} color="#2563eb" />
            <span style={{ fontSize: 12, color: '#374151' }}>+90°</span>
          </button>

          {/* Degree label */}
          <span style={{
            fontSize: 12, color: '#2563eb', fontWeight: 700,
            minWidth: 38, textAlign: 'right',
          }}>
            {rotation}°
          </span>
        </div>

        {/* Apply button — full width, matches form's submit button */}
        <button
          type='button'

          onClick={handleConfirm}
          style={{
            width: '100%',
            background: 'var(--color-primary, #1e40af)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 0',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onTouchStart={e => e.currentTarget.style.opacity = '0.82'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          <Check size={18} /> Apply Frame
        </button>
      </div>
    </div>
  );
}

// Shared button style object (for rotation buttons)
const ctrlBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  flexShrink: 0,
  WebkitTapHighlightColor: 'transparent',
  transition: 'background 0.15s',
};