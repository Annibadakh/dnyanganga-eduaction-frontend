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
  
  // Change password states
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [changePasswordLoader, setChangePasswordLoader] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeReenterPassword, setShowChangeReenterPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordData, setChangePasswordData] = useState({
    password: "",
    reenterPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "counsellor",
    contactNum: "",
    branch: "",
    commission: "",
    password: "",
    reenterPassword: "",
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
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    
    // Real-time password validation
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

  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...changePasswordData, [name]: value };
    setChangePasswordData(updatedData);
    
    // Real-time password validation for change password
    if (name === "password" || name === "reenterPassword") {
      const password = name === "password" ? value : changePasswordData.password;
      const reenterPassword = name === "reenterPassword" ? value : changePasswordData.reenterPassword;
      
      if (reenterPassword && password !== reenterPassword) {
        setChangePasswordError("Passwords do not match");
      } else if (password && password.length < 6) {
        setChangePasswordError("Password must be at least 6 characters long");
      } else {
        setChangePasswordError("");
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
    setPasswordError("");
    return true;
  };

  const validateChangePasswords = () => {
    if (changePasswordData.password !== changePasswordData.reenterPassword) {
      setChangePasswordError("Passwords do not match");
      return false;
    }
    if (changePasswordData.password.length < 6) {
      setChangePasswordError("Password must be at least 6 characters long");
      return false;
    }
    setChangePasswordError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    const newUser = { 
      ...formData,
      branch: formData.role === "counsellor" ? formData.branch : null,
    };
    
    // Remove reenterPassword from the data sent to backend
    delete newUser.reenterPassword;
    
    setSubmitLoader(true);
    api
      .post("/auth/register", newUser)
      .then(() => {
        alert("user added !!");
        fetchUsers();
        setShowForm(false);
        setSubmitLoader(false);
        setPasswordError("");
        setFormData({ 
          name: "", 
          email: "", 
          role: "counsellor", 
          contactNum: "", 
          branch: "", 
          commission: "",
          password: "",
          reenterPassword: ""
        });
      })
      .catch((error) => {
        console.error("Error adding user", error);
        setSubmitLoader(false);
      });
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validateChangePasswords()) {
      return;
    }

    setChangePasswordLoader(true);
    api
      .put(`/admin/changePassword/${selectedUser.uuid}`, {
        password: changePasswordData.password
      })
      .then(() => {
        alert("Password changed successfully!");
        setShowChangePasswordForm(false);
        setChangePasswordLoader(false);
        setChangePasswordError("");
        setChangePasswordData({
          password: "",
          reenterPassword: "",
        });
        setSelectedUser(null);
      })
      .catch((error) => {
        console.error("Error changing password", error);
        alert("Error changing password. Please try again.");
        setChangePasswordLoader(false);
      });
  };

  const handleDelete = (uuid) => {
    setUpdateLoader(uuid);
    api
      .delete(`/admin/deleteUser/${uuid}`)
      .then((response) => {
        fetchUsers();
        setUpdateLoader(null);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("Error deleting user", error);
        setUpdateLoader(null);
      });
  };

  const openChangePasswordForm = (user) => {
    setSelectedUser(user);
    setShowChangePasswordForm(true);
    setChangePasswordData({
      password: "",
      reenterPassword: "",
    });
    setChangePasswordError("");
  };

  const closeChangePasswordForm = () => {
    setShowChangePasswordForm(false);
    setSelectedUser(null);
    setChangePasswordData({
      password: "",
      reenterPassword: "",
    });
    setChangePasswordError("");
    setShowChangePassword(false);
    setShowChangeReenterPassword(false);
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
            
            {/* Password Field */}
            <div>
              <label className="block text-gray-700 font-semibold">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Re-enter Password Field */}
            <div>
              <label className="block text-gray-700 font-semibold">Re-enter Password:</label>
              <div className="relative">
                <input
                  type={showReenterPassword ? "text" : "password"}
                  name="reenterPassword"
                  value={formData.reenterPassword}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md pr-10 ${passwordError ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowReenterPassword(!showReenterPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showReenterPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
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
                <label className="block text-gray-700 font-semibold mt-2">Commission: Ex. 20%</label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
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
                className="bg-green-500 min-w-20 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-green-600 grid place-items-center"
              >
                {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setPasswordError("");
                  setFormData({ 
                    name: "", 
                    email: "", 
                    role: "counsellor", 
                    contactNum: "", 
                    branch: "", 
                    commission: "",
                    password: "",
                    reenterPassword: ""
                  });
                }}
                disabled={submitLoader}
                className="bg-gray-500 text-white disabled:opacity-50 px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <p className="text-gray-600 mb-4">
              Changing password for: <span className="font-semibold">{selectedUser?.name}</span>
            </p>
            
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {/* New Password Field */}
              <div>
                <label className="block text-gray-700 font-semibold">New Password:</label>
                <div className="relative">
                  <input
                    type={showChangePassword ? "text" : "password"}
                    name="password"
                    value={changePasswordData.password}
                    onChange={handleChangePasswordChange}
                    required
                    className="w-full p-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showChangePassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Re-enter New Password Field */}
              <div>
                <label className="block text-gray-700 font-semibold">Re-enter New Password:</label>
                <div className="relative">
                  <input
                    type={showChangeReenterPassword ? "text" : "password"}
                    name="reenterPassword"
                    value={changePasswordData.reenterPassword}
                    onChange={handleChangePasswordChange}
                    required
                    className={`w-full p-2 border rounded-md pr-10 ${changePasswordError ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangeReenterPassword(!showChangeReenterPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showChangeReenterPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {changePasswordError && (
                  <p className="text-red-500 text-sm mt-1">{changePasswordError}</p>
                )}
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  disabled={changePasswordLoader}
                  className="bg-blue-500 min-w-20 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-blue-600 grid place-items-center"
                >
                  {changePasswordLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={closeChangePasswordForm}
                  disabled={changePasswordLoader}
                  className="bg-gray-500 text-white disabled:opacity-50 px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="mt-6">
        <table className="w-full border-collapse text-center border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Sr. No.</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Contact No.</th>
              <th className="border p-2">Branch</th>
              <th className="border p-2">Commission</th>
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
                  <td className="border p-2 text-center">{user.role.toUpperCase()}</td>
                  <td className="border p-2 text-center">{user.contactNum}</td>
                  <td className="border p-2 text-center">{user.branch}</td>
                  <td className="border p-2 text-center">{user.commission}</td>
                  <td className="border p-2 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleDelete(user.uuid)}
                        disabled={updateLoader == user.uuid}
                        className={`${user.isActive ? "bg-red-500" : "bg-green-500"} disabled:opacity-50 text-white grid place-items-center px-3 py-1 w-24 rounded-md ${user.isActive ? "hover:bg-red-600" : "hover:bg-green-600"}`}
                      >
                        {updateLoader == user.uuid ? <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span> : (user.isActive ? "Deactivate" : "Activate")}
                      </button>
                      <button
                        onClick={() => openChangePasswordForm(user)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="border p-2 text-center text-gray-500">
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