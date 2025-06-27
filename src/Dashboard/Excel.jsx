import React, { useEffect, useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import api from "../Api";

const Excel = () => {
  const [registrations, setRegistrations] = useState([]);
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

  const allColumns = [
    "studentId", "studentName", "formNo", "standard", "branch", "studentNo",
    "parentsNo", "examCentre", "counsellor", "counsellorBranch", "totalAmount",
    "amountPaid", "amountRemaining", "dueDate", "createdAt"
  ];

  // Column display names for better headers
  const columnDisplayNames = {
    "studentId": "Student ID",
    "studentName": "Student Name",
    "formNo": "Form Number",
    "standard": "Standard",
    "branch": "Grp/Med",
    "studentNo": "Student Phone",
    "parentsNo": "Parent Phone",
    "examCentre": "Exam Centre",
    "counsellor": "Counsellor",
    "counsellorBranch": "Branch",
    "totalAmount": "Total Amount",
    "amountPaid": "Amount Paid",
    "amountRemaining": "Amount Remaining",
    "dueDate": "Due Date",
    "createdAt": "Created At"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersRes, examCentresRes, registrationsRes] = await Promise.all([
          api.get("/admin/getUser"),
          api.get("/admin/getExamCenters"),
          api.get("/counsellor/getRegister?uuid=all&role=admin")
        ]);

        const counsellors = usersRes.data.data.filter((u) => u.role === "counsellor");
        setUsers(counsellors);
        setExamCentres(examCentresRes.data.data);
        setRegistrations(registrationsRes.data.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Memoize filtered data to prevent infinite re-renders
  const filteredStudents = useMemo(() => {
    if (!validateDateRange()) return [];

    return registrations.filter((student) => {
      const matchesStandard = selectedStandard ? student.standard === selectedStandard : true;
      const matchesCounsellor = selectedCounsellor ? student.createdBy === selectedCounsellor : true;
      const matchesCentre = selectedExamCentre ? student.examCentre === selectedExamCentre : true;
      const matchesFromDate = fromDate ? new Date(student.createdAt) >= new Date(fromDate) : true;
      const matchesToDate = toDate ? new Date(student.createdAt) <= new Date(toDate) : true;
      const matchesZeroRem = onlyZeroRemaining ? student.amountRemaining === 0 : true;

      return (
        matchesStandard &&
        matchesCounsellor &&
        matchesCentre &&
        matchesFromDate &&
        matchesToDate &&
        matchesZeroRem
      );
    });
  }, [registrations, selectedStandard, selectedCounsellor, selectedExamCentre, fromDate, toDate, onlyZeroRemaining, validateDateRange]);

  // Enhanced auto-width calculation
  const getAutoWidths = (data) => {
    return selectedColumns.map((col) => {
      const headerText = columnDisplayNames[col] || col;
      const headerLength = headerText.length;
      
      // Get max content length for this column
      const maxContentLength = Math.max(
        ...data.map((row) => {
          if (!row[col]) return 0;
          let value = row[col];
          
          // Handle different data types
          if (value instanceof Date) {
            value = value.toLocaleDateString("en-GB");
          } else if (typeof value === 'number') {
            value = value.toString();
          } else {
            value = String(value);
          }
          
          return value.length;
        })
      );

      // Use the larger of header length or max content length, with some padding
      const width = Math.max(headerLength, maxContentLength) + 3;
      
      // Set reasonable min and max widths
      return {
        wch: Math.min(Math.max(width, 8), 50) // Min 8 chars, max 50 chars
      };
    });
  };

  const handleGenerateExcel = async () => {
    try {
      setLoading(true);
      setError("");

      if (!validateDateRange()) {
        setLoading(false);
        return;
      }

      if (filteredStudents.length === 0) {
        setError("No students found for the selected filters.");
        setLoading(false);
        return;
      }

      if (selectedColumns.length === 0) {
        setError("Please select at least one column to export.");
        setLoading(false);
        return;
      }

      // Prepare export data with proper formatting
      const exportData = filteredStudents.map((student) => {
        const row = {};
        selectedColumns.forEach((col) => {
          let value = student[col];
          
          if (col === "createdAt" || col === "dueDate") {
            value = value ? new Date(value).toLocaleDateString("en-GB") : "";
          } else if (typeof value === 'number') {
            // Keep numbers as numbers for Excel formatting
            value = value;
          } else if (value === null || value === undefined) {
            value = "";
          }
          
          // Use display name as key for better Excel headers
          const displayName = columnDisplayNames[col] || col;
          row[displayName] = value;
        });
        return row;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Apply auto-width
      ws["!cols"] = getAutoWidths(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Filtered_Registrations_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      // Success message
      alert(`Excel file "${filename}" has been downloaded successfully!`);
      
    } catch (err) {
      console.error("Error generating Excel:", err);
      setError("Failed to generate Excel file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
      <h1 className="text-2xl mb-2 text-center font-bold text-primary">Excel Export Tool</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={loading}
        >
          <option value="">All Standards</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
        </select>

        <select
          value={selectedCounsellor}
          onChange={(e) => setSelectedCounsellor(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={loading}
        >
          <option value="">All Counsellors</option>
          {users.map((u) => (
            <option key={u.uuid} value={u.uuid}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={selectedExamCentre}
          onChange={(e) => setSelectedExamCentre(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={loading}
        >
          <option value="">All Exam Centres</option>
          {examCentres.map((ec) => (
            <option key={ec.centerId} value={ec.centerName}>
              {ec.centerName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={loading}
          placeholder="From Date"
        />
        
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={loading}
          placeholder="To Date"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={onlyZeroRemaining}
            onChange={(e) => setOnlyZeroRemaining(e.target.checked)}
            disabled={loading}
          />
          <span>Amount Remaining = 0</span>
        </label>
      </div>

      <div>
        <div className="flex gap-12 mb-4">
          <h2 className="text-xl font-semibold text-secondary">Select Columns</h2>
          <button
            onClick={() => {
              if (selectedColumns.length === allColumns.length) {
                setSelectedColumns([]);
              } else {
                setSelectedColumns([...allColumns]);
              }
            }}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={loading}
          >
            {selectedColumns.length === allColumns.length ? "Unselect All" : "Select All"}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {allColumns.map((col) => (
            <label key={col} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleColumnChange(col)}
                disabled={loading}
              />
              <span>{columnDisplayNames[col] || col}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-7 items-center">
        <button
          onClick={handleGenerateExcel}
          className="bg-green-600 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-green-700 transition"
          disabled={loading || filteredStudents.length === 0 || selectedColumns.length === 0}
        >
          {loading ? "Generating..." : "Generate Excel"}
        </button>

        {filteredStudents.length === 0 ? (
          <p className="text-lg text-red-700 font-medium">No students found for selected filters.</p>
        ) : (
          <p className="text-lg font-medium">Number of Students: {filteredStudents.length}</p>
        )}
      </div>
    </div>
  );
};

export default Excel;