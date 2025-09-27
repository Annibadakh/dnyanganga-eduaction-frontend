import { useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const VisitingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [showPreviousYearDropdown, setShowPreviousYearDropdown] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    dob: "",
    motherName: "not require",
    address: "",
    pincode: "",
    standard: "",
    previousYear: "", // Added previousYear field
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      // Updated auto-selection logic for all standards
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

  const resetForm = () => {
    setFormData({
      studentName: "",
      gender: "",
      dob: "",
      address: "",
      pincode: "",
      standard: "",
      previousYear: "", // Reset previousYear
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
    setShowBranchDropdown(false);
    setShow10thBranchDropdown(false);
    setShowPreviousYearDropdown(false);
    setShowOtherReason(false);
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
      const response = await api.post("/counsellor/visiting", formDataToSend);
      alert(response.data.message);
      navigate("/dashboard/visitingtable");
    } catch (error) {
      if (error.response?.status === 409) {
        alert(error.response.data.message); // Show duplicate notification alert
      } else {
        alert(error.response?.data?.message || "Error submitting form.");
      }
    } finally {
      setLoading(false);
    }
};


  return (
    <div className="w-full bg-white">
      <div className="container w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Student Visiting Form</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full">
            {/* Personal Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Personal Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <input 
                  type="text" 
                  name="studentName" 
                  placeholder="Enter Student Name" 
                  value={formData.studentName} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base" 
                  required 
                />
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit md:text-[17px] text-md mr-2 text-black">Date of Birth:</label>
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                />
                <input 
                  type="number" 
                  name="pincode" 
                  value={formData.pincode}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange} 
                  placeholder="Enter Pincode" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="\d{6}"
                  title="Pincode must be 6 digits"
                />
              </div>
            </div>

            {/* Educational Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Educational Details</h3>
              <div className="flex flex-col gap-3 sm:gap-4 w-full lg:grid lg:grid-cols-2">
                <select 
                  name="standard" 
                  value={formData.standard}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-1"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="9th+10th">9th+10th</option>
                  <option value="10th">10th</option>
                  <option value="11th+12th">11th+12th</option>
                  <option value="12th">12th</option>
                </select>

                {/* Auto-filled Previous Year Field */}
                <div className="w-full flex flex-row items-center gap-1 order-2">
                  <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Previous Year:</label>
                  <input 
                    type="text" 
                    name="previousYear" 
                    value={formData.previousYear}
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base"
                    disabled
                    readOnly
                  />
                </div>

                {show10thBranchDropdown ? (
                  <select 
                    name="branch" 
                    value={formData.branch}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
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
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
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
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-4" 
                  required 
                  min="0" max="100" step="0.01"
                />

                <input 
                  type="text" 
                  name="schoolCollege" 
                  value={formData.schoolCollege}
                  onChange={handleChange} 
                  placeholder="Enter School/College Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base order-5"
                  required
                />
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Contact Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange} 
                  placeholder="Enter Student Email" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <input 
                  type="tel" 
                  name="studentNo" 
                  value={formData.studentNo}
                  onChange={handleChange} 
                  placeholder="Enter Student Mobile No." 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <select 
                  name="notificationNo" 
                  value={formData.notificationNo}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
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
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Additional Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <select 
                  name="demoGiven" 
                  value={formData.demoGiven}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
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
                <div className="mt-3 sm:mt-4">
                  <textarea 
                    name="otherReason" 
                    placeholder="Enter your reason here..." 
                    value={formData.otherReason} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base resize-vertical" 
                    required
                    rows="3"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="grid place-items-center  w-full">
              <button 
                type="submit" 
                className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitingForm;