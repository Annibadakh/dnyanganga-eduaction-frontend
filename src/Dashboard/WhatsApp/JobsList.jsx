import React, { useState, useEffect } from "react";
import api from "../../Api";
import JobCreation from "./JobCreation";
import ReceiverList from "./ReceiverList";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import Button from "../Generic/Button";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState(null);
  const [viewingJobId, setViewingJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    job: null,
  });

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Job Name",
      accessor: "job_name",
    },
    {
      header: "Template",
      render: (row) => row.Template?.name || "-",
    },
    {
      header: "Language",
      render: (row) => row.Template?.language?.toUpperCase() || "-",
    },
    {
      header: "Total Records",
      accessor: "total_receivers",
    },
    {
      header: "Delivered",
      accessor: "delivered_count",
    },
    {
      header: "Pending",
      accessor: "pending_count",
    },
    {
      header: "Scheduled Date",
      render: (row) => formatDate(row.schedule_date),
    },
    {
      header: "Job Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(
            row.job_status,
          )}`}
        >
          {formatStatusLabel(row.job_status)}
        </span>
      ),
    },
    {
      header: "Scheduler Status",
      render: (row) => row.scheduler_status || "-",
    },
    {
      header: "Scheduler Failed Reason",
      render: (row) =>
        row.scheduler_status === "failed" ? row.scheduler_error || "-" : "-",
    },
    {
      header: "Created",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex items-center gap-2 flex-nowrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setViewingJobId(row.id)}
          >
            View
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              setDeleteDialog({
                open: true,
                job: row,
              })
            }
          >
            Delete
          </Button>

          {row.scheduler_status === "failed" && (
            <Button
              size="sm"
              variant="warning"
              loading={retryingJobId === row.id}
              onClick={() => handleRetryScheduler(row.id)}
            >
              Retry
            </Button>
          )}
        </div>
      ),
    },
  ];

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      job: null,
    });
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, itemsPerPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/jobs", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      if (response.data.success) {
        setJobs(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (err) {
      setError("Failed to load jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.job) return;

    try {
      setLoading(true);

      const response = await api.delete(`/jobs/${deleteDialog.job.id}`);

      if (response.data.success) {
        alert("Job deleted successfully!");
        closeDeleteDialog();
        fetchJobs();
      }
    } catch (err) {
      alert("Failed to delete job");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryScheduler = async (jobId) => {
    try {
      setRetryingJobId(jobId);

      const response = await api.post(`/jobs/${jobId}/retry-scheduler`);

      if (response.data.success) {
        alert("Scheduler retried successfully!");
        fetchJobs();
      } else {
        alert(response.data.message || "Failed to retry scheduler");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to retry scheduler");
      console.error(err);
    } finally {
      setRetryingJobId(null);
    }
  };

  // job_status from backend: "scheduled" | "sending" | "done" | "scheduler_failed"
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

  const formatStatusLabel = (jobStatus) => {
    if (!jobStatus) return "-";
    return jobStatus.replace(/_/g, " ").toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (showCreate) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setShowCreate(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to Jobs
          </button>
        </div>

        <JobCreation />
      </div>
    );
  }

  if (viewingJobId) {
    return (
      <ReceiverList jobId={viewingJobId} onBack={() => setViewingJobId(null)} />
    );
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-2 shadow-custom max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl text-center font-bold text-primary">
          WhatsApp Jobs
        </h1>

        {/* ✅ Create Job Button */}
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          + Create Job
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg">No jobs found</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first WhatsApp job to get started
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={jobs}
            loading={loading}
            error={error}
            rowKey="id"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Delete Job
              </h2>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-700">
                Are you sure you want to delete
                <span className="font-semibold">
                  {" "}
                  "{deleteDialog.job?.job_name}"
                </span>
                ?
              </p>

              <p className="mt-2 text-sm text-red-600">
                This action will permanently delete the job and all pending
                receivers. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <Button variant="secondary" onClick={closeDeleteDialog}>
                Cancel
              </Button>

              <Button variant="danger" loading={loading} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
