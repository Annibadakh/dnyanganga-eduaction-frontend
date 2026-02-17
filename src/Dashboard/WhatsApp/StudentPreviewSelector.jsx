import React, { useEffect, useState } from "react";
import api from "../../Api";

const StudentPreviewSelector = ({ onDataReady, onCancel }) => {
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    standard: "",
    counsellor: "",
    examCentre: "",
    examYear: "",
    fromDate: "",
    toDate: "",
    onlyZeroRemaining: false,
    onlyNonZeroRemaining: false,
  });

  const getExamYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, examCentresRes] = await Promise.all([
          api.get("/admin/getUser"),
          api.get("/admin/getExamCenters"),
        ]);

        const counsellors = usersRes.data.data.filter(
          (u) => u.role === "counsellor"
        );

        setUsers(counsellors);
        setExamCentres(examCentresRes.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load filters");
      }
    };

    fetchInitialData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/jobs/preview-students", filters);

      if (response.data.success) {
        const data = response.data.data;

        if (data.length === 0) {
          setError("No students found for selected filters.");
          return;
        }

        setRows(data);
        setColumns(Object.keys(data[0]));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch preview data");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (rows.length === 0) {
      setError("No data to proceed");
      return;
    }

    onDataReady(rows, columns, filters);
  };

  return (
    <div className="p-6 bg-white shadow-custom max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-secondary mb-6">
        Filter Students
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={filters.standard}
          onChange={(e) => handleFilterChange("standard", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Standards</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
        </select>

        <select
          value={filters.counsellor}
          onChange={(e) => handleFilterChange("counsellor", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Counsellors</option>
          {users.map((u) => (
            <option key={u.uuid} value={u.uuid}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={filters.examCentre}
          onChange={(e) => handleFilterChange("examCentre", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Exam Centres</option>
          {examCentres.map((ec) => (
            <option key={ec.centerId} value={ec.centerId}>
              {ec.centerName}
            </option>
          ))}
        </select>

        <select
          value={filters.examYear}
          onChange={(e) => handleFilterChange("examYear", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Exam Years</option>
          {getExamYearOptions().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => handleFilterChange("fromDate", e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => handleFilterChange("toDate", e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchPreview}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary"
        >
          Preview Students
        </button>

        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded"
        >
          Back
        </button>
      </div>

      {/* PREVIEW TABLE */}
      {rows.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-center">Sr</th>
                {columns.map((col) => (
                  <th key={col} className="p-2 border text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="p-2 border text-center">
                    {index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="p-2 border text-sm">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 text-right">
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Proceed to Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPreviewSelector;