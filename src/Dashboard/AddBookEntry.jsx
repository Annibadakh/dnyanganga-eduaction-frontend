import React, { useState, useEffect, useRef } from "react";
import api from "../Api";

const AddBookEntry = () => {
  const [counsellors, setCounsellors] = useState([]);
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
    "10th": ["English", "Math", "Science"],
    "11th": ["Physics", "Chemistry", "Math", "Biology"],
    "12th": ["Physics", "Chemistry", "Math", "Biology"]
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
    if (!selectedCounsellor) {
      alert("Please select a counsellor");
      return;
    }
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    for (let entry of bookEntries) {
      if (!entry.bookName || !entry.count || entry.count <= 0) {
        alert("Please fill all book names and valid counts");
        return;
      }
    }

    const payload = bookEntries.map(entry => ({
      counsellorId: selectedCounsellor,
      standard: selectedClass, // Now sending standard instead of embedding in bookName
      bookName: entry.bookName,
      newStock: entry.count
    }));

    try {
      setSubmitLoader(true);
      console.log("Payload to be sent:", payload);
      await api.post("/admin/addBooks", { books: payload });
      
      alert("Book entries added successfully!");
      setBookEntries([{ bookName: "", count: "" }]);
      setSelectedClass("");
      await loadBooksById(selectedCounsellor); // Refresh the books list
    } catch (err) {
      console.error("Error adding books", err);
      alert("Something went wrong");
    } finally {
      setSubmitLoader(false);
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
    return ["Physics", "Chemistry", "Math", "Biology", "English", "Science"]; // fallback to all books
  };

  // Group books by standard for display
  const groupBooksByStandard = () => {
    const grouped = {};
    counsellorBooks.forEach(book => {
      if (!grouped[book.standard]) {
        grouped[book.standard] = [];
      }
      grouped[book.standard].push(book);
    });
    return grouped;
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
        className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search counsellor..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className={`p-2 hover:bg-gray-100 cursor-pointer transition ${
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

  const groupedBooks = groupBooksByStandard();

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Book Management System
      </h1>

      {/* Add Entry Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mb-6 transition"
        >
          Add Entry
        </button>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white shadow-custom md:p-6 p-2 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Book Entry</h2>

          <div className="space-y-4">
            {/* Counsellor Selection */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Select Counsellor</label>
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

            {/* Standard Selection */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Select Standard</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Standard --</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>
            </div>

            {/* Book Entries */}
            {selectedClass && (
              <div>
                <label className="block mb-2 font-medium text-gray-700">Book Entries</label>
                <div className="overflow-auto">
                  <table className="w-full border border-gray-300 rounded-lg text-sm">
                    <thead className="bg-blue-500 text-white uppercase">
                      <tr>
                        <th className="p-3 border">Book Name</th>
                        <th className="p-3 border">Count</th>
                        {bookEntries.length > 1 && !selectedClass && (
                          <th className="p-3 border">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {bookEntries.map((entry, index) => (
                        <tr key={index} className="text-center border-b hover:bg-gray-100 transition">
                          <td className="p-2 border">
                            <select
                              value={entry.bookName}
                              onChange={(e) => handleBookChange(index, "bookName", e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={selectedClass}
                            >
                              <option value="">-- Select Book --</option>
                              {getAvailableBooks().map(book => (
                                <option key={book} value={book}>{book}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              min="1"
                              placeholder="Count"
                              value={entry.count}
                              onChange={(e) => handleBookChange(index, "count", e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          {bookEntries.length > 1 && !selectedClass && (
                            <td className="p-2 border">
                              <button
                                type="button"
                                onClick={() => removeBookRow(index)}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-lg text-xs transition"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoader}
                className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition grid place-items-center ${
                  submitLoader ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {submitLoader ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
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
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Books Section */}
      <div className="bg-white shadow-custom md:p-6 p-2">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">View Books by Counsellor</h2>
        
        {/* Counsellor Selection for View */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Select Counsellor</label>
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

        {/* Books Table */}
        {selectedCounsellor && counsellorBooks.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full border border-gray-300 rounded-lg text-sm whitespace-nowrap">
              <thead className="bg-blue-500 text-white uppercase">
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
        )}
        
        {/* No Books Message */}
        {selectedCounsellor && counsellorBooks.length === 0 && (
          <p className="text-center text-gray-500 py-4">No books found for this counsellor</p>
        )}
      </div>
    </div>
  );
};

export default AddBookEntry;