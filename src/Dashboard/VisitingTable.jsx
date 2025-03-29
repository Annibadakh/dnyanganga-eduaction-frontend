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
        <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
          <h1 className="text-3xl font-bold text-primary mb-6">Visiting Table</h1>
      
          {loading && <p className="text-customgray text-lg">Loading...</p>}
          {error && <p className="text-red-500 text-lg">{error}</p>}
      
          {!loading && !error && visitingData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border border-customgray rounded-xl overflow-hidden shadow-lg">
                <thead className="bg-primary text-customwhite uppercase text-sm tracking-wider">
                  <tr>
                    {[
                      { key: "id", label: "ID" },
                      { key: "firstName", label: "First Name" },
                      { key: "middleName", label: "Middle Name" },
                      { key: "lastName", label: "Last Name" },
                      { key: "gender", label: "Gender" },
                      { key: "schoolCollege", label: "School/College" },
                      { key: "standard", label: "Standard" },
                      { key: "studentContact", label: "Student Contact" },
                      { key: "parentsContact", label: "Parents Contact" },
                      { key: "address", label: "Address" },
                      { key: "branch", label: "Branch" },
                      { key: "counselorName", label: "Counselor" },
                      { key: "demoGiven", label: "Demo Given" },
                      { key: "reason", label: "Reason" },
                      { key: "date", label: "Date" },
                      { key: "time", label: "Time" }
                    ].map(({ key, label }) => (
                      <th key={key} className="border-b border-customgray p-4 text-left whitespace-nowrap">
                        {label}
                        <button
                          onClick={() => handleSort(key)}
                          className="ml-2 text-secondary hover:text-tertiary transition"
                        >
                          {sortConfig.key === key && sortConfig.direction === "asc" ? "▲" : "▼"}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {visitingData.map((visit, index) => (
                    <tr key={index} className="border-b border-customgray hover:bg-gray-100 transition">
                      <td className="p-4 whitespace-nowrap">{visit.id}</td>
                      <td className="p-4 whitespace-nowrap">{visit.firstName}</td>
                      <td className="p-4 whitespace-nowrap">{visit.middleName}</td>
                      <td className="p-4 whitespace-nowrap">{visit.lastName}</td>
                      <td className="p-4 whitespace-nowrap">{visit.gender}</td>
                      <td className="p-4 whitespace-nowrap">{visit.schoolCollege}</td>
                      <td className="p-4 whitespace-nowrap">{visit.standard}</td>
                      <td className="p-4 whitespace-nowrap">{visit.studentContact}</td>
                      <td className="p-4 whitespace-nowrap">{visit.parentsContact}</td>
                      <td className="p-4 whitespace-nowrap">{visit.address}</td>
                      <td className="p-4 whitespace-nowrap">{visit.branch}</td>
                      <td className="p-4 whitespace-nowrap">{visit.counselorName}</td>
                      <td className="p-4 whitespace-nowrap">{visit.demoGiven}</td>
                      <td className="p-4 whitespace-nowrap">{visit.reason}</td>
                      <td className="p-4 whitespace-nowrap">{new Date(visit.date).toLocaleDateString()}</td>
                      <td className="p-4 whitespace-nowrap">{visit.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && <p className="text-lg text-customgray">No visiting records found.</p>
          )}
        </div>
      );
      
};

export default VisitingTable;
