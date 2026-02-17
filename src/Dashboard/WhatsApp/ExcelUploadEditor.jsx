import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUploadEditor = ({ onDataReady, onCancel }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [labels, setLabels] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});

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
      setLabels(cols.reduce((acc, c) => ({ ...acc, [c]: c }), {}));
    };
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
  };

  const renameColumn = (key, value) => {
    setLabels({ ...labels, [key]: value });
  };

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

  const handleSubmit = () => {
    const mappedRows = rows.map((row) => {
      const newRow = {};
      columns.forEach((col) => {
        const finalKey = labels[col] || col;
        newRow[finalKey] = row[col];
      });
      return newRow;
    });

    onDataReady(mappedRows, columns);
  };

  return (
    <div className="p-6 bg-white shadow-custom">
      <h2 className="text-xl font-bold mb-4">Upload Excel File</h2>

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
                <th className="p-3 border text-center w-20">Sr</th>

                {columns.map((col) => (
                  <th key={col} className="p-3 border">
                    <div className="flex gap-2">
                      <input
                        value={labels[col]}
                        onChange={(e) =>
                          renameColumn(col, e.target.value)
                        }
                        className="border px-2 py-1 w-full rounded"
                      />
                      <button
                        onClick={() => deleteColumn(col)}
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}

                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="p-3 border text-center">
                    {index + 1}
                  </td>

                  {columns.map((key) => (
                    <td key={key} className="p-3 border">
                      {editIndex === index ? (
                        <input
                          value={editRow[key]}
                          onChange={(e) =>
                            setEditRow({
                              ...editRow,
                              [key]: e.target.value,
                            })
                          }
                          className="border px-2 py-1 w-full rounded"
                        />
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}

                  <td className="p-3 border space-x-2">
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
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border rounded"
            >
              Back
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary text-white rounded"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadEditor;