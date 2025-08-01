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
      if (value === "10th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: ""
        });
        setShow10thBranchDropdown(true);
        setShowBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      } else if (value === "12th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: ""
        });
        setShowBranchDropdown(true);
        setShow10thBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      } else {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: ""
        });
        setShowBranchDropdown(false);
        setShow10thBranchDropdown(false);
        setShowPreviousYearDropdown(false);
      }
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

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "reason" && formData.reason === "Other") {
        formDataToSend.append(key, formData.otherReason);
      } else if (key !== "otherReason") {
        formDataToSend.append(key, formData[key]);
      }
    });

    if(user?.uuid){
      formDataToSend.append("uuid", user.uuid);
      formDataToSend.append("counsellor", user.userName);
      formDataToSend.append("counsellorBranch", user.branch);
    }

    try {
      const response = await api.post("/counsellor/visiting", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      alert(response.data.message);
      navigate("/dashboard/visitingtable");
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Student Visiting Form</h2>
          </div>
          <form onSubmit={handleSubmit} className="md:p-6 p-2 space-y-6 w-full">
            <div className="mb-6 w-full border rounded-lg shadow-sm md:p-6 p-2">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="text" 
                  name="studentName" 
                  placeholder="Enter Student Name" 
                  value={formData.studentName} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                />
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="text-[17px] min-w-fit text-black">Date of Birth:</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                {/* <input 
                  type="text" 
                  name="motherName" 
                  value={formData.motherName}
                  onChange={handleChange} 
                  placeholder="Enter Mother's Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                /> */}
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address}
                  onChange={handleChange} 
                  placeholder="Enter Address" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 md:col-span-2"
                  required
                />
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode}
                  onChange={handleChange} 
                  placeholder="Enter Pincode" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="\d{6}"
                  title="Pincode must be 6 digits"
                />
              </div>
            </div>

            <div className="mb-6 w-full border rounded-lg shadow-sm md:p-6 p-2">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Educational Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <select 
                  name="standard" 
                  value={formData.standard}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>

                {show10thBranchDropdown ? (
                  <select 
                    name="branch" 
                    value={formData.branch}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      required
                    />
                  )
                )}

                <input 
                  type="text" 
                  name="schoolCollege" 
                  value={formData.schoolCollege}
                  onChange={handleChange} 
                  placeholder="Enter School/College Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 col-span-2"
                  required
                />
                
                {/* Previous Year Dropdown - Added from RegistrationForm */}
                <select 
                  name="previousYear" 
                  value={formData.previousYear}
                  disabled={!showPreviousYearDropdown}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Previous Year</option>
                  {formData.standard === "10th" && (
                    <>
                      <option value="8th">8th</option>
                      <option value="9th">9th</option>
                    </>
                  )}
                  {formData.standard === "12th" && (
                    <>
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                    </>
                  )}
                </select>

                <input 
                  type="number" 
                  name="previousYearPercent" 
                  placeholder="Enter Previous Year Percentage" 
                  value={formData.previousYearPercent} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                  min="0" max="100" step="0.01"
                />
              </div>
            </div>

            <div className="mb-6 w-full border rounded-lg shadow-sm md:p-6 p-2">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange} 
                  placeholder="Enter Student Email" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <input 
                  type="tel" 
                  name="studentNo" 
                  value={formData.studentNo}
                  onChange={handleChange} 
                  placeholder="Enter Student Mobile No." 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <select 
                  name="notificationNo" 
                  value={formData.notificationNo}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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

            <div className="mb-6 w-full border rounded-lg shadow-sm md:p-6 p-2">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <select 
                  name="demoGiven" 
                  value={formData.demoGiven}
                  onChange={handleChange} 
                  className="w-full px-3 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="w-full px-3 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                    required
                    rows="3"
                  ></textarea>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-3 min-h-12 bg-gray-400 text-white rounded hover:bg-gray-500 transition grid place-items-center"
                disabled={loading}
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="w-full py-3 min-h-12 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50 transition grid place-items-center"
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