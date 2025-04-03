import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RegistrationPDF from "./RegistrationPDF";

const DownloadRegistration = ({ studentData, setShowRegistration }) => {
  const handleCancel = () => {
    setShowRegistration(false);
  };
  console.log(studentData.studentPhoto);

  return (
    <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Student Registration Details</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-secondary mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-customgray text-sm">Student ID</p>
                <p className="font-medium">{studentData?.studentId || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Student Name</p>
                <p className="font-medium">{studentData?.studentName || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Gender</p>
                <p className="font-medium">{studentData?.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Date of Birth</p>
                <p className="font-medium">
                  {studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-customgray text-sm">Mother's Name</p>
                <p className="font-medium">{studentData?.motherName || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Email</p>
                <p className="font-medium">{studentData?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Student Contact</p>
                <p className="font-medium">{studentData?.studentNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Parents Contact</p>
                <p className="font-medium">{studentData?.parentsNo || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-6">
            <h2 className="text-xl font-semibold text-secondary mb-4">Educational Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-customgray text-sm">School/College</p>
                <p className="font-medium">{studentData?.schoolCollege || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Standard</p>
                <p className="font-medium">{studentData?.standard || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Branch</p>
                <p className="font-medium">{studentData?.branch || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Exam Centre</p>
                <p className="font-medium">{studentData?.examCentre || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Seat Number</p>
                <p className="font-medium">{studentData?.SeatNum || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          {studentData?.studentPhoto && (
            <div className="flex justify-center mb-6">
              <img 
                src={`http://localhost:5000${studentData.studentPhoto}`} 
                alt={`${studentData.studentName}'s photo`} 
                className="w-40 h-40 object-cover border-2 border-primary shadow-lg"
              />
            </div>
          )}

          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-secondary mb-4">Address Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-customgray text-sm">Address</p>
                <p className="font-medium">{studentData?.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Pincode</p>
                <p className="font-medium">{studentData?.pincode || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-6">
            <h2 className="text-xl font-semibold text-secondary mb-4">Payment Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-customgray text-sm">Form Number</p>
                <p className="font-medium">{studentData?.formNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Receipt Number</p>
                <p className="font-medium">{studentData?.receiptNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Amount Paid</p>
                <p className="font-medium">₹{studentData?.amountPaid || 0}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Amount Remaining</p>
                <p className="font-medium text-red-500">₹{studentData?.amountRemaining || 0}</p>
              </div>
              <div>
                <p className="text-customgray text-sm">Due Date</p>
                <p className="font-medium">
                  {studentData?.dueDate ? new Date(studentData.dueDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-customgray text-sm">Counsellor</p>
                <p className="font-medium">{studentData?.counsellor || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button 
          onClick={handleCancel}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <PDFDownloadLink
          document={<RegistrationPDF data={studentData} />}
          fileName={`${studentData.studentName}_Registration.pdf`}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          {({ loading }) => (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loading ? "Generating PDF..." : "Download Registration PDF"}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default DownloadRegistration;