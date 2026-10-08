import { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { DashboardContext } from "../Context/DashboardContext";
import CustomSelect from "./Generic/CustomSelect";
import CustomMultiSelect from "./Generic/CustomMultiSelect";
import DataTable from "./Generic/DataTable";
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
const buildColumns = () => [
  { header: "Sr. No.", render: (row, index) => index + 1 },
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

// ─── Aggregate totals helper ─────────────────────────────────────────────────
const aggregateTotals = (rows) =>
  rows.reduce(
    (acc, r) => {
      acc.students += r.students.registered;
      acc.visiting += r.visiting.total;
      acc.collection += r.payments.totalCollection;
      acc.due += r.dues.totalDue;
      acc.recollectionCount += Number(r.payments.recollectionCount || 0);
      return acc;
    },
    { students: 0, visiting: 0, collection: 0, due: 0, recollectionCount: 0 }
  );

// ─────────────────────────────────────────────────────────────────────────────
const CounsellorReport = () => {
  const { user } = useAuth();
  const { counsellor: counsellorOptions = [] } = useContext(DashboardContext);

  // Active sub-page tab: "counsellor" | "sub-admin"
  const [activeTab, setActiveTab] = useState("counsellor");

  const [individualReports, setIndividualReports] = useState([]);
  const [subAdminTeamReports, setSubAdminTeamReports] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Reset month when year changes
  useEffect(() => {
    if (Number(year) === today.getFullYear()) {
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

  // Initial load on mount
  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch report when active tab changes
  useEffect(() => {
    fetchReport();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch Report ───────────────────────────────────────────────────────────
  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = {};

      // Custom date range takes priority
      const isCustomRange = fromDate || toDate;
      if (isCustomRange) {
        if (fromDate && toDate && fromDate > toDate) {
          setLoading(false);
          alert("From Date cannot be after To Date");
          return;
        }
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
      } else {
        params.year = year;
        params.month = month;
      }

      // Filter by counsellor if on counsellor tab
      if (activeTab === "counsellor" && selectedCounsellors.length > 0) {
        params.counsellorId = selectedCounsellors.map((c) => c.value).join(",");
      }

      // Filter by sub-admin if on sub-admin tab (admin role)
      if (activeTab === "sub-admin" && user?.role === "admin" && selectedSubAdmins.length > 0) {
        params.subAdminId = selectedSubAdmins.map((s) => s.value).join(",");
      }

      const res = await api.get("/report", { params });

      setIndividualReports(res.data.individualReports || []);
      setSubAdminTeamReports(res.data.subAdminTeamReports || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ── Excel Export ───────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    let rowsToExport = [];

    if (activeTab === "counsellor") {
      rowsToExport = individualReports.map((r) => ({
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
      rowsToExport = subAdminTeamReports.map(({ subAdminName, teamReport }) => ({
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

  const columns = buildColumns();
  const isAdmin = user?.role === "admin";
  const isSubAdmin = user?.role === "sub-admin";
  const showSubAdminTab = isAdmin || isSubAdmin;

  // Format team rows for sub-admin team table
  const teamTableData = subAdminTeamReports.map(({ subAdminName, teamReport }) => ({
    ...teamReport,
    counsellorName: `Team: ${subAdminName}`,
  }));

  // Totals depending on active tab
  const activeTotals =
    activeTab === "counsellor"
      ? aggregateTotals(individualReports)
      : aggregateTotals(teamTableData);

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
            placeholder="Year"
          />
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Month</label>
          <CustomSelect
            options={monthOptions}
            value={monthOptions.find((m) => m.value === month) || null}
            onChange={(val) => setMonth(val?.value || "")}
            placeholder="Select Month"
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
            onClick={fetchReport}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Export Excel
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
              {individualReports.length} Entries
            </span>
          </div>
          <DataTable
            columns={columns}
            data={individualReports}
            loading={loading}
            rowKey="counsellorId"
          />
        </div>
      )}

      {/* ── Tab 2 Content: Sub-Admin Team Report ── */}
      {activeTab === "sub-admin" && showSubAdminTab && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-t-lg px-4 py-3 font-semibold text-blue-800 flex justify-between items-center">
            <span>Sub-Admin Team Performance Table</span>
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
              {teamTableData.length} Teams
            </span>
          </div>
          <DataTable
            columns={columns}
            data={teamTableData}
            loading={loading}
            rowKey="counsellorId"
          />
        </div>
      )}
    </div>
  );
};

export default CounsellorReport;
