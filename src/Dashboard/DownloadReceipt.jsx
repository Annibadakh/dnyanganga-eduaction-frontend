import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentReceipt from "./PaymentRecipt";
const receiptData = {
  message: "Student registered and payment recorded successfully!",
  payment: {
    amountPaid: "1000",
    createdAt: "2025-03-11T09:47:36.089Z",
    createdBy: "101cb3dd-e875-48d4-abf7-62587229d9b3",
    paymentId: "7807",
    paymentMode: "Cash",
    studentId: "556C30",
    updatedAt: "2025-03-11T09:47:36.089Z",
  },
  student: {
    address: "Sanjivani Hostel",
    amountPaid: "1000",
    amountRemaining: "2000",
    createdAt: "2025-03-11T09:47:36.053Z",
    createdBy: "101cb3dd-e875-48d4-abf7-62587229d9b3",
    dueDate: "2025-03-27T00:00:00.000Z",
    email: "pranav@gmail.com",
    parentsNo: "8767809061",
    pincode: "423603",
    schoolCollege: "Sanjivani",
    standard: "12th",
    studentId: "556C30",
    studentName: "Pranav Gagare",
    studentNo: "8767809061",
    studentPhoto: "http://localhost:5000/uploads/1741686401322.jpg",
    updatedAt: "2025-03-11T09:47:36.055Z",
  },
};
const DownloadReceipt = () => {
  const studentName = receiptData.student.studentName;
  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Payment Summary</h2>

      {/* Display Student & Payment Details */}
      <div className="mb-4">
        <p><strong>Name:</strong> {receiptData.student.studentName}</p>
        <p><strong>Standard:</strong> {receiptData.student.standard}</p>
        <p><strong>Total Amount:</strong> ₹{parseInt(receiptData.student.amountPaid) + parseInt(receiptData.student.amountRemaining)}</p>
        <p><strong>Amount Paid:</strong> ₹{receiptData.payment.amountPaid}</p>
        <p><strong>Remaining Amount:</strong> ₹{receiptData.student.amountRemaining}</p>
        <p><strong>Due Date:</strong> {new Date(receiptData.student.dueDate).toLocaleDateString()}</p>
        <p><strong>Payment Mode:</strong> {receiptData.payment.paymentMode}</p>
      </div>

      {/* Download Receipt Button */}
      <PDFDownloadLink
        document={<PaymentReceipt data={receiptData} />}
        fileName={`${studentName}.pdf`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {({ loading }) => (loading ? "Generating Receipt..." : "Download Receipt")}
      </PDFDownloadLink>
    </div>
  );
};

export default DownloadReceipt;
