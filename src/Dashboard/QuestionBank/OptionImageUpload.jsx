import React from "react";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import ImagePreview from "../Generic/ImagePreview";

const OptionImageUpload = ({ option, onImageChange }) => {
  const optionImage = FileUploadHook();

  const handleUpload = async (type) => {
    const imageUrl = await optionImage.uploadImage(type);

    if (imageUrl) {
      onImageChange(imageUrl);
    }
  };

  // The stored option image (edit mode) stays as-is until a new one is
  // uploaded. The hook only tracks the pending/replacement file — so the
  // old preview shows whenever no replacement is in play.
  const hasReplacement = !!optionImage.imageUrl;

  return (
    <div className="flex flex-wrap items-start gap-2">
      {option.imageUrl && !hasReplacement && (
        <ImagePreview
          imagePath={option.imageUrl}
          alt={`Option ${option.index} image`}
          className="max-h-20"
        />
      )}
      <div className="flex-shrink-0 min-w-44 flex-1">
        <FileUpload
          title=""
          imageUrl={optionImage.imageUrl}
          error={optionImage.error}
          loader={optionImage.loader}
          isSaved={optionImage.isSaved}
          imageType="option"
          onFileUpload={optionImage.handleFileUpload}
          onUploadImage={handleUpload}
          onRemovePhoto={optionImage.removePhoto}
        />
      </div>
    </div>
  );
};

export default OptionImageUpload;
