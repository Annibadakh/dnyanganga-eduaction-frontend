import { useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const VisitingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    dob: "",
    motherName: "",
    address: "",
    pincode: "",
    standard: "",
    branch: "",
    schoolCollege: "",
    previousYearPercent: "",
    email: "",
    studentNo: "",
    parentsNo: "",
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
          branch: ""
        });
        setShow10thBranchDropdown(true);
        setShowBranchDropdown(false);
      } else if (value === "12th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(true);
        setShow10thBranchDropdown(false);
      } else {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(false);
        setShow10thBranchDropdown(false);
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
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Visiting Form</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 w-full">
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="text" 
                  name="studentName" 
                  placeholder="Student Name" 
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
                  <label className="text-[17px] mr-4 text-gray-600">DOB:</label>
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
                  name="motherName" 
                  value={formData.motherName}
                  onChange={handleChange} 
                  placeholder="Mother's Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address}
                  onChange={handleChange} 
                  placeholder="Address" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 md:col-span-2"
                  required
                />
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode}
                  onChange={handleChange} 
                  placeholder="PINCODE" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="\d{6}"
                  title="Pincode must be 6 digits"
                />
              </div>
            </div>
  
            {/* Educational and Contact Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Educational and Contact Details</h3>
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
                    <option value="">Select Branch</option>
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Semi-English">Semi-English</option>
                  </select>
                ) : showBranchDropdown ? (
                  <select 
                    name="branch" 
                    value={formData.branch}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="PCM">PCM</option>
                    <option value="PCB">PCB</option>
                    <option value="PCMB">PCMB</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleChange} 
                    placeholder="Branch" 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                )}
                
                <input 
                  type="text" 
                  name="schoolCollege" 
                  value={formData.schoolCollege}
                  onChange={handleChange} 
                  placeholder="School/College" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <input 
                  type="number" 
                  name="previousYearPercent" 
                  placeholder="Previous Year Percentage" 
                  value={formData.previousYearPercent} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                  min="0" max="100" step="0.01"
                />
              </div>
            </div>
              
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange} 
                  placeholder="Student Email" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <input 
                  type="tel" 
                  name="studentNo" 
                  value={formData.studentNo}
                  onChange={handleChange} 
                  placeholder="Student No" 
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
                  placeholder="Parents No" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
              </div>
            </div>
            
            {/* Additional Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <select 
                  name="demoGiven" 
                  value={formData.demoGiven}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Reason</option>
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
                    placeholder="Please enter your reason here..." 
                    value={formData.otherReason} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                    required
                    rows="3"
                  ></textarea>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 bg-primary text-white rounded hover:bg-opacity-90 transition"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitingForm;