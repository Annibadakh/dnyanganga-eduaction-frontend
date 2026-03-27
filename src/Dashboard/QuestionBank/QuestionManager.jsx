import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Badge = ({ value, map }) => {
  const cfg = map[value] ?? { label: value, cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

const DIFFICULTY_MAP = {
  EASY: { label: "Easy", cls: "bg-emerald-100 text-emerald-700" },
  MEDIUM: { label: "Medium", cls: "bg-amber-100   text-amber-700" },
  HARD: { label: "Hard", cls: "bg-rose-100    text-rose-700" },
};

const TYPE_MAP = {
  SINGLE: { label: "Single Choice", cls: "bg-blue-100   text-blue-700" },
  MULTI: { label: "Multi Choice", cls: "bg-violet-100 text-violet-700" },
};

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400
                           hover:bg-slate-100 hover:text-slate-700 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
      {/* body */}
      <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
    </div>
  </div>
);

// ─── Form field helpers ───────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition";

// ─── Question Form ────────────────────────────────────────────────────────────
const QuestionForm = ({ chapter, initial, onSave, onClose }) => {
  const editing = !!initial;

  const [questionText, setQuestionText] = useState(initial?.questionText ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [type, setType] = useState(initial?.type ?? "SINGLE");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "MEDIUM");
  const [marks, setMarks] = useState(initial?.marks ?? "");
  const [solutionDescription, setSolutionDescription] = useState(
    initial?.solutionDescription ?? "",
  );
  const [options, setOptions] = useState(
    initial?.options ?? [
      { index: 1, text: "" },
      { index: 2, text: "" },
    ],
  );
  const [correctAns, setCorrectAns] = useState(initial?.correctAns ?? []);
  const [saving, setSaving] = useState(false);

  const addOption = () =>
    setOptions([...options, { index: options.length + 1, text: "" }]);

  const removeOption = (idx) => {
    const next = options
      .filter((o) => o.index !== idx)
      .map((o, i) => ({ ...o, index: i + 1 }));
    setOptions(next);
    setCorrectAns(
      correctAns.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    );
  };

  const updateOption = (index, value) =>
    setOptions(
      options.map((o) => (o.index === index ? { ...o, text: value } : o)),
    );

  const toggleCorrect = (index) => {
    if (type === "SINGLE") {
      setCorrectAns([index]);
      return;
    }
    setCorrectAns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      alert("Question text is required");
      return;
    }
    if (correctAns.length === 0) {
      alert("Select at least one correct answer");
      return;
    }
    setSaving(true);
    try {
      console.log("Saving question with payload:", chapter);
      const payload = {
        chapterId: chapter.id,
        subjectId: chapter.subjectId,
        standardId: chapter.Subject?.standardId,
        questionText,
        topic,
        type,
        difficulty,
        marks: marks ? Number(marks) : undefined,
        solutionDescription,
        correctAns,
        options,
      };
      if (editing) {
        await api.put(`/question-bank/question/${initial.id}`, payload);
      } else {
        await api.post("/question-bank/question", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Topic">
          <input
            className={inputCls}
            placeholder="e.g. Algebra"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </Field>
        <Field label="Marks">
          <input
            className={inputCls}
            type="number"
            placeholder="e.g. 2"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            min={0}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Answer Type">
          <select
            className={inputCls}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCorrectAns([]);
            }}
          >
            <option value="SINGLE">Single Choice</option>
            <option value="MULTI">Multi Choice</option>
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            className={inputCls}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </Field>
      </div>

      <Field label="Question" required>
        <textarea
          className={inputCls + " min-h-[90px] resize-y"}
          placeholder="Write your question here…"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </Field>

      {/* Options */}
      <Field label="Options (tick correct answer)">
        <div className="space-y-2">
          {options.map((opt) => (
            <div key={opt.index} className="flex items-center gap-2 group">
              <button
                onClick={() => toggleCorrect(opt.index)}
                className={`w-5 h-5 shrink-0 rounded ${type === "SINGLE" ? "rounded-full" : "rounded"} border-2 flex items-center justify-center transition-all
                  ${
                    correctAns.includes(opt.index)
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-slate-300 hover:border-indigo-400"
                  }`}
              >
                {correctAns.includes(opt.index) && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <input
                className={inputCls + " flex-1"}
                placeholder={`Option ${opt.index}`}
                value={opt.text}
                onChange={(e) => updateOption(opt.index, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(opt.index)}
                  className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50
                                   flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <span className="text-base">＋</span> Add Option
        </button>
      </Field>

      <Field label="Solution / Explanation">
        <textarea
          className={inputCls + " min-h-[80px] resize-y"}
          placeholder="Explain the correct answer…"
          value={solutionDescription}
          onChange={(e) => setSolutionDescription(e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200
                           hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white
                           bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {editing ? "Update Question" : "Save Question"}
        </button>
      </div>
    </>
  );
};

// ─── Expanded detail card ──────────────────────────────────────────────────────
const QuestionDetail = ({ q, onClose }) => (
  <div
    className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5 mt-2 relative"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    <button
      onClick={onClose}
      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
                       text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-lg"
    >
      ×
    </button>

    <p className="font-semibold text-slate-800 mb-4 pr-8 text-sm leading-relaxed">
      {q.questionText}
    </p>

    <div className="space-y-2 mb-4">
      {q.options?.map((opt) => (
        <div
          key={opt.id ?? opt.index}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors
               ${
                 q.correctAns?.includes(opt.index)
                   ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                   : "bg-slate-50 border border-slate-100 text-slate-600"
               }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
            ${q.correctAns?.includes(opt.index) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}
          >
            {opt.index}
          </span>
          {opt.text}
          {q.correctAns?.includes(opt.index) && (
            <span className="ml-auto text-emerald-600 text-xs font-semibold">
              ✓ Correct
            </span>
          )}
        </div>
      ))}
    </div>

    {q.solutionDescription && (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
          Solution
        </p>
        <p className="text-sm text-indigo-800">{q.solutionDescription}</p>
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const QuestionManager = ({ chapter, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // question obj or null
  const [expandedRow, setExpandedRow] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────────
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/question-bank/question", {
        params: { chapterId: chapter.id },
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ── delete ───────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/question-bank/question/${deleteId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteId));
      if (expandedRow === deleteId) setExpandedRow(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete question");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // ── table columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      header: "#",
      render: (_, i) => (
        <span className="text-xs font-bold text-slate-400 tabular-nums">
          {String(i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Question",
      render: (row) => (
        <span className="text-sm text-slate-700 line-clamp-2 leading-snug">
          {row.questionText?.slice(0, 80)}
          {row.questionText?.length > 80 ? "…" : ""}
        </span>
      ),
    },
    {
      header: "Topic",
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.topic || "—"}
        </span>
      ),
    },
    {
      header: "Type",
      render: (row) => <Badge value={row.type} map={TYPE_MAP} />,
    },
    {
      header: "Difficulty",
      render: (row) => <Badge value={row.difficulty} map={DIFFICULTY_MAP} />,
    },
    {
      header: "Marks",
      render: (row) => (
        <span className="text-sm font-semibold text-slate-700">
          {row.marks ?? "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) =>
        row.status ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
            Inactive
          </span>
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* View */}
          <button
            onClick={() =>
              setExpandedRow(expandedRow === row.id ? null : row.id)
            }
            title="View"
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
              ${
                expandedRow === row.id
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
          >
            👁
          </button>
          {/* Edit */}
          <button
            onClick={() => {
              setEditTarget(row);
              setShowForm(false);
            }}
            title="Edit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-slate-400
                       hover:bg-amber-50 hover:text-amber-600 transition-all"
          >
            ✏️
          </button>
          {/* Delete */}
          <button
            onClick={() => setDeleteId(row.id)}
            title="Delete"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-slate-400
                       hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50 p-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500
                           hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          ← Back
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">{chapter.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Question Bank · {questions.length} question
            {questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditTarget(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                           text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200
                           active:scale-95 transition-all"
        >
          <span className="text-base">＋</span> Add Question
        </button>
      </div>

      {/* ── Stats strip ── */}
      {questions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Easy",
              count: questions.filter((q) => q.difficulty === "EASY").length,
              cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              label: "Medium",
              count: questions.filter((q) => q.difficulty === "MEDIUM").length,
              cls: "bg-amber-50   text-amber-700   border-amber-200",
            },
            {
              label: "Hard",
              count: questions.filter((q) => q.difficulty === "HARD").length,
              cls: "bg-rose-50    text-rose-700    border-rose-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.cls}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                {s.label}
              </span>
              <span className="text-2xl font-bold">{s.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={questions}
          loading={loading}
          rowKey="id"
        />
      </div>

      {/* ── Expanded detail ── */}
      {expandedRow && (
        <QuestionDetail
          q={questions.find((q) => q.id === expandedRow)}
          onClose={() => setExpandedRow(null)}
        />
      )}

      {/* ── Add Form Modal ── */}
      {showForm && (
        <Modal title="Add New Question" onClose={() => setShowForm(false)}>
          <QuestionForm
            chapter={chapter}
            initial={null}
            onSave={fetchQuestions}
            onClose={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* ── Edit Form Modal ── */}
      {editTarget && (
        <Modal title="Edit Question" onClose={() => setEditTarget(null)}>
          <QuestionForm
            chapter={chapter}
            initial={editTarget}
            onSave={fetchQuestions}
            onClose={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🗑
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Delete Question?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. The question will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold
                                 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                                 bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
