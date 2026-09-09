import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookOpen,
  Award,
} from "lucide-react";
import ImagePreview from "../Generic/ImagePreview";
import renderMathText from "../Generic/RenderMathText";

const QUESTIONS_PER_PAGE = 5;

const DemoQuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { questions = [], duration = 0, timeTaken = 0 } = location.state || {};

  const [currentPage, setCurrentPage] = useState(1);

  if (!questions.length) {
    return (
      <div className="p-4 container mx-auto text-center py-20">
        <p className="text-gray-400">No demo quiz data found.</p>
        <button
          onClick={() => navigate("..")}
          className="mt-4 text-primary underline text-sm"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Evaluate locally
  const evaluated = questions.map((q) => {
    const selected = q.selectedAns || [];
    const correct = q.correctAns || [];
    const isCorrect =
      selected.length > 0 &&
      correct.length === selected.length &&
      correct.every((c) => selected.includes(c));
    const isSkipped = selected.length === 0;
    return { ...q, isCorrect, isSkipped };
  });

  const correctCount = evaluated.filter((q) => q.isCorrect).length;
  const skippedCount = evaluated.filter((q) => q.isSkipped).length;
  const wrongCount = evaluated.length - correctCount - skippedCount;
  const total = evaluated.length;

  const totalPages = Math.ceil(total / QUESTIONS_PER_PAGE);
  const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = evaluated.slice(startIdx, startIdx + QUESTIONS_PER_PAGE);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-2">
        Demo Quiz Result
      </h1>
      <p className="text-center text-sm text-gray-400 mb-6">
        Practice quiz — results are not saved
      </p>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        {[
          {
            icon: <BookOpen size={18} />,
            label: "Total",
            value: total,
            cls: "bg-blue-50 border-blue-200 text-blue-700",
          },
          {
            icon: <CheckCircle2 size={18} />,
            label: "Correct",
            value: correctCount,
            cls: "bg-green-50 border-green-200 text-green-700",
          },
          {
            icon: <XCircle size={18} />,
            label: "Wrong",
            value: wrongCount,
            cls: "bg-red-50 border-red-200 text-red-700",
          },
          {
            icon: <MinusCircle size={18} />,
            label: "Skipped",
            value: skippedCount,
            cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
          },
          {
            icon: <Award size={18} />,
            label: "Time Taken",
            value: formatTime(timeTaken),
            cls: "bg-purple-50 border-purple-200 text-purple-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${s.cls}`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
              {s.icon} {s.label}
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Score Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Award size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Score
            </p>
            <p className="text-3xl font-bold text-primary">
              {correctCount} / {total}
            </p>
          </div>
        </div>
        <div className="flex-1 max-w-sm w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Accuracy</span>
            <span className="font-semibold">
              {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-3 bg-primary rounded-full transition-all"
              style={{
                width: `${total > 0 ? Math.round((correctCount / total) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {pageQuestions.map((q, idx) => {
          const questionNumber = startIdx + idx + 1;

          return (
            <div
              key={`${q.id}-${idx}`}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">
                    <span className="text-primary font-bold mr-1">
                      Q{questionNumber}.
                    </span>
                    {renderMathText(q.questionText)}
                  </div>
                  <ImagePreview
                    imagePath={q.imageUrl}
                    alt={`Question ${questionNumber}`}
                    className="mt-3 max-h-40"
                  />
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${
                      q.isSkipped
                        ? "bg-yellow-100 text-yellow-700"
                        : q.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                    }`}
                >
                  {q.isSkipped ? (
                    <>
                      <MinusCircle size={11} /> Skipped
                    </>
                  ) : q.isCorrect ? (
                    <>
                      <CheckCircle2 size={11} /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={11} /> Wrong
                    </>
                  )}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-1.5">
                {q.options.map((opt) => {
                  const isCorrect = q.correctAns?.includes(opt.index);
                  const isSelected = q.selectedAns?.includes(opt.index);

                  let rowCls = "bg-white border-gray-200 text-gray-600";
                  if (isCorrect)
                    rowCls = "bg-green-50 border-green-200 text-green-800 font-medium";
                  else if (isSelected)
                    rowCls = "bg-red-50 border-red-200 text-red-700";

                  let badgeCls = "bg-gray-200 text-gray-500";
                  if (isCorrect) badgeCls = "bg-green-500 text-white";
                  else if (isSelected) badgeCls = "bg-red-400 text-white";

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-colors ${rowCls}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}`}
                      >
                        {opt.index}
                      </span>
                      <div className="flex-1">
                        <div>{renderMathText(opt.text)}</div>
                        <ImagePreview
                          imagePath={opt.imageUrl}
                          alt={`Option ${opt.index}`}
                          className="mt-2 max-h-24"
                        />
                      </div>
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
              {q.solutionDescription && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                    Solution
                  </p>
                  <div>{renderMathText(q.solutionDescription)}</div>
                  <ImagePreview
                    imagePath={q.solutionUrl}
                    alt="Solution Image"
                    className="mt-3 max-h-30"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Back button */}
      <div className="mt-6 mb-10 text-center">
        <button
          onClick={() => navigate("..")}
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
};

export default DemoQuizResult;
