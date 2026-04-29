import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";

const StudentQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quiz/student/scheduled");
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-4">
        Scheduled Quizzes
      </h1>

      {loading && <p>Loading...</p>}

      {quizzes.length === 0 && !loading && (
        <p>No scheduled quizzes available</p>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">{quiz.title}</h2>

              <p className="text-sm text-gray-600">Date: {quiz.quizDate}</p>

              <p className="text-sm text-gray-600">
                Time: {quiz.startTime} - {quiz.endTime}
              </p>

              <p className="text-sm text-gray-600">
                Duration: {quiz.duration} min
              </p>
            </div>

            <Button variant="primary">Start</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentQuizList;
