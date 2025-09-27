import React, { useState } from "react";
import api from "../Api";
import { FileUploadHook } from "./FileUploadHook";
import FileUpload from "./FileUpload";

const PaymentForm = ({paymentData, setShowPayment}) => {
    const student = paymentData;
    // console.log(paymentData, student);
    
    // File upload hook for receipt
    const receiptPhoto = FileUploadHook();
    
    // Form states with receiptPhoto included in formData like RegistrationForm
    const [formData, setFormData] = useState({
        receiptPhoto: "", // Store image URL in formData like RegistrationForm
    });
    
    const [paymentMode, setPaymentMode] = useState("");
    const [responseData, setResponse] = useState();
    const [amount, setAmount] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [receiptNo, setReceiptNo] = useState("");
    const [newRemainingAmount, setNewRemainingAmount] = useState(student?.amountRemaining || 0);
    const [dueDate, setDueDate] = useState(false);
    const [error, setError] = useState("");
    const [submitLoader, setSubmitLoader] = useState(false);

    if (!student) {
        return <p className="text-red-500">No student selected for payment.</p>;
    }

    const handleClick = (e) => {
        setShowPayment(false);
    } 
    
    const handleDate = (e) => {
        setNewDueDate(e.target.value) || "";
        // console.log(newDueDate);
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

    // Handle receipt photo upload same as RegistrationForm pattern
    const handleReceiptPhotoUpload = async () => {
        const imageUrl = await receiptPhoto.uploadImage();
        if (imageUrl) {
            setFormData({ ...formData, receiptPhoto: imageUrl });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoader(true);
        
        const amountValue = parseFloat(amount);
        if (amountValue <= 0 || amountValue > student.amountRemaining) {
            setError("Amount must be greater than 0 and less than or equal to remaining amount.");
            setSubmitLoader(false);
            return;
        }

        // Create data object same as RegistrationForm pattern
        const dataToSend = {
            studentId: student.studentId,
            receiptNo: receiptNo,
            amountPaid: amountValue,
            paymentMode,
            newRemainingAmount,
            newDueDate: newDueDate,
            receiptPhoto: formData.receiptPhoto, // Use from formData like RegistrationForm
        };
        
        // console.log("before submit", dataToSend);
        try {
            const response = await api.post("/counsellor/makePayment", dataToSend);
            setResponse(response);
            // console.log("after submit", response);
            alert("Payment Successful !!");
            setShowPayment(false);
        } catch (err) {
            setError("Failed to process payment. Please try again.");
        } finally {
            setSubmitLoader(false);
        }
    };

    return (
        <div className="max-w-lg bg-white shadow-custom mx-auto md:p-6 p-2">
            <h2 className="text-2xl text-secondary text-center font-bold mb-4">Payment Form</h2>
            {error && <p className="text-red-500">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block">Student Name:</label>
                    <input type="text" value={student.studentName} disabled className="border p-2 w-full" />
                </div>
                
                <div className="mb-3">
                    <label className="block">Receipt No.:</label>
                    <input type="number"  value={receiptNo} onWheel={(e) => e.target.blur()} onChange={handleOnChange} className="border p-2 w-full" />
                </div>
                
                <div className="mb-3">
                    <label className="block">Remaining Amount:</label>
                    <input type="text" value={student.amountRemaining} disabled className="border p-2 w-full" />
                </div>
                
                <div className="mb-3">
                    <label className="block">Amount:</label>
                    <input type="number" value={amount} onWheel={(e) => e.target.blur()} onChange={handleAmountChange} required className="border p-2 w-full" />
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
                        <option value="Online">Online</option>
                        <option value="Card">Cheque</option>
                    </select>
                </div>

                {/* Receipt Photo Upload Section using FileUpload component */}
                <div className="mb-6">
                    <FileUpload
                        title="Fees Receipt Photo"
                        imageUrl={receiptPhoto.imageUrl}
                        error={receiptPhoto.error}
                        loader={receiptPhoto.loader}
                        isSaved={receiptPhoto.isSaved}
                        imageType="receipt"
                        onFileUpload={receiptPhoto.handleFileUpload}
                        onUploadImage={handleReceiptPhotoUpload}
                        onRemovePhoto={receiptPhoto.removePhoto}
                    />
                </div>
                
                <div className="flex gap-2">
                    {!error && receiptPhoto.isSaved ? (
                        <button type="submit" disabled={submitLoader} className="bg-green-500 min-w-36 disabled:opacity-50 grid place-items-center text-white px-4 py-2 rounded hover:bg-green-600 mr-2">
                            {submitLoader ? <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span> : "Submit Payment"}
                        </button>
                    ) : (
                        <div className="mb-4">
                            <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded p-3 mb-2">
                                📸 Please upload and save receipt photo first
                            </p>
                        </div>
                    )}
                    <button type="button" disabled={submitLoader} className="bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded hover:bg-red-600" onClick={handleClick}>
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;