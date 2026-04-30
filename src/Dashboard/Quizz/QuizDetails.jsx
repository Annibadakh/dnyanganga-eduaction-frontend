import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api";
import { BookOpen, Clock, Calendar, BarChart2, Layers, CheckCircle2 } from "lucide-react";

const QuizDetails = () => {
  const { id } = useParams();
  const [quiz, setQuiz]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuiz(); }, []);

  if (loading) return (
    <div className="p-2 container mx-auto">
      <p className="text-center text-gray-400 py-10">Loading...</p>
    </div>
  );

  if (!quiz) return (
    <div className="p-2 container mx-auto">
      <p className="text-center text-gray-400 py-10">No quiz data found.</p>
    </div>
  );

  const totalQuestions = quiz.quizChapters.reduce((sum, ch) => sum + ch.queCount, 0);

  // Status badge colour
  const statusCls =
    quiz.status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : quiz.status === "INACTIVE"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  const typeCls =
    quiz.selectionType === "FIXED"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="p-2 container mx-auto">

      {/* ── Page Title ── */}
      <h1 className="text-3xl text-center font-bold text-primary mb-2">
        {quiz.title}
      </h1>
      <div className="flex justify-center gap-2 mb-6">
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${typeCls}`}>
          {quiz.selectionType}
        </span>
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${statusCls}`}>
          {quiz.status}
        </span>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <BookOpen size={18} />,  label: "Total Questions", value: totalQuestions,    cls: "bg-blue-50  border-blue-200  text-blue-700"  },
          { icon: <BarChart2 size={18} />, label: "Total Marks",     value: quiz.totalMarks,   cls: "bg-green-50 border-green-200 text-green-700" },
          { icon: <Layers size={18} />,    label: "Marks / Question", value: quiz.marksPerQue, cls: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { icon: <Clock size={18} />,     label: "Duration",        value: `${quiz.duration} min`, cls: "bg-red-50 border-red-200 text-red-700" },
        ].map((s) => (
          <div key={s.label} className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${s.cls}`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
              {s.icon} {s.label}
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Basic Info + Schedule ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Basic Information
          </h2>
          <div className="space-y-3">
            <InfoRow label="Standard" value={quiz.Standard?.name} />
            <InfoRow label="Selection Type" value={quiz.selectionType} />
            <InfoRow label="Status" value={quiz.status} />
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Schedule
          </h2>
          <div className="space-y-3">
            <InfoRow
              label="Date"
              value={quiz.quizDate ? new Date(quiz.quizDate).toLocaleDateString("en-GB") : "—"}
              icon={<Calendar size={14} className="text-gray-400" />}
            />
            <InfoRow
              label="Start Time"
              value={quiz.startTime || "—"}
              icon={<Clock size={14} className="text-gray-400" />}
            />
            <InfoRow
              label="End Time"
              value={quiz.endTime || "—"}
              icon={<Clock size={14} className="text-gray-400" />}
            />
          </div>
        </div>
      </div>

      {/* ── Chapter Distribution ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Chapter Distribution
        </h2>

        <div className="divide-y divide-gray-100">
          {quiz.quizChapters.map((ch) => {
            const pct = totalQuestions > 0 ? Math.round((ch.queCount / totalQuestions) * 100) : 0;
            return (
              <div key={ch.id} className="flex items-center gap-4 py-3">
                <span className="text-sm text-gray-700 w-1/3 shrink-0">{ch.Chapter?.name}</span>
                {/* progress bar */}
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-24 text-right shrink-0">
                  {ch.queCount} question{ch.queCount !== 1 ? "s" : ""} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fixed Questions Preview ── */}
      {quiz.selectionType === "FIXED" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Questions Preview
          </h2>

          <div className="space-y-5">
            {quiz.quizQuestions.map((qq, index) => {
              const q = qq.Question;
              return (
                <div key={qq.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    <span className="text-primary font-bold mr-1">{index + 1}.</span>
                    {q.questionText}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctAns.includes(opt.index);
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-colors
                            ${isCorrect
                              ? "bg-green-50 border-green-200 text-green-800 font-medium"
                              : "bg-white border-gray-200 text-gray-600"
                            }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${isCorrect ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                            {opt.index}
                          </span>
                          {opt.text}
                          {isCorrect && (
                            <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold">
                              <CheckCircle2 size={13} /> Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

// ── Reusable info row ─────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500 flex items-center gap-1.5">
      {icon} {label}
    </span>
    <span className="font-semibold text-gray-800">{value ?? "—"}</span>
  </div>
);

export default QuizDetails;