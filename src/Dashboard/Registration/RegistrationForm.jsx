import { useState, useEffect } from "react";
import api from "../../Api";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import { useToast } from "../../useToast";
import CustomSelect from "../Generic/CustomSelect";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { successToast, infoToast, errorToast } = useToast();
  const studentPhoto = FileUploadHook();
  const receiptPhoto = FileUploadHook();

  const [paymentError, setPaymentError] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show9thBranchDropdown, setShow9thBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [show11thPlusBranchDropdown, setShow11thPlusBranchDropdown] =
    useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [examCentres, setExamCentres] = useState([]);
  const [isPaidInFull, setIsPaidInFull] = useState(false);
  const [selectedExamCentre, setSelectedExamCentre] = useState(null);
  const [showDraftButton, setShowDraftButton] = useState(false);

  const DRAFT_STORAGE_KEY = "studentRegistrationDraft";

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
    previousYear: "",
    schoolCollege: "",
    preYearPercent: "",
    branch: "",
    examCentre: "",
    examYear: "",
    receiptNo: "",
    studentPhoto: "",
    receiptPhoto: "",
    paymentStandard: "",
    totalamount: 0,
    amountPaid: "",
    modeOfPayment: "",
    amountRemaining: "",
    dueDate: "",
  });

  // Single source of truth for standard-related state
  const applyStandardLogic = (standard) => {
    const currDate = new Date();
    const currentYear = currDate.getFullYear();
    const currMonth = currDate.getMonth();
    const nextYear = currMonth < 4 ? currentYear : currentYear + 1;

    const standardConfig = {
      "9th+10th": {
        branch: "",
        previousYear: "8th",
        examYear: nextYear.toString(),
        paymentStandard: "9th+10th",
        totalamount: 6850,
        dropdowns: {
          show9th: true,
          show10th: false,
          show11th: false,
          show12th: false,
        },
      },
      "10th": {
        branch: "",
        previousYear: "9th",
        examYear: currentYear.toString(),
        paymentStandard: "10th",
        totalamount: 6850,
        dropdowns: {
          show9th: false,
          show10th: true,
          show11th: false,
          show12th: false,
        },
      },
      "11th+12th": {
        branch: "",
        previousYear: "10th",
        examYear: nextYear.toString(),
        paymentStandard: "11th+12th",
        totalamount: 9850,
        dropdowns: {
          show9th: false,
          show10th: false,
          show11th: true,
          show12th: false,
        },
      },
      "12th": {
        branch: "",
        previousYear: "11th",
        examYear: currentYear.toString(),
        paymentStandard: "12th",
        totalamount: 7900,
        dropdowns: {
          show9th: false,
          show10th: false,
          show11th: false,
          show12th: true,
        },
      },
    };

    const config = standardConfig[standard] ?? {
      branch: "",
      previousYear: "",
      examYear: "",
      paymentStandard: "",
      totalamount: 0,
      dropdowns: {
        show9th: false,
        show10th: false,
        show11th: false,
        show12th: false,
      },
    };

    const { dropdowns, ...formFields } = config;

    setShow9thBranchDropdown(dropdowns.show9th);
    setShow10thBranchDropdown(dropdowns.show10th);
    setShow11thPlusBranchDropdown(dropdowns.show11th);
    setShowBranchDropdown(dropdowns.show12th);

    return formFields;
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
        const draft = JSON.parse(draftString);
        return draft.data;
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
    if (
      draft &&
      Object.values(draft).some((value) => value !== "" && value !== 0)
    ) {
      setShowDraftButton(true);
    } else {
      setShowDraftButton(false);
    }
  };

  const loadDraftData = () => {
    const draftData = loadDraftFromLocalStorage();
    if (draftData) {
      if (draftData.standard) {
        applyStandardLogic(draftData.standard);
      }

      setFormData((prevData) => ({
        ...prevData,
        ...draftData,
      }));

      setShowDraftButton(false);
      // alert("Draft data loaded successfully!");
      infoToast("Draft data loaded successfully!");
    }
  };

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, []);

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    const hasData = Object.entries(formData).some(([key, value]) => {
      if (["studentPhoto", "receiptPhoto", "amountRemaining"].includes(key))
        return false;
      return value !== "" && value !== 0;
    });

    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      try {
        const draftData = { ...formData };
        delete draftData.studentPhoto;
        delete draftData.receiptPhoto;
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            data: draftData,
            timestamp: new Date().toISOString(),
          }),
        );
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
    const isPaidInFull = remaining === 0;

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      const standardFields = applyStandardLogic(value);
      setFormData({ ...formData, [name]: value, ...standardFields });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file uploads with form data update
  const handleStudentPhotoUpload = async (type) => {
    const imageUrl = await studentPhoto.uploadImage(type);
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData((prevData) => ({ ...prevData, studentPhoto: imageUrl }));
    } else {
      console.error("Student photo upload failed - no valid URL returned");
    }
  };

  const handleReceiptPhotoUpload = async (type) => {
    const imageUrl = await receiptPhoto.uploadImage(type);
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData((prev) => ({ ...prev, receiptPhoto: imageUrl }));
    } else {
      console.error("Receipt photo upload failed - no valid URL returned");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="w-full bg-white">
      <div className="container w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Student Registration Form</h2>
          </div>

          {/* Draft Recovery Button */}
          {showDraftButton && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mb-4 rounded-lg">
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
                    onClick={loadDraftData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors w-full sm:w-auto"
                  >
                    Load Draft
                  </button>
                  <button
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
            className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full"
          >
            {/* Personal Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Personal Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter Student Name"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Enter Mother's Name"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  rows="3"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base resize-vertical"
                  required
                />
                <input
                  type="number"
                  name="pincode"
                  value={formData.pincode}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="Enter Pincode"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="\d{6}"
                  title="Pincode must be 6 digits"
                />
              </div>
            </div>

            {/* Educational Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Educational Details
              </h3>
              <div className="flex flex-col gap-3 sm:gap-4 w-full lg:grid lg:grid-cols-2">
                <select
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-1"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="9th+10th">9th+10th</option>
                  <option value="10th">10th</option>
                  <option value="11th+12th">11th+12th</option>
                  <option value="12th">12th</option>
                </select>

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

                {show9thBranchDropdown && (
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
                    required
                  >
                    <option value="">Select Medium</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Semi-English">Semi-English</option>
                    <option value="English">English</option>
                  </select>
                )}

                {show10thBranchDropdown && (
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
                    required
                  >
                    <option value="">Select Medium</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Semi-English">Semi-English</option>
                    <option value="English">English</option>
                  </select>
                )}

                {show11thPlusBranchDropdown && (
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
                    required
                  >
                    <option value="">Select Group</option>
                    <option value="PCM">PCM</option>
                    <option value="PCB">PCB</option>
                    <option value="PCMB">PCMB</option>
                  </select>
                )}

                {showBranchDropdown && (
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
                    required
                  >
                    <option value="">Select Group</option>
                    <option value="PCM">PCM</option>
                    <option value="PCB">PCB</option>
                    <option value="PCMB">PCMB</option>
                  </select>
                )}

                <input
                  type="number"
                  name="preYearPercent"
                  placeholder="Enter Previous Year Percentage"
                  value={formData.preYearPercent}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-4"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />

                <input
                  type="text"
                  name="schoolCollege"
                  value={formData.schoolCollege}
                  onChange={handleChange}
                  placeholder="Enter School/College Name"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base order-5"
                  required
                />
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Contact Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Student Email"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <input
                  type="tel"
                  name="studentNo"
                  value={formData.studentNo}
                  onChange={handleChange}
                  placeholder="Enter Student Mobile No."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <input
                  type="tel"
                  name="parentsNo"
                  value={formData.parentsNo}
                  onChange={handleChange}
                  placeholder="Enter Parents Mobile No."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <select
                  name="appNo"
                  value={formData.appNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
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

                <select
                  name="notificationNo"
                  value={formData.notificationNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base"
                  required
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
              </div>
            </div>

            {/* Exam Centre and Form Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Exam Centre and Form Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                <CustomSelect
                  options={examCentres}
                  value={selectedExamCentre}
                  onChange={setSelectedExamCentre}
                  isRequired={true}
                  placeholder="Select Exam Centre"
                />

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
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Payment Details
              </h3>
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
                    onChange={handleChange}
                    placeholder="Total Amount"
                    className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="Enter Amount Paid"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm sm:text-base ${
                    paymentError
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  required
                  min="1"
                  max={formData.totalamount}
                />
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

                {paymentError && (
                  <div className="lg:col-span-2">
                    <p className="text-red-500 text-sm mt-1">{paymentError}</p>
                  </div>
                )}

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
                <select
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="cheque">Cheque</option>
                </select>

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
                    className="w-full px-3 py-2 border disabled:opacity-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">
                Student Documents
              </h3>
              <div className="space-y-4">
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
              </div>
            </div>

            <div className="grid place-items-center w-full">
              {studentPhoto.isSaved &&
                receiptPhoto.isSaved &&
                formData.examCentre &&
                !paymentError && (
                  <button
                    type="submit"
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
              {(!studentPhoto.isSaved ||
                !receiptPhoto.isSaved ||
                !formData.examCentre) && (
                <div className="mb-4 space-y-2">
                  {!studentPhoto.isSaved &&
                    !receiptPhoto.isSaved &&
                    !formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📋 Please complete: Upload Student photo, Upload Receipt
                        photo, and Select Exam Centre
                      </p>
                    )}
                  {!studentPhoto.isSaved &&
                    !receiptPhoto.isSaved &&
                    formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📸 Please upload and save both Student photo and Receipt
                        photo
                      </p>
                    )}
                  {!studentPhoto.isSaved &&
                    receiptPhoto.isSaved &&
                    !formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📋 Please upload Student photo and select Exam Centre
                      </p>
                    )}
                  {studentPhoto.isSaved &&
                    !receiptPhoto.isSaved &&
                    !formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📋 Please upload Receipt photo and select Exam Centre
                      </p>
                    )}
                  {!studentPhoto.isSaved &&
                    receiptPhoto.isSaved &&
                    formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📸 Please upload and save Student photo
                      </p>
                    )}
                  {studentPhoto.isSaved &&
                    !receiptPhoto.isSaved &&
                    formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        📸 Please upload and save Receipt photo
                      </p>
                    )}
                  {studentPhoto.isSaved &&
                    receiptPhoto.isSaved &&
                    !formData.examCentre && (
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        🏫 Please select an Exam Centre
                      </p>
                    )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
