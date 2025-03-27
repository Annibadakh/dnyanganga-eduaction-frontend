import { useState } from "react";
import api from "../Api";

const VisitingForm = () => {
  const [formData, setFormData] = useState({
    time: "",
    date: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    schoolCollege: "",
    address: "",
    studentContact: "",
    parentsContact: "",
    standard: "",
    demoGiven: "",
    reason: "",
    counselorName: "",
    branch: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/counsellor/visiting", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage(response.data.message);
      setFormData({
        time: "",
        date: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        schoolCollege: "",
        address: "",
        studentContact: "",
        parentsContact: "",
        standard: "",
        demoGiven: "",
        reason: "",
        counselorName: "",
        branch: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting form.");
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
            {message && <p className="text-center text-red-500 mb-4">{message}</p>}
  
            {/* Date and Time Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Visit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block mb-2 text-sm text-gray-600">Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-600">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                    required 
                  />
                </div>
              </div>
            </div>
  
            {/* Personal Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <input 
                  type="text" 
                  name="firstName" 
                  placeholder="First Name" 
                  value={formData.firstName.toUpperCase()} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase" 
                  required 
                />
                <input 
                  type="text" 
                  name="middleName" 
                  placeholder="Middle Name" 
                  value={formData.middleName.toUpperCase()} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase" 
                />
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Last Name" 
                  value={formData.lastName.toUpperCase()} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase" 
                  required 
                />
              </div>
              
              <div className="mt-4">
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
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
  
            {/* Educational and Contact Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Educational and Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="text" 
                  name="schoolCollege" 
                  placeholder="School/College" 
                  value={formData.schoolCollege} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                />
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                />
                <input 
                  type="tel" 
                  name="studentContact" 
                  placeholder="Student Contact No" 
                  value={formData.studentContact} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <input 
                  type="tel" 
                  name="parentsContact" 
                  placeholder="Parents Contact No" 
                  value={formData.parentsContact} 
                  onChange={handleChange} 
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
                <input 
                  type="text" 
                  name="standard" 
                  placeholder="Standard" 
                  value={formData.standard} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                />
                <input 
                  type="text" 
                  name="demoGiven" 
                  placeholder="Demo Given" 
                  value={formData.demoGiven} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                />
                <select 
                  name="counselorName" 
                  value={formData.counselorName} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required
                >
                  <option value="">Select Counselor</option>
                  <option value="Counselor 1">Counselor 1</option>
                  <option value="Counselor 2">Counselor 2</option>
                </select>
                <select 
                  name="branch" 
                  value={formData.branch} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Branch 1">Branch 1</option>
                  <option value="Branch 2">Branch 2</option>
                </select>
              </div>
              
              <div className="mt-4">
                <textarea 
                  name="reason" 
                  placeholder="Reason" 
                  value={formData.reason} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required
                ></textarea>
              </div>
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
