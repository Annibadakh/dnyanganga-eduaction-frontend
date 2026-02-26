import { useState, useEffect } from "react";
import api from "../../Api";

const VisitingFormEdit = ({ visitData, onClose, onUpdate }) => {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [showPreviousYearDropdown, setShowPreviousYearDropdown] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    address: "",
    standard: "",
    previousYear: "",
    branch: "",
    schoolCollege: "",
    previousYearPercent: "",
    studentNo: "",
    parentsNo: "",
    notificationNo: "",
    demoGiven: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  // Populate form with existing data
  useEffect(() => {
    if (visitData) {
      setFormData({
        studentName: visitData.studentName || "",
        gender: visitData.gender || "",
        address: visitData.address || "",
        standard: visitData.standard || "",
        previousYear: visitData.previousYear || "",
        branch: visitData.branch || "",
        schoolCollege: visitData.schoolCollege || "",
        previousYearPercent: visitData.previousYearPercent || "",
        studentNo: visitData.studentNo || "",
        parentsNo: visitData.parentsNo || "",
        notificationNo: visitData.notificationNo || "",
        demoGiven: visitData.demoGiven || "",
        reason: visitData.reason || "",
      });

      // Dropdown logic based on standard
      const std = visitData.standard;

      if (std === "9th+10th" || std === "10th") {
        setShow10thBranchDropdown(true);
        setShowPreviousYearDropdown(true);
      } else if (std === "11th+12th" || std === "12th") {
        setShowBranchDropdown(true);
        setShowPreviousYearDropdown(true);
      }
    }
  }, [visitData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      let newPreviousYear = "";
      let newBranch = "";
      let showBranch = false;
      let show10thBranch = false;
      let showPrevYear = false;

      if (value === "9th+10th") {
        newPreviousYear = "8th";
        show10thBranch = true;
        showPrevYear = true;
      } else if (value === "10th") {
        newPreviousYear = "9th";
        show10thBranch = true;
        showPrevYear = true;
      } else if (value === "11th+12th") {
        newPreviousYear = "10th";
        showBranch = true;
        showPrevYear = true;
      } else if (value === "12th") {
        newPreviousYear = "11th";
        showBranch = true;
        showPrevYear = true;
      }

      setFormData({
        ...formData,
        [name]: value,
        branch: newBranch,
        previousYear: newPreviousYear,
      });

      setShow10thBranchDropdown(show10thBranch);
      setShowBranchDropdown(showBranch);
      setShowPreviousYearDropdown(showPrevYear);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(
        `/counsellor/visiting/${visitData.id}`,
        formData
      );

      alert(response.data.message || "Visit updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      if (error.response?.status === 409) {
        alert(error.response.data.message);
      } else {
        alert(error.response?.data?.message || "Error updating form.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Student Visit</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Personal Details */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">
              Student Personal Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter Student Name"
                className="px-3 py-2 border rounded"
                required
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                className="px-3 py-2 border rounded lg:col-span-2"
                required
              />
            </div>
          </div>

          {/* Educational Details */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">
              Student Educational Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <select
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="">Select Standard</option>
                <option value="9th+10th">9th+10th</option>
                <option value="10th">10th</option>
                <option value="11th+12th">11th+12th</option>
                <option value="12th">12th</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="min-w-fit text-gray-600">
                  Previous Year:
                </label>

                <input
                  type="text"
                  name="previousYear"
                  value={formData.previousYear}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>

              {show10thBranchDropdown ? (
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Medium</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Semi-English">Semi-English</option>
                  <option value="English">English</option>
                </select>
              ) : showBranchDropdown ? (
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Group</option>
                  <option value="PCM">PCM</option>
                  <option value="PCB">PCB</option>
                  <option value="PCMB">PCMB</option>
                </select>
              ) : null}

              <input
                type="number"
                name="previousYearPercent"
                value={formData.previousYearPercent}
                onChange={handleChange}
                placeholder="Enter Previous Year Percentage"
                className="px-3 py-2 border rounded"
                required
              />

              <input
                type="text"
                name="schoolCollege"
                value={formData.schoolCollege}
                onChange={handleChange}
                placeholder="Enter School/College Name"
                className="px-3 py-2 border rounded lg:col-span-2"
                required
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">
              Student Contact Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="tel"
                name="studentNo"
                value={formData.studentNo}
                onChange={handleChange}
                placeholder="Enter Student Mobile No."
                className="px-3 py-2 border rounded"
                required
              />

              <input
                type="tel"
                name="parentsNo"
                value={formData.parentsNo}
                onChange={handleChange}
                placeholder="Enter Parent Mobile No."
                className="px-3 py-2 border rounded"
                required
              />

              <select
                name="notificationNo"
                value={formData.notificationNo}
                onChange={handleChange}
                className="px-3 py-2 border rounded lg:col-span-2"
                required
              >
                <option value="">Select Notification No.</option>

                {formData.studentNo && (
                  <option value={formData.studentNo}>
                    Student Mobile ({formData.studentNo})
                  </option>
                )}

                {formData.parentsNo && (
                  <option value={formData.parentsNo}>
                    Parent Mobile ({formData.parentsNo})
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">
              Additional Details
            </h3>

            <select
              name="demoGiven"
              value={formData.demoGiven}
              onChange={handleChange}
              className="px-3 py-2 border rounded w-full"
              required
            >
              <option value="">Demo Given?</option>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>

            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason For Not Taking Admission"
              className="w-full mt-4 px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded"
            >
              {loading ? "Updating..." : "Update Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitingFormEdit;