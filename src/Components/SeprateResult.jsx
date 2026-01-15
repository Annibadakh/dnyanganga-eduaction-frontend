import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../Images/logo3.png';

const SeprateResult = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        seatNum: "DE",
        motherName: "",
    });
    const [standard, setStandard] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [generateLoader, setGenerateLoader] = useState(false);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.toUpperCase() });
        setError(""); // Clear error on input change
    };

    const handleStandardChange = (e) => {
        setStandard(e.target.value);
        setError("");
    };

    const getErrorMessage = (err) => {
        if (err.response) {
            const status = err.response.status;
            const errorData = err.response.data;
            
            // If backend sends JSON error
            if (errorData?.error) {
                return errorData.error;
            }
            
            // Status-based messages
            switch (status) {
                case 400:
                    return "Please check seat number";
                case 403:
                    return "Student not found. Please verify your seat number.";
                case 404:
                    return "Mother's name does not match our records. Please check and try again.";
                case 500:
                    return "Server error. Please try again later.";
                default:
                    return "An unexpected error occurred. Please try again.";
            }
        } else if (err.request) {
            return "Network error. Please check your internet connection.";
        } else {
            return "An error occurred while processing your request.";
        }
    };

    const handleFetchResult = async (e) => {
        e.preventDefault();
        setError("");
        setGenerateLoader(true);

        // Trim and validate inputs
        const trimmedSeatNum = formData.seatNum.trim();
        const trimmedMotherName = formData.motherName.trim();

        if (!trimmedSeatNum || !trimmedMotherName || !standard) {
            setError("All fields are required");
            setGenerateLoader(false);
            return;
        }

        try {
            const response = await axios.get(`${apiUrl}/pdf/generate-seprate-result`, {
                params: {
                    seatNum: trimmedSeatNum,
                    motherName: trimmedMotherName,
                    standard: standard
                },
                responseType: "blob",
                timeout: 30000, // 30 second timeout
            });

            // Verify we got a PDF
            if (response.data.type !== 'application/pdf') {
                throw new Error('Invalid response format');
            }

            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
            setShowPreview(true);
            setError("");
        } catch (err) {
            console.error("Error fetching result:", err);
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
        } finally {
            setGenerateLoader(false);
        }
    };

    const handleDownload = () => {
        if (!pdfUrl) return;

        const fileName = `Result_${formData.seatNum}_${standard}.pdf`;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInBrowser = () => {
        if (!pdfUrl) return;
        window.open(pdfUrl, '_blank');
    };

    const handleBack = () => {
        setShowPreview(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl("");
        setError("");
    };

    const handleReset = () => {
        setFormData({
            seatNum: "",
            motherName: "",
        });
        setStandard("");
        setError("");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {!showPreview ? (
                <div className="bg-white p-6 sm:p-8 shadow-xl rounded-xl w-full max-w-md">
                    {/* Logo */}
                    <div className="w-full grid place-items-center mb-6">
                        <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
                        Student Result
                    </h2>
                    <p className="text-center text-gray-600 mb-6 text-sm">
                        Enter your details to view your examination result
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                            <div className="flex items-start">
                                <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-md font-medium text-red-800">Error</h3>
                                    <p className="text-md text-red-700 mt-1">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError("")}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleFetchResult} className="space-y-4">
                        {/* Seat Number */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-md">
                                Seat Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="seatNum"
                                value={formData.seatNum}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="e.g., DE01001"
                                required
                                maxLength={7}
                            />
                        </div>

                        {/* Mother Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-md">
                                Mother's Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Enter mother's name"
                                required
                                maxLength={100}
                            />
                            <p className="text-sm text-gray-500 mt-1">Enter as per registration records</p>
                        </div>

                        {/* Standard */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-md">
                                Standard <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                                value={standard}
                                required
                                onChange={handleStandardChange}
                            >
                                <option value="">Select Standard</option>
                                <option value="10th">10th Standard</option>
                                <option value="12th">12th Standard</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {/* <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                Back to Home
                            </button> */}
                            <button
                                type="submit"
                                disabled={generateLoader}
                                className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                            >
                                {generateLoader ? (
                                    <>
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                        Loading...
                                    </>
                                ) : (
                                    "View Result"
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            ) : (
                <div className="bg-white p-4 sm:p-8 shadow-xl rounded-xl w-full max-w-5xl mx-4">
                    {/* Logo */}
                    <div className="w-full grid place-items-center mb-4">
                        <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
                        Result Preview
                    </h2>
                    <p className="text-center text-gray-600 mb-6 text-sm">
                        Seat Number: <span className="font-semibold">{formData.seatNum}</span> | Standard: <span className="font-semibold">{standard}</span>
                    </p>

                    <div className="space-y-4">
                        {/* PDF Preview */}
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <iframe
                                id="result-preview"
                                src={pdfUrl}
                                width="100%"
                                height="600px"
                                title="Result Preview"
                                className="w-full"
                                style={{ minHeight: isMobile ? '400px' : '600px' }}
                            ></iframe>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={handleBack}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            {isMobile && (
                                <button
                                    onClick={handleOpenInBrowser}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open in Browser
                                </button>
                            )}

                            <button
                                onClick={handleDownload}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        </div>

                        {/* Mobile Info */}
                        {isMobile && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            For better viewing experience on mobile, use the "Open in Browser" button above.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeprateResult;