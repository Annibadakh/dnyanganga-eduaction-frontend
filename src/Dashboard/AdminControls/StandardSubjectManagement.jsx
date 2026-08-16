import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
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

function StandardSubjectManagement() {
  const { successToast, errorToast, infoToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("standards");

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
    branches: "",
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
    subGroup: "",
    examDate: "",
    examTime: "",
    forExam: true,
    forQuiz: true,
    isActive: true,
  });

  const fetchStandards = async () => {
    try {
      const response = await api.get("/admin/standards");
      setStandards(response.data.data || []);
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
    fetchStandards();
    fetchSubjects();
  }, []);

  // Map normalizeName -> standard row (used to auto-link subject.standardId)
  const standardByNormalize = standards.reduce((acc, s) => {
    acc[s.normalizeName] = s;
    return acc;
  }, {});

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
        branches: Array.isArray(standard.branches)
          ? standard.branches.join(", ")
          : standard.branches || "",
        baseStandardId: standard.baseStandardId ?? "",
        eligibleFor: Array.isArray(standard.eligibleFor)
          ? standard.eligibleFor
          : [],
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
        branches: "",
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
    setStdLoader(true);
    setStdError(null);
    try {
      const payload = {
        ...stdForm,
        totalFees: Number(stdForm.totalFees),
        branches: stdForm.branches
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
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
    try {
      await api.put(`/admin/standard/${standard.id}`, {
        isActive: !standard.isActive,
      });
      successToast(
        standard.isActive ? "Standard deactivated" : "Standard activated",
      );
      fetchStandards();
    } catch {
      errorToast("Failed to update standard");
    }
  };

  const toggleStandardGstBill = async (standard) => {
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
  const subGroupOptions = () => {
    if (subForm.standard === "12th") {
      return ["GENERAL", "PCM", "PCB", "PCMB"];
    }
    if (subForm.standard === "10th") {
      return ["GENERAL", "ENGLISH", "SEMI-ENGLISH", "MARATHI"];
    }
    return ["GENERAL"];
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
        subGroup: subject.subGroup || "",
        examDate: subject.examDate
          ? new Date(subject.examDate).toISOString().split("T")[0]
          : "",
        examTime: subject.examTime || "",
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
        subGroup: "",
        examDate: "",
        examTime: "",
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
      // Auto-link standardId from the exam-path standard string
      if (name === "standard") {
        const row = standardByNormalize[value];
        next.standardId = row ? row.id : "";
      }
      return next;
    });
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.subjectCode || !subForm.subjectName || !subForm.standard) {
      setSubError("Subject code, name and standard are required");
      return;
    }
    setSubLoader(true);
    setSubError(null);
    try {
      const payload = {
        ...subForm,
        examDate: subForm.examDate || null,
        examTime: subForm.examTime || null,
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
        `Are you sure you want to delete "${subject.subjectName}" ?`,
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

  const eligibilityLabel = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "All";
    return arr.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(", ");
  };

  const checkboxCls =
    "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500";
  const labelCls = "block mb-2 text-sm font-medium text-customblack";

  // ---------------- Generic DataTable columns ----------------
  const standardColumns = [
    {
      header: "Name",
      accessor: "name",
      cellClass: "font-semibold text-primary",
    },
    { header: "Normalize", accessor: "normalizeName" },
    { header: "Prev Year", accessor: "previousYear" },
    {
      header: "Fees",
      render: (s) =>
        s.totalFees != null
          ? `₹${Number(s.totalFees).toLocaleString("en-IN")}`
          : "—",
    },
    { header: "Type", accessor: "branchType" },
    {
      header: "Branches",
      render: (s) =>
        Array.isArray(s.branches) ? s.branches.join(", ") : s.branches || "—",
    },
    { header: "Eligible For", render: (s) => eligibilityLabel(s.eligibleFor) },
    {
      header: "Active",
      render: (s) =>
        s.isActive ? (
          <span className="text-green-600 font-bold">Active</span>
        ) : (
          <span className="text-red-500 font-bold">Inactive</span>
        ),
    },
    {
      header: "GST Bill",
      render: (s) =>
        s.isGSTBill ? (
          <span className="text-blue-600 font-bold">Yes</span>
        ) : (
          <span className="text-gray-500 font-bold">No</span>
        ),
    },
    {
      header: "Actions",
      render: (s) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="success"
            onClick={() => openStdModal(s)}
            startIcon={<Edit size={14} />}
          >
            Edit
          </Button>
          <Button
            variant={s.isActive ? "warning" : "info"}
            onClick={() => toggleStandardActive(s)}
            startIcon={
              s.isActive ? (
                <ToggleLeft size={14} />
              ) : (
                <ToggleRight size={14} />
              )
            }
          >
            {s.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/dashboard/standards/${s.id}/receipt-bills`, {
                state: { standard: s },
              })
            }
            startIcon={<ReceiptText size={14} />}
          >
            Receipt Bills
          </Button>
          <Button
            variant={s.isGSTBill ? "info" : "outline"}
            onClick={() => toggleStandardGstBill(s)}
          >
            {s.isGSTBill ? "GST: On" : "GST: Off"}
          </Button>
        </div>
      ),
    },
  ];

  const subjectColumns = [
    { header: "Code", accessor: "subjectCode" },
    { header: "Subject Name", accessor: "subjectName", cellClass: "font-medium" },
    { header: "Standard", accessor: "standard" },
    { header: "Med/Grp", accessor: "subGroup" },
    { header: "Marks", accessor: "marks" },
    { header: "Language", accessor: "language" },
    { header: "Exam Date", render: (sub) => formatDate(sub.examDate) },
    {
      header: "Exam Time",
      render: (sub) => sub.examTime || "Not set",
    },
    {
      header: "Hall/Result",
      render: (sub) =>
        sub.forExam ? (
          <span className="text-green-600 font-bold">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
    },
    {
      header: "Quiz",
      render: (sub) =>
        sub.forQuiz ? (
          <span className="text-green-600 font-bold">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
    },
    {
      header: "Active",
      render: (sub) =>
        sub.isActive ? (
          <span className="text-green-600 font-bold">Active</span>
        ) : (
          <span className="text-red-500 font-bold">Inactive</span>
        ),
    },
    {
      header: "Actions",
      render: (sub) => (
        <div className="flex gap-1 justify-center">
          <Button
            variant="success"
            onClick={() => openSubModal(sub)}
            startIcon={<Edit size={14} />}
          >
            Edit
          </Button>
          <Button
            variant={sub.isActive ? "warning" : "info"}
            onClick={() => toggleSubjectActive(sub)}
            startIcon={
              sub.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />
            }
          >
            {sub.isActive ? "Deact" : "Act"}
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteSubject(sub)}
            startIcon={<Trash size={14} />}
          >
            Del
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
          <div className="mb-4">
            <Button
              startIcon={<Plus size={16} />}
              variant="primary"
              onClick={() => openStdModal()}
            >
              Add Standard
            </Button>
          </div>

          <div className="bg-white rounded shadow-custom overflow-x-auto">
            <DataTable
              columns={standardColumns}
              data={standards}
              rowKey="id"
              emptyMessage="No standards found."
            />
          </div>
        </div>
      )}

      {/* ================= SUBJECTS TAB ================= */}
      {activeTab === "subjects" && (
        <div>
          <div className="mb-4">
            <Button
              startIcon={<Plus size={16} />}
              variant="primary"
              onClick={() => openSubModal()}
            >
              Add Subject
            </Button>
          </div>

          <div className="bg-white rounded shadow-custom overflow-x-auto">
            <DataTable
              columns={subjectColumns}
              data={subjects}
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
                  className="w-full p-2 border border-gray-300 rounded"
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
                  className="w-full p-2 border border-gray-300 rounded"
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
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="GROUP">GROUP</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Branches*</label>
                <input
                  type="text"
                  value={stdForm.branches}
                  onChange={(e) =>
                    setStdForm({ ...stdForm, branches: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="comma separated, e.g. PCM, PCB"
                />
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
                    .filter((s) => s.id !== editingStandard?.id)
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
                  Leave none selected = eligible for everything.
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
                  className="w-full p-2 border border-gray-300 rounded"
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
                  value={subForm.standard}
                  onChange={handleSubChange}
                  name="standard"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Med/Grp*</label>
                <select
                  value={subForm.subGroup}
                  onChange={handleSubChange}
                  name="subGroup"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Med/Grp</option>
                  {subGroupOptions().map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
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
                <input
                  type="text"
                  value={subForm.examTime}
                  onChange={handleSubChange}
                  name="examTime"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g. 11:00 AM - 1:00 PM"
                />
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
