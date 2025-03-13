import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentReceipt from "./PaymentRecipt";

const DownloadReceipt = ({receiptData}) => {
  const studentName = receiptData.student.studentName;
  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Payment Summary</h2>

      <div className="mb-4">
        <p><strong>Name:</strong> {receiptData.student.studentName}</p>
        <p><strong>Standard:</strong> {receiptData.student.standard}</p>
        <p><strong>Total Amount:</strong> ₹{parseInt(receiptData.student.amountPaid) + parseInt(receiptData.student.amountRemaining)}</p>
        <p><strong>Amount Paid:</strong> ₹{receiptData.payment.amountPaid}</p>
        <p><strong>Remaining Amount:</strong> ₹{receiptData.student.amountRemaining}</p>
        <p><strong>Due Date:</strong> {new Date(receiptData.student.dueDate).toLocaleDateString()}</p>
        <p><strong>Payment Mode:</strong> {receiptData.payment.paymentMode}</p>
      </div>

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
