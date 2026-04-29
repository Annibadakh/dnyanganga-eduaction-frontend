import { useEffect, useState } from "react";
import api from "../../Api";
import DataTable from "../Generic/DataTable";
import Button from "../Generic/Button";
import CustomSelect from "../Generic/CustomSelect";
import { useNavigate } from "react-router-dom";

const QuizList = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);

  // ---------------- FETCH STANDARDS ----------------
  const fetchStandards = async () => {
    try {
      const res = await api.get("/simple/standards");

      const options = res.data.data
        .filter((std) => !std.baseStandardId)
        .map((std) => ({
          label: std.name,
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
      console.log(res);
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
          <Button variant="primary" onClick={() => handleEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (quiz) => {
    navigate(`${quiz.id}`);
  };

  const handleEdit = (quiz) => {
    console.log("Edit Quiz:", quiz);
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
      <div className="flex justify-end mb-4">
        <Button variant="success" onClick={() => navigate("create")}>
          + Create Quiz
        </Button>
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
