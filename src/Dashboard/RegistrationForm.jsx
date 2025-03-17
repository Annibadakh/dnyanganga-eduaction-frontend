import { useState, useRef, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";



const RegistrationForm = () => {
  const {user} = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoFile, setFile] = useState();
  const [isPhotoSaved, setSaved] = useState(false);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  const openCamera = () => {
    setIsCameraOpen(true);
  
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    navigator.mediaDevices
      .getUserMedia({
        video: {
          aspectRatio: 0.78, 
          facingMode: isMobile ? { exact: "environment" } : "user", 
        },
      })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing camera:", err));
  };
  
  


  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
  
    canvas.width = 132;
    canvas.height = 170;
  
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    canvas.toBlob((blob) => {
      const file = new File([blob], "passport_photo.jpg", { type: "image/jpeg" });
      setImageUrl(URL.createObjectURL(blob));
      setFile(file);
      setPhotoCaptured(true);
    }, "image/jpeg");

    closeCamera();
  };
  

  const retakePhoto = () => {
    setPhotoCaptured(false);
    setImageUrl(""); 
    openCamera();
  };
  

  const uploadImage = async () => {
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
        setIsCameraOpen(false);
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
                  <img src={`${imageUrl}`} alt="Captured" className="w-[132px] h-[170px] rounded-lg" />
                  <div className="flex flex-row gap-4 items-center">
                  {!isPhotoSaved && (
                    <button type="button" onClick={retakePhoto} className="btn mt-2">
                    Retake Photo
                  </button>
                  )}
                  <button type="button" onClick={uploadImage} className="btn mt-2" disabled={isPhotoSaved}>
                    {isPhotoSaved ? "Saved !!": "Save" }
                  </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={openCamera} className="btn">
                  Capture Photo
                </button>
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
            <input type="text" name="standard" onChange={handleChange} placeholder="Standard" className="input" />
            <input type="text" name="schoolCollege" onChange={handleChange} placeholder="School/College" className="input" />
            <input type="text" name="branch" onChange={handleChange} placeholder="Branch" className="input" />
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
      {isCameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              {!photoCaptured ? (
                <>
                  <video ref={videoRef} autoPlay className="w-64 h-48"></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  <button onClick={captureImage} className="btn mt-2">Capture</button>
                </>
              ) : (
                <>
                  <img src={imageUrl} alt="Captured" className="w-64 h-48 rounded-lg" />
                  <button onClick={retakePhoto} className="btn mt-2">Retake Photo</button>
                </>
              )}
              <button onClick={closeCamera} className="btn ml-4 mt-2">Close</button>
            </div>
          </div>
        )}

    </div>
  );
}

export default RegistrationForm;