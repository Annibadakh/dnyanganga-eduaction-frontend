import React, { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import VisitingFormView from "./VisitingFormView";
import VisitingFormEdit from "./VisitingFormEdit";

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  onItemsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm border rounded ${
              page === currentPage
                ? 'bg-primary text-white border-primary'
                : page === '...'
                ? 'cursor-default'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const VisitingTable = () => {
  const { user } = useAuth();
  const [visitingData, setVisitingData] = useState([]);
  const [users, setUsers] = useState([]);
  const [branch, setBranch] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  
  // Date range filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // New state for searchable dropdowns
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  // Refs for dropdown containers
  const counsellorDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Filter functions for searchable dropdowns
  const filteredCounsellors = users.filter(user =>
    user.name.toLowerCase().includes(counsellorSearch.toLowerCase())
  );

  const filteredBranch = branch.filter(user =>
    user.counsellorBranch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch users data
  useEffect(() => {
    if (user.role === "admin" || user.role === "followUp") {
      api
        .get("/admin/getUser")
        .then((response) => {
          setUsers(response.data.data);
          setBranch(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching users", error);
        });
    }
  }, [user.role]);

  // Fetch visiting data with pagination
  const fetchVisitingData = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      counsellor: selectedCounsellor,
      branch: selectedBranch,
      standard: selectedStandard,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    api
      .get("/counsellor/getVisiting", { params })
      .then((response) => {
        setVisitingData(response.data.data);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  };

  // Fetch visiting data when dependencies change
  useEffect(() => {
    fetchVisitingData();
  }, [
    user?.uuid, 
    currentPage, 
    itemsPerPage, 
    searchQuery, 
    selectedCounsellor, 
    selectedBranch, 
    selectedStandard,
    dateFrom,
    dateTo
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCounsellor, selectedBranch, selectedStandard, dateFrom, dateTo]);

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor.uuid);
    setCounsellorSearch(counsellor.name);
    setShowCounsellorDropdown(false);
  };

  const handleBranchSelect = (counsellor) => {
    setSelectedBranch(counsellor.counsellorBranch);
    setBranchSearch(counsellor.counsellorBranch);
    setShowBranchDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const clearBranchFilter = () => {
    setSelectedBranch("");
    setBranchSearch("");
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatTimeTo12Hour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleViewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowViewModal(true);
  };

  const handleEditVisit = (visit) => {
    setSelectedVisit(visit);
    setShowEditModal(true);
  };

  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedVisit(null);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedVisit(null);
  };

  const handleUpdateSuccess = () => {
    fetchVisitingData(); // Refresh the table data
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Visiting Table</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Second Row - Date Range and Standard */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-3/4">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="p-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={clearDateFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Third Row - Counsellor and Branch (Admin only) */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg"
          />
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="p-2 w-full md:w-2/4 border border-gray-300 rounded-lg"
          >
            <option value="">All Standards</option>
            <option value="9th+10th">9th+10th</option>
            <option value="10th">10th</option>
            <option value="11th+12th">11th+12th</option>
            <option value="12th">12th</option>
          </select>
        </div>
        {(user.role === "admin" || user.role === "followUp") && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/2" ref={counsellorDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search counsellors..."
                  value={counsellorSearch}
                  onChange={(e) => {
                    setCounsellorSearch(e.target.value);
                    setShowCounsellorDropdown(true);
                  }}
                  onFocus={() => setShowCounsellorDropdown(true)}
                  className="p-2 w-full border border-gray-300 rounded-lg pr-8"
                />
                {selectedCounsellor && (
                  <button
                    onClick={clearCounsellorFilter}
                    className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {showCounsellorDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => {
                      clearCounsellorFilter();
                      setShowCounsellorDropdown(false);
                    }}
                  >
                    All Counsellors
                  </div>
                  {filteredCounsellors.map((counsellor) => (
                    <div
                      key={counsellor.uuid}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCounsellorSelect(counsellor)}
                    >
                      {counsellor.name}
                    </div>
                  ))}
                  {filteredCounsellors.length === 0 && counsellorSearch && (
                    <div className="p-2 text-gray-500">No counsellors found</div>
                  )}
                </div>
              )}
              
            </div>

            <div className="relative w-full md:w-1/2" ref={branchDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search branch..."
                  value={branchSearch}
                  onChange={(e) => {
                    setBranchSearch(e.target.value);
                    setShowBranchDropdown(true);
                  }}
                  onFocus={() => setShowBranchDropdown(true)}
                  className="p-2 w-full border border-gray-300 rounded-lg pr-8"
                />
                {selectedBranch && (
                  <button
                    onClick={clearBranchFilter}
                    className="absolute right-2 top-1/2 transform text-xl font-bold -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {showBranchDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => {
                      clearBranchFilter();
                      setShowBranchDropdown(false);
                    }}
                  >
                    All Branch
                  </div>
                  {filteredBranch.map((counsellor) => (
                    <div
                      key={counsellor.uuid}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleBranchSelect(counsellor)}
                    >
                      {counsellor.counsellorBranch}
                    </div>
                  ))}
                  {filteredBranch.length === 0 && branchSearch && (
                    <div className="p-2 text-gray-500">No Branch found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white md:p-6 p-2 shadow-custom">
        {loading && <p className="text-customgray text-lg">Loading...</p>}
        {error && <p className="text-red-500 text-lg">{error}</p>}

        {!loading && !error && visitingData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border text-center border-customgray overflow-hidden shadow-lg text-sm">
                <thead className="bg-primary text-customwhite uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left border whitespace-nowrap">Sr. No.</th>
                    <th className="p-3 border text-left whitespace-nowrap">Visit Date</th>
                    <th className="p-3 border whitespace-nowrap">Visit Time</th>
                    <th className="p-3 border whitespace-nowrap">Student Name</th>
                    <th className="p-3 border whitespace-nowrap">Standard</th>
                    <th className="p-3 border whitespace-nowrap">Med/Grp</th>
                    <th className="p-3 border whitespace-nowrap">Student No.</th>
                    <th className="p-3 border whitespace-nowrap">Parent No.</th>
                    <th className="p-3 border whitespace-nowrap">Demo</th>
                    <th className="p-3 border whitespace-nowrap">Reason</th>
                    {user.role === "admin" && <><th className="p-3 border whitespace-nowrap">Counsellor Name</th>
                    <th className="p-3 border whitespace-nowrap">Counsellor Branch</th></>}
                    <th className="p-3 border whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-customblack">
                  {visitingData.map((visit, index) => (
                    <tr
                      key={visit.id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition"
                    >
                      <td className="p-3 border whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(visit.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 border whitespace-nowrap">{formatTimeTo12Hour(visit.createdAt)}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.studentName}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.standard}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.branch}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.studentNo}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.parentsNo}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.demoGiven}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.reason}</td>
                      {user.role === "admin" && <><td className="p-3 border whitespace-nowrap">{visit.User.name}</td>
                      <td className="p-3 border whitespace-nowrap">{visit.User.counsellorBranch}</td></>}
                      <td className="p-3 border whitespace-nowrap">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewVisit(visit)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditVisit(visit)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          !loading && (
            <p className="text-lg text-customgray">No visiting records found.</p>
          )
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedVisit && (
        <VisitingFormView
          visitData={selectedVisit}
          onClose={handleCloseView}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVisit && (
        <VisitingFormEdit
          visitData={selectedVisit}
          onClose={handleCloseEdit}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default VisitingTable;