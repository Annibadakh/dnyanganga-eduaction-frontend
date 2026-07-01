import React, { useState, useEffect, useRef, useContext } from "react";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Api";
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
  AlertTriangle,
  Banknote,
} from "lucide-react";
import { DashboardContext } from "../../Context/DashboardContext";
import CustomSelect from "../Generic/CustomSelect";
import DateField from "../Generic/DateField";
import SelectField from "../Generic/SelectField";

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
    <div
      className={`${colorClasses[color]} border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
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
  const { counsellor, examCenter, counsellorBranch } =
    useContext(DashboardContext);
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
  const [selectedExamYear, setSelectedExamYear] = useState("");

  useEffect(() => {
    if (counsellor && (user.role === "admin" || user.role === "followUp")) {
      setUsers(counsellor);
      setBranch(counsellorBranch);
    }
  }, [user.role, counsellor, counsellorBranch]);

  useEffect(() => {
    examCenter && setExamCentres(examCenter);
  }, [user.role, examCenter]);

  const getExamYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(startYear + i);
    }
    return years;
  };
  const fetchStatistics = () => {
    setLoading(true);
    const params = {
      counsellor: selectedCounsellor?.value || "",
      branch: selectedBranch?.value || "",
      examCentre: selectedExamCentre?.value || "",
      standard: selectedStandard,
      status: selectedStatus,
      dateFrom: dateFrom,
      dateTo: dateTo,
      examYear: selectedExamYear,
    };

    api
      .get("/counsellor/getStatistics", { params })
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
  }, [
    selectedCounsellor,
    selectedBranch,
    selectedExamCentre,
    selectedStandard,
    selectedStatus,
    dateFrom,
    dateTo,
    selectedExamYear,
  ]);

  const clearAllFilters = () => {
    setSelectedCounsellor("");
    setSelectedBranch("");
    setSelectedExamCentre("");
    setSelectedStandard("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSelectedExamYear("");
  };

  const hasActiveFilters =
    selectedCounsellor ||
    selectedBranch ||
    selectedExamCentre ||
    selectedStandard ||
    selectedStatus ||
    dateFrom ||
    dateTo ||
    selectedExamYear;

  const downloadDueStudents = async (type) => {
    try {
      const params = {
        type,
        counsellor: selectedCounsellor?.value || "",
        branch: selectedBranch?.value || "",
        examCentre: selectedExamCentre?.value || "",
        standard: selectedStandard,
        status: selectedStatus,
        dateFrom,
        dateTo,
        examYear: selectedExamYear,
      };

      const response = await api.get("/counsellor/downloadDueStudents", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.download = `${type}_students.xlsx`;

      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        Student Statistics Dashboard
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>

        {/* Date Range Filters */}
        <div className="flex flex-col md:flex-row justify-start gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <DateField
              id="dateFrom"
              label="From Date"
              value={dateFrom}
              onChange={setDateFrom}
              max={dateTo || undefined}
            />

            <DateField
              id="dateTo"
              label="To Date"
              value={dateTo}
              onChange={setDateTo}
              min={dateFrom || undefined}
            />
          </div>
        </div>

        {/* Other Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap">
          {(user.role === "admin" || user.role === "followUp") && (
            <>
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
            </>
          )}
          <CustomSelect
            options={examCentres}
            value={selectedExamCentre}
            onChange={setSelectedExamCentre}
            isRequired={false}
            placeholder="Select Exam Centre"
          />

          <SelectField
            id="standard"
            label="Standard"
            value={selectedStandard}
            onChange={setSelectedStandard}
            placeholder="All Standards"
            options={[
              { label: "9th+10th", value: "9th+10th" },
              { label: "10th", value: "10th" },
              { label: "11th+12th", value: "11th+12th" },
              { label: "12th", value: "12th" },
            ]}
            className="w-full md:w-1/4"
          />

          <SelectField
            id="examYear"
            label="Exam Year"
            value={selectedExamYear}
            onChange={setSelectedExamYear}
            placeholder="All Exam Years"
            options={getExamYearOptions().map((year) => ({
              label: year,
              value: year,
            }))}
            className="w-full md:w-1/4"
          />

          <SelectField
            id="status"
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="All Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            className="w-full md:w-1/4"
          />
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Overall Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Students"
                value={statistics.totalStudents?.toLocaleString("en-IN") || 0}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Students"
                value={statistics.activeStudents?.toLocaleString("en-IN") || 0}
                subtitle={`${statistics.activePercentage || 0}% of total`}
                icon={UserCheck}
                color="green"
              />
              <StatCard
                title="Inactive Students"
                value={
                  statistics.inactiveStudents?.toLocaleString("en-IN") || 0
                }
                subtitle={`${statistics.inactivePercentage || 0}% of total`}
                icon={UserX}
                color="red"
              />
              <StatCard
                title="New This Week"
                value={statistics.newThisWeek?.toLocaleString("en-IN") || 0}
                icon={TrendingUp}
                color="teal"
              />
              <StatCard
                title="New This Month"
                value={statistics.newThisMonth?.toLocaleString("en-IN") || 0}
                icon={TrendingUp}
                color="purple"
              />
            </div>
          </div>

          {/* Financial Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Amount"
                value={`₹${statistics.totalAmount?.toLocaleString("en-IN") || 0}`}
                icon={DollarSign}
                color="indigo"
              />
              <StatCard
                title="Amount Paid"
                value={`₹${statistics.amountPaid?.toLocaleString("en-IN") || 0}`}
                subtitle={`${statistics.paidPercentage || 0}% collected`}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Amount Remaining"
                value={`₹${statistics.amountRemaining?.toLocaleString("en-IN") || 0}`}
                subtitle={`${statistics.remainingPercentage || 0}% pending`}
                icon={Clock}
                color="orange"
              />
              <StatCard
                title="Collection Amount"
                value={`₹${statistics.totalCollectionPaid?.toLocaleString("en-IN") || 0}`}
                icon={Banknote}
                color="purple"
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Payment Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Fully Paid"
                value={statistics.fullyPaidCount?.toLocaleString("en-IN") || 0}
                subtitle={`${statistics.fullyPaidPercentage || 0}% of students`}
                icon={CheckCircle2}
                color="green"
              />
              <StatCard
                title="Partially Paid"
                value={
                  statistics.partiallyPaidCount?.toLocaleString("en-IN") || 0
                }
                subtitle={`${statistics.partiallyPaidPercentage || 0}% of students`}
                icon={AlertCircle}
                color="yellow"
              />
              <StatCard
                title="Unpaid"
                value={statistics.unpaidCount?.toLocaleString("en-IN") || 0}
                subtitle={`${statistics.unpaidPercentage || 0}% of students`}
                icon={XCircle}
                color="red"
              />
            </div>
          </div>

          {/* Standard-wise Distribution */}
          {statistics.standardWise &&
            Object.keys(statistics.standardWise).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Standard-wise Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(statistics.standardWise).map(
                    ([standard, count]) => (
                      <StatCard
                        key={standard}
                        title={`${standard} Standard`}
                        value={count.toLocaleString("en-IN")}
                        icon={BookOpen}
                        color="blue"
                      />
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Exam Centre-wise Distribution */}
          {statistics.examCentreWise &&
            statistics.examCentreWise.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Exam Centre-wise Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.examCentreWise.slice(0, 6).map((centre) => (
                    <StatCard
                      key={centre.centreName}
                      title={centre.centreName}
                      value={centre.count.toLocaleString("en-IN")}
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
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Due Dates Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="cursor-pointer"
                  onClick={() => downloadDueStudents("overdue")}
                >
                  <StatCard
                    title="Overdue Payments"
                    value={
                      statistics.dueStatus.overdue?.toLocaleString("en-IN") || 0
                    }
                    icon={AlertTriangle}
                    color="red"
                  />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => downloadDueStudents("week")}
                >
                  <StatCard
                    title="Due This Week"
                    value={
                      statistics.dueStatus.dueThisWeek?.toLocaleString(
                        "en-IN",
                      ) || 0
                    }
                    icon={Calendar}
                    color="yellow"
                  />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => downloadDueStudents("month")}
                >
                  <StatCard
                    title="Due This Month"
                    value={
                      statistics.dueStatus.dueThisMonth?.toLocaleString(
                        "en-IN",
                      ) || 0
                    }
                    icon={Calendar}
                    color="orange"
                  />
                </div>
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
