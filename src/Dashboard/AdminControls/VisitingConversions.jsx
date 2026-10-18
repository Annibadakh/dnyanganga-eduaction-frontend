import { useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../Api";
import { DashboardContext } from "../../Context/DashboardContext";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";

// Admin review of visiting → registration conversions.
// Pending rows are system-suggested matches (visit vs. a later registration);
// Approve = converted, Reject = not converted. The decision is stored on the visit.
const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const formatDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "-");

const StrengthBadge = ({ strength }) =>
  strength ? (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
        strength === "STRONG" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {strength === "STRONG" ? "Strong" : "Weak"}
    </span>
  ) : null;

const VisitingConversions = () => {
  const { counsellor } = useContext(DashboardContext);
  const { successToast, errorToast } = useToast();

  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionKey, setActionKey] = useState(null); // `${visitId}-${action}` while saving

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState([]);
  const [strength, setStrength] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRows = () => {
    setLoading(true);
    api
      .get("/admin/visiting-conversions", {
        params: {
          status: tab,
          page: currentPage,
          limit: itemsPerPage,
          dateFrom,
          dateTo,
          counsellor: selectedCounsellor.map((c) => c.value).join(","),
          strength: tab === "pending" ? strength : "",
        },
      })
      .then((res) => {
        setRows(
          (res.data.data || []).map((r) => ({
            ...r,
            _key: `${r.visit.id}-${r.student?.studentId || "none"}`,
          })),
        );
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      })
      .catch((err) => {
        console.error(err);
        errorToast(err.response?.data?.message || "Failed to load conversions");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRows();
  }, [tab, currentPage, itemsPerPage, dateFrom, dateTo, selectedCounsellor, strength]); // eslint-disable-line

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, dateFrom, dateTo, selectedCounsellor, strength]);

  const review = async (row, action) => {
    const label = action === "approve" ? "converted" : "NOT converted";
    const ok = window.confirm(
      `Mark visit of ${row.visit.studentName} as ${label}` +
        (action === "approve" ? ` (registration ${row.student.studentId})?` : "?") +
        "\nThis decision cannot be changed later.",
    );
    if (!ok) return;

    setActionKey(`${row.visit.id}-${action}`);
    try {
      const res = await api.post(`/admin/visiting-conversions/${row.visit.id}/${action}`, {
        studentId: row.student.studentId,
      });
      successToast(res.data.message);
      fetchRows();
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Failed to save decision");
      fetchRows();
    } finally {
      setActionKey(null);
    }
  };

  const norm = (v) => String(v ?? "").trim();

  // side = "visit" | "student"; `other` is the record on the opposite side
  const personCell = (p, fields, side, other) => {
    if (!p) return "-";
    const green = (on, value) => (
      <span className={on ? "font-semibold text-green-700" : ""}>{value || "-"}</span>
    );
    const otherNumbers = other ? [norm(other.studentNo), norm(other.parentsNo)].filter(Boolean) : [];
    const numberMatches = (num) => !!norm(num) && otherNumbers.includes(norm(num));
    return (
      <div className="text-xs sm:text-sm leading-5 min-w-[180px]">
        <div>{green(fields.includes("Name"), p.studentName)}</div>
        <div>S: {green(numberMatches(p.studentNo), p.studentNo)}</div>
        <div>P: {green(numberMatches(p.parentsNo), p.parentsNo)}</div>
        <div className="text-gray-500">
          {p.standard || "-"} · {formatDate(p.date)}
        </div>
        <div className="text-gray-500">{p.counsellor || "-"}</div>
      </div>
    );
  };

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Visit",
      render: (row) => (
        <div>
          <div className="text-xs text-gray-400">#{row.visit.id}</div>
          {personCell(row.visit, row.matchedFields, "visit", row.student)}
        </div>
      ),
    },
    {
      header: "Registration",
      render: (row) => (
        <div>
          <div className="text-xs text-gray-400">{row.student?.studentId || "-"}</div>
          {personCell(row.student, row.matchedFields, "student", row.visit)}
        </div>
      ),
    },
    {
      header: "Matched On",
      render: (row) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <StrengthBadge strength={row.strength} />
          <div className="flex flex-wrap gap-1">
            {row.matchedFields.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                {f}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    tab === "pending"
      ? {
          header: "Actions",
          render: (row) => (
            <div className="flex items-center gap-2 flex-nowrap">
              <Button
                variant="success"
                startIcon={<CheckCircle2 size={16} />}
                loading={actionKey === `${row.visit.id}-approve`}
                disabled={!!actionKey}
                onClick={() => review(row, "approve")}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                startIcon={<XCircle size={16} />}
                loading={actionKey === `${row.visit.id}-reject`}
                disabled={!!actionKey}
                onClick={() => review(row, "reject")}
              >
                Reject
              </Button>
            </div>
          ),
        }
      : {
          header: "Reviewed",
          render: (row) => (
            <div className="text-xs sm:text-sm min-w-[120px]">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                  row.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {row.status === "APPROVED" ? "Converted" : "Not Converted"}
              </span>
              <div className="text-gray-600 mt-1">{row.reviewedBy || "-"}</div>
              <div className="text-gray-500">{formatDate(row.reviewedAt)}</div>
            </div>
          ),
        },
  ];

  const inputCls =
    "w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#094D9E] focus:border-[#094D9E] outline-none transition text-gray-700";

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Visiting Conversions</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.value ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <div className="w-full">
            <CustomMultiSelect
              label="Visit Counsellor"
              options={counsellor || []}
              value={selectedCounsellor}
              onChange={(v) => setSelectedCounsellor(v || [])}
              isRequired={false}
              placeholder="Select Counsellors"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit From</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Visit To</label>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                >
                  Clear Dates
                </button>
              )}
            </div>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputCls}
            />
          </div>
          {tab === "pending" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Match Strength</label>
              <select value={strength} onChange={(e) => setStrength(e.target.value)} className={`${inputCls} cursor-pointer`}>
                <option value="">All</option>
                <option value="STRONG">Strong (number match)</option>
                <option value="WEAK">Weak (name only)</option>
              </select>
            </div>
          )}
        </div>
        {tab === "pending" && (
          <p className="text-xs text-gray-500 mt-3">
            Suggested when a registration made on/after the visit matches its student number, parent
            number (cross-checked) or name. Approve = converted, Reject = not converted.
          </p>
        )}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        rowKey="_key"
        emptyMessage={tab === "pending" ? "No pending matches found." : `No ${tab} visits.`}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(v) => {
          setItemsPerPage(v);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default VisitingConversions;
