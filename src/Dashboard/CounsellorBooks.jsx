import React, { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const CounsellorBooks = () => {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [updatingBook, setUpdatingBook] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(null);

  // 🔹 Modal state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (user.uuid) {
      fetchBooks();
      fetchStudents();
    }
  }, [user.uuid]);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await api.get(`/admin/getBooksByCounsellor/${user.uuid}`);
      setBooks(res.data.data);
    } catch (err) {
      console.error("Error fetching books", err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get(`/counsellor/getStudentsByCounsellor/${user.uuid}`);
      const filtered = res.data.data.filter((s) => {
        const eligibleSet1 = s.bookSet1 && s.status1 === "not_given";
        const eligibleSet2 = s.bookSet2 && s.status2 === "not_given";
        return eligibleSet1 || eligibleSet2;
      });
      setStudents(filtered);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const markBookReceived = async (bookId) => {
    setUpdatingBook(bookId);
    try {
      await api.put(`/counsellor/markBookReceived/${bookId}`);
      fetchBooks();
    } catch (err) {
      console.error("Error marking book received", err);
    } finally {
      setUpdatingBook(null);
    }
  };

  // 🔹 Mark Given API call
  const callMarkGivenAPI = async (student, setKey) => {
    setUpdatingStudent(student.studentId);
    try {
      await api.put(`/counsellor/markStudentGiven/${student.studentId}`, {
        set: setKey,
      });
      fetchStudents();
      fetchBooks();
      alert(`Books for ${setKey} marked as given`);
    } catch (err) {
      console.error("Error marking student given", err.response?.data?.message);
      alert(err.response?.data?.message || "Error");
    } finally {
      setUpdatingStudent(null);
      setOpenDialog(false);
    }
  };

  // 🔹 Main handler when button clicked
  const handleMarkGiven = (student) => {
    // SSC → always single set1
    if (student.standard === "SSC") {
      callMarkGivenAPI(student, "set1");
      return;
    }

    const { bookSet1, bookSet2, status1, status2 } = student;

    if (!bookSet2) {
      // Only set1 exists
      callMarkGivenAPI(student, "set1");
    } else if (status1 === "not_given" && status2 === "not_given") {
      // Need counsellor choice
      setSelectedStudent(student);
      setOpenDialog(true);
    } else if (status1 === "not_given") {
      callMarkGivenAPI(student, "set1");
    } else if (status2 === "not_given") {
      callMarkGivenAPI(student, "set2");
    } else {
      alert("All sets already given");
    }
  };

  return (
    <div className="p-4 container mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Counsellor Dashboard
      </h1>

      {/* --- Book Entries Table --- */}
      <div className="bg-white p-4 md:p-6 shadow-custom">
        <h2 className="text-xl font-semibold text-secondary mb-4">My Book Entries</h2>
        {loadingBooks ? (
          <p className="text-center">Loading books...</p>
        ) : books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Sr.</th>
                  <th className="p-2 border">Book Name</th>
                  <th className="p-2 border">Total Count</th>
                  <th className="p-2 border">Distributed Count</th>
                  <th className="p-2 border">New Stock</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-100 border-b">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{book.bookName}</td>
                    <td className="p-2 border">{book.totalCount}</td>
                    <td className="p-2 border">{book.distributedCount}</td>
                    <td className="p-2 border">{book.newStock}</td>
                    <td className="p-2 border">
                      {book.newStock > 0 ? (
                        <button
                          onClick={() => markBookReceived(book.id)}
                          disabled={updatingBook === book.id}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {updatingBook === book.id ? "..." : "Mark Received"}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No books assigned</p>
        )}
      </div>

      {/* --- Students Table --- */}
      <div className="bg-white p-4 md:p-6 shadow-custom">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          My Students (Eligible for Books)
        </h2>
        {loadingStudents ? (
          <p className="text-center">Loading students...</p>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Sr.</th>
                  <th className="p-2 border">Student ID</th>
                  <th className="p-2 border">Student Name</th>
                  <th className="p-2 border">Standard</th>
                  <th className="p-2 border">Total Fees</th>
                  <th className="p-2 border">Remaining</th>
                  <th className="p-2 border">Book Set 1</th>
                  <th className="p-2 border">Book Set 2</th>
                  <th className="p-2 border">Status1</th>
                  <th className="p-2 border">Status2</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.studentId} className="hover:bg-gray-100 border-b">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{student.studentId}</td>
                    <td className="p-2 border">{student.studentName}</td>
                    <td className="p-2 border">{student.standard}</td>
                    <td className="p-2 border">{student.totalAmount}</td>
                    <td className="p-2 border">{student.amountRemaining}</td>
                    <td className="p-2 border">{student.bookSet1}</td>
                    <td className="p-2 border">{student.bookSet2 || "-"}</td>
                    <td className="p-2 border">{student.status1}</td>
                    <td className="p-2 border">{student.bookSet2 ? `${student.status2}` : "-"}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleMarkGiven(student)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={updatingStudent === student.studentId}
                      >
                        {updatingStudent === student.studentId ? "..." : "Mark Given"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No eligible students found</p>
        )}
      </div>

      {/* --- Modal (Only when 2 sets available & both not_given) --- */}
      {openDialog && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Select Book Set for {selectedStudent.studentName}
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => callMarkGivenAPI(selectedStudent, "set1")}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {selectedStudent.bookSet1}
              </button>
              <button
                onClick={() => callMarkGivenAPI(selectedStudent, "set2")}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                {selectedStudent.bookSet2}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorBooks;
