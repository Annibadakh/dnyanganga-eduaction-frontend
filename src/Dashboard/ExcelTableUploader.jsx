import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [labels, setLabels] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});

  // READ FILE
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (event) => {
      const wb = XLSX.read(event.target.result, { type: "binary" });
      const sheet = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);

      const cols = Object.keys(data[0] || {});

      setRows(data);
      setColumns(cols);

      // default labels = original column names
      setLabels(cols.reduce((acc, c) => ({ ...acc, [c]: c }), {}));
    };
  };

  // ROW EDITING
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
  };

  // COLUMN LABEL UPDATE
  const renameColumn = (key, value) => {
  setLabels({ ...labels, [key]: value });
};


  // DELETE COLUMN
  const deleteColumn = (col) => {
    setColumns(columns.filter((c) => c !== col));

    setRows(
      rows.map((r) => {
        const { [col]: removed, ...rest } = r;
        return rest;
      })
    );

    const newLabels = { ...labels };
    delete newLabels[col];
    setLabels(newLabels);
  };

  // SUBMIT
  const handleSubmit = async () => {
  // map rows to new keys using labels
  const mappedRows = rows.map((row) => {
    const newRow = {};

    columns.forEach((col) => {
      const finalKey = labels[col] || col;   // use label if changed
      newRow[finalKey] = row[col];
    });

    return newRow;
  });

  console.log("FINAL DATA:", mappedRows);

  // Example backend call
  // await fetch("/api/upload", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(mappedRows),
  // });
};


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Excel Upload & Editor</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="mb-6"
      />

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {/* SR NO */}
                <th className="p-3 border font-semibold text-center w-20">
                  Sr No
                </th>

                {columns.map((col) => (
                  <th key={col} className="p-3 border">
                    <div className="flex items-center gap-2">
                      <input
                        value={labels[col]}
                        onChange={(e) => renameColumn(col, e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                      <button
                        onClick={() => deleteColumn(col)}
                        className="text-red-600 text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}

                <th className="p-3 border font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* SR NO VALUE */}
                  <td className="p-3 border text-center font-medium">
                    {index + 1}
                  </td>

                  {columns.map((key) => (
                    <td key={key} className="p-3 border">
                      {editIndex === index ? (
                        <input
                          value={editRow[key]}
                          onChange={(e) =>
                            setEditRow({ ...editRow, [key]: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}

                  <td className="p-3 border space-x-2 whitespace-nowrap">
                    {editIndex === index ? (
                      <>
                        <button
                          onClick={() => saveRow(index)}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(index)}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRow(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete Row
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded shadow"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
