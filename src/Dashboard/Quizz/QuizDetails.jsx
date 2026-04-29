import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api";
import Button from "../Generic/Button";

const QuizDetails = () => {
  const { id } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${id}`);
      console.log(res)
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!quiz) return <p>No data</p>;

  // ---------------- CALCULATE ----------------
  const totalQuestions = quiz.quizChapters.reduce(
    (sum, ch) => sum + ch.queCount,
    0
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">

      {/* ---------------- HEADER ---------------- */}
      <h1 className="text-3xl font-bold text-primary mb-4">
        {quiz.title}
      </h1>

      {/* ---------------- BASIC INFO ---------------- */}
      <div className="bg-white p-4 rounded shadow mb-4">

        <p><strong>Standard:</strong> {quiz.Standard?.name}</p>
        <p><strong>Type:</strong> {quiz.selectionType}</p>
        <p><strong>Status:</strong> {quiz.status}</p>

      </div>

      {/* ---------------- CONFIG ---------------- */}
      <div className="bg-white p-4 rounded shadow mb-4">

        <p><strong>Marks per Question:</strong> {quiz.marksPerQue}</p>
        <p><strong>Total Questions:</strong> {totalQuestions}</p>
        <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
        <p><strong>Duration:</strong> {quiz.duration} min</p>

        <p>
          <strong>Date:</strong> {quiz.quizDate}
        </p>

        <p>
          <strong>Time:</strong> {quiz.startTime} - {quiz.endTime}
        </p>

      </div>

      {/* ---------------- CHAPTER BREAKDOWN ---------------- */}
      <div className="bg-white p-4 rounded shadow mb-4">

        <h2 className="text-xl font-semibold mb-2">
          Chapter Distribution
        </h2>

        {quiz.quizChapters.map((ch) => (
          <div
            key={ch.id}
            className="flex justify-between border-b py-2"
          >
            <span>{ch.Chapter?.name}</span>
            <span>{ch.queCount} questions</span>
          </div>
        ))}

      </div>

      {/* ---------------- FIXED QUESTIONS ---------------- */}
      {quiz.selectionType === "FIXED" && (
        <div className="bg-white p-4 rounded shadow">

          <h2 className="text-xl font-semibold mb-2">
            Questions Preview
          </h2>

          {quiz.quizQuestions.map((qq, index) => {
            const q = qq.Question;

            return (
              <div key={qq.id} className="mb-4 border-b pb-3">

                <p className="font-semibold">
                  {index + 1}. {q.questionText}
                </p>

                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-1 ${
                      q.correctAns.includes(opt.index)
                        ? "bg-green-100"
                        : ""
                    }`}
                  >
                    {opt.index}. {opt.text}
                  </div>
                ))}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default QuizDetails;