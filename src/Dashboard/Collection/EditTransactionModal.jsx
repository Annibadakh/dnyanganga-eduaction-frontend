import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "../../Api";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import {useToast} from "../../useToast";


const EditTransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
    const { successToast, errorToast, infoToast } = useToast();
  
  
  // File upload hook for payment proof
  const paymentProof = FileUploadHook();
  
  // Form states
  const [submitLoader, setSubmitLoader] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    amountPaid: "",
    remark: "",
    customRemark: "",
    paymentDate: "",
    proofUrl: ""
  });

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      // Parse custom remark if it starts with "Other:"
      const isCustomRemark = transaction.remark && transaction.remark.startsWith("Other:");
      const customRemarkValue = isCustomRemark ? transaction.remark.substring(7) : "";
      const remarkValue = isCustomRemark ? "Other" : transaction.remark || "";
      
      setFormData({
        amountPaid: transaction.amountPaid || "",
        remark: remarkValue,
        customRemark: customRemarkValue,
        paymentDate: transaction.paymentDate 
          ? new Date(transaction.paymentDate).toISOString().split('T')[0] 
          : "",
        proofUrl: transaction.proofUrl || ""
      });
    }
  }, [transaction]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      paymentProof.removePhoto();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProofUpload = async (type) => {
    const imageUrl = await paymentProof.uploadImage(type);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, proofUrl: imageUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amount = parseFloat(formData.amountPaid);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!formData.paymentDate) {
      setError("Please select a payment date.");
      return;
    }

    setSubmitLoader(true);
    try {
      const updateData = {
        amountPaid: amount,
        remark: formData.customRemark ? `Other: ${formData.customRemark}` : formData.remark,
        paymentDate: formData.paymentDate,
      };

      // If new proof was uploaded, include it
      if (paymentProof.isSaved && paymentProof.imageUrl) {
        updateData.proofUrl = formData.proofUrl;
        updateData.prevProofUrl = transaction.proofUrl || "";
      } else {
        // Keep existing proof
        updateData.proofUrl = transaction.proofUrl;
      }

      const response = await api.put(
        `/counsellor/collection/updateTransaction/${transaction.id}`,
        updateData
      );

      if (response.status === 200) {
        successToast("Transaction updated successfully!");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError(err.response?.data?.message || "Failed to update transaction. Please try again.");
    } finally {
      setSubmitLoader(false);
    }
  };

  const handleClose = () => {
    setError("");
    paymentProof.removePhoto();
    onClose();
  };

  if (!transaction) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex items-center justify-center min-h-full p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-primary text-white px-4 sm:px-6 py-4 flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg sm:text-xl font-semibold">
                    Edit Transaction
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Transaction Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Transaction Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="font-medium">Counsellor:</span> {transaction.User?.name}</p>
                        <p><span className="font-medium">Current Status:</span> 
                          <span className={`ml-2 font-semibold ${
                            transaction.verifyStatus === 'verified' ? 'text-green-600' :
                            transaction.verifyStatus === 'rejected' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {transaction.verifyStatus === 'verified' ? 'Approved' :
                             transaction.verifyStatus === 'rejected' ? 'Rejected' :
                             'Pending'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Payment Proof Section */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="text-base font-semibold mb-4 text-blue-800">Payment Proof</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* Current Proof */}
                        <div className="border rounded-lg p-4 bg-white">
                          <h5 className="text-sm font-semibold mb-3 text-gray-700">Current Proof</h5>
                          <div className="flex justify-center">
                            {transaction.proofUrl ? (
                              <div className="relative">
                                <img
                                  src={`${imgUrl}${transaction.proofUrl}`}
                                  alt="Current payment proof"
                                  className="w-40 h-48 object-cover border-2 border-gray-300 rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-40 h-48 bg-gray-200 border-2 border-gray-300 rounded-lg items-center justify-center text-gray-500">
                                  <div className="text-center px-2">
                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-xs">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-40 h-48 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                                <div className="text-center px-2">
                                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <p className="text-xs font-medium">No Proof Available</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* New Proof Upload */}
                        <div className="border rounded-lg p-4 bg-white">
                          <h5 className="text-sm font-semibold mb-3 text-gray-700">Upload New Proof (Optional)</h5>
                          <FileUpload
                            title="Select New Payment Proof"
                            imageUrl={paymentProof.imageUrl}
                            error={paymentProof.error}
                            loader={paymentProof.loader}
                            isSaved={paymentProof.isSaved}
                            imageType="collection"
                            onFileUpload={paymentProof.handleFileUpload}
                            onUploadImage={handleProofUpload}
                            onRemovePhoto={paymentProof.removePhoto}
                          />
                          {paymentProof.imageUrl && (
                            <div className="mt-3 text-center">
                              <p className="text-sm text-green-600 font-medium">
                                {paymentProof.isSaved ? "✓ Proof ready for update" : "Please save the proof first"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Amount */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">Amount</label>
                        <input
                          type="number"
                          name="amountPaid"
                          min="1"
                          step="0.01"
                          value={formData.amountPaid}
                          onWheel={(e) => e.target.blur()}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md text-sm"
                          placeholder="Enter amount"
                          required
                        />
                      </div>

                      {/* Payment Date */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">Payment Date</label>
                        <input
                          type="date"
                          name="paymentDate"
                          value={formData.paymentDate}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        />
                      </div>

                      {/* Remark Dropdown */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 font-medium text-sm">Remark</label>
                        <select
                          name="remark"
                          value={formData.remark}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md text-sm"
                          required
                        >
                          <option value="" disabled>Select Remark</option>
                          <option value="Dnyanganga Axis Bank">Dnyanganga Axis Bank</option>
                          <option value="Dnyanganga Yes Bank">Dnyanganga Yes Bank</option>
                          <option value="Amol Sir Personal">Amol Sir Personal</option>
                          <option value="Sagar Sir Personal">Sagar Sir Personal</option>
                          <option value="Other">Other Account</option>
                        </select>

                        {/* Custom Remark Input */}
                        {formData.remark === "Other" && (
                          <input
                            type="text"
                            name="customRemark"
                            maxLength="30"
                            placeholder="Enter custom remark"
                            className="mt-3 w-full p-2 border rounded-md text-sm"
                            value={formData.customRemark}
                            onChange={handleChange}
                            required
                          />
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitLoader}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm min-w-[120px] flex items-center justify-center"
                      >
                        {submitLoader ? (
                          <span className="flex items-center">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Updating...
                          </span>
                        ) : (
                          "Update Transaction"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditTransactionModal;