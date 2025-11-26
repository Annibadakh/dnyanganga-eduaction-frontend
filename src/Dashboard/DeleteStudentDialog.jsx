import React, { useState } from "react";
import api from "../Api";

const DeleteStudentDialog = ({ student, onClose, onConfirm }) => {
  const [refundedAmount, setRefundedAmount] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleRefundedAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === "" || /^\d+$/.test(value)) {
      const refundAmount = value === "" ? 0 : parseInt(value);
      
      // Real-time validation
      if (refundAmount > student.amountPaid) {
        setError(`Refunded amount cannot exceed paid amount (₹${student.amountPaid.toLocaleString('en-IN')})`);
      } else if (refundAmount < 0) {
        setError("Refunded amount cannot be negative");
      } else {
        setError("");
      }
      
      setRefundedAmount(value);
    }
  };

  const handleConfirmDelete = async () => {
    const refundAmount = refundedAmount === "" ? 0 : parseInt(refundedAmount);
    
    // Validation
    if (refundAmount < 0) {
      setError("Refunded amount cannot be negative");
      return;
    }
    
    if (refundAmount > student.amountPaid) {
      setError(`Refunded amount cannot exceed paid amount (₹${student.amountPaid.toLocaleString('en-IN')})`);
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(student.studentId, refundAmount);
    } catch (err) {
      setError("Failed to delete student. Please try again.");
      setIsDeleting(false);
    }
  };

  // Check if delete button should be disabled
  const isDeleteDisabled = () => {
    if (isDeleting) return true;
    
    const refundAmount = refundedAmount === "" ? 0 : parseInt(refundedAmount);
    
    // Disable if refunded amount is negative
    if (refundAmount < 0) return true;
    
    // Disable if refunded amount exceeds paid amount
    if (refundAmount > student.amountPaid) return true;
    
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-custom">
        {/* Header */}
        <div className="bg-red-500 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">Delete Student</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4 font-semibold">
              Are you sure you want to delete this student?
            </p>
            
            {/* Student Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Student Name:</span>
                <span className="text-gray-800 font-semibold">{student.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Student ID:</span>
                <span className="text-gray-800 font-semibold">{student.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Amount Paid:</span>
                <span className="text-green-600 font-bold">
                  ₹{student.amountPaid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Refunded Amount Input */}
            <div className="mb-4">
              <label htmlFor="refundedAmount" className="block text-gray-700 font-medium mb-2">
                Refunded Amount (₹)
              </label>
              <input
                id="refundedAmount"
                type="text"
                required
                value={refundedAmount}
                onChange={handleRefundedAmountChange}
                placeholder="Enter refunded amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isDeleting}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> If no amount has been refunded, please enter <span className="font-bold">0</span> as the refunded amount.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleteDisabled()}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed grid place-items-center min-h-[42px]"
            >
              {isDeleting ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Delete Student"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudentDialog;