import { useState, useEffect, useContext } from "react";
import api from "../../Api";
import { DashboardContext } from "../../Context/DashboardContext";
import { useToast } from "../../useToast";
import Pagination from "../Generic/Pagination";
import DataTable from "../Generic/DataTable";
import CustomMultiSelect from "../Generic/CustomMultiSelect";
import { useAuth } from "../../Context/AuthContext";
import UserForm from "./UserForm";
import UserBatchModal from "./UserBatchModal";

const AddUser = () => {
  const { getCounsellor } = useContext(DashboardContext);
  const { infoToast } = useToast();
  const { user } = useAuth();
  // Sub-admin gets a read-only view of their own team
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState([]);
  const [updateLoader, setUpdateLoader] = useState(null);
  const [subAdmins, setSubAdmins] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showBatches, setShowBatches] = useState(false);
  // Add / Edit form: null = list view, "new" = add, a user row = edit
  const [formUser, setFormUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSubAdmins, setSelectedSubAdmins] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearch, selectedStatus, selectedSubAdmins, selectedBatches]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedSubAdmins, selectedBatches]);

  // All batches (active + inactive): the filter and the Add Batch list; the user form offers the active ones
  const fetchBatches = () =>
    api
      .get("/admin/userBatches")
      .then((res) => setBatches(res.data.data || []))
      .catch((err) => console.error("Error fetching batches", err));

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get("/admin/subAdmins")
      .then((res) => setSubAdmins(res.data.data || []))
      .catch((err) => console.error("Error fetching sub-admins", err));
  }, [isAdmin]);

  const fetchUsers = () => {
    api
      .get("/admin/getUserWithDetails", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          status: selectedStatus,
          subAdmin:
            isAdmin && selectedSubAdmins.length > 0
              ? selectedSubAdmins.map((s) => s.value).join(",")
              : "",
          batch:
            selectedBatches.length > 0
              ? selectedBatches.map((b) => b.value).join(",")
              : "",
        },
      })
      .then((res) => {
        setUsers(res.data.data);

        setCurrentPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.totalItems);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDelete = (uuid) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?\nIf user has no registration then user get deleted else deactivated !!",
    );

    if (!confirmed) return;
    setUpdateLoader(uuid);
    api
      .delete(`/admin/deleteUser/${uuid}`)
      .then((res) => {
        fetchUsers();
        getCounsellor();
        setUpdateLoader(null);
        infoToast(res.data.message);
      })
      .catch((err) => {
        console.error("Error deleting user", err);
        setUpdateLoader(null);
      });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };
  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      render: (row) => row.role?.toUpperCase(),
    },
    {
      header: "Contact No.",
      accessor: "contactNum",
    },
    {
      header: "Date Of Birth",
      render: (row) =>
        row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-",
    },
    {
      header: "Joining Date",
      render: (row) =>
        row.joiningDate
          ? new Date(row.joiningDate).toLocaleDateString("en-GB")
          : "-",
    },
    {
      header: "Branch",
      render: (row) => row.counsellorBranch || "-",
    },
    {
      header: "Batch",
      render: (row) => row.batch?.title || "-",
    },
    {
      header: "Team Leader",
      render: (row) =>
        row.role === "sub-admin" ? (
          <span className="text-xs font-semibold text-primary">Team Lead</span>
        ) : (
          row.subAdmin?.name || "-"
        ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Actions",
      render: (row) => (
        <div className="flex justify-left gap-2">
          <button
            onClick={() => setFormUser(row)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.uuid)}
            disabled={updateLoader === row.uuid}
            className={`px-3 py-1 rounded-md text-white ${
              row.isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-50`}
          >
            {updateLoader === row.uuid ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : row.isActive ? (
              "Deactivate"
            ) : (
              "Activate"
            )}
          </button>
        </div>
      ),
    });
  }

  if (isAdmin && formUser) {
    return (
      <div className="p-2 container mx-auto">
        <UserForm
          user={formUser === "new" ? null : formUser}
          subAdmins={subAdmins}
          batches={batches}
          onCancel={() => setFormUser(null)}
          onSaved={() => {
            setFormUser(null);
            fetchUsers();
            fetchBatches();
            getCounsellor();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        {isAdmin ? "User Management" : "My Team"}
      </h1>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFormUser("new")}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add User
          </button>
          <button
            onClick={() => setShowBatches(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Batch
          </button>
        </div>
      )}
      {isAdmin && showBatches && (
        <UserBatchModal
          batches={batches}
          onClose={() => setShowBatches(false)}
          onChanged={() => Promise.all([fetchBatches(), fetchUsers()])}
        />
      )}

      <div className="mt-6 md:p-6 p-2 bg-white shadow-custom">
        <div className="overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
            <div className="w-full md:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-3 h-[42px] w-full text-sm"
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {isAdmin && (
              <div className="w-full md:w-80">
                <CustomMultiSelect
                  label="Sub-admin"
                  options={subAdmins.map((sa) => ({
                    label: `${sa.name} (${sa.counsellorBranch || "?"})`,
                    value: sa.uuid,
                  }))}
                  value={selectedSubAdmins}
                  onChange={setSelectedSubAdmins}
                  isRequired={false}
                  placeholder="Select Sub-admins"
                />
              </div>
            )}

            <div className="w-full md:w-80">
              <CustomMultiSelect
                label="Batch"
                options={batches.map((b) => ({
                  label: b.isActive ? b.title : `${b.title} (inactive)`,
                  value: b.id,
                }))}
                value={selectedBatches}
                onChange={setSelectedBatches}
                isRequired={false}
                placeholder="Select Batches"
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={users}
            loading={false}
            error={null}
            rowKey="uuid"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AddUser;
