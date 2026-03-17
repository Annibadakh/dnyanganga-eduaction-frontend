import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Table2,
} from "lucide-react";

const ExcelUploadEditor = ({ onDataReady, onCancel }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [labels, setLabels] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => {
      const wb = XLSX.read(event.target.result, { type: "binary" });
      const sheet = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
      const cols = Object.keys(data[0] || {});
      setRows(data);
      setColumns(cols);
      setLabels(cols.reduce((acc, c) => ({ ...acc, [c]: c }), {}));
    };
  };

  const handleFileUpload = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      processFile(file);
    } else {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
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

  const renameColumn = (key, value) => setLabels({ ...labels, [key]: value });

  const deleteColumn = (col) => {
    setColumns(columns.filter((c) => c !== col));
    setRows(rows.map((r) => { const { [col]: _, ...rest } = r; return rest; }));
    const newLabels = { ...labels };
    delete newLabels[col];
    setLabels(newLabels);
  };

  const handleSubmit = () => {
    if (rows.length === 0) {
      setError("Please upload an Excel file before continuing.");
      return;
    }
    setError("");
    const mappedRows = rows.map((row) => {
      const newRow = {};
      columns.forEach((col) => { newRow[labels[col] || col] = row[col]; });
      return newRow;
    });
    onDataReady?.(mappedRows, columns);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-customwhite shadow-custom rounded p-6">

        {/* Page Title */}
        <h2 className="text-xl font-bold text-primary mb-5">
          Upload Excel File
        </h2>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded flex items-center gap-2 text-md">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Upload Section ── */}
        <div className="mb-5 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className=" text-primary mb-3 flex items-center gap-2">
            <FileSpreadsheet size={16} />
            Select or Drop Your File *
          </h3>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-blue-100"
                : "border-fourthcolor bg-customwhite hover:border-primary hover:bg-blue-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload size={32} className="mx-auto mb-3 text-fourthcolor" />
            <p className=" text-primary text-md">
              Click to browse or drag &amp; drop here
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Supports .xlsx and .xls formats
            </p>
            {fileName && (
              <span className="inline-flex items-center gap-2 mt-3 bg-blue-100 text-primary text-sm font-medium px-3 py-1 rounded-full">
                <Check size={12} /> {fileName}
              </span>
            )}
          </div>

          {/* Stats */}
          {rows.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-customwhite border border-blue-200 text-tertiary text-sm px-3 py-1 rounded-full">
                <span className=" text-primary">{rows.length}</span> Rows
              </span>
              <span className="bg-customwhite border border-blue-200 text-tertiary text-sm px-3 py-1 rounded-full">
                <span className=" text-primary">{columns.length}</span> Columns
              </span>
              <span className="bg-customwhite border border-blue-200 text-tertiary text-sm px-3 py-1 rounded-full">
                <span className=" text-primary">{rows.length * columns.length}</span> Cells
              </span>
            </div>
          )}
        </div>

        {/* ── Data Preview & Edit Section ── */}
        {rows.length > 0 && (
          <div className="mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className=" text-customblack mb-3 flex items-center gap-2">
              <Table2 size={16} />
              Preview &amp; Edit Data
            </h3>

            <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-96">
              <table className="w-full text-md min-w-max border-collapse">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-3 py-3 text-center text-sm  text-customwhite uppercase tracking-wide w-12">
                      Sr
                    </th>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left">
                        <div className="flex items-center gap-1">
                          <input
                            value={labels[col]}
                            onChange={(e) => renameColumn(col, e.target.value)}
                            className="flex-1 min-w-[80px] bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-2 py-1 text-customwhite text-sm font-medium focus:outline-none"
                          />
                          <button
                            onClick={() => deleteColumn(col)}
                            className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-white bg-opacity-10 text-customwhite hover:bg-red-500 transition-colors"
                          >
                            <X size={12} />
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
                      className={`border-b border-gray-100 whitespace-nowrap transition-colors ${
                        editIndex === index
                          ? "bg-orange-50"
                          : index % 2 === 0
                          ? "bg-customwhite hover:bg-blue-50"
                          : "bg-gray-50 hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-3 py-2 text-center text-sm text-black ">
                        {index + 1}
                      </td>

                      {columns.map((key) => (
                        <td key={key} className=" whitespace-nowrap py-2">
                          {editIndex === index ? (
                            <input
                              value={editRow[key] ?? ""}
                              onChange={(e) =>
                                setEditRow({ ...editRow, [key]: e.target.value })
                              }
                              className="w-full border border-fourthcolor rounded px-2 py-1 text-sm focus:outline-none focus:border-primary min-w-[90px]"
                            />
                          ) : (
                            <span
                              className="block max-w-[160px] text-customblack text-sm"
                              title={String(row[key] ?? "")}
                            >
                              {row[key] !== undefined && row[key] !== ""
                                ? row[key]
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
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded text-gray-600 font-medium text-md hover:border-primary hover:text-primary transition-colors bg-customwhite"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-customwhite  text-md rounded hover:bg-green-700 transition-colors"
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExcelUploadEditor;