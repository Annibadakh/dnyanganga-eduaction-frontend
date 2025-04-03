import { useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [photoFile, setFile] = useState(null);
  const [isPhotoSaved, setSaved] = useState(false);
  const [fileError, setFileError] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [show10thBranchDropdown, setShow10thBranchDropdown] = useState(false);
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
    standard: "",
    schoolCollege: "",
    branch: "",
    examCentre: "",
    formNo: "",
    receiptNo: "",
    studentPhoto: "",
    amountPaid: "",
    modeOfPayment: "",
    amountRemaining: "",
    dueDate: "",
  });
  const [examCentres, setExamCentres] = useState([]);
  
  useEffect(() => {
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        console.log(response.data.data);
        setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users", error);
      });
  }, []);

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
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    console.log(formData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type - only allow JPG and JPEG
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError("Only JPG and JPEG files are supported");
      return;
    }
    
    setFileError("");
    setFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setImageUrl("");
    setFile(null);
    setSaved(false);
    setFileError("");
  };

  const uploadImage = async () => {
    if (!photoFile) return;

    const imageData = new FormData();
    imageData.append("file", photoFile);

    try {
      const response = await api.post("/upload-photo", imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.imageUrl) {
        setImageUrl(`http://localhost:5000${response.data.imageUrl}`);
        console.log(response.data.imageUrl);
        setFormData({ ...formData, studentPhoto: response.data.imageUrl });
        setSaved(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if(user?.uuid){
      formDataToSend.append("uuid", user.uuid);
      formDataToSend.append("counsellor", user.userName);
    }

    try {
      const response = await api.post("/counsellor/register", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response) {
        console.log("Form Submitted Successfully",response.data.payment, response.data.student, response.data.student.studentPhoto);
        alert("Student Register Successfully !!");
        navigate("/dashboard/registertable");
        
      } else {
        console.error("Form Submission Failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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
            <div className="flex flex-col items-center w-full">
              {imageUrl ? (
                <>
                  <img 
                    src={`${imageUrl}`} 
                    alt="Uploaded" 
                    className="w-56 max-w-md h-auto object-cover rounded-md mb-4"
                  />
                  <div className="flex space-x-4 w-full justify-center">
                    {!isPhotoSaved && (
                      <button 
                        type="button" 
                        onClick={removePhoto} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Remove Photo
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={uploadImage} 
                      disabled={isPhotoSaved}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {isPhotoSaved ? "Photo Saved" : "Save Photo"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".jpg,.jpeg"
                    className="w-full px-3 py-2 border rounded"
                  />
                  {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
                  <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, JPEG</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <input 
                type="text" 
                name="studentName" 
                onChange={handleChange} 
                placeholder="Student Name" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <select 
                name="gender" 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="w-full flex flex-row items-center gap-1">
                <label className="w-32 text-sm text-gray-600">Date of Birth:</label>
                <input 
                  type="date" 
                  name="dob" 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              <input 
                type="text" 
                name="motherName" 
                onChange={handleChange} 
                placeholder="Mother's Name" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <input 
                type="text" 
                name="address" 
                onChange={handleChange} 
                placeholder="Address" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 md:col-span-2"
                required
              />
              <input 
                type="text" 
                name="pincode" 
                onChange={handleChange} 
                placeholder="PINCODE" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="\d{6}"
                title="Pincode must be 6 digits"
              />
            </div>
          </div>

          {/* Educational Details Section */}
          <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Educational Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <select 
                name="standard" 
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Semi-English">Semi-English</option>
                </select>
              ) : showBranchDropdown ? (
                <select 
                  name="branch" 
                  value={formData.branch} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                >
                  <option value="">Select Branch</option>
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
                  placeholder="Branch" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              )}
              
              <input 
                type="text" 
                name="schoolCollege" 
                onChange={handleChange} 
                placeholder="School/College" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 md:col-span-2"
                required
              />
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <input 
                type="email" 
                name="email" 
                onChange={handleChange} 
                placeholder="Student Email" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
              <input 
                type="tel" 
                name="studentNo" 
                onChange={handleChange} 
                placeholder="Student No" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[0-9]{10}"
                title="Phone number must be 10 digits"
              />
              <input 
                type="tel" 
                name="parentsNo" 
                onChange={handleChange} 
                placeholder="Parents No" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[0-9]{10}"
                title="Phone number must be 10 digits"
              />
              <input 
                type="tel" 
                name="appNo" 
                onChange={handleChange} 
                placeholder="Application No" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                pattern="[0-9]{10}"
                title="Phone number must be 10 digits"
              />
            </div>
          </div>

          {/* Exam Centre and Form Details Section */}
          <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Exam Centre and Form Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <select 
                  name="examCentre" 
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
              
              <input 
                type="text" 
                name="formNo" 
                onChange={handleChange} 
                placeholder="Form Number" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              
              <input 
                type="text" 
                name="receiptNo" 
                onChange={handleChange} 
                placeholder="Receipt Number" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="mb-6 w-full border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-tertiary">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <input 
                type="number" 
                name="amountPaid" 
                onChange={handleChange} 
                placeholder="Amount Paid" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                min="0"
              />
              <select 
                name="modeOfPayment" 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>
              <input 
                type="number" 
                name="amountRemaining" 
                onChange={handleChange} 
                placeholder="Amount Remaining" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                min="0"
              />
              <div className="w-full flex flex-row items-center gap-1">
                <label className="w-24 text-sm text-gray-600">Due Date:</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button 
              type="reset" 
              className="w-full py-3 bg-primary text-white rounded hover:bg-opacity-90 transition"
            >
              Reset
            </button>
          {isPhotoSaved && (
            <button 
              type="submit" 
              className="w-full py-3 bg-primary text-white rounded hover:bg-opacity-90 transition"
            >
              Submit
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