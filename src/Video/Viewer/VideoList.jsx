import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle, Clock } from "lucide-react";
import videoApi, { apiMessage } from "../videoApi";
import { formatDuration } from "../uploadVideo";

const watchedSeconds = (id) => {
  try {
    return Number(localStorage.getItem(`video-position-${id}`)) || 0;
  } catch {
    return 0;
  }
};

// The videos of one standard (newest first) with a search box and "continue watching" marks
const VideoList = () => {
  const { standardId } = useParams();
  const [standard, setStandard] = useState(null);
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    videoApi
      .get(`/standards/${standardId}/videos`)
      .then((res) => {
        setStandard(res.data.standard);
        setVideos(res.data.videos || []);
      })
      .catch((e) => setError(apiMessage(e, "Couldn't load the videos")))
      .finally(() => setLoading(false));
  }, [standardId]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? videos.filter((v) => v.title.toLowerCase().includes(q)) : videos;
  }, [videos, search]);

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <Link to="/video" className="p-2 rounded-full hover:bg-white text-primary" aria-label="Back">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{standard?.name || "Videos"}</h1>
      </div>

      {!loading && !error && videos.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos..."
          className="w-full sm:w-80 border rounded-lg px-3 h-[42px] text-sm mb-4 bg-white"
        />
      )}

      {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">No videos in this standard yet.</div>
      )}

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {shown.map((v) => {
          const watched = watchedSeconds(v.id);
          const pct = v.durationSeconds ? Math.min((watched / v.durationSeconds) * 100, 100) : 0;
          return (
            <Link key={v.id} to={`/video/watch/${v.id}`} state={{ standard }} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-blue-50 transition">
              <PlayCircle className="w-10 h-10 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">{v.title}</p>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} /> {formatDuration(v.durationSeconds)}
                  {watched > 5 && <span className="ml-2 text-primary font-medium">· Continue from {formatDuration(watched)}</span>}
                </p>
                {pct > 0 && (
                  <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden w-full sm:w-64">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VideoList;
