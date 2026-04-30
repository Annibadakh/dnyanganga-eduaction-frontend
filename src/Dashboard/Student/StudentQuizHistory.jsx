import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import { useNavigate } from "react-router-dom";

const StudentQuizHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quiz/student/history");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">

      <h1 className="text-2xl text-center font-bold text-primary mb-4">
        Attempt History
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && (
        <p>No attempts found</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border rounded">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Duration</th>
              <th className="p-2 border">Questions</th>
              <th className="p-2 border">Marks</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((q) => (
              <tr key={q.studentQuizId} className="text-center">

                <td className="p-2 border">{q.title}</td>
                <td className="p-2 border">{q.quizDate}</td>
                <td className="p-2 border">{q.duration} min</td>
                <td className="p-2 border">{q.totalQuestions}</td>

                <td className="p-2 border font-semibold">
                  {q.marksObtained}
                </td>

                <td className="p-2 border">
                  <span
                    className={`font-semibold ${
                      q.status === "SUBMITTED"
                        ? "text-green-500"
                        : q.status === "AUTO_SUBMITTED"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {q.status}
                  </span>
                </td>

                <td className="p-2 border">
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(`../result/${q.studentQuizId}`)
                    }
                  >
                    View Result
                  </Button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default StudentQuizHistory;