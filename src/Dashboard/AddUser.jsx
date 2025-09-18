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

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [changePasswordLoader, setChangePasswordLoader] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeReenterPassword, setShowChangeReenterPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordData, setChangePasswordData] = useState({
    password: "",
    reenterPassword: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "counsellor",
    contactNum: "",
    branch: "",
    commission: "",
    dob: "",
    password: "",
    reenterPassword: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get("/admin/getUser").then((res) => {
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

  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...changePasswordData, [name]: value };
    setChangePasswordData(updated);

    const password = name === "password" ? value : changePasswordData.password;
    const reenterPassword = name === "reenterPassword" ? value : changePasswordData.reenterPassword;

    if (reenterPassword && password !== reenterPassword) {
      setChangePasswordError("Passwords do not match");
    } else if (password && password.length < 6) {
      setChangePasswordError("Password must be at least 6 characters long");
    } else {
      setChangePasswordError("");
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

  const validateChangePasswords = () => {
    if (changePasswordData.password !== changePasswordData.reenterPassword) {
      setChangePasswordError("Passwords do not match");
      return false;
    }
    if (changePasswordData.password.length < 6) {
      setChangePasswordError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    const newUser = { ...formData, branch: formData.role === "counsellor" ? formData.branch : null };
    delete newUser.reenterPassword;

    setSubmitLoader(true);
    api.post("/auth/register", newUser)
      .then((res) => {
        alert(res.data.message); // <-- Show message from backend
        fetchUsers();
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          role: "counsellor",
          contactNum: "",
          branch: "",
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


  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!validateChangePasswords()) return;

    setChangePasswordLoader(true);
    api.put(`/admin/changePassword/${selectedUser.uuid}`, {
      password: changePasswordData.password
    }).then(() => {
      alert("Password changed!");
      setShowChangePasswordForm(false);
      setChangePasswordData({ password: "", reenterPassword: "" });
      setSelectedUser(null);
      setChangePasswordLoader(false);
    }).catch((err) => {
      console.error("Error changing password", err);
      setChangePasswordLoader(false);
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

  const openChangePasswordForm = (user) => {
    setSelectedUser(user);
    setChangePasswordData({ password: "", reenterPassword: "" });
    setShowChangePasswordForm(true);
  };

  const closeChangePasswordForm = () => {
    setShowChangePasswordForm(false);
    setSelectedUser(null);
    setChangePasswordData({ password: "", reenterPassword: "" });
    setChangePasswordError("");
    setShowChangePassword(false);
    setShowChangeReenterPassword(false);
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">User Management</h1>

      {!showForm && (<button
        onClick={() => setShowForm(true)}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Add User
      </button>)}

      {showForm && (
        <div className="mt-6 bg-white md:p-6 p-2 shadow-custom">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="p-2 border rounded-md" />
              <input type="text" name="contactNum" placeholder="Contact Number" value={formData.contactNum} onChange={handleChange} required className="p-2 border rounded-md" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="p-2 border rounded-md" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="p-2 pr-10 border rounded-md w-full" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-500">{showPassword ? "👁️" : "👁️‍🗨️"}</button>
              </div>
              <div className="relative">
                <input type={showReenterPassword ? "text" : "password"} name="reenterPassword" placeholder="Re-enter Password" value={formData.reenterPassword} onChange={handleChange} required className={`p-2 pr-10 border rounded-md w-full ${passwordError ? "border-red-500" : ""}`} />
                <button type="button" onClick={() => setShowReenterPassword(!showReenterPassword)} className="absolute right-2 top-2 text-gray-500">{showReenterPassword ? "👁️" : "👁️‍🗨️"}</button>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
              <select name="role" value={formData.role} onChange={handleChange} className="p-2 border rounded-md">
                <option value="counsellor">Counsellor</option>
                <option value="teacher">Teacher</option>
              </select>
              {formData.role === "counsellor" && (
                <>
                  <input type="text" name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} required className="p-2 border rounded-md" />
                  {/* <input type="number" name="commission" onWheel={(e) => e.target.blur()} placeholder="Commission %" value={formData.commission} onChange={handleChange} required className="p-2 border rounded-md" /> */}
                </>
              )}
        
              <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required className="p-2 border rounded-md" />
                
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitLoader} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50">
                {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span> : "Submit"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} disabled={submitLoader} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showChangePasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white m-2 p-4 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl text-secondary font-bold mb-4">Change Password</h2>
            <p className="text-sm mb-4 text-gray-700">For user: <strong className="text-primary">{selectedUser?.name}</strong></p>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="relative">
                <input type={showChangePassword ? "text" : "password"} name="password" placeholder="New Password" value={changePasswordData.password} onChange={handleChangePasswordChange} required className="w-full p-2 pr-10 border rounded-md" />
                <button type="button" onClick={() => setShowChangePassword(!showChangePassword)} className="absolute right-2 top-2 text-gray-500">{showChangePassword ? "👁️" : "👁️‍🗨️"}</button>
              </div>
              <div className="relative">
                <input type={showChangeReenterPassword ? "text" : "password"} name="reenterPassword" placeholder="Re-enter New Password" value={changePasswordData.reenterPassword} onChange={handleChangePasswordChange} required className={`w-full p-2 pr-10 border rounded-md ${changePasswordError ? "border-red-500" : ""}`} />
                <button type="button" onClick={() => setShowChangeReenterPassword(!showChangeReenterPassword)} className="absolute right-2 top-2 text-gray-500">{showChangeReenterPassword ? "👁️" : "👁️‍🗨️"}</button>
                {changePasswordError && <p className="text-red-500 text-sm mt-1">{changePasswordError}</p>}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={changePasswordLoader} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50">
                  {changePasswordLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span> : "Change Password"}
                </button>
                <button type="button" onClick={closeChangePasswordForm} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
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
              {/* <th className="p-3 whitespace-nowrap border">Commission</th> */}
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
                <td className="p-3 whitespace-nowrap border">{user.dob ? new Date(user.dob).toLocaleDateString("en-GB") : ""}</td>
                <td className="p-3 whitespace-nowrap border">{user.branch}</td>
                {/* <td className="p-3 whitespace-nowrap border">{user.commission}</td> */}
                <td className="p-3 whitespace-nowrap border">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleDelete(user.uuid)} disabled={updateLoader === user.uuid} className={`${user.isActive ? "bg-red-500" : "bg-green-500"} text-white px-3 py-1 rounded-md hover:${user.isActive ? "bg-red-600" : "bg-green-600"} disabled:opacity-50`}>
                      {updateLoader === user.uuid ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => openChangePasswordForm(user)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600">Change Password</button>
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
