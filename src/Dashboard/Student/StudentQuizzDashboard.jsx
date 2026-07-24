import { useEffect, useState } from "react";
import api from "../../Api";
import {
  ClipboardList,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Medal,
  Award,
} from "lucide-react";
import QuizAnalyticsCharts from "../Generic/QuizAnalyticsCharts";

const Card = ({ title, value, icon: Icon, color }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 p-5 ${color.bg} ${color.border}`}
  >
    <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/20" />

    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h2 className="text-3xl font-bold mt-2 text-gray-800">{value ?? 0}</h2>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.iconBg}`}
      >
        <Icon className={`w-6 h-6 ${color.icon}`} />
      </div>
    </div>
  </div>
);

const STAT_CARDS = [
  { key: "totalAttempts", title: "Total Attempts", icon: ClipboardList, color: { bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-100", icon: "text-blue-600" } },
  { key: "totalMarks", title: "Total Marks", icon: Trophy, color: { bg: "bg-yellow-50", border: "border-yellow-100", iconBg: "bg-yellow-100", icon: "text-yellow-600" } },
  { key: "avgScore", title: "Average Score", icon: Target, color: { bg: "bg-purple-50", border: "border-purple-100", iconBg: "bg-purple-100", icon: "text-purple-600" } },
  { key: "correct", title: "Correct Answers", icon: CheckCircle2, color: { bg: "bg-green-50", border: "border-green-100", iconBg: "bg-green-100", icon: "text-green-600" } },
  { key: "wrong", title: "Wrong Answers", icon: XCircle, color: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", icon: "text-red-600" } },
  { key: "notAttempted", title: "Not Attempted", icon: CircleDashed, color: { bg: "bg-gray-50", border: "border-gray-200", iconBg: "bg-gray-200", icon: "text-gray-600" } },
  { key: "lastScore", title: "Last Score", icon: Medal, color: { bg: "bg-cyan-50", border: "border-cyan-100", iconBg: "bg-cyan-100", icon: "text-cyan-600" } },
  { key: "bestScore", title: "Best Score", icon: Award, color: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", icon: "text-amber-600" } },
];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <Card
            key={card.key}
            title={card.title}
            value={data[card.key]}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Charts */}
      <QuizAnalyticsCharts data={data} />
    </div>
  );
};

export default StudentQuizzDashboard;
