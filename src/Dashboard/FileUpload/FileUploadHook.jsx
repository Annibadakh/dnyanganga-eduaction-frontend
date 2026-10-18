// FileUploadHook.js
import { useState } from "react";
import imageCompression from "browser-image-compression";
import api from "../../Api";

export const FileUploadHook = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;

  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isSaved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);

  /**
   * Called by FileUpload after the user has confirmed the frame in the editor.
   * The file is already cropped/framed — we just compress it.
   */
  const handleFileUpload = async (e) => {
    let selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Some phone galleries hand over files with an empty MIME type — infer it from the extension
    if (!selectedFile.type) {
      const ext = (selectedFile.name.split(".").pop() || "").toLowerCase();
      const byExt = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", pdf: "application/pdf" };
      if (byExt[ext]) {
        selectedFile = new File([selectedFile], selectedFile.name, { type: byExt[ext] });
      }
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4",
      "video/quicktime",
      "video/x-matroska",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, PDF, DOC, DOCX files are supported");
      return;
    }

    setError("");

    if (selectedFile.type.startsWith("image/")) {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      // Show the preview (with Remove / Save) straight away — compressing a full-size
      // phone photo ("No Edit") can take seconds; Save shows a spinner until it's ready.
      setSaved(false);
      setImageUrl(URL.createObjectURL(selectedFile));
      setLoader(true);
      // Let the browser paint the preview + buttons before the (CPU-heavy) compression starts
      // (plain timer, not requestAnimationFrame — rAF never fires in a background tab)
      await new Promise((resolve) => setTimeout(resolve, 80));
      try {
        const options = {
          maxSizeMB: 4, // 300 KB target
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(selectedFile, options);
        const renamedFile = new File([compressedFile], `${Date.now()}.${ext}`, {
          type: compressedFile.type,
        });

        setFile(renamedFile);
        setImageUrl(URL.createObjectURL(renamedFile));
      } catch (err) {
        // Compression failed (e.g. low-memory phone) — upload the original instead
        console.error("Compression error, using original image:", err);
        setFile(new File([selectedFile], `${Date.now()}.${ext}`, { type: selectedFile.type }));
      } finally {
        setLoader(false);
      }
    } else {
      setFile(selectedFile);
      setImageUrl(selectedFile.name);
    }
  };

  const uploadImage = async (type) => {
    if (!file) return null;

    setLoader(true);

    const imageData = new FormData();
    imageData.append("type", type);
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
    setImageUrl,
    uploadImage,
    removePhoto,
  };
};
