import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, X } from "lucide-react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import CustomSelect from "../Generic/CustomSelect";
import PdfViewerModal from "../Generic/PdfViewerModal";
import FileUpload from "../FileUpload/FileUpload";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import { fileUrl } from "../../utils/fileUrl";
import { StatusBadge, apiMessage, fetchChallanPdfUrl, formatCode } from "./packageUtils";

// Challan Management: list + filters, details, PDF, edit / cancel (sender, while dispatched),
// one-click Delivered and receiver receipt (receiver only).
const inputClass = "w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

const ChallanDetails = ({ id, onClose }) => {
  const { errorToast } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/packages/challans/${id}`)
      .then((r) => setData(r.data))
      .catch((e) => {
        errorToast(apiMessage(e, "Couldn't load the challan"));
        onClose();
      });
    // load once per challan; onClose is only used on failure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const c = data?.challan;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary text-white py-3 px-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold">Challan {c?.challanNo || ""}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        {!c ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="p-4 overflow-y-auto space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p><b>Status:</b> <StatusBadge status={c.status} /></p>
              <p><b>Date:</b> {fmtDate(c.challanDate)}</p>
              <p><b>From:</b> {c.fromName}</p>
              <p><b>To:</b> {c.toName}</p>
              <p><b>Manual No:</b> {c.manualChallanNo || "-"}</p>
              <p><b>Pamphlets:</b> {c.pamphletCount}</p>
              {c.remarks && <p className="sm:col-span-2"><b>Remarks:</b> {c.remarks}</p>}
              {c.deliveredAt && <p><b>Delivered:</b> {fmtDate(c.deliveredAt)}</p>}
              {c.cancelledAt && <p><b>Cancelled:</b> {fmtDate(c.cancelledAt)}</p>}
              {c.senderReceiptUrl && (
                <a className="text-primary underline" href={fileUrl(c.senderReceiptUrl)} target="_blank" rel="noreferrer">Sender receipt</a>
              )}
              {c.receiverReceiptUrl && (
                <a className="text-primary underline" href={fileUrl(c.receiverReceiptUrl)} target="_blank" rel="noreferrer">Receiver receipt</a>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-2">Packages ({c.packageCount})</h3>
              {c.groups.length === 0 && <p className="text-gray-500">No packages{c.status === "CANCELLED" ? " (cancelled)" : ""}.</p>}
              <div className="flex flex-wrap gap-2">
                {c.groups.map((g) => (
                  <span key={g.label} className="bg-blue-50 border border-blue-200 text-primary rounded-full px-3 py-1">
                    {g.label}: <b>{g.count}</b>
                  </span>
                ))}
              </div>
            </div>

            {data.packages.length > 0 && (
              <ul className="divide-y border rounded-lg">
                {data.packages.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2 gap-2">
                    <div>
                      <p className="font-mono font-semibold">{formatCode(p.code)}</p>
                      <p className="text-xs text-gray-500">
                        {p.label}
                        {p.studentId ? ` · given to ${p.studentName || ""} (${p.studentId})` : ""}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

const ReceiverReceiptModal = ({ challan, onClose, onSaved }) => {
  const { successToast, errorToast } = useToast();
  const upload = FileUploadHook();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!url) return errorToast("Upload the receipt first");
    setSaving(true);
    try {
      const r = await api.put(`/packages/challans/${challan.id}/receiver-receipt`, { receiverReceiptUrl: url });
      successToast(r.data.message);
      onSaved();
    } catch (e) {
      errorToast(apiMessage(e, "Couldn't save the receipt"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-primary">Receiver Receipt · {challan.challanNo}</h2>
        <FileUpload
          title="Receiver Receipt"
          imageUrl={upload.imageUrl}
          error={upload.error}
          loader={upload.loader}
          isSaved={upload.isSaved}
          imageType="challan"
          onFileUpload={upload.handleFileUpload}
          onUploadImage={async (type) => {
            const u = await upload.uploadImage(type);
            if (u) setUrl(u);
          }}
          onRemovePhoto={() => {
            upload.removePhoto();
            setUrl("");
          }}
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>Close</Button>
          <Button onClick={save} loading={saving} fullWidth>Save</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ChallanList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { successToast, errorToast } = useToast();
  const isHeadOffice = ["admin", "logistics"].includes(user?.role);
  const isSubAdmin = user?.role === "sub-admin";
  const canCreate = isHeadOffice || isSubAdmin;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({ status: "", from: "", to: "", search: "", userId: "", direction: "" });
  const [people, setPeople] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [receiptFor, setReceiptFor] = useState(null);
  const [pdf, setPdf] = useState(null); // { url, name }

  const peopleOptions = people.map((u) => ({
    value: u.uuid,
    label: `${u.name}${u.role === "sub-admin" ? " (Sub-admin)" : ""}${u.counsellorBranch ? ` - ${u.counsellorBranch}` : ""}`,
  }));

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  useEffect(() => {
    if (!canCreate) return;
    api.get("/packages/receivers").then((r) => setPeople(r.data.users || [])).catch(() => setPeople([]));
  }, [canCreate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const r = await api.get("/packages/challans", { params });
      setRows(r.data.challans || []);
      setTotal(r.data.total || 0);
    } catch (e) {
      errorToast(apiMessage(e, "Couldn't load challans"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, errorToast]);

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, filters.search]);

  const act = async (row, action) => {
    const question =
      action === "deliver"
        ? `Mark ${row.challanNo} as delivered? Its ${row.packageCount} package(s) and ${row.pamphletCount} pamphlet(s) will be added to your stock.`
        : `Cancel ${row.challanNo}? Its packages will be removed from this challan.`;
    if (!window.confirm(question)) return;
    setBusyId(row.id);
    try {
      const r = await api.post(`/packages/challans/${row.id}/${action}`);
      successToast(r.data.message);
      load();
    } catch (e) {
      errorToast(apiMessage(e, "Action failed"));
    } finally {
      setBusyId(null);
    }
  };

  const openPdf = async (row) => {
    setBusyId(row.id);
    try {
      setPdf({ url: await fetchChallanPdfUrl(row.id), name: `${row.challanNo}.pdf` });
    } catch {
      errorToast("Couldn't open the PDF");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { header: "Challan No", render: (r) => <span className="font-semibold">{r.challanNo}</span> },
    { header: "Date", render: (r) => fmtDate(r.challanDate) },
    { header: "From", render: (r) => r.fromName },
    { header: "To", render: (r) => r.toName },
    {
      header: "Packages",
      render: (r) => (
        <div className="text-left">
          <b>{r.packageCount}</b>
          {r.groups.map((g) => (
            <div key={g.label} className="text-xs text-gray-500">{g.label}: {g.count}</div>
          ))}
        </div>
      ),
    },
    { header: "Pamphlets", render: (r) => r.pamphletCount },
    { header: "Manual No", render: (r) => r.manualChallanNo || "-" },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2 justify-center flex-wrap">
          <button type="button" onClick={() => setDetailsId(r.id)} className="p-2 text-primary hover:bg-blue-50 rounded" aria-label="View">
            <Eye size={18} />
          </button>
          <button type="button" onClick={() => openPdf(r)} disabled={busyId === r.id} className="p-2 text-primary hover:bg-blue-50 rounded" aria-label="PDF">
            <FileText size={18} />
          </button>
          {r.status === "DISPATCHED" && r.canDeliver && (
            <Button variant="success" className="px-3 py-1 text-sm" loading={busyId === r.id} onClick={() => act(r, "deliver")}>
              Delivered
            </Button>
          )}
          {r.status === "DISPATCHED" && r.canManage && (
            <>
              <Button variant="info" className="px-3 py-1 text-sm" onClick={() => navigate(`/dashboard/chalan/${r.id}/edit`)}>
                Edit
              </Button>
              <Button variant="danger" className="px-3 py-1 text-sm" loading={busyId === r.id} onClick={() => act(r, "cancel")}>
                Cancel
              </Button>
            </>
          )}
          {r.status === "DELIVERED" && r.canDeliver && !r.receiverReceiptUrl && (
            <Button variant="outline" className="px-3 py-1 text-sm" onClick={() => setReceiptFor(r)}>
              Receipt
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-1 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Challan Management</h1>

      {canCreate && (
        <button
          type="button"
          onClick={() => navigate("/dashboard/chalan/new")}
          className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-4 transition"
        >
          Create Challan
        </button>
      )}

      <div className="bg-white p-3 md:p-4 shadow-custom mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Challan no / manual no"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={inputClass}>
            <option value="">All</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">From</label>
          <input type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">To</label>
          <input type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} className={inputClass} />
        </div>
        {isSubAdmin && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Show</label>
            <select value={filters.direction} onChange={(e) => setFilter("direction", e.target.value)} className={inputClass}>
              <option value="">All</option>
              <option value="in">Received by me</option>
              <option value="out">Sent by me</option>
            </select>
          </div>
        )}
        {canCreate && (
          <div className={isSubAdmin ? "col-span-2 md:col-span-6" : "col-span-2 md:col-span-6"}>
            <CustomSelect
              label={isHeadOffice ? "Counsellor / Sub-admin" : "Counsellor"}
              options={peopleOptions}
              value={peopleOptions.find((o) => o.value === filters.userId) || null}
              onChange={(o) => setFilter("userId", o?.value || "")}
              isRequired={false}
              placeholder="All (type to search)"
            />
          </div>
        )}
      </div>

      <DataTable columns={columns} data={rows} loading={loading} emptyMessage="No challans found" />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={(n) => {
          setLimit(n);
          setPage(1);
        }}
      />

      {detailsId && <ChallanDetails id={detailsId} onClose={() => setDetailsId(null)} />}
      {receiptFor && (
        <ReceiverReceiptModal
          challan={receiptFor}
          onClose={() => setReceiptFor(null)}
          onSaved={() => {
            setReceiptFor(null);
            load();
          }}
        />
      )}
      <PdfViewerModal
        isOpen={!!pdf}
        pdfUrl={pdf?.url}
        fileName={pdf?.name}
        title="Delivery Challan"
        onClose={() => {
          if (pdf?.url) window.URL.revokeObjectURL(pdf.url);
          setPdf(null);
        }}
      />
    </div>
  );
};

export default ChallanList;
