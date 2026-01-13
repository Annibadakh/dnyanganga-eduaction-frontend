import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../Images/logo3.png';

const Result = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        seatNum: "",
        motherName: "",
    });
     const [standard, setStandard] = useState("");

    const [pdfUrl, setPdfUrl] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [generateLoader, setGenerateLoader] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFetchResult = async (e) => {
        e.preventDefault();
        setGenerateLoader(true);
        console.log(formData);
        try {
            const response = await axios.get(`${apiUrl}/pdf/generate-result`, {
                params: {
                    seatNum: formData.seatNum,
                    motherName: formData.motherName,
                    standard: standard
                },
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
            setShowPreview(true);
        } catch (err) {
            if(err.status === 403){
                alert("Student not found !!");
            }
            else if(err.status === 404){
                alert("Mother name does not match !!");
            }
            else {
                alert("An error occurred while fetching the result.");
            }
        } finally {
            setGenerateLoader(false);
        }
    };

    const handleDownload = () => {
        let fileName = "";
        if(formData.studentName){
            fileName = `${formData.studentName.replace(/\s+/g, "_")}_HallTicket.pdf`;
        }
        else{
            fileName = `${formData.studentId}_HallTicket.pdf`;
        }
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = fileName;
        link.click();
    };

    const handleBack = () => {
        setShowPreview(false);
        setPdfUrl("");
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            {!showPreview ? (
                <div className="bg-white p-8 shadow-lg rounded-lg w-96">
                    <div className="w-full grid place-items-center mb-4">
                        <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-6">
                        Student Result
                    </h2>
                    <form onSubmit={handleFetchResult} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Seat Number</label>
                            <input
                                type="text"
                                name="seatNum"
                                value={formData.seatNum}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter seat number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Mother Name</label>
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter mother's name"
                                required
                            />
                        </div>
                        <select
                            className="w-full rounded border border-gray-300 bg-customwhite px-2 py-1.5 text-sm transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-fourthcolor/40 hover:border-tertiary"
                            value={standard}
                            required
                            onChange={(e) => setStandard(e.target.value)}
                            >
                            <option value="">Select Standard</option>
                            <option value="10th">10th</option>
                            <option value="12th">12th</option>
                            </select>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Back to Home
                            </button>
                            <button
                                type="submit"
                                disabled={generateLoader}
                                className="w-32 min-h-10 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                            >
                                {generateLoader ? 
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> 
                                    : "View Result"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl mx-4">
                    <div className="w-full grid place-items-center mb-4">
                        <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-6">
                        Result Preview
                    </h2>
                    <div className="space-y-4">
                        <iframe
                            id="hall-ticket-preview"
                            src={pdfUrl}
                            width="100%"
                            height="500px"
                            title="Hall Ticket Preview"
                            className="border rounded-lg"
                        ></iframe>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleDownload}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Result;
