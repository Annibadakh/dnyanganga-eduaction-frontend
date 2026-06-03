// components/QuestionBank/ImagePreview.jsx
import { useState } from "react";
import { ZoomIn, X } from "lucide-react";

const imgUrl = import.meta.env.VITE_IMG_URL;

const ImagePreview = ({ imagePath, alt = "Preview", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!imagePath) return null;

  const fullSrc = `${imgUrl}${imagePath}`;

  return (
    <>
      {/* Thumbnail */}
      <div
        className="mt-2 relative group w-fit cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={fullSrc}
          alt={alt}
          className={`max-h-64 rounded-lg border border-gray-200 object-contain transition-transform duration-300 group-hover:scale-105 ${className}`}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
          <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Full-screen Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullSrc}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-gray-800 hover:text-red-500 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
