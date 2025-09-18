import React, { useState, useEffect, useRef } from "react";
import api from "../Api";

const ChallanManagement = () => {
  const [challans, setChallans] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter states
  const [filterCounsellor, setFilterCounsellor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [searchChallanNo, setSearchChallanNo] = useState("");

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const dropdownRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [challansPerPage] = useState(10);

  // Statistics
  const [stats, setStats] = useState({
    totalChallans: 0,
    totalItems: 0,
    totalBooks: 0,
    totalPamphlets: 0,
    totalReceiptBooks: 0,
    totalCounsellors: 0
  });

  useEffect(() => {
    fetchAllChallans();
    fetchCounsellors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setInternalSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [challans, filterCounsellor, filterDateFrom, filterDateTo, searchChallanNo]);

  const fetchAllChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/chalans");
      setChallans(res.data.data);
      calculateStats(res.data.data);
    } catch (err) {
      console.error("Error fetching challans", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const res = await api.get("/admin/getUser?role=counsellor");
      setCounsellors(res.data.data);
    } catch (err) {
      console.error("Error fetching counsellors", err);
    }
  };

  const calculateStats = (challanData) => {
    const uniqueCounsellors = new Set();
    let totalItems = 0;
    let totalBooks = 0;
    let totalPamphlets = 0;
    let totalReceiptBooks = 0;

    challanData.forEach(challan => {
      uniqueCounsellors.add(challan.counsellorId);
      
      if (challan.items) {
        totalItems += challan.items.length;
        
        challan.items.forEach(item => {
          if (item.book) {
            if (item.book.standard === 'pamphlet') {
              totalPamphlets += item.countSent;
            } else if (item.book.standard === 'receiptBook') {
              totalReceiptBooks += item.countSent;
            } else {
              totalBooks += item.countSent;
            }
          }
        });
      }
    });

    setStats({
      totalChallans: challanData.length,
      totalItems,
      totalBooks,
      totalPamphlets,
      totalReceiptBooks,
      totalCounsellors: uniqueCounsellors.size
    });
  };

  const applyFilters = () => {
    let filtered = [...challans];

    // Filter by counsellor
    if (filterCounsellor) {
      filtered = filtered.filter(challan => challan.counsellorId === filterCounsellor);
    }

    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter(challan => 
        new Date(challan.date) >= new Date(filterDateFrom)
      );
    }
    if (filterDateTo) {
      filtered = filtered.filter(challan => 
        new Date(challan.date) <= new Date(filterDateTo)
      );
    }

    // Search by challan number
    if (searchChallanNo) {
      filtered = filtered.filter(challan => 
        challan.chalanNo.toLowerCase().includes(searchChallanNo.toLowerCase())
      );
    }

    setFilteredChallans(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilterCounsellor("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSearchChallanNo("");
    setInternalSearch("");
  };

  const getCounsellorName = (counsellorId) => {
    const counsellor = counsellors.find(c => c.uuid === counsellorId);
    return counsellor ? counsellor.name : "Unknown Counsellor";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const viewChallanDetails = (challan) => {
    setSelectedChallan(challan);
    setShowDetails(true);
  };

  // Filter counsellors by search
  const filteredCounsellors = counsellors.filter((c) =>
    c.name.toLowerCase().includes(internalSearch.toLowerCase())
  );

  // Pagination logic
  const indexOfLastChallan = currentPage * challansPerPage;
  const indexOfFirstChallan = indexOfLastChallan - challansPerPage;
  const currentChallans = filteredChallans.slice(indexOfFirstChallan, indexOfLastChallan);
  const totalPages = Math.ceil(filteredChallans.length / challansPerPage);

  const CustomDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={filterCounsellor ? "text-black" : "text-gray-500"}>
          {filterCounsellor ? getCounsellorName(filterCounsellor) : "All Counsellors"}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search counsellor..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            <div 
              onClick={() => {
                setFilterCounsellor("");
                setIsDropdownOpen(false);
                setInternalSearch("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer text-gray-500"
            >
              All Counsellors
            </div>
            {filteredCounsellors.map((counsellor) => (
              <div
                key={counsellor.uuid}
                onClick={() => {
                  setFilterCounsellor(counsellor.uuid);
                  setIsDropdownOpen(false);
                  setInternalSearch("");
                }}
                className={`p-2 hover:bg-gray-100 cursor-pointer transition ${
                  filterCounsellor === counsellor.uuid ? 'text-primary bg-blue-50' : ''
                }`}
              >
                {counsellor.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderChallanDetailsModal = () => {
    if (!showDetails || !selectedChallan) return null;

    const groupItemsByType = () => {
      const grouped = {
        books: [],
        pamphlets: [],
        receiptBooks: []
      };

      selectedChallan.items?.forEach(item => {
        if (item.book) {
          if (item.book.standard === 'pamphlet') {
            grouped.pamphlets.push(item);
          } else if (item.book.standard === 'receiptBook') {
            grouped.receiptBooks.push(item);
          } else {
            grouped.books.push(item);
          }
        }
      });

      return grouped;
    };

    const groupedItems = groupItemsByType();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Challan Details - {selectedChallan.chalanNo}
                </h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>Date: {formatDate(selectedChallan.date)}</span>
                  <span>Counsellor: {getCounsellorName(selectedChallan.counsellorId)}</span>
                  <span>Total Items: {selectedChallan.items?.length || 0}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Books Section */}
            {groupedItems.books.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Books ({groupedItems.books.length} items)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="p-3 border text-left">Standard</th>
                        <th className="p-3 border text-left">Book Name</th>
                        <th className="p-3 border text-center">Count Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems.books.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border font-semibold">{item.book.standard}</td>
                          <td className="p-2 border">{item.book.bookName}</td>
                          <td className="p-2 border text-center">{item.countSent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pamphlets Section */}
            {groupedItems.pamphlets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Pamphlets ({groupedItems.pamphlets.length} items)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg text-sm">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="p-3 border text-left">Date</th>
                        <th className="p-3 border text-center">Count Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems.pamphlets.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border">{item.book.bookName}</td>
                          <td className="p-2 border text-center">{item.countSent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Receipt Books Section */}
            {groupedItems.receiptBooks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Receipt Books ({groupedItems.receiptBooks.length} items)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg text-sm">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="p-3 border text-left">Book Number</th>
                        <th className="p-3 border text-center">Range Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems.receiptBooks.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border">{item.book.bookName}</td>
                          <td className="p-2 border text-center">{item.countSent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!selectedChallan.items || selectedChallan.items.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No items found in this challan
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Challan Management System
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalChallans}</div>
          <div className="text-sm text-gray-600">Total Challans</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalBooks}</div>
          <div className="text-sm text-gray-600">Books Sent</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalPamphlets}</div>
          <div className="text-sm text-gray-600">Pamphlets</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">{stats.totalReceiptBooks}</div>
          <div className="text-sm text-gray-600">Receipt Books</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalCounsellors}</div>
          <div className="text-sm text-gray-600">Counsellors</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Counsellor</label>
            <CustomDropdown />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Challan Number</label>
            <input
              type="text"
              placeholder="Search challan..."
              value={searchChallanNo}
              onChange={(e) => setSearchChallanNo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Clear Filters
          </button>
          <div className="text-sm text-gray-600">
            Showing {filteredChallans.length} of {challans.length} challans
          </div>
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Challans List</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <span className="text-gray-500">Loading challans...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 text-left">Challan No</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Counsellor</th>
                    <th className="p-3 text-center">Total Items</th>
                    <th className="p-3 text-center">Books</th>
                    <th className="p-3 text-center">Pamphlets</th>
                    <th className="p-3 text-center">Receipt Books</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChallans.map((challan) => {
                    const bookCount = challan.items?.filter(item => 
                      item.book && !['pamphlet', 'receiptBook'].includes(item.book.standard)
                    ).reduce((sum, item) => sum + item.countSent, 0) || 0;
                    
                    const pamphletCount = challan.items?.filter(item => 
                      item.book && item.book.standard === 'pamphlet'
                    ).reduce((sum, item) => sum + item.countSent, 0) || 0;
                    
                    const receiptCount = challan.items?.filter(item => 
                      item.book && item.book.standard === 'receiptBook'
                    ).reduce((sum, item) => sum + item.countSent, 0) || 0;

                    return (
                      <tr key={challan.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold text-primary">{challan.chalanNo}</td>
                        <td className="p-3">{formatDate(challan.date)}</td>
                        <td className="p-3">{getCounsellorName(challan.counsellorId)}</td>
                        <td className="p-3 text-center">{challan.items?.length || 0}</td>
                        <td className="p-3 text-center">{bookCount}</td>
                        <td className="p-3 text-center">{pamphletCount}</td>
                        <td className="p-3 text-center">{receiptCount}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => viewChallanDetails(challan)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredChallans.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No challans found matching your criteria
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstChallan + 1} to {Math.min(indexOfLastChallan, filteredChallans.length)} of {filteredChallans.length} entries
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-1 bg-primary text-white rounded text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Challan Details Modal */}
      {renderChallanDetailsModal()}
    </div>
  );
};

export default ChallanManagement;