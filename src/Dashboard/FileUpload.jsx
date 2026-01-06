import React, { useState, useRef } from 'react';
import { Camera, Upload, X, FileText } from 'lucide-react';

const FileUpload = ({ 
  title, 
  imageUrl, 
  error, 
  loader, 
  isSaved, 
  imageType = "passport",
  onFileUpload, 
  onUploadImage, 
  onRemovePhoto 
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const isDocument = imageType === "document";

  // ---------- CAMERA (unchanged logic) ----------
  const startCamera = async () => {
    if (isDocument) return;   // no camera for documents

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // handle dimensions based on imageType
      let targetWidth, targetHeight;
      let targetAspect;

      if (imageType === "passport") {
        targetWidth = 300;
        targetHeight = 400;
        targetAspect = targetWidth / targetHeight;
      } else {
        targetWidth = video.videoWidth;
        targetHeight = video.videoHeight;
        targetAspect = targetWidth / targetHeight;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const videoAspect = video.videoWidth / video.videoHeight;

      let sourceX, sourceY, sourceWidth, sourceHeight;

      if (imageType === "passport") {
        if (videoAspect > targetAspect) {
          sourceHeight = video.videoHeight;
          sourceWidth = sourceHeight * targetAspect;
          sourceX = (video.videoWidth - sourceWidth) / 2;
          sourceY = 0;
        } else {
          sourceWidth = video.videoWidth;
          sourceHeight = sourceWidth / targetAspect;
          sourceX = 0;
          sourceY = (video.videoHeight - sourceHeight) / 2;
        }
      } else {
        sourceX = 0;
        sourceY = 0;
        sourceWidth = video.videoWidth;
        sourceHeight = video.videoHeight;
      }

      context.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], `${title}_capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        const syntheticEvent = { target: { files: [file] } };
        onFileUpload(syntheticEvent);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="mb-6">
      <h4 className="text-md font-bold mb-3 text-gray-700">{title}</h4>

      {/* Document preview box */}
      {isDocument && imageUrl && (
        <div className="flex flex-col items-center mb-4 p-3 border rounded bg-gray-50">
          <FileText className="w-10 h-10 text-blue-600 mb-2" />
          <p className="font-medium break-all text-center">{imageUrl}</p>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-blue-600 underline"
          >
            View / Download
          </a>
        </div>
      )}

      <div className="flex flex-col items-center w-full">

        {showCamera ? (
          // ---------- CAMERA MODE ----------
          <div className="w-full max-w-xs">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <div 
                className={`relative mx-auto ${imageType === "passport" ? "w-48" : "w-full"}`} 
                style={{ aspectRatio: imageType === "passport" ? "3/4" : "auto" }}
              >
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                {imageType === "passport" && (
                  <>
                    <div className="absolute inset-0 border-2 border-white border-dashed opacity-50 pointer-events-none"></div>
                    <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                      {title} Frame
                    </div>
                  </>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex space-x-4 justify-center">
              <button 
                type="button" 
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>

              <button 
                type="button" 
                onClick={capturePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <Camera size={16} /> Capture
              </button>
            </div>
          </div>

        ) : imageUrl ? (
          // ---------- PREVIEW MODE ----------
          <>
            {!isDocument && (
              <img 
                src={imageUrl} 
                alt={title} 
                className={`rounded-md mb-4 ${imageType === "passport" ? "w-48 h-auto" : "w-full max-w-xs h-auto"}`}
                style={{ aspectRatio: imageType === "passport" ? "3/4" : "auto" }}
              />
            )}

            <div className="flex space-x-4 w-full justify-center">
              {!isSaved && (
                <button 
                  type="button" 
                  onClick={onRemovePhoto} 
                  disabled={loader}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Remove {title}
                </button>
              )}

              <button 
                type="button" 
                onClick={onUploadImage} 
                disabled={isSaved || loader}
                className="px-4 py-2 min-w-28 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isSaved ? `${title} Saved` : (
                  loader ? 
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> 
                  : `Save ${title}`
                )}
              </button>
            </div>
          </>
        ) : (
          // ---------- INPUT MODE ----------
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="file" 
                  onChange={onFileUpload} 
                  accept={isDocument ? ".pdf,.doc,.docx" : ".jpg,.jpeg"}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              {!isDocument && (
                <button 
                  type="button" 
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <Camera size={16} />
                  Take {title}
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
