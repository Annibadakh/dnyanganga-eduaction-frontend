import React, { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const ChallanManagement = () => {
  const { user } = useAuth();
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

  // Statistics - Updated to calculate from filtered data
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
    if (user.role === "admin") {
      fetchCounsellors();
    }
  }, [user.role]);

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

  // Update stats whenever filtered challans change
  useEffect(() => {
    calculateStats(filteredChallans);
  }, [filteredChallans]);

  const fetchAllChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/chalans");
      // console.log("Challans data:", res.data.data);
      setChallans(res.data.data || []);
    } catch (err) {
      console.error("Error fetching challans", err);
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const res = await api.get("/admin/getUser");
      // console.log("Counsellors data:", res.data.data);
      setCounsellors(res.data.data || []);
    } catch (err) {
      console.error("Error fetching counsellors", err);
      setCounsellors([]);
    }
  };

  const calculateStats = (challanData) => {
    const uniqueCounsellors = new Set();
    let totalItems = 0;
    let totalBooks = 0;
    let totalPamphlets = 0;
    let totalReceiptBooks = 0;

    challanData.forEach(challan => {
      // Add counsellor to unique set
      if (challan.counsellorId) {
        uniqueCounsellors.add(challan.counsellorId);
      } else if (challan.User && challan.User.uuid) {
        uniqueCounsellors.add(challan.User.uuid);
      }
      
      // Calculate items from ChalanItems (new structure)
      if (challan.ChalanItems && Array.isArray(challan.ChalanItems)) {
        totalItems += challan.ChalanItems.length;
        
        challan.ChalanItems.forEach(item => {
          if (item.Book && item.countSent) {
            if (item.Book.standard === 'pamphlet') {
              totalPamphlets += item.countSent;
            } else if (item.Book.standard === 'receiptBook') {
              totalReceiptBooks += item.countSent;
            } else {
              totalBooks += item.countSent;
            }
          }
        });
      }
      // Fallback to old structure if exists
      else if (challan.items && Array.isArray(challan.items)) {
        totalItems += challan.items.length;
        
        challan.items.forEach(item => {
          if (item.book && item.countSent) {
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
      filtered = filtered.filter(challan => {
        // Check both counsellorId and User.uuid for compatibility
        return challan.counsellorId === filterCounsellor || 
               (challan.User && challan.User.uuid === filterCounsellor);
      });
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
        challan.chalanNo && challan.chalanNo.toLowerCase().includes(searchChallanNo.toLowerCase())
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
    if (!dateString) return "N/A";
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
    c.name && c.name.toLowerCase().includes(internalSearch.toLowerCase())
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
            {filteredCounsellors.length === 0 && internalSearch && (
              <div className="p-2 text-gray-500 text-sm">No counsellors found</div>
            )}
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

      const items = selectedChallan.ChalanItems || [];
      
      items.forEach(item => {
        if (item.Book) {
          if (item.Book.standard === 'pamphlet') {
            grouped.pamphlets.push(item);
          } else if (item.Book.standard === 'receiptBook') {
            grouped.receiptBooks.push(item);
          } else {
            grouped.books.push(item);
          }
        }
      });

      return grouped;
    };

    const groupedItems = groupItemsByType();
    const totalItemCount = selectedChallan.ChalanItems?.length || 0;
    const totalBookCount = groupedItems.books.reduce((sum, item) => sum + (item.countSent || 0), 0);
    const totalPamphletCount = groupedItems.pamphlets.reduce((sum, item) => sum + (item.countSent || 0), 0);
    const totalReceiptCount = groupedItems.receiptBooks.reduce((sum, item) => sum + (item.countSent || 0), 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold">Challan Details</h2>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-100 font-medium">Challan No.</p>
                      <p className="text-xl font-bold">{selectedChallan.chalanNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 font-medium">Date</p>
                      <p className="text-xl font-bold">{formatDate(selectedChallan.date)}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 font-medium">Counsellor</p>
                      <p className="text-lg font-semibold">{selectedChallan.User?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 font-medium">Total Items</p>
                      <p className="text-xl font-bold">{totalItemCount}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {/* Books Section */}
            {groupedItems.books.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Books</h3>
                    <p className="text-gray-600">{groupedItems.books.length} different books • {totalBookCount} total copies</p>
                  </div>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                        <tr>
                          <th className="p-4 border text-left font-semibold text-purple-800">Standard</th>
                          <th className="p-4 border text-left font-semibold text-purple-800">Book Name</th>
                          <th className="p-4 border text-center font-semibold text-purple-800">Count Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedItems.books.map((item, index) => (
                          <tr key={index} className="border-t border-gray-100 hover:bg-purple-50 transition-colors">
                            <td className="p-4 border">
                              <span className=" text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {item.Book?.standard || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 border font-medium text-gray-900">{item.Book?.bookName || 'N/A'}</td>
                            <td className="p-4 border text-center">
                              <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-bold">
                                {item.countSent || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Pamphlets Section */}
            {groupedItems.pamphlets.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Pamphlets</h3>
                    <p className="text-gray-600">{groupedItems.pamphlets.length} different pamphlets • {totalPamphletCount} total copies</p>
                  </div>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-50 to-green-100">
                        <tr>
                          <th className="p-4 border text-left font-semibold text-green-800">Pamphlet Name</th>
                          <th className="p-4 border text-center font-semibold text-green-800">Count Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedItems.pamphlets.map((item, index) => (
                          <tr key={index} className="border-t border-gray-100 hover:bg-green-50 transition-colors">
                            <td className="p-4 border font-medium text-gray-900">{item.Book?.bookName || 'N/A'}</td>
                            <td className="p-4 border text-center">
                              <span className="bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                                {item.countSent || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Books Section */}
            {groupedItems.receiptBooks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Receipt Books</h3>
                    <p className="text-gray-600">{groupedItems.receiptBooks.length} different receipt books • {totalReceiptCount} total copies</p>
                  </div>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                        <tr>
                          <th className="p-4 border text-left font-semibold text-orange-800">Book Number</th>
                          <th className="p-4 border text-center font-semibold text-orange-800">Range Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedItems.receiptBooks.map((item, index) => (
                          <tr key={index} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                            <td className="p-4 border font-medium text-gray-900">{item.Book?.bookName || 'N/A'}</td>
                            <td className="p-4 border text-center">
                              <span className="bg-orange-600 text-white px-3 py-1 rounded-full font-bold">
                                {item.countSent || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {(!selectedChallan.ChalanItems || selectedChallan.ChalanItems.length === 0) && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Found</h3>
                <p className="text-gray-500">This challan doesn't contain any items yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to get statistics cards based on user role
  const getStatsCards = () => {
    const allCards = [
      {
        title: "Total Challans",
        value: stats.totalChallans,
        color: "from-blue-500 to-blue-600",
        textColor: "text-blue-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        ),
        show: true
      },
      {
        title: "Total Items",
        value: stats.totalItems,
        color: "from-green-500 to-green-600",
        textColor: "text-green-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
          </svg>
        ),
        show: true
      },
      {
        title: "Books Sent",
        value: stats.totalBooks,
        color: "from-purple-500 to-purple-600",
        textColor: "text-purple-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        ),
        show: true
      },
      {
        title: "Pamphlets",
        value: stats.totalPamphlets,
        color: "from-orange-500 to-orange-600",
        textColor: "text-orange-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        ),
        show: true
      },
      {
        title: "Receipt Books",
        value: stats.totalReceiptBooks,
        color: "from-red-500 to-red-600",
        textColor: "text-red-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        ),
        show: true
      },
      {
        title: "Counsellors",
        value: stats.totalCounsellors,
        color: "from-indigo-500 to-indigo-600",
        textColor: "text-indigo-100",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        ),
        show: user.role === "admin" // Only show for admin users
      }
    ];

    return allCards.filter(card => card.show);
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Challan Management System
      </h1>

      {/* Enhanced Statistics Cards */}
      <div className={`grid gap-4 mb-6 ${
        user.role === "admin" 
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" 
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      }`}>
        {getStatsCards().map((card, index) => (
          <div key={index} className={`bg-gradient-to-r ${card.color} text-white p-4 rounded-lg shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${card.textColor} text-sm font-medium`}>{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
        
        <div className={`grid gap-4 ${
          user.role === "admin" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
            : "grid-cols-1 md:grid-cols-3"
        }`}>
          {user.role === "admin" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Counsellor</label>
              <CustomDropdown />
            </div>
          )}
          
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <span className="text-gray-500 mt-2 block">Loading challans...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 text-left border">Sr. No.</th>
                    <th className="p-3 text-left border">Challan No</th>
                    <th className="p-3 text-left border">Date</th>
                    {user.role === "admin" && <th className="p-3 text-left border">Counsellor</th>}
                    <th className="p-3 text-center border">Total Items</th>
                    <th className="p-3 text-center border">Books</th>
                    <th className="p-3 text-center border">Pamphlets</th>
                    <th className="p-3 text-center border">Receipt Books</th>
                    <th className="p-3 text-center border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChallans.map((challan, idx) => {
                    const items = challan.ChalanItems || [];
                    
                    const bookCount = items.filter(item => 
                      item.Book && !['pamphlet', 'receiptBook'].includes(item.Book.standard)
                    ).reduce((sum, item) => sum + (item.countSent || 0), 0);
                    
                    const pamphletCount = items.filter(item => 
                      item.Book && item.Book.standard === 'pamphlet'
                    ).reduce((sum, item) => sum + (item.countSent || 0), 0);
                    
                    const receiptCount = items.filter(item => 
                      item.Book && item.Book.standard === 'receiptBook'
                    ).reduce((sum, item) => sum + (item.countSent || 0), 0);

                    return (
                      <tr key={challan.uuid || idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-center font-semibold text-primary border">{indexOfFirstChallan + idx + 1}</td>
                        <td className="p-3 text-center font-semibold text-primary border">{challan.chalanNo || 'N/A'}</td>
                        <td className="p-3 text-center border">{formatDate(challan.date)}</td>
                        {user.role === "admin" && <td className="p-3 text-center border">{challan.User?.name}</td>}
                        <td className="p-3 text-center border">{items.length}</td>
                        <td className="p-3 text-center border">{bookCount}</td>
                        <td className="p-3 text-center border">{pamphletCount}</td>
                        <td className="p-3 text-center border">{receiptCount}</td>
                        <td className="p-3 text-center border">
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
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No challans found</h3>
                <p className="text-gray-500">No challans match your current filters. Try adjusting your search criteria.</p>
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