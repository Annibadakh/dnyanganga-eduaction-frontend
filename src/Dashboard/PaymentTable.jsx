import { Fragment, useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { Dialog, Transition } from "@headlessui/react";
import { RotateCw } from "lucide-react";

// Mobile-friendly PDF viewer component (same as before)
const MobilePDFViewer = ({ pdfUrl, onClose, fileName, studentName, studentId }) => {
  const [viewMode, setViewMode] = useState('options');
  
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
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

        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          {isMobile ? (
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
            <iframe
              src={pdfUrl}
              className="w-full h-full border border-gray-300 rounded"
              title="Receipt PDF Preview"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>

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

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  onItemsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm border rounded ${
              page === currentPage
                ? 'bg-primary text-white border-primary'
                : page === '...'
                ? 'cursor-default'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== 'string') {
    return '';
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
const PaymentTable = () => {
  const { user } = useAuth();
  const [paymentsData, setPaymentsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentType, setPaymentType] = useState("");


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // PDF and Receipt states
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);

  // Searchable dropdown states
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  const counsellorDropdownRef = useRef(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const imgUrl = import.meta.env.VITE_IMG_URL;

  // Filter functions for searchable dropdowns
  const filteredCounsellors = users.filter(user =>
    user.name.toLowerCase().includes(counsellorSearch.toLowerCase())
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup PDF URL when dialog closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users data
  useEffect(() => {
    if (user.role === "admin") {
      api
        .get("/admin/getUser")
        .then((response) => {
          const counsellors = response.data.data.filter(
            (user) => user.role === "counsellor"
          );
          setUsers(counsellors);
        })
        .catch((error) => {
          console.error("Error fetching users", error);
        });
    }
  }, [user.role]);

  // Fetch payments data with pagination
  const fetchPaymentsData = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm,
      counsellor: selectedCounsellor,
      startDate: startDate,
      endDate: endDate,
      paymentType
    };

    api
      .get("/counsellor/getPayments", { params })
      .then((response) => {
        setPaymentsData(response.data.payments);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  };

  // Fetch payments data when dependencies change
  useEffect(() => {
    fetchPaymentsData();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    selectedCounsellor,
    startDate,
    endDate,
    paymentType
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCounsellor, startDate, endDate, paymentType]);

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor.uuid);
    setCounsellorSearch(counsellor.name);
    setShowCounsellorDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleViewReceipt = (receiptPhoto) => {
    if (receiptPhoto) {
      setSelectedReceiptUrl(`${imgUrl}${receiptPhoto}`);
      setShowReceiptModal(true);
    } else {
      alert("No receipt image available.");
    }
  };

  const handleViewReceiptPDF = async (payment) => {
    try {
      setLoadingPdfId(payment.paymentId);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: payment.Student.studentId },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const fileName = payment.Student.studentName
        ? `${payment.Student.studentName.replace(/\s+/g, "_")}_RECEIPT.pdf`
        : `${payment.Student.studentId}_RECEIPT.pdf`;

      setPdfUrl(url);
      setPdfFileName(fileName);
      setCurrentPdfStudent(payment.Student);
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, student ID, payment ID, or receipt no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-full md:w-1/3 border border-gray-300 rounded-lg"
        />

        {user.role === "admin" && (
          <div className="relative w-full md:w-1/4" ref={counsellorDropdownRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search counsellors..."
                value={counsellorSearch}
                onChange={(e) => {
                  setCounsellorSearch(e.target.value);
                  setShowCounsellorDropdown(true);
                }}
                onFocus={() => setShowCounsellorDropdown(true)}
                className="p-3 w-full border border-gray-300 rounded-lg pr-8"
              />
              {selectedCounsellor && (
                <button
                  onClick={clearCounsellorFilter}
                  className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {showCounsellorDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                <div
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => {
                    clearCounsellorFilter();
                    setShowCounsellorDropdown(false);
                  }}
                >
                  All Counsellors
                </div>
                {filteredCounsellors.map((counsellor) => (
                  <div
                    key={counsellor.uuid}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCounsellorSelect(counsellor)}
                  >
                    {counsellor.name}
                  </div>
                ))}
                {filteredCounsellors.length === 0 && counsellorSearch && (
                  <div className="p-2 text-gray-500">No counsellors found</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap md:flex-row gap-1 w-full md:w-1/3">
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 w-full border border-gray-300 rounded-lg text-sm"
              placeholder="Start Date"
            />
          </div>
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 w-full border border-gray-300 rounded-lg text-sm"
              placeholder="End Date"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilters}
              className="px-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm whitespace-nowrap"
            >
              Clear Dates
            </button>
          )}
        </div>
        <div className="w-full md:w-1/4">
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="p-3 w-full border border-gray-300 rounded-lg"
          >
            <option value="">All Payment Types</option>
            <option value="INITIAL">INITIAL</option>
            <option value="RECOLLECTION">RECOLLECTION</option>
          </select>
        </div>


      </div>

      {/* Table */}
      <div className="bg-white shadow-custom md:p-6 p-2">
        {loading && <p className="text-customgray text-lg">Loading...</p>}
        {error && <p className="text-red-500 text-lg">{error}</p>}

        {!loading && !error && paymentsData.length > 0 ? (
          <>
            <div className="overflow-auto">
              <table className="table-auto w-full border text-center border-customgray overflow-hidden shadow-lg text-sm">
                <thead className="bg-primary text-customwhite uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left border whitespace-nowrap">Sr. No.</th>
                    <th className="p-3 border text-left whitespace-nowrap">Payment Date</th>
                    {user.role === 'admin' && <th className="p-3 border whitespace-nowrap">Counsellor</th>}
                    <th className="p-3 border whitespace-nowrap">Student ID</th>
                    <th className="p-3 border whitespace-nowrap">Student Name</th>
                    <th className="p-3 border whitespace-nowrap">Payment ID</th>
                    <th className="p-3 border whitespace-nowrap">Receipt No</th>
                    <th className="p-3 border whitespace-nowrap">Amount Paid</th>
                    <th className="p-3 border whitespace-nowrap">Payment Mode</th>
                    <th className="p-3 border whitespace-nowrap">Payment Type</th>
                    <th className="p-3 border whitespace-nowrap">Receipt</th>
                    <th className="p-3 border whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {paymentsData.map((payment, index) => (
                    <tr key={payment.paymentId} className="border-b border-gray-200 hover:bg-gray-100 transition">
                      <td className="p-3 border whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      {user.role === 'admin' && (
                        <td className="p-3 border whitespace-nowrap">
                          {payment.Student?.User?.name || '-'}
                        </td>
                      )}
                      <td className="p-3 border whitespace-nowrap">{payment.Student?.studentId}</td>
                      <td className="p-3 border whitespace-nowrap">{payment.Student?.studentName}</td>
                      <td className="p-3 border whitespace-nowrap">{payment.paymentId}</td>
                      <td className="p-3 border whitespace-nowrap">{payment.receiptNo}</td>
                      <td className="p-3 text-green-500 font-bold border whitespace-nowrap">
                        {payment.amountPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 border whitespace-nowrap">{payment.paymentMode}</td>
                      <td className="p-3 border whitespace-nowrap">{capitalizeFirstLetter(payment.paymentType)}</td>
                      <td className="p-3 border whitespace-nowrap">
                        <button
                          onClick={() => handleViewReceipt(payment.receiptPhoto)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        <button
                          onClick={() => handleViewReceiptPDF(payment)}
                          disabled={loadingPdfId === payment.paymentId}
                          className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded grid place-items-center ${
                            loadingPdfId === payment.paymentId ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {loadingPdfId === payment.paymentId ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          ) : (
                            "PDF"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          !loading && (
            <p className="text-lg text-customgray">No payment records found.</p>
          )
        )}
      </div>

      {/* Receipt Image Modal */}
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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white md:p-6 p-2 text-left align-middle shadow-xl transition-all">
                {/* Title */}
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Receipt Image
                </Dialog.Title>

                {/* Rotate button */}
                <button
                  onClick={handleRotate}
                  className="absolute top-5 right-6 rounded-full bg-gray-100 hover:bg-gray-200 p-2"
                  title="Rotate Image"
                >
                  <RotateCw className="w-5 h-5 text-gray-700" />
                </button>

                {/* Close button (top right corner) */}

                {/* Image */}
                <div className="mt-6 flex justify-center overflow-hidden">
                  <img
                    src={selectedReceiptUrl}
                    alt="Receipt"
                    className="min-h-[600px] w-auto object-contain rounded border transition-transform duration-300"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </div>

                {/* Footer Close button (optional, can remove if top one is enough) */}
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