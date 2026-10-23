import { useState, useEffect, useRef } from "react";
import api from "../../Api";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import { useToast } from "../../useToast";
import CustomSelect from "../Generic/CustomSelect";
import { useNavigate } from "react-router-dom";
import SignaturePad from "./SignaturePad";
import { CONSENT_CHECKBOX_LABEL } from "./consentRules";
import consentImage from "./formRules.png";
import { validateStep1, validateStep2 } from "./registrationValidation";
import { PAYMENT_MODES } from "./paymentValidation";
import { fileUrl } from "../../utils/fileUrl";

const STEPS = ["Student Info", "Documents & Consent", "Review & Submit"];

// Inline field error (same red as the existing payment error)
const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs sm:text-sm mt-1">{msg}</p> : null;

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { successToast, infoToast, errorToast } = useToast();
  const studentPhoto = FileUploadHook();
  const receiptPhoto = FileUploadHook();
  const bookPhoto = FileUploadHook();

  const [paymentError, setPaymentError] = useState("");
  const [standards, setStandards] = useState([]);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [examCentres, setExamCentres] = useState([]);
  const [isPaidInFull, setIsPaidInFull] = useState(false);
  const [selectedExamCentre, setSelectedExamCentre] = useState(null);
  const [showDraftButton, setShowDraftButton] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const isInitialRender = useRef(true);

  const DRAFT_STORAGE_KEY = "studentRegistrationDraft";

  // Only these user-entered fields count as "has data" — derived/structural fields excluded
  const DRAFT_FIELDS = [
    "studentName",
    "gender",
    "dob",
    "motherName",
    "address",
    "pincode",
    "email",
    "studentNo",
    "parentsNo",
    "appNo",
    "notificationNo",
    "standard",
    "previousYear",
    "schoolCollege",
    "preYearPercent",
    "branch",
    "examCentre",
    "examYear",
    "receiptNo",
    "amountPaid",
    "modeOfPayment",
    "dueDate",
  ];

  // Only step 1 (student info + payment) is saved as a draft — plus the values
  // derived from the chosen standard so the draft restores correctly.
  // Photos, consent and signature are never saved in the draft.
  const STEP1_DRAFT_KEYS = [
    ...DRAFT_FIELDS,
    "standardId",
    "branchType",
    "branches",
    "paymentStandard",
    "totalamount",
    "amountRemaining",
  ];
  const pickStep1 = (data) =>
    Object.fromEntries(
      STEP1_DRAFT_KEYS.filter((k) => data && k in data).map((k) => [k, data[k]]),
    );

  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    dob: "",
    motherName: "",
    address: "",
    pincode: "",
    email: "",
    studentNo: "",
    parentsNo: "",
    appNo: "",
    notificationNo: "",
    standard: "",
    standardId: null,
    previousYear: "",
    schoolCollege: "",
    preYearPercent: "",
    branch: "",
    examCentre: "",
    examYear: "",
    branchType: "",
    branches: [],
    receiptNo: "",
    studentPhoto: "",
    receiptPhoto: "",
    bookPhoto: "",
    paymentStandard: "",
    totalamount: 0,
    amountPaid: "",
    modeOfPayment: "",
    amountRemaining: "",
    dueDate: "",
    consentAccepted: false,
    signerName: "",
    signatureUrl: "",
  });

  // Single source of truth for standard-related state.
  // Driven by the Standard table (name, previousYear, totalFees, branches).
  const applyStandardLogic = (standard) => {
    const currDate = new Date();
    const currentYear = currDate.getFullYear();
    const currMonth = currDate.getMonth();
    const nextYear = currMonth < 4 ? currentYear : currentYear + 1;

    const std = standards.find((s) => s.name === standard) || null;
    const isCombined = typeof standard === "string" && standard.includes("+");
    const branches =
      std?.branches && Array.isArray(std.branches) ? std.branches : [];

    return {
      branch: "",
      previousYear: std?.previousYear || "",
      examYear: (isCombined ? nextYear : currentYear).toString(),
      paymentStandard: standard || "",
      totalamount: std?.totalFees ?? 0,
      branchType: std?.branchType || "",
      branches,
      standardId: std?.id ?? null,
    };
  };

  // Helper function to find center by centerId
  const getCenterNameById = (centerId) => {
    const center = examCentres.find((centre) => centre.value === centerId);
    return center ? center : "";
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      examCentre: selectedExamCentre?.value ?? "",
    }));
  }, [selectedExamCentre]);

  const loadDraftFromLocalStorage = () => {
    try {
      const draftString = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftString) {
        return JSON.parse(draftString);
      }
      return null;
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
      return null;
    }
  };

  const clearDraftFromLocalStorage = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setShowDraftButton(false);
    } catch (error) {
      console.error("Error clearing draft from localStorage:", error);
    }
  };

  const checkForExistingDraft = () => {
    const draft = loadDraftFromLocalStorage();
    const hasData =
      draft &&
      DRAFT_FIELDS.some((key) => {
        const value = draft[key];
        return value != null && value !== "" && value !== 0;
      });
    setShowDraftButton(!!hasData);
  };

  const loadDraftData = () => {
    const draftData = loadDraftFromLocalStorage();
    if (draftData) {
      setFormData((prevData) => ({
        ...prevData,
        ...pickStep1(draftData),
      }));

      setShowDraftButton(false);
      infoToast("Draft data loaded successfully!");
    }
  };

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, []);

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    // Skip auto-save on initial render (must be FIRST check)
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const hasData = DRAFT_FIELDS.some((key) => {
      const value = formData[key];
      return value != null && value !== "" && value !== 0;
    });

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      try {
        const draftData = pickStep1(formData);
        // Add timestamp to the draft data itself
        draftData._draftTimestamp = new Date().toISOString();
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        setExamCentres(
          response.data.data.map((centre) => ({
            value: centre.centerId,
            label: centre.centerName,
          })),
        );
        // setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching exam centers", error);
      });
  }, []);

  // Fetch active standards (name, fees, previous year, branches)
  // Fetch active standards (name, fees, previous year, branches)
  useEffect(() => {
    api
      .get("/simple/standards")
      .then((response) => {
        const rawStandards = response.data.data || [];

        const parsedStandards = rawStandards.map((std) => {
          let branches = [];
          if (Array.isArray(std.branches)) {
            branches = std.branches;
          } else if (typeof std.branches === "string" && std.branches.trim()) {
            try {
              const parsed = JSON.parse(std.branches);
              branches = Array.isArray(parsed) ? parsed : [];
            } catch (err) {
              console.error(
                `Error parsing branches for standard "${std.name}"`,
                err,
              );
              branches = [];
            }
          }
          return { ...std, branches };
        });

        setStandards(parsedStandards);
      })
      .catch((error) => {
        console.error("Error fetching standards", error);
      });
  }, []);

  // Update exam centre search display when examCentres are loaded and formData has examCentre
  useEffect(() => {
    if (examCentres.length > 0 && formData.examCentre) {
      const centerName = getCenterNameById(formData.examCentre);
      if (centerName) {
        setSelectedExamCentre(centerName);
      }
    }
  }, [examCentres, formData.examCentre]);

  // Calculate amount remaining whenever totalamount or amountPaid changes
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalamount) || 0;
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    const remaining = totalAmount - amountPaid;
    const isPaidInFull = remaining == 0;

    setPaymentError(
      amountPaid > totalAmount && amountPaid > 0
        ? "Amount paid cannot be greater than total amount"
        : "",
    );

    setIsPaidInFull(isPaidInFull);

    setFormData((prev) => ({
      ...prev,
      amountRemaining: remaining >= 0 ? remaining.toString() : "0",
      ...(isPaidInFull && { dueDate: "" }),
    }));
  }, [formData.totalamount, formData.amountPaid]);

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const inputCls = (name, extra = "") =>
    `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm sm:text-base ${
      errors[name]
        ? "border-red-500 focus:ring-red-300"
        : "focus:ring-blue-300"
    } ${extra}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError(name);

    if (name === "standard") {
      const standardFields = applyStandardLogic(value);
      setFormData((prev) => ({ ...prev, [name]: value, ...standardFields }));
    } else {
      // functional update so quick successive changes never overwrite each other
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file uploads with form data update
  const handleStudentPhotoUpload = async (type) => {
    const imageUrl = await studentPhoto.uploadImage(type);
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData((prevData) => ({ ...prevData, studentPhoto: imageUrl }));
      clearError("studentPhoto");
    } else {
      console.error("Student photo upload failed - no valid URL returned");
    }
  };

  // TEMPORARILY UNUSED — receipt upload commented out; keep for restore
  // eslint-disable-next-line no-unused-vars
  const handleReceiptPhotoUpload = async (type) => {
    const imageUrl = await receiptPhoto.uploadImage(type);
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData((prev) => ({ ...prev, receiptPhoto: imageUrl }));
    } else {
      console.error("Receipt photo upload failed - no valid URL returned");
    }
  };

  const handleBookPhotoUpload = async (type) => {
    const imageUrl = await bookPhoto.uploadImage(type);
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData((prev) => ({ ...prev, bookPhoto: imageUrl }));
      clearError("bookPhoto");
    } else {
      console.error("Book photo upload failed - no valid URL returned");
    }
  };

  // ---------------- Step navigation ----------------
  // The dashboard scrolls inside <main>, not the window — scroll the form's top into view
  const formTopRef = useRef(null);
  // Instant jump (smooth scrolling can be cut short when the next step renders)
  const scrollToTop = () =>
    setTimeout(() => {
      const top = formTopRef.current;
      if (!top) return;
      top.scrollIntoView({ behavior: "auto", block: "start" });
      // also reset the dashboard's scroll container explicitly
      const scroller = top.closest("main");
      if (scroller) scroller.scrollTop = 0;
    }, 0);

  const showErrors = (stepErrors) => {
    setErrors(stepErrors);
    errorToast("Please correct the highlighted fields");
    // bring the first invalid field into view
    setTimeout(() => {
      const first = document.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const getStep2Errors = () =>
    validateStep2({
      formData,
      studentPhotoSaved: studentPhoto.isSaved,
      bookPhotoSaved: bookPhoto.isSaved,
      isPaidInFull,
    });

  const handleNext = async () => {
    if (step === 1) {
      const stepErrors = await validateStep1(formData);
      if (Object.keys(stepErrors).length > 0) return showErrors(stepErrors);
    }
    if (step === 2) {
      // Step 2 errors are shown on step 2 itself — Review opens only when it is complete
      const stepErrors = getStep2Errors();
      if (Object.keys(stepErrors).length > 0) return showErrors(stepErrors);
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length));
    scrollToTop();
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
    scrollToTop();
  };

  const goToStep = (n) => {
    setErrors({});
    setStep(n);
    scrollToTop();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enter key on steps 1–2 moves forward instead of submitting
    if (step < STEPS.length) return handleNext();
    // On Review, only an explicit click on the Submit button submits
    if (e.nativeEvent?.submitter?.dataset?.submit !== "true") return;

    // Final safety check of both steps before submitting
    const step1Errors = await validateStep1(formData);
    if (Object.keys(step1Errors).length > 0) {
      goToStep(1);
      return showErrors(step1Errors);
    }
    const step2Errors = getStep2Errors();
    if (Object.keys(step2Errors).length > 0) {
      goToStep(2);
      return showErrors(step2Errors);
    }

    setSubmitLoader(true);

    try {
      const response = await api.post("/counsellor/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        clearDraftFromLocalStorage();
        // alert("Student Registered Successfully!!");
        successToast("Student Registered Successfully!!");
        navigate("/dashboard/registertable");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        // alert(error.response.data.message);
        errorToast(
          error.response.data.message ||
            "Error registering student. Please try again.",
        );
      } else {
        console.error("Error submitting form:", error);
        // alert("Error registering student. Please try again.");
        errorToast("Error registering student. Please try again.");
      }
    } finally {
      setSubmitLoader(false);
    }
  };


  const sectionCls =
    "mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6";
  const headingCls =
    "text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary";
  const errAttr = (name) => (errors[name] ? { "data-error": "true" } : {});

  const formatDate = (v) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "-";

  // Review step: label/value rows inside the same section boxes
  const renderReviewSection = (title, editStep, rows) => (
    <div className={sectionCls}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-tertiary">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => goToStep(editStep)}
          className="text-sm text-primary font-semibold hover:underline shrink-0"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col sm:flex-row sm:gap-2 text-sm sm:text-base border-b border-gray-100 pb-1"
          >
            <span className="text-gray-600 sm:min-w-[160px]">{label}:</span>
            <span className="font-medium text-gray-900 break-words">
              {value === "" || value === null || value === undefined
                ? "-"
                : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white" ref={formTopRef}>
      <div className="container w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Student Registration Form</h2>
          </div>

          {/* Step indicator */}
          <div className="px-2 sm:px-4 lg:px-6 pt-4">
            <div className="flex items-start w-full">
              {STEPS.map((label, idx) => {
                const n = idx + 1;
                const done = step > n;
                const active = step === n;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center relative">
                    {n > 1 && (
                      <div
                        className={`absolute top-4 sm:top-[18px] right-1/2 w-full h-0.5 ${
                          step >= n ? "bg-primary" : "bg-gray-300"
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full grid place-items-center text-sm font-bold border-2 ${
                        done || active
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-500"
                      }`}
                    >
                      {done ? "✓" : n}
                    </div>
                    <span
                      className={`mt-1 px-1 text-center text-[11px] sm:text-sm leading-tight ${
                        active ? "text-primary font-semibold" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Draft Recovery Button (step 1 only — the draft holds step 1 data) */}
          {showDraftButton && step === 1 && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mt-4 mx-2 sm:mx-4 lg:mx-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center">
                  <div className="ml-0 sm:ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Draft Found!</strong> You have unsaved form data.
                      Would you like to continue where you left off?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={loadDraftData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors w-full sm:w-auto"
                  >
                    Load Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearDraftFromLocalStorage();
                      setShowDraftButton(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors w-full sm:w-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full"
          >
            {/* ═══════════════ STEP 1: STUDENT INFO ═══════════════ */}
            {step === 1 && (
              <>
                {/* Personal Details Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Personal Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="w-full" {...errAttr("studentName")}>
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        placeholder="Enter Student Name"
                        className={inputCls("studentName")}
                        autoComplete="off"
                      />
                      <FieldError msg={errors.studentName} />
                    </div>
                    <div className="w-full" {...errAttr("gender")}>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={inputCls("gender")}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <FieldError msg={errors.gender} />
                    </div>
                    <div className="w-full" {...errAttr("dob")}>
                      <div className="w-full flex flex-row items-center gap-1">
                        <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">
                          Date of Birth:
                        </label>
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
                    <div className="w-full" {...errAttr("motherName")}>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="Enter Mother's Name"
                        className={inputCls("motherName")}
                        autoComplete="off"
                      />
                      <FieldError msg={errors.motherName} />
                    </div>
                    <div className="w-full lg:col-span-2" {...errAttr("address")}>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter Address"
                        rows="3"
                        maxLength={250}
                        className={inputCls("address", "resize-vertical")}
                      />
                      <FieldError msg={errors.address} />
                    </div>
                    <div className="w-full" {...errAttr("pincode")}>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="pincode"
                        value={formData.pincode}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "pincode",
                              value: e.target.value.replace(/\D/g, "").slice(0, 6),
                            },
                          })
                        }
                        placeholder="Enter Pincode"
                        className={inputCls("pincode")}
                      />
                      <FieldError msg={errors.pincode} />
                    </div>
                  </div>
                </div>

                {/* Educational Details Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Educational Details</h3>
                  <div className="flex flex-col gap-3 sm:gap-4 w-full lg:grid lg:grid-cols-2">
                    <div className="w-full order-1" {...errAttr("standard")}>
                      <select
                        name="standard"
                        value={formData.standard}
                        onChange={handleChange}
                        className={inputCls("standard")}
                      >
                        <option value="">Select Standard</option>
                        {standards.map((std) => (
                          <option key={std.id} value={std.name}>
                            {std.name}
                          </option>
                        ))}
                      </select>
                      <FieldError msg={errors.standard} />
                    </div>

                    {/* Auto-filled Previous Year Field */}
                    <div className="w-full flex flex-row items-center gap-1 order-2">
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">
                        Previous Year:
                      </label>
                      <input
                        type="text"
                        name="previousYear"
                        value={formData.previousYear}
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base"
                        disabled
                        readOnly
                      />
                    </div>

                    {/* Branch/Medium select — always visible, disabled until a standard is chosen */}
                    <div className="w-full order-3" {...errAttr("branch")}>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        disabled={
                          !formData.standard || formData.branches?.length === 0
                        }
                        className={inputCls(
                          "branch",
                          !formData.standard || formData.branches?.length === 0
                            ? "bg-gray-100 cursor-not-allowed"
                            : "",
                        )}
                      >
                        <option value="">
                          {!formData.standard
                            ? "Select Standard First"
                            : formData.branchType === "GROUP"
                              ? "Select Group"
                              : "Select Medium"}
                        </option>
                        {formData.branches?.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      <FieldError msg={errors.branch} />
                    </div>

                    <div className="w-full order-4" {...errAttr("preYearPercent")}>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="preYearPercent"
                        placeholder="Enter Previous Year Percentage"
                        value={formData.preYearPercent}
                        onWheel={(e) => e.target.blur()}
                        onChange={handleChange}
                        className={inputCls("preYearPercent")}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <FieldError msg={errors.preYearPercent} />
                    </div>

                    <div className="w-full lg:col-span-2 order-5" {...errAttr("schoolCollege")}>
                      <input
                        type="text"
                        name="schoolCollege"
                        value={formData.schoolCollege}
                        onChange={handleChange}
                        placeholder="Enter School/College Name"
                        className={inputCls("schoolCollege")}
                      />
                      <FieldError msg={errors.schoolCollege} />
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Contact Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="w-full" {...errAttr("email")}>
                      <input
                        type="email"
                        inputMode="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "email",
                              value: e.target.value.trim().toLowerCase(),
                            },
                          })
                        }
                        placeholder="Enter Student Email"
                        className={inputCls("email")}
                        autoComplete="off"
                      />
                      <FieldError msg={errors.email} />
                    </div>
                    {["studentNo", "parentsNo"].map((field) => (
                      <div className="w-full" key={field} {...errAttr(field)}>
                        <input
                          type="tel"
                          inputMode="numeric"
                          name={field}
                          value={formData[field]}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: field,
                                value: e.target.value.replace(/\D/g, "").slice(0, 10),
                              },
                            })
                          }
                          placeholder={
                            field === "studentNo"
                              ? "Enter Student Mobile No."
                              : "Enter Parents Mobile No."
                          }
                          className={inputCls(field)}
                        />
                        <FieldError msg={errors[field]} />
                      </div>
                    ))}
                    <div className="w-full" {...errAttr("appNo")}>
                      <select
                        name="appNo"
                        value={formData.appNo}
                        onChange={handleChange}
                        className={inputCls("appNo")}
                      >
                        <option value="">Select App. No.</option>
                        {formData.studentNo && (
                          <option value={formData.studentNo}>
                            Student No. ({formData.studentNo})
                          </option>
                        )}
                        {formData.parentsNo && (
                          <option value={formData.parentsNo}>
                            Parent No. ({formData.parentsNo})
                          </option>
                        )}
                      </select>
                      <FieldError msg={errors.appNo} />
                    </div>

                    <div className="w-full lg:col-span-2" {...errAttr("notificationNo")}>
                      <select
                        name="notificationNo"
                        value={formData.notificationNo}
                        onChange={handleChange}
                        className={inputCls("notificationNo")}
                      >
                        <option value="">Select Notification No.</option>
                        {formData.studentNo && (
                          <option value={formData.studentNo}>
                            Student Mobile No. ({formData.studentNo})
                          </option>
                        )}
                        {formData.parentsNo && (
                          <option value={formData.parentsNo}>
                            Parent Mobile No. ({formData.parentsNo})
                          </option>
                        )}
                      </select>
                      <FieldError msg={errors.notificationNo} />
                    </div>
                  </div>
                </div>

                {/* Exam Centre and Form Details Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Exam Centre and Form Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="w-full" {...errAttr("examCentre")}>
                      <CustomSelect
                        options={examCentres}
                        value={selectedExamCentre}
                        onChange={(v) => {
                          setSelectedExamCentre(v);
                          clearError("examCentre");
                        }}
                        isRequired={true}
                        error={!!errors.examCentre}
                        placeholder="Select Exam Centre"
                      />
                      <FieldError msg={errors.examCentre} />
                    </div>

                    {/* Auto-filled Exam Year Field */}
                    <div className="w-full flex flex-row items-center gap-1">
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">
                        Exam Year:
                      </label>
                      <input
                        type="text"
                        name="examYear"
                        value={formData.examYear}
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Payment Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                    {/* Payment Standard field is hidden but logic remains */}

                    <div className="w-full flex flex-row items-center gap-1">
                      <label className=" min-w-fit md:text-[17px] text-md mr-2 text-gray-600">
                        Total Amount:{" "}
                      </label>
                      <input
                        type="number"
                        value={formData.totalamount}
                        name="totalamount"
                        onWheel={(e) => e.target.blur()}
                        placeholder="Total Amount"
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                    <div className="w-full" {...errAttr("amountPaid")}>
                      <input
                        type="number"
                        inputMode="numeric"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onWheel={(e) => e.target.blur()}
                        onChange={handleChange}
                        placeholder="Enter Amount Paid"
                        className={inputCls(
                          "amountPaid",
                          paymentError ? "border-red-500" : "",
                        )}
                        min="1"
                        max={formData.totalamount}
                      />
                      <FieldError msg={errors.amountPaid} />
                    </div>
                    <div className="w-full flex flex-row items-center gap-1">
                      <label className=" min-w-fit md:text-[17px] text-md mr-2 text-gray-600">
                        Amount Remaining:{" "}
                      </label>
                      <input
                        type="number"
                        name="amountRemaining"
                        value={formData.amountRemaining}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Amount Remaining"
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>

                    {paymentError && !errors.amountPaid && (
                      <div className="lg:col-span-2">
                        <p className="text-red-500 text-sm mt-1">{paymentError}</p>
                      </div>
                    )}

                    {/* TEMPORARILY COMMENTED — receipt number field disabled
                    <input
                      type="number"
                      name="receiptNo"
                      value={formData.receiptNo}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleChange}
                      placeholder="Enter Fees Receipt Number"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                      required
                    />
                    */}
                    <div className="w-full" {...errAttr("modeOfPayment")}>
                      <select
                        name="modeOfPayment"
                        value={formData.modeOfPayment}
                        onChange={handleChange}
                        className={inputCls("modeOfPayment")}
                      >
                        <option value="">Select Payment Mode</option>
                        {PAYMENT_MODES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <FieldError msg={errors.modeOfPayment} />
                    </div>

                    <div className="w-full" {...errAttr("dueDate")}>
                      <div className="w-full flex flex-row items-center gap-1">
                        <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">
                          Due Date:
                        </label>
                        <input
                          disabled={isPaidInFull}
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          className={inputCls("dueDate", "disabled:opacity-50")}
                        />
                      </div>
                      <FieldError msg={errors.dueDate} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══════════════ STEP 2: DOCUMENTS & CONSENT ═══════════════ */}
            {step === 2 && (
              <>
                {/* Documents Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Student Documents</h3>
                  <div className="space-y-4">
                    <div {...errAttr("studentPhoto")}>
                      <FileUpload
                        title="Student Photo"
                        imageUrl={studentPhoto.imageUrl}
                        error={studentPhoto.error}
                        loader={studentPhoto.loader}
                        isSaved={studentPhoto.isSaved}
                        imageType="students"
                        onFileUpload={studentPhoto.handleFileUpload}
                        onUploadImage={handleStudentPhotoUpload}
                        onRemovePhoto={studentPhoto.removePhoto}
                      />
                      <FieldError msg={errors.studentPhoto} />
                    </div>
                    {/* TEMPORARILY COMMENTED — receipt photo upload disabled
                    <FileUpload
                      title="Fees Receipt Photo"
                      imageUrl={receiptPhoto.imageUrl}
                      error={receiptPhoto.error}
                      loader={receiptPhoto.loader}
                      isSaved={receiptPhoto.isSaved}
                      imageType="receipt"
                      onFileUpload={receiptPhoto.handleFileUpload}
                      onUploadImage={handleReceiptPhotoUpload}
                      onRemovePhoto={receiptPhoto.removePhoto}
                    />
                    */}
                    {isPaidInFull && (
                      <div {...errAttr("bookPhoto")}>
                        <FileUpload
                          title="Book Distribution Proof"
                          imageUrl={bookPhoto.imageUrl}
                          error={bookPhoto.error}
                          loader={bookPhoto.loader}
                          isSaved={bookPhoto.isSaved}
                          imageType="books"
                          onFileUpload={bookPhoto.handleFileUpload}
                          onUploadImage={handleBookPhotoUpload}
                          onRemovePhoto={bookPhoto.removePhoto}
                        />
                        <FieldError msg={errors.bookPhoto} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Consent Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Consent &amp; Declaration</h3>
                  <div className="border rounded bg-white p-2 sm:p-3">
                    <img
                      src={consentImage}
                      alt="Consent and declaration"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-3" {...errAttr("consentAccepted")}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.consentAccepted}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            consentAccepted: checked,
                          }));
                          clearError("consentAccepted");
                        }}
                        className="mt-1 w-5 h-5 shrink-0 rounded border-gray-300 text-[#094D9E] focus:ring-[#094D9E]"
                      />
                      <span className="text-sm sm:text-base text-gray-800">
                        {CONSENT_CHECKBOX_LABEL}{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <FieldError msg={errors.consentAccepted} />
                  </div>
                </div>

                {/* Signature Section */}
                <div className={sectionCls}>
                  <h3 className={headingCls}>Signature</h3>
                  <div className="space-y-3">
                    <div className="w-full md:w-1/2" {...errAttr("signerName")}>
                      <input
                        type="text"
                        name="signerName"
                        value={formData.signerName}
                        onChange={handleChange}
                        placeholder="Enter Signer Name (Student / Parent)"
                        className={inputCls("signerName")}
                        autoComplete="off"
                      />
                      <FieldError msg={errors.signerName} />
                    </div>
                    <div {...errAttr("signatureUrl")}>
                      <SignaturePad
                        savedUrl={formData.signatureUrl}
                        onSaved={(url) => {
                          setFormData((prev) => ({ ...prev, signatureUrl: url }));
                          clearError("signatureUrl");
                        }}
                        onCleared={() =>
                          setFormData((prev) => ({ ...prev, signatureUrl: "" }))
                        }
                      />
                      <FieldError msg={errors.signatureUrl} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══════════════ STEP 3: REVIEW & SUBMIT ═══════════════ */}
            {step === 3 && (
              <>
                {renderReviewSection("Student Personal Details", 1, [
                  ["Student Name", formData.studentName?.toUpperCase()],
                  ["Gender", formData.gender],
                  ["Date of Birth", formatDate(formData.dob)],
                  ["Mother's Name", formData.motherName?.toUpperCase()],
                  ["Address", formData.address],
                  ["Pincode", formData.pincode],
                ])}
                {renderReviewSection("Student Educational Details", 1, [
                  ["Standard", formData.standard],
                  ["Previous Year", formData.previousYear],
                  [formData.branchType === "GROUP" ? "Group" : "Medium", formData.branch],
                  ["Previous Year %", formData.preYearPercent],
                  ["School/College", formData.schoolCollege],
                ])}
                {renderReviewSection("Student Contact Details", 1, [
                  ["Email", formData.email],
                  ["Student Mobile No.", formData.studentNo],
                  ["Parents Mobile No.", formData.parentsNo],
                  ["App. No.", formData.appNo],
                  ["Notification No.", formData.notificationNo],
                ])}
                {renderReviewSection("Exam Centre and Payment Details", 1, [
                  ["Exam Centre", selectedExamCentre?.label],
                  ["Exam Year", formData.examYear],
                  ["Total Amount", Number(formData.totalamount || 0).toLocaleString("en-IN")],
                  ["Amount Paid", Number(formData.amountPaid || 0).toLocaleString("en-IN")],
                  ["Amount Remaining", Number(formData.amountRemaining || 0).toLocaleString("en-IN")],
                  ["Payment Mode", formData.modeOfPayment],
                  ["Due Date", isPaidInFull ? "Paid in full" : formatDate(formData.dueDate)],
                ])}

                {/* Documents, consent & signature */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-tertiary">
                      Documents, Consent &amp; Signature
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="text-sm text-primary font-semibold hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Student Photo</p>
                      {studentPhoto.imageUrl ? (
                        <img
                          src={studentPhoto.imageUrl}
                          alt="Student"
                          className="w-28 h-36 object-cover rounded border"
                        />
                      ) : (
                        <p className="text-sm">-</p>
                      )}
                    </div>
                    {isPaidInFull && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Book Distribution Proof</p>
                        {bookPhoto.imageUrl ? (
                          <img
                            src={bookPhoto.imageUrl}
                            alt="Book proof"
                            className="w-28 h-36 object-cover rounded border"
                          />
                        ) : (
                          <p className="text-sm">-</p>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Signature</p>
                      {formData.signatureUrl && (
                        <img
                          src={fileUrl(formData.signatureUrl)}
                          alt="Signature"
                          className="max-h-24 w-auto object-contain border rounded bg-white p-1"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formData.signerName?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-green-700 font-medium">
                    ✓ Consent &amp; declaration accepted
                  </p>
                </div>
              </>
            )}

            {/* ═══════════════ NAVIGATION ═══════════════ */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitLoader}
                  className="w-full sm:w-1/3 py-3 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition text-sm sm:text-base"
                >
                  Back
                </button>
              )}
              {/* Separate keys so React never turns the clicked Next button into the
                  Submit button mid-click (that made Next submit the form) */}
              {step < STEPS.length ? (
                <button
                  key="next-btn"
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 bg-primary grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
                >
                  Next
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="submit"
                  data-submit="true"
                  disabled={submitLoader}
                  className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
                >
                  {submitLoader ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
