import { useEffect, useState } from "react";
import api from "../../Api";
import { useParams } from "react-router-dom";
import Button from "../Generic/Button";

const QuizAnalytics = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await api.get(`/quiz/${id}/analytics`);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Analytics</h1>

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded">
          <p>Total Attempts</p>
          <p className="text-xl font-bold">{data.stats.totalAttempts}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p>Average Score</p>
          <p className="text-xl font-bold">{data.stats.avgScore}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p>Highest Score</p>
          <p className="text-xl font-bold">{data.stats.maxScore}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p>Lowest Score</p>
          <p className="text-xl font-bold">{data.stats.minScore}</p>
        </div>
      </div>

      {/* ---------------- LEADERBOARD ---------------- */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>

        {data.leaderboard.slice(0, 10).map((l) => (
          <div
            key={l.rank}
            className="flex justify-between bg-white p-2 border rounded mb-1"
          >
            <span>
              #{l.rank} {l.name}
            </span>
            <span>{l.marks}</span>
          </div>
        ))}
      </div>

      {/* ---------------- ATTEMPTS ---------------- */}
      <div>
        <div className="flex justify-between mb-2">
          <h2 className="text-xl font-semibold">Attempts</h2>

          <Button onClick={() => exportExcel(data.attempts)}>
            Export Excel
          </Button>
        </div>

        {data.attempts.map((a, i) => (
          <div
            key={i}
            className="flex justify-between bg-white p-2 border rounded mb-1"
          >
            <span>{a.studentName}</span>
            <span>{a.marks}</span>
            <span>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- EXPORT ----------------
const exportExcel = (data) => {
  const csv = [
    ["Name", "Marks", "Status"],
    ...data.map((d) => [d.studentName, d.marks, d.status]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quiz_attempts.csv";
  a.click();
};

export default QuizAnalytics;
