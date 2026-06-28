import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Eye, ListChecks } from "lucide-react";
import api from "../../Api";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";

const STATUS_BADGE = {
  SUBMITTED: "bg-green-100 text-green-700",
  AUTO_SUBMITTED: "bg-yellow-100 text-yellow-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      STATUS_BADGE[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status === "AUTO_SUBMITTED" ? "AUTO SUBMITTED" : status}
  </span>
);

const StudentAttemptsTable = ({ quizId }) => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // debounce search input -> search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/quiz/${quizId}/analytics/students`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: search || undefined,
        },
      });

      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attempts");
    } finally {
      setLoading(false);
    }
  }, [quizId, currentPage, itemsPerPage, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleViewResult = (row) => {
    // StudentQuizResult route - update path once that page is built
    navigate(`../${quizId}/attempt/${row.studentQuizId}`);
  };

  // NOTE: this exports only the current page, since listing is server-paginated.
  // If a full export is needed, add a dedicated backend export endpoint
  // (e.g. GET /quiz/:quizId/analytics/export) instead of fetching all pages client-side.
  const handleExportExcel = () => {
    const csv = [
      ["Student ID", "Student Name", "Marks", "Status", "Date"],
      ...students.map((s) => [
        s.studentId,
        s.studentName,
        s.marks,
        s.status,
        new Date(s.date).toLocaleDateString("en-GB"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz_attempts.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Student ID",
      accessor: "studentId",
    },
    {
      header: "Student Name",
      render: (row) => (
        <span className="font-medium text-gray-800">{row.studentName}</span>
      ),
    },
    {
      header: "Marks",
      render: (row) => <span className="font-semibold">{row.marks}</span>,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      render: (row) => new Date(row.date).toLocaleDateString("en-GB"),
    },
    {
      header: "Action",
      render: (row) => (
        <Button
          onClick={() => handleViewResult(row)}
          variant="secondary"
          startIcon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ListChecks className="text-gray-600" size={20} />
          Attempts
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <Button
            onClick={handleExportExcel}
            variant="success"
            startIcon={<FileSpreadsheet size={16} />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        error={error}
        rowKey="studentQuizId"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default StudentAttemptsTable;
