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
        <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
          {!showPayment ? (
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
                          <td className="p-4 whitespace-nowrap">
                            {user.role === "counsellor" && student.amountRemaining > 0 && (
                              <button
                                onClick={() => handlePayment(student)}
                                className="bg-secondary text-customwhite px-4 py-2 rounded-lg hover:bg-tertiary transition"
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
                !loading && <p className="text-lg text-customgray">No registrations found.</p>
              )}
            </>
          ) : (
            <PaymentForm paymentData={paymentData} setShoePayment={setShoePayment} />
          )}
        </div>
      );
      
      
};

export default RegistrationTable;
