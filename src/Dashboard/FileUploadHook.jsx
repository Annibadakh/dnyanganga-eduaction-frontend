// FileUploadHook.js
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

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPG, JPEG, PDF, DOC, DOCX files are supported");
      return;
    }

    setError("");
    setFile(selectedFile);

    // Images → preview
    if (selectedFile.type.startsWith("image/")) {
      setImageUrl(URL.createObjectURL(selectedFile));
    } else {
      // Documents → show file name only
      setImageUrl(selectedFile.name);
    }
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
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
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

  return {
    imageUrl,
    file,
    isSaved,
    error,
    loader,
    handleFileUpload,
    uploadImage,
    removePhoto,
  };
};
