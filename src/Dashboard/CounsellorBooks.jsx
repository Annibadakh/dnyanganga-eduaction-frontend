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
  const [updatingStudent, setUpdatingStudent] = useState(null); // holds studentId-setKey

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
      const res = await api.get(
        `/counsellor/getStudentsByCounsellor/${user.uuid}`
      );
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

  // 🔹 Mark Given API call (per book set)
  const callMarkGivenAPI = async (student, setKey) => {
    const key = `${student.studentId}-${setKey}`;
    setUpdatingStudent(key);
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
    }
  };

  return (
    <div className="p-4 container mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        My Book Details
      </h1>

      {/* --- Book Entries Table --- */}
      <div className="bg-white p-4 md:p-6 shadow-custom">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          My Book Table
        </h2>
        {loadingBooks ? (
          <p className="text-center">Loading books...</p>
        ) : books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Sr. No.</th>
                  <th className="p-2 border whitespace-nowrap">Book Name</th>
                  <th className="p-2 border whitespace-nowrap">Total Count</th>
                  <th className="p-2 border whitespace-nowrap">
                    Distributed Count
                  </th>
                  <th className="p-2 border whitespace-nowrap">Remaining Count</th>
                  <th className="p-2 border whitespace-nowrap">New Stock</th>
                  <th className="p-2 border whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-100 border-b">
                    <td className="p-2 border whitespace-nowrap">{i + 1}</td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.bookName}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.totalCount + book.distributedCount}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.distributedCount}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.totalCount}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.newStock}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {book.newStock > 0 ? (
                        <button
                          onClick={() => markBookReceived(book.id)}
                          disabled={updatingBook === book.id}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:opacity-50 whitespace-nowrap"
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
            <table className="table-auto min-w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Sr. No.</th>
                  <th className="p-2 border whitespace-nowrap">Student ID</th>
                  <th className="p-2 border whitespace-nowrap">Student Name</th>
                  <th className="p-2 border whitespace-nowrap">Standard</th>
                  <th className="p-2 border whitespace-nowrap">Total Fees</th>
                  {/* <th className="p-2 border whitespace-nowrap">Remaining</th> */}
                  <th className="p-2 border whitespace-nowrap">Book Set</th>
                  <th className="p-2 border whitespace-nowrap">Status</th>
                  <th className="p-2 border whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.flatMap((s, si) => {
                  const sets = [];
                  if (s.bookSet1) {
                    sets.push({
                      ...s,
                      bookSet: s.bookSet1,
                      status: s.status1,
                      setKey: "set1",
                    });
                  }
                  if (s.bookSet2) {
                    sets.push({
                      ...s,
                      bookSet: s.bookSet2,
                      status: s.status2,
                      setKey: "set2",
                    });
                  }

                  return sets.map((row, ri) => (
                    <tr
                      key={`${row.studentId}-${row.setKey}`}
                      className="hover:bg-gray-100 border-b"
                    >
                      {ri === 0 && (
                        <>
                          <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            {si + 1}
                          </td>
                          <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            {row.studentId}
                          </td>
                          <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            {row.studentName}
                          </td>
                          <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            {row.standard}
                          </td>
                          <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            ₹ {row.totalAmount}
                          </td>
                          {/* <td
                            rowSpan={sets.length}
                            className="p-2 border whitespace-nowrap"
                          >
                            {row.amountRemaining}
                          </td> */}
                        </>
                      )}
                      <td className="p-2 border whitespace-nowrap">
                        {row.bookSet}
                      </td>
                      <td className="p-2 border whitespace-nowrap">
                        {row.status}
                      </td>
                      <td className="p-2 border whitespace-nowrap">
                        <button
                          onClick={() => callMarkGivenAPI(row, row.setKey)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
                          disabled={
                            updatingStudent === `${row.studentId}-${row.setKey}` ||
                            row.status === "given"
                          }
                        >
                          {updatingStudent === `${row.studentId}-${row.setKey}`
                            ? "..."
                            : "Mark Given"}
                        </button>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No eligible students found</p>
        )}
      </div>
    </div>
  );
};

export default CounsellorBooks;
