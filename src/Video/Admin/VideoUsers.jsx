import { useCallback, useEffect, useState } from "react";
import DataTable from "../../Dashboard/Generic/DataTable";
import Pagination from "../../Dashboard/Generic/Pagination";
import { useToast } from "../../useToast";
import videoApi, { apiMessage } from "../videoApi";
import VideoUserForm from "./VideoUserForm";
import { useVideoStandards } from "./useVideoStandards";

// Admin → Video Users: who can log in to the video platform and which standards they see.
const VideoUsers = () => {
  const { successToast, errorToast } = useToast();
  const { options: standardOptions } = useVideoStandards();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formUser, setFormUser] = useState(null); // null | "new" | user
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoApi.get("/admin/users", {
        params: { page, limit, search: debouncedSearch || undefined, status: status || undefined },
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (error) {
      errorToast(apiMessage(error, "Couldn't load video users"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => setPage(1), [debouncedSearch, status, limit]);

  const toggleActive = async (row) => {
    setToggling(row.id);
    try {
      await videoApi.put(`/admin/users/${row.id}`, { isActive: !row.isActive });
      successToast(row.isActive ? "User deactivated" : "User activated");
      fetchUsers();
    } catch (error) {
      errorToast(apiMessage(error, "Couldn't change the status"));
    } finally {
      setToggling(null);
    }
  };

  const columns = [
    { header: "Sr. No.", render: (_, i) => (page - 1) * limit + i + 1 },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "School", accessor: "schoolName" },
    {
      header: "Standards",
      render: (row) =>
        row.standards.length ? (
          <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
            {row.standards.map((s) => (
              <span key={s.id} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">No access</span>
        ),
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Last Login",
      render: (row) =>
        row.lastLoginAt
          ? new Date(row.lastLoginAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })
          : "-",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => setFormUser(row)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">
            Edit
          </button>
          <button
            onClick={() => toggleActive(row)}
            disabled={toggling === row.id}
            className={`px-3 py-1 rounded-md text-white disabled:opacity-50 ${row.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            {toggling === row.id ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : row.isActive ? (
              "Deactivate"
            ) : (
              "Activate"
            )}
          </button>
        </div>
      ),
    },
  ];

  if (formUser) {
    return (
      <div className="p-2 container mx-auto">
        <VideoUserForm
          user={formUser === "new" ? null : formUser}
          standardOptions={standardOptions}
          onCancel={() => setFormUser(null)}
          onSaved={() => {
            setFormUser(null);
            fetchUsers();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-2 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">Video Users</h1>

      <button onClick={() => setFormUser("new")} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Add Video User
      </button>

      <div className="mt-6 md:p-6 p-2 bg-white shadow-custom">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
          <div className="w-full md:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 h-[42px] w-full text-sm"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 h-[42px] text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={users} loading={loading} rowKey="id" emptyMessage="No video users yet." />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      </div>
    </div>
  );
};

export default VideoUsers;
