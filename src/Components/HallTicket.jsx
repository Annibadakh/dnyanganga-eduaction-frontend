import { useState } from "react";
import axios from "axios";

const HallTicket = () => {
    const [formData, setFormData] = useState({
        studentName: "",
        studentId: "",
        motherName: "",
    });
    const [pdfUrl, setPdfUrl] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGenerate = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/pdf/generate-preview", {
                params: {
                    studentName: formData.studentName,
                    studentId: formData.studentId,
                    motherName: formData.motherName,
                },
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            setPdfUrl(url);
            setFormData({studentName: "", studentId: "", motherName: "",});
            setShowPreview(true);
        } catch (err) {
            if(err.status == 403){
                alert("Student no found !!");
            }
            else if(err.status == 404){
                alert("Mother name not match !!");
            }
        
        }
    };

    const handleDownload = () => {
        let fileName= "";
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
        <div className="p-4 w-full grid justify-center">
            <h1 className="text-xl text-center">Hall Ticket</h1>
            {!showPreview ? (
                <div id="hall-ticket-form" className="space-y-4 w-96">
                    <div>
                        <label>Student Name:</label>
                        <input
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label>Student ID:</label>
                        <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label>Mother Name:</label>
                        <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <button
                        id="generate-btn"
                        onClick={handleGenerate}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Generate Hall Ticket
                    </button>
                </div>
            ) : (
                <div id="preview-container" className="space-y-4">
                    <iframe
                        id="hall-ticket-preview"
                        src={pdfUrl}
                        width="100%"
                        height="500px"
                        title="Hall Ticket Preview"
                    ></iframe>
                    <div className="flex space-x-4">
                        <button
                            id="back-btn"
                            onClick={handleBack}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Back
                        </button>
                        <button
                            id="download-btn"
                            onClick={handleDownload}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Download
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallTicket;
