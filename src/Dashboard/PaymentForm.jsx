import React, { useState } from "react";
import api from "../Api";

const PaymentForm = ({paymentData, setShowPayment}) => {
    const imgUrl = import.meta.env.VITE_IMG_URL;
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
    const [submitLoader, setSubmitLoader] = useState(false);

    
    // Receipt upload states
    const [receiptImageUrl, setReceiptImageUrl] = useState("");
    const [sendImageUrl, setSendImageUrl] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [isReceiptSaved, setReceiptSaved] = useState(false);
    const [receiptError, setReceiptError] = useState("");
    const [receiptLoader, setReceiptLoader] = useState(false);

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

    // Receipt upload handlers
    const handleReceiptFileUpload = (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Check file type - only allow JPG and JPEG
        const validTypes = ['image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setReceiptError("Only JPG and JPEG files are supported");
            return;
        }
        
        setReceiptError("");
        setReceiptFile(file);
        setReceiptImageUrl(URL.createObjectURL(file));
    };

    const removeReceiptPhoto = () => {
        setReceiptImageUrl("");
        setReceiptFile(null);
        setReceiptSaved(false);
        setReceiptError("");
    };

    const uploadReceiptImage = async () => {
        if (!receiptFile) return;
        setReceiptLoader(true);
        const imageData = new FormData();
        imageData.append("file", receiptFile);

        try {
            const response = await api.post("/upload-photo", imageData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.imageUrl) {
                setReceiptImageUrl(`${imgUrl}${response.data.imageUrl}`);
                setSendImageUrl(response.data.imageUrl);
                console.log(response.data.imageUrl);
                setReceiptSaved(true);
            }
            setReceiptLoader(false);
        } catch (error) {
            console.error("Error uploading receipt image:", error);
            setReceiptError("Error uploading receipt image. Please try again.");
        }
        finally{
            setReceiptLoader(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoader(true);
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
            receiptPhoto: isReceiptSaved ? sendImageUrl : null,
        };
        console.log("before submit",formData);
        try {
            const response = await api.post("/counsellor/makePayment", formData);
            setResponse(response);
            console.log("after submit",response);
            alert("Payment Successful !!");
            setSubmitLoader(false);
            setShowPayment(false);
            
        } catch (err) {
            setError("Failed to process payment. Please try again.");
        }
        finally{
            setSubmitLoader(false);
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
                </div>
                
                <div className="mb-3">
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

                {/* Receipt Photo Upload Section */}
                <div className="mb-6">
                    <h4 className="text-md font-medium mb-3 text-gray-700">Receipt Photo</h4>
                    <div className="flex flex-col items-center w-full">
                        {receiptImageUrl ? (
                            <>
                                <img 
                                    src={`${receiptImageUrl}`} 
                                    alt="Receipt" 
                                    className="w-56 max-w-md h-auto object-cover rounded-md mb-4"
                                />
                                <div className="flex space-x-4 w-full justify-center">
                                    {!isReceiptSaved && (
                                        <button 
                                            type="button" 
                                            onClick={removeReceiptPhoto} 
                                            disabled={receiptLoader}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                                        >
                                            Remove Receipt
                                        </button>
                                    )}
                                    <button 
                                        type="button" 
                                        onClick={uploadReceiptImage} 
                                        disabled={isReceiptSaved || receiptLoader}
                                        className="px-4 py-2 min-w-28 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 grid place-items-center"
                                    >
                                        {isReceiptSaved ? "Receipt Saved" : (receiptLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Save Receipt")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full">
                                <input 
                                    type="file" 
                                    onChange={handleReceiptFileUpload} 
                                    accept=".jpg,.jpeg"
                                    className="w-full px-3 py-2 border rounded"
                                />
                                {receiptError && <p className="text-red-500 text-sm mt-2">{receiptError}</p>}
                                <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, JPEG</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div>
                    {!error && isReceiptSaved ? (
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