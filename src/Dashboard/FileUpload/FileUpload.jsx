import React, { useState, useRef } from 'react';
import { Camera, Upload, X, FileText } from 'lucide-react';
import ImageFrameEditor from './ImageFrameEditor';

const FileUpload = ({
  title,
  imageUrl,
  error,
  loader,
  isSaved,
  imageType = "photo",
  onFileUpload,
  onUploadImage,
  onRemovePhoto,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [editorSrc, setEditorSrc] = useState(null);      // raw src for editor
  const [pendingFile, setPendingFile] = useState(null);   // file waiting for editor

  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const isDocument = imageType === "document";

  // ── Open editor with a raw image source ──────────────────────────────────
  const openEditor = (src, rawFile) => {
    setPendingFile(rawFile);
    setEditorSrc(src);
  };

  // ── Editor confirmed → pass framed file up ────────────────────────────────
  const handleEditorConfirm = (framedFile, framedUrl) => {
    setEditorSrc(null);
    const syntheticEvent = { target: { files: [framedFile] } };
    onFileUpload(syntheticEvent);
  };

  const handleEditorCancel = () => {
    setEditorSrc(null);
    setPendingFile(null);
  };

  // ── File input handler → route to editor for images ───────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const src = URL.createObjectURL(file);
      openEditor(src, file);
    } else {
      onFileUpload(e);
    }
  };

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    if (isDocument) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `capture_${Date.now()}.jpg`, {
        type: 'image/jpeg', lastModified: Date.now(),
      });
      const src = URL.createObjectURL(blob);
      stopCamera();
      openEditor(src, file);   // → send to editor
    }, 'image/jpeg', 0.9);
  };

  return (
    <>
      {/* ── Frame Editor overlay ── */}
      {editorSrc && (
        <ImageFrameEditor
          imageSrc={editorSrc}
          imageType={imageType}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
        />
      )}

      <div className="mb-6">
        <h4 className="text-md font-bold mb-3 text-gray-700">{title}</h4>

        {/* Document preview */}
        {isDocument && imageUrl && (
          <div className="flex flex-col items-center mb-4 p-3 border rounded bg-gray-50">
            <FileText className="w-10 h-10 text-blue-600 mb-2" />
            <p className="font-medium break-all text-center">{imageUrl}</p>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer"
              className="mt-2 text-blue-600 underline">
              View / Download
            </a>
          </div>
        )}

        <div className="flex flex-col items-center w-full">
          {showCamera ? (
            // ── Camera mode ──
            <div className="w-full max-w-xs">
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex space-x-4 justify-center">
                <button type="button" onClick={stopCamera}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button type="button" onClick={capturePhoto}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
                  <Camera size={16} /> Capture & Frame
                </button>
              </div>
            </div>

          ) : imageUrl ? (
            <>
              {!isDocument && (
                <img src={imageUrl} alt={title}
                  className={`rounded-md mb-4 ${imageType === 'students' ? 'w-48 h-auto' : 'w-full max-w-xs h-auto'}`}
                  style={{ aspectRatio: imageType === 'students' ? '3/4' : 'auto' }}
                />
              )}
              <div className="flex space-x-4 w-full justify-center">
                {!isSaved && (
                  <button type="button" onClick={onRemovePhoto} disabled={loader}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                    Remove {title}
                  </button>
                )}
                <button type="button" onClick={() => onUploadImage(imageType)} disabled={isSaved || loader}
                  className="px-4 py-2 min-w-28 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
                  {isSaved ? `${title} Saved`
                    : loader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />
                      : `Save ${title}`}
                </button>
              </div>
            </>

          ) : (
            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input type="file" onChange={handleFileChange}
                    accept={isDocument ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png'}
                    className="w-full px-3 py-2 border rounded" />
                </div>
                {!isDocument && (
                  <button type="button" onClick={startCamera}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
                    <Camera size={16} /> Take {title}
                  </button>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FileUpload;