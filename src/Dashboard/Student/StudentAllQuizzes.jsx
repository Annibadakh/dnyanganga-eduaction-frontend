import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate } from "react-router-dom";
import Pagination from "../Generic/Pagination";

const QUIZZES_PER_PAGE = 10;

const StudentAllQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quiz/student/all-quizzes");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleStart = (quiz) => {
    navigate(`../play/${quiz.id}`);
  };

  const handleView = (quiz) => {
    navigate(`../view-quiz/${quiz.id}`);
  };

  const handleViewResult = (quiz) => {
    navigate(`../result/${quiz.studentQuizId}`);
  };

  const renderButtons = (quiz) => {
    const now = new Date();
    // Assuming quizDate is YYYY-MM-DD and endTime is HH:mm:ss or similar
    const startDateTime = new Date(`${quiz.quizDate} ${quiz.startTime}`);
    const endDateTime = new Date(`${quiz.quizDate} ${quiz.endTime}`);

    const hasEnded = now > endDateTime;
    const hasStarted = now >= startDateTime;

    if (hasEnded) {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => handleView(quiz)}>
            View
          </Button>
          {quiz.studentStatus !== "UNATTEMPTED" && quiz.studentQuizId && (
            <Button variant="primary" onClick={() => handleViewResult(quiz)}>
              Result
            </Button>
          )}
        </div>
      );
    } else {
      if (!hasStarted) {
        return (
          <Button variant="secondary" disabled>
            Upcoming
          </Button>
        );
      } else {
        if (quiz.studentStatus === "UNATTEMPTED") {
          return (
            <Button variant="primary" onClick={() => handleStart(quiz)}>
              Start
            </Button>
          );
        } else if (quiz.studentStatus === "STARTED") {
          return (
            <Button variant="warning" onClick={() => handleStart(quiz)}>
              Resume
            </Button>
          );
        } else {
          return (
            <Button variant="success" disabled>
              Completed
            </Button>
          );
        }
      }
    }
  };

  const totalQuizzes = quizzes.length;
  const totalPages = Math.ceil(totalQuizzes / QUIZZES_PER_PAGE);
  const startIndex = (currentPage - 1) * QUIZZES_PER_PAGE;
  const currentQuizzes = quizzes.slice(
    startIndex,
    startIndex + QUIZZES_PER_PAGE,
  );

  return (
    <div className="p-4 max-w-5xl mx-auto mb-16">
      <h1 className="text-2xl font-bold text-primary mb-4">Quizzes</h1>

      {loading && <p>Loading...</p>}

      {quizzes.length === 0 && !loading && <p>No quizzes available</p>}

      <div className="space-y-4">
        {currentQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md"
          >
            <div className="w-full md:w-auto">
              <h2 className="font-semibold text-xl text-gray-800">
                {quiz.title}
              </h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Date:</span> {quiz.quizDate}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {quiz.startTime} -{" "}
                  {quiz.endTime}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {quiz.duration}{" "}
                  min
                </p>
                <p>
                  <span className="font-medium">Total Marks:</span>{" "}
                  {quiz.totalMarks}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full
                  ${
                    quiz.studentStatus === "UNATTEMPTED"
                      ? "bg-gray-100 text-gray-600"
                      : quiz.studentStatus === "STARTED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {quiz.studentStatus.replace("_", " ")}
                </span>

                {quiz.studentStatus !== "UNATTEMPTED" && (
                  <span className="text-sm ml-2 font-semibold text-primary">
                    Marks: {quiz.marksObtained}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 md:mt-0 w-full md:w-auto">
              {renderButtons(quiz)}
            </div>
          </div>
        ))}
      </div>

      {totalQuizzes > QUIZZES_PER_PAGE && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalQuizzes}
            itemsPerPage={QUIZZES_PER_PAGE}
            onPageChange={setCurrentPage}
            showPerPage={false}
          />
        </div>
      )}
    </div>
  );
};

export default StudentAllQuizzes;
