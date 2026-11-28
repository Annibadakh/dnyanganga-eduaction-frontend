import { useEffect, useRef, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { DashboardContext } from "../Context/DashboardContext";
import CustomSelect from "./Generic/CustomSelect";
import CustomMultiSelect from "./Generic/CustomMultiSelect";
import DataTable from "./Generic/DataTable";
import Pagination from "./Generic/Pagination";
import { Users, DollarSign, TrendingUp, Clock, PlayCircle, UserCheck, Users2 } from "lucide-react";

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    {Icon && <Icon className="w-10 h-10 opacity-70 text-primary" />}
  </div>
);

// ─── Month options ────────────────────────────────────────────────────────────
const monthOptions = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

// ─── Table columns matching UI sequence ───────────────────────────────────────
// offset: rows before this page (server-side pagination)
const buildColumns = (offset = 0) => [
  { header: "Sr. No.", render: (row, index) => offset + index + 1 },
  { header: "Name", render: (row) => row.counsellorName },
  { header: "Admissions", render: (row) => row.students.registered },
  { header: "Visiting", render: (row) => row.visiting.total },
  { header: "Demo", render: (row) => row.visiting.total + row.students.registered },
  { header: "Booking", render: (row) => row.students.booking },
  { header: "Half Cash", render: (row) => row.students.halfCash },
  { header: "Full Cash", render: (row) => row.students.fullCash },
  { header: "Rec Count", render: (row) => row.payments.recollectionCount ?? 0 },
  { header: "Initial", render: (row) => `₹${row.payments.initialCollection}` },
  { header: "Recollection", render: (row) => `₹${row.payments.recollection}` },
  { header: "Collection", render: (row) => `₹${row.payments.totalCollection}` },
  { header: "Due", render: (row) => `₹${row.dues.totalDue}` },
];

// Totals of the whole table (all pages) — computed by the server
const emptyTotals = { students: 0, visiting: 0, collection: 0, due: 0, recollectionCount: 0 };

// Exam year options: same as the registration table
const currentYear = new Date().getFullYear();
const examYearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => ({
  label: y,
  value: y,
}));

// Sub-admin team rows -> table rows
const toTeamRows = (list) =>
  list.map(({ subAdminName, teamReport }) => ({ ...teamReport, counsellorName: `Team: ${subAdminName}` }));

