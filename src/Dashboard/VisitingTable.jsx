import React, { useState, useEffect } from "react";
import api from "../Api";

const VisitingTable = () => {
    const [visitingData, setVisitingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    useEffect(() => {
        api.get(`/counsellor/getVisiting`)
            .then(response => {
                setVisitingData(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
                setLoading(false);
            });
    }, []);

    // Sorting function
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedData = [...visitingData].sort((a, b) => {
            if (a[key] === null) return 1;
            if (b[key] === null) return -1;
            if (a[key] === b[key]) return 0;

            return direction === "asc" 
                ? a[key] > b[key] ? 1 : -1 
                : a[key] < b[key] ? 1 : -1;
        });

        setVisitingData(sortedData);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Visiting Table</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && visitingData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-max border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                {[
                                    { key: "id", label: "ID", width: "80px" },
                                    { key: "firstName", label: "First Name", width: "150px" },
                                    { key: "middleName", label: "Middle Name", width: "150px" },
                                    { key: "lastName", label: "Last Name", width: "150px" },
                                    { key: "gender", label: "Gender", width: "100px" },
                                    { key: "schoolCollege", label: "School/College", width: "200px" },
                                    { key: "standard", label: "Standard", width: "100px" },
                                    { key: "studentContact", label: "Student Contact", width: "150px" },
                                    { key: "parentsContact", label: "Parents Contact", width: "150px" },
                                    { key: "address", label: "Address", width: "250px" },
                                    { key: "branch", label: "Branch", width: "150px" },
                                    { key: "counselorName", label: "Counselor", width: "200px" },
                                    { key: "demoGiven", label: "Demo Given", width: "120px" },
                                    { key: "reason", label: "Reason", width: "200px" },
                                    { key: "date", label: "Date", width: "150px" },
                                    { key: "time", label: "Time", width: "150px" }
                                ].map(({ key, label, width }) => (
                                    <th key={key} className="border p-2 text-left" style={{ minWidth: width }}>
                                        {label}
                                        <button onClick={() => handleSort(key)} className="ml-2 text-blue-500">
                                            {sortConfig.key === key && sortConfig.direction === "asc" ? "▲" : "▼"}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visitingData.map((visit, index) => (
                                <tr key={index} className="border">
                                    <td className="border p-2">{visit.id}</td>
                                    <td className="border p-2">{visit.firstName}</td>
                                    <td className="border p-2">{visit.middleName}</td>
                                    <td className="border p-2">{visit.lastName}</td>
                                    <td className="border p-2">{visit.gender}</td>
                                    <td className="border p-2">{visit.schoolCollege}</td>
                                    <td className="border p-2">{visit.standard}</td>
                                    <td className="border p-2">{visit.studentContact}</td>
                                    <td className="border p-2">{visit.parentsContact}</td>
                                    <td className="border p-2">{visit.address}</td>
                                    <td className="border p-2">{visit.branch}</td>
                                    <td className="border p-2">{visit.counselorName}</td>
                                    <td className="border p-2">{visit.demoGiven}</td>
                                    <td className="border p-2">{visit.reason}</td>
                                    <td className="border p-2">{new Date(visit.date).toLocaleDateString()}</td>
                                    <td className="border p-2">{visit.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p>No visiting records found.</p>
            )}
        </div>
    );
};

export default VisitingTable;
