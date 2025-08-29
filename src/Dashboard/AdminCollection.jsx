import React, { useEffect, useState, Fragment, useRef } from "react";
import api from "../Api";
import { Dialog, Transition } from "@headlessui/react";

const AdminCollection = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [collection, setCollection] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const dropdownRef = useRef(null);

  // Settlement form
  const [commissionRate, setCommissionRate] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [settleResult, setSettleResult] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  // Proof modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState("");

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

  const handleSelectCounsellor = async (id, name) => {
    setSelectedCounsellor(id);
    setSearch(name);
    setIsDropdownOpen(false);
    setInternalSearch("");
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

  const handleSearchChange = (e) => {
    setInternalSearch(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setInternalSearch("");
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
      setInternalSearch("");
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      setBtnLoading(true);
      const res = await api.post("/counsellor/collection/settle", payload);
      setSettleResult(res.data?.settlement || null);
      fetchCollection(selectedCounsellor);
      fetchTransactions(selectedCounsellor);
    } catch (err) {
      console.error("Error settling collection:", err);
      alert(err?.response?.data?.message || "Failed to settle.");
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewProof = (url) => {
    if (url) {
      setSelectedProofUrl(`${imgUrl}${url}`);
      setShowProofModal(true);
    } else {
      alert("No proof image available.");
    }
  };

  // filter counsellors by internal search within dropdown
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(internalSearch.toLowerCase())
  );

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
        
        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={toggleDropdown}
            className="w-full p-2 border rounded-md cursor-pointer bg-white flex justify-between items-center hover:border-gray-400"
          >
            <span className={selectedCounsellor ? "text-black" : "text-gray-500"}>
              {search || "-- Select Counsellor --"}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown List */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
              {/* Search Input inside dropdown */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search counsellor..."
                  value={internalSearch}
                  onChange={handleSearchChange}
                  className="w-full p-2 border rounded-md text-sm"
                  autoFocus
                />
              </div>
              
              {/* Counsellor List */}
              <div className="max-h-40 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <>
                    <div 
                      onClick={() => handleSelectCounsellor("", "")}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                    >
                      -- Select Counsellor --
                    </div>
                    {filteredUsers.map((user) => (
                      <div
                        key={user.uuid}
                        onClick={() => handleSelectCounsellor(user.uuid, user.name)}
                        className={`p-2 hover:bg-gray-100 cursor-pointer ${
                          selectedCounsellor === user.uuid ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {user.name}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-2 text-gray-500 text-center">
                    No counsellors found matching "{internalSearch}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-center">Loading data...</p>}

      {/* Collection Summary */}
      {collection && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Collection Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Counsellor</th>
                  <th className="p-2 border whitespace-nowrap">Commission %</th>
                  <th className="p-2 border whitespace-nowrap">Total Amount</th>
                  <th className="p-2 border whitespace-nowrap">Actual Amount</th>
                  <th className="p-2 border whitespace-nowrap">Collected</th>
                  <th className="p-2 border whitespace-nowrap">Balance</th>
                  <th className="p-2 border whitespace-nowrap">Last Collected Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100">
                  <td className="p-2 border whitespace-nowrap">{collection.counsellorName}</td>
                  <td className="p-2 border whitespace-nowrap">{collection.commissionRate}%</td>
                  <td className="p-2 border whitespace-nowrap">₹{collection.totalAmount}</td>
                  <td className="p-2 border whitespace-nowrap">₹{collection.actualAmount}</td>
                  <td className="p-2 border whitespace-nowrap">₹{collection.collectedAmount}</td>
                  <td className="p-2 border whitespace-nowrap">₹{collection.balance}</td>
                  <td className="p-2 border whitespace-nowrap">
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
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Leave empty to use existing rate"
              />
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              {btnLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Calculate & Settle"
              )}
            </button>
          </form>

          {settleResult && (
            <div className="mt-6 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">Last Settlement</h3>
              <table className="min-w-full table-auto text-center border border-gray-300">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="p-2 border whitespace-nowrap">Range</th>
                    <th className="p-2 border whitespace-nowrap">Applied %</th>
                    <th className="p-2 border whitespace-nowrap">Temp Amount</th>
                    <th className="p-2 border whitespace-nowrap">Commission</th>
                    <th className="p-2 border whitespace-nowrap">Temp Actual</th>
                    <th className="p-2 border whitespace-nowrap">New Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="p-2 border whitespace-nowrap">{settleResult.range}</td>
                    <td className="p-2 border whitespace-nowrap">
                      {settleResult.appliedCommissionRate}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      ₹{settleResult.temporaryAmount}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      ₹{settleResult.commissionAmount}
                    </td>
                    <td className="p-2 border whitespace-nowrap">₹{settleResult.tempActual}</td>
                    <td className="p-2 border whitespace-nowrap">₹{settleResult.newBalance}</td>
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
            <table className="min-w-full table-auto text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Date</th>
                  <th className="p-2 border whitespace-nowrap">Amount Paid</th>
                  <th className="p-2 border whitespace-nowrap">Remark</th>
                  <th className="p-2 border whitespace-nowrap">Proof</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="p-2 border whitespace-nowrap">{txn.paymentDate}</td>
                    <td className="p-2 border whitespace-nowrap">₹{txn.amountPaid}</td>
                    <td className="p-2 border whitespace-nowrap">{txn.remark}</td>
                    <td className="p-2 border whitespace-nowrap">
                      {txn.proofUrl ? (
                        <button
                          onClick={() => handleViewProof(txn.proofUrl)}
                          className="text-blue-500 underline"
                        >
                          View Proof
                        </button>
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

      {/* Proof Modal */}
      <Transition appear show={showProofModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowProofModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-2 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white md:p-6 p-2 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Payment Proof
                  </Dialog.Title>
                  <div className="mt-4">
                    <img
                      src={selectedProofUrl}
                      alt="Proof"
                      className="max-h-[500px] w-full object-contain rounded border"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => setShowProofModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminCollection;