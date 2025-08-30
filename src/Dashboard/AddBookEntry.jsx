import React, { useState, useEffect, useRef } from "react";
import api from "../Api";

const AddBookEntry = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [bookOptions, setBookOptions] = useState(["PhysicsI", "ChemistryI", "BiologyI", "MathI", "PhysicsII", "ChemistryII", "BiologyII", "MathII", "Science", "Math", "English"]);
  const [bookEntries, setBookEntries] = useState([{ bookName: "", count: "" }]);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedCounsellorName, setSelectedCounsellorName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [counsellorBooks, setCounsellorBooks] = useState([]);
  
  // Dropdown states for form
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [formInternalSearch, setFormInternalSearch] = useState("");
  const formDropdownRef = useRef(null);
  
  // Dropdown states for view section
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [viewInternalSearch, setViewInternalSearch] = useState("");
  const viewDropdownRef = useRef(null);

  // Class options with their corresponding books
  const classOptions = {
    "SSC": ["English", "Math", "Science"],
    "11th": ["PhysicsI", "ChemistryI", "MathI", "BiologyI"],
    "12th": ["PhysicsII", "ChemistryII", "MathII", "BiologyII"]
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formDropdownRef.current && !formDropdownRef.current.contains(event.target)) {
        setIsFormDropdownOpen(false);
        setFormInternalSearch("");
      }
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target)) {
        setIsViewDropdownOpen(false);
        setViewInternalSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleCounsellorChange = async (id, name) => {
    setSelectedCounsellor(id);
    setSelectedCounsellorName(name);
    await loadBooksById(id);
  };

  // Handle class selection and auto-populate book entries
  const handleClassChange = (classValue) => {
    setSelectedClass(classValue);
    
    if (classValue && classOptions[classValue]) {
      // Auto-populate book entries with the books for selected class
      const classBooks = classOptions[classValue].map(book => ({
        bookName: book,
        count: ""
      }));
      setBookEntries(classBooks);
    } else {
      // Reset to empty entry if no class selected
      setBookEntries([{ bookName: "", count: "" }]);
    }
  };

  // Form dropdown handlers
  const handleFormCounsellorSelect = async (id, name) => {
    await handleCounsellorChange(id, name);
    setIsFormDropdownOpen(false);
    setFormInternalSearch("");
  };

  const toggleFormDropdown = () => {
    setIsFormDropdownOpen(!isFormDropdownOpen);
    if (!isFormDropdownOpen) {
      setFormInternalSearch("");
    }
  };

  // View dropdown handlers
  const handleViewCounsellorSelect = async (id, name) => {
    await handleCounsellorChange(id, name);
    setIsViewDropdownOpen(false);
    setViewInternalSearch("");
  };

  const toggleViewDropdown = () => {
    setIsViewDropdownOpen(!isViewDropdownOpen);
    if (!isViewDropdownOpen) {
      setViewInternalSearch("");
    }
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
    if (!selectedClass) return alert("Please select a class");

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
      setSelectedClass("");
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

  // Filter counsellors by search
  const formFilteredCounsellors = counsellors.filter((c) =>
    c.name.toLowerCase().includes(formInternalSearch.toLowerCase())
  );

  const viewFilteredCounsellors = counsellors.filter((c) =>
    c.name.toLowerCase().includes(viewInternalSearch.toLowerCase())
  );

  // Get available books based on selected class
  const getAvailableBooks = () => {
    if (selectedClass && classOptions[selectedClass]) {
      return classOptions[selectedClass];
    }
    return bookOptions; // fallback to all books if no class selected
  };

  const CustomDropdown = ({ 
    isOpen, 
    toggleDropdown, 
    internalSearch, 
    setInternalSearch, 
    filteredCounsellors, 
    onSelect, 
    selectedName, 
    dropdownRef 
  }) => (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={toggleDropdown}
        className="w-full p-2 border rounded-md cursor-pointer bg-white flex justify-between items-center hover:border-gray-400"
      >
        <span className={selectedName ? "text-black" : "text-gray-500"}>
          {selectedName || "-- Select Counsellor --"}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search counsellor..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {filteredCounsellors.length > 0 ? (
              <>
                <div 
                  onClick={() => onSelect("", "")}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                >
                  -- Select Counsellor --
                </div>
                {filteredCounsellors.map((counsellor) => (
                  <div
                    key={counsellor.uuid}
                    onClick={() => onSelect(counsellor.uuid, counsellor.name)}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${
                      selectedCounsellor === counsellor.uuid ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {counsellor.name}
                  </div>
                ))}
              </>
            ) : (
              <div className="p-2 text-gray-500 text-center">
                No counsellors found matching "{internalSearch}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

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
            <CustomDropdown
              isOpen={isFormDropdownOpen}
              toggleDropdown={toggleFormDropdown}
              internalSearch={formInternalSearch}
              setInternalSearch={setFormInternalSearch}
              filteredCounsellors={formFilteredCounsellors}
              onSelect={handleFormCounsellorSelect}
              selectedName={selectedCounsellorName}
              dropdownRef={formDropdownRef}
            />
          </div>

          {/* Class Selection Dropdown */}
          <div>
            <label className="block mb-2 font-medium">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full p-2 border rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Class --</option>
              <option value="SSC">SSC</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Book Entries</label>
            {selectedClass && (
              <div className="flex flex-col overflow-x-scroll gap-2">
                {bookEntries.map((entry, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <select
                    value={entry.bookName}
                    onChange={(e) => handleBookChange(index, "bookName", e.target.value)}
                    className="p-2 border rounded-md min-w-[150px]"
                    disabled={selectedClass} // Disable if class is selected (auto-populated)
                    >
                    <option value="">-- Select Book --</option>
                    {getAvailableBooks().map(book => (
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
                    {bookEntries.length > 1 && !selectedClass && (
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
            )}
            {/* {!selectedClass && (
              <button
                  type="button"
                  onClick={addBookRow}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-2"
              >
                  Add Another Book
              </button>
            )} */}
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
            onClick={() => {
              setShowForm(false);
              setSelectedClass("");
              setBookEntries([{ bookName: "", count: "" }]);
            }}
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
          <CustomDropdown
            isOpen={isViewDropdownOpen}
            toggleDropdown={toggleViewDropdown}
            internalSearch={viewInternalSearch}
            setInternalSearch={setViewInternalSearch}
            filteredCounsellors={viewFilteredCounsellors}
            onSelect={handleViewCounsellorSelect}
            selectedName={selectedCounsellorName}
            dropdownRef={viewDropdownRef}
          />
        </div>

        {selectedCounsellor && counsellorBooks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border border-gray-300">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-2 border whitespace-nowrap">Sr.</th>
                  <th className="p-2 border whitespace-nowrap">Book Name</th>
                  <th className="p-2 border whitespace-nowrap">Total Count</th>
                  <th className="p-2 border whitespace-nowrap">Remaining Count</th>
                  <th className="p-2 border whitespace-nowrap">Distributed Count</th>
                  <th className="p-2 border whitespace-nowrap">New Stock</th>
                </tr>
              </thead>
              <tbody>
                {counsellorBooks.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-100 border-b">
                    <td className="p-2 border whitespace-nowrap">{i + 1}</td>
                    <td className="p-2 border whitespace-nowrap">{book.bookName}</td>
                    <td className="p-2 border whitespace-nowrap">{book.totalCount + book.distributedCount}</td>
                    <td className="p-2 border whitespace-nowrap">{book.totalCount}</td>
                    <td className="p-2 border whitespace-nowrap">{book.distributedCount}</td>
                    <td className="p-2 border whitespace-nowrap">{book.newStock}</td>
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