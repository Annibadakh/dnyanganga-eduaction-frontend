import { useState, useEffect } from "react";
import api from "../Api";
import DownloadReceipt from "./DownloadReceipt";
import { useAuth } from "../Context/AuthContext";


const PaymentTable = () => {
  const {user} = useAuth();
  console.log(user);
  const [paymentsData, setPaymentsData] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState("");

  useEffect(() => {
    api.get("/counsellor/getPayments", {
      params: {
        uuid: user.uuid,
        role: user.role,
    }
    })
    .then(response => {
        setPaymentsData(response.data.studentData);
    })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleClick = (student) => {
    // console.log("Student: ",student);
    setReceiptData(student);
    setShowReceipt(true);
  }

  return (
    <div className="p-4">
      {!showReceipt ? (
        <>
            <h2 className="text-xl font-bold mb-4">Payment Records</h2>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
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
                    <tr key={student.studentId} className="bg-white">
                        <td className="border px-4 py-2">{student.studentId}</td>
                        <td className="border px-4 py-2">{student.studentName}</td>
                        <td className="border px-4 py-2">{student.amountPaid}</td>
                        <td className="border px-4 py-2">{student.amountRemaining}</td>
                        <td className="border px-4 py-2">{student.dueDate ? new Date(student.dueDate).toLocaleDateString() : "-"}</td>
                        <td className="border px-4 py-2">
                        <table className="w-full border border-gray-400">
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
                                <td className="border px-2 py-1">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                <td className="border px-2 py-1">{payment.paymentMode}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </td>
                        <td className="border px-4 py-2"><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm" onClick={() => handleClick(student)}>Receipt</button></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </>
      ) : <DownloadReceipt receiptData={receiptData} setShowReceipt={setShowReceipt}/>}
    </div>
  );
};

export default PaymentTable;