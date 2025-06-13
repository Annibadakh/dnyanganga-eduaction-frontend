import React, { useState, useEffect } from "react";
import api from "../Api";

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "counsellor",
    contactNum: "",
    branch: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api
      .get("/admin/getUser")
      .then((response) => {
        setUsers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users", error);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { 
      ...formData,
      branch: formData.role === "counsellor" ? formData.branch : null,
      password: formData.email };
    setSubmitLoader(true);
    api
      .post("/auth/register", newUser)
      .then(() => {
        alert("user added !!");
        fetchUsers();
        setShowForm(false);
        setSubmitLoader(false);
        setFormData({ name: "", email: "", role: "counsellor" ,conatctNum: "", branch: ""});
      })
      .catch((error) => {
        console.error("Error adding user", error);
        setSubmitLoader(false);
      });
  };

  const handleDelete = (uuid) => {
    setUpdateLoader(uuid);
    api
      .delete(`/admin/deleteUser/${uuid}`)
      .then(() => {
        fetchUsers();
        setUpdateLoader(null);
      })
      .catch((error) => {
        console.error("Error deleting user", error);
        setUpdateLoader(null);
      });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Add User
      </button>

      {showForm && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Contact Number: </label>
              <input
                type="text"
                name="contactNum"
                value={formData.contactNum}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="counsellor">Counsellor</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            {formData.role === "counsellor" && (
              <div>
                <label className="block text-gray-700 font-semibold">Branch:</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitLoader}
                className="bg-green-500 min-w-20 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-green-600 grid place-items-center  "
              >
                {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitLoader}
                className="bg-gray-500 text-white disabled:opacity-50 px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Table */}
      <div className="mt-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Sr. No</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Contact No.</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.uuid} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2 text-center">{user.role}</td>
                  <td className="border p-2 text-center">{user.contactNum}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDelete(user.uuid)}
                      disabled={updateLoader == user.uuid}
                      className={`${user.isActive ? "bg-red-500" : "bg-green-500"} disabled:opacity-50 text-white grid place-items-center px-3 py-1 w-24 rounded-md ${user.isActive ? "hover:bg-green-500" : "hover:bg-red-500"}`}
                    >
                      {updateLoader == user.uuid ? <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span> : (user.isActive ? "Deactivate" : "Activate")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="border p-2 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddUser;
