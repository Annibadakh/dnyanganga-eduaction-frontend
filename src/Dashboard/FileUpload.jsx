import React from 'react';

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
  return (
    <div className="mb-6">
      <h4 className="text-md font-bold mb-3 text-gray-700">{title}</h4>
      <div className="flex flex-col items-center w-full">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-56 max-w-md h-auto object-cover rounded-md mb-4"
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
          <div className="w-full">
            <input 
              type="file" 
              onChange={onFileUpload} 
              accept=".jpg,.jpeg"
              className="w-full px-3 py-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, JPEG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;