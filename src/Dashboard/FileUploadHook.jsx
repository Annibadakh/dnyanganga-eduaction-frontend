// FileUploadHook.js
import { useState } from "react";
import imageCompression from "browser-image-compression";
import api from "../Api";

export const FileUploadHook = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;

  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isSaved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPG, JPEG, PDF, DOC, DOCX files are supported");
      return;
    }

    setError("");

    if (selectedFile.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 0.15, // 150KB target
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(selectedFile, options);

        // console.log("Original:", (selectedFile.size / 1024).toFixed(2), "KB");
        // console.log(
        //   "Compressed:",
        //   (compressedFile.size / 1024).toFixed(2),
        //   "KB"
        // );

        // 🔥 Preserve correct extension
        const fileExtension = selectedFile.name.split(".").pop();

        const renamedFile = new File(
          [compressedFile],
          `${Date.now()}.${fileExtension}`,
          {
            type: compressedFile.type,
          }
        );

        setFile(renamedFile);
        setImageUrl(URL.createObjectURL(renamedFile));

      } catch (err) {
        console.error("Compression error:", err);
        setError("Image compression failed");
      }
    } else {
      setFile(selectedFile);
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