// ─────────────────────────────────────────────────────────────────────────────
const CounsellorReport = () => {
  const { user } = useAuth();
  const { counsellor: counsellorOptions = [], examCenter: examCenterOptions = [] } = useContext(DashboardContext);

  // Active sub-page tab: "counsellor" | "sub-admin"
  const [activeTab, setActiveTab] = useState("counsellor");

  // One page of the active tab's table + totals of the whole table
  const [rows, setRows] = useState([]);
  const [rowsView, setRowsView] = useState(null); // tab the rows belong to ("counsellor" | "sub-admin")
  const [totals, setTotals] = useState(emptyTotals);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const requestRef = useRef(0); // only the latest request may fill the table

  // Dropdown options & selections
  const [subAdminOptions, setSubAdminOptions] = useState([]);
  const [selectedSubAdmins, setSelectedSubAdmins] = useState([]);
  const [selectedCounsellors, setSelectedCounsellors] = useState([]);

  // Filters
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedExamYears, setSelectedExamYears] = useState([]);
  const [selectedExamCentres, setSelectedExamCentres] = useState([]);

  // Reset month when year changes (no year = all data, so no month either)
  const firstYearRun = useRef(true);
  useEffect(() => {
    if (firstYearRun.current) {
      firstYearRun.current = false;
      return;
    }
    if (year === "" || year === null) {
      setMonth("");
    } else if (Number(year) === today.getFullYear()) {
      setMonth(today.getMonth() + 1);
    } else {
      setMonth(1);
    }
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch sub-admin list for admin dropdown
  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("/admin/subAdmins")
        .then((res) => {
          const list = (res.data?.data || []).map((sa) => ({
            value: sa.uuid,
            label: sa.name,
          }));
          setSubAdminOptions(list);
        })
        .catch(console.error);
    }
  }, [user]);

  // Load on mount and when the tab changes (first page of that tab)
  useEffect(() => {
    setRows([]);
    setRowsView(null);
    setTotal(0);
    setTotals(emptyTotals);
    setPage(1);
    fetchReport(1);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filters -> query params (null when a filter is wrong) ─────────────────
  const buildParams = () => {
    const params = {};

    // Custom date range takes priority; no year and no month = all data
    const isCustomRange = fromDate || toDate;
    if (isCustomRange) {
      if (fromDate && toDate && fromDate > toDate) {
        alert("From Date cannot be after To Date");
        return null;
      }
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
    } else {
      if (month && !year) {
        alert("Enter the year for the selected month, or clear the month to see all data");
        return null;
      }
      if (year) params.year = year;
      if (year && month) params.month = month;
    }

    if (selectedExamYears.length > 0) params.examYear = selectedExamYears.map((y) => y.value).join(",");
    if (selectedExamCentres.length > 0) params.examCentre = selectedExamCentres.map((c) => c.value).join(",");

    // Filter by counsellor if on counsellor tab
    if (activeTab === "counsellor" && selectedCounsellors.length > 0) {
      params.counsellorId = selectedCounsellors.map((c) => c.value).join(",");
    }

    // Filter by sub-admin if on sub-admin tab (admin role)
    if (activeTab === "sub-admin" && user?.role === "admin" && selectedSubAdmins.length > 0) {
      params.subAdminId = selectedSubAdmins.map((s) => s.value).join(",");
    }

    params.view = activeTab;
    return params;
  };

  // ── Fetch one page of the report ───────────────────────────────────────────
  const fetchReport = async (pageArg = page, limitArg = limit) => {
    const params = buildParams();
    if (!params) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const res = await api.get("/report", { params: { ...params, page: pageArg, limit: limitArg } });
      if (requestId !== requestRef.current) return;
      setRows(res.data.rows || []);
      setRowsView(params.view);
      setTotal(res.data.total || 0);
      setTotals(res.data.totals || emptyTotals);
    } catch (err) {
      console.error(err);
      if (requestId === requestRef.current) alert(err.response?.data?.message || "Couldn't load the report");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReport(1, limit);
  };

  // ── Excel Export (every row of the table, not only this page) ─────────────
  const handleExportExcel = async () => {
    const params = buildParams();
    if (!params) return;
    let allRows;
    setExporting(true);
    try {
      const res = await api.get("/report", { params: { ...params, all: 1 } });
      allRows = res.data.rows || [];
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Couldn't export the report");
      return;
    } finally {
      setExporting(false);
    }

    let rowsToExport = [];

    if (activeTab === "counsellor") {
      rowsToExport = allRows.map((r) => ({
        Section: "Counsellor Report",
        Name: r.counsellorName,
        Admissions: r.students.registered,
        Visiting: r.visiting.total,
        Demo: r.visiting.total + r.students.registered,
        Booking: r.students.booking,
        "Half Cash": r.students.halfCash,
        "Full Cash": r.students.fullCash,
        "Rec Count": r.payments.recollectionCount ?? 0,
        "Initial Collection": r.payments.initialCollection,
        Recollection: r.payments.recollection,
        "Total Collection": r.payments.totalCollection,
        "Total Due": r.dues.totalDue,
      }));
    } else {
      rowsToExport = allRows.map(({ subAdminName, teamReport }) => ({
        Section: "Sub-Admin Team Report",
        Name: `Team: ${subAdminName}`,
        Admissions: teamReport.students.registered,
        Visiting: teamReport.visiting.total,
        Demo: teamReport.visiting.total + teamReport.students.registered,
        Booking: teamReport.students.booking,
        "Half Cash": teamReport.students.halfCash,
        "Full Cash": teamReport.students.fullCash,
        "Rec Count": teamReport.payments.recollectionCount ?? 0,
        "Initial Collection": teamReport.payments.initialCollection,
        Recollection: teamReport.payments.recollection,
        "Total Collection": teamReport.payments.totalCollection,
        "Total Due": teamReport.dues.totalDue,
      }));
    }

    if (rowsToExport.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rowsToExport);
    const workbook = XLSX.utils.book_new();
    const sheetName = activeTab === "counsellor" ? "Counsellor_Report" : "SubAdmin_Report";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `${sheetName}_${Date.now()}.xlsx`);
  };

  const columns = buildColumns((page - 1) * limit);
  const isAdmin = user?.role === "admin";
  const isSubAdmin = user?.role === "sub-admin";
  const showSubAdminTab = isAdmin || isSubAdmin;

  // Rows of this page (team rows reshaped for the same columns). Right after a tab switch the
  // rows still belong to the other tab until the new page arrives: show nothing meanwhile.
  const tableData = rowsView !== activeTab ? [] : activeTab === "counsellor" ? rows : toTeamRows(rows);
  const activeTotals = totals;

  const changePage = (p) => {
    setPage(p);
    fetchReport(p, limit);
  };
  const changeLimit = (n) => {
    setLimit(n);
    setPage(1);
    fetchReport(1, n);
  };
  const pagination = (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
      totalItems={total}
      itemsPerPage={limit}
      onPageChange={changePage}
      onItemsPerPageChange={changeLimit}
    />
  );

  return (
    <div className="container bg-white mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Performance Report</h1>

      {/* ── Sub-page Tabs ── */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("counsellor")}
          className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm rounded-t-lg transition-all ${
            activeTab === "counsellor"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Counsellor Report
        </button>

        {showSubAdminTab && (
          <button
            onClick={() => setActiveTab("sub-admin")}
            className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm rounded-t-lg transition-all ${
              activeTab === "sub-admin"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users2 className="w-4 h-4" />
            Sub-Admin Report
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6 flex flex-wrap gap-3 justify-start items-end">
        {/* Year */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded w-28"
            placeholder="All years"
          />
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Month</label>
          <CustomSelect
            options={monthOptions}
            value={monthOptions.find((m) => m.value === month) || null}
            onChange={(val) => setMonth(val?.value || "")}
            placeholder="All months"
            isRequired={false}
          />
        </div>

        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Exam Year */}
        <div className="flex flex-col gap-1">
          <CustomMultiSelect
            label="Exam Year"
            options={examYearOptions}
            value={selectedExamYears}
            onChange={setSelectedExamYears}
            isRequired={false}
            placeholder="All exam years"
          />
        </div>

        {/* Exam Centre */}
        <div className="flex flex-col gap-1">
          <CustomMultiSelect
            label="Exam Centre"
            options={examCenterOptions}
            value={selectedExamCentres}
            onChange={setSelectedExamCentres}
            isRequired={false}
            placeholder="All exam centres"
          />
        </div>

        {/* TAB 1 FILTER: Counsellor Multi-Select */}
        {activeTab === "counsellor" && (
          <div className="flex flex-col gap-1">
            <CustomMultiSelect
              label="Counsellor"
              options={counsellorOptions}
              value={selectedCounsellors}
              onChange={setSelectedCounsellors}
              placeholder="Filter by Counsellor"
            />
          </div>
        )}

        {/* TAB 2 FILTER: Sub-Admin Multi-Select (Admin role) */}
        {activeTab === "sub-admin" && isAdmin && (
          <div className="flex flex-col gap-1">
            <CustomMultiSelect
              label="Sub-Admin"
              options={subAdminOptions}
              value={selectedSubAdmins}
              onChange={setSelectedSubAdmins}
              placeholder="Filter by Sub-Admin"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Admissions" value={activeTotals.students} icon={Users} />
        <StatCard title="Total Visiting" value={activeTotals.visiting} icon={TrendingUp} />
        <StatCard
          title="Total Demo"
          value={activeTotals.visiting + activeTotals.students}
          icon={PlayCircle}
        />
        <StatCard title="Recollection Count" value={activeTotals.recollectionCount} icon={PlayCircle} />
        <StatCard title="Total Collection" value={`₹${activeTotals.collection}`} icon={DollarSign} />
        <StatCard title="Total Due" value={`₹${activeTotals.due}`} icon={Clock} />
      </div>

      {/* ── Tab 1 Content: Counsellor Report ── */}
      {activeTab === "counsellor" && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-t-lg px-4 py-3 font-semibold text-blue-800 flex justify-between items-center">
            <span>Counsellor Performance Table</span>
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
              {total} Entries
            </span>
          </div>
          <DataTable
            columns={columns}
            data={tableData}
            loading={loading}
            rowKey="counsellorId"
          />
          {pagination}
        </div>
      )}

      {/* ── Tab 2 Content: Sub-Admin Team Report ── */}
      {activeTab === "sub-admin" && showSubAdminTab && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-t-lg px-4 py-3 font-semibold text-blue-800 flex justify-between items-center">
            <span>Sub-Admin Team Performance Table</span>
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
              {total} Teams
            </span>
          </div>
          <DataTable
            columns={columns}
            data={tableData}
            loading={loading}
            rowKey="counsellorId"
          />
          {pagination}
        </div>
      )}
    </div>
  );
};

export default CounsellorReport;
