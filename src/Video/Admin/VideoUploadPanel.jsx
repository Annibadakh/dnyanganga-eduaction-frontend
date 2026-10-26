import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useToast } from "../../useToast";
import { apiMessage } from "../videoApi";
import { uploadVideo, formatBytes } from "../uploadVideo";

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // keep in step with VIDEO_MAX_UPLOAD_BYTES on the server
const TYPES = [".mp4", ".mov", ".mkv"];

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs sm:text-sm mt-1">{msg}</p> : null;

// Upload a new video: title, standard, file → straight to S3 with a progress bar.
const VideoUploadPanel = ({ standardOptions, onUploaded, onClose }) => {
  const { successToast, errorToast } = useToast();
  const [title, setTitle] = useState("");
  const [standardId, setStandardId] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(null); // null = not uploading, 0..1
  const uploadRef = useRef(null);

  // warn before leaving the page in the middle of an upload
  useEffect(() => {
    if (progress === null) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [progress]);

  const pickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 200));
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validate = () => {
    const found = {};
    if (title.trim().length < 2 || title.trim().length > 200) found.title = "Title must be 2–200 characters";
    if (!standardId) found.standardId = "Select a standard";
    if (!file) found.file = "Choose a video file";
    else if (!TYPES.some((t) => file.name.toLowerCase().endsWith(t))) found.file = "Only MP4, MOV or MKV files";
    else if (file.size > MAX_BYTES) found.file = `Video is too large (max ${formatBytes(MAX_BYTES)})`;
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const start = async () => {
    if (!validate()) return;
    setProgress(0);
    const upload = uploadVideo({ file, title: title.trim(), standardId: Number(standardId), onProgress: setProgress });
    uploadRef.current = upload;
    try {
      await upload.done;
      successToast("Uploaded — the video is being converted (this takes a few minutes)");
      onUploaded();
    } catch (error) {
      if (error?.message !== "cancelled") errorToast(apiMessage(error, "Upload failed, please try again"));
      setProgress(null);
      onUploaded(); // the list may show a failed/removed row
    } finally {
      uploadRef.current = null;
    }
  };

  const cancel = async () => {
    if (uploadRef.current) await uploadRef.current.cancel();
    setProgress(null);
  };

  const uploading = progress !== null;
  const inputCls = (name) =>
    `w-full px-3 h-[42px] border rounded-lg text-sm focus:outline-none focus:ring-2 ${
      errors[name] ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
    }`;

  return (
    <div className="mt-6 md:p-6 p-3 bg-white shadow-custom border-t-4 border-primary">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-tertiary">Upload Video</h2>
        {!uploading && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X size={22} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            placeholder="e.g. Physics – Chapter 3 Motion"
            className={inputCls("title")}
          />
          <FieldError msg={errors.title} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
          <select
            value={standardId}
            onChange={(e) => setStandardId(e.target.value)}
            disabled={uploading}
            className={`${inputCls("standardId")} bg-white cursor-pointer`}
          >
            <option value="">Select standard</option>
            {standardOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError msg={errors.standardId} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Video file (MP4, MOV or MKV, up to 2 GB)</label>
          <input
            type="file"
            accept=".mp4,.mov,.mkv,video/mp4,video/quicktime,video/x-matroska"
            onChange={pickFile}
            disabled={uploading}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer"
          />
          {file && <p className="text-xs text-gray-500 mt-1">{file.name} · {formatBytes(file.size)}</p>}
          <FieldError msg={errors.file} />
        </div>
      </div>

      {uploading ? (
        <div className="mt-5">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{progress >= 1 ? "Finishing…" : "Uploading… keep this page open"}</span>
            <span className="font-semibold">{Math.floor(progress * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
          <button onClick={cancel} disabled={progress >= 1} className="mt-3 px-4 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 text-sm">
            Cancel upload
          </button>
        </div>
      ) : (
        <button onClick={start} className="mt-5 inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md hover:bg-blue-700">
          <Upload size={18} /> Upload
        </button>
      )}
    </div>
  );
};

export default VideoUploadPanel;
