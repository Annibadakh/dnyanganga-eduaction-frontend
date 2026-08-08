import { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { DashboardContext } from "../Context/DashboardContext";
import CustomSelect from "./Generic/CustomSelect";
import CustomMultiSelect from "./Generic/CustomMultiSelect";
import DataTable from "./Generic/DataTable";
import { Users, DollarSign, TrendingUp, Clock, PlayCircle } from "lucide-react";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    {Icon && <Icon className="w-10 h-10 opacity-70 text-primary" />}
  </div>
);

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

const CounsellorReport = () => {
  const { user } = useAuth();
  const { counsellor } = useContext(DashboardContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const today = new Date();
  const [selectedCounsellor, setSelectedCounsellor] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const currentDate = new Date();

    if (Number(year) === currentDate.getFullYear()) {
      setMonth(currentDate.getMonth() + 1);
    } else {
      setMonth(1);
    }
  }, [year]);

  // 🔥 Fetch report (single API)
  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = {
        year,
        month,
      };

      // ✅ Custom date range takes priority when both dates are selected
      const isCustomRange = fromDate && toDate;
      if (isCustomRange) {
        if (fromDate > toDate) {
          setLoading(false);
          alert("From Date cannot be after To Date");
          return;
        }
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      // ✅ Admin can optionally filter by counsellor (multi-select support)
      if (user.role === "admin" && selectedCounsellor && selectedCounsellor.length > 0) {
        params.counsellorId = selectedCounsellor.map((c) => c.value).join(",");
      }

      // ✅ Single endpoint for all
      const res = await api.get("/report", { params });

      // ✅ Normalize response
      const responseData = res.data.data;

      if (Array.isArray(responseData)) {
        setData(responseData); // admin (all)
      } else {
        setData(responseData ? [responseData] : []); // counsellor or filtered admin
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year, month, fromDate, toDate, selectedCounsellor]);

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Transform data for Excel
    const excelData = data.map((row) => ({
      "Counsellor Name": row.counsellorName,
      Admissions: row.students.registered,
      Visiting: row.visiting.total,
      Booking: row.students.booking,
      "Half Cash": row.students.halfCash,
      "Full Cash": row.students.fullCash,
      "Initial Collection": row.payments.initialCollection,
      Recollection: row.payments.recollection,
      "Total Collection": row.payments.totalCollection,
      "Total Due": row.dues.totalDue,
      "Total Demo": row.visiting.total + row.students.registered, // Assuming demo is sum of visits and students, adjust as needed
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Counsellor_Report_${Date.now()}.xlsx`);
  };

  // Table columns
  const columns = [
    {
      header: "Sr No.",
      render: (row, index) => index + 1,
    },
    {
      header: "Counsellor Name",
      render: (row) => row.counsellorName,
    },
    {
      header: "Admissions",
      render: (row) => row.students.registered,
    },
    {
      header: "Visiting",
      render: (row) => row.visiting.total,
    },
    {
      header: "Booking",
      render: (row) => row.students.booking,
    },
    {
      header: "Half Cash",
      render: (row) => row.students.halfCash,
    },
    {
      header: "Full Cash",
      render: (row) => row.students.fullCash,
    },
    {
      header: "Initial",
      render: (row) => `₹${row.payments.initialCollection}`,
    },
    {
      header: "Recollection",
      render: (row) => `₹${row.payments.recollection}`,
    },
    {
      header: "Collection",
      render: (row) => `₹${row.payments.totalCollection}`,
    },
    {
      header: "Due",
      render: (row) => `₹${row.dues.totalDue}`,
    },
    {
      header: "Demo",
      render: (row) => row.visiting.total + row.students.registered, // Assuming demo is sum of visits and students, adjust as needed
    },
  ];

  // Aggregate for cards
  const totalStudents = data.reduce((sum, r) => sum + r.students.registered, 0);
  const totalCollection = data.reduce(
    (sum, r) => sum + r.payments.totalCollection,
    0,
  );
  const totalDue = data.reduce((sum, r) => sum + r.dues.totalDue, 0);
  const totalVisits = data.reduce((sum, r) => sum + r.visiting.total, 0);

  return (
    <div className="container bg-white mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Counsellor Report</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3 justify-start">
        {/* Year */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded"
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

        {/* Admin Counsellor Filter */}
        {user.role === "admin" && (
          <div className="flex flex-col gap-1">
            <CustomMultiSelect
              label="Counsellor"
              options={counsellor}
              value={selectedCounsellor}
              onChange={setSelectedCounsellor}
              placeholder="Select Counsellors"
            />
          </div>
        )}

        <div className="flex items-end mb-0">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Admissions" value={totalStudents} icon={Users} />
        <StatCard
          title="Total Visiting"
          value={totalVisits}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Demo"
          value={totalVisits + totalStudents} // Assuming demo is sum of visits and students, adjust as needed
          icon={PlayCircle}
        />
        <StatCard
          title="Total Collection"
          value={`₹${totalCollection}`}
          icon={DollarSign}
        />
        <StatCard title="Total Due" value={`₹${totalDue}`} icon={Clock} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        rowKey="counsellorId"
      />
    </div>
  );
};

export default CounsellorReport;
