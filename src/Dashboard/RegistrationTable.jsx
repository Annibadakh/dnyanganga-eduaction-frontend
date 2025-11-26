import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";
import StudentEditPage from "./StudentEditPage";
import DeleteStudentDialog from "./DeleteStudentDialog";

// Mobile-friendly PDF viewer component
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
            <h2 className="text-lg font-semibold text-gray-800 mb-2">View PDF Document</h2>
            <p className="text-gray-600 mb-1 text-sm">{studentName}</p>
            <p className="text-xs text-gray-500">ID: {studentId}</p>
          </div>
          <div className="space-y-3">
            <button onClick={handleDirectDownload} className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button onClick={handleOpenInNewTab} className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Browser
            </button>
          </div>
          <button onClick={onClose} className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">PDF Preview - {studentName}</h2>
            <p className="text-sm text-gray-600 truncate">Student ID: {studentId}</p>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => setViewMode('options')} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">
                Options
              </button>
            )}
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0" aria-label="Close">×</button>
          </div>
        </div>
        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          {isMobile ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-center mb-4 px-4">PDF preview may not work well on mobile devices.<br />Please use the download or "Open in Browser" options below.</p>
              <div className="flex gap-2">
                <button onClick={handleDirectDownload} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Download</button>
                <button onClick={handleOpenInNewTab} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Open in Browser</button>
              </div>
            </div>
          ) : (
            <iframe src={pdfUrl} className="w-full h-full border border-gray-300 rounded" title="PDF Preview" style={{ minHeight: '400px' }} />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 md:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600 truncate w-full sm:w-auto">File: {fileName}</div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleOpenInNewTab} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">Open in New Tab</button>
            <button onClick={handleDirectDownload} className="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Download PDF</button>
            <button onClick={onClose} className="flex-1 sm:flex-none bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
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
          <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
        <div className="text-sm text-gray-600">Showing {startItem} to {endItem} of {totalItems} entries</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        {getPageNumbers().map((page, index) => (
          <button key={index} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={page === '...'} className={`px-3 py-2 text-sm border rounded ${page === currentPage ? 'bg-primary text-white border-primary' : page === '...' ? 'cursor-default' : 'border-gray-300 hover:bg-gray-50'}`}>
            {page}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  );
};

const RegistrationTable = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [users, setUsers] = useState([]);
  const [branch, setBranch] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [selectedExamCentre, setSelectedExamCentre] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [examCentreSearch, setExamCentreSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showExamCentreDropdown, setShowExamCentreDropdown] = useState(false);
  const counsellorDropdownRef = useRef(null);
  const examCentreDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const filteredCounsellors = users.filter(user => user.name.toLowerCase().includes(counsellorSearch.toLowerCase()));

  const getDistinctBranches = (branchList) => {
    const distinctBranches = [];
    const seenBranches = new Set();
    branchList.forEach(item => {
      if (item.counsellorBranch && !seenBranches.has(item.counsellorBranch)) {
        seenBranches.add(item.counsellorBranch);
        distinctBranches.push(item);
      }
    });
    return distinctBranches;
  };

  const filteredBranch = getDistinctBranches(branch).filter(user => user.counsellorBranch.toLowerCase().includes(branchSearch.toLowerCase()));
  const filteredExamCentres = examCentres.filter(centre => centre.centerName.toLowerCase().includes(examCentreSearch.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
      if (examCentreDropdownRef.current && !examCentreDropdownRef.current.contains(event.target)) {
        setShowExamCentreDropdown(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (user.role === "admin" || user.role === "followUp") {
      api.get("/admin/getUser").then((response) => {
        setUsers(response.data.data);
        setBranch(response.data.data);
      }).catch((error) => console.error("Error fetching users", error));
    }
    api.get("/admin/getExamCenters").then((response) => {
      setExamCentres(response.data.data);
    }).catch((error) => console.error("Error fetching exam centers", error));
  }, [user.role]);

  const fetchRegistrations = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      counsellor: selectedCounsellor,
      branch: selectedBranch,
      examCentre: selectedExamCentre,
      standard: selectedStandard,
      status: selectedStatus,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    api.get("/counsellor/getRegister", { params })
      .then((response) => {
        setRegistrations(response.data.data);
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

  useEffect(() => {
    fetchRegistrations();
  }, [user?.uuid, currentPage, itemsPerPage, searchQuery, selectedCounsellor, selectedBranch, selectedExamCentre, selectedStandard, selectedStatus, dateFrom, dateTo, showPayment, showEditStudent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCounsellor, selectedBranch, selectedExamCentre, selectedStandard, selectedStatus, dateFrom, dateTo]);

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor.uuid);
    setCounsellorSearch(counsellor.name);
    setShowCounsellorDropdown(false);
  };

  const handleBranchSelect = (counsellor) => {
    setSelectedBranch(counsellor.counsellorBranch);
    setBranchSearch(counsellor.counsellorBranch);
    setShowBranchDropdown(false);
  };

  const handleExamCentreSelect = (centre) => {
    setSelectedExamCentre(centre.centerId);
    setExamCentreSearch(centre.centerName);
    setShowExamCentreDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const clearBranchFilter = () => {
    setSelectedBranch("");
    setBranchSearch("");
  };

  const clearExamCentreFilter = () => {
    setSelectedExamCentre("");
    setExamCentreSearch("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePayment = (student) => {
    const newStudent = {
      studentId: student.studentId,
      studentName: student.studentName,
      counsellor: user.userName,
      createdBy: user.uuid,
      amountRemaining: student.amountRemaining,
    };
    setPaymentData(newStudent);
    setShowPayment(true);
  };

  const handleEditStudent = (student) => {
    setEditStudentId(student.studentId);
    setShowEditStudent(true);
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (studentId, refundedAmount) => {
    console.log(refundedAmount);
    try {
      setLoadingDeleteId(studentId);
      const response = await api.delete(`/counsellor/deleteStudent/${studentId}`, {
        data: { refundedAmount }
      });
      if (response.status === 200) {
        alert("Student deleted successfully!");
        setShowDeleteDialog(false);
        setStudentToDelete(null);
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to delete student. Please try again.");
      }
      throw error;
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setStudentToDelete(null);
  };

  const handleStudentStatus = async (student) => {
    const newStatus = !student.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} ${student.studentName}?`)) {
      return;
    }

    try {
      setLoadingStatusId(student.studentId);
      const response = await api.patch(`/counsellor/updateStatus/${student.studentId}`, { isActive: newStatus });
      if (response.status === 200) {
        alert(`Student ${action}d successfully!`);
        fetchRegistrations();
      }
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert(`Failed to ${action} student. Please try again.`);
      }
    } finally {
      setLoadingStatusId(null);
    }
  };

  const handleViewPDF = async (student) => {
    try {
      setLoadingPdfId(student.studentId);
      const response = await api.get("/pdf/registration-form", {
        params: { studentId: student.studentId },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const fileName = student.studentName ? `${student.studentName.replace(/\s+/g, "_")}_FORM.pdf` : `${student.studentId}_FORM.pdf`;
      setPdfUrl(url);
      setPdfFileName(fileName);
      setCurrentPdfStudent(student);
      setShowPdfPreview(true);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Student not found!");
      } else if (err.response?.status === 404) {
        alert("PDF generation failed!");
      } else {
        alert("Error generating PDF.");
      }
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

  const handleCloseEditStudent = () => {
    setShowEditStudent(false);
    setEditStudentId(null);
  };

  const formatTimeTo12Hour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (showEditStudent) {
    return <StudentEditPage studentId={editStudentId} onClose={handleCloseEditStudent} />;
  }

  return (
    <div className="p-2 container mx-auto">
      {!showPayment ? (
        <>
          <h1 className="text-3xl text-center font-bold text-primary mb-6">Registration Table</h1>
          
          <div className="flex flex-col md:flex-row justify-start gap-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-col">
                <label htmlFor="dateFrom" className="text-sm text-gray-600 mb-1">From Date</label>
                <input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} max={dateTo || undefined} className="p-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateTo" className="text-sm text-gray-600 mb-1">To Date</label>
                <input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom || undefined} className="p-2 border border-gray-300 rounded-lg" />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap">
                  Clear Dates
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <input type="text" placeholder="Search by name, ID, or contact..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg" />

            {(user.role === "admin" || user.role === "followUp") && (
              <>
                <div className="relative w-full md:w-1/4" ref={counsellorDropdownRef}>
                  <div className="relative">
                    <input type="text" placeholder="Search counsellors..." value={counsellorSearch} onChange={(e) => { setCounsellorSearch(e.target.value); setShowCounsellorDropdown(true); }} onFocus={() => setShowCounsellorDropdown(true)} className="p-2 w-full border border-gray-300 rounded-lg pr-8" />
                    {selectedCounsellor && (
                      <button onClick={clearCounsellorFilter} className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                    )}
                  </div>
                  {showCounsellorDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      <div className="p-2 hover:bg-gray-100 cursor-pointer border-b" onClick={() => { clearCounsellorFilter(); setShowCounsellorDropdown(false); }}>All Counsellors</div>
                      {filteredCounsellors.map((counsellor) => (
                        <div key={counsellor.uuid} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleCounsellorSelect(counsellor)}>{counsellor.name}</div>
                      ))}
                      {filteredCounsellors.length === 0 && counsellorSearch && (<div className="p-2 text-gray-500">No counsellors found</div>)}
                    </div>
                  )}
                </div>
                
                <div className="relative w-full md:w-1/4" ref={branchDropdownRef}>
                  <div className="relative">
                    <input type="text" placeholder="Search branch..." value={branchSearch} onChange={(e) => { setBranchSearch(e.target.value); setShowBranchDropdown(true); }} onFocus={() => setShowBranchDropdown(true)} className="p-2 w-full border border-gray-300 rounded-lg pr-8" />
                    {selectedBranch && (
                      <button onClick={clearBranchFilter} className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                    )}
                  </div>
                  {showBranchDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      <div className="p-2 hover:bg-gray-100 cursor-pointer border-b" onClick={() => { clearBranchFilter(); setShowBranchDropdown(false); }}>All Branch</div>
                      {filteredBranch.map((counsellor, index) => (
                        <div key={`${counsellor.counsellorBranch}-${index}`} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleBranchSelect(counsellor)}>{counsellor.counsellorBranch}</div>
                      ))}
                      {filteredBranch.length === 0 && branchSearch && (<div className="p-2 text-gray-500">No Branch found</div>)}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="relative w-full md:w-1/4" ref={examCentreDropdownRef}>
              <div className="relative">
                <input type="text" placeholder="Search exam centres..." value={examCentreSearch} onChange={(e) => { setExamCentreSearch(e.target.value); setShowExamCentreDropdown(true); }} onFocus={() => setShowExamCentreDropdown(true)} className="p-2 w-full border border-gray-300 rounded-lg pr-8" />
                {selectedExamCentre && (
                  <button onClick={clearExamCentreFilter} className="absolute right-2 top-1/2 text-xl font-bold transform -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                )}
              </div>
              {showExamCentreDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  <div className="p-2 hover:bg-gray-100 cursor-pointer border-b" onClick={() => { clearExamCentreFilter(); setShowExamCentreDropdown(false); }}>All Exam Centres</div>
                  {filteredExamCentres.map((centre) => (
                    <div key={centre.centerId} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleExamCentreSelect(centre)}>{centre.centerName}</div>
                  ))}
                  {filteredExamCentres.length === 0 && examCentreSearch && (<div className="p-2 text-gray-500">No exam centres found</div>)}
                </div>
              )}
            </div>

            <select value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)} className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg">
              <option value="">All Standards</option>
              <option value="9th+10th">9th+10th</option>
              <option value="10th">10th</option>
              <option value="11th+12th">11th+12th</option>
              <option value="12th">12th</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="bg-white p-2 md:p-6 shadow-custom">
            {loading && (<p className="text-customgray text-lg">Loading...</p>)}
            {error && <p className="text-red-500 text-lg">{error}</p>}

            {!loading && !error && registrations.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full border text-center border-customgray overflow-hidden shadow-lg text-sm">
                    <thead className="bg-primary text-customwhite uppercase tracking-wider">
                      <tr>
                        <th className="p-3 text-left border whitespace-nowrap">Sr. No.</th>
                        <th className="p-3 border text-left whitespace-nowrap">Register Date</th>
                        <th className="p-3 border whitespace-nowrap">Register Time</th>
                        <th className="p-3 border whitespace-nowrap">Student ID.</th>
                        <th className="p-3 border whitespace-nowrap">Student Name</th>
                        <th className="p-3 border whitespace-nowrap">Standard</th>
                        <th className="p-3 border whitespace-nowrap">Med/Grp</th>
                        <th className="p-3 border whitespace-nowrap">Student No.</th>
                        <th className="p-3 border whitespace-nowrap">Parent No.</th>
                        <th className="p-3 border whitespace-nowrap">Exam Centre</th>
                        <th className="p-3 border whitespace-nowrap">Total Amount</th>
                        <th className="p-3 border whitespace-nowrap">Paid</th>
                        <th className="p-3 border whitespace-nowrap">Remaining</th>
                        <th className="p-3 border whitespace-nowrap">Due Date</th>
                        {user.role === "admin" && (
                          <>
                            <th className="p-3 border whitespace-nowrap">Counsellor</th>
                            <th className="p-3 border whitespace-nowrap">Branch</th>
                          </>
                        )}
                        <th className="p-3 border whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-customblack">
                      {registrations.map((student, index) => (
                        <tr key={student.studentId} className="border-b border-gray-200 hover:bg-gray-100 transition">
                          <td className="p-3 border whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="p-3 border whitespace-nowrap">{new Date(student.createdAt).toLocaleDateString('en-GB')}</td>
                          <td className="p-3 border whitespace-nowrap">{formatTimeTo12Hour(student.createdAt)}</td>
                          <td className="p-3 border whitespace-nowrap">{student.studentId}</td>
                          <td className="p-3 border whitespace-nowrap">{student.studentName}</td>
                          <td className="p-3 border whitespace-nowrap">{student.standard}</td>
                          <td className="p-3 border whitespace-nowrap">{student.branch}</td>
                          <td className="p-3 border whitespace-nowrap">{student.studentNo}</td>
                          <td className="p-3 border whitespace-nowrap">{student.parentsNo}</td>
                          <td className="p-3 border whitespace-nowrap">{student.ExamCenter.centerName}</td>
                          <td className="p-3 border whitespace-nowrap">{student.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="p-3 border whitespace-nowrap text-green-500 font-bold">{student.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="p-3 border whitespace-nowrap text-red-500 font-bold">{student.amountRemaining.toLocaleString('en-IN')}</td>
                          <td className="p-3 border whitespace-nowrap">{student.dueDate ? new Date(student.dueDate).toLocaleDateString("en-GB") : "-"}</td>
                          {user.role === "admin" && (
                            <>
                              <td className="p-3 border whitespace-nowrap">{student.User.name}</td>
                              <td className="p-3 border whitespace-nowrap">{student.User.counsellorBranch}</td>
                            </>
                          )}
                          <td className="p-3 border whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleViewPDF(student)} className="bg-primary text-white px-3 py-1 min-w-12 rounded hover:bg-blue-700 grid place-items-center" disabled={loadingPdfId === student.studentId}>
                                {loadingPdfId === student.studentId ? (
                                  <span className="animate-spin h-4 w-4 border-2 p-2 border-white border-t-transparent rounded-full"></span>
                                ) : ("PDF")}
                              </button>
                              
                              {user.role === "admin" && (
                                <>
                                  <button onClick={() => handleEditStudent(student)} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">Edit</button>
                                  <button 
                                    onClick={() => handleDeleteStudent(student)}
                                    disabled={loadingDeleteId === student.studentId}
                                    className="bg-red-500 text-white px-3 py-1 min-w-20 rounded hover:bg-red-600 transition-colors grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingDeleteId === student.studentId ? (
                                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                  <button onClick={() => handleStudentStatus(student)} disabled={loadingStatusId === student.studentId} className={`${student.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white px-3 py-1 min-w-24 rounded transition-colors grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {loadingStatusId === student.studentId ? (
                                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    ) : (student.isActive ? "Deactivate" : "Activate")}
                                  </button>
                                </>
                              )}

                              {user.role === "counsellor" && student.amountRemaining > 0 && (
                                <button onClick={() => handlePayment(student)} className="bg-secondary text-white px-3 py-1 rounded hover:bg-tertiary">Make Payment</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalCount} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
              </>
            ) : (
              !loading && (<p className="text-lg text-customgray">No registrations found.</p>)
            )}
          </div>
        </>
      ) : (
        <PaymentForm paymentData={paymentData} setShowPayment={setShowPayment} />
      )}

      {showPdfPreview && (
        <MobilePDFViewer pdfUrl={pdfUrl} onClose={handleClosePdfPreview} fileName={pdfFileName} studentName={currentPdfStudent?.studentName} studentId={currentPdfStudent?.studentId} />
      )}

      {showDeleteDialog && studentToDelete && (
      <DeleteStudentDialog
        student={studentToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    )}
    </div>
  );
};

export default RegistrationTable;