import { useEffect, useRef, useState } from "react";
import "mathlive";

const TableModal = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState(
    Array(3)
      .fill()
      .map(() => Array(3).fill("")),
  );

  const rebuildTable = (r, c) => {
    setTableData(
      Array(r)
        .fill()
        .map((_, rowIdx) =>
          Array(c)
            .fill()
            .map((_, colIdx) => tableData[rowIdx]?.[colIdx] || ""),
        ),
    );
  };

  const handleRowsChange = (e) => {
    const r = Number(e.target.value);
    setRows(r);
    rebuildTable(r, cols);
  };

  const handleColsChange = (e) => {
    const c = Number(e.target.value);
    setCols(c);
    rebuildTable(rows, c);
  };

  const updateCell = (r, c, value) => {
    const copy = [...tableData];
    copy[r][c] = value;
    setTableData(copy);
  };

  const generateLatexTable = () => {
    const alignment = Array(cols).fill("c").join("|");

    let latex = `\\begin{array}{|${alignment}|}\n\\hline\n`;

    tableData.forEach((row) => {
      latex += `${row.join(" & ")} \\\\\n\\hline\n`;
    });

    latex += "\\end{array}";

    onInsert(`$${latex}$`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-[700px] max-w-[95vw]">
        <h3 className="font-semibold text-lg mb-4">Insert Table</h3>

        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-sm">Rows</label>
            <input
              type="number"
              min="1"
              value={rows}
              onChange={handleRowsChange}
              className="border rounded px-2 py-1 w-20 ml-2"
            />
          </div>

          <div>
            <label className="text-sm">Columns</label>
            <input
              type="number"
              min="1"
              value={cols}
              onChange={handleColsChange}
              className="border rounded px-2 py-1 w-20 ml-2"
            />
          </div>
        </div>

        <div className="overflow-auto max-h-[350px] border rounded">
          <table className="w-full border-collapse">
            <tbody>
              {tableData.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border p-1">
                      <input
                        value={cell}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        className="w-full outline-none px-2 py-1"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={generateLatexTable}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};

const MathEditor = ({
  value = "",
  onChange,
  placeholder = "Type here...",
  className = "",
}) => {
  const mathFieldRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);

  useEffect(() => {
    const mf = mathFieldRef.current;

    if (!mf) return;

    mf.defaultMode = "text";
    mf.mode = "text";
    mf.value = value || "";

    const handleInput = () => {
      onChange?.(mf.value);
    };

    mf.addEventListener("input", handleInput);

    return () => {
      mf.removeEventListener("input", handleInput);
    };
  }, []);

  useEffect(() => {
    if (mathFieldRef.current && mathFieldRef.current.value !== value) {
      mathFieldRef.current.value = value || "";
    }
  }, [value]);

  const insertTable = (latexTable) => {
    const mf = mathFieldRef.current;

    if (!mf) return;

    const newValue = `${mf.value}\n${latexTable}`;

    mf.value = newValue;
    onChange?.(newValue);

    mf.focus();
  };

  return (
    <>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
        >
          Insert Table
        </button>
      </div>

      <math-field
        ref={mathFieldRef}
        placeholder={placeholder}
        class={`
          w-full min-h-[52px]
          border border-gray-300
          rounded-lg
          px-3 py-2
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-300
          bg-white
          ${className}
        `}
        style={{
          display: "block",
        }}
      />

      {showTableModal && (
        <TableModal
          onInsert={insertTable}
          onClose={() => setShowTableModal(false)}
        />
      )}
    </>
  );
};

export default MathEditor;
