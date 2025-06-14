import { useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const PaymentTable = () => {
  const { user } = useAuth();
  const [paymentsData, setPaymentsData] = useState([]);
  const [loadingPdfId, setLoadingPdfId] = useState(null);

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
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Student ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Amount Paid</th>
              <th className="border px-4 py-2">Amount Remaining</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Payments</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentsData.map((student) => (
              <tr key={student.studentId} className="bg-white hover:bg-gray-100">
                <td className="border px-4 py-2">{student.studentId}</td>
                <td className="border px-4 py-2">{student.studentName}</td>
                <td className="border px-4 py-2">{student.amountPaid}</td>
                <td className="border px-4 py-2">{student.amountRemaining}</td>
                <td className="border px-4 py-2">
                  {student.dueDate
                    ? new Date(student.dueDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="border px-4 py-2">
                  <table className="w-full border border-gray-400 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Payment ID</th>
                        <th className="border px-2 py-1">Amount</th>
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payments.map((payment) => (
                        <tr key={payment.paymentId}>
                          <td className="border px-2 py-1">{payment.paymentId}</td>
                          <td className="border px-2 py-1">{payment.amountPaid}</td>
                          <td className="border px-2 py-1">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="border px-2 py-1">{payment.paymentMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDownloadReceipt(student)}
                    disabled={loadingPdfId === student.studentId}
                    className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded ${
                      loadingPdfId === student.studentId
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loadingPdfId === student.studentId
                      ? "Downloading..."
                      : "Receipt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
