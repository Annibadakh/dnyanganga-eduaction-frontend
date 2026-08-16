import { useState, useEffect, useCallback } from "react";
import api from "../../Api";
import DataTable from "./DataTable";
import Button from "./Button";
import { useToast } from "../../useToast";
import { Plus, X } from "lucide-react";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB") : "—";

const formatTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FollowupModal = ({
  isOpen,
  onClose,
  targetType = "student",
  targetId,
  title = "Follow Ups",
}) => {
  const { successToast, errorToast } = useToast();

  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchFollowups = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const params =
        targetType === "visiting"
          ? { visitingId: targetId }
          : { studentId: targetId };
      const { data } = await api.get("/followup", { params });
      setRows(data?.data || []);
    } catch {
      errorToast("Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType, errorToast]);

  useEffect(() => {
    if (isOpen) {
      setNote("");
      fetchFollowups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetId, targetType]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!note.trim()) {
      errorToast("Please enter a note");
      return;
    }
    setAdding(true);
    try {
      const payload =
        targetType === "visiting"
          ? { note: note.trim(), visitingId: targetId }
          : { note: note.trim(), studentId: targetId };
      await api.post("/followup", payload);
      successToast("Follow-up added");
      setNote("");
      fetchFollowups();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to add follow-up");
    } finally {
      setAdding(false);
    }
  };

  const columns = [
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Time",
      render: (row) => formatTime(row.createdAt),
    },
    { header: "Note", accessor: "note", cellClass: "text-left min-w-[200px]" },
    {
      header: "Added By",
      render: (row) =>
        row.addedByUser?.name || row.addedByUser?.uuid || "—",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[92vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold truncate">
              {title}
            </h2>
            <p className="text-sm text-gray-600">
              {targetType === "visiting"
                ? `Visiting ID: ${targetId}`
                : `Student ID: ${targetId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add follow-up form */}
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row gap-2 p-4 border-b bg-white"
        >
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a follow-up note..."
            className="flex-1 p-2 border border-gray-300 rounded"
            maxLength={500}
          />
          <Button
            type="submit"
            variant="primary"
            loading={adding}
            startIcon={<Plus size={16} />}
          >
            Add Follow-up
          </Button>
        </form>

        {/* Follow-ups list */}
        <div className="flex-1 overflow-y-auto p-4">
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            rowKey="id"
            emptyMessage="No follow-ups added yet."
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FollowupModal;