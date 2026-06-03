import React from "react";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";

const OptionImageUpload = ({ option, onImageChange }) => {
  const optionImage = FileUploadHook();

  const handleUpload = async (type) => {
    const imageUrl = await optionImage.uploadImage(type);

    if (imageUrl) {
      onImageChange(imageUrl);
    }
  };

  return (
    <FileUpload
      title=""
      imageUrl={optionImage.imageUrl}
      error={optionImage.error}
      loader={optionImage.loader}
      isSaved={optionImage.isSaved}
      imageType="option"
      onFileUpload={optionImage.handleFileUpload}
      onUploadImage={handleUpload}
      onRemovePhoto={() => onImageChange("")}
    />
  );
};

export default OptionImageUpload;
