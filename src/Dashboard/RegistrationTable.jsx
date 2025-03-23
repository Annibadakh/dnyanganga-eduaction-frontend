import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";

const RegistrationTable = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShoePayment] = useState(false);
    const [paymentData, setPaymentData] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    useEffect(() => {
        api.get(`/counsellor/getRegister?uuid=${user.uuid}&role=${user.role}`)
            .then(response => {
                setRegistrations(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
                setLoading(false);
            });
    }, [user?.uuid]);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedData = [...registrations].sort((a, b) => {
            if (a[key] === null) return 1;
            if (b[key] === null) return -1;
            if (a[key] === b[key]) return 0;

            return direction === "asc"
                ? a[key] > b[key] ? 1 : -1
                : a[key] < b[key] ? 1 : -1;
        });

        setRegistrations(sortedData);
    };

    const handlePayment = (student) => {
        const newStudent = {studentId: student.studentId, studentName: student.studentName, counsellor: user.userName, createdBy: user.uuid, amountRemaining: student.amountRemaining};
        setPaymentData(newStudent);
        setShoePayment(true);
    };

    return (
        <div className="p-4">
            {!showPayment ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">Registration Table</h1>

                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {!loading && !error && registrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-max border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        {[
                                            { key: "studentId", label: "Student ID", width: "120px" },
                                            { key: "studentName", label: "Student Name", width: "200px" },
                                            { key: "schoolCollege", label: "School/College", width: "200px" },
                                            { key: "standard", label: "Standard", width: "100px" },
                                            { key: "studentNo", label: "Contact No.", width: "150px" },
                                            { key: "amountPaid", label: "Amount Paid", width: "150px" },
                                            { key: "amountRemaining", label: "Remaining Amount", width: "180px" },
                                            { key: "dueDate", label: "Due Date", width: "150px" },
                                            { key: "actions", label: "Actions", width: "150px" }
                                        ].map(({ key, label, width }) => (
                                            <th key={key} className="border p-2 text-left" style={{ minWidth: width }}>
                                                {label}
                                                {key !== "actions" && (
                                                    <button onClick={() => handleSort(key)} className="ml-2 text-blue-500">
                                                        {sortConfig.key === key && sortConfig.direction === "asc" ? "▲" : "▼"}
                                                    </button>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((student, index) => (
                                        <tr key={index} className="border">
                                            <td className="border p-2">{student.studentId}</td>
                                            <td className="border p-2">{student.studentName}</td>
                                            <td className="border p-2">{student.schoolCollege}</td>
                                            <td className="border p-2">{student.standard}</td>
                                            <td className="border p-2">{student.studentNo}</td>
                                            <td className="border p-2">{student.amountPaid}</td>
                                            <td className="border p-2">{student.amountRemaining}</td>
                                            <td className="border p-2">{new Date(student.dueDate).toLocaleDateString()}</td>
                                            <td className="border p-2">
                                                {user.role === "counsellor" && student.amountRemaining > 0 && (
                                                    <button
                                                        onClick={() => handlePayment(student)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                    >
                                                        Make Payment
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !loading && <p>No registrations found.</p>
                    )}
                </>
            ) : <PaymentForm paymentData={paymentData} setShoePayment={setShoePayment} />}
        </div>
    );
};

export default RegistrationTable;
