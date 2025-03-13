import { useState, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext"; 
import DownloadReceipt from "./DownloadReceipt";


const RegistrationForm = () => {
  const {user} = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoFile, setFile] = useState();
  const [isPhotoSaved, setSaved] = useState(false);
  const [responseData, setResponse] = useState();
  const [formData, setFormData] = useState({
    visitTime: "",
    date: "",
    studentName: "",
    gender: "",
    dob: "",
    email: "",
    motherName: "",
    standard: "",
    schoolCollege: "",
    address: "",
    pincode: "",
    studentNo: "",
    parentsNo: "",
    counselorName: "",
    branch: "",
    examCentre: "",
    modeOfPayment: "",
    amountPaid: "",
    amountRemaining: "",
    studentPhoto: "",
    dueDate: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setImageUrl(response.data.imageUrl);
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
    }

    try {
      const response = await api.post("/student/register", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response) {
        console.log("Form Submitted Successfully",response.data.payment, response.data.student, response.data.student.studentPhoto);
        setResponse(response);
        alert("Student Register SUccessfully !!");
        setSubmitted(true);
      } else {
        console.error("Form Submission Failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-auto mx-auto mt-0 p-5 border rounded-lg shadow-md bg-gray-100">
  <h2 className="text-2xl font-bold text-center mb-5">Student Registration</h2>
  {!submitted ? (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-col items-center w-full">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Captured" className="w-[132px] h-[170px] rounded-lg" />
              <div className="flex flex-row gap-4 items-center">
                {!isPhotoSaved && (
                  <button type="button" onClick={retakePhoto} className="btn mt-2">
                    Retake Photo
                  </button>
                )}
                <button type="button" onClick={uploadImage} className="btn mt-2" disabled={isPhotoSaved}>
                  {isPhotoSaved ? "Saved !!" : "Save"}
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={openCamera} className="btn mt-2">
              Capture Photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Visit Time and Date */}
        <div className="flex flex-col">
          <label htmlFor="visitTime" className="font-semibold">Visit Time</label>
          <input type="time" id="visitTime" name="visitTime" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Select Time" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="date" className="font-semibold">Date</label>
          <input type="date" id="date" name="date" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Select Date" />
        </div>

        {/* Student Name and Gender */}
        <div className="flex flex-col">
          <label htmlFor="studentName" className="font-semibold">Student Name</label>
          <input type="text" id="studentName" name="studentName" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Student Name" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="gender" className="font-semibold">Gender</label>
          <select id="gender" name="gender" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Date of Birth and Email */}
        <div className="flex flex-col">
          <label htmlFor="dob" className="font-semibold">Date of Birth</label>
          <input type="date" id="dob" name="dob" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Select DOB" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold">Email</label>
          <input type="email" id="email" name="email" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Email" />
        </div>

        {/* Mother's Name and Standard */}
        <div className="flex flex-col">
          <label htmlFor="motherName" className="font-semibold">Mother's Name</label>
          <input type="text" id="motherName" name="motherName" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Mother's Name" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="standard" className="font-semibold">Standard</label>
          <input type="text" id="standard" name="standard" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Standard" />
        </div>

        {/* School/College and Address */}
        <div className="flex flex-col">
          <label htmlFor="schoolCollege" className="font-semibold">School/College</label>
          <input type="text" id="schoolCollege" name="schoolCollege" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter School/College" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="address" className="font-semibold">Address</label>
          <input type="text" id="address" name="address" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Address" />
        </div>

        {/* Pincode and Student No */}
        <div className="flex flex-col">
          <label htmlFor="pincode" className="font-semibold">PINCODE</label>
          <input type="text" id="pincode" name="pincode" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter PINCODE" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="studentNo" className="font-semibold">Student No</label>
          <input type="text" id="studentNo" name="studentNo" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Student Number" />
        </div>

        {/* Parents No and Counselor Name */}
        <div className="flex flex-col">
          <label htmlFor="parentsNo" className="font-semibold">Parents No</label>
          <input type="text" id="parentsNo" name="parentsNo" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Parents No" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="counselorName" className="font-semibold">Counselor Name</label>
          <input type="text" id="counselorName" name="counselorName" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Counselor Name" />
        </div>

        {/* Branch and Exam Centre */}
        <div className="flex flex-col">
          <label htmlFor="branch" className="font-semibold">Branch</label>
          <input type="text" id="branch" name="branch" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Branch" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="examCentre" className="font-semibold">Exam Centre</label>
          <input type="text" id="examCentre" name="examCentre" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Exam Centre" />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-5">Payment Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment Mode and Amount Paid */}
        <div className="flex flex-col">
          <label htmlFor="modeOfPayment" className="font-semibold">Payment Mode</label>
          <select id="modeOfPayment" name="modeOfPayment" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12">
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="amountPaid" className="font-semibold">Amount Paid</label>
          <input type="text" id="amountPaid" name="amountPaid" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Amount Paid" />
        </div>

        {/* Amount Remaining and Due Date */}
        <div className="flex flex-col">
          <label htmlFor="amountRemaining" className="font-semibold">Amount Remaining</label>
          <input type="text" id="amountRemaining" name="amountRemaining" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Enter Amount Remaining" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="dueDate" className="font-semibold">Due Date</label>
          <input type="date" id="dueDate" name="dueDate" onChange={handleChange} className="input bg-white rounded-lg py-2 w-11/12" placeholder="Select Due Date" />
        </div>
      </div>

      {isPhotoSaved && <button type="submit" className="btn w-full">Submit</button>}
    </form>
  ) : (
    <DownloadReceipt receiptData={responseData.data} />
  )}

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