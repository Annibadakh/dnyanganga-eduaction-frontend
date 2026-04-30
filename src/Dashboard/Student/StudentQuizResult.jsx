import { useEffect, useState } from "react";
import api from "../../Api";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../Generic/Button";
import { Printer, CheckCircle2, XCircle, MinusCircle, BarChart2, BookOpen, Award } from "lucide-react";

const StudentQuizResult = () => {
  const navigate = useNavigate();
  const { studentQuizId } = useParams();
  const [data, setData] = useState(null);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/quiz/student/result/${studentQuizId}`);
      setData(res.data);
    } catch (err) {
      navigate("../history");
      alert(err.response?.data?.message || "Error");
    }
  };

  useEffect(() => { fetchResult(); }, []);

  if (!data) return (
    <div className="p-2 container mx-auto">
      <p className="text-center text-gray-400 py-10">Loading...</p>
    </div>
  );

  const { summary, questions } = data;

  const percentage = summary.total > 0
    ? Math.round((summary.marksObtained / (summary.total * (summary.marksObtained / (summary.correct || 1)))) * 100)
    : 0;

  const handlePrint = () => window.print();

  return (
    <>
      {/* ── Print styles injected into <head> ── */}
      <style>{`
        @media print {
          /* hide everything that is not the printable result */
          body * { visibility: hidden; }
          #quiz-result-printable,
          #quiz-result-printable * { visibility: visible; }

          #quiz-result-printable {
            position: absolute;
            inset: 0;
            padding: 24px;
          }

          /* allow content to flow naturally across pages */
          .no-print { display: none !important; }

          /* prevent option rows from being cut mid-row */
          .print-avoid-break { break-inside: avoid; }

          /* each question block stays together where possible */
          .question-block { break-inside: avoid; }
        }
      `}</style>

      <div className="p-2 container mx-auto" id="quiz-result-printable">

        {/* ── Page Title ── */}
        <h1 className="text-3xl text-center font-bold text-primary mb-2">
          Quiz Result
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Student Quiz ID: {studentQuizId}
        </p>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            {
              icon: <BookOpen size={18} />,
              label: "Total Questions",
              value: summary.total,
              cls: "bg-blue-50 border-blue-200 text-blue-700",
            },
            {
              icon: <CheckCircle2 size={18} />,
              label: "Correct",
              value: summary.correct,
              cls: "bg-green-50 border-green-200 text-green-700",
            },
            {
              icon: <XCircle size={18} />,
              label: "Wrong",
              value: summary.wrong,
              cls: "bg-red-50 border-red-200 text-red-700",
            },
            {
              icon: <MinusCircle size={18} />,
              label: "Not Attempted",
              value: summary.notAttempted,
              cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
            },
          ].map((s) => (
            <div key={s.label} className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${s.cls} print-avoid-break`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
                {s.icon} {s.label}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Score Card ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print-avoid-break">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Marks Obtained</p>
              <p className="text-3xl font-bold text-primary">{summary.marksObtained}</p>
            </div>
          </div>

          {/* Score progress bar */}
          <div className="flex-1 max-w-sm w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Score</span>
              <span className="font-semibold">{summary.correct}/{summary.total} correct</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-3 bg-primary rounded-full transition-all"
                style={{ width: `${summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Print button – hidden during print */}
          <div className="no-print">
            <Button
              variant="primary"
              startIcon={<Printer size={16} />}
              onClick={handlePrint}
            >
              Print / Download PDF
            </Button>
          </div>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-4">
          {questions.map((q, index) => {
            const question = q.Question;
            const isNotAttempted = !q.selectedAns || q.selectedAns.length === 0;

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 question-block"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    <span className="text-primary font-bold mr-1">Q{index + 1}.</span>
                    {question.questionText}
                  </p>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${isNotAttempted
                      ? "bg-yellow-100 text-yellow-700"
                      : q.marksObtained > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isNotAttempted ? (
                      <><MinusCircle size={11} /> Skipped</>
                    ) : q.marksObtained > 0 ? (
                      <><CheckCircle2 size={11} /> +{q.marksObtained}</>
                    ) : (
                      <><XCircle size={11} /> {q.marksObtained}</>
                    )}
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-1.5 print-avoid-break">
                  {question.options.map((opt) => {
                    const isCorrect  = question.correctAns.includes(opt.index);
                    const isSelected = q.selectedAns?.includes(opt.index);

                    let rowCls = "bg-white border-gray-200 text-gray-600";
                    if (isCorrect)             rowCls = "bg-green-50 border-green-200 text-green-800 font-medium";
                    else if (isSelected)       rowCls = "bg-red-50   border-red-200   text-red-700";

                    let badgeCls = "bg-gray-200 text-gray-500";
                    if (isCorrect)             badgeCls = "bg-green-500 text-white";
                    else if (isSelected)       badgeCls = "bg-red-400   text-white";

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-colors ${rowCls}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}`}>
                          {opt.index}
                        </span>
                        {opt.text}
                        {isCorrect && (
                          <span className="ml-auto text-green-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="ml-auto text-red-500 text-xs font-semibold flex items-center gap-1">
                            <XCircle size={12} /> Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution */}
                {question.solutionDescription && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 print-avoid-break">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Solution</p>
                    <p className="text-sm text-blue-800">{question.solutionDescription}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
};

export default StudentQuizResult;