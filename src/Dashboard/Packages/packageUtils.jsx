import api from "../../Api";

// Shared helpers for the book package screens.

export const apiMessage = (err, fallback = "Something went wrong") => err?.response?.data?.message || fallback;

// "0TNBDMG100X8" -> "0TNB-DMG1-00X8"
export const formatCode = (code) => String(code || "").replace(/(.{4})(?=.)/g, "$1-");

// Typed code -> canonical (same rule as the server: upper case, no dashes, O->0, I/L->1)
export const normalizeCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");

// Code inside a scanned QR ("DG1|std|branch|code") or a typed code
export const codeOfScan = (text) => {
  const parts = String(text || "").trim().split("|");
  return normalizeCode(parts.length === 4 && parts[0] === "DG1" ? parts[3] : text);
};

export const PACKAGE_TYPE_LABEL = { NONE: "No package", COMMON: "Common", BRANCH: "Group / medium wise" };

export const STATUS_LABEL = {
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  IN_TRANSIT: "Incoming",
  IN_STOCK: "In stock",
  DISTRIBUTED: "Given",
};

export const STATUS_CLASS = {
  DISPATCHED: "bg-yellow-100 text-yellow-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-800",
  IN_STOCK: "bg-green-100 text-green-800",
  DISTRIBUTED: "bg-blue-100 text-blue-800",
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASS[status] || "bg-gray-100"}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

// Standards that have a package (id, name, normalizeName, packageType, branches)
export const loadPackageStandards = () => api.get("/packages/standards").then((r) => r.data.standards || []);

// Open the challan PDF (blob URL) — caller shows it in PdfViewerModal
export const fetchChallanPdfUrl = async (id) => {
  const res = await api.get(`/packages/challans/${id}/pdf`, { responseType: "blob" });
  return window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
};

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
