import { useState, useEffect, useCallback } from "react";
import api from "../../Api";
import DataTable from "./DataTable";
import Button from "./Button";
import { useToast } from "../../useToast";
import { Plus, X, Edit2 } from "lucide-react";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

const formatTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const callFromOptions = [
  { value: "Organization", label: "Call From Organization" },
  { value: "Student", label: "Call From Student" },
];

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
  const [callFrom, setCallFrom] = useState("Organization");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editCallFrom, setEditCallFrom] = useState("Organization");
  const [savingEdit, setSavingEdit] = useState(false);

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
      setCallFrom("Organization");
      setEditingId(null);
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
          ? { note: note.trim(), visitingId: targetId, callFrom }
          : { note: note.trim(), studentId: targetId, callFrom };
      await api.post("/followup", payload);
      successToast("Follow-up added");
      setNote("");
      setCallFrom("Organization");
      fetchFollowups();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to add follow-up");
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditNote(row.note);
    setEditCallFrom(row.callFrom || "Organization");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNote("");
    setEditCallFrom("Organization");
  };

  const handleSaveEdit = async (row) => {
    if (!editNote.trim()) {
      errorToast("Please enter a note");
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/followup/${row.id}`, {
        note: editNote.trim(),
        callFrom: editCallFrom,
      });
      successToast("Follow-up updated");
      setEditingId(null);
      fetchFollowups();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update follow-up");
    } finally {
      setSavingEdit(false);
    }
  };

  const renderCallFromBadge = (value) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        value === "Student"
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {value}
    </span>
  );

  const columns = [
    {
      header: "Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Time",
      render: (row) => formatTime(row.createdAt),
    },
    {
      header: "Call From",
      render: (row) => renderCallFromBadge(row.callFrom || "Organization"),
    },
    {
      header: "Note",
      render: (row) =>
        editingId === row.id ? (
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            className="w-full min-w-52 p-1 border border-gray-300 rounded text-sm"
            maxLength={500}
            autoFocus
          />
        ) : (
          <span className="text-left min-w-[200px] block">{row.note}</span>
        ),
    },
    {
      header: "Call From (Edit)",
      render: (row) =>
        editingId === row.id ? (
          <select
            value={editCallFrom}
            onChange={(e) => setEditCallFrom(e.target.value)}
            className="w-full p-1 border border-gray-300 rounded text-sm"
          >
            {callFromOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          renderCallFromBadge(row.callFrom || "Organization")
        ),
    },
    {
      header: "Added By",
      render: (row) => row.addedByUser?.name || row.addedByUser?.uuid || "—",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          {editingId === row.id ? (
            <>
              <Button
                variant="success"
                size="sm"
                loading={savingEdit}
                onClick={() => handleSaveEdit(row)}
                startIcon={<Plus size={14} />}
              >
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEditClick(row)}
              startIcon={<Edit2 size={14} />}
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-lg">
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
          <select
            value={callFrom}
            onChange={(e) => setCallFrom(e.target.value)}
            className="w-full sm:w-48 p-2 border border-gray-300 rounded"
          >
            {callFromOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
