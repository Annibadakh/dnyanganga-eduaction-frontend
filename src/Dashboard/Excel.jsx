import React, { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import api from "../Api";

const Excel = () => {
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedExamCentre, setSelectedExamCentre] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [onlyZeroRemaining, setOnlyZeroRemaining] = useState(false);
  const [onlyNonZeroRemaining, setOnlyNonZeroRemaining] = useState(false);

  const allColumns = [
    "studentId", "studentName", "motherName", "standard", "branch", "studentNo",
    "parentsNo", "notificationNo", "appNo", "examCentre", "counsellor", "counsellorBranch", "totalAmount",
    "amountPaid", "amountRemaining", "dueDate", "createdAt"
  ];

  const columnDisplayNames = {
    "studentId": "Student ID",
    "studentName": "Student Name",
    "motherName": "Mother's Name",
    "standard": "Standard",
    "branch": "Grp/Med",
    "studentNo": "Student Phone",
    "parentsNo": "Parent Phone",
    "notificationNo": "Notification No",
    "appNo": "Application No",
    "examCentre": "Exam Centre",
    "counsellor": "Counsellor",
    "counsellorBranch": "Branch",
    "totalAmount": "Total Amount",
    "amountPaid": "Amount Paid",
    "amountRemaining": "Amount Remaining",
    "dueDate": "Due Date",
    "createdAt": "Register Date"
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersRes, examCentresRes] = await Promise.all([
          api.get("/admin/getUser"),
          api.get("/admin/getExamCenters")
        ]);

        const counsellors = usersRes.data.data.filter((u) => u.role === "counsellor");
        setUsers(counsellors);
        setExamCentres(examCentresRes.data.data);

      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleColumnChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const validateDateRange = useCallback(() => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be later than To Date");
      return false;
    }
    setError("");
    return true;
  }, [fromDate, toDate]);

  const getAutoWidths = (data) => {
    return selectedColumns.map((col) => {
      const displayName = columnDisplayNames[col] || col;
      const headerLength = displayName.length;
      
      const maxContentLength = data.length > 0 ? Math.max(
        ...data.map((row) => {
          const value = row[displayName];
          if (!value && value !== 0) return 0;
          return String(value).length;
        })
      ) : 0;
      
      return { wch: Math.min(Math.max(headerLength, maxContentLength) + 2, 50) };
    });
  };

  const handleGenerateExcel = async () => {
    if (!validateDateRange()) return;
    if (selectedColumns.length === 0) {
      setError("Please select at least one column to export.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const body = {
        standard: selectedStandard || null,
        counsellor: selectedCounsellor || null,
        examCentre: selectedExamCentre || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        onlyZeroRemaining,
        onlyNonZeroRemaining,
        columns: selectedColumns
      };
      const { data: filteredStudents } = await api.post("/counsellor/getFilteredRegister", body);
      // console.log("Filtered Students:", filteredStudents);
      if (!filteredStudents || filteredStudents.length === 0) {
        setError("No students found for the selected filters.");
        return;
      }

      const exportData = filteredStudents.map(student => {
        const row = {};
        selectedColumns.forEach(col => {
          let value = student[col];
          if (col === "createdAt" || col === "dueDate") {
            value = value ? new Date(value).toLocaleDateString("en-GB") : "";
          }
          row[columnDisplayNames[col] || col] = value;
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = getAutoWidths(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");
      XLSX.writeFile(wb, `Filtered_Registrations_${Date.now()}.xlsx`);

      alert("Excel file downloaded successfully!");
    } catch (err) {
      console.error("Error generating Excel:", err);
      setError("Failed to generate Excel file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-customwhite shadow-custom">
      <h1 className="text-2xl mb-2 text-center font-bold text-primary">Excel Export Tool</h1>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {loading && <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <select value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)} className="p-2 border border-gray-300 rounded-lg" disabled={loading}>
          <option value="">All Standards</option>
          <option value="9th+10th">9th+10th</option>
          <option value="10th">10th</option>
          <option value="12th">11th+12th</option>
          <option value="12th">12th</option>
        </select>

        <select value={selectedCounsellor} onChange={(e) => setSelectedCounsellor(e.target.value)} className="p-2 border border-gray-300 rounded-lg" disabled={loading}>
          <option value="">All Counsellors</option>
          {users.map(u => <option key={u.uuid} value={u.uuid}>{u.name}</option>)}
        </select>

        <select value={selectedExamCentre} onChange={(e) => setSelectedExamCentre(e.target.value)} className="p-2 border border-gray-300 rounded-lg" disabled={loading}>
          <option value="">All Exam Centres</option>
          {examCentres.map(ec => <option key={ec.centerId} value={ec.centerId}>{ec.centerName}</option>)}
        </select>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg" disabled={loading} placeholder="From Date" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg" disabled={loading} placeholder="To Date" />

        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={onlyZeroRemaining}
              onChange={(e) => {
                setOnlyZeroRemaining(e.target.checked);
                if (e.target.checked) setOnlyNonZeroRemaining(false);
              }}
              disabled={loading}
            />
            <span>Amount Remaining = 0</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={onlyNonZeroRemaining}
              onChange={(e) => {
                setOnlyNonZeroRemaining(e.target.checked);
                if (e.target.checked) setOnlyZeroRemaining(false);
              }}
              disabled={loading}
            />
            <span>Amount Remaining != 0</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex gap-12 mb-4">
          <h2 className="text-xl font-semibold text-secondary">Select Columns</h2>
          <button
            onClick={() => setSelectedColumns(selectedColumns.length === allColumns.length ? [] : [...allColumns])}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={loading}
          >
            {selectedColumns.length === allColumns.length ? "Unselect All" : "Select All"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {allColumns.map(col => (
            <label key={col} className="flex items-center space-x-2">
              <input type="checkbox" checked={selectedColumns.includes(col)} onChange={() => handleColumnChange(col)} disabled={loading} />
              <span>{columnDisplayNames[col] || col}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-7 items-center">
        <button
          onClick={handleGenerateExcel}
          className="bg-green-600 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-green-700 transition"
          disabled={loading || selectedColumns.length === 0}
        >
          {loading ? "Generating..." : "Generate Excel"}
        </button>
      </div>
    </div>
  );
};

export default Excel;
