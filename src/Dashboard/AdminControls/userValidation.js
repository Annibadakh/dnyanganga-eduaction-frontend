import * as yup from "yup";

// Same rules as the backend (Backend/utils/userRules.js)
export const USER_ROLES = [
  { value: "counsellor", label: "Counsellor" },
  { value: "sub-admin", label: "Sub-admin" },
  { value: "teacher", label: "Teacher" },
  { value: "logistics", label: "Logistics" },
  { value: "followUp", label: "Follow-up" },
  { value: "ca", label: "CA" },
];
export const BRANCH_ROLES = ["counsellor", "sub-admin"];

const NAME_REGEX = /^[A-Za-z][A-Za-z .']{1,99}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const ageOn = (dob) => {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

// mode: "add" | "edit" (password optional on edit unless "change password" is ticked)
export const userSchema = yup.object({
  name: yup.string().trim().required("Name is required").matches(NAME_REGEX, "Use letters only (2–100 characters)"),
  contactNum: yup.string().required("Contact number is required").matches(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  email: yup.string().trim().required("Email is required").matches(EMAIL_REGEX, "Enter a valid email address"),
  role: yup.string().required("Select a role").oneOf(USER_ROLES.map((r) => r.value), "Select a role"),
  counsellorBranch: yup.string().when("role", {
    is: (role) => BRANCH_ROLES.includes(role),
    then: (s) => s.trim().required("Branch is required for counsellors and sub-admins"),
    otherwise: (s) => s.notRequired(),
  }),
  dob: yup
    .string()
    .required("Date of birth is required")
    .test("valid", "Enter a valid date", (v) => !v || !Number.isNaN(new Date(v).getTime()))
    .test("age", "Age must be between 18 and 80 years", (v) => !v || (ageOn(v) >= 18 && ageOn(v) <= 80)),
  joiningDate: yup
    .string()
    .required("Joining date is required")
    .test("valid", "Enter a valid date", (v) => !v || !Number.isNaN(new Date(v).getTime())),
  password: yup.string().test("password", "", function (v) {
    const { mode, changePassword } = this.options.context || {};
    if (mode === "edit" && !changePassword) return true;
    if (!v) return this.createError({ message: "Password is required" });
    if (v.length < 6) return this.createError({ message: "Password must be at least 6 characters long" });
    return true;
  }),
  reenterPassword: yup.string().test("match", "", function (v) {
    const { mode, changePassword } = this.options.context || {};
    if (mode === "edit" && !changePassword) return true;
    if (!v) return this.createError({ message: "Re-enter the password" });
    if (v !== this.parent.password) return this.createError({ message: "Passwords do not match" });
    return true;
  }),
});

export const validateUser = async (formData, context) => {
  try {
    await userSchema.validate(formData, { abortEarly: false, context });
    return {};
  } catch (err) {
    const errors = {};
    (err.inner || []).forEach((e) => {
      if (e.path && !errors[e.path]) errors[e.path] = e.message;
    });
    return errors;
  }
};
