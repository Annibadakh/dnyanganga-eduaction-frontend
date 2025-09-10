import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";

const RegistrationTable = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [selectedExamCentre, setSelectedExamCentre] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  // New state for PDF preview dialog
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);

  // New state for searchable dropdowns
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [examCentreSearch, setExamCentreSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  const [showExamCentreDropdown, setShowExamCentreDropdown] = useState(false);
  
  // Refs for dropdown containers
  const counsellorDropdownRef = useRef(null);
  const examCentreDropdownRef = useRef(null);

  // Filter functions for searchable dropdowns
  const filteredCounsellors = users.filter(user =>
    user.name.toLowerCase().includes(counsellorSearch.toLowerCase())
  );

  const filteredExamCentres = examCentres.filter(centre =>
    centre.centerName.toLowerCase().includes(examCentreSearch.toLowerCase())
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
      if (examCentreDropdownRef.current && !examCentreDropdownRef.current.contains(event.target)) {
        setShowExamCentreDropdown(false);
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
    if (user.role === "admin") {
      api
        .get("/admin/getUser")
        .then((response) => {
          const counsellors = response.data.data.filter(
            (user) => user.role === "counsellor"
          );
          setUsers(counsellors);
          console.log(counsellors);
        })
        .catch((error) => {
          console.error("Error fetching users", error);
        });
    }
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        console.log(response.data.data);
        setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching exam centers", error);
      });
  }, [user.role]);

  useEffect(() => {
    api
      .get(`/counsellor/getRegister?uuid=${user.uuid}&role=${user.role}`)
      .then((response) => {
        console.log(response.data.data);
        setRegistrations(response.data.data);
        setFiltered(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user?.uuid, showPayment]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    let filteredResults = registrations.filter(
      (student) =>
        student.studentName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.studentNo.includes(q)
    );

    if (selectedCounsellor) {
      filteredResults = filteredResults.filter(
        (student) => student.createdBy === selectedCounsellor
      );
    }

    if (selectedExamCentre) {
      filteredResults = filteredResults.filter(
        (student) => student.examCentre === selectedExamCentre
      );
    }

    if (selectedStandard) {
      filteredResults = filteredResults.filter(
        (student) => student.standard === selectedStandard
      );
    }

    setFiltered(filteredResults);
  }, [searchQuery, registrations, selectedCounsellor, selectedExamCentre, selectedStandard]);

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor.uuid);
    setCounsellorSearch(counsellor.name);
    setShowCounsellorDropdown(false);
  };

  const handleExamCentreSelect = (centre) => {
    setSelectedExamCentre(centre.centerName);
    setExamCentreSearch(centre.centerName);
    setShowExamCentreDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const clearExamCentreFilter = () => {
    setSelectedExamCentre("");
    setExamCentreSearch("");
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

  const handleViewPDF = async (student) => {
    try {
      setLoadingPdfId(student.studentId);

      const response = await api.get("/pdf/registration-form", {
        params: {
          studentId: student.studentId,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const fileName = student.studentName
        ? `${student.studentName.replace(/\s+/g, "_")}_FORM.pdf`
        : `${student.studentId}_FORM.pdf`;

      // Set PDF preview data
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

  const handleDownloadPDF = () => {
    if (pdfUrl && pdfFileName) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = pdfFileName;
      link.click();
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

  const formatTimeTo12Hour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-2 container mx-auto">
      {!showPayment ? (
        <>
          <h1 className="text-3xl text-center font-bold text-primary mb-6">
            Registration Table
          </h1>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg"
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
                    className="p-2 w-full border border-gray-300 rounded-lg pr-8"
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

            <div className="relative w-full md:w-1/4" ref={examCentreDropdownRef}>
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
                  className="p-2 w-full border border-gray-300 rounded-lg pr-8"
                />
                {selectedExamCentre && (
                  <button
                    onClick={clearExamCentreFilter}
                    className="absolute right-2 top-1/2 text-xl font-bold transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    All Exam Centres
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

            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg"
            >
              <option value="">All Standards</option>
              <option value="9th+10th">9th+10th</option>
              <option value="10th">10th</option>
              <option value="11th+12th">11th+12th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div className="bg-white p-2 md:p-6 shadow-custom">
            {loading && (
            <p className="text-customgray text-lg">Loading...</p>
          )}
          {error && <p className="text-red-500 text-lg">{error}</p>}

          {!loading && !error && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border text-center border-customgray overflow-hidden shadow-lg text-sm">
                <thead className="bg-primary text-customwhite uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left border whitespace-nowrap">Sr. No.</th>
                    <th className="p-3 border text-left whitespace-nowrap">
                      Register Date
                    </th>
                    <th className="p-3 border whitespace-nowrap">Register Time</th>
                    <th className="p-3 border whitespace-nowrap">Student ID.</th>
                    <th className="p-3 border whitespace-nowrap">Student Name</th>
                    <th className="p-3 border whitespace-nowrap">Standard</th>
                    <th className="p-3 border whitespace-nowrap">Med/Grp</th>
                    <th className="p-3 border whitespace-nowrap">Student No.</th>
                    <th className="p-3 border whitespace-nowrap">Parent No.</th>
                    <th className="p-3 border whitespace-nowrap">Exam Centre</th>
                    {user.role === "admin" && (
                      <>
                        <th className="p-3 border whitespace-nowrap">Counsellor</th>
                        <th className="p-3 border whitespace-nowrap">
                          Branch
                        </th>
                      </>
                    )}
                    <th className="p-3 border whitespace-nowrap">Total Amount</th>
                    <th className="p-3 border whitespace-nowrap">Paid</th>
                    <th className="p-3 border whitespace-nowrap">Remaining</th>
                    <th className="p-3 border whitespace-nowrap">Due Date</th>
                    <th className="p-3 border whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {filtered.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 transition"
                    >
                      <td className="p-3 border whitespace-nowrap">{index+1}</td>
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(student.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 border whitespace-nowrap">{formatTimeTo12Hour(student.createdAt)}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentId}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentName}</td>
                      <td className="p-3 border whitespace-nowrap">{student.standard}</td>
                      <td className="p-3 border whitespace-nowrap">{student.branch}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentNo}</td>
                      <td className="p-3 border whitespace-nowrap">{student.parentsNo}</td>
                      <td className="p-3 border whitespace-nowrap">{student.examCentre.split("-")[1]}</td>
                      {user.role === "admin" && (
                        <>
                          <td className="p-3 border whitespace-nowrap">{student.counsellor}</td>
                          <td className="p-3 border whitespace-nowrap">
                            {student.counsellorBranch}
                          </td>
                        </>
                      )}
                      <td className="p-3 border whitespace-nowrap">{student.totalAmount}</td>
                      <td className="p-3 border whitespace-nowrap text-green-500 font-bold">
                        {student.amountPaid}
                      </td>
                      <td className="p-3 border whitespace-nowrap text-red-500 font-bold">
                        {student.amountRemaining}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        {student.dueDate
                    ? new Date(student.dueDate).toLocaleDateString("en-GB")
                    : "-"
                        }
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPDF(student)}
                            className="bg-primary text-white px-3 py-1 min-w-12 rounded hover:bg-blue-700 grid place-items-center"
                            disabled={loadingPdfId === student.studentId}
                          >
                            {loadingPdfId === student.studentId ? (
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                              "PDF"
                            )}
                          </button>
                          
                          {user.role === "counsellor" && student.amountRemaining > 0 && (
                            <button
                              onClick={() => handlePayment(student)}
                              className="bg-secondary text-white px-3 py-1 rounded hover:bg-tertiary"
                            >
                              Make Payment
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <p className="text-lg text-customgray">No registrations found.</p>
            )
          )}
          </div>
        </>
      ) : (
        <PaymentForm paymentData={paymentData} setShowPayment={setShowPayment} />
      )}

      {/* PDF Preview Dialog */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                  PDF Preview - {currentPdfStudent?.studentName}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  Student ID: {currentPdfStudent?.studentId}
                </p>
              </div>
              <button
                onClick={handleClosePdfPreview}
                className="ml-4 text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-2 md:p-4 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full border border-gray-300 rounded"
                title="PDF Preview"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Footer with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 md:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-600 truncate w-full sm:w-auto">
                File: {pdfFileName}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleClosePdfPreview}
                  className="flex-1 sm:flex-none bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationTable;