import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";

const RegistrationTable = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [users, setUsers] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [selectedExamCentre, setSelectedExamCentre] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  useEffect(() => {
    if (user.role === "admin") {
      api
        .get("/admin/getUser")
        .then((response) => {
          const counsellors = response.data.data.filter(
            (user) => user.role === "counsellor"
          );
          setUsers(counsellors);
          // console.log(counsellors);
        })
        .catch((error) => {
          console.error("Error fetching users", error);
        });
    }
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        // console.log(response.data.data);
        setExamCentres(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching exam centers", error);
      });
  }, [user.role]);

  useEffect(() => {
    api
      .get(`/counsellor/getRegister?uuid=${user.uuid}&role=${user.role}`)
      .then((response) => {
        setRegistrations(response.data.data);
        setFiltered(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user?.uuid]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    let filteredResults = registrations.filter(
      (student) =>
        student.studentName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.studentNo.includes(q)
    );

    if (selectedCounsellor) {
      filteredResults = filteredResults.filter(
        (student) => student.createdBy === selectedCounsellor
      );
    }

    if (selectedExamCentre) {
      filteredResults = filteredResults.filter(
        (student) => student.examCentre === selectedExamCentre
      );
    }

    setFiltered(filteredResults);
  }, [searchQuery, registrations, selectedCounsellor, selectedExamCentre]);

  const handlePayment = (student) => {
    const newStudent = {
      studentId: student.studentId,
      studentName: student.studentName,
      counsellor: user.userName,
      createdBy: user.uuid,
      amountRemaining: student.amountRemaining,
    };
    setPaymentData(newStudent);
    setShowPayment(true);
  };

  const handleViewPDF = async (student) => {
    try {
      setLoadingPdfId(student.studentId);

      const response = await api.get("/pdf/registration-form", {
        params: {
          studentId: student.studentId,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = student.studentName
        ? `${student.studentName.replace(/\s+/g, "_")}_FORM.pdf`
        : `${student.studentId}_FORM.pdf`;

      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Student not found!");
      } else if (err.response?.status === 404) {
        alert("PDF generation failed!");
      } else {
        alert("Error generating PDF.");
      }
      console.error(err);
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
      {!showPayment ? (
        <>
          <h1 className="text-3xl font-bold text-primary mb-6">
            Registration Table
          </h1>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg"
            />

            {user.role === "admin" && (
              <select
                value={selectedCounsellor}
                onChange={(e) => setSelectedCounsellor(e.target.value)}
                className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg"
              >
                <option value="">All Counsellors</option>
                {users.map((user) => (
                  <option key={user.uuid} value={user.uuid}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedExamCentre}
              onChange={(e) => setSelectedExamCentre(e.target.value)}
              className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg"
            >
              <option value="">All Exam Centres</option>
              {examCentres.map((centre) => (
                <option key={centre.centerId} value={centre.centerName}>
                  {centre.centerName}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <p className="text-customgray text-lg">Loading...</p>
          )}
          {error && <p className="text-red-500 text-lg">{error}</p>}

          {!loading && !error && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-customgray rounded-xl overflow-hidden shadow-lg text-sm">
                <thead className="bg-primary text-customwhite uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">
                      Register Date
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">Student ID</th>
                    <th className="p-3 text-left whitespace-nowrap">Form No.</th>
                    <th className="p-3 text-left whitespace-nowrap">Name</th>
                    <th className="p-3 text-left whitespace-nowrap">Standard</th>
                    <th className="p-3 text-left whitespace-nowrap">Medium/Group</th>
                    <th className="p-3 text-left whitespace-nowrap">Exam Centre</th>
                    <th className="p-3 text-left whitespace-nowrap">Student No</th>
                    <th className="p-3 text-left whitespace-nowrap">Parent No</th>
                    {user.role === "admin" && (
                      <>
                        <th className="p-3 text-left whitespace-nowrap">Counsellor</th>
                        <th className="p-3 text-left whitespace-nowrap">
                          Counsellor Branch
                        </th>
                      </>
                    )}
                    <th className="p-3 text-left whitespace-nowrap">Total Amount</th>
                    <th className="p-3 text-left whitespace-nowrap">Paid</th>
                    <th className="p-3 text-left whitespace-nowrap">Remaining</th>
                    <th className="p-3 text-left whitespace-nowrap">Due Date</th>
                    <th className="p-3 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {filtered.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 transition"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">{student.studentId}</td>
                      <td className="p-3 whitespace-nowrap">{student.formNo}</td>
                      <td className="p-3 whitespace-nowrap">{student.studentName}</td>
                      <td className="p-3 whitespace-nowrap">{student.standard}</td>
                      <td className="p-3 whitespace-nowrap">{student.branch}</td>
                      <td className="p-3 whitespace-nowrap">{student.examCentre}</td>
                      <td className="p-3 whitespace-nowrap">{student.studentNo}</td>
                      <td className="p-3 whitespace-nowrap">{student.parentsNo}</td>
                      {user.role === "admin" && (
                        <>
                          <td className="p-3 whitespace-nowrap">{student.counsellor}</td>
                          <td className="p-3 whitespace-nowrap">
                            {student.counsellorBranch}
                          </td>
                        </>
                      )}
                      <td className="p-3 whitespace-nowrap">{student.totalAmount}</td>
                      <td className="p-3 whitespace-nowrap text-green-500 font-bold">
                        {student.amountPaid}
                      </td>
                      <td className="p-3 whitespace-nowrap text-red-500 font-bold">
                        {student.amountRemaining}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(student.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap space-x-2">
                        {user.role === "counsellor" && student.amountRemaining > 0 && (
                          <button
                            onClick={() => handlePayment(student)}
                            className="bg-secondary text-white px-3 py-1 rounded hover:bg-tertiary"
                          >
                            Make Payment
                          </button>
                        )}
                        <button
                          onClick={() => handleViewPDF(student)}
                          className="bg-primary text-white px-3 py-1 min-w-12 rounded hover:bg-blue-700 grid place-items-center"
                          disabled={loadingPdfId === student.studentId}
                        >
                          {loadingPdfId === student.studentId ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          ) : (
                            "PDF"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <p className="text-lg text-customgray">No registrations found.</p>
            )
          )}
        </>
      ) : (
        <PaymentForm paymentData={paymentData} setShowPayment={setShowPayment} />
      )}
    </div>
  );
};

export default RegistrationTable;
