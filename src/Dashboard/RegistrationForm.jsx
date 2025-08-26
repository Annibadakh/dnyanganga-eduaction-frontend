import { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileUploadHook } from "./FileUploadHook";
import FileUpload from "./FileUpload";

const RegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // File upload hooks
  const studentPhoto = FileUploadHook();
  const receiptPhoto = FileUploadHook();
  const formPhoto = FileUploadHook();
  
  // Form states
  const [paymentError, setPaymentError] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
  const [showPreviousYearDropdown, setShowPreviousYearDropdown] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [examCentres, setExamCentres] = useState([]);
  const [handleDue, setHandleDue] = useState(false);
  
  // Draft management states
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftButton, setShowDraftButton] = useState(false);
  
  // New states for searchable exam centre dropdown
  const [examCentreSearch, setExamCentreSearch] = useState("");
  const [showExamCentreDropdown, setShowExamCentreDropdown] = useState(false);
  const examCentreDropdownRef = useRef(null);
  
  const DRAFT_STORAGE_KEY = 'studentRegistrationDraft';
  
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
    formNo: "",
    receiptNo: "",
    studentPhoto: "",
    receiptPhoto: "",
    formPhoto: "",
    paymentStandard: "",
    totalamount: 0,
    amountPaid: "",
    modeOfPayment: "",
    amountRemaining: "",
    dueDate: "",
  });

  // Filter function for searchable exam centre dropdown
  const filteredExamCentres = examCentres.filter(centre =>
    centre.centerName.toLowerCase().includes(examCentreSearch.toLowerCase())
  );

  // Click outside handler for exam centre dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (examCentreDropdownRef.current && !examCentreDropdownRef.current.contains(event.target)) {
        setShowExamCentreDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle exam centre selection
  const handleExamCentreSelect = (centre) => {
    const examCentreValue = `${centre.centerId}-${centre.centerName}`;
    setFormData(prevData => ({
      ...prevData,
      examCentre: examCentreValue
    }));
    setExamCentreSearch(centre.centerName);
    setShowExamCentreDropdown(false);
  };

  // Clear exam centre filter
  const clearExamCentreFilter = () => {
    setFormData(prevData => ({
      ...prevData,
      examCentre: ""
    }));
    setExamCentreSearch("");
  };

  // Draft management functions
  const saveDraftToLocalStorage = (data) => {
    try {
      const draftData = { ...data };
      delete draftData.studentPhoto;
      delete draftData.receiptPhoto;
      delete draftData.formPhoto;
      
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        data: draftData,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
    }
  };

  const loadDraftFromLocalStorage = () => {
    try {
      const draftString = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftString) {
        const draft = JSON.parse(draftString);
        return draft.data;
      }
      return null;
    } catch (error) {
      console.error('Error loading draft from localStorage:', error);
      return null;
    }
  };

  const clearDraftFromLocalStorage = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      setShowDraftButton(false);
    } catch (error) {
      console.error('Error clearing draft from localStorage:', error);
    }
  };

  const checkForExistingDraft = () => {
    const draft = loadDraftFromLocalStorage();
    if (draft && Object.values(draft).some(value => value !== "" && value !== 0)) {
      setHasDraft(true);
      setShowDraftButton(true);
    } else {
      setHasDraft(false);
      setShowDraftButton(false);
    }
  };

  const loadDraftData = () => {
    const draftData = loadDraftFromLocalStorage();
    if (draftData) {
      setFormData(prevData => ({
        ...prevData,
        ...draftData
      }));
      
      // Update dropdown states based on loaded data
      if (draftData.standard === "10th") {
        setShow10thBranchDropdown(true);
        setShowBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      } else if (draftData.standard === "12th") {
        setShowBranchDropdown(true);
        setShow10thBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      }
      
      // Update exam centre search if draft contains exam centre
      if (draftData.examCentre) {
        const centreName = draftData.examCentre.split('-')[1];
        if (centreName) {
          setExamCentreSearch(centreName);
        }
      }
      
      setShowDraftButton(false);
      alert("Draft data loaded successfully!");
    }
  };

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, []);

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    const hasData = Object.entries(formData).some(([key, value]) => {
      if (['studentPhoto', 'receiptPhoto', 'formPhoto', 'amountRemaining'].includes(key)) {
        return false;
      }
      return value !== "" && value !== 0;
    });

    if (hasData) {
      const timeoutId = setTimeout(() => {
        saveDraftToLocalStorage(formData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);
  
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching exam centers", error);
      });
  }, []);

  // Calculate amount remaining whenever totalamount or amountPaid changes
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalamount) || 0;
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    
    if (amountPaid > totalAmount && amountPaid > 0) {
      setPaymentError("Amount paid cannot be greater than total amount");
    } else {
      setPaymentError("");
    }
    
    const remaining = totalAmount - amountPaid;
    if(remaining === 0){
      setFormData(prevData => ({
        ...prevData,
        dueDate: ""
      }));
      setHandleDue(true);  
    } else {
      setHandleDue(false);
    }
    setFormData(prevData => ({
      ...prevData,
      amountRemaining: remaining >= 0 ? remaining.toString() : "0"
    }));
    
  }, [formData.totalamount, formData.amountPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "standard") {
      if (value === "10th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: "",
          paymentStandard: "10th",
          totalamount: 5850
        });
        setShow10thBranchDropdown(true);
        setShowBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      } else if (value === "12th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: "",
          paymentStandard: "",
          totalamount: 0
        });
        setShowBranchDropdown(true);
        setShow10thBranchDropdown(false);
        setShowPreviousYearDropdown(true);
      } else {
        setFormData({
          ...formData,
          [name]: value,
          branch: "",
          previousYear: "",
          paymentStandard: "",
          totalamount: 0
        });
        setShowBranchDropdown(false);
        setShow10thBranchDropdown(false);
        setShowPreviousYearDropdown(false);
      }
    } else if (name === "paymentStandard") {
      let newTotalAmount = 0;
      
      if (value === "10th") {
        newTotalAmount = 5850;
      } else if (value === "12th") {
        newTotalAmount = 7900;
      } else if (value === "11th+12th") {
        newTotalAmount = 9850;
      }
      
      setFormData({ 
        ...formData, 
        [name]: value,
        totalamount: newTotalAmount
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file uploads with form data update
  const handleStudentPhotoUpload = async () => {
    const imageUrl = await studentPhoto.uploadImage();
    if (imageUrl) {
      setFormData({ ...formData, studentPhoto: imageUrl });
    }
  };

  const handleReceiptPhotoUpload = async () => {
    const imageUrl = await receiptPhoto.uploadImage();
    if (imageUrl) {
      setFormData({ ...formData, receiptPhoto: imageUrl });
    }
  };

  const handleFormPhotoUpload = async () => {
    const imageUrl = await formPhoto.uploadImage();
    if (imageUrl) {
      setFormData({ ...formData, formPhoto: imageUrl });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoader(true);
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Add packageType based on paymentStandard
    let packageType = "";
    if (formData.paymentStandard === "10th") {
      packageType = "10th";
    } else if (formData.paymentStandard === "12th") {
      packageType = "12th";
    } else if (formData.paymentStandard === "11th+12th") {
      packageType = "11th+12th";
    }
    
    if (packageType) {
      formDataToSend.append("packageType", packageType);
    }
    
    if(user?.uuid){
      formDataToSend.append("uuid", user.uuid);
      formDataToSend.append("counsellor", user.userName);
      formDataToSend.append("counsellorBranch", user.branch);
    }

    try {
      const response = await api.post("/counsellor/register", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        clearDraftFromLocalStorage();
        alert("Student Registered Successfully!!");
        navigate("/dashboard/registertable");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        console.error("Error submitting form:", error);
        alert("Error registering student. Please try again.");
      }
    } finally {
      setSubmitLoader(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
      formNo: "",
      receiptNo: "",
      studentPhoto: "",
      receiptPhoto: "",
      formPhoto: "",
      paymentStandard: "",
      totalamount: 7900,
      amountPaid: "",
      modeOfPayment: "",
      amountRemaining: "",
      dueDate: "",
    });
    
    studentPhoto.resetUpload();
    receiptPhoto.resetUpload();
    formPhoto.resetUpload();
    
    clearDraftFromLocalStorage();
    setExamCentreSearch("");
    
    setPaymentError("");
    setShowBranchDropdown(false);
    setShow10thBranchDropdown(false);
    setShowPreviousYearDropdown(false);
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
                      <strong>Draft Found!</strong> You have unsaved form data. Would you like to continue where you left off?
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

          <form onSubmit={handleSubmit} className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full">
            {/* Photo Upload Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Photo</h3>
              <FileUpload
                title="Student Photo"
                imageUrl={studentPhoto.imageUrl}
                error={studentPhoto.error}
                loader={studentPhoto.loader}
                isSaved={studentPhoto.isSaved}
                imageType="passport"
                onFileUpload={studentPhoto.handleFileUpload}
                onUploadImage={handleStudentPhotoUpload}
                onRemovePhoto={studentPhoto.removePhoto}
              />
            </div>

            {/* Personal Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Personal Details</h3>
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
                  <label className=" min-w-fit md:text-[17px] text-md mr-2 text-black">Date of Birth:</label>
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
                  type="text" 
                  name="pincode" 
                  value={formData.pincode}
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
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Educational Details</h3>
              <div className="flex flex-col gap-3 sm:gap-4 w-full lg:grid lg:grid-cols-2">
                <select 
                  name="standard" 
                  value={formData.standard}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-1"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                </select>
                {show10thBranchDropdown ? (
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
                ) : showBranchDropdown ? (
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
                ) : (
                  !showPreviousYearDropdown && (
                    <input 
                      type="text" 
                      name="branch" 
                      onChange={handleChange} 
                      placeholder="Medium/Group" 
                      disabled={!showPreviousYearDropdown}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-3"
                      required
                    />
                  )
                )}
                <input 
                  type="text" 
                  name="schoolCollege" 
                  value={formData.schoolCollege}
                  onChange={handleChange} 
                  placeholder="Enter School/College Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base order-5"
                  required
                />
                <select 
                  name="previousYear" 
                  value={formData.previousYear}
                  disabled={!showPreviousYearDropdown}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-2"
                  required
                >
                  <option value="">Select Previous Year</option>
                  {formData.standard === "10th" && (
                    <>
                      <option value="8th">8th</option>
                      <option value="9th">9th</option>
                    </>
                  )}
                  {formData.standard === "12th" && (
                    <>
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                    </>
                  )}
                </select>
                <input 
                  type="number" 
                  name="preYearPercent" 
                  placeholder="Enter Previous Year Percentage" 
                  value={formData.preYearPercent}
                  onWheel={(e) => e.target.blur()} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base order-4" 
                  required 
                  min="0" max="100" step="0.01"
                />
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Contact Details</h3>
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
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Exam Centre and Form Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                
                {/* Searchable Exam Centre Dropdown */}
                <div className="relative w-full" ref={examCentreDropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search exam centres..."
                      value={examCentreSearch}
                      onChange={(e) => {
                        setExamCentreSearch(e.target.value);
                        setShowExamCentreDropdown(true);
                      }}
                      onFocus={() => setShowExamCentreDropdown(true)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base pr-8"
                    />
                    {formData.examCentre && (
                      <button
                        type="button"
                        onClick={clearExamCentreFilter}
                        className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {showExamCentreDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      <div
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                        onClick={() => {
                          clearExamCentreFilter();
                          setShowExamCentreDropdown(false);
                        }}
                      >
                        Select Exam Centre
                      </div>
                      {filteredExamCentres.map((centre) => (
                        <div
                          key={centre.centerId}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleExamCentreSelect(centre)}
                        >
                          {centre.centerName}
                        </div>
                      ))}
                      {filteredExamCentres.length === 0 && examCentreSearch && (
                        <div className="p-2 text-gray-500">No exam centres found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <select 
                  name="examYear" 
                  value={formData.examYear}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                  required
                >
                  <option value="">Select Dnyanganga Exam Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                
                <input 
                  type="text" 
                  name="formNo" 
                  value={formData.formNo}
                  onChange={handleChange} 
                  placeholder="Enter Admission Form Number" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 lg:col-span-2 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Payment Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                {formData.standard === "10th" ? (
                  <div className="w-full px-3 py-2 border rounded bg-gray-100 text-sm sm:text-base flex items-center">
                    <span className="text-gray-600">Standard: 10th (Auto-selected)</span>
                  </div>
                ) : formData.standard === "12th" ? (
                  <select 
                    name="paymentStandard" 
                    value={formData.paymentStandard}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Standard</option>
                    <option value="12th">12th</option>
                    <option value="11th+12th">11th+12th</option>
                  </select>
                ) : (
                  <select 
                    name="paymentStandard" 
                    value={formData.paymentStandard}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                    required
                    disabled
                  >
                    <option value="">Select Educational Standard First</option>
                  </select>
                )}
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Total Amount: </label>
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
                    paymentError ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                  }`}
                  required
                  min="0"
                  max={formData.totalamount}
                />
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Amount Remaining: </label>
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
                  type="text" 
                  name="receiptNo" 
                  value={formData.receiptNo}
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
                
                <div className="w-full lg:col-span-2">
                  <label className="block text-sm sm:text-base mb-1 text-black">Due Date:</label>
                  <input 
                    disabled={handleDue}
                    type="date" 
                    name="dueDate" 
                    value={formData.dueDate}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border disabled:opacity-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Documents</h3>
              <div className="space-y-4">
                {/* Form Photo Upload */}
                <FileUpload
                  title="Admission Form Photo"
                  imageUrl={formPhoto.imageUrl}
                  error={formPhoto.error}
                  loader={formPhoto.loader}
                  isSaved={formPhoto.isSaved}
                  imageType="receipt"
                  onFileUpload={formPhoto.handleFileUpload}
                  onUploadImage={handleFormPhotoUpload}
                  onRemovePhoto={formPhoto.removePhoto}
                />
                
                {/* Receipt Photo Upload */}
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
              {studentPhoto.isSaved && !paymentError && (
                <button 
                  type="submit" 
                  disabled={submitLoader || !formData.examCentre}
                  className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
                >
                  {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
                </button>
              )}
              {!studentPhoto.isSaved && (
                <div className="mb-4">
                    <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3 mb-2">
                        📸 Please upload and save Student photo first
                    </p>
                </div>
              )}
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;