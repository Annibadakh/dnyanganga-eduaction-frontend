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
      const response = await api.post("/visiting/submit", formData, {
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
  <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
    {/* Time and Date Inputs */}
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="time" className="text-sm font-medium mb-1">Time</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="date" className="text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    {/* Name Inputs */}
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label htmlFor="firstName" className="text-sm font-medium mb-1">First Name</label>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName.toUpperCase()}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="middleName" className="text-sm font-medium mb-1">Middle Name</label>
        <input
          type="text"
          name="middleName"
          placeholder="Middle Name"
          value={formData.middleName.toUpperCase()}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="lastName" className="text-sm font-medium mb-1">Last Name</label>
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName.toUpperCase()}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          required
        />
      </div>
    </div>

    {/* Gender and School/College Inputs (Responsive 1 or 2 columns) */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="gender" className="text-sm font-medium mb-1">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="schoolCollege" className="text-sm font-medium mb-1">School/College</label>
        <input
          type="text"
          name="schoolCollege"
          placeholder="School/College"
          value={formData.schoolCollege}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    {/* Address and Contact Inputs (Responsive 1 or 2 columns) */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="address" className="text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="studentContact" className="text-sm font-medium mb-1">Student Contact No</label>
        <input
          type="tel"
          name="studentContact"
          placeholder="Student Contact No"
          value={formData.studentContact}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    {/* Parents Contact and Standard Inputs (Responsive 1 or 2 columns) */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="parentsContact" className="text-sm font-medium mb-1">Parents Contact No</label>
        <input
          type="tel"
          name="parentsContact"
          placeholder="Parents Contact No"
          value={formData.parentsContact}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="standard" className="text-sm font-medium mb-1">Standard</label>
        <input
          type="text"
          name="standard"
          placeholder="Standard"
          value={formData.standard}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    {/* Demo Given and Reason Inputs (Responsive 1 or 2 columns) */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="demoGiven" className="text-sm font-medium mb-1">Demo Given</label>
        <input
          type="text"
          name="demoGiven"
          placeholder="Demo Given"
          value={formData.demoGiven}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="reason" className="text-sm font-medium mb-1">Reason</label>
        <textarea
          name="reason"
          placeholder="Reason"
          value={formData.reason}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
      </div>
    </div>

    {/* Counselor and Branch Inputs (Responsive 1 or 2 columns) */}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label htmlFor="counselorName" className="text-sm font-medium mb-1">Counselor</label>
        <select
          name="counselorName"
          value={formData.counselorName}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Counselor</option>
          <option value="Counselor 1">Counselor 1</option>
          <option value="Counselor 2">Counselor 2</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="branch" className="text-sm font-medium mb-1">Branch</label>
        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Branch</option>
          <option value="Branch 1">Branch 1</option>
          <option value="Branch 2">Branch 2</option>
        </select>
      </div>
    </div>

    {/* Submit Button */}
    <div className="flex justify-center mt-4">
      <button
        type="submit"
        className="bg-blue-500 text-white py-3 px-8 rounded-lg text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  </form>
</div>


  );
};

export default VisitingForm;
