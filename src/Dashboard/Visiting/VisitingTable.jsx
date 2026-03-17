import React, { useState, useEffect, useRef, useContext } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import VisitingFormView from "./VisitingFormView";
import VisitingFormEdit from "./VisitingFormEdit";
import CustomSelect from "../Generic/CustomSelect";
import { DashboardContext } from "../../Context/DashboardContext";

import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import Button from "../Generic/Button";
import { Eye, Edit } from "lucide-react";



const VisitingTable = () => {
  const { user } = useAuth();
  const { counsellor, counsellorBranch } = useContext(DashboardContext);
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) =>
        (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Visit Date",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
    {
      header: "Visit Time",
      render: (row) => formatTimeTo12Hour(row.createdAt),
    },
    {
      header: "Student Name",
      accessor: "studentName",
    },
    {
      header: "Standard",
      accessor: "standard",
    },
    {
      header: "Med/Grp",
      accessor: "branch",
    },
    {
      header: "Student No.",
      accessor: "studentNo",
    },
    {
      header: "Parent No.",
      accessor: "parentsNo",
    },
    {
      header: "Demo",
      accessor: "demoGiven",
    },
    {
      header: "Reason",
      accessor: "reason",
    },

    ...(user.role === "admin"
      ? [
        {
          header: "Counsellor Name",
          render: (row) => row.User?.name,
        },
        {
          header: "Counsellor Branch",
          render: (row) => row.User?.counsellorBranch,
        },
      ]
      : []),

    ...(user.role === "admin" || user.role === "followUp"
      ? [
        {
          header: "Follow-up",
          render: (row) => (
            <input
              type="checkbox"
              checked={row.followUp || false}
              onChange={() =>
                handleFollowUpChange(row.id, row.followUp)
              }
              className="w-5 h-5 cursor-pointer accent-primary"
            />
          ),
        },
      ]
      : []),

    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2 justify-center flex-nowrap">

          <Button
            variant="info"
            startIcon={<Eye size={16} />}
            onClick={() => handleViewVisit(row)}
          >
            View
          </Button>

          {user.role === "admin" && (
            <Button
              variant="success"
              startIcon={<Edit size={16} />}
              onClick={() => handleEditVisit(row)}
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users data
  useEffect(() => {
    if (counsellor && (user.role === "admin" || user.role === "followUp")) {
      setUsers(counsellor);
      setBranch(counsellorBranch);
    }
  }, [user.role, counsellor, counsellorBranch]);

  // Fetch visiting data with pagination
  const fetchVisitingData = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      counsellor: selectedCounsellor?.value || "",
      branch: selectedBranch?.value || "",
      standard: selectedStandard,
      dateFrom: dateFrom,
      dateTo: dateTo,
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
    debouncedSearchQuery,
    selectedCounsellor,
    selectedBranch,
    selectedStandard,
    dateFrom,
    dateTo,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    selectedCounsellor,
    selectedBranch,
    selectedStandard,
    dateFrom,
    dateTo,
  ]);


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
    return date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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

  // Handle follow-up checkbox change
  const handleFollowUpChange = async (visitId, currentFollowUpStatus) => {
    try {
      const newFollowUpStatus = !currentFollowUpStatus;

      // Optimistically update the UI
      setVisitingData((prevData) =>
        prevData.map((visit) =>
          visit.id === visitId
            ? { ...visit, followUp: newFollowUpStatus }
            : visit,
        ),
      );

      // Make API call to update the follow-up status
      await api.put(`/counsellor/updateVisitingFollowUp/${visitId}`, {
        followUp: newFollowUpStatus,
      });
    } catch (error) {
      console.error("Error updating follow-up status:", error);
      // Revert the optimistic update on error
      setVisitingData((prevData) =>
        prevData.map((visit) =>
          visit.id === visitId
            ? { ...visit, followUp: currentFollowUpStatus }
            : visit,
        ),
      );
      alert("Failed to update follow-up status. Please try again.");
    }
  };

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Visiting Table
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Second Row - Date Range and Standard */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-3/4">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 w-full border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                To Date
              </label>
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
            placeholder="Search by name..."
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
            <CustomSelect
              options={users}
              value={selectedCounsellor}
              onChange={setSelectedCounsellor}
              isRequired={false}
              placeholder="Select Counsellors"
            />

            <CustomSelect
              options={branch}
              value={selectedBranch}
              onChange={setSelectedBranch}
              isRequired={false}
              placeholder="Select Branch"
            />

          </div>
        )}
      </div>



      <DataTable
        columns={columns}
        data={visitingData}
        loading={loading}
        error={error}
        rowKey="id"
        emptyMessage="No visiting records found."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />


      {/* View Modal */}
      {showViewModal && selectedVisit && (
        <VisitingFormView visitData={selectedVisit} onClose={handleCloseView} />
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
