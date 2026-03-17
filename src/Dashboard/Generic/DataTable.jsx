import React from "react";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  rowKey = "id",
  emptyMessage = "No data found",
}) => {
  return (
    <div className="bg-white shadow-custom md:p-6 p-2">
      {loading && <p className="text-customgray text-lg">Loading...</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      {!loading && !error && data.length > 0 ? (
        <div className="overflow-auto">
          <table className="table-auto w-full border text-center border-customgray overflow-hidden shadow-lg text-sm">
            
            {/* Header */}
            <thead className="bg-primary text-customwhite uppercase tracking-wider">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`p-3 border whitespace-nowrap ${col.headerClass || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="text-customblack">
              {data.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] || rowIndex}
                  className="border-b border-gray-200 hover:bg-gray-100 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-3 border whitespace-nowrap ${col.cellClass || ""}`}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-lg text-black">{emptyMessage}</p>
        )
      )}
    </div>
  );
};

export default DataTable;