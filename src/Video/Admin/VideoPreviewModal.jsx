import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import VideoPlayer from "../Player/VideoPlayer";
import videoApi, { apiMessage } from "../videoApi";

// Plays a ready video for the admin (the server sets the same signed cookies as for viewers)
const VideoPreviewModal = ({ video, onClose }) => {
  const [playback, setPlayback] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await videoApi.get(`/videos/${video.id}/play`);
    setPlayback(data);
    return data;
  }, [video.id]);

  useEffect(() => {
    load().catch((e) => setError(apiMessage(e, "Couldn't open the video")));
  }, [load]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-2 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-semibold truncate pr-4">{video.title}</p>
          <button onClick={onClose} className="text-white hover:text-gray-300" aria-label="Close">
            <X size={28} />
          </button>
        </div>
        {error ? (
          <div className="bg-white rounded-lg p-6 text-center text-red-600">{error}</div>
        ) : playback ? (
          <VideoPlayer
            src={playback.manifestUrl}
            videoId={`admin-${video.id}`}
            title={playback.title}
            expiresAt={playback.expiresAt}
            renew={load}
          />
        ) : (
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white">Loading…</div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default VideoPreviewModal;
