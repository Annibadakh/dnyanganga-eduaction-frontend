import React, { useEffect, useState, Fragment } from "react";
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

  const imgUrl = import.meta.env.VITE_IMG_URL;

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
    // if (collection && value > collection.balance) {
    //   setError("Amount cannot exceed available balance.");
    // } else if (value <= 0) {
    //   setError("Amount must be greater than 0.");
    // } else {
    //   setError("");
    // }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!collection) return;

    const value = parseFloat(settleAmount);
    // if (!value || value <= 0 || value > collection.balance) {
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
        counsellorId: user.uuid,
        counsellorName: user.userName,
        amountPaid: value,
        remark: remark,
        proofUrl: formData.proofUrl,
        paymentDate,
      };
      await api.post("/counsellor/myCollection/settle", payload);
      alert("Collection submitted successfully!");
      setSettleAmount("");
      setRemark("");
      setPaymentDate("");
      setFormData({ proofUrl: "" });
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

      {/* Collection Summary */}
      {/* {collection && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Collection Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="table-auto min-w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Commission %</th>
                  <th className="p-2 border whitespace-nowrap">Total Amount</th>
                  <th className="p-2 border whitespace-nowrap">Actual Amount</th>
                  <th className="p-2 border whitespace-nowrap">Given Amount</th>
                  <th className="p-2 border whitespace-nowrap">Balance Amount</th>
                  <th className="p-2 border whitespace-nowrap">
                    Last Settle Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100">
                  <td className="p-2 border">{collection.commissionRate} %</td>
                  <td className="p-2 border">₹ {collection.totalAmount}</td>
                  <td className="p-2 border">₹ {collection.actualAmount}</td>
                  <td className="p-2 border">₹ {collection.collectedAmount}</td>
                  <td className="p-2 border">₹ {collection.balance}</td>
                  <td className="p-2 border">
                    { new Date(collection.lastCollectedDate).toLocaleDateString("en-GB") || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {/* Settlement Form */}
      {collection && (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Send Collection to Dnyanganga
          </h2>

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
                  value={remark.startsWith("Other:") ? remark.replace("Other:", "") : ""}
                  onChange={(e) => setRemark(`Other:${e.target.value}`)}
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

        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 ? (
        <div className="bg-white p-4 md:p-6 shadow-custom mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Collection History
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount Paid</th>
                  <th className="p-2 border">Remark</th>
                  <th className="p-2 border">Proof</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="p-2 border">{new Date(txn.paymentDate).toLocaleDateString("en-GB") }</td>
                    <td className="p-2 border">₹ {txn.amountPaid}</td>
                    <td className="p-2 border">{txn.remark}</td>
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
