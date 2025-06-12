import React, { useState } from "react";
import api from "../Api";


const PaymentForm = ({paymentData, setShowPayment}) => {
    const student = paymentData;
    console.log(paymentData, student);
    const [paymentMode, setPaymentMode] = useState("");
    const [responseData, setResponse] = useState();
    const [amount, setAmount] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [receiptNo, setReceiptNo] = useState("");
    const [newRemainingAmount, setNewRemainingAmount] = useState(student?.amountRemaining || 0);
    const [dueDate, setDueDate] = useState(false);
    const [error, setError] = useState("");

    if (!student) {
        return <p className="text-red-500">No student selected for payment.</p>;
    }

    const handleClick = (e) => {
        setShowPayment(false);
    } 
    const handleDate = (e) => {
        setNewDueDate(e.target.value) || "";
        console.log(newDueDate);
    };

    const handleOnChange = (e) => {
        setReceiptNo(e.target.value);
    }

    const handleAmountChange = (e) => {
        const amountValue = parseFloat(e.target.value) || 0;
        setAmount(e.target.value);
        if(student.amountRemaining < amountValue){
            setError("Amount must be smaller than pending amount")
        }
        else{
            setError("");
        }
        const updatedRemaining = student.amountRemaining - amountValue;
        if(updatedRemaining > 0){
            setDueDate(false);
        }
        else{
            setDueDate(true);
        }
        setNewRemainingAmount(updatedRemaining);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const amountValue = parseFloat(amount);
        if (amountValue <= 0 || amountValue > student.amountRemaining) {
            setError("Amount must be greater than 0 and less than or equal to remaining amount.");
            return;
        }

        const formData = {
            studentId: student.studentId,
                receiptNo: receiptNo,
                amountPaid: amountValue,
                paymentMode,
                newRemainingAmount,
                newDueDate: newDueDate,
                counsellor: student.counsellor,
                createdBy: student.createdBy,
        };
        console.log(formData)
        try {
            const response = await api.post("/counsellor/makePayment", formData);
            setResponse(response);
            alert("Payment Successfull !!");
            setShowPayment(false);
        } catch (err) {
            setError("Failed to process payment. Please try again.");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 border rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Payment Form</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block">Student Name:</label>
                    <input type="text" value={student.studentName} disabled className="border p-2 w-full" />
                </div><div className="mb-3">
                    <label className="block">Receipt No</label>
                    <input type="text" value={receiptNo} onChange={handleOnChange} className="border p-2 w-full" />
                </div>
                <div className="mb-3">
                    <label className="block">Remaining Amount:</label>
                    <input type="text" value={student.amountRemaining} disabled className="border p-2 w-full" />
                </div>
                <div className="mb-3">
                    <label className="block">Amount:</label>
                    <input type="number" value={amount} onChange={handleAmountChange} required className="border p-2 w-full" />
                </div>
                <div className="mb-3">
                    <label className="block">New Remaining Amount:</label>
                    <input type="text" value={newRemainingAmount} disabled className="border p-2 w-full" />
                </div>
                <div className="mb-3">
                    <label className="block">Due Date: {dueDate && ("Due date not required")}</label>
                    <input type="date" value={newDueDate} disabled={dueDate} onChange={handleDate} className="border p-2 w-full" />
                </div>
                <div className="mb-3">
                    <label className="block">Payment Mode:</label>
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} required className="border p-2 w-full">
                        <option value="">Select Payment Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Check</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
                
                <div>
                    {!error && (
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Submit Payment
                    </button>
                    )}
                    <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600" onClick={handleClick}>Back</button>
                </div>
                </form>
        </div>
    );
};

export default PaymentForm;
