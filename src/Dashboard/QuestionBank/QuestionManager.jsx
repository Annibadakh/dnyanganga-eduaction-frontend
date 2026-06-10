import { useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import FileUpload from "../FileUpload/FileUpload";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import OptionImageUpload from "./OptionImageUpload";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import renderMathText from "../Generic/RenderMathText";
import MathEditor from "../Generic/MathEditor";
import ImagePreview from "../Generic/ImagePreview";

// ─── Badge ────────────────────────────────────────────────────────────────────
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
  EASY: { label: "Easy", cls: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  HARD: { label: "Hard", cls: "bg-red-100 text-red-700" },
};

const TYPE_MAP = {
  SINGLE: { label: "Single Choice", cls: "bg-blue-100 text-blue-700" },
  MULTI: { label: "Multi Choice", cls: "bg-purple-100 text-purple-700" },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col my-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
      {/* Body */}
      <div className="px-6 py-5">{children}</div>
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

// ─── Section wrapper ──────────────────────────────────────────────────────────
const FormSection = ({ label, children }) => (
  <div className="py-4 border-b border-gray-100 last:border-b-0 last:pb-0">
    {label && (
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
        {label}
      </p>
    )}
    {children}
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label className="text-xs text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition bg-white";

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
      { index: 1, text: "", imageUrl: "" },
      { index: 2, text: "", imageUrl: "" },
    ],
  );
  const [correctAns, setCorrectAns] = useState(initial?.correctAns ?? []);
  const [saving, setSaving] = useState(false);
  const [questionImageUrl, setQuestionImageUrl] = useState(
    initial?.imageUrl ?? "",
  );
  const questionImage = FileUploadHook();

  useEffect(() => {
    if (initial?.imageUrl) {
      setQuestionImageUrl(initial.imageUrl);
    }
  }, [initial]);

  const handleQuestionImageUpload = async (type) => {
    const imageUrl = await questionImage.uploadImage(type);

    if (imageUrl) {
      setQuestionImageUrl(imageUrl);
    }
  };

  const addOption = () =>
    setOptions([
      ...options,
      { index: options.length + 1, text: "", imageUrl: "" },
    ]);

  const removeOption = (idx) => {
    const next = options
      .filter((o) => o.index !== idx)
      .map((o, i) => ({ ...o, index: i + 1 }));
    setOptions(next);
    setCorrectAns(
      correctAns.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    );
  };

  const updateOption = (index, data) =>
    setOptions((prev) =>
      prev.map((o) => (o.index === index ? { ...o, ...data } : o)),
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
        imageUrl: questionImageUrl,
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
    <div className="flex flex-col gap-0">
      {/* ── Section 1: Details ── */}
      <FormSection label="Details">
        <div className="grid grid-cols-3 gap-3 mb-3">
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

        {/* Answer type as radio buttons */}
        <Field label="Answer type">
          <div className="flex gap-5 mt-0.5">
            {[
              { value: "SINGLE", label: "Single choice" },
              { value: "MULTI", label: "Multi choice" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="answerType"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={() => {
                    setType(opt.value);
                    setCorrectAns([]);
                  }}
                  className="accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Field>
      </FormSection>

      {/* ── Section 2: Question ── */}
      <FormSection label="Question *">
        {/* Math editor */}
        <MathEditor
          value={questionText}
          onChange={setQuestionText}
          placeholder="Write your question using maths…"
        />

        {/* Preview */}
        {questionText && (
          <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Preview
            </p>
            <div className="text-sm">{renderMathText(questionText)}</div>
          </div>
        )}

        {/* ── File upload — compact inline bar ── */}
        <div className="flex-shrink-0">
          <FileUpload
            title=""
            imageUrl={questionImage.imageUrl}
            error={questionImage.error}
            loader={questionImage.loader}
            isSaved={questionImage.isSaved}
            imageType="question"
            onFileUpload={questionImage.handleFileUpload}
            onUploadImage={handleQuestionImageUpload}
            onRemovePhoto={questionImage.removePhoto}
          />
        </div>
      </FormSection>

      {/* ── Section 3: Options ── */}
      <FormSection label="Options — tick the correct answer">
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <div key={opt.index} className="flex items-start gap-2 group">
              {/* Correct toggle */}
              <button
                onClick={() => toggleCorrect(opt.index)}
                title={
                  type === "SINGLE" ? "Select correct answer" : "Toggle correct"
                }
                className={`mt-2 w-5 h-5 shrink-0 flex items-center justify-center border-2 transition-all
                  ${type === "SINGLE" ? "rounded-full" : "rounded"}
                  ${
                    correctAns.includes(opt.index)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
              >
                {correctAns.includes(opt.index) && (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
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

              {/* Option body */}
              <div className="flex-1 min-w-0">
                <MathEditor
                  value={opt.text}
                  onChange={(value) => updateOption(opt.index, { text: value })}
                  placeholder={`Option ${opt.index}`}
                />

                {/* Math preview */}
                {opt.text && (
                  <div className="mt-1 px-2 py-1 text-xs bg-gray-50 rounded text-gray-600">
                    {renderMathText(opt.text)}
                  </div>
                )}

                {/* Option image + correct badge row */}
                <div className="flex items-center gap-2 mt-1.5">
                  <OptionImageUpload
                    option={opt}
                    onImageChange={(imageUrl) =>
                      updateOption(opt.index, { imageUrl })
                    }
                  />
                  {correctAns.includes(opt.index) && (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-50 rounded px-2 py-0.5">
                      ✓ Correct
                    </span>
                  )}
                </div>
              </div>

              {/* Remove */}
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(opt.index)}
                  className="mt-2 w-6 h-6 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50
                             flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addOption}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600
                     hover:text-blue-800 transition-colors"
        >
          <Plus size={13} /> Add option
        </button>
      </FormSection>

      {/* ── Section 4: Solution ── */}
      <FormSection label="Solution / explanation">
        <textarea
          className={inputCls + " min-h-[80px] resize-y"}
          placeholder="Explain the correct answer…"
          value={solutionDescription}
          onChange={(e) => setSolutionDescription(e.target.value)}
        />
      </FormSection>

      {/* ── Footer ── */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300
                     hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          {editing ? "Update question" : "Save question"}
        </Button>
      </div>
    </div>
  );
};

// ─── Question Detail Modal ────────────────────────────────────────────────────
const QuestionDetailModal = ({ q, onClose }) => (
  <Modal title="Question Detail" onClose={onClose}>
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

    <div className="mb-4">
      {/* <p className="font-semibold text-gray-800 text-sm leading-relaxed">
        {renderMathText(q.questionText)}
      </p> */}
      <p className="font-semibold text-gray-800 text-sm leading-relaxed break-words whitespace-normal">
        {renderMathText(q.questionText)}
      </p>

      <ImagePreview
        imagePath={q.imageUrl}
        alt="Question Image"
        className="mt-3 max-h-30"
      />
    </div>

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
          <div className="flex-1">
            <div>{renderMathText(opt.text)}</div>

            <ImagePreview
              imagePath={opt.imageUrl}
              alt={`Option ${opt.index}`}
              className="mt-2 max-h-20"
            />
          </div>
          {q.correctAns?.includes(opt.index) && (
            <span className="ml-auto text-green-600 text-xs font-semibold">
              ✓ Correct
            </span>
          )}
        </div>
      ))}
    </div>

    {q.solutionDescription && (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
          Solution
        </p>
        <p className="text-sm text-blue-800">{q.solutionDescription}</p>
      </div>
    )}
  </Modal>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const QuestionManager = ({ chapter, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    { header: "Sr. No.", render: (_, i) => i + 1 },
    {
      header: "Question",
      render: (row) => {
        const text = row.questionText || "";
        const truncated = text.length > 80 ? text.slice(0, 80) + "…" : text;
        return (
          // <span className="text-sm text-gray-700">
          //   {renderMathText(truncated)}
          // </span>
          <span
            className="text-sm text-gray-700 block max-w-md truncate"
            title={row.questionText}
          >
            {renderMathText(row.questionText || "")}
          </span>
        );
      },
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
        <span className="text-sm font-semibold text-gray-700">
          {row.marks ?? "—"}
        </span>
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
            onClick={() => {
              setEditTarget(row);
              setShowForm(false);
            }}
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
            Question Bank · {questions.length} question
            {questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Button
          variant="primary"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setShowForm(true);
            setEditTarget(null);
          }}
        >
          Add Question
        </Button>
      </div>

      {/* ── Stats Strip ── */}
      {questions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Easy",
              count: questions.filter((q) => q.difficulty === "EASY").length,
              cls: "bg-green-50  border-green-200  text-green-700",
            },
            {
              label: "Medium",
              count: questions.filter((q) => q.difficulty === "MEDIUM").length,
              cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
            },
            {
              label: "Hard",
              count: questions.filter((q) => q.difficulty === "HARD").length,
              cls: "bg-red-50    border-red-200    text-red-700",
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
      <DataTable
        columns={columns}
        data={questions}
        loading={loading}
        rowKey="id"
        emptyMessage="No questions found for this chapter."
      />

      {/* ── Modals ── */}
      {viewTarget && (
        <QuestionDetailModal
          q={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {showForm && (
        <Modal title="Add new question" onClose={() => setShowForm(false)}>
          <QuestionForm
            chapter={chapter}
            initial={null}
            onSave={fetchQuestions}
            onClose={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit question" onClose={() => setEditTarget(null)}>
          <QuestionForm
            chapter={chapter}
            initial={editTarget}
            onSave={fetchQuestions}
            onClose={() => setEditTarget(null)}
          />
        </Modal>
      )}

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
