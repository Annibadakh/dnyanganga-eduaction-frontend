import React, { useState, useEffect } from "react";
import api from "../../Api";
import JobCreation from "./JobCreation";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/jobs");

      if (response.data.success) {
        setJobs(response.data.data);
        // console.log('Fetched jobs:', response.data.data);
      }
    } catch (err) {
      setError("Failed to load jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      setLoading(true);

      const response = await api.delete(`/jobs/${jobId}`);

      if (response.data.success) {
        alert("Job deleted successfully!");
        setDeleteConfirm(null);
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

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-custom max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary">WhatsApp Jobs</h1>
          <p className="text-gray-600 text-sm mt-1">
            View all scheduled messaging jobs
          </p>
        </div>

        {/* ✅ Create Job Button */}
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          + Create Job
        </button>
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
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <React.Fragment key={job.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {job.job_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {job.Template?.name || "-"}
                      </div>
                      {job.Template?.language && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
                          {job.Template.language.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-primary">
                        {job.total_receivers}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-600">
                        {job.delivered_count ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-yellow-600">
                        {job.pending_count ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(job.schedule_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.job_status)}`}
                      >
                        {formatStatusLabel(job.job_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600">
                          {job.scheduler_status || "-"}
                        </span>

                        {job.scheduler_status === "failed" && (
                          <>
                            {job.scheduler_error && (
                              <span
                                className="text-xs text-red-600 max-w-[160px] truncate"
                                title={job.scheduler_error}
                              >
                                {job.scheduler_error}
                              </span>
                            )}

                            <button
                              onClick={() => handleRetryScheduler(job.id)}
                              disabled={retryingJobId === job.id}
                              className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 font-medium disabled:opacity-50 w-fit"
                            >
                              {retryingJobId === job.id
                                ? "Retrying..."
                                : "Retry Scheduler"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(job.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteConfirm(job.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* Delete Confirmation Row */}
                  {deleteConfirm === job.id && (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 bg-red-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-800 font-medium">
                            Are you sure you want to delete "{job.job_name}"?
                            This will also delete all pending receivers.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              disabled={loading}
                            >
                              {loading ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobsList;
