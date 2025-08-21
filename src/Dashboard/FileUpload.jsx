import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const FileUpload = ({ 
  title, 
  imageUrl, 
  error, 
  loader, 
  isSaved, 
  onFileUpload, 
  onUploadImage, 
  onRemovePhoto 
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera by default
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for next frame to ensure video element is rendered
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
      
      // Passport photo dimensions (3:4 aspect ratio)
      const passportWidth = 300;
      const passportHeight = 400;
      
      // Set canvas to passport photo dimensions
      canvas.width = passportWidth;
      canvas.height = passportHeight;
      
      // Calculate source dimensions to crop from center of video
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = passportWidth / passportHeight;
      
      let sourceX, sourceY, sourceWidth, sourceHeight;
      
      if (videoAspect > targetAspect) {
        // Video is wider than target, crop horizontally
        sourceHeight = video.videoHeight;
        sourceWidth = sourceHeight * targetAspect;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Video is taller than target, crop vertically
        sourceWidth = video.videoWidth;
        sourceHeight = sourceWidth / targetAspect;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }
      
      // Draw the cropped video frame to canvas
      context.drawImage(
        video, 
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, passportWidth, passportHeight
      );
      
      // Convert to blob and create file
      canvas.toBlob((blob) => {
        const file = new File([blob], `${title}_capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Create a synthetic event object to match the file input format
        const syntheticEvent = {
          target: {
            files: [file]
          }
        };
        
        onFileUpload(syntheticEvent);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="mb-6">
      <h4 className="text-md font-bold mb-3 text-gray-700">{title}</h4>
      <div className="flex flex-col items-center w-full">
        {showCamera ? (
          <div className="w-full max-w-xs">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              {/* Container with passport photo aspect ratio (3:4) - smaller size */}
              <div className="relative w-48 mx-auto" style={{ aspectRatio: '3/4' }}>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay frame to show capture area */}
                <div className="absolute inset-0 border-2 border-white border-dashed opacity-50 pointer-events-none"></div>
                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                  Photo Frame
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex space-x-4 justify-center">
              <button 
                type="button" 
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                type="button" 
                onClick={capturePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Camera size={16} />
                Capture
              </button>
            </div>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-48 h-auto object-cover rounded-md mb-4"
              style={{ aspectRatio: '3/4' }}
            />
            <div className="flex space-x-4 w-full justify-center">
              {!isSaved && (
                <button 
                  type="button" 
                  onClick={onRemovePhoto} 
                  disabled={loader}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                >
                  Remove {title}
                </button>
              )}
              <button 
                type="button" 
                onClick={onUploadImage} 
                disabled={isSaved || loader}
                className="px-4 py-2 min-w-28 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 grid place-items-center"
              >
                {isSaved ? `${title} Saved` : (loader ? 
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : 
                  `Save ${title}`
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* File Upload */}
              <div className="flex-1">
                <label className="block w-full">
                  <input 
                    type="file" 
                    onChange={onFileUpload} 
                    accept=".jpg,.jpeg"
                    className="w-full px-3 py-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </label>
              </div>
              
              {/* Camera Button */}
              <button 
                type="button" 
                onClick={startCamera}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Camera size={16} />
                Take Photo
              </button>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <p className="text-sm text-gray-500">
              Supported formats: JPG, JPEG. You can upload a file or take a photo with your camera. Photos will be cropped to passport photo dimensions (3:4 ratio).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo component to show how it works
const App = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setError('');
      setIsSaved(false);
    }
  };

  const handleUploadImage = () => {
    setLoader(true);
    // Simulate upload delay
    setTimeout(() => {
      setLoader(false);
      setIsSaved(true);
    }, 2000);
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setIsSaved(false);
    setError('');
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Passport Photo Upload
      </h2>
      <FileUpload
        title="Passport Photo"
        imageUrl={imageUrl}
        error={error}
        loader={loader}
        isSaved={isSaved}
        onFileUpload={handleFileUpload}
        onUploadImage={handleUploadImage}
        onRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
};

export default App;