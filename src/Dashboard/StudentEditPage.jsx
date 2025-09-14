import { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileUploadHook } from "./FileUploadHook";
import FileUpload from "./FileUpload";

const StudentEditPage = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;

  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Search and student data states
  const [studentId, setStudentId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [searchLoader, setSearchLoader] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [editMode, setEditMode] = useState(null); // 'photo' or 'details'
  
  // File upload hook for photo editing
  const studentPhoto = FileUploadHook();
  
  // Form states
  const [submitLoader, setSubmitLoader] = useState(false);
  const [examCentres, setExamCentres] = useState([]);
  
  // Searchable exam centre dropdown states
  const [examCentreSearch, setExamCentreSearch] = useState("");
  const [showExamCentreDropdown, setShowExamCentreDropdown] = useState(false);
  const examCentreDropdownRef = useRef(null);
  
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
    studentPhoto: ""
  });

  // Search for student
  const handleStudentSearch = async () => {
    if (!studentId.trim()) {
      setSearchError("Please enter a student ID");
      return;
    }

    setSearchLoader(true);
    setSearchError("");
    
    try {
      const response = await api.get(`/counsellor/student/${studentId}`);
      
      if (response.status === 200) {
        const student = response.data.student;
        console.log("Fetched student data:", student);
        setStudentData(student);
        console.log(new Date(student.dob).toISOString().split('T')[0]);
        // Safely set form data with fallback values
        setFormData({
          studentName: student.studentName || "",
          gender: student.gender || "",
          dob: new Date(student.dob).toISOString().split('T')[0] || "",
          motherName: student.motherName || "",
          address: student.address || "",
          pincode: student.pincode || "",
          email: student.email || "",
          studentNo: student.studentNo || "",
          parentsNo: student.parentsNo || "",
          appNo: student.appNo || "",
          notificationNo: student.notificationNo || "",
          standard: student.standard || "",
          previousYear: student.previousYear || "",
          schoolCollege: student.schoolCollege || "",
          preYearPercent: student.preYearPercent || "",
          branch: student.branch || "",
          examCentre: student.examCentre || "",
          examYear: student.examYear || "",
          studentPhoto: student.studentPhoto || ""
        });
        
        // Set exam centre search if exists
        if (student.examCentre) {
          const centreName = student.examCentre.split('-')[1];
          if (centreName) {
            setExamCentreSearch(centreName);
          }
        }
        
        // Set student photo URL if exists
       
        
        setSearchError("");
      }
    } catch (error) {
      console.error("Error in handleStudentSearch:", error);
      if (error.response?.status === 404) {
        setSearchError("Student not found with this ID");
      } else {
        setSearchError("Error fetching student data. Please try again.");
      }
      setStudentData(null);
    } finally {
      setSearchLoader(false);
    }
  };

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

  // Fetch exam centres
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

   const resetForm = () => {
    setStudentId("");
    setStudentData(null);
    setEditMode(null);
    setSearchError("");
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
      studentPhoto: ""
    });
    studentPhoto.resetUpload();
    setExamCentreSearch("");
  };

  // Handle photo upload
  const handleStudentPhotoUpload = async () => {
    const imageUrl = await studentPhoto.uploadImage();
    
    if (imageUrl && imageUrl.trim() !== '') {
      setFormData(prevData => ({
        ...prevData,
        studentPhoto: imageUrl
      }));
    } else {
      console.error("Student photo upload failed - no valid URL returned");
    }
  };

  // Handle photo update submission
  const handlePhotoUpdate = async () => {
    if (!studentPhoto.isSaved) {
      alert("Please upload and save the new photo first");
      return;
    }

    setSubmitLoader(true);
    
    try {
      const updateData = {
        studentId: studentData.studentId,
        studentPhoto: formData.studentPhoto,
        prevPhotoUrl: studentData.studentPhoto || ""
      };

      const response = await api.put(`/counsellor/updateStudentPhoto/${studentData.studentId}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Student photo updated successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Error updating photo. Please try again.");
    } finally {
      setSubmitLoader(false);
    }
  };

  // Handle details update submission
  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    setSubmitLoader(true);
    
    try {
      const updateData = { ...formData };
      delete updateData.studentPhoto;
      updateData.studentId = studentData.studentId;

      const response = await api.put(`/counsellor/updateStudentDetails/${studentData.studentId}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Student details updated successfully!");
        resetForm();}
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        console.error("Error updating details:", error);
        alert("Error updating student details. Please try again.");
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
            <h2 className="text-2xl font-bold">Edit Student Registration</h2>
          </div>

          {/* Student Search Section */}
          <div className="p-4 border-b bg-gray-50">
            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter Student ID"
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={handleStudentSearch}
                  disabled={searchLoader}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 min-w-[100px]"
                >
                  {searchLoader ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
              {searchError && (
                <p className="text-red-500 text-sm mt-2">{searchError}</p>
              )}
            </div>
          </div>

          {/* Student Found - Edit Options */}
          {studentData && !editMode && (
            <div className="p-4 bg-green-50 border border-green-200">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Student Found: {studentData.studentName}
                </h3>
                
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setEditMode('photo')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Edit Student Photo
                  </button>
                  <button
                    onClick={() => setEditMode('details')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Edit Other Details
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Search Another Student
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photo Edit Mode */}
          {editMode === 'photo' && studentData && (
            <div className="p-2 sm:p-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Student Photo</h3>
                  <button
                    onClick={() => setEditMode(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Current Photo Preview */}
                  <div className="border rounded-lg shadow-sm p-2 sm:p-4 bg-gray-50">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Current Photo</h4>
                    <div className="flex justify-center">
                      {studentData.studentPhoto ? (
                        <div className="relative">
                          <img
                            src={`${imgUrl}${studentData.studentPhoto}`}
                            alt="Current student photo"
                            className="w-40 sm:w-48 h-52 sm:h-64 object-cover border-2 border-gray-300 rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="hidden w-40 sm:w-48 h-52 sm:h-64 bg-gray-200 border-2 border-gray-300 rounded-lg items-center justify-center text-gray-500"
                          >
                            <div className="text-center px-2">
                              <svg className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p className="text-xs sm:text-sm">Image not available</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-40 sm:w-48 h-52 sm:h-64 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                          <div className="text-center px-2">
                            <svg className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-xs sm:text-sm font-medium">No Photo Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Student: <span className="font-medium">{studentData.studentName}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ID: <span className="font-medium">{studentData.studentId}</span>
                      </p>
                    </div>
                  </div>

                  {/* New Photo Upload */}
                  <div className="border rounded-lg shadow-sm p-2 sm:p-4">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Upload New Photo</h4>
                    <FileUpload
                      title="Select New Student Photo"
                      imageUrl={studentPhoto.imageUrl}
                      error={studentPhoto.error}
                      loader={studentPhoto.loader}
                      isSaved={studentPhoto.isSaved}
                      imageType="passport"
                      onFileUpload={studentPhoto.handleFileUpload}
                      onUploadImage={handleStudentPhotoUpload}
                      onRemovePhoto={studentPhoto.removePhoto}
                    />
                    
                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => setEditMode(null)}
                        className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition font-medium text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comparison View and Update Button */}
                {studentPhoto.imageUrl && (
                  <div className="mt-4 sm:mt-6 border rounded-lg shadow-sm p-2 sm:p-4 bg-blue-50">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-blue-800">Photo Comparison & Update</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">Current Photo</p>
                        {studentData.studentPhoto ? (
                          <img
                            src={`${imgUrl}${studentData.studentPhoto}`}
                            alt="Current photo"
                            className="w-24 sm:w-32 h-32 sm:h-40 object-cover border border-gray-300 rounded mx-auto"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-24 sm:w-32 h-32 sm:h-40 bg-gray-200 border border-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Photo</span>
                          </div>
                        )}
                        <div 
                          className="hidden w-24 sm:w-32 h-32 sm:h-40 bg-gray-200 border border-gray-300 rounded mx-auto items-center justify-center"
                        >
                          <span className="text-xs text-gray-500">No Photo</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">New Photo</p>
                        <img
                          src={studentPhoto.imageUrl}
                          alt="New photo"
                          className="w-24 sm:w-32 h-32 sm:h-40 object-cover border border-gray-300 rounded mx-auto"
                        />
                      </div>
                    </div>
                    
                    {/* Update Button */}
                    <div className="grid place-items-center w-full">
                      {studentPhoto.isSaved ? (
                        <button
                          onClick={handlePhotoUpdate}
                          disabled={submitLoader}
                          className="w-full max-w-md py-2 sm:py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition font-medium text-sm sm:text-base"
                        >
                          {submitLoader ? (
                            <span className="flex items-center justify-center">
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                              Updating Photo...
                            </span>
                          ) : (
                            "Update Photo"
                          )}
                        </button>
                      ) : (
                        <p className="text-amber-600 text-sm text-center bg-amber-50 border border-amber-200 rounded p-2 max-w-md w-full">
                          Please save the uploaded image first before updating
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Edit Mode */}
          {editMode === 'details' && studentData && (
            <div className="p-2 sm:p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Student Details</h3>
                <button
                  onClick={() => setEditMode(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleDetailsUpdate} className="space-y-4 sm:space-y-6 w-full">
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
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">Date of Birth:</label>
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

                {/* Educational Details Section - Limited Fields */}
                <div className="mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tertiary">Student Educational Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
                    
                    {/* Read-only Standard Field */}
                    <div className="w-full flex flex-row items-center gap-1">
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Standard:</label>
                      <input 
                        type="text" 
                        name="standard" 
                        value={formData.standard}
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base"
                        disabled
                        readOnly
                      />
                    </div>
                    
                    {/* Read-only Branch Field */}
                    <div className="w-full flex flex-row items-center gap-1">
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Branch:</label>
                      <input 
                        type="text" 
                        name="branch" 
                        value={formData.branch}
                        className="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base"
                        disabled
                        readOnly
                      />
                    </div>
                    
                    {/* Editable Previous Year Percentage */}
                    <input 
                      type="number" 
                      name="preYearPercent"
                      placeholder="Enter Previous Year Percentage" 
                      value={formData.preYearPercent}
                      onWheel={(e) => e.target.blur()} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base" 
                      required 
                      min="0" max="100" step="0.01"
                    />
                    
                    {/* Editable School/College Name */}
                    <input 
                      type="text" 
                      name="schoolCollege" 
                      value={formData.schoolCollege}
                      onChange={handleChange} 
                      placeholder="Enter School/College Name" 
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                      required
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
                    
                    {/* Auto-filled Exam Year Field */}
                    <div className="w-full flex flex-row items-center gap-1">
                      <label className="min-w-fit md:text-[17px] text-md mr-2 text-gray-600">Exam Year:</label>
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

                <div className="grid place-items-center w-full">
                  {formData.examCentre && (
                    <button 
                      type="submit" 
                      disabled={submitLoader}
                      className="w-full py-3 bg-green-600 disabled:opacity-50 grid place-items-center text-white rounded hover:bg-green-700 transition text-sm sm:text-base"
                    >
                      {submitLoader ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      ) : (
                        "Update Details"
                      )}
                    </button>
                  )}
                  {!formData.examCentre && (
                    <div className="mb-4">
                      <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                        Please select an Exam Centre to update details
                      </p>
                    </div>
                  )}
                </div>
                
              </form>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default StudentEditPage;
                   