import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import api from "../Api";

const Excel = () => {
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);

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

  useEffect(() => {
    api.get("/admin/getUser").then((res) => {
      const counsellors = res.data.data.filter((u) => u.role === "counsellor");
      setUsers(counsellors);
    });

    api.get("/admin/getExamCenters").then((res) => {
      setExamCentres(res.data.data);
    });

    api.get("/counsellor/getRegister?uuid=all&role=admin").then((res) => {
      setRegistrations(res.data.data);
    });
  }, []);

  const handleColumnChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const applyFilters = () => {
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
  };

  const getAutoWidths = (data) => {
    return selectedColumns.map((col) => ({
      wch: Math.max(
        col.length,
        ...data.map((row) => (row[col] ? String(row[col]).length : 0))
      ) + 2,
    }));
  };

  const handleGenerateExcel = () => {
    const filteredData = applyFilters();

    if (filteredData.length === 0) {
      alert("No students found for the selected filters.");
      return;
    }

    const exportData = filteredData.map((student) => {
      const row = {};
      selectedColumns.forEach((col) => {
        if (col === "createdAt" || col === "dueDate") {
          row[col] = new Date(student[col]).toLocaleDateString("en-GB");
        } else {
          row[col] = student[col];
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = getAutoWidths(exportData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    XLSX.writeFile(wb, "Filtered_Registrations.xlsx");
  };

  return (
    <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
      <h1 className="text-2xl text-center font-bold text-primary">Excel Export Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Standards</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
        </select>

        <select
          value={selectedCounsellor}
          onChange={(e) => setSelectedCounsellor(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
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
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={onlyZeroRemaining}
            onChange={(e) => setOnlyZeroRemaining(e.target.checked)}
          />
          <span>Only Amount Remaining = 0</span>
        </label>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2 text-secondary">Select Columns</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {allColumns.map((col) => (
            <label key={col} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => handleColumnChange(col)}
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-7 items-center">
        <button
        onClick={handleGenerateExcel}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        disabled={selectedColumns.length === 0}
      >
        Generate Excel
      </button>

      {applyFilters().length === 0 && (
        <p className="text-lg text-customgray font-medium">No students found for selected filters.</p>
      )}
      </div>
    </div>
  );
};

export default Excel;
