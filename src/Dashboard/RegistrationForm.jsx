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
    standard: "",
    schoolCollege: "",
    branch: "",
    firstPref: "",
    secondPref: "",
    thirdPref: "",
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
          branch: "ALL"
        });
        setShowBranchDropdown(false);
      } else if (value === "12th") {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(true);
      } else {
        setFormData({
          ...formData,
          [name]: value,
          branch: ""
        });
        setShowBranchDropdown(false);
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
  
  const getAvailableCentres = (selected) => {
    return examCentres.filter(
      (centre) =>
        ![formData.firstPref, formData.secondPref, formData.thirdPref].includes(centre.centerName) ||
        centre.centerName === selected
    );
  };

  return (
    <div className="w-auto mx-auto mt-0 p-5 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center mb-5">Student Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mt-5">Student Photo</h3>
            <div>
              {imageUrl ? (
                <>
                  <img src={`${imageUrl}`} alt="Uploaded" className="w-[132px] h-[170px] rounded-lg object-cover" />
                  <div className="flex flex-row gap-4 items-center">
                    {!isPhotoSaved && (
                      <button type="button" onClick={removePhoto} className="btn mt-2">
                        Remove Photo
                      </button>
                    )}
                    <button type="button" onClick={uploadImage} className="btn mt-2" disabled={isPhotoSaved}>
                      {isPhotoSaved ? "Saved !!" : "Save" }
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="block">
                    <span className="sr-only">Choose photo</span>
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      accept=".jpg,.jpeg"
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100
                      "
                    />
                  </label>
                  {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
                  <p className="text-sm text-gray-500">Only JPG and JPEG files are supported</p>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mt-5">Personal Details: </h3>
            <div className="grid gird-col-1 md:grid-cols-2 gap-4">
            <input type="text" name="studentName" onChange={handleChange} placeholder="Student Name" className="input" />
            <select name="gender" onChange={handleChange} className="input">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input type="date" name="dob" onChange={handleChange} placeholder="DOB" className="input" />
            <input type="text" name="motherName" onChange={handleChange} placeholder="Mother's Name" className="input" />
            <input type="text" name="address" onChange={handleChange} placeholder="Address" className="input" />
            <input type="text" name="pincode" onChange={handleChange} placeholder="PINCODE" className="input" />
            </div>
            <h3 className="text-xl font-bold mt-5">Educational Details: </h3>
            <div className="grid gird-col-1 md:grid-cols-2 gap-4">
              <select name="standard" onChange={handleChange} className="input">
                <option value="">Select Standard</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
              </select>
              
              {showBranchDropdown ? (
                <select name="branch" value={formData.branch} onChange={handleChange} className="input">
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
                  className="input" 
                  readOnly={formData.standard === "10th"}
                />
              )}
              
              <input type="text" name="schoolCollege" onChange={handleChange} placeholder="School/College" className="input" />
            </div>
            <h3 className="text-xl font-bold mt-5">Contact Details: </h3>
            <div className="grid gird-col-1 md:grid-cols-2 gap-4">
            <input type="email" name="email" onChange={handleChange} placeholder="Email" className="input" />
            <input type="text" name="studentNo" onChange={handleChange} placeholder="Student No" className="input" />
            <input type="text" name="parentsNo" onChange={handleChange} placeholder="Parents No" className="input" />
            </div>
            <h3 className="text-xl font-bold mt-5">Exam Centre </h3>
            <div className="grid gird-col-1 md:grid-cols-2 gap-4">
            <label>First Preference:</label>
            <select name="firstPref" onChange={handleChange}>
              <option value="">Select</option>
              {examCentres.map((centre) => (
                <option key={centre.centerId} value={centre.centerName}>
                  {centre.centerName}
                </option>
              ))}
            </select>

            <label>Second Preference:</label>
            <select
              name="secondPref"
              onChange={handleChange}
              disabled={!formData.firstPref}
            >
              <option value={formData.secondPref}>Select</option>
              {getAvailableCentres(formData.secondPref).map((centre) => (
                <option key={centre.centerId} value={centre.centerName}>
                  {centre.centerName}
                </option>
              ))}
            </select>

            <label>Third Preference:</label>
            <select
              name="thirdPref"
              onChange={handleChange}
              disabled={!formData.secondPref}
            >
              <option value="">Select</option>
              {getAvailableCentres(formData.thirdPref).map((centre) => (
                <option key={centre.centerId} value={centre.centerName}>
                  {centre.centerName}
                </option>
              ))}
            </select>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mt-5">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="amountPaid" onChange={handleChange} placeholder="Amount Paid" className="input" />
            <select name="modeOfPayment" onChange={handleChange} className="input">
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
            <input type="text" name="amountRemaining" onChange={handleChange} placeholder="Amount Remaining" className="input" />
            <input type="date" name="dueDate" onChange={handleChange} placeholder="Due Date" className="input" />
          </div>
          
          {isPhotoSaved && <button type="submit" className="btn w-full">Submit</button>}
        </form>
    </div>
  );
}

export default RegistrationForm;