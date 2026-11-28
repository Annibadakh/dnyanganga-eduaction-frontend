import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../useToast";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import CustomSelect from "../Generic/CustomSelect";
import { StatusBadge, apiMessage, formatCode } from "./packageUtils";

// Package stock of a counsellor / sub-admin: counts per standard + Med/Grp, pamphlets, and
// every package (in stock, incoming, given to which student).
// Counsellor: own stock. Sub-admin: own + team. Admin / logistics: anyone.
const inputClass = "w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const PackageStock = () => {
  const { user } = useAuth();
  const { errorToast } = useToast();
  const isHeadOffice = ["admin", "logistics"].includes(user?.role);
  const isSubAdmin = user?.role === "sub-admin";

  const [people, setPeople] = useState([]);
  const peopleOptions = useMemo(
    () =>
      people.map((u) => ({
        value: u.uuid,
        label: `${u.name}${u.role === "sub-admin" ? " (Sub-admin)" : ""}${u.counsellorBranch ? ` - ${u.counsellorBranch}` : ""}`,
      })),
    [people],
  );
  const [userId, setUserId] = useState(isHeadOffice ? "" : user?.uuid || "");
  const [stock, setStock] = useState(null);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHeadOffice && !isSubAdmin) return;
    api
      .get("/packages/receivers")
      .then((r) => {
        const users = r.data.users || [];
        setPeople(isSubAdmin ? [{ uuid: user.uuid, name: `${user.name || "Me"} (Me)` }, ...users] : users);
      })
      .catch(() => setPeople([]));
  }, [isHeadOffice, isSubAdmin, user]);

  useEffect(() => {
    if (!userId) {
      setStock(null);
      return;
    }
    api
      .get("/packages/stock", { params: { userId } })
      .then((r) => setStock(r.data))
      .catch((e) => errorToast(apiMessage(e, "Couldn't load the stock")));
  }, [userId, errorToast]);

  const loadList = useCallback(async () => {
    if (!userId) {
      setList([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const r = await api.get("/packages/list", {
        params: { userId, page, limit, status: status || undefined, search: search.trim() || undefined },
      });
      setList(r.data.packages || []);
      setTotal(r.data.total || 0);
    } catch (e) {
      errorToast(apiMessage(e, "Couldn't load the packages"));
    } finally {
      setLoading(false);
    }
  }, [userId, page, limit, status, search, errorToast]);

  useEffect(() => {
    const t = setTimeout(loadList, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadList, search]);

  const totals = (stock?.groups || []).reduce(
    (t, g) => ({ inStock: t.inStock + g.inStock, incoming: t.incoming + g.incoming, distributed: t.distributed + g.distributed }),
    { inStock: 0, incoming: 0, distributed: 0 },
  );

  const columns = [
    { header: "Code", render: (p) => <span className="font-mono font-semibold">{formatCode(p.code)}</span> },
    { header: "Package", render: (p) => p.label },
    { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      header: "Student",
      render: (p) => (p.studentId ? `${p.studentName || ""} (${p.studentId})` : "-"),
    },
    { header: "Given On", render: (p) => (p.distributedAt ? new Date(p.distributedAt).toLocaleDateString("en-GB") : "-") },
  ];

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Book Package Stock</h1>

      {(isHeadOffice || isSubAdmin) && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <CustomSelect
            label="Viewing Stock Of"
            options={peopleOptions}
            value={peopleOptions.find((o) => o.value === userId) || null}
            onChange={(o) => {
              setUserId(o?.value || (isHeadOffice ? "" : user?.uuid || ""));
              setPage(1);
            }}
            isClearable={isHeadOffice}
            isRequired={false}
            placeholder={isHeadOffice ? "Search counsellor / sub-admin" : "Search your counsellor"}
          />
        </div>
      )}

      {stock && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white shadow-custom rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Packages in stock</p>
              <p className="text-2xl font-bold text-green-700">{totals.inStock}</p>
            </div>
            <div className="bg-white shadow-custom rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Incoming</p>
              <p className="text-2xl font-bold text-yellow-700">{totals.incoming}</p>
            </div>
            <div className="bg-white shadow-custom rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Given to students</p>
              <p className="text-2xl font-bold text-primary">{totals.distributed}</p>
            </div>
            <div className="bg-white shadow-custom rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Pamphlets in stock</p>
              <p className="text-2xl font-bold text-green-700">{stock.pamphlets.inStock}</p>
              {stock.pamphlets.incoming > 0 && <p className="text-xs text-yellow-700">+{stock.pamphlets.incoming} incoming</p>}
            </div>
          </div>

          <div className="bg-white shadow-custom rounded-lg mb-6 overflow-x-auto">
            <table className="w-full text-sm text-center border">
              <thead className="bg-primary text-white uppercase">
                <tr>
                  <th className="p-3 border text-left">Package</th>
                  <th className="p-3 border">In Stock</th>
                  <th className="p-3 border">Incoming</th>
                  <th className="p-3 border">Given</th>
                </tr>
              </thead>
              <tbody>
                {stock.groups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-gray-500">No packages yet.</td>
                  </tr>
                )}
                {stock.groups.map((g) => (
                  <tr key={g.label} className="border-b">
                    <td className="p-3 border text-left font-medium">{g.label}</td>
                    <td className="p-3 border font-semibold text-green-700">{g.inStock}</td>
                    <td className="p-3 border text-yellow-700">{g.incoming}</td>
                    <td className="p-3 border text-primary">{g.distributed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {userId && (
        <>
          <div className="bg-white p-3 md:p-4 shadow-custom mb-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Package code / student ID"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All</option>
                <option value="IN_STOCK">In stock</option>
                <option value="IN_TRANSIT">Incoming</option>
                <option value="DISTRIBUTED">Given</option>
              </select>
            </div>
          </div>
          <DataTable columns={columns} data={list} loading={loading} emptyMessage="No packages found" />
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
        </>
      )}
    </div>
  );
};

export default PackageStock;
