import React, { useState, useEffect } from "react";
import api from "../Api";

const AddBookEntry = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [bookOptions, setBookOptions] = useState(["PhysicsI", "ChemistryI", "BiologyI", "MathI", "PhysicsII", "ChemistryII", "BiologyII", "MathII", "Science", "Math", "English"]);
  const [bookEntries, setBookEntries] = useState([{ bookName: "", count: "" }]);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [counsellorBooks, setCounsellorBooks] = useState([]);

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    try {
      const res = await api.get("/admin/getUser?role=counsellor");
      setCounsellors(res.data.data);
    } catch (err) {
      console.error("Error fetching counsellors", err);
    }
  };

  const loadBooksById = async (id) => {
    if (id) {
      try {
        const res = await api.get(`/admin/getBooksByCounsellor/${id}`);
        setCounsellorBooks(res.data.data);
      } catch (err) {
        console.error("Error fetching books for counsellor", err);
      }
    } else {
      setCounsellorBooks([]);
    }
  };

  const handleCounsellorChange = async (e) => {
    const id = e.target.value;
    setSelectedCounsellor(id);
    await loadBooksById(id);
    
  };

  const handleBookChange = (index, field, value) => {
    const updated = [...bookEntries];
    updated[index][field] = value;
    setBookEntries(updated);
  };

  const addBookRow = () => setBookEntries([...bookEntries, { bookName: "", count: "" }]);
  const removeBookRow = (index) => {
    const updated = [...bookEntries];
    updated.splice(index, 1);
    setBookEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCounsellor) return alert("Please select a counsellor");

    for (let entry of bookEntries) {
      if (!entry.bookName || !entry.count || entry.count <= 0) {
        return alert("Please fill all book names and valid counts");
      }
    }

    const payload = bookEntries.map(entry => ({
      counsellorId: selectedCounsellor,
      bookName: entry.bookName,
      newStock: entry.count
    }));

    try {
      setSubmitLoader(true);
      await api.post("/admin/addBooks", { books: payload });
      alert("Book entries added successfully!");
      setBookEntries([{ bookName: "", count: "" }]);
      fetchCounsellorBooks(selectedCounsellor); // refresh displayed books
    } catch (err) {
      console.error("Error adding books", err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitLoader(false);
      await loadBooksById(selectedCounsellor);
    }
  };

  const fetchCounsellorBooks = async (id) => {
    try {
      const res = await api.get(`/admin/books/${id}`);
      setCounsellorBooks(res.data.data);
    } catch (err) {
      console.error("Error fetching books for counsellor", err);
    }
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">Book Management</h1>

      {/* --- Add Entry Form --- */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-6"
        >
          Add Entry
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 shadow-custom space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">Add New Book Entry</h2>

          <div>
            <label className="block mb-2 font-medium">Select Counsellor</label>
            <select value={selectedCounsellor} onChange={handleCounsellorChange} className="w-full p-2 border rounded-md">
              <option value="">-- Select Counsellor --</option>
              {counsellors.map(c => (
                <option key={c.uuid} value={c.uuid}>{c.name}</option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="block mb-2 font-medium">Book Entries</label>
            <div className="flex flex-col overflow-x-scroll gap-2">
                {bookEntries.map((entry, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <select
                    value={entry.bookName}
                    onChange={(e) => handleBookChange(index, "bookName", e.target.value)}
                    className="p-2 border rounded-md min-w-[150px]"
                    >
                    <option value="">-- Select Book --</option>
                    {bookOptions.map(book => (
                        <option key={book} value={book}>{book}</option>
                    ))}
                    </select>
                    <input
                    type="number"
                    min="1"
                    placeholder="Count"
                    value={entry.count}
                    onChange={(e) => handleBookChange(index, "count", e.target.value)}
                    className="p-2 border rounded-md w-24"
                    />
                    {bookEntries.length > 1 && (
                    <button
                        type="button"
                        onClick={() => removeBookRow(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    >
                        Remove
                    </button>
                    )}
                </div>
                ))}
            </div>
            <button
                type="button"
                onClick={addBookRow}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-2"
            >
                Add Another Book
            </button>
            </div>


          <button
            type="submit"
            disabled={submitLoader}
            className="bg-primary text-white px-4 py-2 mr-5 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitLoader ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : (
              "Submit"
            )}
          </button>
          <button
            type="button"
            disabled={submitLoader}
            onClick={() => setShowForm(false)}
            className="bg-yellow-300 text-white px-4 py-2 rounded-md hover:bg-yellow-400 disabled:opacity-50"
          >Cancel
          </button>
        </form>
      )}

      {/* --- Counsellor Selection & Book Table --- */}
      <div className="bg-white p-4 md:p-6 shadow-custom">
        <h2 className="text-xl font-semibold text-secondary mb-4">View Books by Counsellor</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Counsellor</label>
          <select value={selectedCounsellor} onChange={handleCounsellorChange} className="w-full p-2 border rounded-md">
            <option value="">-- Select Counsellor --</option>
            {counsellors.map(c => (
              <option key={c.uuid} value={c.uuid}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedCounsellor && counsellorBooks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border">Sr.</th>
                  <th className="p-2 border">Book Name</th>
                  <th className="p-2 border">Total Count</th>
                  <th className="p-2 border">Distributed Count</th>
                  <th className="p-2 border">New Stock</th>
                </tr>
              </thead>
              <tbody>
                {counsellorBooks.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-100 border-b">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{book.bookName}</td>
                    <td className="p-2 border">{book.totalCount}</td>
                    <td className="p-2 border">{book.distributedCount}</td>
                    <td className="p-2 border">{book.newStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedCounsellor && counsellorBooks.length === 0 && (
          <p className="text-center text-gray-500">No books found for this counsellor</p>
        )}
      </div>
    </div>
  );
};

export default AddBookEntry;
