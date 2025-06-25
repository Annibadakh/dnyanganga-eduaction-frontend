import { useState, useEffect } from "react";
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
  const [submitLoader, setSubmitLoader] = useState(false);
  const [examCentres, setExamCentres] = useState([]);

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
    paymentStandard: "", // New field for payment standard
    totalamount: 0,
    amountPaid: "",
    modeOfPayment: "",
    amountRemaining: "",
    dueDate: "",
  });
  
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users", error);
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
          branch: ""
        });
        setShow10thBranchDropdown(true);
        setShowBranchDropdown(false);
      } else if (value === "12th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(true);
        setShow10thBranchDropdown(false);
      } else {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(false);
        setShow10thBranchDropdown(false);
      }
    } else if (name === "paymentStandard") {
      // Handle payment standard dropdown and update total amount
      let newTotalAmount = 0; // default
      
      if (value === "10th") {
        newTotalAmount = 6350;
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
    
    if(user?.uuid){
      formDataToSend.append("uuid", user.uuid);
      formDataToSend.append("counsellor", user.userName);
      formDataToSend.append("counsellorBranch", user.branch);
    }

    try {
      const response = await api.post("/counsellor/register", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response) {
        console.log("Form Submitted Successfully", response.data.payment, response.data.student, response.data.student.studentPhoto);
        alert("Student Register Successfully !!");
        navigate("/dashboard/registertable");
      } else {
        console.error("Form Submission Failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
      paymentStandard: "", // Reset payment standard
      totalamount: 7900,
      amountPaid: "",
      modeOfPayment: "",
      amountRemaining: "",
      dueDate: "",
    });
    
    // Reset all file uploads
    studentPhoto.resetUpload();
    receiptPhoto.resetUpload();
    formPhoto.resetUpload();
    
    setPaymentError("");
    setShowBranchDropdown(false);
    setShow10thBranchDropdown(false);
  };

  return (
    <div className="w-full bg-white">
      <div className="container px-1 py-1 w-full">
        <div className="w-full bg-white">
          <div className="bg-primary text-white text-center py-4">
            <h2 className="text-2xl font-bold">Student Registration Form</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 w-full">
            {/* Photo Upload Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Photo</h3>
              <FileUpload
                title=""
                imageUrl={studentPhoto.imageUrl}
                error={studentPhoto.error}
                loader={studentPhoto.loader}
                isSaved={studentPhoto.isSaved}
                onFileUpload={studentPhoto.handleFileUpload}
                onUploadImage={handleStudentPhotoUpload}
                onRemovePhoto={studentPhoto.removePhoto}
              />
            </div>

            {/* Personal Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="text" 
                  name="studentName" 
                  value={formData.studentName}
                  onChange={handleChange} 
                  placeholder="Enter Student Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit text-[17px] mr-2 text-gray-600">Date of Birth:</label>
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address}
                  onChange={handleChange} 
                  placeholder="Enter Address" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 md:col-span-2"
                  required
                />
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode}
                  onChange={handleChange} 
                  placeholder="Enter Pincode" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="\d{6}"
                  title="Pincode must be 6 digits"
                />
              </div>
            </div>

            {/* Educational Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Educational Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <select 
                  name="standard" 
                  value={formData.standard}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="w-full px-3 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="w-full px-3 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select Group</option>
                    <option value="PCM">PCM</option>
                    <option value="PCB">PCB</option>
                    <option value="PCMB">PCMB</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleChange} 
                    placeholder="Branch/Medium" 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                )}
                
                <input 
                  type="text" 
                  name="schoolCollege" 
                  value={formData.schoolCollege}
                  onChange={handleChange} 
                  placeholder="Enter School/College Name" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <input 
                  type="number" 
                  name="preYearPercent" 
                  placeholder="Enter Previous Year Percentage" 
                  value={formData.preYearPercent} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  required 
                  min="0" max="100" step="0.01"
                />
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange} 
                  placeholder="Enter Student Email" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <input 
                  type="tel" 
                  name="studentNo" 
                  value={formData.studentNo}
                  onChange={handleChange} 
                  placeholder="Enter Student No" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <input 
                  type="tel" 
                  name="parentsNo" 
                  value={formData.parentsNo}
                  onChange={handleChange} 
                  placeholder="Enter Parents No" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be 10 digits"
                />
                <select 
                  name="appNo" 
                  value={formData.appNo}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select App No.</option>
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Notification No.</option>
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
              </div>
            </div>

            {/* Exam Centre and Form Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Exam Centre and Form Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <select 
                    name="examCentre" 
                    value={formData.examCentre}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select Exam Centre</option>
                    {examCentres.map((centre) => (
                      <option key={centre.centerId} value={centre.centerName}>
                        {centre.centerName}
                      </option>
                    ))}
                  </select>
                </div>
                
        
                  <select 
                    name="examYear" 
                    value={formData.examYear}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* New Payment Standard Dropdown */}
                <select 
                  name="paymentStandard" 
                  value={formData.paymentStandard}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="11th+12th">11th+12th</option>
                </select>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit text-[17px] mr-2 text-gray-600">Total Amount: </label>
                <input 
                  type="number" 
                  value={formData.totalamount}
                  name="totalamount" 
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
                  onChange={handleChange} 
                  placeholder="Enter Amount Paid" 
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                    paymentError ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                  }`}
                  required
                  min="0"
                  max={formData.totalamount}
                />
                <div className="w-full flex flex-row items-center gap-1">
                  <label className=" min-w-fit text-[17px] mr-2 text-gray-600">Amount Remaining: </label>
                  <input 
                      type="number" 
                      name="amountRemaining" 
                      value={formData.amountRemaining}
                      placeholder="Amount Remaining" 
                      className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                
                {paymentError && (
                  <div className="md:col-span-2">
                    <p className="text-red-500 text-sm mt-1">{paymentError}</p>
                  </div>
                )}
                
                <input 
                  type="text" 
                  name="receiptNo" 
                  value={formData.receiptNo}
                  onChange={handleChange} 
                  placeholder="Enter Fee Receipt Number" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <select 
                  name="modeOfPayment" 
                  value={formData.modeOfPayment}
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Cheque</option>
                </select>
                
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="w-20 text-[15px] text-gray-600">Due Date:</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={formData.dueDate}
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-tertiary">Student Documents</h3>
              {/* Form Photo Upload */}
              <FileUpload
                title="Admission Form Photo"
                imageUrl={formPhoto.imageUrl}
                error={formPhoto.error}
                loader={formPhoto.loader}
                isSaved={formPhoto.isSaved}
                onFileUpload={formPhoto.handleFileUpload}
                onUploadImage={handleFormPhotoUpload}
                onRemovePhoto={formPhoto.removePhoto}
              />
              
              {/* Receipt Photo Upload */}
              <FileUpload
                title="Fee Receipt Photo"
                imageUrl={receiptPhoto.imageUrl}
                error={receiptPhoto.error}
                loader={receiptPhoto.loader}
                isSaved={receiptPhoto.isSaved}
                onFileUpload={receiptPhoto.handleFileUpload}
                onUploadImage={handleReceiptPhotoUpload}
                onRemovePhoto={receiptPhoto.removePhoto}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button 
              type="button"
              onClick={handleReset}
              disabled={submitLoader}
              className="w-full py-3 disabled:opacity-50 bg-primary text-white rounded hover:bg-opacity-90 transition"
            >
              Reset
            </button>
          {studentPhoto.isSaved && !paymentError && (
            <button 
              type="submit" 
              disabled={submitLoader}
              className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition"
            >
              {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
            </button>
          )}
          </div>
          
        </form>
      </div>
    </div>
  </div>
);
  
  
}

export default RegistrationForm;