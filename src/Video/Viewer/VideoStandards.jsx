import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlayCircle } from "react-icons/fa";
import videoApi, { apiMessage } from "../videoApi";

// Video user home: one card per standard they have access to
const VideoStandards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    videoApi
      .get("/standards")
      .then((res) => setStandards(res.data.standards || []))
      .catch((e) => setError(apiMessage(e, "Couldn't load your standards")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary my-4 sm:my-6">My Videos</h1>

      {loading && <p className="text-center text-gray-400 py-10">Loading...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      {!loading && !error && standards.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No standards are assigned to your account yet. Please contact Dnyanganga Education.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {standards.map((s) => (
          <Link
            key={s.id}
            to={`standards/${s.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary transition"
          >
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
              {s.name.replace(/[^0-9A-Za-z]/g, "").slice(0, 4)}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-800 truncate">{s.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaPlayCircle className="text-primary" /> {s.videoCount} video{s.videoCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoStandards;
