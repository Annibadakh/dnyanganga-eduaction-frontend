import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../../Api";
import { useToast } from "../../useToast";
import { BRANCH_ROLES, USER_ROLES, validateUser } from "./userValidation";

// Inline field error (same as the registration form)
const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs sm:text-sm mt-1">{msg}</p> : null;

const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

// Add / Edit staff user — same look as the student registration form.
// user: the row being edited (null = add). subAdmins: active sub-admins for "Team Leader".
// batches: all user batches — the optional Batch dropdown offers the active ones (plus the user's current one).
const UserForm = ({ user = null, subAdmins = [], batches = [], onCancel, onSaved }) => {
  const editing = !!user;
  const { successToast, errorToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    contactNum: user?.contactNum || "",
    email: user?.email || "",
    role: user?.role || "counsellor",
    counsellorBranch: user?.counsellorBranch || "",
    subAdminId: user?.subAdminId || "",
    batchId: user?.batchId ? String(user.batchId) : "",
    dob: toDateInput(user?.dob),
    joiningDate: toDateInput(user?.joiningDate),
    password: "",
    reenterPassword: "",
  });
  const [changePassword, setChangePassword] = useState(!editing);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isBranchRole = BRANCH_ROLES.includes(formData.role);
  const batchOptions = batches.filter((b) => b.isActive || String(b.id) === String(user?.batchId || ""));

  const sectionCls = "mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6";
  const headingCls = "text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary";
  const errAttr = (name) => (errors[name] ? { "data-error": "true" } : {});
  const inputCls = (name, extra = "") =>
    `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm sm:text-base ${
      errors[name] ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"
    } ${extra}`;

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError(name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = await validateUser(formData, { mode: editing ? "edit" : "add", changePassword });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      errorToast("Please correct the highlighted fields");
      setTimeout(() => {
        document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      contactNum: formData.contactNum,
      email: formData.email.trim(),
      role: formData.role,
      counsellorBranch: isBranchRole ? formData.counsellorBranch.trim() : null,
      dob: formData.dob,
      joiningDate: formData.joiningDate,
      batchId: formData.batchId ? Number(formData.batchId) : null,
    };
    if (formData.role === "counsellor") payload.subAdminId = formData.subAdminId || null;
    if (changePassword) payload.password = formData.password;

    setSaving(true);
    try {
      const res = editing
        ? await api.put(`/admin/editUser/${user.uuid}`, payload)
        : await api.post("/auth/register", payload);
      successToast(res.data.message || (editing ? "User updated" : "User added"));
      onSaved();
    } catch (err) {
      console.error("Error saving user", err);
      errorToast(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const passwordInput = (name, placeholder) => (
    <div className="w-full" {...errAttr(name)}>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className={inputCls(name, "pr-10")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldError msg={errors[name]} />
    </div>
  );

  return (
    <div className="w-full bg-white">
      <div className="container w-full">
        <div className="bg-primary text-white text-center py-4">
          <h2 className="text-2xl font-bold">{editing ? "Edit User" : "Add New User"}</h2>
          {editing && <p className="text-sm text-blue-100 mt-1">{user.name}</p>}
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full">
          {/* Personal Details */}
          <div className={sectionCls}>
            <h3 className={headingCls}>Personal Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="w-full" {...errAttr("name")}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className={inputCls("name")}
                  autoComplete="off"
                />
                <FieldError msg={errors.name} />
              </div>
              <div className="w-full" {...errAttr("contactNum")}>
                <input
                  type="tel"
                  inputMode="numeric"
                  name="contactNum"
                  value={formData.contactNum}
                  onChange={(e) =>
                    handleChange({ target: { name: "contactNum", value: e.target.value.replace(/\D/g, "").slice(0, 10) } })
                  }
                  placeholder="Enter Contact Number"
                  className={inputCls("contactNum")}
                />
                <FieldError msg={errors.contactNum} />
              </div>
              <div className="w-full" {...errAttr("email")}>
                <input
                  type="email"
                  inputMode="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleChange({ target: { name: "email", value: e.target.value.trim().toLowerCase() } })
                  }
                  placeholder="Enter Email"
                  className={inputCls("email")}
                  autoComplete="off"
                />
                <FieldError msg={errors.email} />
              </div>
              <div className="w-full" {...errAttr("dob")}>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">Date of Birth:</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputCls("dob")}
                  />
                </div>
                <FieldError msg={errors.dob} />
              </div>
            </div>
          </div>

          {/* Role & Work Details */}
          <div className={sectionCls}>
            <h3 className={headingCls}>Role &amp; Work Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="w-full" {...errAttr("role")}>
                <select name="role" value={formData.role} onChange={handleChange} className={inputCls("role")}>
                  <option value="">Select Role</option>
                  {USER_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.role} />
              </div>
              <div className="w-full" {...errAttr("joiningDate")}>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">Joining Date:</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className={inputCls("joiningDate")}
                  />
                </div>
                <FieldError msg={errors.joiningDate} />
              </div>
              {isBranchRole && (
                <div className="w-full" {...errAttr("counsellorBranch")}>
                  <input
                    type="text"
                    name="counsellorBranch"
                    value={formData.counsellorBranch}
                    onChange={handleChange}
                    placeholder="Enter Branch"
                    className={inputCls("counsellorBranch")}
                  />
                  <FieldError msg={errors.counsellorBranch} />
                </div>
              )}
              {formData.role === "counsellor" && (
                <div className="w-full">
                  <select
                    name="subAdminId"
                    value={formData.subAdminId || ""}
                    onChange={handleChange}
                    className={inputCls("subAdminId")}
                  >
                    <option value="">No team leader (reports to admin)</option>
                    {subAdmins.map((sa) => (
                      <option key={sa.uuid} value={sa.uuid}>
                        {sa.name} ({sa.counsellorBranch || "?"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="w-full">
                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  className={inputCls("batchId")}
                >
                  <option value="">No batch (optional)</option>
                  {batchOptions.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.title}
                      {b.isActive ? "" : " (inactive)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Login Details */}
          <div className={sectionCls}>
            <h3 className={headingCls}>Login Details</h3>
            {editing && (
              <label className="flex items-center gap-2 mb-3 text-sm sm:text-base cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    clearError("password");
                    clearError("reenterPassword");
                    if (!e.target.checked) setFormData((prev) => ({ ...prev, password: "", reenterPassword: "" }));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#094D9E] focus:ring-[#094D9E]"
                />
                Change password
              </label>
            )}
            {changePassword ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                {passwordInput("password", editing ? "Enter New Password" : "Enter Password")}
                {passwordInput("reenterPassword", "Re-enter Password")}
              </div>
            ) : (
              <p className="text-sm text-gray-500">The current password stays unchanged.</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              The login details are emailed to the user after saving.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="w-full sm:w-1/3 py-3 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
            >
              {saving ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : editing ? (
                "Update User"
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
