import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";
import DownloadRegistration from "./DownloadRegistration";

const RegistrationTable = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentData, setPaymentData] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    useEffect(() => {
        api.get(`/counsellor/getRegister?uuid=${user.uuid}&role=${user.role}`)
            .then(response => {
                setRegistrations(response.data.data);
                console.log(response.data.data);
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
        const newStudent = {
            studentId: student.studentId, 
            studentName: student.studentName, 
            counsellor: user.userName, 
            createdBy: user.uuid, 
            amountRemaining: student.amountRemaining
        };
        setPaymentData(newStudent);
        setShowPayment(true);
    };

    const handleViewPDF = (student) => {
        setSelectedStudent(student);
        setShowRegistration(true);
    };

    return (
        <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
          {!showPayment && !showRegistration ? (
            <>
              <h1 className="text-3xl font-bold text-primary mb-6">Registration Table</h1>
      
              {loading && <p className="text-customgray text-lg">Loading...</p>}
              {error && <p className="text-red-500 text-lg">{error}</p>}
      
              {!loading && !error && registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-customgray rounded-xl overflow-hidden shadow-lg">
                    <thead className="bg-primary text-customwhite uppercase text-sm tracking-wider">
                      <tr>
                        {[
                          { key: "studentId", label: "Student ID" },
                          { key: "studentName", label: "Student Name" },
                          { key: "schoolCollege", label: "School/College" },
                          { key: "standard", label: "Standard" },
                          { key: "studentNo", label: "Contact No." },
                          { key: "amountPaid", label: "Amount Paid" },
                          { key: "amountRemaining", label: "Remaining Amount" },
                          { key: "dueDate", label: "Due Date" },
                          { key: "actions", label: "Actions" }
                        ].map(({ key, label }) => (
                          <th key={key} className="border-b border-customgray p-4 text-left whitespace-nowrap">
                            {label}
                            {key !== "actions" && (
                              <button
                                onClick={() => handleSort(key)}
                                className="ml-2 text-secondary hover:text-tertiary transition"
                              >
                                {sortConfig.key === key && sortConfig.direction === "asc" ? "▲" : "▼"}
                              </button>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-customblack">
                      {registrations.map((student, index) => (
                        <tr key={index} className="border-b border-customgray hover:bg-gray-100 transition">
                          <td className="p-4 whitespace-nowrap">{student.studentId}</td>
                          <td className="p-4 whitespace-nowrap">{student.studentName}</td>
                          <td className="p-4 whitespace-nowrap">{student.schoolCollege}</td>
                          <td className="p-4 whitespace-nowrap">{student.standard}</td>
                          <td className="p-4 whitespace-nowrap">{student.studentNo}</td>
                          <td className="p-4 whitespace-nowrap">{student.amountPaid}</td>
                          <td className="p-4 whitespace-nowrap text-red-500 font-bold">{student.amountRemaining}</td>
                          <td className="p-4 whitespace-nowrap">{new Date(student.dueDate).toLocaleDateString()}</td>
                          <td className="p-4 whitespace-nowrap flex space-x-2">
                            {user.role === "counsellor" && student.amountRemaining > 0 && (
                              <button
                                onClick={() => handlePayment(student)}
                                className="bg-secondary text-customwhite px-3 py-2 rounded-lg hover:bg-tertiary transition text-sm"
                              >
                                Make Payment
                              </button>
                            )}
                            <button
                              onClick={() => handleViewPDF(student)}
                              className="bg-primary text-customwhite px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !loading && <p className="text-lg text-customgray">No registrations found.</p>
              )}
            </>
          ) : showPayment ? (
            <PaymentForm paymentData={paymentData} setShowPayment={setShowPayment} />
          ) : (
            <DownloadRegistration studentData={selectedStudent} setShowRegistration={setShowRegistration} />
          )}
        </div>
      );
};

export default RegistrationTable;