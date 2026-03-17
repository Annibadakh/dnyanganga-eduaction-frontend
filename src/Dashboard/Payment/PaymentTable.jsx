import { useState, useEffect, useContext } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import CustomSelect from "../Generic/CustomSelect";
import { DashboardContext } from "../../Context/DashboardContext";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import ImageViewerModal from "../Generic/ImageViewerModal";
import PdfViewerModal from "../Generic/PdfViewerModal";
import Button from "../Generic/Button";
import { FileText } from "lucide-react";



const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== 'string') {
    return '';
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
const PaymentTable = () => {
  const { user } = useAuth();
  const { counsellor } = useContext(DashboardContext);
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

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentPdfStudent, setCurrentPdfStudent] = useState(null);


  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const imgUrl = import.meta.env.VITE_IMG_URL;


  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) =>
        (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Payment Date",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
    ...(user.role === "admin"
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
      header: "Payment ID",
      accessor: "paymentId",
    },
    {
      header: "Receipt No",
      accessor: "receiptNo",
    },
    {
      header: "Amount Paid",
      render: (row) => (
        <span className="text-green-500 font-bold">
          {row.amountPaid.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Payment Mode",
      accessor: "paymentMode",
    },
    {
      header: "Payment Type",
      render: (row) =>
        capitalizeFirstLetter(row.paymentType),
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
        <Button
          onClick={() => handleViewReceiptPDF(row)}
          loading={loadingPdfId === row.paymentId}
          variant="success"
          startIcon={<FileText size={16} />}
        >
          PDF
        </Button>
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
    if (user.role === "admin") {
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
      counsellor: selectedCounsellor?.value || "",
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
          <CustomSelect
            options={users}
            value={selectedCounsellor}
            onChange={setSelectedCounsellor}
            isRequired={false}
            placeholder="Select Counsellors"
          />
        )}
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