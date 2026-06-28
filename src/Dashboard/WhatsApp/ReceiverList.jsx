import { useState, useEffect } from "react";
import api from "../../Api";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import Button from "../Generic/Button";

const ReceiverList = ({ jobId, onBack }) => {
  const [job, setJob] = useState(null);
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Phone Number",
      accessor: "phone_number",
    },
    {
      header: "Status",
      render: (row) =>
        row.delivered ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            DELIVERED
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            PENDING
          </span>
        ),
    },
  ];

  const fetchReceivers = () => {
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    api
      .get(`/jobs/${jobId}/receivers`, { params })
      .then((response) => {
        if (response.data.success) {
          setJob(response.data.job);
          setReceivers(response.data.receivers);
          setTotalCount(response.data.totalCount);
          setTotalPages(response.data.totalPages);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching receivers:", err);
        setError("Failed to load receivers");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReceivers();
  }, [jobId, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (jobStatus) => {
    switch (jobStatus) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "scheduler_failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-2 container mx-auto">
      <div className="mb-4">
        <Button variant="secondary" onClick={onBack}>
          ← Back to Jobs
        </Button>
      </div>

      {/* Job Details Header */}
      {job && (
        <div className="p-6 bg-white shadow-custom mb-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary">
                {job.job_name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Template: {job.Template?.name || "-"}
                {job.Template?.language && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">
                    {job.Template.language.toUpperCase()}
                  </span>
                )}
              </p>
            </div>

            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(job.job_status)}`}
            >
              {job.job_status
                ? job.job_status.replace(/_/g, " ").toUpperCase()
                : "-"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Scheduled Date
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatDate(job.schedule_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Total Records
              </p>
              <p className="text-sm font-semibold text-primary mt-1">
                {job.total_receivers}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Delivered
              </p>
              <p className="text-sm font-semibold text-green-600 mt-1">
                {job.delivered_count}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-sm font-semibold text-yellow-600 mt-1">
                {job.pending_count}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Scheduler Status
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {job.scheduler_status || "-"}
              </p>
              {job.scheduler_status === "failed" && job.scheduler_error && (
                <p
                  className="text-xs text-red-600 mt-1 max-w-[200px] truncate"
                  title={job.scheduler_error}
                >
                  {job.scheduler_error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receiver Table */}
      <DataTable
        columns={columns}
        data={receivers}
        loading={loading}
        error={error}
        rowKey="id"
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

export default ReceiverList;
