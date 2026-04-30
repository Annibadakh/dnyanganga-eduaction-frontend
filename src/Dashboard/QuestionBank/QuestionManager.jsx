import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import { Eye, Pencil, Trash2, Plus, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ value, map }) => {
  const cfg = map[value] ?? { label: value, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const DIFFICULTY_MAP = {
  EASY:   { label: "Easy",   cls: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  HARD:   { label: "Hard",   cls: "bg-red-100   text-red-700" },
};

const TYPE_MAP = {
  SINGLE: { label: "Single Choice", cls: "bg-blue-100   text-blue-700" },
  MULTI:  { label: "Multi Choice",  cls: "bg-purple-100 text-purple-700" },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-primary">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
      {/* Body */}
      <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
    </div>
  </div>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ onClose, onConfirm, deleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={26} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Question?</h3>
      <p className="text-sm text-gray-500 mb-6">
        This action cannot be undone. The question will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button
          variant="danger"
          loading={deleting}
          onClick={onConfirm}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="mb-4">
    <label className="block text-sm text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition";

// ─── Question Form ────────────────────────────────────────────────────────────
const QuestionForm = ({ chapter, initial, onSave, onClose }) => {
  const editing = !!initial;

  const [questionText, setQuestionText]           = useState(initial?.questionText ?? "");
  const [topic, setTopic]                         = useState(initial?.topic ?? "");
  const [type, setType]                           = useState(initial?.type ?? "SINGLE");
  const [difficulty, setDifficulty]               = useState(initial?.difficulty ?? "MEDIUM");
  const [marks, setMarks]                         = useState(initial?.marks ?? "");
  const [solutionDescription, setSolutionDescription] = useState(initial?.solutionDescription ?? "");
  const [options, setOptions]                     = useState(
    initial?.options ?? [{ index: 1, text: "" }, { index: 2, text: "" }]
  );
  const [correctAns, setCorrectAns]               = useState(initial?.correctAns ?? []);
  const [saving, setSaving]                       = useState(false);

  const addOption    = () => setOptions([...options, { index: options.length + 1, text: "" }]);
  const removeOption = (idx) => {
    const next = options.filter((o) => o.index !== idx).map((o, i) => ({ ...o, index: i + 1 }));
    setOptions(next);
    setCorrectAns(correctAns.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
  };
  const updateOption  = (index, value) =>
    setOptions(options.map((o) => (o.index === index ? { ...o, text: value } : o)));
  const toggleCorrect = (index) => {
    if (type === "SINGLE") { setCorrectAns([index]); return; }
    setCorrectAns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSave = async () => {
    if (!questionText.trim()) { alert("Question text is required"); return; }
    if (correctAns.length === 0) { alert("Select at least one correct answer"); return; }
    setSaving(true);
    try {
      const payload = {
        chapterId: chapter.id,
        subjectId: chapter.subjectId,
        standardId: chapter.Subject?.standardId,
        questionText, topic, type, difficulty,
        marks: marks ? Number(marks) : undefined,
        solutionDescription, correctAns, options,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Answer Type">
          <select
            className={inputCls}
            value={type}
            onChange={(e) => { setType(e.target.value); setCorrectAns([]); }}
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
                className={`w-5 h-5 shrink-0 flex items-center justify-center border-2 transition-all
                  ${type === "SINGLE" ? "rounded-full" : "rounded"}
                  ${
                    correctAns.includes(opt.index)
                      ? "bg-primary border-primary text-white"
                      : "border-gray-300 hover:border-primary"
                  }`}
              >
                {correctAns.includes(opt.index) && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50
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
          className="mt-3 text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          <Plus size={15} /> Add Option
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

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300
                     hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          {editing ? "Update Question" : "Save Question"}
        </Button>
      </div>
    </>
  );
};

// ─── Question Detail Modal ────────────────────────────────────────────────────
const QuestionDetailModal = ({ q, onClose }) => (
  <Modal title="Question Detail" onClose={onClose}>
    {/* Meta badges */}
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge value={q.type} map={TYPE_MAP} />
      <Badge value={q.difficulty} map={DIFFICULTY_MAP} />
      {q.topic && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {q.topic}
        </span>
      )}
      {q.marks != null && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
          {q.marks} mark{q.marks !== 1 ? "s" : ""}
        </span>
      )}
    </div>

    {/* Question text */}
    <p className="font-semibold text-gray-800 mb-4 text-sm leading-relaxed">
      {q.questionText}
    </p>

    {/* Options */}
    <div className="space-y-2 mb-4">
      {q.options?.map((opt) => (
        <div
          key={opt.id ?? opt.index}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-colors
            ${
              q.correctAns?.includes(opt.index)
                ? "bg-green-50 border-green-200 text-green-800 font-medium"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${q.correctAns?.includes(opt.index) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            {opt.index}
          </span>
          {opt.text}
          {q.correctAns?.includes(opt.index) && (
            <span className="ml-auto text-green-600 text-xs font-semibold">✓ Correct</span>
          )}
        </div>
      ))}
    </div>

    {/* Solution */}
    {q.solutionDescription && (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Solution</p>
        <p className="text-sm text-blue-800">{q.solutionDescription}</p>
      </div>
    )}
  </Modal>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const QuestionManager = ({ chapter, onBack }) => {
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/question-bank/question", { params: { chapterId: chapter.id } });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/question-bank/question/${deleteId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteId));
      if (viewTarget?.id === deleteId) setViewTarget(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete question");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      header: "Sr. No.",
      render: (_, i) => i + 1,
    },
    {
      header: "Question",
      render: (row) => (
        <span className="text-sm text-gray-700">
          {row.questionText?.slice(0, 80)}{row.questionText?.length > 80 ? "…" : ""}
        </span>
      ),
    },
    {
      header: "Topic",
      render: (row) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
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
        <span className="text-sm font-semibold text-gray-700">{row.marks ?? "—"}</span>
      ),
    },
    {
      header: "Status",
      render: (row) =>
        row.status ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <CheckCircle2 size={13} /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <XCircle size={13} /> Inactive
          </span>
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2 flex-nowrap">
          <Button
            variant="primary"
            startIcon={<Eye size={15} />}
            onClick={() => setViewTarget(row)}
          >
            View
          </Button>
          <Button
            variant="warning"
            startIcon={<Pencil size={15} />}
            onClick={() => { setEditTarget(row); setShowForm(false); }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            startIcon={<Trash2 size={15} />}
            onClick={() => setDeleteId(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 container mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500
                     hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">{chapter.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Question Bank · {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Button
          variant="primary"
          startIcon={<Plus size={16} />}
          onClick={() => { setShowForm(true); setEditTarget(null); }}
        >
          Add Question
        </Button>
      </div>

      {/* ── Stats Strip ── */}
      {questions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Easy",   count: questions.filter((q) => q.difficulty === "EASY").length,   cls: "bg-green-50  border-green-200  text-green-700"  },
            { label: "Medium", count: questions.filter((q) => q.difficulty === "MEDIUM").length, cls: "bg-yellow-50 border-yellow-200 text-yellow-700" },
            { label: "Hard",   count: questions.filter((q) => q.difficulty === "HARD").length,   cls: "bg-red-50    border-red-200    text-red-700"    },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.cls}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
              <span className="text-2xl font-bold">{s.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={questions}
        loading={loading}
        rowKey="id"
        emptyMessage="No questions found for this chapter."
      />

      {/* ── View Detail Modal ── */}
      {viewTarget && (
        <QuestionDetailModal
          q={viewTarget}
          onClose={() => setViewTarget(null)}
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

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <DeleteConfirmModal
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default QuestionManager;