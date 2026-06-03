// components/QuestionBank/ImagePreview.jsx

const imgUrl = import.meta.env.VITE_IMG_URL;

const ImagePreview = ({ imagePath, alt = "Preview", className = "" }) => {
  if (!imagePath) return null;

  return (
    <div className="mt-2">
      <img
        src={`${imgUrl}${imagePath}`}
        alt={alt}
        className={`max-h-64 rounded-lg border border-gray-200 object-contain ${className}`}
      />
    </div>
  );
};

export default ImagePreview;
