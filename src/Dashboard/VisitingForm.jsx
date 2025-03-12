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
    <div className="w-auto mx-auto p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Visiting Form</h2>
      {message && <p className="text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="p-2 border rounded" required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName.toUpperCase()} onChange={handleChange} className="p-2 border rounded uppercase" required />
          <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName.toUpperCase()} onChange={handleChange} className="p-2 border rounded uppercase" />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName.toUpperCase()} onChange={handleChange} className="p-2 border rounded uppercase" required />
        </div>
        <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" name="schoolCollege" placeholder="School/College" value={formData.schoolCollege} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="p-2 border rounded" required />
        <input type="tel" name="studentContact" placeholder="Student Contact No" value={formData.studentContact} onChange={handleChange} className="p-2 border rounded" required />
        <input type="tel" name="parentsContact" placeholder="Parents Contact No" value={formData.parentsContact} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="standard" placeholder="Standard" value={formData.standard} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="demoGiven" placeholder="Demo Given" value={formData.demoGiven} onChange={handleChange} className="p-2 border rounded" required />
        <textarea name="reason" placeholder="Reason" value={formData.reason} onChange={handleChange} className="p-2 border rounded" required></textarea>
        <select name="counselorName" value={formData.counselorName} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Counselor</option>
          <option value="Counselor 1">Counselor 1</option>
          <option value="Counselor 2">Counselor 2</option>
        </select>
        <select name="branch" value={formData.branch} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Branch</option>
          <option value="Branch 1">Branch 1</option>
          <option value="Branch 2">Branch 2</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default VisitingForm;
