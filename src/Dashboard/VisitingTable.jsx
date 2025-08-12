import React, { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";
import VisitingFormView from "./VisitingFormView"; // Import the new component

const VisitingTable = () => {
  const { user } = useAuth();
  const [visitingData, setVisitingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");

  // New state for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // New state for searchable dropdowns
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  
  // Refs for dropdown containers
  const counsellorDropdownRef = useRef(null);

  // Filter functions for searchable dropdowns
  const filteredCounsellors = users.filter(user =>
    user.name.toLowerCase().includes(counsellorSearch.toLowerCase())
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user.role === "admin") {
      api.get("/admin/getUser").then((res) => {
        setUsers(res.data.data.filter((u) => u.role === "counsellor"));
      });
    }

    api
      .get(`/counsellor/getVisiting?uuid=${user.uuid}&role=${user.role}`)
      .then((response) => {
        console.log(response.data.data);
        setVisitingData(response.data.data);
        setFilteredData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    let result = [...visitingData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.studentName?.toLowerCase().includes(query) ||
          v.parentsNo?.includes(query) ||
          v.email?.toLowerCase().includes(query)
      );
    }

    if (user.role === "admin" && selectedCounsellor) {
      result = result.filter((v) => v.createdBy === selectedCounsellor);
    }

    if (selectedStandard) {
      result = result.filter((v) => v.standard === selectedStandard);
    }

    setFilteredData(result);
  }, [searchQuery, selectedCounsellor, selectedStandard, visitingData, user]);

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor.uuid);
    setCounsellorSearch(counsellor.name);
    setShowCounsellorDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const formatTimeTo12Hour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // New function to handle view action
  const handleViewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowViewModal(true);
  };

  // Function to close view modal
  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedVisit(null);
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Visiting Table</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3"
        />

        {user.role === "admin" && (
          <div className="relative w-full md:w-1/3" ref={counsellorDropdownRef}>
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
                  className="absolute right-2 top-1/2 font-bold transform -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600"
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
        )}

        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3"
        >
          <option value="">All Standards</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white md:p-6 p-2 shadow-custom">
        {loading && <p className="text-customgray text-lg">Loading...</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      {!loading && !error && filteredData.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
            <thead className="bg-primary text-white uppercase">
              <tr>
                <th className="p-3 border">Sr. No.</th>
                <th className="p-3 border">Visit Date</th>
                <th className="p-3 border">Visit Time</th>
                <th className="p-3 border">Student Name</th>
                <th className="p-3 border">Standard</th>
                <th className="p-3 border">Med/Grp</th>
                <th className="p-3 border">Student No.</th>
                <th className="p-3 border">Parent No.</th>
                <th className="p-3 border">Demo</th>
                <th className="p-3 border">Reason</th>
                <th className="p-3 border">Counsellor</th>
                <th className="p-3 border">Branch</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((visit, index) => (
                <tr
                  key={visit.id}
                  className="text-center border-b hover:bg-gray-100 transition"
                >
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">
                    {new Date(visit.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-2 border">{formatTimeTo12Hour(visit.createdAt)}</td>
                  <td className="p-2 border">{visit.studentName}</td>
                  <td className="p-2 border">{visit.standard}</td>
                  <td className="p-2 border">{visit.branch}</td>
                  <td className="p-2 border">{visit.studentNo}</td>
                  <td className="p-2 border">{visit.parentsNo}</td>
                  <td className="p-2 border">{visit.demoGiven}</td>
                  <td className="p-2 border">{visit.reason}</td>
                  <td className="p-2 border">{visit.counsellor}</td>
                  <td className="p-2 border">{visit.counsellorBranch}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleViewVisit(visit)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="text-lg text-customgray">No visiting records found.</p>
      )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedVisit && (
        <VisitingFormView
          visitData={selectedVisit}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
};

export default VisitingTable;