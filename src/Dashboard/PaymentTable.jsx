import { Fragment, useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { Dialog, Transition } from "@headlessui/react";

// Mobile-friendly PDF viewer component (same as RegistrationTable)
const MobilePDFViewer = ({ pdfUrl, onClose, fileName, studentName, studentId }) => {
  const [viewMode, setViewMode] = useState('options'); // 'options' | 'iframe'
  
  // Detect if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  const handleDirectDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
      window.location.href = pdfUrl;
    }
  };
  
  // For mobile devices, show options instead of iframe
  if (isMobile && viewMode === 'options') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">View Receipt PDF</h2>
            <p className="text-gray-600 mb-1 text-sm">{studentName}</p>
            <p className="text-xs text-gray-500">ID: {studentId}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDirectDownload}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Browser
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Fallback iframe for desktop or when user chooses browser preview
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
              Receipt PDF Preview - {studentName}
            </h2>
            <p className="text-sm text-gray-600 truncate">Student ID: {studentId}</p>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setViewMode('options')}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                Options
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          {isMobile ? (
            // Mobile-optimized view
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-center mb-4 px-4">
                PDF preview may not work well on mobile devices.
                <br />
                Please use the download or "Open in Browser" options below.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDirectDownload}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Open in Browser
                </button>
              </div>
            </div>
          ) : (
            // Desktop iframe
            <iframe
              src={pdfUrl}
              className="w-full h-full border border-gray-300 rounded"
              title="Receipt PDF Preview"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>

        {/* Footer with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 md:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600 truncate w-full sm:w-auto">
            File: {fileName}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenInNewTab}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Open in New Tab
            </button>
            <button
              onClick={handleDirectDownload}
              className="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentTable = () => {
  const { user } = useAuth();
  const [paymentsData, setPaymentsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  
  // New state for PDF preview dialog
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);
  
  const imgUrl = import.meta.env.VITE_IMG_URL;

  // Cleanup PDF URL when dialog closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Function to get the most recent payment date for a student
  const getMostRecentPaymentDate = (payments) => {
    if (!payments || payments.length === 0) return new Date(0); // Very old date for students with no payments
    
    const dates = payments.map(payment => new Date(payment.createdAt));
    return new Date(Math.max(...dates));
  };

  // Function to sort students by most recent payment date (newest first)
  const sortStudentsByRecentPayment = (students) => {
    return students.sort((a, b) => {
      const dateA = getMostRecentPaymentDate(a.payments);
      const dateB = getMostRecentPaymentDate(b.payments);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  useEffect(() => {
    api
      .get("/counsellor/getPayments", {
        params: {
          uuid: user.uuid,
          role: user.role,
        },
      })
      .then((response) => {
        const sortedData = sortStudentsByRecentPayment(response.data.studentData);
        setPaymentsData(sortedData);
        setFilteredData(sortedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(paymentsData);
      return;
    }

    const filtered = paymentsData.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      const studentMatch =
        student.studentName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toString().toLowerCase().includes(searchLower);
      const paymentMatch = student.payments.some((payment) =>
        payment.paymentId?.toString().toLowerCase().includes(searchLower) ||
        payment.receiptNo?.toString().toLowerCase().includes(searchLower)
      );
      return studentMatch || paymentMatch;
    });

    // Sort filtered results as well
    const sortedFiltered = sortStudentsByRecentPayment(filtered);
    setFilteredData(sortedFiltered);
  }, [searchTerm, paymentsData]);

  const handleViewReceipt = (receiptPhoto) => {
    if (receiptPhoto) {
      setSelectedReceiptUrl(`${imgUrl}${receiptPhoto}`);
      setShowReceiptModal(true);
    } else {
      alert("No receipt image available.");
    }
  };

  const handleViewReceiptPDF = async (student) => {
    try {
      setLoadingPdfId(student.studentId);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: student.studentId },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const fileName = student.studentName
        ? `${student.studentName.replace(/\s+/g, "_")}_RECEIPT.pdf`
        : `${student.studentId}_RECEIPT.pdf`;

      // Set PDF preview data
      setPdfUrl(url);
      setPdfFileName(fileName);
      setCurrentPdfStudent(student);
      setShowPdfPreview(true);

    } catch (err) {
      alert(err.response?.status === 403 ? "Student not found!" : "Receipt download failed.");
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleClosePdfPreview = () => {
    setShowPdfPreview(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfFileName("");
    setCurrentPdfStudent(null);
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Payment Records</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, student ID, payment ID, or receipt no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow-custom md:p-6 p-2">
        <div className="overflow-auto">
        <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
          <thead className="bg-primary text-white uppercase">
            <tr>
              <th className="p-3 border">Sr. No.</th>
              <th className="p-3 border">Student ID.</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Amount Paid</th>
              <th className="p-3 border">Amount Remaining</th>
              <th className="p-3 border">Due Date</th>
              <th className="p-3 border">Payments</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, index) => (
              <tr key={index} className="text-center border-b hover:bg-gray-100 transition">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{student.studentId}</td>
                <td className="p-2 border">{student.studentName}</td>
                <td className="p-2 border">{student.amountPaid.toLocaleString('en-IN')}</td>
                <td className="p-2 border">{student.amountRemaining.toLocaleString('en-IN')}</td>
                <td className="p-2 border">
                  {student.dueDate
                    ? new Date(student.dueDate).toLocaleDateString("en-GB")
                    : "-"}
                </td>
                <td className="p-2 border">
                  <table className="w-full text-xs border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-1 border">Payment ID.</th>
                        <th className="p-1 border">Receipt No.</th>
                        <th className="p-1 border">Amount</th>
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Mode</th>
                        <th className="p-1 border">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payments.map((payment) => (
                        <tr key={payment.paymentId}>
                          <td className="p-1 border">{payment.paymentId}</td>
                          <td className="p-1 border">{payment.receiptNo}</td>
                          <td className="p-1 border">{payment.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="p-1 border">
                            {new Date(payment.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="p-1 border">{payment.paymentMode}</td>
                          <td className="p-1 border">
                            <button
                              onClick={() => handleViewReceipt(payment.receiptPhoto)}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleViewReceiptPDF(student)}
                    disabled={loadingPdfId === student.studentId}
                    className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded grid place-items-center ${
                      loadingPdfId === student.studentId ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingPdfId === student.studentId ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      "Receipt"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Receipt Image Modal (existing) */}
      <Transition appear show={showReceiptModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowReceiptModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-2 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white md:p-6 p-2 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Receipt Image
                  </Dialog.Title>
                  <div className="mt-4">
                    <img
                      src={selectedReceiptUrl}
                      alt="Receipt"
                      className="max-h-[500px] w-full object-contain rounded border"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => setShowReceiptModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile-Optimized PDF Preview */}
      {showPdfPreview && (
        <MobilePDFViewer
          pdfUrl={pdfUrl}
          onClose={handleClosePdfPreview}
          fileName={pdfFileName}
          studentName={currentPdfStudent?.studentName}
          studentId={currentPdfStudent?.studentId}
        />
      )}
    </div>
  );
};

export default PaymentTable;