import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import DataTable from "../../Dashboard/Generic/DataTable";
import Pagination from "../../Dashboard/Generic/Pagination";
import { useToast } from "../../useToast";
import videoApi, { apiMessage } from "../videoApi";
import { formatBytes, formatDuration } from "../uploadVideo";
import { useVideoStandards } from "./useVideoStandards";
import VideoUploadPanel from "./VideoUploadPanel";
import VideoPreviewModal from "./VideoPreviewModal";

const STATUS_STYLE = {
  uploading: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};
const STATUS_LABEL = { uploading: "Uploading", processing: "Converting", ready: "Ready", failed: "Failed" };
const REFRESH_MS = 15000;

// Admin → Videos: upload, follow the conversion, edit, preview, delete.
const Videos = () => {
  const { successToast, errorToast } = useToast();
  const { options: standardOptions } = useVideoStandards();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [standardId, setStandardId] = useState("");
  const [status, setStatus] = useState("");
  const [active, setActive] = useState(""); // "", "true", "false"
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null); // { id, title, standardId }
  const [busy, setBusy] = useState(null); // video id with an action running

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchVideos = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const { data } = await videoApi.get("/admin/videos", {
          params: {
            page,
            limit,
            standardId: standardId || undefined,
            status: status || undefined,
            active: active || undefined,
            search: debouncedSearch || undefined,
          },
        });
        setVideos(data.videos);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages || 1);
      } catch (error) {
        if (!quiet) errorToast(apiMessage(error, "Couldn't load videos"));
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [page, limit, standardId, status, active, debouncedSearch], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => setPage(1), [standardId, status, active, debouncedSearch, limit]);

  // while something is converting, refresh quietly so it turns "Ready" by itself
  const pending = videos.some((v) => v.status === "processing" || v.status === "uploading");
  useEffect(() => {
    if (!pending) return undefined;
    const t = setInterval(() => fetchVideos(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [pending, fetchVideos]);

  const run = async (id, action, okMessage) => {
    setBusy(id);
    try {
      await action();
      successToast(okMessage);
      fetchVideos(true);
    } catch (error) {
      errorToast(apiMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const remove = (row) => {
    if (!window.confirm(`Delete "${row.title}"? The video and all its qualities are removed for good.`)) return;
    run(row.id, () => videoApi.delete(`/admin/videos/${row.id}`), "Video deleted");
  };

  // Inactive videos are hidden from video users (and can't be played); admin can still preview them
  const toggleActive = (row) =>
    run(
      row.id,
      () => videoApi.put(`/admin/videos/${row.id}`, { isActive: !row.isActive }),
      row.isActive ? "Video deactivated" : "Video activated",
    );

  const saveEdit = async () => {
    const title = editing.title.trim();
    if (title.length < 2) return errorToast("Title must be at least 2 characters");
    await run(
      editing.id,
      () => videoApi.put(`/admin/videos/${editing.id}`, { title, standardId: Number(editing.standardId) }),
      "Video updated",
    );
    setEditing(null);
  };

  const columns = [
    { header: "Sr. No.", render: (_, i) => (page - 1) * limit + i + 1 },
    { header: "Title", render: (row) => <span className="font-medium text-left block max-w-xs mx-auto">{row.title}</span> },
    { header: "Standard", render: (row) => row.standard?.name || "-" },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[row.status]}`}
          title={row.errorMessage || undefined}
        >
          {row.status === "processing" && <Loader2 size={12} className="animate-spin" />}
          {STATUS_LABEL[row.status]}
        </span>
      ),
    },
    {
      header: "Active",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    { header: "Duration", render: (row) => formatDuration(row.durationSeconds) },
    { header: "Size", render: (row) => formatBytes(row.sizeBytes) },
    {
      header: "Added",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap justify-center gap-2">
          {row.status === "ready" && (
            <button onClick={() => setPreview(row)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md">
              Play
            </button>
          )}
          <button
            onClick={() => setEditing({ id: row.id, title: row.title, standardId: row.standard?.id || "" })}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
          >
            Edit
          </button>
          <button
            onClick={() => toggleActive(row)}
            disabled={busy === row.id}
            className={`px-3 py-1 rounded-md text-white disabled:opacity-50 ${row.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
          {row.status === "failed" && (
            <button
              onClick={() => run(row.id, () => videoApi.post(`/admin/videos/${row.id}/retry`), "Conversion started again")}
              disabled={busy === row.id}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded-md disabled:opacity-50"
            >
              Retry
            </button>
          )}
          {row.status !== "processing" && (
            <button
              onClick={() => remove(row)}
              disabled={busy === row.id}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">Videos</h1>

      {!showUpload && (
        <button onClick={() => setShowUpload(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Upload Video
        </button>
      )}
      {showUpload && (
        <VideoUploadPanel
          standardOptions={standardOptions}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            fetchVideos();
          }}
        />
      )}

      <div className="mt-6 md:p-6 p-2 bg-white shadow-custom">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
          <div className="w-full md:w-72">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 h-[42px] w-full text-sm"
            />
          </div>
          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
            <select
              value={standardId}
              onChange={(e) => setStandardId(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
            >
              <option value="">All Standards</option>
              {standardOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="ready">Ready</option>
              <option value="processing">Converting</option>
              <option value="uploading">Uploading</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={videos} loading={loading} rowKey="id" emptyMessage="No videos yet." />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      </div>

      {preview && <VideoPreviewModal video={preview} onClose={() => setPreview(null)} />}

      {editing &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-3" onClick={() => setEditing(null)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="bg-primary text-white text-center py-3 rounded-t-lg">
                <h2 className="text-lg font-bold">Edit Video</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 h-[42px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
                  <select
                    value={editing.standardId}
                    onChange={(e) => setEditing((p) => ({ ...p, standardId: e.target.value }))}
                    className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
                  >
                    {standardOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditing(null)} className="w-1/3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={busy === editing.id}
                    className="flex-1 py-2 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Videos;
