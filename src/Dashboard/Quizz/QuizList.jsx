import { useEffect, useState } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import DataTable from "../Generic/DataTable";
import Button from "../Generic/Button";
import CustomSelect from "../Generic/CustomSelect";
import { useNavigate } from "react-router-dom";

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [demoStandard, setDemoStandard] = useState(null);

  const handleAnalytics = (quiz) => {
    navigate(`./${quiz.id}/analytics`);
  };

  // ---------------- FETCH STANDARDS ----------------
  const fetchStandards = async () => {
    try {
      const res = await api.get("/simple/standards");

      const options = res.data.data.map((std) => ({
        label: std.normalizeName,
        value: std.id,
      }));

      setStandards(options);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- FETCH QUIZZES ----------------
  const fetchQuizzes = async () => {
    setLoading(true);

    try {
      const res = await api.get("/quiz", {
        params: {
          standardId: selectedStandard?.value,
        },
      });
      // console.log(res);
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedStandard]);

  // ---------------- TABLE ----------------
  const columns = [
    {
      header: "Sr No",
      render: (_, index) => index + 1,
    },
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Standard",
      render: (row) => row.Standard?.name || "-",
    },
    {
      header: "Total Marks",
      accessor: "totalMarks",
    },
    {
      header: "Duration (min)",
      accessor: "duration",
    },
    {
      header: "Date",
      accessor: "quizDate",
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`font-semibold ${
            row.status === "SCHEDULED"
              ? "text-blue-500"
              : row.status === "STARTED"
                ? "text-green-500"
                : row.status === "ENDED"
                  ? "text-gray-500"
                  : "text-yellow-500"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleView(row)}>View</Button>
          {user.role === "admin" && (
            <Button variant="primary" onClick={() => handleEdit(row)}>
              Edit
            </Button>
          )}
          {user.role === "admin" && (
            <Button variant="danger" onClick={() => handleDelete(row)}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={() => handleAnalytics(row)}>
            Stats
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (quiz) => {
    navigate(`${quiz.id}`);
  };

  const handleEdit = () => {
    // console.log("Edit Quiz:", quiz);
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Delete quiz "${quiz.title}"?`)) return;

    try {
      await api.delete(`/quiz/${quiz.id}`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center mb-6">
        Quiz Management
      </h1>

      {/* ---------------- FILTER ---------------- */}
      <div className="mb-4 w-full md:w-1/3">
        <CustomSelect
          options={standards}
          value={selectedStandard}
          onChange={setSelectedStandard}
          placeholder="Filter by Standard"
        />
      </div>

      {/* ---------------- ADD BUTTON ---------------- */}
      {user.role === "admin" && (
        <div className="flex justify-end mb-4">
          <Button variant="success" onClick={() => navigate("create")}>
            + Create Quiz
          </Button>
        </div>
      )}

      {/* ---------------- DEMO QUIZ ---------------- */}
      <div className="flex flex-wrap flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700">
            Practice Demo Quiz
          </p>
          <p className="text-xs text-gray-400">
            20 random questions, 30 min timer. No results saved.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <CustomSelect
            options={standards}
            value={demoStandard}
            onChange={setDemoStandard}
            placeholder="Select Standard"
          />
          <Button
            variant="primary"
            disabled={!demoStandard}
            onClick={() =>
              navigate(`demo/play?standardId=${demoStandard.value}`)
            }
          >
            Start Demo
          </Button>
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <DataTable
        columns={columns}
        data={quizzes}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default QuizList;
