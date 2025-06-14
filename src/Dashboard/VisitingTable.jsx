import React, { useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const VisitingTable = () => {
  const { user } = useAuth();
  const [visitingData, setVisitingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");

  useEffect(() => {
    if (user.role === "admin") {
      api.get("/admin/getUser").then((res) => {
        setUsers(res.data.data.filter((u) => u.role === "counsellor"));
      });
    }

    api
      .get(`/counsellor/getVisiting?uuid=${user.uuid}&role=${user.role}`)
      .then((response) => {
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

    setFilteredData(result);
  }, [searchQuery, selectedCounsellor, visitingData, user]);

  return (
    <div className="p-6 bg-customwhite shadow-custom rounded-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Visiting Table</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/2"
        />

        {user.role === "admin" && (
          <select
            value={selectedCounsellor}
            onChange={(e) => setSelectedCounsellor(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full md:w-1/2"
          >
            <option value="">All Counsellors</option>
            {users.map((u) => (
              <option key={u.uuid} value={u.uuid}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {loading && <p className="text-customgray text-lg">Loading...</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      {!loading && !error && filteredData.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full border border-customgray rounded-xl text-sm whitespace-nowrap">
            <thead className="bg-primary text-white uppercase">
              <tr>
                <th className="p-3 border">Sr</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Gender</th>
                <th className="p-3 border">School/College</th>
                <th className="p-3 border">Standard</th>
                <th className="p-3 border">Previous %</th>
                <th className="p-3 border">Student No</th>
                <th className="p-3 border">Parent No</th>
                <th className="p-3 border">Address</th>
                <th className="p-3 border">Counsellor</th>
                <th className="p-3 border">Demo</th>
                <th className="p-3 border">Reason</th>
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
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{visit.studentName}</td>
                  <td className="p-2 border">{visit.gender}</td>
                  <td className="p-2 border">{visit.schoolCollege}</td>
                  <td className="p-2 border">{visit.standard}</td>
                  <td className="p-2 border">{visit.previousYearPercent}</td>
                  <td className="p-2 border">{visit.studentNo}</td>
                  <td className="p-2 border">{visit.parentsNo}</td>
                  <td className="p-2 border">{visit.address}</td>
                  <td className="p-2 border">{visit.counsellor}</td>
                  <td className="p-2 border">{visit.demoGiven}</td>
                  <td className="p-2 border">{visit.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="text-lg text-customgray">No visiting records found.</p>
      )}
    </div>
  );
};

export default VisitingTable;
