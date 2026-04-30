import { useEffect, useState } from "react";
import api from "../../Api";

const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4 text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const StudentQuizzDashboard = () => {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/quiz/student/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">

      <h1 className="text-2xl text-center font-bold text-primary mb-4">
        Dashboard
      </h1>

      {/* ---------------- STATS GRID ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        <Card title="Total Attempts" value={data.totalAttempts} />
        <Card title="Total Marks" value={data.totalMarks} />
        <Card title="Average Score" value={data.avgScore} />

        <Card title="Correct Answers" value={data.correct} />
        <Card title="Wrong Answers" value={data.wrong} />
        <Card title="Not Attempted" value={data.notAttempted} />

        <Card title="Last Score" value={data.lastScore} />
        <Card title="Best Score" value={data.bestScore} />

      </div>

    </div>
  );
};

export default StudentQuizzDashboard;