import { useState, useEffect } from "react";
import api from "../Api";

const VisitingFormEdit = ({ visitData, onClose, onUpdate }) => {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [showPreviousYearDropdown, setShowPreviousYearDropdown] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    dob: "",
    address: "",
    pincode: "",
    standard: "",
    previousYear: "",
    branch: "",
    schoolCollege: "",
    previousYearPercent: "",
    email: "",
    studentNo: "",
    parentsNo: "",
    notificationNo: "",
    demoGiven: "",
    reason: "",
    otherReason: "",
  });

  const [loading, setLoading] = useState(false);

  // Populate form with existing data
  useEffect(() => {
    if (visitData) {
      const isOtherReason = ![
        "पैश्याची अडचण",
        "विश्वास नाही",
        "विद्यार्थी इच्छुक नाही",
        "पालक इच्छुक नाहीत",
        "उपक्रम समजला नाही",
        "जागृकता नाही",
        "उपक्रम न ऐकलेल्या व्यक्तीचा हस्तक्षेप",
        "मागील वर्षातील विद्यार्थ्यांचे नकारात्मक परिणाम / निरीक्षणे"
      ].includes(visitData.reason);

      setFormData({
        studentName: visitData.studentName || "",
        gender: visitData.gender || "",
        dob: visitData.dob ? visitData.dob.split('T')[0] : "",
        address: visitData.address || "",
        pincode: visitData.pincode || "",
        standard: visitData.standard || "",
        previousYear: visitData.previousYear || "",
        branch: visitData.branch || "",
        schoolCollege: visitData.schoolCollege || "",
        previousYearPercent: visitData.previousYearPercent || "",
        email: visitData.email || "",
        studentNo: visitData.studentNo || "",
        parentsNo: visitData.parentsNo || "",
        notificationNo: visitData.notificationNo || "",
        demoGiven: visitData.demoGiven || "",
        reason: isOtherReason ? "Other" : visitData.reason || "",
        otherReason: isOtherReason ? visitData.reason : "",
      });

      // Set dropdown visibility based on standard
      const std = visitData.standard;
      if (std === "9th+10th" || std === "10th") {
        setShow10thBranchDropdown(true);
        setShowPreviousYearDropdown(true);
      } else if (std === "11th+12th" || std === "12th") {
        setShowBranchDropdown(true);
        setShowPreviousYearDropdown(true);
      }

      setShowOtherReason(isOtherReason);
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
        previousYear: newPreviousYear
      });
      
      setShow10thBranchDropdown(show10thBranch);
      setShowBranchDropdown(showBranch);
      setShowPreviousYearDropdown(showPrevYear);
    } else if (name === "reason") {
      setFormData({ ...formData, [name]: value });
      if (value === "Other") {
        setShowOtherReason(true);
      } else {
        setShowOtherReason(false);
        setFormData(prev => ({ ...prev, otherReason: "" }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = {};
    Object.keys(formData).forEach(key => {
      if (key === "reason" && formData.reason === "Other") {
        formDataToSend[key] = formData.otherReason;
      } else if (key !== "otherReason") {
        formDataToSend[key] = formData[key];
      }
    });

    try {
      const response = await api.put(`/counsellor/visiting/${visitData.id}`, formDataToSend);
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
          {/* Personal Details Section */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Personal Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input 
                type="text" 
                name="studentName" 
                placeholder="Enter Student Name" 
                value={formData.studentName} 
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                required 
              />
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="flex items-center gap-2">
                <label className="min-w-fit text-black">Date of Birth:</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              <input 
                type="text" 
                name="address" 
                value={formData.address}
                onChange={handleChange} 
                placeholder="Enter Address" 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <input 
                type="number" 
                name="pincode" 
                value={formData.pincode}
                onWheel={(e) => e.target.blur()}
                onChange={handleChange} 
                placeholder="Enter Pincode" 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="\d{6}"
                title="Pincode must be 6 digits"
              />
            </div>
          </div>

          {/* Educational Details Section */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Educational Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <select 
                name="standard" 
                value={formData.standard}
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Select Standard</option>
                <option value="9th+10th">9th+10th</option>
                <option value="10th">10th</option>
                <option value="11th+12th">11th+12th</option>
                <option value="12th">12th</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="min-w-fit text-gray-600">Previous Year:</label>
                <input 
                  type="text" 
                  name="previousYear" 
                  value={formData.previousYear}
                  className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {show10thBranchDropdown ? (
                <select 
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange} 
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Group</option>
                  <option value="PCM">PCM</option>
                  <option value="PCB">PCB</option>
                  <option value="PCMB">PCMB</option>
                </select>
              ) : (
                !showPreviousYearDropdown && (
                  <input 
                    type="text" 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleChange} 
                    placeholder="Medium/Group" 
                    disabled={!showPreviousYearDropdown}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                )
              )}

              <input 
                type="number" 
                name="previousYearPercent" 
                placeholder="Enter Previous Year Percentage" 
                value={formData.previousYearPercent}
                onWheel={(e) => e.target.blur()} 
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                required 
                min="0" max="100" step="0.01"
              />

              <input 
                type="text" 
                name="schoolCollege" 
                value={formData.schoolCollege}
                onChange={handleChange} 
                placeholder="Enter School/College Name" 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2"
                required
              />
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Contact Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange} 
                placeholder="Enter Student Email" 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
              <input 
                type="tel" 
                name="studentNo" 
                value={formData.studentNo}
                onChange={handleChange} 
                placeholder="Enter Student Mobile No." 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[0-9]{10}"
                title="Phone number must be 10 digits"
              />
              <input 
                type="tel" 
                name="parentsNo" 
                value={formData.parentsNo}
                onChange={handleChange} 
                placeholder="Enter Parent Mobile No." 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[0-9]{10}"
                title="Phone number must be 10 digits"
              />
              <select 
                name="notificationNo" 
                value={formData.notificationNo}
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Select Notification No.</option>
                {formData.studentNo && (
                  <option value={formData.studentNo}>
                    Student Mobile No. ({formData.studentNo})
                  </option>
                )}
                {formData.parentsNo && (
                  <option value={formData.parentsNo}>
                    Parent Mobile No. ({formData.parentsNo})
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Additional Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <select 
                name="demoGiven" 
                value={formData.demoGiven}
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Demo Given?</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
              <select 
                name="reason" 
                value={formData.reason}
                onChange={handleChange} 
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Reason For Not Taking Admission</option>
                <option value="पैश्याची अडचण">पैश्याची अडचण</option>
                <option value="विश्वास नाही">विश्वास नाही</option>
                <option value="विद्यार्थी इच्छुक नाही">विद्यार्थी इच्छुक नाही</option>
                <option value="पालक इच्छुक नाहीत">पालक इच्छुक नाहीत</option>
                <option value="उपक्रम समजला नाही">उपक्रम समजला नाही</option>
                <option value="जागृकता नाही">जागृकता नाही</option>
                <option value="उपक्रम न ऐकलेल्या व्यक्तीचा हस्तक्षेप">उपक्रम न ऐकलेल्या व्यक्तीचा हस्तक्षेप</option>
                <option value="मागील वर्षातील विद्यार्थ्यांचे नकारात्मक परिणाम / निरीक्षणे">मागील वर्षातील विद्यार्थ्यांचे नकारात्मक परिणाम / निरीक्षणे</option>
                <option value="Other">Other (Enter Reason Below)</option>
              </select>
            </div>

            {showOtherReason && (
              <div className="mt-4">
                <textarea 
                  name="otherReason" 
                  placeholder="Enter your reason here..." 
                  value={formData.otherReason} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical" 
                  required
                  rows="1"
                  maxLength="40"
                ></textarea>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary text-white rounded hover:bg-opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  Updating...
                </>
              ) : (
                "Update Visit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitingFormEdit;