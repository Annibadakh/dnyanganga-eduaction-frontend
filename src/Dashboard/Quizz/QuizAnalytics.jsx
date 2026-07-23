import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api";
import html2canvas from "html2canvas";
import {
  Users,
  Target,
  Trophy,
  TrendingDown,
  Crown,
  Download,
  Loader2,
} from "lucide-react";
import StudentAttemptsTable from "./StudentAttemptsTable";
import logo from "../../Images/logo3.png";

// ---------------- STAT CARD ----------------
const STAT_CARD_CONFIG = {
  blue: { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  purple: { iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  green: { iconBg: "bg-green-100", iconColor: "text-green-600" },
  red: { iconBg: "bg-red-100", iconColor: "text-red-600" },
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

// ---------------- LEADERBOARD BADGES ----------------
const getRankBadge = (rank) => {
  switch (rank) {
    case 1:
      return {
        emoji: "\uD83E\uDD47",
        label: "1st",
        cellCls: "bg-yellow-50 border-yellow-200",
        rankCls: "text-yellow-600",
      };
    case 2:
      return {
        emoji: "\uD83E\uDD48",
        label: "2nd",
        cellCls: "bg-gray-50 border-gray-200",
        rankCls: "text-gray-500",
      };
    case 3:
      return {
        emoji: "\uD83E\uDD49",
        label: "3rd",
        cellCls: "bg-orange-50 border-orange-200",
        rankCls: "text-orange-500",
      };
    case 4:
      return {
        emoji: "\u2B50",
        label: "4th",
        cellCls: "bg-blue-50 border-blue-200",
        rankCls: "text-blue-500",
      };
    case 5:
      return {
        emoji: "\u2B50",
        label: "5th",
        cellCls: "bg-purple-50 border-purple-200",
        rankCls: "text-purple-500",
      };
    default:
      return null;
  }
};

// ---------------- LEADERBOARD TABLE ----------------
const LeaderboardTable = ({ leaderboard }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return <p className="text-gray-500 text-sm">No attempts yet.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[60px_80px_1fr_140px_140px] gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <span>Badge</span>
        <span>Rank</span>
        <span>Student Name</span>
        <span className="text-center">Marks Obtained</span>
        <span className="text-center">Division</span>
      </div>

      {/* Table Rows */}
      {leaderboard.map((entry) => {
        const badge = getRankBadge(entry.rank);
        return (
          <div
            key={entry.rank}
            className={`grid grid-cols-[60px_80px_1fr_140px_140px] gap-2 px-5 py-3 items-center border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50 ${
              badge ? badge.cellCls : "bg-white"
            }`}
          >
            {/* Badge */}
            <span className="text-2xl text-center leading-none">
              {badge ? badge.emoji : ""}
            </span>

            {/* Rank */}
            <span
              className={`text-sm font-bold ${
                badge ? badge.rankCls : "text-gray-500"
              }`}
            >
              #{entry.rank}
            </span>

            {/* Student Name */}
            <span className="font-medium text-gray-800 text-sm">
              {entry.studentName}
            </span>

            {/* Marks */}
            <span className="text-center font-bold text-gray-700 text-sm">
              {entry.marks}
            </span>

            {/* Division */}
            <span className="text-center text-sm text-gray-600">
              {entry.branch || "\u2014"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- POSTER COMPONENT (hidden, rendered for capture) ----------------
const Poster = ({ quiz, leaderboard, posterRef }) => {
  const quizDate = quiz?.quizDate
    ? new Date(quiz.quizDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      ref={posterRef}
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 800,
        height: 800,
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
        background: "#fafafa",
        color: "#1e293b",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 6,
          background: "linear-gradient(90deg, #2563eb, #7c3aed, #2563eb)",
        }}
      />

      {/* Confetti decorations */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 24,
          fontSize: 24,
          opacity: 0.6,
        }}
      >
        {"\uD83C\uDF89"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          fontSize: 24,
          opacity: 0.6,
        }}
      >
        {"\uD83C\uDF89"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 50,
          fontSize: 16,
          opacity: 0.35,
        }}
      >
        {"\u2728"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 50,
          fontSize: 16,
          opacity: 0.35,
        }}
      >
        {"\u2728"}
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 12 }}>
        <img
          src={logo}
          alt="Dnyanganga Logo"
          style={{
            width: 220,
            height: 80,
            margin: "0 auto 12px",
            display: "block",
          }}
        />
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#1e293b",
            letterSpacing: 0.5,
          }}
        >
          Dnyanganga Education Pvt. Ltd.
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 100,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #2563eb, transparent)",
          margin: "0 auto",
        }}
      />

      {/* Quiz Title */}
      <div style={{ textAlign: "center", padding: "16px 40px 8px" }}>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 6,
          }}
        >
          Leaderboard
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1e293b",
            lineHeight: 1.3,
          }}
        >
          {quiz?.title || "Quiz Results"}
        </div>
      </div>

      {/* Quiz Details Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          padding: "12px 40px 20px",
          flexWrap: "wrap",
        }}
      >
        {[
          quizDate && { label: "Date", value: quizDate },
          quiz?.duration && {
            label: "Duration",
            value: `${quiz.duration} min`,
          },
          quiz?.totalMarks && { label: "Total Marks", value: quiz.totalMarks },
          quiz?.Standard?.name && {
            label: "Standard",
            value: quiz.Standard.name,
          },
          // { label: "Participants", value: leaderboard.length },
        ]
          .filter(Boolean)
          .map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginTop: 2,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
      </div>

      {/* Leaderboard Table */}
      <div style={{ padding: "0 32px 24px" }}>
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "50px 60px 1fr 110px 110px",
            gap: 8,
            padding: "10px 16px",
            background: "#e0e7ff",
            borderRadius: "8px 8px 0 0",
            borderBottom: "2px solid #2563eb",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#1e40af",
          }}
        >
          <span></span>
          <span style={{ textAlign: "center" }}>Rank</span>
          <span style={{ textAlign: "center" }}>Student Name</span>
          <span style={{ textAlign: "center" }}>Marks</span>
          <span style={{ textAlign: "center" }}>Division</span>
        </div>

        {/* Rows */}
        {leaderboard.slice(0, 15).map((entry, idx) => {
          const isTop3 = entry.rank <= 3;
          const is45 = entry.rank === 4 || entry.rank === 5;
          const rowBg = isTop3
            ? entry.rank === 1
              ? "#fef9c3"
              : entry.rank === 2
                ? "#f1f5f9"
                : "#ffedd5"
            : is45
              ? "#ede9fe"
              : idx % 2 === 0
                ? "#ffffff"
                : "#f8fafc";

          const badges = {
            1: "\uD83E\uDD47",
            2: "\uD83E\uDD48",
            3: "\uD83E\uDD49",
            4: "\u2B50",
            5: "\u2B50",
          };

          const rankColor = isTop3
            ? entry.rank === 1
              ? "#b45309"
              : entry.rank === 2
                ? "#475569"
                : "#c2410c"
            : is45
              ? "#6d28d9"
              : "#64748b";

          return (
            <div
              key={entry.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 60px 1fr 110px 110px",
                gap: 8,
                padding: "10px 16px",
                background: rowBg,
                borderBottom: "1px solid #e2e8f0",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: 22, textAlign: "center", lineHeight: 1 }}
              >
                {badges[entry.rank] || ""}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: rankColor,
                  textAlign: "center",
                }}
              >
                #{entry.rank}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#1e293b",
                  textAlign: "center",
                }}
              >
                {entry.studentName}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "center",
                }}
              >
                {entry.marks}
              </span>
              <span
                style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}
              >
                {entry.branch || "\u2014"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #2563eb, #7c3aed, #2563eb)",
        }}
      />
    </div>
  );
};

// ---------------- MAIN COMPONENT ----------------
const QuizAnalytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef(null);

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

  const handleDownloadPoster = async () => {
    if (!posterRef.current || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        width: 800,
        height: 800,
        useCORS: true,
        backgroundColor: "#fafafa",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `leaderboard-${data.quiz?.title || id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Poster generation failed:", err);
      alert("Failed to generate poster. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!data) return null;

  const { stats, leaderboard, quiz } = data;

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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Crown className="text-yellow-500" size={20} />
            Leaderboard
          </h2>

          {leaderboard && leaderboard.length > 0 && (
            <button
              onClick={handleDownloadPoster}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {downloading ? "Generating..." : "Download Poster"}
            </button>
          )}
        </div>

        <LeaderboardTable leaderboard={leaderboard} />
      </div>

      {/* Hidden poster for capture */}
      <Poster quiz={quiz} leaderboard={leaderboard} posterRef={posterRef} />

      {/* ---------------- ATTEMPTS ---------------- */}
      <StudentAttemptsTable quizId={id} />
    </div>
  );
};

export default QuizAnalytics;
