import { useState, useEffect } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import DateField from "../Generic/DateField";
import PdfViewerModal from "../Generic/PdfViewerModal";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import { Download, Users, Banknote, Percent } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
  };

  return (
    <div
      className={`${colorClasses[color]} border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-12 h-12 opacity-20" />}
      </div>
    </div>
  );
};

const inr = (n) =>
    "₹" + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function CaStudents() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalAmount: 0,
    totalGstAmount: 0,
    totalNonGstAmount: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [standardOptions, setStandardOptions] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // PDF
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfSubTitle, setPdfSubTitle] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  useEffect(() => {
    api
      .get("/simple/standards")
      .then((res) => {
        const data = res.data?.data || [];
        setStandardOptions(
          data.map((s) => ({ value: s.name, label: s.name })),
        );
      })
      .catch((err) => console.error("Error fetching standards", err));
  }, []);

  const fetchData = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      standard:
        selectedStandard && selectedStandard.length > 0
          ? selectedStandard.map((s) => s.value).join(",")
          : "",
      dateFrom,
      dateTo,
    };
    api
      .get("/ca/students", { params })
      .then((res) => {
        setRows(res.data?.data || []);
        setSummary(
          res.data?.summary || {
            totalStudents: 0,
            totalAmount: 0,
            totalGstAmount: 0,
            totalNonGstAmount: 0,
          },
        );
        setTotalCount(res.data?.totalCount || 0);
        setTotalPages(res.data?.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch GST students", err);
        setError("Failed to load data");
        setLoading(false);
      });
  };

  // Fetch data when page/limit changes or filters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStandard, dateFrom, dateTo]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedStandard([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    selectedStandard.length > 0 || dateFrom || dateTo;

  const handleViewPdf = async (row) => {
    try {
      setLoadingPdfId(row.studentId);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: row.studentId },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfUrl(window.URL.createObjectURL(blob));
      setPdfFileName(
        `${row.studentName.replace(/\s+/g, "_") || "student"}_GST_RECEIPT.pdf`,
      );
      setPdfSubTitle(`${row.studentName} (ID: ${row.studentId})`);
      setShowPdf(true);
    } catch (err) {
      alert(err.response?.status === 403 ? "Unauthorized" : "Receipt download failed.");
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleClosePdf = () => {
    setShowPdf(false);
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
  };

  const columns = [
    {
      header: "Sr. No.",
      render: (_, rowIndex) => (currentPage - 1) * itemsPerPage + rowIndex + 1,
    },
    { header: "Student ID", accessor: "studentId", cellClass: "font-medium" },
    { header: "Student Name", accessor: "studentName" },
    { header: "Standard", accessor: "standard" },
    {
      header: "Invoice Number",
      render: (row) => row.invoiceNumber ?? "—",
    },
    {
      header: "Total Amount",
      render: (row) => inr(row.totalAmount),
    },
    {
      header: "GST Amount",
      render: (row) => inr(row.gstAmount),
    },
    {
      header: "Non-GST Amount",
      render: (row) => inr(row.nonGstAmount),
    },
    {
      header: "GST Receipt",
      render: (row) => (
        <button
          onClick={() => handleViewPdf(row)}
          disabled={loadingPdfId === row.studentId}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition ${
            loadingPdfId === row.studentId
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-blue-700"
          }`}
        >
          <Download size={14} />
          {loadingPdfId === row.studentId ? "Loading..." : "View Receipt"}
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        GST Student Details
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>
        <div className="flex flex-col md:flex-row gap-4 flex-wrap items-end">
          <div className="w-full md:w-64">
            <CustomMultiSelect
              label="Standard"
              options={standardOptions}
              value={selectedStandard}
              onChange={setSelectedStandard}
              placeholder="Select Standard"
            />
          </div>
          <DateField
            id="dateFrom"
            label="From Date"
            value={dateFrom}
            onChange={setDateFrom}
            max={dateTo || undefined}
          />
          <DateField
            id="dateTo"
            label="To Date"
            value={dateTo}
            onChange={setDateTo}
            min={dateFrom || undefined}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Students"
          value={summary.totalStudents.toLocaleString("en-IN")}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Amount"
          value={inr(summary.totalAmount)}
          icon={Banknote}
          color="green"
        />
        <StatCard
          title="Total GST Amount"
          value={inr(summary.totalGstAmount)}
          icon={Percent}
          color="indigo"
        />
        <StatCard
          title="Total Non-GST Amount"
          value={inr(summary.totalNonGstAmount)}
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">
            Fully Paid Students
          </h2>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          error={error}
          rowKey="studentId"
          emptyMessage="No fully paid students found"
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <PdfViewerModal
        isOpen={showPdf}
        onClose={handleClosePdf}
        pdfUrl={pdfUrl}
        fileName={pdfFileName}
        title="GST Receipt PDF"
        subTitle={pdfSubTitle}
      />
    </div>
  );
}