import { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { DashboardContext } from "../Context/DashboardContext";
import CustomSelect from "./Generic/CustomSelect";
import DataTable from "./Generic/DataTable";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

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

const weekOptions = [
  { label: "Week 1 (1–7)", value: 1 },
  { label: "Week 2 (8–14)", value: 2 },
  { label: "Week 3 (15–21)", value: 3 },
  { label: "Week 4 (22–28)", value: 4 },
  { label: "Week 5 (29–31)", value: 5 },
];

const CounsellorReport = () => {
  const { user } = useAuth();
  const { counsellor } = useContext(DashboardContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const today = new Date();
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [week, setWeek] = useState("");
  const [day, setDay] = useState(today.getDate());

  useEffect(() => {
    const currentDate = new Date();

    if (Number(year) === currentDate.getFullYear()) {
      setMonth(currentDate.getMonth() + 1);
      setDay(currentDate.getDate()); // ✅ keep today's day
    } else {
      setMonth(1);
      setDay(""); // optional for past years
    }

    setWeek("");
  }, [year]);

  // 🔥 Fetch report (single API)
  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = {
        year,
        month,
        week,
        day,
      };

      // ✅ Admin can optionally filter by counsellor
      if (user.role === "admin" && selectedCounsellor?.value) {
        params.counsellorId = selectedCounsellor.value;
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
  }, [year, month, week, day, selectedCounsellor]);

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Transform data for Excel
    const excelData = data.map((row) => ({
      Counsellor: row.counsellorName,
      Students: row.students.registered,
      Booking: row.students.booking,
      Half_Paid: row.students.halfCash,
      Full_Paid: row.students.fullCash,
      Total_Collection: row.payments.totalCollection,
      Initial_Collection: row.payments.initialCollection,
      Recollection: row.payments.recollection,
      Total_Due: row.dues.totalDue,
      Visits: row.visiting.total,
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
      header: "Sr No",
      render: (row, index) => index + 1,
    },
    {
      header: "Counsellor",
      render: (row) => row.counsellorName,
    },
    {
      header: "Students",
      render: (row) => row.students.registered,
    },
    {
      header: "Booking",
      render: (row) => row.students.booking,
    },
    {
      header: "Half Paid",
      render: (row) => row.students.halfCash,
    },
    {
      header: "Full Paid",
      render: (row) => row.students.fullCash,
    },
    {
      header: "Collection",
      render: (row) => `₹${row.payments.totalCollection}`,
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
      header: "Due",
      render: (row) => `₹${row.dues.totalDue}`,
    },
    {
      header: "Visits",
      render: (row) => row.visiting.total,
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
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded"
          placeholder="Year"
        />

        <CustomSelect
          options={monthOptions}
          value={monthOptions.find((m) => m.value === month) || null}
          onChange={(val) => setMonth(val?.value || "")}
          placeholder="Select Month"
        />

        <CustomSelect
          options={weekOptions}
          value={weekOptions.find((w) => w.value === week) || null}
          onChange={(val) => setWeek(val?.value || "")}
          placeholder="Select Week"
        />

        <input
          type="number"
          min={1}
          max={31}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="border p-2 rounded w-40"
          placeholder="Day"
        />

        {/* Admin Counsellor Filter */}
        {user.role === "admin" && (
          <CustomSelect
            options={counsellor}
            value={selectedCounsellor}
            onChange={setSelectedCounsellor}
            placeholder="Select Counsellor"
          />
        )}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value={totalStudents} icon={Users} />
        <StatCard
          title="Total Collection"
          value={`₹${totalCollection}`}
          icon={DollarSign}
        />
        <StatCard title="Total Due" value={`₹${totalDue}`} icon={Clock} />
        <StatCard title="Total Visits" value={totalVisits} icon={TrendingUp} />
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
