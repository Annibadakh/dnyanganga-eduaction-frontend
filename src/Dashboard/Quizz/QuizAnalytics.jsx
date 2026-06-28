import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api";
import { Users, Target, Trophy, TrendingDown, Crown } from "lucide-react";
import StudentAttemptsTable from "./StudentAttemptsTable";

// ---------------- STAT CARD ----------------
const STAT_CARD_CONFIG = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  green: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const theme = STAT_CARD_CONFIG[color] || STAT_CARD_CONFIG.blue;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${theme.iconBg} p-3 rounded-lg`}>
          <Icon className={theme.iconColor} size={22} />
        </div>
      </div>
    </div>
  );
};

// ---------------- LEADERBOARD ----------------
const RANK_BADGES = {
  1: { emoji: "🥇", className: "bg-yellow-50 border-yellow-200" },
  2: { emoji: "🥈", className: "bg-gray-50 border-gray-200" },
  3: { emoji: "🥉", className: "bg-orange-50 border-orange-200" },
};

const LeaderboardRow = ({ entry }) => {
  const badge = RANK_BADGES[entry.rank];

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg mb-1.5 ${
        badge ? badge.className : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-8 text-center font-semibold text-gray-600">
          {badge ? badge.emoji : `#${entry.rank}`}
        </span>
        <span className="font-medium text-gray-800">{entry.studentName}</span>
      </div>
      <span className="font-bold text-gray-700">{entry.marks}</span>
    </div>
  );
};

const QuizAnalytics = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/quiz/${id}/analytics`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!data) return null;

  const { stats, leaderboard } = data;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Analytics</h1>

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Attempts"
          value={stats.totalAttempts}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Average Score"
          value={stats.avgScore}
          icon={Target}
          color="purple"
        />
        <StatCard
          label="Highest Score"
          value={stats.maxScore}
          icon={Trophy}
          color="green"
        />
        <StatCard
          label="Lowest Score"
          value={stats.minScore}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* ---------------- LEADERBOARD ---------------- */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Crown className="text-yellow-500" size={20} />
          Leaderboard
        </h2>

        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm">No attempts yet.</p>
        ) : (
          leaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))
        )}
      </div>

      {/* ---------------- ATTEMPTS (separate component) ---------------- */}
      <StudentAttemptsTable quizId={id} />
    </div>
  );
};

export default QuizAnalytics;
