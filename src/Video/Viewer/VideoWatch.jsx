import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import VideoPlayer from "../Player/VideoPlayer";
import videoApi, { apiMessage } from "../videoApi";
import { formatDuration } from "../uploadVideo";

// Watch page: asks the server for access (it sets the playback cookies), then plays
const VideoWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const standard = location.state?.standard;
  const [playback, setPlayback] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await videoApi.get(`/videos/${id}/play`);
    setPlayback(data);
    return data;
  }, [id]);

  useEffect(() => {
    setPlayback(null);
    setError("");
    load().catch((e) => setError(apiMessage(e, "This video can't be played right now")));
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 my-3">
        <button
          onClick={() => (standard ? navigate(`/video/standards/${standard.id}`) : navigate(-1))}
          className="p-2 rounded-full hover:bg-white text-primary"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">{playback?.title || "Video"}</h1>
      </div>

      {error ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/video" className="text-primary font-semibold underline">
            Back to my videos
          </Link>
        </div>
      ) : playback ? (
        <>
          <VideoPlayer
            src={playback.manifestUrl}
            videoId={playback.id}
            title={playback.title}
            expiresAt={playback.expiresAt}
            renew={load}
          />
          <div className="bg-white rounded-xl shadow-sm p-4 mt-3">
            <p className="font-semibold text-gray-800">{playback.title}</p>
            <p className="text-sm text-gray-500">
              {standard?.name ? `${standard.name} · ` : ""}
              {formatDuration(playback.durationSeconds)}
            </p>
          </div>
        </>
      ) : (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white">Loading…</div>
      )}
    </div>
  );
};

export default VideoWatch;
