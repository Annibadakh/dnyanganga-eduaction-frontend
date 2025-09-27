import React, { useState, useEffect, useRef } from "react";
import api from "../Api";


const AddBookEntry = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedCounsellorName, setSelectedCounsellorName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [counsellorBooks, setCounsellorBooks] = useState([]);
  
  // Book entries for multiple standards - grouped by standard
  const [bookEntries, setBookEntries] = useState({});
  
  // Pamphlet entry
  const [pamphletEntry, setPamphletEntry] = useState({ count: "" });
  
  // Receipt book entries
  const [receiptBookEntries, setReceiptBookEntries] = useState([{ bookNo: "", range: "" }]);
  
  // Challan details
  const [chalanDate, setChalanDate] = useState(new Date().toISOString().split('T')[0]);
  
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
    "10th": ["Math", "Science", "English"],
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
      const res = await api.get("/admin/getUser");
      setCounsellors(res.data.data);
    } catch (err) {
      console.error("Error fetching counsellors", err);
    }
  };

  const loadBooksById = async (id) => {
    if (id) {
      try {
        const res = await api.get(`/admin/getBooksByCounsellor/${id}`);
        // console.log(res);
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

  // Initialize book entries based on all standards - grouped by standard
  const initializeBookEntries = () => {
    const entries = {};
    Object.keys(classOptions).forEach(standard => {
      entries[standard] = {};
      classOptions[standard].forEach(book => {
        entries[standard][book] = "";
      });
    });
    setBookEntries(entries);
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

  const handleBookChange = (standard, book, value) => {
    const updated = { ...bookEntries };
    updated[standard][book] = value;
    setBookEntries(updated);
  };

  const handleReceiptBookChange = (index, field, value) => {
    const updated = [...receiptBookEntries];
    updated[index][field] = value;
    setReceiptBookEntries(updated);
  };

  const addReceiptBookRow = () => {
    setReceiptBookEntries([...receiptBookEntries, { bookNo: "", range: "" }]);
  };

  const removeReceiptBookRow = (index) => {
    const updated = [...receiptBookEntries];
    updated.splice(index, 1);
    setReceiptBookEntries(updated);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validateAndPreparePayload = () => {
    if (!selectedCounsellor) {
      alert("Please select a counsellor");
      return null;
    }

    const payload = {
      chalanDate,
      counsellorId: selectedCounsellor,
      items: []
    };

    // Add book entries (only those with valid count)
    Object.keys(bookEntries).forEach(standard => {
      Object.keys(bookEntries[standard]).forEach(book => {
        const count = bookEntries[standard][book];
        if (count !== "" && parseInt(count) > 0) {
          payload.items.push({
            standard,
            bookName: book,
            totalCount: parseInt(count)
          });
        }
      });
    });

    // Add pamphlet entry if valid
    if (pamphletEntry.count !== "" && parseInt(pamphletEntry.count) > 0) {
      payload.items.push({
        standard: "pamphlet",
        bookName: getCurrentDate(),
        totalCount: parseInt(pamphletEntry.count)
      });
    }

    // Add receipt book entries (only valid ones)
    const validReceiptEntries = receiptBookEntries.filter(entry => 
      entry.bookNo && entry.range !== "" && parseInt(entry.range) > 0
    );
    validReceiptEntries.forEach(entry => {
      payload.items.push({
        standard: "receiptBook",
        bookName: entry.bookNo,
        totalCount: parseInt(entry.range)
      });
    });

    // Check if at least one item is being sent
    if (payload.items.length === 0) {
      alert("Please add at least one entry (book, pamphlet, or receipt book) with valid data");
      return null;
    }

    return payload;
  };

  const resetForm = () => {
    setChalanDate(new Date().toISOString().split('T')[0]);
    initializeBookEntries();
    setPamphletEntry({ count: "" });
    setReceiptBookEntries([{ bookNo: "", range: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = validateAndPreparePayload();
    if (!payload) return;

    try {
      setSubmitLoader(true);
      // console.log("Payload to be sent:", payload);
      
      await api.post("/admin/addBooksWithChalan", payload);
      
      alert("Entry added successfully with challan!");
      
      // Reset form and close it
      resetForm();
      setShowForm(false);
      
      // Reload books for selected counsellor
      if (selectedCounsellor) {
        await loadBooksById(selectedCounsellor);
      }
    } catch (err) {
      console.error("Error adding books with challan", err);
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
                      selectedCounsellor === counsellor.uuid ? 'text-blue-600' : ''
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

  const renderBookEntriesTable = () => {
    return (
      <div className="overflow-auto">
        <table className="w-full border border-gray-300 rounded-lg text-sm">
          <thead className="bg-primary text-white uppercase">
            <tr>
              <th className="p-3 border">Sr. No.</th>
              <th className="p-3 border">Standard</th>
              <th className="p-3 border">Books Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(bookEntries).map((standard, standardIndex) => (
              <tr key={standard} className="text-center border-b hover:bg-gray-100 transition">
                <td className="p-2 border">{standardIndex + 1}</td>
                <td className="p-2 border font-semibold text-primary">{standard}</td>
                <td className="p-2 border">
                  <table className="w-full text-xs border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Book Name</th>
                        <th className="p-2 border">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(bookEntries[standard]).map((book) => (
                        <tr key={book}>
                          <td className="p-2 border font-medium">{book}</td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={bookEntries[standard][book]}
                              onChange={(e) => handleBookChange(standard, book, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
    );
  };

  const renderPamphletEntry = () => (
    <div className=" border rounded-lg p-4">
      <h4 className="text-lg font-semibold text-green-700 mb-3">Pamphlet Entry</h4>
      <div className="overflow-auto">
        <table className="w-full border border-gray-300 rounded-lg text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 border">Standard</th>
              {/* <th className="p-3 border">Date</th> */}
              <th className="p-3 border">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center border-b hover:bg-green-50 transition">
              <td className="p-3 border font-semibold text-green-700">Pamphlet</td>
              {/* <td className="p-3 border text-gray-600">{getCurrentDate()}</td> */}
              <td className="p-3 border">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pamphletEntry.count}
                  onChange={(e) => setPamphletEntry({ count: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReceiptBookEntries = () => (
    <div className=" border border-purple-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-purple-700 mb-3">Receipt Book Entries</h4>
      <div className="overflow-auto">
        <table className="w-full border border-gray-300 rounded-lg text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              {/* <th className="p-3 border">Standard</th> */}
              <th className="p-3 border">Receipt Book No.</th>
              <th className="p-3 border">Page Count</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {receiptBookEntries.map((entry, index) => (
              <tr key={index} className="text-center border-b hover:bg-purple-50 transition">
                {/* <td className="p-3 border font-semibold text-purple-700">Receipt Book</td> */}
                <td className="p-3 border">
                  <input
                    type="text"
                    placeholder="Book Number"
                    value={entry.bookNo}
                    onChange={(e) => handleReceiptBookChange(index, "bookNo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={entry.range}
                    onChange={(e) => handleReceiptBookChange(index, "range", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="p-3 border">
                  <button
                    type="button"
                    onClick={() => removeReceiptBookRow(index)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-lg text-xs transition mr-2"
                    disabled={receiptBookEntries.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addReceiptBookRow}
        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition mt-3"
      >
        + Add Receipt Book
      </button>
    </div>
  );

  const groupedBooks = groupBooksByStandard();

  return (
    <div className="p-1 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Book Management System
      </h1>

      {/* Add Entry Button */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            initializeBookEntries(); // Initialize with all books
          }}
          className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-6 transition"
        >
          Add Entry
        </button>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-lg md:p-6 p-2 mb-6 border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Challan Entry</h2>
          {/* <p className="text-sm text-gray-600 mb-6">
            Create a single challan that can include books, pamphlets, and receipt books for the selected counsellor.
          </p> */}

          <div className="space-y-6">
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

            {/* Challan Details */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Challan Date</label>
              <input
                type="date"
                value={chalanDate}
                onChange={(e) => setChalanDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* <p className="text-sm text-gray-500 mt-1">
                Challan number will be auto-generated (4-digit unique number)
              </p> */}
            </div>

            {/* Entry Type Selection */}
            <div>
              {/* <label className="block mb-2 font-medium text-gray-700">Add Entries</label> */}
              {/* <p className="text-sm text-gray-600 mb-4">
                Fill in any combination of books, pamphlet, or receipt books. All will be included in a single challan.
              </p> */}
            </div>

            {/* Books Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-3">Books Entries</h3>
              {renderBookEntriesTable()}
            </div>

            {/* Pamphlet Section */}
            {renderPamphletEntry()}

            {/* Receipt Books Section */}
            {renderReceiptBookEntries()}

            {/* Form Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoader}
                className={`bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition grid place-items-center ${
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
                  resetForm();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Books Section */}
      <div className="bg-white shadow-lg rounded-lg md:p-6 p-2 border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">View Books by Counsellor</h2>
        
        {/* Counsellor Selection for View */}
        <div className="mb-4">
          <label className="block mb-2 text-black">Select Counsellor</label>
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
                    <td className="p-2 border font-semibold text-primary capitalize">{standard == "receiptBook" ? "receipt book" : standard}</td>
                    <td className="p-2 border">
                      <table className="w-full text-xs border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            {standard !== "pamphlet" && (standard == "receiptBook" ? <th className="p-1 border">Receipt Number</th> : <th className="p-1 border">Book Name</th>)}
                            
                            <th className="p-1 border">Total Count</th>
                            <th className="p-1 border">Distributed</th>
                            <th className="p-1 border">Remaining</th>
                            <th className="p-1 border">New Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedBooks[standard].map((book) => (
                            <tr key={book.id}>
                              {standard !== "pamphlet" && <td className="p-1 border">{book.bookName}</td>}
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