import { useState } from "react";
import api from "../Api";

export const FileUploadHook = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isSaved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Check file type - only allow JPG and JPEG
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPG and JPEG files are supported");
      return;
    }
    
    setError("");
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
  };

  const uploadImage = async () => {
    if (!file) return null;
    
    setLoader(true);
    const imageData = new FormData();
    imageData.append("file", file);

    try {
      const response = await api.post("/upload-photo", imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.imageUrl) {
        setImageUrl(`${imgUrl}${response.data.imageUrl}`);
        setSaved(true);
        return response.data.imageUrl;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
      return null;
    } finally {
      setLoader(false);
    }
  };

  const removePhoto = () => {
    setImageUrl("");
    setFile(null);
    setSaved(false);
    setError("");
  };

  const resetUpload = () => {
    setImageUrl("");
    setFile(null);
    setSaved(false);
    setError("");
    setLoader(false);
  };

  return {
    imageUrl,
    file,
    isSaved,
    error,
    loader,
    handleFileUpload,
    uploadImage,
    removePhoto,
    resetUpload
  };
};