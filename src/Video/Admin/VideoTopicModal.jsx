import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useToast } from "../../useToast";
import videoApi, { apiMessage } from "../videoApi";

// Admin → Videos → Add Topic: add a topic to a standard, rename it, activate / deactivate it.
// Topics are never deleted (videos point at them) — an inactive topic can't be picked for
// uploads and its videos are hidden from video users.
// topics: the list from /admin/topics; standardOptions: { label, value }; onChanged: reload lists.
const VideoTopicModal = ({ topics, standardOptions, onClose, onChanged }) => {
  const { successToast, errorToast } = useToast();
  const [standardId, setStandardId] = useState("");
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState(null); // { id, title }
  const [busy, setBusy] = useState(null); // "new" | topic id

  const run = async (key, action, okMessage) => {
    setBusy(key);
    try {
      const res = await action();
      successToast(res.data.message || okMessage);
      await onChanged();
      return true;
    } catch (err) {
      errorToast(apiMessage(err, "Something went wrong"));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const addTopic = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!standardId) return errorToast("Select a standard");
    if (value.length < 2) return errorToast("Topic title must be at least 2 characters");
    const ok = await run("new", () => videoApi.post("/admin/topics", { standardId: Number(standardId), title: value }), "Topic added");
    if (ok) setTitle("");
  };

  const saveTitle = async () => {
    const value = editing.title.trim();
    if (value.length < 2) return errorToast("Topic title must be at least 2 characters");
    if (await run(editing.id, () => videoApi.put(`/admin/topics/${editing.id}`, { title: value }), "Topic updated")) {
      setEditing(null);
    }
  };

  const toggleActive = (topic) =>
    run(
      topic.id,
      () => videoApi.put(`/admin/topics/${topic.id}`, { isActive: !topic.isActive }),
      topic.isActive ? "Topic deactivated" : "Topic activated",
    );

  // The list follows the standard picked above (all standards when none is picked)
  const shown = standardId ? topics.filter((t) => String(t.standardId) === String(standardId)) : topics;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary text-white py-3 px-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold">Video Topics</h2>
          <button type="button" onClick={onClose} className="hover:text-gray-200" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={addTopic} className="p-4 border-b flex flex-col gap-2">
          <select
            value={standardId}
            onChange={(e) => setStandardId(e.target.value)}
            className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
          >
            <option value="">Select standard</option>
            {standardOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Topic Title"
              maxLength={100}
              className="w-full sm:flex-1 px-3 h-[42px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={busy === "new"}
              className="bg-primary text-white px-4 h-[42px] rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add Topic
            </button>
          </div>
        </form>

        <div className="p-4 overflow-y-auto space-y-2">
          {shown.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No topics yet.</p>}
          {shown.map((topic) => (
            <div key={topic.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              {editing?.id === topic.id ? (
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
                  <p className="font-medium text-gray-800 truncate">{topic.title}</p>
                  <p className="text-xs text-gray-500">
                    {topic.standardName} · {topic.videoCount} video{topic.videoCount === 1 ? "" : "s"} ·{" "}
                    <span className={topic.isActive ? "text-green-700" : "text-red-700"}>
                      {topic.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {editing?.id === topic.id ? (
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
                      disabled={busy === topic.id}
                      className="bg-primary hover:bg-blue-700 text-white px-3 py-1 rounded-md disabled:opacity-50"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing({ id: topic.id, title: topic.title })}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(topic)}
                      disabled={busy === topic.id}
                      className={`px-3 py-1 rounded-md text-white disabled:opacity-50 ${
                        topic.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {topic.isActive ? "Deactivate" : "Activate"}
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

export default VideoTopicModal;
