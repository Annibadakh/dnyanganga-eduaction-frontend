import {Fragment, useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import { Dialog, Transition } from "@headlessui/react";

const PaymentTable = () => {
  const { user } = useAuth();
  const [paymentsData, setPaymentsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState("");
  const imgUrl = import.meta.env.VITE_IMG_URL;

  const handleViewReceipt = (receiptPhoto) => {
    if (receiptPhoto) {
      setSelectedReceiptUrl(`${imgUrl}${receiptPhoto}`);
      setShowReceiptModal(true);
    } else {
      alert("No receipt image available.");
    }
  };

  useEffect(() => {
    api
      .get("/counsellor/getPayments", {
        params: {
          uuid: user.uuid,
          role: user.role,
        },
      })
      .then((response) => {
        console.log(response);
        setPaymentsData(response.data.studentData);
        setFilteredData(response.data.studentData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(paymentsData);
      return;
    }

    const filtered = paymentsData.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      
      // Check student name and ID
      const studentMatch = 
        student.studentName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toString().toLowerCase().includes(searchLower);
      
      // Check payment details
      const paymentMatch = student.payments.some(payment =>
        payment.paymentId?.toString().toLowerCase().includes(searchLower) ||
        payment.receiptNo?.toString().toLowerCase().includes(searchLower)
      );
      
      return studentMatch || paymentMatch;
    });

    setFilteredData(filtered);
  }, [searchTerm, paymentsData]);

  const handleDownloadReceipt = async (student) => {
    try {
      setLoadingPdfId(student.studentId);

      const response = await api.get("/pdf/payment-receipt", {
        params: {
          studentId: student.studentId,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = student.studentName
        ? `${student.studentName.replace(/\s+/g, "_")}_RECEIPT.pdf`
        : `${student.studentId}_RECEIPT.pdf`;

      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Student not found!");
      } else if (err.response?.status === 404) {
        alert("Receipt generation failed!");
      } else {
        alert("Error downloading receipt.");
      }
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Payment Records</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by student name, student ID, payment ID, or receipt number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="overflow-auto">
        <table className="border border-gray-300 text-center text-sm whitespace-nowrap min-w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Sr. No.</th>
              <th className="border px-4 py-2">Student ID</th>
              <th className="border px-4 py-2">Student Name</th>
              <th className="border px-4 py-2">Amount Paid</th>
              <th className="border px-4 py-2">Amount Remaining</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Payments</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, index) => (
              <tr key={index} className="bg-white hover:bg-gray-100">
                <td className="border px-4 py-2">{index+1}</td>
                <td className="border px-4 py-2">{student.studentId}</td>
                <td className="border px-4 py-2">{student.studentName}</td>
                <td className="border px-4 py-2">{student.amountPaid}</td>
                <td className="border px-4 py-2">{student.amountRemaining}</td>
                <td className="border px-4 py-2">
                  {student.dueDate
                    ? new Date(student.dueDate).toLocaleDateString('en-GB')
                    : "-"}
                </td>
                <td className="border px-4 py-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-max border border-gray-400 text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-1">Payment ID</th>
                          <th className="border px-2 py-1">Receipt No.</th>
                          <th className="border px-2 py-1">Amount</th>
                          <th className="border px-2 py-1">Date</th>
                          <th className="border px-2 py-1">Mode</th>
                          <th className="border px-2 py-1">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.payments.map((payment) => (
                          <tr key={payment.paymentId}>
                            <td className="border px-2 py-1">{payment.paymentId}</td>
                            <td className="border px-2 py-1">{payment.receiptNo}</td>
                            <td className="border px-2 py-1">{payment.amountPaid}</td>
                            <td className="border px-2 py-1">
                              {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                            </td>
                            <td className="border px-2 py-1">{payment.paymentMode}</td>
                            <td className="border px-2 py-1">
                              <button
                                onClick={() => handleViewReceipt(payment.receiptPhoto)}
                                className="text-blue-500 underline hover:text-blue-700"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDownloadReceipt(student)}
                    disabled={loadingPdfId === student.studentId}
                    className={`bg-green-500 hover:bg-green-600 min-h-6 min-w-16 text-white font-medium py-1 px-3 rounded grid place-items-center ${
                      loadingPdfId === student.studentId
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loadingPdfId === student.studentId
                      ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      : "Receipt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Transition appear show={showReceiptModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowReceiptModal(false)}>
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
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Receipt Image
                  </Dialog.Title>
                  <div className="mt-4">
                    <img
                      src={selectedReceiptUrl}
                      alt="Receipt"
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

export default PaymentTable;