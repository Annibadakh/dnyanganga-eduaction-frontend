import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSpreadsheet, Eye, ListChecks } from "lucide-react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import { DashboardContext } from "../../Context/DashboardContext";
import Button from "../Generic/Button";
import CustomSelect from "../Generic/CustomSelect";
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

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "AUTO_SUBMITTED", label: "Auto Submitted" },
];

const SORT_OPTIONS = [
  { value: "", label: "Sort By Marks" },
  { value: "desc", label: "Highest First" },
  { value: "asc", label: "Lowest First" },
];

const StudentAttemptsTable = ({ quizId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { counsellor, counsellorBranch } = useContext(DashboardContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS[0]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
          branch: selectedBranch?.value || undefined,
          counsellor: selectedCounsellor?.value || undefined,
          status: selectedStatus?.value || undefined,
          sortOrder: sortOrder?.value || undefined,
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
  }, [
    quizId,
    currentPage,
    itemsPerPage,
    search,
    selectedCounsellor,
    selectedBranch,
    selectedStatus,
    sortOrder,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleViewResult = (row) => {
    navigate(`../${quizId}/attempt/${row.studentQuizId}`);
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get(`/quiz/${quizId}/analytics/students/export`, {
        params: {
          search: search || undefined,
          branch: selectedBranch?.value || undefined,
          counsellor: selectedCounsellor?.value || undefined,
          status: selectedStatus?.value || undefined,
          sortOrder: sortOrder?.value || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz_attempts_${quizId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export. Please try again.");
    }
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
      header: "Counsellor",
      render: (row) => (
        <span className="text-gray-600">{row.counsellor || "\u2014"}</span>
      ),
    },
    {
      header: "Branch",
      render: (row) => (
        <span className="text-gray-600">{row.branch || "\u2014"}</span>
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
          <Button
            onClick={handleExportExcel}
            variant="success"
            startIcon={<FileSpreadsheet size={16} />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or ID..."
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {(user.role === "admin" || user.role === "followUp") && (
          <>
            <div>
              <CustomSelect
                options={counsellor}
                value={selectedCounsellor}
                onChange={setSelectedCounsellor}
                isRequired={false}
                placeholder="Select Counsellor"
              />
            </div>

            <div>
              <CustomSelect
                options={counsellorBranch}
                value={selectedBranch}
                onChange={setSelectedBranch}
                isRequired={false}
                placeholder="Select Branch"
              />
            </div>
          </>
        )}

        <div>
          <CustomSelect
            options={STATUS_OPTIONS}
            value={selectedStatus}
            onChange={setSelectedStatus}
            isRequired={false}
            placeholder="Status"
          />
        </div>

        <div>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortOrder}
            onChange={(val) => setSortOrder(val)}
            isRequired={false}
            placeholder="Sort by Marks"
          />
        </div>
      </form>

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
