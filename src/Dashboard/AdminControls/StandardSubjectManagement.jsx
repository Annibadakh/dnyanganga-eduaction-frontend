import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import GroupChipsInput from "../Generic/GroupChipsInput";
import {
  Edit,
  Plus,
  Save,
  Trash,
  X,
  ToggleLeft,
  ToggleRight,
  Layers,
  BookOpen,
  ReceiptText,
} from "lucide-react";

const ELIGIBILITY_OPTIONS = [
  { value: "hallticket", label: "Hall Ticket" },
  { value: "result", label: "Result" },
  { value: "quiz", label: "Quiz" },
];

// Academic year runs April -> April (same logic as backend utils/academicYear.js)
const getCurrentExamYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  return currentMonth < 4 ? currentYear - 1 : currentYear;
};

// Exam time is stored as text like "11:00 AM-02:00 PM" (printed on the hall ticket).
// The form edits it as two time pickers.
const to12h = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${String(((h + 11) % 12) + 1).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};
const to24h = (text) => {
  const match = String(text || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let h = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${match[2]}`;
};
const splitExamTime = (text) => {
  const [from = "", to = ""] = String(text || "").split("-").map((x) => x.trim());
  return { examTimeFrom: to24h(from), examTimeTo: to24h(to) };
};
const joinExamTime = (from, to) => (from && to ? `${to12h(from)}-${to12h(to)}` : "");

function StandardSubjectManagement() {
  const { successToast, errorToast, infoToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("standards");
  const [subjectFilter, setSubjectFilter] = useState("all"); // "all" or a parent standard id
  // Student counts on the standard cards are for this exam year ("" = all years)
  const [examYearFilter, setExamYearFilter] = useState(String(getCurrentExamYear()));
  const [examYears, setExamYears] = useState([]);

  // ---- Standards state ----
  const [standards, setStandards] = useState([]);
  const [stdModal, setStdModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [stdError, setStdError] = useState(null);
  const [stdLoader, setStdLoader] = useState(false);
  const [stdForm, setStdForm] = useState({
    name: "",
    normalizeName: "",
    previousYear: "",
    totalFees: "",
    branchType: "MEDIUM",
    branches: [],
    baseStandardId: "",
    eligibleFor: ["hallticket", "result", "quiz"],
    isGSTBill: false,
    isActive: true,
  });

  // ---- Subjects state ----
  const [subjects, setSubjects] = useState([]);
  const [subModal, setSubModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subError, setSubError] = useState(null);
  const [subLoader, setSubLoader] = useState(false);
  const [subForm, setSubForm] = useState({
    subjectCode: "",
    subjectName: "",
    marks: "",
    language: "English",
    standard: "",
    standardId: "",
    subjectGroups: [],
    examDate: "",
    examTime: "",
    examTimeFrom: "",
    examTimeTo: "",
    forExam: true,
    forQuiz: true,
    isActive: true,
  });

  const fetchStandards = async () => {
    try {
      const response = await api.get("/admin/standards", {
        params: examYearFilter ? { examYear: examYearFilter } : {},
      });
      setStandards(response.data.data || []);
      setExamYears(response.data.examYears || []);
    } catch {
      errorToast("Failed to load standards");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/admin/getsubjectDetails");
      setSubjects(response.data.data || []);
    } catch {
      errorToast("Failed to load subjects");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchStandards();
  }, [examYearFilter]);

  // ---------------- Standards ----------------
  const openStdModal = (standard = null) => {
    if (standard) {
      setEditingStandard(standard);
      setStdForm({
        name: standard.name || "",
        normalizeName: standard.normalizeName || "",
        previousYear: standard.previousYear || "",
        totalFees: standard.totalFees ?? "",
        branchType: standard.branchType || "MEDIUM",
        branches: parseList(standard.branches),
        baseStandardId: standard.baseStandardId ?? "",
        // not set (old rows) means "everything" — open with all ticked so saving keeps that
        eligibleFor:
          standard.eligibleFor == null
            ? ELIGIBILITY_OPTIONS.map((o) => o.value)
            : parseList(standard.eligibleFor),
        isGSTBill: standard.isGSTBill,
        isActive: standard.isActive,
      });
    } else {
      setEditingStandard(null);
      setStdForm({
        name: "",
        normalizeName: "",
        previousYear: "",
        totalFees: "",
        branchType: "MEDIUM",
        branches: [],
        baseStandardId: "",
        eligibleFor: ["hallticket", "result", "quiz"],
        isGSTBill: false,
        isActive: true,
      });
    }
    setStdError(null);
    setStdModal(true);
  };

  const closeStdModal = () => {
    setStdModal(false);
    setEditingStandard(null);
  };

  const toggleEligibility = (value) => {
    setStdForm((prev) => {
      const has = prev.eligibleFor.includes(value);
      return {
        ...prev,
        eligibleFor: has
          ? prev.eligibleFor.filter((v) => v !== value)
          : [...prev.eligibleFor, value],
      };
    });
  };

  const handleStdSubmit = async (e) => {
    e.preventDefault();
    if (!stdForm.branches.length) {
      setStdError("Add at least one group / medium");
      return;
    }
    if (!(Number(stdForm.totalFees) > 0)) {
      setStdError("Total fees must be greater than 0");
      return;
    }
    // Fee change on a standard that already has students: only new registrations get it
    if (
      editingStandard &&
      Number(stdForm.totalFees) !== Number(editingStandard.totalFees) &&
      editingStandard.totalStudentCount > 0
    ) {
      const ok = window.confirm(
        `${editingStandard.totalStudentCount} student(s) are registered in ${editingStandard.name}.\n` +
          `They keep their current fee of Rs.${Number(editingStandard.totalFees).toLocaleString("en-IN")}. ` +
          `Only new registrations will use Rs.${Number(stdForm.totalFees).toLocaleString("en-IN")}.\n\nContinue?`,
      );
      if (!ok) return;
    }
    setStdLoader(true);
    setStdError(null);
    try {
      const payload = {
        ...stdForm,
        totalFees: Number(stdForm.totalFees),
        branches: stdForm.branches,
        baseStandardId: stdForm.baseStandardId || null,
      };
      if (editingStandard) {
        await api.put(`/admin/standard/${editingStandard.id}`, payload);
        successToast("Standard updated successfully !!");
      } else {
        await api.post("/admin/standard", payload);
        successToast("Standard added successfully !!");
      }
      fetchStandards();
      closeStdModal();
    } catch (err) {
      setStdError(err.response?.data?.message || "Failed to save standard");
    } finally {
      setStdLoader(false);
    }
  };

  const toggleStandardActive = async (standard) => {
    const ok = window.confirm(
      standard.isActive
        ? `Deactivate ${standard.name}?\nIt will no longer be offered for new registrations. Existing students are not affected.`
        : `Activate ${standard.name}?\nIt will be offered for new registrations again.`,
    );
    if (!ok) return;
    try {
      await api.put(`/admin/standard/${standard.id}`, {
        isActive: !standard.isActive,
      });
      successToast(
        standard.isActive ? "Standard deactivated" : "Standard activated",
      );
      fetchStandards();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update standard");
    }
  };

  const toggleStandardGstBill = async (standard) => {
    const ok = window.confirm(
      standard.isGSTBill
        ? `Switch ${standard.name} receipts to the normal bill?`
        : `Switch ${standard.name} receipts to the GST bill?`,
    );
    if (!ok) return;
    try {
      await api.put(`/admin/standard/${standard.id}`, {
        isGSTBill: !standard.isGSTBill,
      });
      successToast(
        standard.isGSTBill
          ? "Receipts now use the normal bill"
          : "Receipts now use the GST bill",
      );
      fetchStandards();
    } catch {
      errorToast("Failed to update standard");
    }
  };

  // ---------------- Subjects ----------------
  // Subjects belong to parent (exam) standards — combined standards use their base's subjects
  const parentStandards = standards.filter((s) => !s.baseStandardId);

  const parseList = (value) => {
    let v = value;
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        v = v.split(",");
      }
    }
    return Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
  };

  // Groups / mediums of the standard selected in the subject form
  const selectedStandardGroups = () => {
    const std = standards.find((s) => Number(s.id) === Number(subForm.standardId));
    return parseList(std?.branches);
  };

  // Existing subject → its groups (old rows only have the single subGroup value)
  const groupsOfSubject = (subject) => {
    const stored = parseList(subject.subjectGroups);
    if (stored.length) return stored;
    const std = standards.find((s) => Number(s.id) === Number(subject.standardId));
    const all = parseList(std?.branches);
    if (!subject.subGroup || subject.subGroup.toUpperCase() === "GENERAL") return all;
    return [subject.subGroup];
  };

  const openSubModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSubForm({
        subjectCode: subject.subjectCode ?? "",
        subjectName: subject.subjectName || "",
        marks: subject.marks ?? "",
        language: subject.language || "English",
        standard: subject.standard || "",
        standardId: subject.standardId ?? "",
        subjectGroups: groupsOfSubject(subject),
        examDate: subject.examDate
          ? new Date(subject.examDate).toISOString().split("T")[0]
          : "",
        examTime: subject.examTime || "",
        ...splitExamTime(subject.examTime),
        forExam: subject.forExam,
        forQuiz: subject.forQuiz,
        isActive: subject.isActive,
      });
    } else {
      setEditingSubject(null);
      setSubForm({
        subjectCode: "",
        subjectName: "",
        marks: "",
        language: "English",
        standard: "",
        standardId: "",
        subjectGroups: [],
        examDate: "",
        examTime: "",
        examTimeFrom: "",
        examTimeTo: "",
        forExam: true,
        forQuiz: true,
        isActive: true,
      });
    }
    setSubError(null);
    setSubModal(true);
  };

  const closeSubModal = () => {
    setSubModal(false);
    setEditingSubject(null);
  };

  const handleSubChange = (e) => {
    const { name, value } = e.target;
    setSubForm((prev) => {
      const next = {
        ...prev,
        [name]:
          name === "subjectCode" || name === "marks"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };
      // Standard chosen by id — keep its name for display; groups belong to that standard
      if (name === "standardId") {
        const row = standards.find((s) => Number(s.id) === Number(value));
        next.standardId = value === "" ? "" : Number(value);
        next.standard = row ? row.name : "";
        next.subjectGroups = [];
      }
      return next;
    });
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.subjectCode || !subForm.subjectName || !subForm.standardId) {
      setSubError("Subject code, name and standard are required");
      return;
    }
    if (!subForm.subjectGroups?.length) {
      setSubError("Select at least one group / medium");
      return;
    }
    if (Boolean(subForm.examTimeFrom) !== Boolean(subForm.examTimeTo)) {
      setSubError("Enter both exam start and end time, or leave both empty");
      return;
    }
    if (subForm.examTimeFrom && subForm.examTimeTo <= subForm.examTimeFrom) {
      setSubError("Exam end time must be after the start time");
      return;
    }
    setSubLoader(true);
    setSubError(null);
    try {
      // standard name and the legacy subGroup are derived by the server from standardId + groups
      // eslint-disable-next-line no-unused-vars
      const { standard: _standard, examTimeFrom, examTimeTo, ...rest } = subForm;
      const payload = {
        ...rest,
        examDate: subForm.examDate || null,
        examTime: joinExamTime(examTimeFrom, examTimeTo) || null,
      };
      if (editingSubject) {
        await api.put(
          `/admin/updateSubject/${editingSubject.subjectCode}`,
          payload,
        );
        successToast("Subject updated successfully !!");
      } else {
        await api.post("/admin/addSubject", payload);
        successToast("Subject added successfully !!");
      }
      fetchSubjects();
      closeSubModal();
    } catch (err) {
      setSubError(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSubLoader(false);
    }
  };

  const deleteSubject = async (subject) => {
    if (
      !window.confirm(
        `Delete "${subject.subjectName}" permanently?\n\n` +
          "A subject that already has chapters, questions, quizzes or marks cannot be deleted. " +
          "Use Deactivate for those instead.",
      )
    )
      return;
    try {
      await api.delete(`/admin/deleteSubject/${subject.subjectCode}`);
      infoToast("Subject deleted");
      fetchSubjects();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to delete subject");
    }
  };

  const toggleSubjectActive = async (subject) => {
    if (
      subject.isActive &&
      !window.confirm(
        `Deactivate "${subject.subjectName}"?\nIt will be left off hall tickets until activated again.`,
      )
    )
      return;
    try {
      await api.put(`/admin/updateSubject/${subject.subjectCode}`, {
        isActive: !subject.isActive,
      });
      successToast(
        subject.isActive ? "Subject deactivated" : "Subject activated",
      );
      fetchSubjects();
    } catch {
      errorToast("Failed to update subject");
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("en-GB") : "Not set";


  const checkboxCls =
    "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500";
  const labelCls = "block mb-2 text-sm font-medium text-customblack";

  // ---------------- Display helpers ----------------
  const standardName = (id) => standards.find((s) => Number(s.id) === Number(id))?.name || "—";

  const Chip = ({ children, tone = "gray", title }) => {
    const tones = {
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      blue: "bg-blue-50 text-blue-800 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
      <span
        title={title}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
      >
        {children}
      </span>
    );
  };

  const eligibilityChips = (value) => {
    if (value == null) return <Chip tone="green">All features</Chip>;
    const list = parseList(value);
    if (!list.length) return <Chip tone="red">Nothing enabled</Chip>;
    return ELIGIBILITY_OPTIONS.filter((o) => list.includes(o.value)).map((o) => (
      <Chip key={o.value} tone="green">
        {o.label}
      </Chip>
    ));
  };

  // ---------------- Subjects list (filtered by standard) ----------------
  const subjectCountFor = (stdId) =>
    subjects.filter((sub) => Number(sub.standardId) === Number(stdId)).length;

  const visibleSubjects = subjects
    .filter((sub) => subjectFilter === "all" || Number(sub.standardId) === Number(subjectFilter))
    .sort(
      (a, b) =>
        Number(a.standardId) - Number(b.standardId) ||
        (a.examDate ? new Date(a.examDate) : Infinity) - (b.examDate ? new Date(b.examDate) : Infinity) ||
        a.subjectCode - b.subjectCode,
    );

  const subjectColumns = [
    { header: "Code", accessor: "subjectCode" },
    {
      header: "Subject",
      render: (sub) => (
        <div className="min-w-[120px]">
          <div className="font-semibold text-gray-900">{sub.subjectName}</div>
          <div className="text-xs text-gray-500">
            {standardName(sub.standardId)} · {sub.marks} marks · {sub.language}
          </div>
        </div>
      ),
    },
    {
      header: "Groups / Mediums",
      render: (sub) => (
        <div className="flex flex-wrap gap-1 min-w-[140px]">
          {groupsOfSubject(sub).map((g) => (
            <Chip key={g} tone="blue">
              {g}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      header: "Exam",
      render: (sub) =>
        sub.examDate ? (
          <div className="text-sm min-w-[110px]">
            <div className="font-medium">{formatDate(sub.examDate)}</div>
            <div className="text-xs text-gray-500">{sub.examTime || "Time not set"}</div>
          </div>
        ) : (
          <Chip tone="amber">Date not set</Chip>
        ),
    },
    {
      header: "Used In",
      render: (sub) => (
        <div className="flex flex-wrap gap-1 min-w-[120px]">
          {sub.forExam && <Chip tone="green">Hall Ticket + Result</Chip>}
          {sub.forQuiz && <Chip tone="green">Quiz</Chip>}
          {!sub.forExam && !sub.forQuiz && <Chip>Not used</Chip>}
        </div>
      ),
    },
    {
      header: "Status",
      render: (sub) =>
        sub.isActive ? <Chip tone="green">Active</Chip> : <Chip tone="red">Inactive</Chip>,
    },
    {
      header: "Actions",
      render: (sub) => (
        <div className="flex gap-2 flex-nowrap">
          <Button variant="success" onClick={() => openSubModal(sub)} startIcon={<Edit size={14} />}>
            Edit
          </Button>
          <Button
            variant={sub.isActive ? "warning" : "info"}
            onClick={() => toggleSubjectActive(sub)}
            startIcon={sub.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
          >
            {sub.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="danger" onClick={() => deleteSubject(sub)} startIcon={<Trash size={14} />}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold mb-4 text-center text-primary">
        Standard & Subject Management
      </h1>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-3 mb-4 text-center text-sm">
        Current Exam Year: <strong>{getCurrentExamYear()}</strong> —
        auto-calculated (April-flip logic), not stored in the database.
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={activeTab === "standards" ? "primary" : "outline"}
          startIcon={<Layers size={16} />}
          onClick={() => setActiveTab("standards")}
        >
          Standards
        </Button>
        <Button
          variant={activeTab === "subjects" ? "primary" : "outline"}
          startIcon={<BookOpen size={16} />}
          onClick={() => setActiveTab("subjects")}
        >
          Subjects
        </Button>
      </div>

      {/* ================= STANDARDS TAB ================= */}
      {activeTab === "standards" && (
        <div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">
              {standards.length} standard{standards.length !== 1 ? "s" : ""} · combined standards use
              their base standard&apos;s subjects and hall ticket.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Exam Year:
                <select
                  value={examYearFilter}
                  onChange={(e) => setExamYearFilter(e.target.value)}
                  className="px-3 h-[38px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
                >
                  <option value="">All years</option>
                  {[...new Set([String(getCurrentExamYear()), ...examYears.map(String)])]
                    .sort((a, b) => Number(b) - Number(a))
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
              </label>
              <Button startIcon={<Plus size={16} />} variant="primary" onClick={() => openStdModal()}>
                Add Standard
              </Button>
            </div>
          </div>

          {standards.length === 0 && (
            <p className="text-center text-gray-500 py-10">No standards found.</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {standards.map((s) => (
              <div
                key={s.id}
                className={`bg-white rounded-lg shadow-custom border p-4 flex flex-col gap-3 ${
                  s.isActive ? "border-gray-200" : "border-red-200 opacity-80"
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{s.name}</h3>
                    <p className="text-xs text-gray-500">
                      {s.branchType === "GROUP" ? "Group based" : "Medium based"} · previous year{" "}
                      {s.previousYear || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.baseStandardId ? (
                      <Chip tone="blue" title="Uses this base standard's subjects and hall ticket">
                        Combined → {standardName(s.baseStandardId)}
                      </Chip>
                    ) : (
                      <Chip tone="blue">Parent standard</Chip>
                    )}
                    {s.isActive ? <Chip tone="green">Active</Chip> : <Chip tone="red">Inactive</Chip>}
                  </div>
                </div>

                {/* Key numbers */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-gray-50 p-2">
                    <div className="text-xs text-gray-500">Fees</div>
                    <div className="font-semibold">
                      {s.totalFees != null ? `₹${Number(s.totalFees).toLocaleString("en-IN")}` : "—"}
                    </div>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <div className="text-xs text-gray-500">
                      Students{examYearFilter ? ` (${examYearFilter})` : ""}
                    </div>
                    <div className="font-semibold">{s.studentCount ?? 0}</div>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <div className="text-xs text-gray-500">Receipt</div>
                    <div className="font-semibold">{s.isGSTBill ? "GST bill" : "Normal"}</div>
                  </div>
                </div>

                {/* Groups with usage */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    {s.branchType === "GROUP" ? "Groups" : "Mediums"}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(s.groupUsage?.length
                      ? s.groupUsage
                      : parseList(s.branches).map((g) => ({ group: g, students: 0, subjects: 0 }))
                    ).map((u) => (
                      <Chip key={u.group} tone="gray">
                        <span className="font-semibold">{u.group}</span>
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Available for</div>
                  <div className="flex flex-wrap gap-1">{eligibilityChips(s.eligibleFor)}</div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Button variant="success" onClick={() => openStdModal(s)} startIcon={<Edit size={14} />}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/dashboard/standards/${s.id}/receipt-bills`, { state: { standard: s } })
                    }
                    startIcon={<ReceiptText size={14} />}
                  >
                    Receipt Bills
                  </Button>
                  <Button variant={s.isGSTBill ? "info" : "outline"} onClick={() => toggleStandardGstBill(s)}>
                    {s.isGSTBill ? "Use Normal Bill" : "Use GST Bill"}
                  </Button>
                  <Button
                    variant={s.isActive ? "warning" : "info"}
                    onClick={() => toggleStandardActive(s)}
                    startIcon={s.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBJECTS TAB ================= */}
      {activeTab === "subjects" && (
        <div>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Standard filter */}
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All" }, ...parentStandards].map((std) => {
                const active = String(subjectFilter) === String(std.id);
                const count = std.id === "all" ? subjects.length : subjectCountFor(std.id);
                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => setSubjectFilter(std.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {std.name} <span className={active ? "text-blue-100" : "text-gray-400"}>({count})</span>
                  </button>
                );
              })}
            </div>
            <Button startIcon={<Plus size={16} />} variant="primary" onClick={() => openSubModal()}>
              Add Subject
            </Button>
          </div>

          <div className="bg-white rounded shadow-custom overflow-x-auto">
            <DataTable
              columns={subjectColumns}
              data={visibleSubjects}
              rowKey="subjectCode"
              emptyMessage="No subjects found."
            />
          </div>
        </div>
      )}

      {/* ============ STANDARD MODAL ============ */}
      {stdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-custom w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-secondary">
              {editingStandard ? "Edit Standard" : "Add Standard"}
            </h2>
            {stdError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {stdError}
              </div>
            )}
            <form onSubmit={handleStdSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name*</label>
                <input
                  type="text"
                  value={stdForm.name}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, name: e.target.value })
                  }
                  // Locked after creation — the name is used to identify the standard everywhere
                  readOnly={!!editingStandard}
                  disabled={!!editingStandard}
                  title={editingStandard ? "Cannot be changed after the standard is created" : undefined}
                  className={`w-full p-2 border border-gray-300 rounded ${
                    editingStandard ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  placeholder="e.g. 10th"
                />
              </div>
              <div>
                <label className={labelCls}>Normalize Name*</label>
                <input
                  type="text"
                  value={stdForm.normalizeName}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, normalizeName: e.target.value })
                  }
                  // Locked after creation — the name is used to identify the standard everywhere
                  readOnly={!!editingStandard}
                  disabled={!!editingStandard}
                  title={editingStandard ? "Cannot be changed after the standard is created" : undefined}
                  className={`w-full p-2 border border-gray-300 rounded ${
                    editingStandard ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  placeholder="e.g. 10th"
                />
              </div>
              <div>
                <label className={labelCls}>Previous Year*</label>
                <input
                  type="text"
                  value={stdForm.previousYear}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, previousYear: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  placeholder="e.g. 9th"
                />
              </div>
              <div>
                <label className={labelCls}>Total Fees*</label>
                <input
                  type="number"
                  value={stdForm.totalFees}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, totalFees: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <div>
                <label className={labelCls}>Branch Type*</label>
                <select
                  value={stdForm.branchType}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, branchType: e.target.value })
                  }
                  // locked once students are registered in this standard
                  disabled={!!editingStandard && editingStandard.totalStudentCount > 0}
                  title={
                    editingStandard?.totalStudentCount > 0
                      ? "Cannot be changed: students are registered in this standard"
                      : undefined
                  }
                  className={`w-full p-2 border border-gray-300 rounded ${
                    editingStandard?.totalStudentCount > 0 ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="GROUP">GROUP</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>
                  {stdForm.branchType === "GROUP" ? "Groups*" : "Mediums*"}
                </label>
                <GroupChipsInput
                  value={stdForm.branches}
                  onChange={(branches) => setStdForm({ ...stdForm, branches })}
                  usage={Object.fromEntries(
                    (editingStandard?.groupUsage || []).map((u) => [
                      u.group.toLowerCase(),
                      { students: u.students, subjects: u.subjects },
                    ]),
                  )}
                  placeholder={
                    stdForm.branchType === "GROUP"
                      ? "e.g. PCM — type and press Enter"
                      : "e.g. Marathi — type and press Enter"
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Locked groups are used by students or subjects and cannot be removed.
                </p>
              </div>
              <div>
                <label className={labelCls}>Base Standard</label>
                <select
                  value={stdForm.baseStandardId}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, baseStandardId: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">None</option>
                  {standards
                    // only parent standards can be a base (no chains)
                    .filter((s) => s.id !== editingStandard?.id && !s.baseStandardId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Active</label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={stdForm.isActive}
                    onChange={(e) =>
                      setStdForm({ ...stdForm, isActive: e.target.checked })
                    }
                    className={checkboxCls}
                  />
                  <span>Standard is active</span>
                </label>
              </div>
              <div>
                <label className={labelCls}>GST Bill</label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={stdForm.isGSTBill}
                    onChange={(e) =>
                      setStdForm({ ...stdForm, isGSTBill: e.target.checked })
                    }
                    className={checkboxCls}
                  />
                  <span>Receipts use the GST bill</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Eligible For</label>
                <div className="flex gap-4 flex-wrap">
                  {ELIGIBILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={stdForm.eligibleFor.includes(opt.value)}
                        onChange={() => toggleEligibility(opt.value)}
                        className={checkboxCls}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only the ticked features are available for this standard.
                </p>
              </div>

              <div className="col-span-2 flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={closeStdModal}
                  disabled={stdLoader}
                  startIcon={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={stdLoader}
                  startIcon={<Save size={16} />}
                >
                  {editingStandard ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ SUBJECT MODAL ============ */}
      {subModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-custom w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-secondary">
              {editingSubject ? "Edit Subject" : "Add Subject"}
            </h2>
            {subError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {subError}
              </div>
            )}
            <form onSubmit={handleSubSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Subject Code*</label>
                <input
                  type="number"
                  value={subForm.subjectCode}
                  onChange={handleSubChange}
                  name="subjectCode"
                  // the code is the subject's key — fixed after creation
                  readOnly={!!editingSubject}
                  disabled={!!editingSubject}
                  className={`w-full p-2 border border-gray-300 rounded ${
                    editingSubject ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <div>
                <label className={labelCls}>Subject Name*</label>
                <input
                  type="text"
                  value={subForm.subjectName}
                  onChange={handleSubChange}
                  name="subjectName"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Standard*</label>
                <select
                  value={subForm.standardId}
                  onChange={handleSubChange}
                  name="standardId"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Standard</option>
                  {parentStandards.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <CustomMultiSelect
                  label="Med/Grp*"
                  options={selectedStandardGroups().map((g) => ({ label: g, value: g }))}
                  value={(subForm.subjectGroups || []).map((g) => ({ label: g, value: g }))}
                  onChange={(selected) =>
                    setSubForm((prev) => ({
                      ...prev,
                      subjectGroups: (selected || []).map((o) => o.value),
                    }))
                  }
                  isRequired={false}
                  isDisabled={!subForm.standardId}
                  placeholder={subForm.standardId ? "Select groups / mediums" : "Select standard first"}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    Select every group / medium that takes this subject (e.g. Biology → PCB, PCMB).
                  </p>
                  {subForm.standardId && (
                    <div className="flex gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          setSubForm((prev) => ({ ...prev, subjectGroups: selectedStandardGroups() }))
                        }
                        className="text-primary hover:underline"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubForm((prev) => ({ ...prev, subjectGroups: [] }))}
                        className="text-gray-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>Total Marks*</label>
                <input
                  type="number"
                  value={subForm.marks}
                  onChange={handleSubChange}
                  name="marks"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <div>
                <label className={labelCls}>Language*</label>
                <input
                  type="text"
                  value={subForm.language}
                  onChange={handleSubChange}
                  name="language"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Exam Date</label>
                <input
                  type="date"
                  value={subForm.examDate}
                  onChange={handleSubChange}
                  name="examDate"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className={labelCls}>Exam Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={subForm.examTimeFrom}
                    onChange={(e) => setSubForm({ ...subForm, examTimeFrom: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    aria-label="Exam start time"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="time"
                    value={subForm.examTimeTo}
                    onChange={(e) => setSubForm({ ...subForm, examTimeTo: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    aria-label="Exam end time"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Usage / Eligibility</label>
                <div className="flex gap-6 flex-wrap">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subForm.forExam}
                      onChange={(e) =>
                        setSubForm({ ...subForm, forExam: e.target.checked })
                      }
                      className={checkboxCls}
                    />
                    Hall Ticket + Result
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subForm.forQuiz}
                      onChange={(e) =>
                        setSubForm({ ...subForm, forQuiz: e.target.checked })
                      }
                      className={checkboxCls}
                    />
                    Quiz / Question Bank
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subForm.isActive}
                      onChange={(e) =>
                        setSubForm({ ...subForm, isActive: e.target.checked })
                      }
                      className={checkboxCls}
                    />
                    Active
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Both checked = used everywhere (default). Uncheck one to
                  restrict usage.
                </p>
              </div>

              <div className="col-span-2 flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={closeSubModal}
                  disabled={subLoader}
                  startIcon={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={subLoader}
                  startIcon={<Save size={16} />}
                >
                  {editingSubject ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StandardSubjectManagement;
