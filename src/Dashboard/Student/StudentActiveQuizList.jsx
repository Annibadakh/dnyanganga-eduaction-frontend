import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate } from "react-router-dom";

const StudentActiveQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quiz/student/active");
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

  // ---------------- HANDLE START ----------------
  const handleStart = (quiz) => {
    navigate(`../play/${quiz.id}`);
  };

  // ---------------- BUTTON LOGIC ----------------
  const renderButton = (quiz) => {
    if (quiz.status === "SCHEDULED") {
      return (
        <Button variant="secondary" disabled>
          Not Started
        </Button>
      );
    }

    if (quiz.status === "STARTED") {
      if (quiz.studentStatus === "NOT_STARTED") {
        return (
          <Button
            variant="primary"
            onClick={() => handleStart(quiz)}
          >
            Start
          </Button>
        );
      }

      if (quiz.studentStatus === "STARTED") {
        return (
          <Button
            variant="warning"
            onClick={() => handleStart(quiz)}
          >
            Resume
          </Button>
        );
      }

      if (
        quiz.studentStatus === "SUBMITTED" ||
        quiz.studentStatus === "AUTO_SUBMITTED"
      ) {
        return (
          <Button variant="success" disabled>
            Completed
          </Button>
        );
      }
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold text-primary mb-4">
        Active Quizzes
      </h1>

      {loading && <p>Loading...</p>}

      {quizzes.length === 0 && !loading && (
        <p>No quizzes available</p>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">
                {quiz.title}
              </h2>

              <p className="text-sm text-gray-600">
                Date: {quiz.quizDate}
              </p>

              <p className="text-sm text-gray-600">
                Time: {quiz.startTime} - {quiz.endTime}
              </p>

              <p className="text-sm text-gray-600">
                Duration: {quiz.duration} min
              </p>

              <p className="text-sm mt-1">
                Status:{" "}
                <span className="font-semibold">
                  {quiz.status}
                </span>
              </p>
            </div>

            {renderButton(quiz)}

          </div>
        ))}
      </div>

    </div>
  );
};

export default StudentActiveQuizList;