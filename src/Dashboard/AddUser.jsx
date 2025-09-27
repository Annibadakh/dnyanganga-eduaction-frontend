import React, { useState, useEffect } from "react";
import api from "../Api";

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoader, setEditLoader] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "counsellor",
    contactNum: "",
    counsellorBranch: "",
    commission: "",
    dob: "",
    password: "",
    reenterPassword: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "counsellor",
    contactNum: "",
    counsellorBranch: "",
    commission: "",
    dob: "",
    password: "",
    reenterPassword: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get("/admin/getUserWithDetails").then((res) => {
      setUsers(res.data.data);
    }).catch((err) => {
      console.error("Error fetching users", err);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === "password" || name === "reenterPassword") {
      const password = name === "password" ? value : formData.password;
      const reenterPassword = name === "reenterPassword" ? value : formData.reenterPassword;
      if (reenterPassword && password !== reenterPassword) {
        setPasswordError("Passwords do not match");
      } else if (password && password.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...editFormData, [name]: value };
    setEditFormData(updated);

    if (name === "password" || name === "reenterPassword") {
      const password = name === "password" ? value : editFormData.password;
      const reenterPassword = name === "reenterPassword" ? value : editFormData.reenterPassword;
      if (reenterPassword && password !== reenterPassword) {
        setPasswordError("Passwords do not match");
      } else if (password && password.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("");
      }
    }
  };

  const validatePasswords = () => {
    if (formData.password !== formData.reenterPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const validateEditPasswords = () => {
    if (isEditingPassword) {
      if (editFormData.password !== editFormData.reenterPassword) {
        setPasswordError("Passwords do not match");
        return false;
      }
      if (editFormData.password && editFormData.password.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    const newUser = { ...formData, counsellorBranch: formData.role === "counsellor" ? formData.counsellorBranch : null };
    delete newUser.reenterPassword;

    setSubmitLoader(true);
    api.post("/auth/register", newUser)
      .then((res) => {
        alert(res.data.message);
        fetchUsers();
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          role: "counsellor",
          contactNum: "",
          counsellorBranch: "",
          commission: "",
          dob: "",
          password: "",
          reenterPassword: ""
        });
      })
      .catch((err) => {
        console.error("Error adding user", err);
        alert(err.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setSubmitLoader(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateEditPasswords()) return;

    setEditLoader(true);
    const updateData = {
      name: editFormData.name,
      email: editFormData.email,
      role: editFormData.role,
      contactNum: editFormData.contactNum,
      counsellorBranch: editFormData.counsellorBranch,
      commission: editFormData.commission,
      dob: editFormData.dob
    };

    // Only include password if it's being changed
    if (isEditingPassword && editFormData.password) {
      updateData.password = editFormData.password;
    }

    api.put(`/admin/editUser/${selectedUser.uuid}`, updateData)
      .then((res) => {
        alert(res.data.message);
        fetchUsers();
        closeEditForm();
      })
      .catch((err) => {
        console.error("Error updating user", err);
        alert(err.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setEditLoader(false);
      });
  };

  const handleDelete = (uuid) => {
    setUpdateLoader(uuid);
    api.delete(`/admin/deleteUser/${uuid}`).then((res) => {
      fetchUsers();
      setUpdateLoader(null);
      alert(res.data.message);
    }).catch((err) => {
      console.error("Error deleting user", err);
      setUpdateLoader(null);
    });
  };

  const openEditForm = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "counsellor",
      contactNum: user.contactNum || "",
      counsellorBranch: user.counsellorBranch || "",
      commission: user.commission || "",
      dob: user.dob ? user.dob.split('T')[0] : "",
      password: "",
      reenterPassword: ""
    });
    setIsEditingPassword(false);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setSelectedUser(null);
    setEditFormData({
      name: "",
      email: "",
      role: "counsellor",
      contactNum: "",
      counsellorBranch: "",
      commission: "",
      dob: "",
      password: "",
      reenterPassword: ""
    });
    setPasswordError("");
    setShowPassword(false);
    setShowReenterPassword(false);
    setIsEditingPassword(false);
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">User Management</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add User
        </button>
      )}

      {showForm && (
        <div className="mt-6 bg-white md:p-6 p-2 shadow-custom">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                name="name" 
                placeholder="Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="p-2 border rounded-md" 
              />
              <input 
                type="text" 
                name="contactNum" 
                placeholder="Contact Number" 
                value={formData.contactNum} 
                onChange={handleChange} 
                required 
                className="p-2 border rounded-md" 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="p-2 border rounded-md" 
              />
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="p-2 pr-10 border rounded-md w-full" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showReenterPassword ? "text" : "password"} 
                  name="reenterPassword" 
                  placeholder="Re-enter Password" 
                  value={formData.reenterPassword} 
                  onChange={handleChange} 
                  required 
                  className={`p-2 pr-10 border rounded-md w-full ${passwordError ? "border-red-500" : ""}`} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowReenterPassword(!showReenterPassword)} 
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showReenterPassword ? "👁️" : "👁️‍🗨️"}
                </button>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="p-2 border rounded-md"
              >
                <option value="counsellor">Counsellor</option>
                <option value="teacher">Teacher</option>
              </select>
              {formData.role === "counsellor" && (
                <input 
                  type="text" 
                  name="counsellorBranch" 
                  placeholder="Branch" 
                  value={formData.counsellorBranch} 
                  onChange={handleChange} 
                  required 
                  className="p-2 border rounded-md" 
                />
              )}
              <input 
                type="date" 
                name="dob" 
                placeholder="Date of Birth" 
                value={formData.dob} 
                onChange={handleChange} 
                required 
                className="p-2 border rounded-md" 
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={submitLoader} 
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {submitLoader ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                ) : (
                  "Submit"
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                disabled={submitLoader} 
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white m-2 p-4 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl text-secondary font-bold mb-4">Edit User</h2>
            <p className="text-sm mb-4 text-gray-700">
              Editing user: <strong className="text-primary">{selectedUser?.name}</strong>
            </p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Name" 
                  value={editFormData.name} 
                  onChange={handleEditChange} 
                  required 
                  className="p-2 border rounded-md" 
                />
                <input 
                  type="text" 
                  name="contactNum" 
                  placeholder="Contact Number" 
                  value={editFormData.contactNum} 
                  onChange={handleEditChange} 
                  required 
                  className="p-2 border rounded-md" 
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  value={editFormData.email} 
                  onChange={handleEditChange} 
                  required 
                  className="p-2 border rounded-md" 
                />
                <select 
                  name="role" 
                  value={editFormData.role} 
                  onChange={handleEditChange} 
                  className="p-2 border rounded-md"
                >
                  <option value="counsellor">Counsellor</option>
                  <option value="teacher">Teacher</option>
                </select>
                {editFormData.role === "counsellor" && (
                  <input 
                    type="text" 
                    name="counsellorBranch" 
                    placeholder="Branch" 
                    value={editFormData.counsellorBranch} 
                    onChange={handleEditChange} 
                    required 
                    className="p-2 border rounded-md" 
                  />
                )}
                <input 
                  type="date" 
                  name="dob" 
                  placeholder="Date of Birth" 
                  value={editFormData.dob} 
                  onChange={handleEditChange} 
                  required 
                  className="p-2 border rounded-md" 
                />
              </div>

              {/* Password Change Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="changePassword" 
                    checked={isEditingPassword} 
                    onChange={(e) => setIsEditingPassword(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="changePassword" className="text-sm font-medium">
                    Change Password
                  </label>
                </div>
                
                {isEditingPassword && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="New Password" 
                        value={editFormData.password} 
                        onChange={handleEditChange} 
                        className="w-full p-2 pr-10 border rounded-md" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-2 top-2 text-gray-500"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showReenterPassword ? "text" : "password"} 
                        name="reenterPassword" 
                        placeholder="Re-enter New Password" 
                        value={editFormData.reenterPassword} 
                        onChange={handleEditChange} 
                        className={`w-full p-2 pr-10 border rounded-md ${passwordError ? "border-red-500" : ""}`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowReenterPassword(!showReenterPassword)} 
                        className="absolute right-2 top-2 text-gray-500"
                      >
                        {showReenterPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm col-span-full">{passwordError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={editLoader} 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {editLoader ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                  ) : (
                    "Update User"
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={closeEditForm} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6 md:p-6 p-2 bg-white shadow-custom">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-center text-sm border border-gray-300 overflow-hidden">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 whitespace-nowrap border">Sr. No.</th>
                <th className="p-3 whitespace-nowrap border">Name</th>
                <th className="p-3 whitespace-nowrap border">Email</th>
                <th className="p-3 whitespace-nowrap border">Role</th>
                <th className="p-3 whitespace-nowrap border">Contact No.</th>
                <th className="p-3 whitespace-nowrap border">Date Of Birth</th>
                <th className="p-3 whitespace-nowrap border">Branch</th>
                <th className="p-3 whitespace-nowrap border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user, i) => (
                <tr key={user.uuid} className="hover:bg-gray-100 border-b">
                  <td className="p-3 whitespace-nowrap border">{i + 1}</td>
                  <td className="p-3 whitespace-nowrap border">{user.name}</td>
                  <td className="p-3 whitespace-nowrap border">{user.email}</td>
                  <td className="p-3 whitespace-nowrap border">{user.role.toUpperCase()}</td>
                  <td className="p-3 whitespace-nowrap border">{user.contactNum}</td>
                  <td className="p-3 whitespace-nowrap border">
                    {user.dob ? new Date(user.dob).toLocaleDateString("en-GB") : ""}
                  </td>
                  <td className="p-3 whitespace-nowrap border">{user.counsellorBranch}</td>
                  <td className="p-3 whitespace-nowrap border">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleDelete(user.uuid)} 
                        disabled={updateLoader === user.uuid} 
                        className={`${user.isActive ? "bg-red-500" : "bg-green-500"} text-white px-3 py-1 rounded-md hover:${user.isActive ? "bg-red-600" : "bg-green-600"} disabled:opacity-50`}
                      >
                        {updateLoader === user.uuid ? (
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                          user.isActive ? "Deactivate" : "Activate"
                        )}
                      </button>
                      <button 
                        onClick={() => openEditForm(user)} 
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddUser;