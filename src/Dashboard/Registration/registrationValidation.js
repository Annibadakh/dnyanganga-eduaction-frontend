import * as yup from "yup";
import { PAYMENT_MODES } from "./paymentValidation";

const NAME_REGEX = /^[A-Za-z][A-Za-z .']{1,99}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const MIN_AGE = 10;
const MAX_AGE = 30;

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const ageOn = (dob, on = new Date()) => {
  const birth = new Date(dob);
  let age = on.getFullYear() - birth.getFullYear();
  const m = on.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < birth.getDate())) age--;
  return age;
};

// ---------------- Step 1: student info + payment ----------------
export const step1Schema = yup.object({
  studentName: yup
    .string()
    .trim()
    .required("Student name is required")
    .matches(NAME_REGEX, "Use letters only (2–100 characters)"),
  gender: yup.string().required("Please select gender"),
  dob: yup
    .string()
    .required("Date of birth is required")
    .test("valid", "Enter a valid date", (v) => !v || !Number.isNaN(new Date(v).getTime()))
    .test("not-future", "Date of birth cannot be in the future", (v) => !v || new Date(v) <= new Date())
    .test(
      "age",
      `Student age must be between ${MIN_AGE} and ${MAX_AGE} years`,
      (v) => !v || (ageOn(v) >= MIN_AGE && ageOn(v) <= MAX_AGE),
    ),
  motherName: yup
    .string()
    .trim()
    .required("Mother's name is required")
    .matches(NAME_REGEX, "Use letters only (2–100 characters)"),
  address: yup
    .string()
    .trim()
    .required("Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(250, "Address must be at most 250 characters"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(PINCODE_REGEX, "Pincode must be 6 digits and not start with 0"),
  standard: yup.string().required("Please select standard"),
  branch: yup.string().when("branches", {
    is: (branches) => Array.isArray(branches) && branches.length > 0,
    then: (s) => s.required("Please select medium / group"),
    otherwise: (s) => s.notRequired(),
  }),
  preYearPercent: yup
    .number()
    .transform((v, orig) => (orig === "" || orig === null ? undefined : v))
    .typeError("Enter a valid percentage")
    .required("Previous year percentage is required")
    .min(0, "Percentage cannot be below 0")
    .max(100, "Percentage cannot be above 100")
    .test("decimals", "Use at most 2 decimal places", (v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(String(v))),
  schoolCollege: yup
    .string()
    .trim()
    .required("School / college name is required")
    .min(3, "Enter the full school / college name"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .matches(EMAIL_REGEX, "Enter a valid email address"),
  studentNo: yup
    .string()
    .required("Student mobile number is required")
    .matches(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  parentsNo: yup
    .string()
    .required("Parent mobile number is required")
    .matches(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  appNo: yup
    .string()
    .required("Please select app number")
    .test("one-of-numbers", "Select the student or parent number", function (v) {
      const { studentNo, parentsNo } = this.parent;
      return !v || v === studentNo || v === parentsNo;
    }),
  notificationNo: yup
    .string()
    .required("Please select notification number")
    .test("one-of-numbers", "Select the student or parent number", function (v) {
      const { studentNo, parentsNo } = this.parent;
      return !v || v === studentNo || v === parentsNo;
    }),
  examCentre: yup
    .mixed()
    .test("required", "Please select exam centre", (v) => v !== "" && v !== null && v !== undefined),
  amountPaid: yup
    .number()
    .transform((v, orig) => (orig === "" || orig === null ? undefined : v))
    .typeError("Enter a valid amount")
    .required("Amount paid is required")
    .min(1, "Amount paid must be at least ₹1")
    .test("max-total", "Amount paid cannot be more than total fees", function (v) {
      const total = Number(this.parent.totalamount) || 0;
      return v === undefined || v <= total;
    }),
  modeOfPayment: yup
    .string()
    .required("Please select payment mode")
    .oneOf(PAYMENT_MODES, "Please select payment mode"),
  dueDate: yup.string().test("due-date", "", function (v) {
    const total = Number(this.parent.totalamount) || 0;
    const paid = Number(this.parent.amountPaid) || 0;
    if (total - paid <= 0) return true; // fully paid → no due date
    if (!v) return this.createError({ message: "Due date is required for pending fees" });
    if (new Date(v) < todayStart()) return this.createError({ message: "Due date cannot be in the past" });
    return true;
  }),
});

// Validate step 1 → { fieldName: message } (empty object when valid)
export const validateStep1 = async (formData) => {
  try {
    await step1Schema.validate(formData, { abortEarly: false });
    return {};
  } catch (err) {
    const errors = {};
    (err.inner || []).forEach((e) => {
      if (e.path && !errors[e.path]) errors[e.path] = e.message;
    });
    return errors;
  }
};

// ---------------- Step 2: documents, consent, signature ----------------
export const validateStep2 = ({ formData, studentPhotoSaved, bookPhotoSaved, isPaidInFull }) => {
  const errors = {};
  if (!studentPhotoSaved || !formData.studentPhoto) {
    errors.studentPhoto = "Please upload and save the student photo";
  }
  if (isPaidInFull && (!bookPhotoSaved || !formData.bookPhoto)) {
    errors.bookPhoto = "Please upload and save the book distribution proof";
  }
  if (!formData.consentAccepted) {
    errors.consentAccepted = "Please accept the rules and terms to continue";
  }
  const signer = (formData.signerName || "").trim();
  if (!signer) {
    errors.signerName = "Signer name is required";
  } else if (!NAME_REGEX.test(signer)) {
    errors.signerName = "Use letters only (2–100 characters)";
  }
  if (!formData.signatureUrl) {
    errors.signatureUrl = "Please sign and save the signature";
  }
  return errors;
};
