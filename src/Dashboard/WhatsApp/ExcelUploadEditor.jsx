import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Pencil,
  Phone,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { phoneProblems } from "./phone";

const PAGE_SIZE = 50;
const PHONE_COLUMN_GUESS = /phone|mobile|contact|whats\s*app|number|no\.?$/i;

let nextRowId = 1;

// Step 2 of job creation: read the Excel file, pick the phone column, fix or remove rows
// whose number is missing, invalid or repeated (shown in red) before continuing.
const ExcelUploadEditor = ({ initial, onDataReady, onCancel }) => {
  const [rows, setRows] = useState(initial?.rows || []);
  const [columns, setColumns] = useState(initial?.columns || []);
  const [phoneField, setPhoneField] = useState(initial?.phoneField || "");
  const [fileName, setFileName] = useState(initial?.fileName || "");
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);

  const problems = useMemo(
    () => (phoneField ? phoneProblems(rows, phoneField) : rows.map(() => "")),
    [rows, phoneField],
  );
  const problemCount = problems.filter(Boolean).length;

  const visible = useMemo(() => {
    const all = rows.map((row, i) => ({ row, problem: problems[i] }));
    return onlyProblems ? all.filter((r) => r.problem) : all;
  }, [rows, problems, onlyProblems]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const processFile = (file) => {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("Please upload an Excel file (.xlsx, .xls or .csv)");
      return;
    }
    setError("");
    setReading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (data.length === 0) {
          setError("The first sheet of this file has no rows");
          return;
        }
        // Columns from every row (a blank cell in the first row would hide its column)
        const cols = [...new Set(data.flatMap((r) => Object.keys(r)))].filter(
          (c) => !c.startsWith("__EMPTY"),
        );
        setRows(data.map((r) => ({ ...r, __id: nextRowId++ })));
        setColumns(cols);
        setPhoneField(cols.find((c) => PHONE_COLUMN_GUESS.test(c)) || "");
        setFileName(file.name);
        setEditId(null);
        setOnlyProblems(false);
        setPage(1);
      } catch (err) {
        console.error("Excel read error:", err);
        setError("Could not read this file. Please check it is a valid Excel file.");
      } finally {
        setReading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const startEditing = (row) => {
    setEditId(row.__id);
    setEditRow({ ...row });
  };

  const saveRow = () => {
    setRows((prev) => prev.map((r) => (r.__id === editId ? editRow : r)));
    setEditId(null);
  };

  const deleteRow = (id) => {
    setRows((prev) => prev.filter((r) => r.__id !== id));
    if (editId === id) setEditId(null);
  };

  const removeProblemRows = () => {
    setRows((prev) => prev.filter((_, i) => !problems[i]));
    setOnlyProblems(false);
    setPage(1);
  };

  const deleteColumn = (col) => {
    if (col === phoneField) setPhoneField("");
    setColumns((prev) => prev.filter((c) => c !== col));
    setRows((prev) => prev.map(({ [col]: _, ...rest }) => rest));
  };

  const handleSubmit = () => {
    if (rows.length === 0) return setError("Please upload an Excel file before continuing.");
    if (!phoneField) return setError("Select the column that has the phone numbers.");
    if (problemCount > 0) {
      return setError(`${problemCount} row(s) have a problem with the phone number. Fix or remove them to continue.`);
    }
    setError("");
    onDataReady?.({ rows, columns, phoneField, fileName });
  };

  return (
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-primary mb-4">Upload Receivers (Excel)</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded flex items-start gap-2 text-sm">
          <X size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 ${
          rows.length > 0 ? "p-4" : "p-8"
        } ${isDragging ? "border-primary bg-blue-100" : "border-fourthcolor bg-blue-50 hover:border-primary"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            processFile(e.target.files[0]);
            e.target.value = "";
          }}
          className="hidden"
        />
        {reading ? (
          <span className="inline-block animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        ) : fileName ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <FileSpreadsheet size={18} className="text-green-600" />
            <span className="font-medium text-primary break-all">{fileName}</span>
            <span className="text-gray-500">· tap to choose another file</span>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-3 text-fourthcolor" />
            <p className="text-primary">Click to browse or drag &amp; drop here</p>
            <p className="text-gray-400 text-sm mt-1">.xlsx, .xls or .csv — the first row must be the column names</p>
          </>
        )}
      </div>

      {rows.length > 0 && (
        <>
          {/* ── Phone column + summary ── */}
          <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                <Phone size={14} className="inline mr-1" />
                Phone Number Column *
              </label>
              <select
                value={phoneField}
                onChange={(e) => {
                  setPhoneField(e.target.value);
                  setError("");
                }}
                className={`border p-2 w-full rounded focus:outline-none focus:border-primary ${
                  phoneField ? "border-gray-300" : "border-red-400"
                }`}
              >
                <option value="">-- Select phone column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-white border border-blue-200 px-3 py-1 rounded-full">
                <b className="text-primary">{rows.length}</b> rows
              </span>
              {phoneField && (
                <span className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-full">
                  <b>{rows.length - problemCount}</b> ready to send
                </span>
              )}
              {problemCount > 0 && (
                <span className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full">
                  <b>{problemCount}</b> with problems
                </span>
              )}
            </div>
          </div>

          {problemCount > 0 && (
            <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-red-800">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="flex-1">
                Rows in red have a missing, invalid or repeated phone number. Edit them, or remove them all.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOnlyProblems((v) => !v);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded border border-red-300 bg-white hover:bg-red-100"
                >
                  {onlyProblems ? "Show all rows" : "Show only these"}
                </button>
                <button
                  onClick={removeProblemRows}
                  className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove {problemCount}
                </button>
              </div>
            </div>
          )}

          {/* ── Rows ── */}
          <div className="overflow-auto rounded-lg border border-gray-200 max-h-[60vh] mb-3">
            <table className="w-full text-sm min-w-max border-collapse">
              <thead className="bg-primary text-customwhite sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-center w-12">Sr</th>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-medium">
                      <div className="flex items-center gap-1">
                        <span className={col === phoneField ? "underline underline-offset-4" : ""}>{col}</span>
                        <button
                          onClick={() => deleteColumn(col)}
                          title={`Remove column ${col}`}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ row, problem }) => {
                  const editing = editId === row.__id;
                  const index = rows.indexOf(row);
                  return (
                    <tr
                      key={row.__id}
                      className={`border-b border-gray-100 ${
                        editing ? "bg-orange-50" : problem ? "bg-red-50 text-red-800" : "bg-white hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        {index + 1}
                        {problem && !editing && (
                          <span className="block text-[10px] font-semibold text-red-600 whitespace-nowrap">{problem}</span>
                        )}
                      </td>
                      {columns.map((key) => (
                        <td key={key} className="px-3 py-2">
                          {editing ? (
                            <input
                              value={editRow[key] ?? ""}
                              onChange={(e) => setEditRow({ ...editRow, [key]: e.target.value })}
                              className="w-full border border-fourthcolor rounded px-2 py-1 focus:outline-none focus:border-primary min-w-[90px] text-black"
                            />
                          ) : (
                            <span
                              className={`block max-w-[200px] truncate ${
                                problem && key === phoneField ? "font-semibold text-red-600" : ""
                              }`}
                              title={String(row[key] ?? "")}
                            >
                              {row[key] !== undefined && row[key] !== "" ? String(row[key]) : <span className="text-gray-300">—</span>}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {editing ? (
                          <div className="flex gap-1">
                            <button
                              onClick={saveRow}
                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-600 hover:text-white"
                            >
                              <Check size={12} /> Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-300"
                            >
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(row)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-primary rounded hover:bg-primary hover:text-white"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => deleteRow(row.__id)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 mb-4 text-sm">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border rounded disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="p-1.5 border rounded disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Footer ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-5 py-2 border border-gray-300 rounded text-gray-600 hover:border-primary hover:text-primary bg-customwhite"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={rows.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-customwhite rounded hover:bg-secondary disabled:opacity-50"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExcelUploadEditor;
