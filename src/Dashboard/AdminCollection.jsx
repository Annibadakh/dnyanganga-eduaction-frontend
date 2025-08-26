import React, { useEffect, useState } from "react";
import api from "../Api";

const AdminCollection = () => {
  const [users, setUsers] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [collection, setCollection] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Settlement form
  const [commissionRate, setCommissionRate] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [settleResult, setSettleResult] = useState(null);

  // Fetch counsellors
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/getUser?role=counsellor");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchCollection = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/counsellor/collection/${id}`);
      setCollection(res.data);
    } catch (err) {
      console.error("Error fetching collection", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (id) => {
    try {
      const res = await api.get(`/counsellor/collection/payments/${id}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  const handleSelectCounsellor = async (id) => {
    setSelectedCounsellor(id);
    setCollection(null);
    setTransactions([]);
    setSettleResult(null);
    setCommissionRate("");
    setSettlementDate("");
    if (id) {
      await fetchCollection(id);
      await fetchTransactions(id);
    }
  };

  const isPastDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return false;
    return new Date(yyyyMmDd) < new Date(new Date().toDateString());
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!selectedCounsellor) return alert("Please select a counsellor.");
    if (!settlementDate) return alert("Please select a settlement date.");
    if (!isPastDate(settlementDate)) {
      return alert("Settlement date must be earlier than today.");
    }

    const payload = {
      counsellorId: selectedCounsellor,
      settlementDate,
      commissionRate: commissionRate === "" ? undefined : Number(commissionRate),
    };

    try {
      const res = await api.post("/counsellor/collection/settle", payload);
      setSettleResult(res.data?.settlement || null);
      fetchCollection(selectedCounsellor);
      fetchTransactions(selectedCounsellor);
    } catch (err) {
      console.error("Error settling collection:", err);
      alert(err?.response?.data?.message || "Failed to settle.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Collection Management
      </h1>

      {/* Select Counsellor */}
      <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Select Counsellor
        </h2>
        <select
          value={selectedCounsellor}
          onChange={(e) => handleSelectCounsellor(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">-- Select Counsellor --</option>
          {users.map((u) => (
            <option key={u.uuid} value={u.uuid}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center">Loading data...</p>}

      {/* Collection Summary */}
      {collection && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Collection Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Counsellor</th>
                  <th className="p-2 border">Commission %</th>
                  <th className="p-2 border">Total Amount</th>
                  <th className="p-2 border">Actual Amount</th>
                  <th className="p-2 border">Collected</th>
                  <th className="p-2 border">Balance</th>
                  <th className="p-2 border">Last Collected Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100">
                  <td className="p-2 border">{collection.counsellorName}</td>
                  <td className="p-2 border">{collection.commissionRate}%</td>
                  <td className="p-2 border">₹{collection.totalAmount}</td>
                  <td className="p-2 border">₹{collection.actualAmount}</td>
                  <td className="p-2 border">₹{collection.collectedAmount}</td>
                  <td className="p-2 border">₹{collection.balance}</td>
                  <td className="p-2 border">
                    {collection.lastCollectedDate || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Settlement Form */}
      {selectedCounsellor && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Admin Settlement
          </h2>
          <form onSubmit={handleSettle} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Settlement Date</label>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be earlier than today. System calculates from last
                collected date to this date.
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Commission % (optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Leave empty to use existing rate"
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Calculate & Settle
            </button>
          </form>

          {settleResult && (
            <div className="mt-6 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">Last Settlement</h3>
              <table className="table-auto w-full text-center border border-gray-300">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="p-2 border">Range</th>
                    <th className="p-2 border">Applied %</th>
                    <th className="p-2 border">Temp Amount</th>
                    <th className="p-2 border">Commission</th>
                    <th className="p-2 border">Temp Actual</th>
                    <th className="p-2 border">New Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="p-2 border">{settleResult.range}</td>
                    <td className="p-2 border">
                      {settleResult.appliedCommissionRate}
                    </td>
                    <td className="p-2 border">
                      ₹{settleResult.temporaryAmount}
                    </td>
                    <td className="p-2 border">
                      ₹{settleResult.commissionAmount}
                    </td>
                    <td className="p-2 border">₹{settleResult.tempActual}</td>
                    <td className="p-2 border">₹{settleResult.newBalance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Transaction History
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount Paid</th>
                  <th className="p-2 border">Proof</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="p-2 border">{txn.paymentDate}</td>
                    <td className="p-2 border">₹{txn.amountPaid}</td>
                    <td className="p-2 border">
                      {txn.proofUrl ? (
                        <a
                          href={txn.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Proof
                        </a>
                      ) : (
                        "No Proof"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCounsellor && !loading && !collection && (
        <p className="text-center text-gray-500">
          No collection record found for this counsellor.
        </p>
      )}
    </div>
  );
};

export default AdminCollection;
