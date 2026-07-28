import { useEffect, useState } from "react";
import api from "../../Api";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../Generic/Pagination";
import { BookOpen, CheckCircle2 } from "lucide-react";
import ImagePreview from "../Generic/ImagePreview";
import renderMathText from "../Generic/RenderMathText";
import Button from "../Generic/Button";

const QUESTIONS_PER_PAGE = 5;

const StudentQuizView = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSolutions = async () => {
    try {
      const res = await api.get(`/quiz/student/solutions/${quizId}`);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching quiz solutions");
      navigate("../quizzes");
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [quizId]);

  if (!data)
    return (
      <div className="p-2 container mx-auto">
        <p className="text-center text-gray-400 py-10">Loading...</p>
      </div>
    );

  const { quiz, questions } = data;
  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  return (
    <>
      <div className="p-2 container mx-auto mb-16">
        <div className="flex items-center justify-between mb-4">
          <Button variant="secondary" onClick={() => navigate("../quizzes")}>Back</Button>
          <h1 className="text-3xl text-center font-bold text-primary flex-1">
            Quiz Solutions
          </h1>
          <div className="w-20"></div>{/* Spacer */}
        </div>
        
        <p className="text-center text-sm font-semibold text-gray-700 mb-6">
          {quiz.title} - {quiz.quizDate}
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <div className="flex flex-col gap-1 px-6 py-3 rounded-xl border bg-blue-50 border-blue-200 text-blue-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
              <BookOpen size={18} /> Total Questions
            </div>
            <p className="text-2xl font-bold">{totalQuestions}</p>
          </div>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-4">
          {currentQuestions.map((q, index) => {
            const question = q.Question;
            const questionNumber = startIndex + index + 1;

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
              >
                {/* Question header */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-800">
                    <span className="text-primary font-bold mr-1">
                      Q{questionNumber}.
                    </span>
                    {renderMathText(question.questionText)}
                  </div>

                  <ImagePreview
                    imagePath={question.imageUrl}
                    alt={`Question ${questionNumber}`}
                    className="mt-3 max-h-40"
                  />
                </div>

                {/* Options */}
                <div className="space-y-1.5">
                  {(question.options || []).map((opt) => {
                    const isCorrect = question.correctAns.includes(opt.index);

                    let rowCls = "bg-white border-gray-200 text-gray-600";
                    if (isCorrect)
                      rowCls = "bg-green-50 border-green-200 text-green-800 font-medium";

                    let badgeCls = "bg-gray-200 text-gray-500";
                    if (isCorrect) badgeCls = "bg-green-500 text-white";

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
                      </div>
                    );
                  })}
                </div>

                {/* Solution */}
                {question.solutionDescription && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                      Solution Explanation
                    </p>
                    <div className="text-sm text-gray-700">{renderMathText(question.solutionDescription)}</div>
                    <ImagePreview
                      imagePath={question.solutionUrl}
                      alt="Solution Image"
                      className="mt-3 max-h-40"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalQuestions}
            itemsPerPage={QUESTIONS_PER_PAGE}
            onPageChange={setCurrentPage}
            showPerPage={false}
          />
        </div>
      </div>
    </>
  );
};

export default StudentQuizView;
