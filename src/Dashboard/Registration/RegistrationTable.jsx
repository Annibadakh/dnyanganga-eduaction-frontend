import { useState, useEffect, useContext } from "react";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Api";
import PaymentForm from "./PaymentForm";
import StudentEditPage from "./StudentEditPage";
import DeleteStudentDialog from "./DeleteStudentDialog";
import { DashboardContext } from "../../Context/DashboardContext";
import CustomMultiSelect from "../Generic/CustomMultiSelect";

import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import PdfViewerModal from "../Generic/PdfViewerModal";
import Button from "../Generic/Button";
import QuizAnalyticsCharts from "../Generic/QuizAnalyticsCharts";
import FollowupModal from "../Generic/FollowupModal";
import {
  FileText,
  Edit,
  Trash2,
  Power,
  ClipboardList,
  Trophy,
  Target,
  Award,
  X,
  MessageSquarePlus,
} from "lucide-react";
import { followupAccess } from "../../utils/roleArrays";

const RegistrationTable = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [users, setUsers] = useState([]);
  const [branch, setBranch] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [standards, setStandards] = useState([]);
  const [selectedExamCentre, setSelectedExamCentre] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState([]);
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [onlyZeroRemaining, setOnlyZeroRemaining] = useState(false);
  const [onlyNonZeroRemaining, setOnlyNonZeroRemaining] = useState(false);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStudentName, setQuizStudentName] = useState("");
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupStudent, setFollowupStudent] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedExamYear, setSelectedExamYear] = useState([
    { label: currentYear, value: currentYear },
  ]);

  const examYearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  const { counsellor, examCenter, counsellorBranch } =
    useContext(DashboardContext);

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Register Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
    {
      header: "Register Time",
      render: (row) => formatTimeTo12Hour(row.createdAt),
    },
    {
      header: "Student ID",
      accessor: "studentId",
    },
    {
      header: "Student Name",
      accessor: "studentName",
    },
    {
      header: "Standard",
      accessor: "standard",
    },
    {
      header: "Med/Grp",
      accessor: "branch",
    },
    {
      header: "Student No.",
      accessor: "studentNo",
    },
    {
      header: "Parent No.",
      accessor: "parentsNo",
    },
    {
      header: "Exam Centre",
      render: (row) => row.ExamCenter?.centerName,
    },
    {
      header: "Total Amount",
      render: (row) => row.totalAmount.toLocaleString("en-IN"),
    },
    {
      header: "Paid",
      render: (row) => (
        <span className="text-green-500 font-bold">
          {row.amountPaid.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Remaining",
      render: (row) => (
        <span className="text-red-500 font-bold">
          {row.amountRemaining.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Due Date",
      render: (row) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString("en-GB") : "-",
    },

    ...(user.role === "admin" ||
    user.role === "followUp" ||
    user.role === "sub-admin"
      ? [
          {
            header: "Counsellor",
            render: (row) => row.User?.name,
          },
          {
            header: "Branch",
            render: (row) => row.User?.counsellorBranch,
          },
        ]
      : []),
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2 flex-nowrap">
          {/* PDF */}
          <Button
            variant="primary"
            loading={loadingPdfId === row.studentId}
            startIcon={<FileText size={16} />}
            onClick={() => handleViewPDF(row)}
          >
            PDF
          </Button>

          {/* QUIZ DETAILS */}
          {row.amountRemaining == 0 && (
            <Button
              variant="secondary"
              startIcon={<ClipboardList size={16} />}
              onClick={() => handleQuizDetails(row)}
            >
              Quiz
            </Button>
          )}

          {user.role === "admin" && (
            <>
              {/* EDIT */}
              <Button
                variant="warning"
                startIcon={<Edit size={16} />}
                onClick={() => handleEditStudent(row)}
              >
                Edit
              </Button>

              {/* DELETE */}
              <Button
                variant="danger"
                loading={loadingDeleteId === row.studentId}
                startIcon={<Trash2 size={16} />}
                onClick={() => handleDeleteStudent(row)}
              >
                Delete
              </Button>

              {/* STATUS */}
              <Button
                variant={row.isActive ? "danger" : "success"}
                loading={loadingStatusId === row.studentId}
                startIcon={<Power size={16} />}
                onClick={() => handleStudentStatus(row)}
              >
                {row.isActive ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}

          {(user.role === "counsellor" || user.role == "sub-admin") && row.amountRemaining > 0 && (
            <Button variant="info" onClick={() => handlePayment(row)}>
              Pay
            </Button>
          )}

          {followupAccess.includes(user.role) && (
            <Button
              variant="success"
              startIcon={<MessageSquarePlus size={16} />}
              onClick={() => {
                setFollowupStudent(row);
                setShowFollowupModal(true);
              }}
            >
              Follow Ups
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (
      counsellor &&
      (user.role === "admin" ||
        user.role === "followUp" ||
        user.role === "sub-admin")
    ) {
      setUsers(counsellor);
      setBranch(counsellorBranch);
    }
  }, [user.role, counsellor, counsellorBranch]);

  useEffect(() => {
    examCenter && setExamCentres(examCenter);
  }, [user.role, examCenter]);

  useEffect(() => {
    api
      .get("/simple/standards")
      .then((response) => {
        setStandards(response.data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching standards", err);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRegistrations = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      counsellor:
        selectedCounsellor && selectedCounsellor.length > 0
          ? selectedCounsellor.map((c) => c.value).join(",")
          : "",
      branch:
        selectedBranch && selectedBranch.length > 0
          ? selectedBranch.map((b) => b.value).join(",")
          : "",
      examCentre:
        selectedExamCentre && selectedExamCentre.length > 0
          ? selectedExamCentre.map((e) => e.value).join(",")
          : "",
      standard:
        selectedStandard && selectedStandard.length > 0
          ? selectedStandard.map((s) => s.value).join(",")
          : "",
      status: selectedStatus,
      dateFrom: dateFrom,
      dateTo: dateTo,
      onlyZeroRemaining,
      onlyNonZeroRemaining,
      examYear:
        selectedExamYear && selectedExamYear.length > 0
          ? selectedExamYear.map((y) => y.value).join(",")
          : "",
    };

    api
      .get("/counsellor/getRegister", { params })
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
  }, [
    user?.uuid,
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    selectedCounsellor,
    selectedBranch,
    selectedExamCentre,
    selectedStandard,
    selectedStatus,
    dateFrom,
    dateTo,
    showPayment,
    showEditStudent,
    onlyZeroRemaining,
    onlyNonZeroRemaining,
    selectedExamYear,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    selectedCounsellor,
    selectedBranch,
    selectedExamCentre,
    selectedStandard,
    selectedStatus,
    dateFrom,
    dateTo,
    onlyZeroRemaining,
    onlyNonZeroRemaining,
    selectedExamYear,
  ]);

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

  const handleQuizDetails = async (student) => {
    setQuizStudentName(student.studentName);
    setShowQuizDetails(true);
    setQuizLoading(true);
    setQuizData(null);
    try {
      const res = await api.get("/quiz/student/dashboard", {
        params: { studentId: student.studentId },
      });
      setQuizData(res.data);
    } catch (err) {
      console.error(err);
      setQuizData(null);
    } finally {
      setQuizLoading(false);
    }
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
      const response = await api.delete(
        `/counsellor/deleteStudent/${studentId}`,
        {
          data: { refundedAmount },
        },
      );
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

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${student.studentName}?`,
      )
    ) {
      return;
    }

    try {
      setLoadingStatusId(student.studentId);
      const response = await api.patch(
        `/counsellor/updateStatus/${student.studentId}`,
        { isActive: newStatus },
      );
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
      const fileName = student.studentName
        ? `${student.studentName.replace(/\s+/g, "_")}_FORM.pdf`
        : `${student.studentId}_FORM.pdf`;
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
    return date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (showEditStudent) {
    return (
      <StudentEditPage
        studentId={editStudentId}
        onClose={handleCloseEditStudent}
      />
    );
  }

  return (
    <div className="p-2 container mx-auto">
      {!showPayment ? (
        <>
          <h1 className="text-3xl text-center font-bold text-primary mb-6">
            Registration Table
          </h1>

          <div className="flex flex-col md:flex-row justify-start gap-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex flex-row items-center gap-2">
                <label
                  htmlFor="dateFrom"
                  className="text-sm text-gray-600 mb-1"
                >
                  From Date
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex flex-row items-center gap-2">
                <label htmlFor="dateTo" className="text-sm text-gray-600 mb-1">
                  To Date
                </label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg"
            />

            {(user.role === "admin" ||
              user.role === "followUp" ||
              user.role === "sub-admin") && (
              <>
                <CustomMultiSelect
                  options={users}
                  value={selectedCounsellor}
                  onChange={setSelectedCounsellor}
                  isRequired={false}
                  placeholder="Select Counsellors"
                />

                <CustomMultiSelect
                  options={branch}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  isRequired={false}
                  placeholder="Select Branch"
                />
              </>
            )}

            <CustomMultiSelect
              options={examCentres}
              value={selectedExamCentre}
              onChange={setSelectedExamCentre}
              isRequired={false}
              placeholder="Select Exam Centre"
            />

            <CustomMultiSelect
              options={standards.map((std) => ({
                label: std.name,
                value: std.name,
              }))}
              value={selectedStandard}
              onChange={setSelectedStandard}
              isRequired={false}
              placeholder="Select Standards"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <CustomMultiSelect
              options={examYearOptions.map((year) => ({
                label: year,
                value: year,
              }))}
              value={selectedExamYear}
              onChange={setSelectedExamYear}
              isRequired={false}
              placeholder="Select Exam Years"
            />
          </div>
          <div className="flex flex-wrap gap-4 mb-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyZeroRemaining}
                onChange={(e) => {
                  setOnlyZeroRemaining(e.target.checked);
                  if (e.target.checked) setOnlyNonZeroRemaining(false);
                }}
              />
              Full Cash
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyNonZeroRemaining}
                onChange={(e) => {
                  setOnlyNonZeroRemaining(e.target.checked);
                  if (e.target.checked) setOnlyZeroRemaining(false);
                }}
              />
              Booking/Half Cash
            </label>
          </div>

          <DataTable
            columns={columns}
            data={registrations}
            loading={loading}
            error={error}
            rowKey="studentId"
            emptyMessage="No registrations found."
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (
        <PaymentForm
          paymentData={paymentData}
          setShowPayment={setShowPayment}
        />
      )}

      <PdfViewerModal
        isOpen={showPdfPreview}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfUrl}
        fileName={pdfFileName}
        title="Registration Form PDF"
        subTitle={
          currentPdfStudent
            ? `${currentPdfStudent.studentName} (ID: ${currentPdfStudent.studentId})`
            : ""
        }
      />

      {showDeleteDialog && studentToDelete && (
        <DeleteStudentDialog
          student={studentToDelete}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Quiz Details Modal */}
      {showQuizDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Quiz Statistics
                </h2>
                <p className="text-sm text-gray-500">{quizStudentName}</p>
              </div>
              <button
                onClick={() => setShowQuizDetails(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              {quizLoading ? (
                <p className="text-center text-gray-400 py-10">Loading...</p>
              ) : !quizData ? (
                <p className="text-center text-gray-400 py-10">No data found</p>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        title: "Total Attempts",
                        value: quizData.totalAttempts,
                        icon: ClipboardList,
                        bg: "bg-blue-50",
                        border: "border-blue-100",
                        iconBg: "bg-blue-100",
                        iconColor: "text-blue-600",
                      },
                      {
                        title: "Total Marks",
                        value: quizData.totalMarks,
                        icon: Trophy,
                        bg: "bg-yellow-50",
                        border: "border-yellow-100",
                        iconBg: "bg-yellow-100",
                        iconColor: "text-yellow-600",
                      },
                      {
                        title: "Average Score",
                        value: quizData.avgScore,
                        icon: Target,
                        bg: "bg-purple-50",
                        border: "border-purple-100",
                        iconBg: "bg-purple-100",
                        iconColor: "text-purple-600",
                      },
                      {
                        title: "Best Score",
                        value: quizData.bestScore,
                        icon: Award,
                        bg: "bg-amber-50",
                        border: "border-amber-100",
                        iconBg: "bg-amber-100",
                        iconColor: "text-amber-600",
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className={`relative overflow-hidden rounded-2xl border shadow-sm p-4 ${card.bg} ${card.border}`}
                      >
                        <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/20" />
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600">
                              {card.title}
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-gray-800">
                              {card.value ?? 0}
                            </h3>
                          </div>
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}
                          >
                            <card.icon
                              className={`w-5 h-5 ${card.iconColor}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <QuizAnalyticsCharts data={quizData} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Follow Ups Modal */}
      {showFollowupModal && followupStudent && (
        <FollowupModal
          isOpen={showFollowupModal}
          onClose={() => setShowFollowupModal(false)}
          targetType="student"
          targetId={followupStudent.studentId}
          title={`Follow Ups — ${followupStudent.firstName ?? ""} ${
            followupStudent.lastName ?? ""
          } (${followupStudent.studentId})`}
        />
      )}
    </div>
  );
};

export default RegistrationTable;
