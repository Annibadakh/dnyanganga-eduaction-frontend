import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RegistrationPDF from "./RegistrationPDF";

const DownloadRegistration = ({ studentData, setShowRegistration }) => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  console.log(studentData)
  const handleCancel = () => {
    setShowRegistration(false);
  };

  const InfoField = ({ label, value, isHighlight }) => (
    <div className="mb-4">
      <p className="text-customgray text-sm font-medium">{label}</p>
      <p className={`font-medium font-custom ${isHighlight ? "text-primary text-base" : "text-customblack"}`}>
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="p-10 bg-customwhite border border-gray-200 rounded-2xl">
      
      <h1 className="text-4xl font-bold text-primary mb-10 text-center font-custom">
        Student Registration Details
      </h1>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-secondary mb-4 border-b pb-2 border-gray-300 font-custom">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Student ID" value={studentData?.studentId} isHighlight />
              <InfoField label="Student Name" value={studentData?.studentName} isHighlight />
              <InfoField label="Gender" value={studentData?.gender} />
              <InfoField label="Date of Birth" value={studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : null} />
              <InfoField label="Mother's Name" value={studentData?.motherName} />
              <InfoField label="Email" value={studentData?.email} />
              <InfoField label="Student Contact" value={studentData?.studentNo} />
              <InfoField label="Parents Contact" value={studentData?.parentsNo} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4 border-b pb-2 border-gray-300 font-custom">
              Educational Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="School/College" value={studentData?.schoolCollege} />
              <InfoField label="Standard" value={studentData?.standard} />
              <InfoField label="Branch" value={studentData?.branch} />
              <InfoField label="Exam Centre" value={studentData?.examCentre} />
              <InfoField label="Seat Number" value={studentData?.SeatNum} />
            </div>
          </div>
        </div>

        <div className="col-span-1">
          {studentData?.studentPhoto && (
            <div className="flex justify-center mb-8 bg-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="relative">
                <img
                  src={`${imgUrl}${studentData.studentPhoto}`}
                  alt={`${studentData.studentName}'s photo`}
                  className="w-48 h-48 object-cover border-4 border-primary rounded-lg"
                />
                <div className="absolute -bottom-3 -right-3 bg-primary text-white px-3 py-1 rounded-md text-xs font-bold font-custom">
                  ID Photo
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <h2 className="text-2xl font-semibold text-secondary mb-4 border-b pb-2 border-gray-300 font-custom">
              Address Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <InfoField label="Address" value={studentData?.address} />
              <InfoField label="Pincode" value={studentData?.pincode} />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-secondary mb-4 border-b pb-2 border-gray-300 font-custom">
              Payment Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Form Number" value={studentData?.formNo} />
              <InfoField label="Receipt Number" value={studentData?.receiptNo} />
              <InfoField label="Amount Paid" value={`₹${studentData?.amountPaid || 0}`} />
              <InfoField label="Amount Remaining" value={`₹${studentData?.amountRemaining || 0}`} isHighlight={studentData?.amountRemaining > 0} />
              <InfoField label="Due Date" value={studentData?.dueDate ? new Date(studentData.dueDate).toLocaleDateString() : null} />
              <InfoField label="Counsellor" value={studentData?.counsellor} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10 pt-6 border-t border-gray-300">
        <button
          onClick={handleCancel}
          className="bg-fourthcolor text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-custom"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Form
          </div>
        </button>

        <PDFDownloadLink
          document={<RegistrationPDF data={studentData} />}
          fileName={`${studentData.studentName}_Registration.pdf`}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-tertiary transition-all duration-200 font-custom"
        >
          {({ loading }) => (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loading ? "Generating PDF..." : "Download Registration PDF"}
            </div>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default DownloadRegistration;
