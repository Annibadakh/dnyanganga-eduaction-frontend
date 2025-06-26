import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import PaymentForm from "./PaymentForm";

const RegistrationTable = () => {
  const imgUrl = import.meta.env.VITE_IMG_URL;
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
  const [selectedStandard, setSelectedStandard] = useState("");
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (user.role === "admin") {
      api
        .get("/admin/getUser")
        .then((response) => {
          const counsellors = response.data.data.filter(
            (user) => user.role === "counsellor"
          );
          setUsers(counsellors);
          console.log(counsellors);
        })
        .catch((error) => {
          console.error("Error fetching users", error);
        });
    }
    api
      .get("/admin/getExamCenters")
      .then((response) => {
        console.log(response.data.data);
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
        console.log(response.data.data);
        setRegistrations(response.data.data);
        setFiltered(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user?.uuid, showPayment]);

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

    if (selectedStandard) {
      filteredResults = filteredResults.filter(
        (student) => student.standard === selectedStandard
      );
    }

    setFiltered(filteredResults);
  }, [searchQuery, registrations, selectedCounsellor, selectedExamCentre, selectedStandard]);

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
  
  const handleViewPhoto = (photoPath) => {
      if (photoPath) {
        const fullUrl = `${imgUrl}${photoPath}`;
        console.log(fullUrl)
        setSelectedPhoto(fullUrl);
        setShowPhotoModal(true);
      } else {
        alert("Photo not available.");
      }
    };

  const formatTimeTo12Hour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg"
            >
              <option value="">All Standards</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          {loading && (
            <p className="text-customgray text-lg">Loading...</p>
          )}
          {error && <p className="text-red-500 text-lg">{error}</p>}

          {!loading && !error && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border text-center border-customgray rounded-xl overflow-hidden shadow-lg text-sm">
                <thead className="bg-primary text-customwhite uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left border whitespace-nowrap">Sr. No.</th>
                    <th className="p-3 border text-left whitespace-nowrap">
                      Register Date
                    </th>
                    <th className="p-3 text-left border whitespace-nowrap">Register Time</th>
                    <th className="p-3 text-left border whitespace-nowrap">Student ID</th>
                    <th className="p-3 text-left border whitespace-nowrap">Form No.</th>
                    <th className="p-3 text-left border whitespace-nowrap">Student Name</th>
                    <th className="p-3 text-left border whitespace-nowrap">Standard</th>
                    <th className="p-3 text-left border whitespace-nowrap">Med/Grp</th>
                    <th className="p-3 text-left border whitespace-nowrap">Student No.</th>
                    <th className="p-3 text-left border whitespace-nowrap">Parent No.</th>
                    <th className="p-3 text-left border whitespace-nowrap">Exam Centre</th>
                    {user.role === "admin" && (
                      <>
                        <th className="p-3 text-left border whitespace-nowrap">Counsellor</th>
                        <th className="p-3 text-left border whitespace-nowrap">
                          Branch
                        </th>
                      </>
                    )}
                    <th className="p-3 text-left border whitespace-nowrap">Total Amount</th>
                    <th className="p-3 text-left border whitespace-nowrap">Paid</th>
                    <th className="p-3 text-left border whitespace-nowrap">Remaining</th>
                    <th className="p-3 text-left border whitespace-nowrap">Due Date</th>
                    <th className="p-3 text-left border whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {filtered.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 transition"
                    >
                      <td className="p-3 border whitespace-nowrap">{index+1}</td>
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(student.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 border whitespace-nowrap">{formatTimeTo12Hour(student.createdAt)}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentId}</td>
                      <td className="p-3 border whitespace-nowrap">{student.formNo}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentName}</td>
                      <td className="p-3 border whitespace-nowrap">{student.standard}</td>
                      <td className="p-3 border whitespace-nowrap">{student.branch}</td>
                      <td className="p-3 border whitespace-nowrap">{student.studentNo}</td>
                      <td className="p-3 border whitespace-nowrap">{student.parentsNo}</td>
                      <td className="p-3 border whitespace-nowrap">{student.examCentre}</td>
                      {user.role === "admin" && (
                        <>
                          <td className="p-3 border whitespace-nowrap">{student.counsellor}</td>
                          <td className="p-3 border whitespace-nowrap">
                            {student.counsellorBranch}
                          </td>
                        </>
                      )}
                      <td className="p-3 border whitespace-nowrap">{student.totalAmount}</td>
                      <td className="p-3 border whitespace-nowrap text-green-500 font-bold">
                        {student.amountPaid}
                      </td>
                      <td className="p-3 border whitespace-nowrap text-red-500 font-bold">
                        {student.amountRemaining}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(student.dueDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        <div className="flex items-center space-x-2">
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
                          <button
                            onClick={() => handleViewPhoto(student.formPhoto)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            View
                          </button>
                          {user.role === "counsellor" && student.amountRemaining > 0 && (
                            <button
                              onClick={() => handlePayment(student)}
                              className="bg-secondary text-white px-3 py-1 rounded hover:bg-tertiary"
                            >
                              Make Payment
                            </button>
                          )}
                        </div>
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
      {showPhotoModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto p-4">
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-2 right-2 text-black hover:text-gray-800 text-xl"
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4">Form Photo</h2>
          <div className="overflow-auto max-h-[75vh] border rounded">
            <img
              src={selectedPhoto}
              alt="Form"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default RegistrationTable;