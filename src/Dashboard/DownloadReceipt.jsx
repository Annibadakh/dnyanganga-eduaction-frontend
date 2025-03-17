import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentReceipt from "./PaymentRecipt";
import { useNavigate } from "react-router-dom";


const DownloadReceipt = ({receiptData}) => {
  console.log("receipt data",receiptData);
  const navigate = useNavigate();
  
  const handleClick = (e) => {
      navigate("/dashboard/registertable")
  }
  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Payment Summary</h2>

      <div className="mb-4">
        <p><strong>Name:</strong> {receiptData.studentName}</p>
        <p><strong>Contact No.:</strong> {receiptData.studentNo}</p>
        <p><strong>Total Amount:</strong> ₹{parseInt(receiptData.amountPaid) + parseInt(receiptData.amountRemaining)}</p>
        <p><strong>Remaining Amount:</strong> ₹{receiptData.amountRemaining}</p>
        <p><strong>Due Date:</strong> {new Date(receiptData.dueDate).toLocaleDateString()}</p>

        {receiptData.payments.map((payment, index) => (
          <div key={index} className="border-2 border-black mb-2">
          <h3>{index+1} Transaction</h3>
          <p><strong>Amount Paid:</strong> ₹{payment.amountPaid}</p>
          <p><strong>Payment Mode:</strong> {payment.paymentMode}</p>
          <p><strong>Payment Date:</strong> {payment.createdAt.slice(0,10)}</p>
          </div>
        ))}
      </div>
      <div className="gird grid-flow-col gap-4">
        <PDFDownloadLink
          document={<PaymentReceipt data={receiptData} />}
          fileName={`${receiptData.studentName}.pdf`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {({ loading }) => (loading ? "Generating Receipt..." : "Download Receipt")}
        </PDFDownloadLink>
        <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600" onClick={handleClick}>Back</button>
      </div>
    </div>
  );
};

export default DownloadReceipt;
