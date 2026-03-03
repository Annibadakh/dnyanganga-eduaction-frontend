import React, { useEffect, useState } from "react";
import api from "../../Api";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Check,
  Users,
  Filter,
} from "lucide-react";

const StudentPreviewSelector = ({ onDataReady, onCancel }) => {
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    standard: "",
    counsellor: "",
    examCentre: "",
    examYear: "",
    fromDate: "",
    toDate: "",
  });

  const getExamYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 5; i++) years.push(currentYear + i);
    return years;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, examCentresRes] = await Promise.all([
          api.get("/admin/getUser"),
          api.get("/admin/getExamCenters"),
        ]);
        const counsellors = usersRes.data.data.filter((u) => u.role === "counsellor");
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

  const startEditing = (index) => {
    setEditIndex(index);
    setEditRow({ ...rows[index] });
  };

  const saveRow = (index) => {
    const updated = [...rows];
    updated[index] = editRow;
    setRows(updated);
    setEditIndex(null);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
    if (editIndex === index) setEditIndex(null);
  };

  const deleteColumn = (col) => {
    setColumns(columns.filter((c) => c !== col));
    setRows(rows.map((r) => { const { [col]: _, ...rest } = r; return rest; }));
    if (editIndex !== null) {
      const { [col]: _, ...rest } = editRow;
      setEditRow(rest);
    }
  };

  const handleProceed = () => {
    if (rows.length === 0) {
      setError("No data to proceed");
      return;
    }
    onDataReady(rows, columns, filters);
  };

  const selectClass =
    "w-full border border-gray-300 rounded px-3 py-2 text-md text-customblack focus:outline-none focus:border-primary bg-customwhite";
  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-2 text-md text-customblack focus:outline-none focus:border-primary bg-customwhite";

  return (
    <div className="h-full bg-gray-100 p-6 flex flex-col">
      <div className="max-w-7xl w-full mx-auto bg-customwhite shadow-custom rounded p-6 flex flex-col flex-1 min-h-0">

        {/* Page Title */}
        <h2 className="text-xl font-bold text-secondary mb-5">
          Filter Students
        </h2>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded flex items-center gap-2 text-md">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Filters Section ── */}
        <div className="mb-5 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className=" text-primary mb-3 flex items-center gap-2">
            <Filter size={18} />
            Apply Filters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Standard */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">Standard</label>
              <select
                value={filters.standard}
                onChange={(e) => handleFilterChange("standard", e.target.value)}
                className={selectClass}
              >
                <option value="">All Standards</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
              </select>
            </div>

            {/* Counsellor */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">Counsellor</label>
              <select
                value={filters.counsellor}
                onChange={(e) => handleFilterChange("counsellor", e.target.value)}
                className={selectClass}
              >
                <option value="">All Counsellors</option>
                {users.map((u) => (
                  <option key={u.uuid} value={u.uuid}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Exam Centre */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">Exam Centre</label>
              <select
                value={filters.examCentre}
                onChange={(e) => handleFilterChange("examCentre", e.target.value)}
                className={selectClass}
              >
                <option value="">All Exam Centres</option>
                {examCentres.map((ec) => (
                  <option key={ec.centerId} value={ec.centerId}>{ec.centerName}</option>
                ))}
              </select>
            </div>

            {/* Exam Year */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">Exam Year</label>
              <select
                value={filters.examYear}
                onChange={(e) => handleFilterChange("examYear", e.target.value)}
                className={selectClass}
              >
                <option value="">All Exam Years</option>
                {getExamYearOptions().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-tertiary mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3 flex-wrap mb-5">
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-customwhite  text-md rounded hover:bg-tertiary transition-colors disabled:opacity-60"
          >
            <Search size={16} />
            {loading ? "Loading..." : "Preview Students"}
          </button>

          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded text-gray-600 font-medium text-md hover:border-primary hover:text-primary transition-colors bg-customwhite"
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>

        {/* ── Preview Table Section ── */}
        {rows.length > 0 && (
          <>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col flex-1 min-h-0 overflow-scroll">
              <h3 className=" text-customblack mb-3 flex items-center gap-2 shrink-0">
                <Users size={18} />
                Student Preview
                <span className="ml-auto bg-customwhite border border-blue-200 text-tertiary text-sm px-3 py-1 rounded-full font-normal">
                  <span className=" text-primary">{rows.length}</span> Students
                </span>
              </h3>

              <div className="overflow-auto rounded-lg border border-gray-200 flex-1 max-h-96">
                <table className="w-full text-md min-w-max border-collapse">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-3 py-3 text-center text-sm  text-customwhite uppercase tracking-wide w-12">
                        Sr
                      </th>
                      {columns.map((col) => (
                        <th key={col} className="px-3 py-2 text-left">
                          <div className="flex items-center gap-1">
                            <span className="text-sm  text-customwhite uppercase tracking-wide whitespace-nowrap">
                              {col}
                            </span>
                            <button
                              onClick={() => deleteColumn(col)}
                              className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-white bg-opacity-10 text-customwhite hover:bg-red-500 transition-colors ml-1"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-left text-sm  text-customwhite uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 transition-colors ${editIndex === index
                            ? "bg-orange-50"
                            : index % 2 === 0
                              ? "bg-customwhite hover:bg-blue-50"
                              : "bg-gray-50 hover:bg-blue-50"
                          }`}
                      >
                        <td className="px-3 py-2 text-center text-sm text-gray-400 ">
                          {index + 1}
                        </td>

                        {columns.map((col) => (
                          <td key={col} className="px-3 py-2">
                            {editIndex === index ? (
                              <input
                                value={editRow[col] ?? ""}
                                onChange={(e) =>
                                  setEditRow({ ...editRow, [col]: e.target.value })
                                }
                                className="w-full border border-fourthcolor rounded px-2 py-1 text-sm focus:outline-none focus:border-primary min-w-[90px]"
                              />
                            ) : (
                              <span
                                className="block truncate max-w-[160px] text-customblack text-sm"
                                title={String(row[col] ?? "")}
                              >
                                {row[col] !== undefined && row[col] !== ""
                                  ? row[col]
                                  : <span className="text-gray-300">—</span>}
                              </span>
                            )}
                          </td>
                        ))}

                        <td className="px-3 py-2 whitespace-nowrap">
                          {editIndex === index ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveRow(index)}
                                className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded hover:bg-green-600 hover:text-customwhite transition-colors"
                              >
                                <Check size={12} /> Save
                              </button>
                              <button
                                onClick={() => setEditIndex(null)}
                                className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                              >
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEditing(index)}
                                className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-blue-100 text-primary rounded hover:bg-primary hover:text-customwhite transition-colors"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                onClick={() => deleteRow(index)}
                                className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-red-100 text-red-700 rounded hover:bg-red-600 hover:text-customwhite transition-colors"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Proceed Footer */}

            </div>
            <div className="flex justify-end mt-4 shrink-0">
              <button
                onClick={handleProceed}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-customwhite  text-md rounded hover:bg-green-700 transition-colors"
              >
                Proceed to Mapping <ChevronRight size={16} />
              </button>
            </div></>
        )}

      </div>
    </div>
  );
};

export default StudentPreviewSelector;