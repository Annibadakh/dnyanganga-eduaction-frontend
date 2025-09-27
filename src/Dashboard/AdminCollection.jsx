import React, { useEffect, useState, Fragment, useRef } from "react";
import api from "../Api";
import { Dialog, Transition } from "@headlessui/react";

const AdminCollection = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filter states
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [remarkFilter, setRemarkFilter] = useState(""); // New remark filter

  // User dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const dropdownRef = useRef(null);

  // Proof modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/getUser");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/counsellor/collection/AllTransactions`);
      // console.log(res.data);
      setTransactions(res.data || []);
      setFilteredTransactions(res.data || []);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  const handleSelectUser = (uuid, name) => {
    setSelectedUser(uuid);
    setSelectedUserName(name);
    setIsDropdownOpen(false);
    setUserSearch("");
  };

  const handleUserSearchChange = (e) => {
    setUserSearch(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setUserSearch("");
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
      setUserSearch("");
    }
  };

  const clearFilters = () => {
    setSelectedUser("");
    setSelectedUserName("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("");
    setRemarkFilter(""); // Clear remark filter
    setFilteredTransactions(transactions);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by user
    if (selectedUser) {
      filtered = filtered.filter(txn => txn.counsellorId === selectedUser);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(txn => {
        const txnDate = new Date(txn.paymentDate);
        const start = new Date(startDate);
        return txnDate >= start;
      });
    }

    if (endDate) {
      filtered = filtered.filter(txn => {
        const txnDate = new Date(txn.paymentDate);
        const end = new Date(endDate);
        return txnDate <= end;
      });
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(txn => txn.verifyStatus === statusFilter);
    }

    // Filter by remark
    if (remarkFilter) {
      filtered = filtered.filter(txn => {
        if (remarkFilter === "Other") {
          // For "Other", check if remark starts with "Other:"
          return txn.remark && txn.remark.startsWith("Other:");
        } else {
          // For specific options, match exactly
          return txn.remark === remarkFilter;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedUser, startDate, endDate, statusFilter, remarkFilter, transactions]); // Added remarkFilter dependency

  const handleViewProof = (url) => {
    if (url) {
      setSelectedProofUrl(`${imgUrl}${url}`);
      setShowProofModal(true);
    } else {
      alert("No proof image available.");
    }
  };

  const changeStatus = async (id, status) => {
    // console.log(id, status);
    try {
      const res = await api.put(`/counsellor/collection/verifyPayment/${id}`, { status });
      alert(res.data.message);
      fetchTransactions();
    } catch (err) {
      console.error("Error changing status", err);
      alert("Error changing status");
    }
  };

  // Calculate statistics based on filtered transactions
  const calculateStats = () => {
    const stats = filteredTransactions.reduce((acc, txn) => {
      const amount = parseFloat(txn.amountPaid) || 0;
      acc.totalAmount += amount;
      
      if (txn.verifyStatus === 'verified') {
        acc.approvedAmount += amount;
      } else if (txn.verifyStatus === 'rejected') {
        acc.rejectedAmount += amount;
      } else {
        acc.pendingAmount += amount;
      }
      
      return acc;
    }, {
      totalAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0
    });

    return stats;
  };

  const stats = calculateStats();

  // Filter users by search within dropdown
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Collection Management
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4"> {/* Changed to 5 columns */}
          {/* User Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Counsellor
            </label>
            <div 
              onClick={toggleDropdown}
              className="w-full p-2 border rounded-md cursor-pointer bg-white flex justify-between items-center hover:border-gray-400"
            >
              <span className={selectedUser ? "text-black" : "text-gray-500"}>
                {selectedUserName || "-- Select Counsellor --"}
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

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search counsellor..."
                    value={userSearch}
                    onChange={handleUserSearchChange}
                    className="w-full p-2 border rounded-md text-sm"
                    autoFocus
                  />
                </div>
                
                <div className="max-h-40 overflow-y-auto">
                  <div 
                    onClick={() => handleSelectUser("", "")}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                  >
                    -- All Counsellors --
                  </div>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.uuid}
                        onClick={() => handleSelectUser(user.uuid, user.name)}
                        className={`p-2 hover:bg-gray-100 cursor-pointer ${
                          selectedUser === user.uuid ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {user.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-center">
                      No counsellors found matching "{userSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- All Status --</option>
              <option value="pending">Pending</option>
              <option value="verified">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Remark Filter - NEW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remark
            </label>
            <select
              value={remarkFilter}
              onChange={(e) => setRemarkFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- All Remarks --</option>
              <option value="Dnyanganga Axis Bank">Dnyanganga Axis Bank</option>
              <option value="Dnyanganga Yes Bank">Dnyanganga Yes Bank</option>
              <option value="Amol Sir Personal">Amol Sir Personal</option>
              <option value="Sagar Sir Personal">Sagar Sir Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Amount</p>
                <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Approved Amount */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved Amount</p>
                <p className="text-2xl font-bold">₹{stats.approvedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Rejected Amount */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rejected Amount</p>
                <p className="text-2xl font-bold">₹{stats.rejectedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Transaction History ({filteredTransactions.length} records)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Sr. No.</th>
                  <th className="p-2 border whitespace-nowrap">Date</th>
                  <th className="p-2 border whitespace-nowrap">Counsellor Name</th>
                  <th className="p-2 border whitespace-nowrap">Amount Paid</th>
                  <th className="p-2 border whitespace-nowrap">Remark</th>
                  <th className="p-2 border whitespace-nowrap">Proof</th>
                  <th className="p-2 border whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="p-2 border whitespace-nowrap">{idx+1}</td>
                    <td className="p-2 border whitespace-nowrap">{new Date(txn.paymentDate).toLocaleDateString('en-GB')}</td>
                    <td className="p-2 border whitespace-nowrap">{txn.User.name}</td>
                    <td className="p-2 border whitespace-nowrap">₹{txn.amountPaid.toLocaleString('en-IN')}</td>
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
                    <td className="p-2 border whitespace-nowrap">
                      {txn.verifyStatus == 'verified' ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (txn.verifyStatus == "rejected" ? (
                        <span className="text-red-600 font-semibold">Rejected</span>
                      ) : (
                        <div className="space-x-2">
                          <button 
                            onClick={() => changeStatus(txn.id, "verified")}
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => changeStatus(txn.id, "rejected")}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6 text-center">
          <p className="text-gray-600">No transactions found matching the selected filters!</p>
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