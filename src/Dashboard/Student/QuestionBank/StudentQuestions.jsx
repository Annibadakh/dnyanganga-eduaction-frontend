import { useEffect, useState } from "react";
import api from "../../../Api";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, BookOpen } from "lucide-react";
import Button from "../../Generic/Button";
import Pagination from "../../Generic/Pagination";
import renderMathText from "../../Generic/RenderMathText";
import ImagePreview from "../../Generic/ImagePreview";

const QUESTIONS_PER_PAGE = 10;

const StudentQuestions = () => {
  const navigate = useNavigate();
  const { subjectId, chapterId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/question-bank/student/questions/${chapterId}`,
        {
          params: { page, limit: QUESTIONS_PER_PAGE },
        },
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [chapterId, currentPage]);

  if (loading && !data) {
    return (
      <p className="text-center text-gray-500 py-10">Loading questions...</p>
    );
  }

  if (!data) return null;

  const { data: questions, totalCount, totalPages } = data;
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;

  return (
    <div className="p-4 max-w-5xl mx-auto mb-16">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate(`../question-bank/${subjectId}`)}
        >
          <ArrowLeft size={16} /> Back to Chapters
        </Button>
        <h1 className="text-2xl font-bold text-primary flex-1 text-center">
          Questions
        </h1>
        <div className="w-32"></div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 px-6 py-2 rounded-full border bg-blue-50 border-blue-200 text-blue-700 text-sm font-semibold">
          <BookOpen size={16} /> Total Questions: {totalCount}
        </div>
      </div>

      {questions.length === 0 && (
        <div className="text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No questions found in this chapter.</p>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, index) => {
          const questionNumber = startIndex + index + 1;

          return (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
            >
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-base font-medium text-gray-800">
                    <span className="text-primary font-bold mr-2">
                      Q{questionNumber}.
                    </span>
                    {renderMathText(question.questionText)}
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ml-4
                    ${
                      question.difficulty === "EASY"
                        ? "bg-green-100 text-green-700"
                        : question.difficulty === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>

                <ImagePreview
                  imagePath={question.imageUrl}
                  alt={`Question ${questionNumber}`}
                  className="mt-3 max-h-40"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {(question.options || []).map((opt) => {
                  const isCorrect = question.correctAns.includes(opt.index);

                  let rowCls = "bg-gray-50 border-gray-200 text-gray-600";
                  if (isCorrect)
                    rowCls =
                      "bg-green-50 border-green-200 text-green-800 font-medium";

                  let badgeCls = "bg-gray-300 text-gray-600";
                  if (isCorrect) badgeCls = "bg-green-500 text-white";

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm border transition-colors ${rowCls}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}`}
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
                        <span className="ml-auto text-green-600 text-xs font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={16} /> Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Solution */}
              {question.solutionDescription && (
                <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Solution Explanation
                  </p>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {renderMathText(question.solutionDescription)}
                  </div>
                  <ImagePreview
                    imagePath={question.solutionUrl}
                    alt="Solution Image"
                    className="mt-3 max-h-40 rounded"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={QUESTIONS_PER_PAGE}
            onPageChange={setCurrentPage}
            showPerPage={false}
          />
        </div>
      )}
    </div>
  );
};

export default StudentQuestions;
