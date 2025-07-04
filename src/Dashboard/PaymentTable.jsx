import { Fragment, useState, useEffect } from "react";
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

  useEffect(() => {
    api
      .get("/counsellor/getPayments", {
        params: {
          uuid: user.uuid,
          role: user.role,
        },
      })
      .then((response) => {
        setPaymentsData(response.data.studentData);
        setFilteredData(response.data.studentData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(paymentsData);
      return;
    }

    const filtered = paymentsData.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      const studentMatch =
        student.studentName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toString().toLowerCase().includes(searchLower);
      const paymentMatch = student.payments.some((payment) =>
        payment.paymentId?.toString().toLowerCase().includes(searchLower) ||
        payment.receiptNo?.toString().toLowerCase().includes(searchLower)
      );
      return studentMatch || paymentMatch;
    });

    setFilteredData(filtered);
  }, [searchTerm, paymentsData]);

  const handleViewReceipt = (receiptPhoto) => {
    if (receiptPhoto) {
      setSelectedReceiptUrl(`${imgUrl}${receiptPhoto}`);
      setShowReceiptModal(true);
    } else {
      alert("No receipt image available.");
    }
  };

  const handleDownloadReceipt = async (student) => {
    try {
      setLoadingPdfId(student.studentId);
      const response = await api.get("/pdf/payment-receipt", {
        params: { studentId: student.studentId },
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
      alert(err.response?.status === 403 ? "Student not found!" : "Receipt download failed.");
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Payment Records</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, student ID, payment ID, or receipt no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow-custom md:p-6 p-2">
        <div className="overflow-auto">
        <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
          <thead className="bg-primary text-white uppercase">
            <tr>
              <th className="p-3 border">Sr. No.</th>
              <th className="p-3 border">Student ID</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Amount Paid</th>
              <th className="p-3 border">Amount Remaining</th>
              <th className="p-3 border">Due Date</th>
              <th className="p-3 border">Payments</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, index) => (
              <tr key={index} className="text-center border-b hover:bg-gray-100 transition">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{student.studentId}</td>
                <td className="p-2 border">{student.studentName}</td>
                <td className="p-2 border">{student.amountPaid}</td>
                <td className="p-2 border">{student.amountRemaining}</td>
                <td className="p-2 border">
                  {student.dueDate
                    ? new Date(student.dueDate).toLocaleDateString("en-GB")
                    : "-"}
                </td>
                <td className="p-2 border">
                  <table className="w-full text-xs border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-1 border">Payment ID</th>
                        <th className="p-1 border">Receipt No.</th>
                        <th className="p-1 border">Amount</th>
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Mode</th>
                        <th className="p-1 border">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payments.map((payment) => (
                        <tr key={payment.paymentId}>
                          <td className="p-1 border">{payment.paymentId}</td>
                          <td className="p-1 border">{payment.receiptNo}</td>
                          <td className="p-1 border">{payment.amountPaid}</td>
                          <td className="p-1 border">
                            {new Date(payment.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="p-1 border">{payment.paymentMode}</td>
                          <td className="p-1 border">
                            <button
                              onClick={() => handleViewReceipt(payment.receiptPhoto)}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDownloadReceipt(student)}
                    disabled={loadingPdfId === student.studentId}
                    className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded grid place-items-center ${
                      loadingPdfId === student.studentId ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingPdfId === student.studentId ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      "Receipt"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Receipt Modal */}
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
