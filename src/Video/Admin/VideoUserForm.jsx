import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import CustomMultiSelect from "../../Dashboard/Generic/CustomMultiSelect";
import { useToast } from "../../useToast";
import videoApi, { apiMessage } from "../videoApi";

const NAME_REGEX = /^[A-Za-z][A-Za-z .']{1,99}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs sm:text-sm mt-1">{msg}</p> : null;

// Same rules as the server (Backend/video/validation.js)
const validate = (data, editing) => {
  const errors = {};
  if (!NAME_REGEX.test(data.name.trim())) errors.name = "Enter a valid name (letters only, 2–100 characters)";
  if (!EMAIL_REGEX.test(data.email.trim())) errors.email = "Enter a valid email address";
  const school = data.schoolName.trim();
  if (school.length < 2 || school.length > 200) errors.schoolName = "School name must be 2–200 characters";
  if (!editing || data.password) {
    if (data.password.length < 6) errors.password = "Password must be at least 6 characters";
    else if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords don't match";
  }
  return errors;
};

// Add / edit a video user: details, password and the standards they may watch.
const VideoUserForm = ({ user, standardOptions, onCancel, onSaved }) => {
  const editing = Boolean(user);
  const { successToast, errorToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    schoolName: user?.schoolName || "",
    password: "",
    confirmPassword: "",
    isActive: user ? user.isActive : true,
  });
  const [standards, setStandards] = useState(
    (user?.standards || []).map((s) => ({ label: s.name, value: s.id })),
  );
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionCls = "mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6";
  const headingCls = "text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary";
  const errAttr = (name) => (errors[name] ? { "data-error": "true" } : {});
  const inputCls = (name, extra = "") =>
    `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm sm:text-base ${
      errors[name] ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"
    } ${extra}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(formData, editing);
    setErrors(found);
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      schoolName: formData.schoolName.trim(),
      isActive: formData.isActive,
    };
    if (formData.password) payload.password = formData.password;
    const standardIds = standards.map((s) => s.value);

    try {
      if (editing) {
        await videoApi.put(`/admin/users/${user.id}`, payload);
        await videoApi.put(`/admin/users/${user.id}/standards`, { standardIds });
        successToast("Video user updated");
      } else {
        await videoApi.post("/admin/users", { ...payload, standardIds });
        successToast("Video user added");
      }
      onSaved();
    } catch (error) {
      errorToast(apiMessage(error, "Couldn't save the video user"));
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
      <div className="bg-primary text-white text-center py-4">
        <h2 className="text-2xl font-bold">{editing ? "Edit Video User" : "Add Video User"}</h2>
        {editing && <p className="text-sm text-blue-100 mt-1">{user.name}</p>}
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full">
        <div className={sectionCls}>
          <h3 className={headingCls}>User Details</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
            <div className="w-full" {...errAttr("name")}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Name" className={inputCls("name")} autoComplete="off" />
              <FieldError msg={errors.name} />
            </div>
            <div className="w-full" {...errAttr("email")}>
              <input
                type="email"
                inputMode="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange({ target: { name: "email", value: e.target.value.trim().toLowerCase() } })}
                placeholder="Enter Email"
                className={inputCls("email")}
                autoComplete="off"
              />
              <FieldError msg={errors.email} />
            </div>
            <div className="w-full lg:col-span-2" {...errAttr("schoolName")}>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Enter School Name" className={inputCls("schoolName")} autoComplete="off" />
              <FieldError msg={errors.schoolName} />
            </div>
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={headingCls}>Standard Access</h3>
          <CustomMultiSelect
            label="Standards this user can watch"
            options={standardOptions}
            value={standards}
            onChange={(v) => setStandards(v || [])}
            isRequired={false}
            placeholder="Select standards"
          />
          <p className="text-xs text-gray-500 mt-2">The user sees only the videos of these standards.</p>
        </div>

        <div className={sectionCls}>
          <h3 className={headingCls}>Login Details</h3>
          {editing && <p className="text-sm text-gray-500 mb-3">Leave the password empty to keep the current one.</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
            {passwordInput("password", editing ? "New Password (optional)" : "Enter Password")}
            {passwordInput("confirmPassword", "Confirm Password")}
          </div>
          <label className="flex items-center gap-2 mt-4 text-sm sm:text-base cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300"
            />
            Active (can log in)
          </label>
        </div>

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
  );
};

export default VideoUserForm;
