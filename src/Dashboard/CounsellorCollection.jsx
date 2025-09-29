import React, { useEffect, useState, Fragment, useMemo } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { FileUploadHook } from "./FileUploadHook";
import FileUpload from "./FileUpload";
import { Dialog, Transition } from "@headlessui/react";

const CounsellorCollection = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [settleAmount, setSettleAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [customRemark, setCustomRemark] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [error, setError] = useState("");
  const [submitLoader, setSubmitLoader] = useState(false);

  // File upload hook
  const paymentProof = FileUploadHook();
  const [formData, setFormData] = useState({ proofUrl: "" });

  // Modal state for proof view
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  const [proofLoading, setProofLoading] = useState(false); // loader for proof
  const [showForm, setShowForm] = useState(false); // Show/hide settlement form

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const imgUrl = import.meta.env.VITE_IMG_URL;

  // Filter transactions based on status and date
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(txn => txn.verifyStatus === statusFilter);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(txn => new Date(txn.paymentDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(txn => new Date(txn.paymentDate) <= new Date(dateTo));
    }

    return filtered;
  }, [transactions, statusFilter, dateFrom, dateTo]);

  // Calculate statistics from date-filtered transactions only (ignore status filter)
  const statsTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by date range only for statistics
    if (dateFrom) {
      filtered = filtered.filter(txn => new Date(txn.paymentDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(txn => new Date(txn.paymentDate) <= new Date(dateTo));
    }

    return filtered;
  }, [transactions, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalAmount = statsTransactions.reduce((sum, txn) => sum + parseFloat(txn.amountPaid || 0), 0);
    const pendingAmount = statsTransactions
      .filter(txn => txn.verifyStatus === 'pending')
      .reduce((sum, txn) => sum + parseFloat(txn.amountPaid || 0), 0);
    const approvedAmount = statsTransactions
      .filter(txn => txn.verifyStatus === 'verified')
      .reduce((sum, txn) => sum + parseFloat(txn.amountPaid || 0), 0);
    const rejectedAmount = statsTransactions
      .filter(txn => txn.verifyStatus === 'rejected')
      .reduce((sum, txn) => sum + parseFloat(txn.amountPaid || 0), 0);

    return {
      totalAmount,
      pendingAmount,
      approvedAmount,
      rejectedAmount
    };
  }, [statsTransactions]);

  // Fetch collection summary
  const fetchCollection = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/counsellor/collection/${user.uuid}`);
      setCollection(res.data || null);
    } catch (err) {
      console.error("Error fetching collection", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settlement history
  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/counsellor/collection/payments/${user.uuid}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  useEffect(() => {
    fetchCollection();
    fetchTransactions();
  }, []);

  const handleProofUpload = async () => {
    const imageUrl = await paymentProof.uploadImage();
    if (imageUrl) {
      setFormData({ ...formData, proofUrl: imageUrl });
    }
  };

  const handleSettleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setSettleAmount(e.target.value);
    
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    console.log("sending collection");
    // if (collection) return;

    const value = parseFloat(settleAmount);
    if (!value || value <= 0) {
      setError("Enter a valid settlement amount.");
      return;
    }
    if (!formData.proofUrl) {
      setError("Please upload and save payment proof before submitting.");
      return;
    }
    if (!paymentDate) {
      setError("Please select a payment date.");
      return;
    }

    setSubmitLoader(true);
    try {
      const payload = {
        amountPaid: value,
        remark: customRemark ? `Other: ${customRemark}` : remark,
        proofUrl: formData.proofUrl,
        paymentDate,
      };
      await api.post("/counsellor/myCollection/settle", payload);
      alert("Collection submitted successfully!");
      setSettleAmount("");
      setRemark("");
      setPaymentDate("");
      setFormData({ proofUrl: "" });
      setShowForm(false); // Hide form after successful submission
      paymentProof.removePhoto();
      fetchCollection();
      fetchTransactions();
    } catch (err) {
      console.error("Error settling:", err);
      setError("Failed to settle. Please try again.");
    } finally {
      setSubmitLoader(false);
    }
  };

  const handleViewProof = (url) => {
    if (url) {
      setProofLoading(true);
      setSelectedReceiptUrl(`${imgUrl}${url}`);
      setShowReceiptModal(true);
    } else {
      alert("No proof available.");
    }
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        My Collection
      </h1>

      {loading && <p className="text-center">Loading data...</p>}

      {/* Statistics Section - moved after filters */}
      

      {/* Send Collection Button or Form */}
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          {!showForm ? (
            // Show button initially
            <div className="text-left">
              <h2 className="text-xl font-semibold text-secondary mb-4">
                Send Collection to Dnyanganga
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Send Collection
              </button>
            </div>
          ) : (
            // Show form when button is clicked
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary">
                  Send Collection to Dnyanganga
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setSettleAmount("");
                    setRemark("");
                    setPaymentDate("");
                    setCustomRemark("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ✕ Cancel
                </button>
              </div>

              {error && <p className="text-red-500 mb-3">{error}</p>}

              <form onSubmit={handleSettle} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Amount</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={settleAmount}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleSettleAmountChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                {/* Remark Dropdown */}
                <div>
                  <label className="block mb-2 font-medium">Remark</label>
                  <select
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="" disabled>
                      Select Remark
                    </option>
                    <option value="Dnyanganga Axis Bank">Dnyanganga Axis Bank</option>
                    <option value="Dnyanganga Yes Bank">Dnyanganga Yes Bank</option>
                    <option value="Amol Sir Personal">Amol Sir Personal</option>
                    <option value="Sagar Sir Personal">Sagar Sir Personal</option>
                    <option value="Other">Other Account</option>
                  </select>

                  {/* If "Other" is selected, show input field */}
                  {remark === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter custom remark"
                      className="mt-3 w-full p-2 border rounded-md"
                      value={customRemark}
                      onChange={(e) => setCustomRemark(`${e.target.value}`)}
                      required
                    />
                  )}
                </div>

                {/* Payment Proof Upload */}
                <div className="mb-6">
                  <FileUpload
                    title="Upload Payment Proof"
                    imageUrl={paymentProof.imageUrl}
                    error={paymentProof.error}
                    loader={paymentProof.loader}
                    isSaved={paymentProof.isSaved}
                    imageType="proof"
                    onFileUpload={paymentProof.handleFileUpload}
                    onUploadImage={handleProofUpload}
                    onRemovePhoto={paymentProof.removePhoto}
                  />
                </div>

                {!error && paymentProof.isSaved ? (
                  <button
                    type="submit"
                    disabled={submitLoader}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 min-w-36 grid place-items-center"
                  >
                    {submitLoader ? (
                      <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      "Submit Collection"
                    )}
                  </button>
                ) : (
                  <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3">
                    📸 Please upload and save payment proof first
                  </p>
                )}
              </form>
            </>
          )}
        </div>

      {/* Transaction History */}
      {transactions.length > 0 ? (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Collection History
          </h2>
          
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block mb-2 font-medium text-sm">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-sm">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-sm">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="h-10">
            {(statusFilter || dateFrom || dateTo) && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
              <span className="ml-2 text-sm text-gray-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>
            </div>
          )}
          </div>

          {/* Statistics Section - positioned after filters */}
          
          <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary">
              Statistics
            </h2>
            {(dateFrom || dateTo) && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Date Filtered
              </span>
            )}
          </div>
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
          
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Sr. No.</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount Paid</th>
                  <th className="p-2 border">Remark</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="p-2 border">{idx+1}</td>
                    <td className="p-2 border">{new Date(txn.paymentDate).toLocaleDateString("en-GB") }</td>
                    <td className="p-2 border">₹ {txn.amountPaid}</td>
                    <td className="p-2 border">{txn.remark}</td>
                    <td className="p-2 border">{txn.verifyStatus == "pending" ? (<span className="text-primary font-semibold">Pending</span>) : (txn.verifyStatus == "verified" ? (<span className="text-green-600 font-semibold">Approved</span>) : (<span className="text-red-600 font-semibold">Rejected</span>))}</td>
                    <td className="p-2 border">
                      {txn.proofUrl ? (
                        <button
                          onClick={() => handleViewProof(txn.proofUrl)}
                          className="text-blue-500 underline flex items-center gap-2"
                        >
                          {proofLoading ? (
                            <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                          ) : (
                            "View Proof"
                          )}
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

          {/* No results message */}
          {filteredTransactions.length === 0 && transactions.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions match the selected filters.</p>
            </div>
          )}
        </div>
      ) : (<p>No transaction Found !!</p>)}

      {/* Proof Modal */}
      <Transition appear show={showReceiptModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowReceiptModal(false)}
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
                    Proof Image
                  </Dialog.Title>
                  <div className="mt-4 flex justify-center">
                    {proofLoading && (
                      <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></span>
                    )}
                    <img
                      src={selectedReceiptUrl}
                      alt="Proof"
                      onLoad={() => setProofLoading(false)}
                      className="max-h-[500px] w-full object-contain rounded border"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => setShowReceiptModal(false)}
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

export default CounsellorCollection;