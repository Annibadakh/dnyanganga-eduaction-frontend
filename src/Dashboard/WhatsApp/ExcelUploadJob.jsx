import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelUploadJob = ({ onDataReady, onCancel }) => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);

        if (data.length === 0) {
          setError('Excel file is empty');
          return;
        }

        // Extract column names
        const cols = Object.keys(data[0]);
        setColumns(cols);
        setExcelData(data);
        setError('');
      } catch (err) {
        setError('Failed to read Excel file');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCellEdit = (rowIndex, colName, value) => {
    const updatedData = [...excelData];
    updatedData[rowIndex][colName] = value;
    setExcelData(updatedData);
    setEditingCell(null);
  };

  const handleDeleteRow = (rowIndex) => {
    const updatedData = excelData.filter((_, index) => index !== rowIndex);
    setExcelData(updatedData);
  };

  const handleDeleteColumn = (colName) => {
    if (columns.length === 1) {
      setError('Cannot delete the last column');
      return;
    }

    const updatedColumns = columns.filter(col => col !== colName);
    const updatedData = excelData.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    });

    setColumns(updatedColumns);
    setExcelData(updatedData);
  };

  const handleRenameColumn = (oldName, newName) => {
    if (!newName.trim()) {
      setError('Column name cannot be empty');
      return;
    }

    if (columns.includes(newName) && newName !== oldName) {
      setError('Column name already exists');
      return;
    }

    const updatedColumns = columns.map(col => col === oldName ? newName : col);
    const updatedData = excelData.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        newRow[key === oldName ? newName : key] = row[key];
      });
      return newRow;
    });

    setColumns(updatedColumns);
    setExcelData(updatedData);
    setEditingColumn(null);
    setNewColumnName('');
    setError('');
  };

  const handleProceed = () => {
    if (excelData.length === 0) {
      setError('No data to proceed');
      return;
    }

    // Check if phone column exists
    const hasPhone = columns.some(col => 
      col.toLowerCase().includes('phone') || 
      col.toLowerCase().includes('mobile') || 
      col.toLowerCase().includes('contact')
    );

    if (!hasPhone) {
      const confirmProceed = window.confirm(
        'No phone/mobile column detected. Are you sure you want to proceed?'
      );
      if (!confirmProceed) return;
    }

    onDataReady(excelData, columns);
  };

  return (
    <div className="p-6 bg-white shadow-custom">
      <h2 className="text-2xl font-bold text-secondary mb-4">Upload Excel File</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* File Upload */}
      {excelData.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-lg font-medium text-gray-700">Click to upload Excel file</span>
              <span className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls files</span>
            </div>
          </label>
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="mb-4 flex gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2">
              <span className="text-sm text-gray-600">Total Rows: </span>
              <span className="font-bold text-primary">{excelData.length}</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded px-4 py-2">
              <span className="text-sm text-gray-600">Total Columns: </span>
              <span className="font-bold text-green-700">{columns.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg mb-4" style={{ maxHeight: '500px' }}>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Sr.
                  </th>
                  {columns.map((col, colIndex) => (
                    <th key={colIndex} className="px-4 py-2 text-left">
                      {editingColumn === col ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameColumn(col, newColumnName);
                              } else if (e.key === 'Escape') {
                                setEditingColumn(null);
                                setNewColumnName('');
                              }
                            }}
                            className="border p-1 text-xs w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameColumn(col, newColumnName)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingColumn(null);
                              setNewColumnName('');
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">{col}</span>
                          <button
                            onClick={() => {
                              setEditingColumn(col);
                              setNewColumnName(col);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="Rename column"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete column "${col}"?`)) {
                                handleDeleteColumn(col);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Delete column"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {excelData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-500">{rowIndex + 1}</td>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-2">
                        {editingCell?.row === rowIndex && editingCell?.col === col ? (
                          <input
                            type="text"
                            value={row[col]}
                            onChange={(e) => handleCellEdit(rowIndex, col, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            className="border p-1 w-full text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: rowIndex, col })}
                            className="cursor-pointer text-sm text-gray-700 hover:bg-gray-100 p-1 rounded"
                          >
                            {row[col] || '-'}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this row?')) {
                            handleDeleteRow(rowIndex);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setExcelData([]);
                setColumns([]);
                setError('');
              }}
              className="px-6 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
            >
              Upload New File
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary"
            >
              Proceed to Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadJob;