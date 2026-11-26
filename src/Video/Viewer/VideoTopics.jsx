import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaPlayCircle } from "react-icons/fa";
import videoApi, { apiMessage } from "../videoApi";

// Standard → topic cards (only topics that have videos; "Other Videos" for videos without a topic)
const VideoTopics = () => {
  const { standardId } = useParams();
  const [standard, setStandard] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    videoApi
      .get(`/standards/${standardId}/topics`)
      .then((res) => {
        setStandard(res.data.standard);
        setTopics(res.data.topics || []);
      })
      .catch((e) => setError(apiMessage(e, "Couldn't load the topics")))
      .finally(() => setLoading(false));
  }, [standardId]);

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <Link to="/video" className="p-2 rounded-full hover:bg-white text-primary" aria-label="Back">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{standard?.name || "Topics"}</h1>
      </div>

      {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      {!loading && !error && topics.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">No videos in this standard yet.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => (
          <Link
            key={t.id}
            to={`topics/${t.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary transition"
          >
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
              {t.title.replace(/[^0-9A-Za-z]/g, "").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-800 truncate">{t.title}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaPlayCircle className="text-primary" /> {t.videoCount} video{t.videoCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoTopics;
