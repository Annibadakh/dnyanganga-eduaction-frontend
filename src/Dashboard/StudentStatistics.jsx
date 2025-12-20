import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../Api";
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BookOpen, 
  School, 
  Calendar,
  AlertTriangle
} from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    red: "bg-red-50 border-red-200 text-red-600",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    teal: "bg-teal-50 border-teal-200 text-teal-600",
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-12 h-12 opacity-20" />}
      </div>
    </div>
  );
};

const StudentStatistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedExamCentre, setSelectedExamCentre] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [users, setUsers] = useState([]);
  const [branch, setBranch] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [examCentreSearch, setExamCentreSearch] = useState("");
  const [showCounsellorDropdown, setShowCounsellorDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showExamCentreDropdown, setShowExamCentreDropdown] = useState(false);
  const counsellorDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);
  const examCentreDropdownRef = useRef(null);

  const filteredCounsellors = users.filter(u => 
    u.name.toLowerCase().includes(counsellorSearch.toLowerCase())
  );

  const getDistinctBranches = (branchList) => {
    const distinctBranches = [];
    const seenBranches = new Set();
    branchList.forEach(item => {
      if (item.counsellorBranch && !seenBranches.has(item.counsellorBranch)) {
        seenBranches.add(item.counsellorBranch);
        distinctBranches.push(item);
      }
    });
    return distinctBranches;
  };

  const filteredBranch = getDistinctBranches(branch).filter(u => 
    u.counsellorBranch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredExamCentres = examCentres.filter(centre => 
    centre.centerName.toLowerCase().includes(examCentreSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (counsellorDropdownRef.current && !counsellorDropdownRef.current.contains(event.target)) {
        setShowCounsellorDropdown(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
      if (examCentreDropdownRef.current && !examCentreDropdownRef.current.contains(event.target)) {
        setShowExamCentreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user.role === "admin" || user.role === "followUp") {
      api.get("/admin/getUser")
        .then((response) => {
          setUsers(response.data.data);
          setBranch(response.data.data);
        })
        .catch((error) => console.error("Error fetching users", error));
    }
    
    api.get("/admin/getExamCenters")
      .then((response) => {
        setExamCentres(response.data.data);
      })
      .catch((error) => console.error("Error fetching exam centers", error));
  }, [user.role]);

  const fetchStatistics = () => {
    setLoading(true);
    const params = {
      counsellor: selectedCounsellor,
      branch: selectedBranch,
      examCentre: selectedExamCentre,
      standard: selectedStandard,
      status: selectedStatus,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    api.get("/counsellor/getStatistics", { params })
      .then((response) => {
        setStatistics(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching statistics:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedCounsellor, selectedBranch, selectedExamCentre, selectedStandard, selectedStatus, dateFrom, dateTo]);

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

  const handleExamCentreSelect = (centre) => {
    setSelectedExamCentre(centre.centerId);
    setExamCentreSearch(centre.centerName);
    setShowExamCentreDropdown(false);
  };

  const clearCounsellorFilter = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
  };

  const clearBranchFilter = () => {
    setSelectedBranch("");
    setBranchSearch("");
  };

  const clearExamCentreFilter = () => {
    setSelectedExamCentre("");
    setExamCentreSearch("");
  };

  const clearAllFilters = () => {
    setSelectedCounsellor("");
    setCounsellorSearch("");
    setSelectedBranch("");
    setBranchSearch("");
    setSelectedExamCentre("");
    setExamCentreSearch("");
    setSelectedStandard("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = selectedCounsellor || selectedBranch || selectedExamCentre || 
                          selectedStandard || selectedStatus || dateFrom || dateTo;

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Student Statistics Dashboard</h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>
        
        {/* Date Range Filters */}
        <div className="flex flex-col md:flex-row justify-start gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col">
              <label htmlFor="dateFrom" className="text-sm text-gray-600 mb-1">From Date</label>
              <input 
                id="dateFrom" 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                max={dateTo || undefined}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="dateTo" className="text-sm text-gray-600 mb-1">To Date</label>
              <input 
                id="dateTo" 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                min={dateFrom || undefined}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Other Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {(user.role === "admin" || user.role === "followUp") && (
            <>
              <div className="relative w-full md:w-1/4" ref={counsellorDropdownRef}>
                <label className="text-sm text-gray-600 mb-1 block">Counsellor</label>
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

              <div className="relative w-full md:w-1/4" ref={branchDropdownRef}>
                <label className="text-sm text-gray-600 mb-1 block">Branch</label>
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
                      All Branches
                    </div>
                    {filteredBranch.map((counsellor, index) => (
                      <div 
                        key={`${counsellor.counsellorBranch}-${index}`} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleBranchSelect(counsellor)}
                      >
                        {counsellor.counsellorBranch}
                      </div>
                    ))}
                    {filteredBranch.length === 0 && branchSearch && (
                      <div className="p-2 text-gray-500">No branches found</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative w-full md:w-1/4" ref={examCentreDropdownRef}>
            <label className="text-sm text-gray-600 mb-1 block">Exam Centre</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search exam centres..." 
                value={examCentreSearch} 
                onChange={(e) => { 
                  setExamCentreSearch(e.target.value); 
                  setShowExamCentreDropdown(true); 
                }}
                onFocus={() => setShowExamCentreDropdown(true)}
                className="p-2 w-full border border-gray-300 rounded-lg pr-8"
              />
              {selectedExamCentre && (
                <button 
                  onClick={clearExamCentreFilter}
                  className="absolute right-2 top-1/2 text-xl font-bold transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            {showExamCentreDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b" 
                  onClick={() => { 
                    clearExamCentreFilter(); 
                    setShowExamCentreDropdown(false); 
                  }}
                >
                  All Exam Centres
                </div>
                {filteredExamCentres.map((centre) => (
                  <div 
                    key={centre.centerId} 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleExamCentreSelect(centre)}
                  >
                    {centre.centerName}
                  </div>
                ))}
                {filteredExamCentres.length === 0 && examCentreSearch && (
                  <div className="p-2 text-gray-500">No exam centres found</div>
                )}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/4">
            <label className="text-sm text-gray-600 mb-1 block">Standard</label>
            <select 
              value={selectedStandard} 
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-lg"
            >
              <option value="">All Standards</option>
              <option value="9th+10th">9th+10th</option>
              <option value="10th">10th</option>
              <option value="11th+12th">11th+12th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div className="w-full md:w-1/4">
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button 
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : statistics ? (
        <div className="space-y-6">
          {/* Overall Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Overall Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard 
                title="Total Students" 
                value={statistics.totalStudents?.toLocaleString('en-IN') || 0}
                icon={Users}
                color="blue"
              />
              <StatCard 
                title="Active Students" 
                value={statistics.activeStudents?.toLocaleString('en-IN') || 0}
                subtitle={`${statistics.activePercentage || 0}% of total`}
                icon={UserCheck}
                color="green"
              />
              <StatCard 
                title="Inactive Students" 
                value={statistics.inactiveStudents?.toLocaleString('en-IN') || 0}
                subtitle={`${statistics.inactivePercentage || 0}% of total`}
                icon={UserX}
                color="red"
              />
              <StatCard 
                title="New This Week" 
                value={statistics.newThisWeek?.toLocaleString('en-IN') || 0}
                icon={TrendingUp}
                color="teal"
              />
              <StatCard 
                title="New This Month" 
                value={statistics.newThisMonth?.toLocaleString('en-IN') || 0}
                icon={TrendingUp}
                color="purple"
              />
            </div>
          </div>

          {/* Financial Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Total Amount" 
                value={`₹${statistics.totalAmount?.toLocaleString('en-IN') || 0}`}
                icon={DollarSign}
                color="indigo"
              />
              <StatCard 
                title="Amount Paid" 
                value={`₹${statistics.amountPaid?.toLocaleString('en-IN') || 0}`}
                subtitle={`${statistics.paidPercentage || 0}% collected`}
                icon={CheckCircle}
                color="green"
              />
              <StatCard 
                title="Amount Remaining" 
                value={`₹${statistics.amountRemaining?.toLocaleString('en-IN') || 0}`}
                subtitle={`${statistics.remainingPercentage || 0}% pending`}
                icon={Clock}
                color="orange"
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Fully Paid" 
                value={statistics.fullyPaidCount?.toLocaleString('en-IN') || 0}
                subtitle={`${statistics.fullyPaidPercentage || 0}% of students`}
                icon={CheckCircle2}
                color="green"
              />
              <StatCard 
                title="Partially Paid" 
                value={statistics.partiallyPaidCount?.toLocaleString('en-IN') || 0}
                subtitle={`${statistics.partiallyPaidPercentage || 0}% of students`}
                icon={AlertCircle}
                color="yellow"
              />
              <StatCard 
                title="Unpaid" 
                value={statistics.unpaidCount?.toLocaleString('en-IN') || 0}
                subtitle={`${statistics.unpaidPercentage || 0}% of students`}
                icon={XCircle}
                color="red"
              />
            </div>
          </div>

          {/* Standard-wise Distribution */}
          {statistics.standardWise && Object.keys(statistics.standardWise).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Standard-wise Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statistics.standardWise).map(([standard, count]) => (
                  <StatCard 
                    key={standard}
                    title={`${standard} Standard`}
                    value={count.toLocaleString('en-IN')}
                    icon={BookOpen}
                    color="blue"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Exam Centre-wise Distribution */}
          {statistics.examCentreWise && statistics.examCentreWise.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Exam Centre-wise Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.examCentreWise.slice(0, 6).map((centre) => (
                  <StatCard 
                    key={centre.centreName}
                    title={centre.centreName}
                    value={centre.count.toLocaleString('en-IN')}
                    subtitle={`${centre.percentage}% of total`}
                    icon={School}
                    color="purple"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Due Dates Overview */}
          {statistics.dueStatus && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Due Dates Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                  title="Overdue Payments" 
                  value={statistics.dueStatus.overdue?.toLocaleString('en-IN') || 0}
                  subtitle="Past due date"
                  icon={AlertTriangle}
                  color="red"
                />
                <StatCard 
                  title="Due This Week" 
                  value={statistics.dueStatus.dueThisWeek?.toLocaleString('en-IN') || 0}
                  icon={Calendar}
                  color="yellow"
                />
                <StatCard 
                  title="Due This Month" 
                  value={statistics.dueStatus.dueThisMonth?.toLocaleString('en-IN') || 0}
                  icon={Calendar}
                  color="orange"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No statistics available</p>
        </div>
      )}
    </div>
  );
};

export default StudentStatistics;