import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../Api";
import { useToast } from "../../useToast";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import Button from "../Generic/Button";
import CustomSelect from "../Generic/CustomSelect";
import { fileUrl } from "../../utils/fileUrl";

// Limited edit for the student's owner (the counsellor / sub-admin who registered them).
// Only Student Photo, Med/Grp, Mother Name and Exam Centre are editable — everything else is read-only.
// The exam centre is locked once a seat number is assigned (the server checks this too).
const OwnerStudentEdit = ({ student, onClose, onSaved }) => {
  const { successToast, errorToast } = useToast();
  const studentPhoto = FileUploadHook();

  const [motherName, setMotherName] = useState(student.motherName || "");
  const [branch, setBranch] = useState(student.branch || "");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchType, setBranchType] = useState("");
  const [examCentre, setExamCentre] = useState(student.examCentre ? String(student.examCentre) : "");
  const [examCentres, setExamCentres] = useState([]);
  const seatAssigned = Number(student.SeatNum) > 0;

  // Searchable exam centre select, same as the registration form ({ value, label } options).
  // The current centre stays selectable until the list has loaded.
  const centreOptions = examCentres.map((c) => ({ value: String(c.centerId), label: c.centerName }));
  if (examCentre && !centreOptions.some((o) => o.value === examCentre)) {
    centreOptions.unshift({ value: examCentre, label: student.ExamCenter?.centerName || examCentre });
  }
  const selectedCentre = centreOptions.find((o) => o.value === examCentre) || null;
  const [saving, setSaving] = useState(false);

  // Med/Grp options come from the student's standard
  useEffect(() => {
    api
      .get("/simple/standards")
      .then((response) => {
        const std = (response.data.data || []).find(
          (s) =>
            s.id === student.standardId ||
            (s.name && s.name === student.standard),
        );
        if (!std) return;
        let branches = std.branches;
        if (typeof branches === "string") {
          try {
            branches = JSON.parse(branches);
          } catch {
            branches = [];
          }
        }
        setBranchOptions(Array.isArray(branches) ? branches : []);
        setBranchType(std.branchType || "");
      })
      .catch((err) => console.error("Error fetching standards", err));
  }, [student.standardId, student.standard]);

  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((response) => setExamCentres(response.data.data || []))
      .catch((err) => console.error("Error fetching exam centres", err));
  }, []);

  const handlePhotoUpload = async (type) => {
    const url = await studentPhoto.uploadImage(type);
    if (url && url.trim() !== "") setNewPhotoUrl(url);
  };

  const handleRemovePhoto = () => {
    studentPhoto.removePhoto();
    setNewPhotoUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (studentPhoto.file && !studentPhoto.isSaved) {
      errorToast("Please save the new photo first");
      return;
    }
    if (!examCentre) {
      errorToast("Please select an exam centre");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(
        `/counsellor/updateStudentByOwner/${student.studentId}`,
        {
          motherName,
          branch,
          examCentre: examCentre ? Number(examCentre) : undefined,
          studentPhoto: newPhotoUrl || undefined,
        },
      );
      successToast(res.data.message || "Student updated successfully");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error updating student", err);
      errorToast(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-GB") : "-";

  const readOnlyFields = [
    { label: "Student ID", value: student.studentId },
    { label: "Student Name", value: student.studentName },
    { label: "Gender", value: student.gender },
    { label: "Date Of Birth", value: formatDate(student.dob) },
    { label: "Standard", value: student.standard },
    { label: "Exam Year", value: student.examYear },
    { label: "Student No.", value: student.studentNo },
    { label: "Parent No.", value: student.parentsNo },
    { label: "Email", value: student.email },
    { label: "School/College", value: student.schoolCollege },
    { label: "Address", value: student.address },
    { label: "Register Date", value: formatDate(student.createdAt) },
    { label: "Total Amount", value: student.totalAmount?.toLocaleString("en-IN") },
    { label: "Paid", value: student.amountPaid?.toLocaleString("en-IN") },
    { label: "Remaining", value: student.amountRemaining?.toLocaleString("en-IN") },
  ];

  const inputClass =
    "w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition text-gray-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white m-2 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl text-secondary font-bold">Edit Student</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Editable fields */}
          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold text-tertiary mb-4">
              Editable Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 flex flex-col items-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Photo
                </p>
                {student.studentPhoto ? (
                  <img
                    src={fileUrl(student.studentPhoto)}
                    alt="Student"
                    className="w-32 h-40 object-cover rounded border"
                  />
                ) : (
                  <div className="w-32 h-40 flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-500">
                    No Photo Available
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Upload New Photo (Optional)
                </p>
                <FileUpload
                  title="Select New Student Photo"
                  imageUrl={studentPhoto.imageUrl}
                  error={studentPhoto.error}
                  loader={studentPhoto.loader}
                  isSaved={studentPhoto.isSaved}
                  imageType="students"
                  onFileUpload={studentPhoto.handleFileUpload}
                  onUploadImage={handlePhotoUpload}
                  onRemovePhoto={handleRemovePhoto}
                />
                {studentPhoto.imageUrl && (
                  <p className="mt-2 text-center text-sm text-green-600 font-medium">
                    {studentPhoto.isSaved
                      ? "✓ Photo ready for update"
                      : "Please save the photo first"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother Name
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Enter Mother Name"
                  className={`${inputClass} uppercase`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {branchType === "GROUP"
                    ? "Group"
                    : branchType === "MEDIUM"
                      ? "Medium"
                      : "Med/Grp"}
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                  required
                >
                  <option value="">
                    {branchType === "GROUP" ? "Select Group" : "Select Medium"}
                  </option>
                  {/* keep the current value selectable even if it is no longer configured */}
                  {branch && !branchOptions.includes(branch) && (
                    <option value={branch}>{branch}</option>
                  )}
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Centre
                </label>
                <CustomSelect
                  options={centreOptions}
                  value={selectedCentre}
                  onChange={(v) => setExamCentre(v?.value ?? "")}
                  isDisabled={seatAssigned}
                  isRequired={true}
                  placeholder="Select Exam Centre"
                />
                {seatAssigned && (
                  <p className="mt-1 text-xs text-gray-500">
                    Locked: a seat number is already assigned at this centre.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-tertiary mb-4">
              Other Details (Read-only)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {readOnlyFields.map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={field.value ?? "-"}
                    readOnly
                    disabled
                    className="w-full px-3 h-[38px] text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Update Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerStudentEdit;
