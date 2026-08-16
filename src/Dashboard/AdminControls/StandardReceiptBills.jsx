import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../Api";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash,
  ReceiptText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const inputCls = "w-full p-1.5 border border-gray-300 rounded text-sm";

let uidCounter = 0;
const genKey = () => `row_${Date.now()}_${uidCounter++}`;

// Per-bill payable, matching the GST receipt PDF: amount + CGST + SGST,
// rounded to the nearest rupee so a .50 never blocks an exact match.
const rowGrandTotal = (r) => {
  const amt = Number(r.amount) || 0;
  const cgst = Number(r.cgst) || 0;
  const sgst = Number(r.sgst) || 0;
  return Math.round(amt * (1 + cgst / 100 + sgst / 100));
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const toRows = (bills) =>
  bills.map((b) => ({
    _uid: genKey(),
    id: b.id,
    type: b.type || "NON_GST",
    desc: b.desc || "",
    code: b.code || "",
    quantity: b.quantity ?? 1,
    amount: b.amount ?? "",
    cgst: b.cgst ?? 0,
    sgst: b.sgst ?? 0,
    note: Array.isArray(b.note) ? b.note.join("\n") : b.note || "",
    sortOrder: b.sortOrder ?? 0,
  }));

function StandardReceiptBills() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { successToast, errorToast } = useToast();

  const [standard, setStandard] = useState(location.state?.standard || null);
  const [totalFees, setTotalFees] = useState("");
  const [bills, setBills] = useState([]);
  const [loader, setLoader] = useState(true);
  const [saveLoader, setSaveLoader] = useState(false);
  const [lastSaved, setLastSaved] = useState("");

  const fetchStandard = useCallback(async () => {
    try {
      const { data } = await api.get("/simple/standards");
      const found = (data?.data || []).find((s) => String(s.id) === String(id));
      if (found) {
        setStandard(found);
        setTotalFees(found.totalFees ?? "");
      }
    } catch {
      errorToast("Failed to load standard");
    }
  }, [id, errorToast]);

  const fetchBills = useCallback(async () => {
    setLoader(true);
    try {
      const { data } = await api.get("/admin/receipt/bills", {
        params: { standardId: id },
      });
      const rows = toRows(data?.data || []);
      setBills(rows);
      setLastSaved(
        JSON.stringify({
          fees: Number(standard?.totalFees) || 0,
          bills: rows,
        }),
      );
    } catch {
      errorToast("Failed to load bills");
    } finally {
      setLoader(false);
    }
  }, [id, standard, errorToast]);

  useEffect(() => {
    if (!standard) fetchStandard();
    else setTotalFees(standard.totalFees ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard]);

  useEffect(() => {
    if (standard) fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard]);

  const updateRow = (uid, patch) =>
    setBills((prev) => prev.map((r) => (r._uid === uid ? { ...r, ...patch } : r)));

  const addRow = () =>
    setBills((prev) => [
      ...prev,
      {
        _uid: genKey(),
        id: null,
        type: "NON_GST",
        desc: "",
        code: "",
        quantity: 1,
        amount: "",
        cgst: 0,
        sgst: 0,
        note: "",
        sortOrder: prev.length,
      },
    ]);

  const removeRow = (uid) =>
    setBills((prev) => prev.filter((r) => r._uid !== uid));

  const total = bills.reduce((acc, r) => acc + rowGrandTotal(r), 0);
  const feesNum = Number(totalFees) || 0;
  const sumPaise = Math.round(total * 100);
  const feesPaise = Math.round(feesNum * 100);
  const match = sumPaise === feesPaise;
  const diff = (sumPaise - feesPaise) / 100;

  const allValid =
    bills.length > 0 &&
    feesNum > 0 &&
    bills.every(
      (r) =>
        String(r.desc).trim() &&
        String(r.code).trim() &&
        (Number(r.amount) || 0) > 0,
    );

  const dirty =
    JSON.stringify({ fees: feesNum, bills }) !== lastSaved;

  const handleSave = async () => {
    if (!match) {
      errorToast(
        `Bill total (${inr(total)}) does not match totalFees (${inr(feesNum)}). Adjust before saving.`,
      );
      return;
    }
    setSaveLoader(true);
    try {
      const { data } = await api.put(`/admin/receipt/bills/standard/${id}`, {
        totalFees: feesNum,
        bills: bills.map((r) => ({
          type: r.type,
          desc: r.desc,
          code: r.code,
          quantity: Number(r.quantity) || 1,
          amount: Number(r.amount) || 0,
          cgst: Number(r.cgst) || 0,
          sgst: Number(r.sgst) || 0,
          note: r.note
            .split("\n")
            .map((n) => n.trim())
            .filter(Boolean),
          sortOrder: Number(r.sortOrder) || 0,
        })),
      });
      const saved = toRows(data?.data?.bills || []);
      setBills(saved);
      setStandard((prev) => ({ ...prev, totalFees: data.data.standard.totalFees }));
      setTotalFees(data.data.standard.totalFees);
      setLastSaved(
        JSON.stringify({
          fees: Number(data.data.standard.totalFees) || 0,
          bills: saved,
        }),
      );
      successToast("Receipt bills saved successfully");
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to save receipt bills");
    } finally {
      setSaveLoader(false);
    }
  };

  const billColumns = [
    {
      header: "Type",
      cellClass: "min-w-[110px]",
      render: (r) => (
        <select
          value={r.type}
          onChange={(e) => updateRow(r._uid, { type: e.target.value })}
          className={inputCls}
        >
          <option value="NON_GST">NON_GST</option>
          <option value="GST">GST</option>
        </select>
      ),
    },
    {
      header: "Description",
      cellClass: "min-w-[260px]",
      render: (r) => (
        <input
          type="text"
          value={r.desc}
          onChange={(e) => updateRow(r._uid, { desc: e.target.value })}
          className={`${inputCls} min-w-[240px]`}
          placeholder="Bill description"
        />
      ),
    },
    {
      header: "HSN Code",
      cellClass: "min-w-[120px]",
      render: (r) => (
        <input
          type="text"
          value={r.code}
          onChange={(e) => updateRow(r._uid, { code: e.target.value })}
          className={`${inputCls} min-w-[110px]`}
          placeholder="HSN/SAC"
        />
      ),
    },
    {
      header: "Qty",
      cellClass: "min-w-[90px]",
      render: (r) => (
        <input
          type="number"
          value={r.quantity}
          min={1}
          onChange={(e) => updateRow(r._uid, { quantity: e.target.value })}
          className={`${inputCls} w-20`}
          onWheel={(e) => e.target.blur()}
        />
      ),
    },
    {
      header: "Amount",
      cellClass: "min-w-[110px]",
      render: (r) => (
        <input
          type="number"
          value={r.amount}
          min={0}
          step="0.01"
          onChange={(e) => updateRow(r._uid, { amount: e.target.value })}
          className={`${inputCls} w-28`}
          onWheel={(e) => e.target.blur()}
        />
      ),
    },
    {
      header: "CGST%",
      cellClass: "min-w-[90px]",
      render: (r) => (
        <input
          type="number"
          value={r.cgst}
          min={0}
          step="0.01"
          onChange={(e) => updateRow(r._uid, { cgst: e.target.value })}
          className={`${inputCls} w-20`}
          onWheel={(e) => e.target.blur()}
        />
      ),
    },
    {
      header: "SGST%",
      cellClass: "min-w-[90px]",
      render: (r) => (
        <input
          type="number"
          value={r.sgst}
          min={0}
          step="0.01"
          onChange={(e) => updateRow(r._uid, { sgst: e.target.value })}
          className={`${inputCls} w-20`}
          onWheel={(e) => e.target.blur()}
        />
      ),
    },
    {
      header: "Total (incl. tax)",
      render: (r) => (
        <span className="font-semibold whitespace-nowrap">
          {inr(rowGrandTotal(r))}
        </span>
      ),
    },
    {
      header: "Order",
      render: (r) => (
        <input
          type="number"
          value={r.sortOrder}
          onChange={(e) => updateRow(r._uid, { sortOrder: e.target.value })}
          className={`${inputCls} w-16`}
          onWheel={(e) => e.target.blur()}
        />
      ),
    },
    {
      header: "Remove",
      render: (r) => (
        <Button
          variant="danger"
          onClick={() => removeRow(r._uid)}
          startIcon={<Trash size={14} />}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            <span className="inline-flex items-center gap-2">
              <ReceiptText size={22} />
              Receipt Bills — {standard?.name || `Standard #${id}`}
            </span>
          </h1>
        </div>
        <Button
          variant="primary"
          startIcon={<Save size={16} />}
          loading={saveLoader}
          disabled={!match || !allValid}
          onClick={handleSave}
        >
          Save Bills
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
        Changes apply only to receipts generated from today onward. Students
        already registered keep their existing saved receipts unchanged. If a
        standard previously had no bills configured, run the backfill script
        afterwards so eligible students pick up the new bills.
      </div>

      {loader ? (
        <p className="text-center text-gray-500 p-4">Loading...</p>
      ) : (
        <div className="bg-white md:p-6 p-3 rounded shadow-custom">
          {/* Fees + sum status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-customblack">
                Total Fees (totalFees)*
              </label>
              <input
                type="number"
                value={totalFees}
                min={0}
                step="0.01"
                onChange={(e) => setTotalFees(e.target.value)}
                className={inputCls}
                onWheel={(e) => e.target.blur()}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-customblack">
                Sum of Bills (incl. CGST + SGST)
              </label>
              <div className="p-1.5 text-sm font-semibold bg-gray-100 rounded">
                {inr(total)}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-customblack">
                Match Status
              </label>
              <div
                className={`p-1.5 rounded text-sm font-bold flex items-center gap-2 ${
                  match ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {match ? (
                  <>
                    <CheckCircle2 size={16} /> Exact Match
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> Mismatch — {inr(Math.abs(diff))} {diff > 0 ? "over" : "short"}
                  </>
                )}
              </div>
            </div>
          </div>

          {!match && allValid && (
            <p className="text-sm text-red-600 mb-4">
              Adjust the bills or the total fees until the sum of bills (incl.
              tax) exactly matches totalFees. Saving is locked until then.
            </p>
          )}

          {bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No receipt bills configured for this standard yet. Add one to
              enable the GST receipt.
            </div>
          ) : (
            <div className="overflow-x-auto mb-4">
              <DataTable
                columns={billColumns}
                data={bills}
                rowKey="_uid"
                emptyMessage="No receipt bills configured for this standard yet. Add one to enable the GST receipt."
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="success"
              startIcon={<Plus size={16} />}
              onClick={addRow}
            >
              Add Bill
            </Button>
            {dirty && (
              <span className="text-sm text-orange-600 font-medium">
                You have unsaved changes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StandardReceiptBills;
