import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../Images/logo3.png';

const Result = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentName: "",
        studentId: "",
        motherName: "",
    });
    const [resultData, setResultData] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [fetchLoader, setFetchLoader] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFetchResult = async (e) => {
        e.preventDefault();
        setFetchLoader(true);
        try {
            const response = await axios.get(`${apiUrl}/result/fetch`, {
                params: {
                    studentName: formData.studentName,
                    studentId: formData.studentId,
                    motherName: formData.motherName,
                }
            });
            setResultData(response.data);
            setShowResult(true);
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
            setFetchLoader(false);
        }
    };

    const handleBack = () => {
        setShowResult(false);
        setResultData(null);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            {!showResult ? (
                <div className="bg-white p-8 shadow-lg rounded-lg w-96">
                    <div className="w-full grid place-items-center mb-4">
                        <img src={logo} className="h-20 p-1 w-auto" alt="Logo" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-6">
                        Student Result
                    </h2>
                    <form onSubmit={handleFetchResult} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter student name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter student ID"
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
                                disabled={fetchLoader}
                                className="w-32 min-h-10 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                            >
                                {fetchLoader ? 
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
                        Student Result
                    </h2>
                    
                    {/* Student Information */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 font-medium">Student Name:</label>
                                <p className="text-gray-800 font-semibold">{formData.studentName}</p>
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium">Student ID:</label>
                                <p className="text-gray-800 font-semibold">{formData.studentId}</p>
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium">Mother Name:</label>
                                <p className="text-gray-800 font-semibold">{formData.motherName}</p>
                            </div>
                            {resultData?.class && (
                                <div>
                                    <label className="block text-gray-600 font-medium">Class:</label>
                                    <p className="text-gray-800 font-semibold">{resultData.class}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Result</h3>
                        
                        {/* Mock result data - replace with actual data structure */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Marks Obtained</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Total Marks</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Replace this with dynamic data from resultData */}
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2">Mathematics</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">85</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">100</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">A</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">Science</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">92</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">100</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">A+</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2">English</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">78</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">100</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">B+</td>
                                    </tr>
                                    <tr className="bg-gray-200 font-semibold">
                                        <td className="border border-gray-300 px-4 py-2">Total</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">255</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">300</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">85%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Overall Result */}
                        <div className="mt-4 p-4 bg-green-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-800">Overall Result:</span>
                                <span className="text-xl font-bold text-green-600">PASS</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-lg font-semibold text-gray-800">Percentage:</span>
                                <span className="text-xl font-bold text-green-600">85.0%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Print Result
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Result;