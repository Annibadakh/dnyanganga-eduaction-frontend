import { useState, useEffect, useContext } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import { DashboardContext } from "../../Context/DashboardContext";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import ImageViewerModal from "../Generic/ImageViewerModal";
import PdfViewerModal from "../Generic/PdfViewerModal";
import Button from "../Generic/Button";
import { FileText, IndianRupee, Search } from "lucide-react";

const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== "string") {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const PaymentTable = () => {
  const { user } = useAuth();
  const { counsellor } = useContext(DashboardContext);
  const [paymentsData, setPaymentsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [standard, setStandard] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // PDF and Receipt states
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const imgUrl = import.meta.env.VITE_IMG_URL;

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Payment Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
    {
      header: "Register Date",
      render: (row) =>
        new Date(row.Student?.createdAt).toLocaleDateString("en-GB"),
    },
    ...(user.role === "admin" || user.role === "sub-admin"
      ? [
          {
            header: "Counsellor",
            render: (row) => row.Student?.User?.name || "-",
          },
        ]
      : []),
    {
      header: "Student ID",
      accessor: "Student.studentId",
      render: (row) => row.Student?.studentId,
    },
    {
      header: "Student Name",
      render: (row) => row.Student?.studentName,
    },
    {
      header: "Standard",
      render: (row) => row.Student?.standard,
    },
    {
      header: "Application No.",
      render: (row) => row.Student?.appNo,
    },
    {
      header: "Payment ID",
      accessor: "paymentId",
    },
    {
      header: "Receipt No.",
      accessor: "receiptNo",
    },
    {
      header: "Amount Paid",
      render: (row) => {
        return row.paymentType === "INITIAL" ? (
          <span className="text-green-500 font-bold">
            {row.amountPaid.toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-yellow-500 font-bold">
            {row.amountPaid.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      header: "Amount Remaining",
      render: (row) => row.Student?.amountRemaining?.toLocaleString("en-IN"),
    },
    {
      header: "Payment Mode",
      accessor: "paymentMode",
    },
    {
      header: "Payment Type",
      render: (row) => capitalizeFirstLetter(row.paymentType),
    },
    {
      header: "Receipt",
      render: (row) => (
        <button
          onClick={() => handleViewReceipt(row.receiptPhoto)}
          className="text-blue-600 hover:underline"
        >
          View
        </button>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => handleViewGSTPDF(row)}
            loading={loadingPdfId === `gst-${row.paymentId}`}
            variant="secondary"
            startIcon={<FileText size={16} />}
            disabled={!row.gstBillAvailable}
            title={
              row.gstBillAvailable
                ? "Download GST bill"
                : "GST bill not available for this payment"
            }
          >
            GST Bill
          </Button>
          <Button
            onClick={() => handleViewReceiptPDF(row)}
            loading={loadingPdfId === `receipt-${row.paymentId}`}
            variant="success"
            startIcon={<FileText size={16} />}
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

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
    if (user.role === "admin" || user.role === "sub-admin") {
      counsellor && setUsers(counsellor);
    }
  }, [user.role, counsellor]);

  // Fetch payments data with pagination
  const fetchPaymentsData = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm,
      counsellor:
        selectedCounsellor && selectedCounsellor.length > 0
          ? selectedCounsellor.map((c) => c.value).join(",")
          : "",
      startDate: startDate,
      endDate: endDate,
      paymentType,
      standard:
        standard && standard.length > 0
          ? standard.map((s) => s.value).join(",")
          : "",
    };

    api
      .get("/counsellor/getPayments", { params })
      .then((response) => {
        // console.log("Fetched payments data:", response.data);
        setPaymentsData(response.data.payments);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setTotalAmount(response.data.totalAmount);
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
    paymentType,
    standard,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    selectedCounsellor,
    startDate,
    endDate,
    paymentType,
    standard,
  ]);

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
      setLoadingPdfId(`receipt-${payment.paymentId}`);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: payment.Student.studentId, type: "normal" },
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
      alert(
        err.response?.status === 403
          ? "Student not found!"
          : "Receipt download failed.",
      );
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleViewGSTPDF = async (payment) => {
    try {
      setLoadingPdfId(`gst-${payment.paymentId}`);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: payment.Student.studentId, type: "gst" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const fileName = payment.Student.studentName
        ? `${payment.Student.studentName.replace(/\s+/g, "_")}_GST_RECEIPT.pdf`
        : `${payment.Student.studentId}_GST_RECEIPT.pdf`;

      setPdfUrl(url);
      setPdfFileName(fileName);
      setCurrentPdfStudent(payment.Student);
      setShowPdfPreview(true);
    } catch (err) {
      alert(
        err.response?.status === 403
          ? "Student not found!"
          : err.response?.data?.message || "GST bill download failed.",
      );
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

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get("/counsellor/downloadPaymentsExcel", {
        params: {
          search: debouncedSearchTerm,
          counsellor:
            selectedCounsellor && selectedCounsellor.length > 0
              ? selectedCounsellor.map((c) => c.value).join(",")
              : "",
          startDate,
          endDate,
          paymentType,
          standard:
            standard && standard.length > 0
              ? standard.map((s) => s.value).join(",")
              : "",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Payment_Records.xlsx`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download excel");
    }
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Payment Records
      </h1>

      {/* Filters Card */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {/* Search Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Name, ID, receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-[42px] text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Counsellor Dropdown (Admin & Sub-Admin) */}
          {(user.role === "admin" || user.role === "sub-admin") && (
            <div className="w-full">
              <CustomMultiSelect
                label="Counsellor"
                options={users}
                value={selectedCounsellor}
                onChange={setSelectedCounsellor}
                isRequired={false}
                placeholder="Select Counsellors"
              />
            </div>
          )}

          {/* Payment Type */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition text-gray-700 cursor-pointer"
            >
              <option value="">All Payment Types</option>
              <option value="INITIAL">INITIAL</option>
              <option value="RECOLLECTION">RECOLLECTION</option>
            </select>
          </div>

          {/* Standard Dropdown */}
          <div className="w-full">
            <CustomMultiSelect
              label="Standard"
              options={[
                { label: "9th+10th", value: "9th+10th" },
                { label: "10th", value: "10th" },
                { label: "11th+12th", value: "11th+12th" },
                { label: "12th", value: "12th" },
              ]}
              value={standard}
              onChange={setStandard}
              isRequired={false}
              placeholder="Select Standards"
            />
          </div>

          {/* From Date */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition text-gray-700"
            />
          </div>

          {/* To Date */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline transition"
                >
                  Clear Dates
                </button>
              )}
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Action & Total Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <Button variant="success" onClick={handleDownloadExcel} className="self-start sm:self-auto">
          Download Excel
        </Button>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm min-w-[260px] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount Collected</p>
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mt-1">
              ₹ {Number(totalAmount || 0).toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-green-100 p-3 rounded-full ml-3">
            <IndianRupee size={24} className="text-green-700" />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paymentsData}
        loading={loading}
        error={error}
        rowKey="paymentId"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Receipt Image Modal */}
      <ImageViewerModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        imageUrl={selectedReceiptUrl}
        title="Receipt Image"
      />

      <PdfViewerModal
        isOpen={showPdfPreview}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfUrl}
        fileName={pdfFileName}
        title="Receipt PDF Preview"
        subTitle={
          currentPdfStudent
            ? `${currentPdfStudent.studentName} (ID: ${currentPdfStudent.studentId})`
            : ""
        }
      />
    </div>
  );
};

export default PaymentTable;
