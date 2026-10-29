import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import api from "../../Api";
import { useToast } from "../../useToast";

// Admin → User Management → Add Batch: add a batch, rename it, activate / deactivate it.
// Batches are never deleted (users may point at them) — an inactive batch just can't be picked.
// batches: the list from /admin/userBatches; onChanged: reload that list.
const UserBatchModal = ({ batches, onClose, onChanged }) => {
  const { successToast, errorToast } = useToast();
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState(null); // { id, title }
  const [busy, setBusy] = useState(null); // "new" | batch id

  const run = async (key, action, okMessage) => {
    setBusy(key);
    try {
      const res = await action();
      successToast(res.data.message || okMessage);
      await onChanged();
      return true;
    } catch (err) {
      errorToast(err.response?.data?.message || "Something went wrong");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const addBatch = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (value.length < 2) return errorToast("Batch title must be at least 2 characters");
    if (await run("new", () => api.post("/admin/userBatch", { title: value }), "Batch added")) setTitle("");
  };

  const saveTitle = async () => {
    const value = editing.title.trim();
    if (value.length < 2) return errorToast("Batch title must be at least 2 characters");
    if (await run(editing.id, () => api.put(`/admin/userBatch/${editing.id}`, { title: value }), "Batch updated")) {
      setEditing(null);
    }
  };

  const toggleActive = (batch) =>
    run(
      batch.id,
      () => api.put(`/admin/userBatch/${batch.id}`, { isActive: !batch.isActive }),
      batch.isActive ? "Batch deactivated" : "Batch activated",
    );

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary text-white py-3 px-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold">User Batches</h2>
          <button type="button" onClick={onClose} className="hover:text-gray-200" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={addBatch} className="p-4 border-b flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Batch Title"
            maxLength={100}
            className="w-full sm:flex-1 px-3 h-[42px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={busy === "new"}
            className="bg-primary text-white px-4 h-[42px] rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Batch
          </button>
        </form>

        <div className="p-4 overflow-y-auto space-y-2">
          {batches.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No batches yet.</p>}
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              {editing?.id === batch.id ? (
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                  maxLength={100}
                  autoFocus
                  className="w-full sm:flex-1 px-3 h-[38px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{batch.title}</p>
                  <p className="text-xs text-gray-500">
                    {batch.userCount} user{batch.userCount === 1 ? "" : "s"} ·{" "}
                    <span className={batch.isActive ? "text-green-700" : "text-red-700"}>
                      {batch.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {editing?.id === batch.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveTitle}
                      disabled={busy === batch.id}
                      className="bg-primary hover:bg-blue-700 text-white px-3 py-1 rounded-md disabled:opacity-50"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing({ id: batch.id, title: batch.title })}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(batch)}
                      disabled={busy === batch.id}
                      className={`px-3 py-1 rounded-md text-white disabled:opacity-50 ${
                        batch.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {batch.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UserBatchModal;
