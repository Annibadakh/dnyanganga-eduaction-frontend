import React, { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const CounsellorBooks = () => {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [updatingBook, setUpdatingBook] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(null);

  useEffect(() => {
    if (user.uuid) {
      fetchBooks();
      fetchStudents();
    }
  }, [user.uuid]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.studentName?.toLowerCase().includes(searchLower) ||
        student.studentId?.toString().toLowerCase().includes(searchLower) ||
        student.bookSet1?.toLowerCase().includes(searchLower) ||
        student.bookSet2?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

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
      // console.log(res.data.data);
      setStudents(res.data.data);
      setFilteredStudents(res.data.data);
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
      alert("Book marked as received");
    } catch (err) {
      console.error("Error marking book received", err);
    } finally {
      setUpdatingBook(null);
    }
  };

  const callMarkGivenAPI = async (student, bookSet) => {
    if (!window.confirm(`Are you sure you want to mark the ${bookSet} book set as distributed for ${student.Student.studentName}?`)) return;
    const key = `${student.studentId}-${bookSet}`;
    setUpdatingStudent(key);
    try {
      await api.put(`/counsellor/markStudentGiven/${student.studentId}`, {
        bookSet,
      });
      fetchStudents();
      fetchBooks();
      alert(`Books for ${bookSet} marked as given`);
    } catch (err) {
  
      console.error("Error marking student given", err.response?.data?.message);
      alert(err.response?.data?.message || "Error");
    } finally {
      setUpdatingStudent(null);
    }
  };

  // Group books by standard for display
  const groupBooksByStandard = () => {
    const grouped = {};
    books.forEach(book => {
      if (!grouped[book.standard]) {
        grouped[book.standard] = [];
      }
      grouped[book.standard].push(book);
    });
    return grouped;
  };

  const groupedBooks = groupBooksByStandard();

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Book Management System
      </h1>

      {/* --- Book Entries Table --- */}
      <div className="bg-white shadow-custom md:p-6 p-2 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Book Inventory
        </h2>
        {loadingBooks ? (
          <div className="text-center py-4">Loading books...</div>
        ) : books.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
              <thead className="bg-primary text-white uppercase">
                <tr>
                  <th className="p-3 border">Sr. No.</th>
                  <th className="p-3 border">Standard</th>
                  <th className="p-3 border">Books Details</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedBooks).map((standard, standardIndex) => (
                  <tr key={standard} className="text-center border-b hover:bg-gray-100 transition">
                    <td className="p-2 border">{standardIndex + 1}</td>
                    <td className="p-2 border font-semibold text-blue-600">{standard}</td>
                    <td className="p-2 border">
                      <table className="w-full text-xs border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-1 border">Book Name</th>
                            <th className="p-1 border">Total Count</th>
                            <th className="p-1 border">Distributed</th>
                            <th className="p-1 border">Remaining</th>
                            <th className="p-1 border">New Stock</th>
                            <th className="p-1 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedBooks[standard].map((book) => (
                            <tr key={book.id}>
                              <td className="p-1 border">{book.bookName}</td>
                              <td className="p-1 border">{book.totalCount + book.distributedCount}</td>
                              <td className="p-1 border">{book.distributedCount}</td>
                              <td className="p-1 border">{book.totalCount}</td>
                              <td className="p-1 border">{book.newStock}</td>
                              <td className="p-1 border grid place-items-center">
                                {book.newStock > 0 ? (
                                  <button
                                    onClick={() => markBookReceived(book.id)}
                                    disabled={updatingBook === book.id}
                                    className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-2 rounded text-xs grid place-items-center ${
                                      updatingBook === book.id ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {updatingBook === book.id ? (
                                      <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                                    ) : (
                                      "Mark Received"
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No books assigned</p>
        )}
      </div>

      {/* Search Bar for Students */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by student name, ID, or book set..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* --- Students Table --- */}
      <div className="bg-white shadow-custom md:p-6 p-2">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Eligible Students for Book Distribution
        </h2>
        {loadingStudents ? (
          <div className="text-center py-4">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
              <thead className="bg-primary text-white uppercase">
                <tr>
                  <th className="p-3 border">Sr. No.</th>
                  <th className="p-3 border">Student ID</th>
                  <th className="p-3 border">Student Name</th>
                  <th className="p-3 border">Total Fees</th>
                  <th className="p-3 border">Book Sets</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.studentId} className="text-center border-b hover:bg-gray-100 transition">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border font-medium">{student.studentId}</td>
                    <td className="p-2 border font-medium">{student.Student.studentName}</td>
                    <td className="p-2 border text-green-600 font-medium">
                      ₹ {student.totalAmount?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      <table className="w-full text-xs border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-1 border">Book Set</th>
                            <th className="p-1 border">Status</th>
                            <th className="p-1 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.bookSet1 && student.status1 === "not_given" && (
                            <tr>
                              <td className="p-1 border">{student.bookSet1}</td>
                              <td className="p-1 border">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {student.status1.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="p-1 border">
                                <button
                                  onClick={() => callMarkGivenAPI(student, student.bookSet1)}
                                  className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded text-xs grid place-items-center ${
                                    updatingStudent === `${student.studentId}-${student.bookSet1}` ? "opacity-60 cursor-not-allowed" : ""
                                  }`}
                                  disabled={updatingStudent === `${student.studentId}-${student.bookSet1}`}
                                >
                                  {updatingStudent === `${student.studentId}-${student.bookSet1}` ? (
                                    <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                                  ) : (
                                    "Mark Given"
                                  )}
                                </button>
                              </td>
                            </tr>
                          )}
                          {student.bookSet2 && student.status2 === "not_given" && (
                            <tr>
                              <td className="p-1 border">{student.bookSet2}</td>
                              <td className="p-1 border">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {student.status2.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="p-1 border">
                                <button
                                  onClick={() => callMarkGivenAPI(student, student.bookSet2)}
                                  className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded text-xs grid place-items-center ${
                                    updatingStudent === `${student.studentId}-${student.bookSet2}` ? "opacity-60 cursor-not-allowed" : ""
                                  }`}
                                  disabled={updatingStudent === `${student.studentId}-${student.bookSet2}`}
                                >
                                  {updatingStudent === `${student.studentId}-${student.bookSet2}` ? (
                                    <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                                  ) : (
                                    "Mark Given"
                                  )}
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No eligible students found</p>
        )}
      </div>
    </div>
  );
};

export default CounsellorBooks;