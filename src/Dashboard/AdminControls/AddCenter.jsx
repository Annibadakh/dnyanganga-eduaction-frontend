import { useState, useEffect, useContext } from "react";
import api from "../../Api";
import BulkHallTicketGenerator from "./BulkHallTicketGenerator";
import {
  FileText,
  RefreshCw,
  ArrowRightCircle,
  Plus,
  Save,
  X,
  SaveAll,
  Edit,
} from "lucide-react";
import { DashboardContext } from "../../Context/DashboardContext";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import DataTable from "../Generic/DataTable";
import Pagination from "../Generic/Pagination";
import SelectField from "../Generic/SelectField";

export default function AddCenter() {
  const { getExamCenter } = useContext(DashboardContext);
  const { successToast, errorToast, infoToast } = useToast();
  const [centers, setCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    centerId: "",
    centerName: "",
    collegeName: "",
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    centerId: "",
    centerName: "",
    collegeName: "",
  });
  const [submitLoader, setSubmitLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(null);

  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [algoLoader, setAlgoLoader] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();

  const [examYear, setExamYear] = useState(currentYear);

  const yearOptions = Array.from({ length: 5 }, (_, index) => ({
    value: currentYear - 2 + index,
    label: currentYear - 2 + index,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCenters();
  }, [currentPage, itemsPerPage, debouncedSearch, examYear]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/getExamCentersDetails", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          examYear,
        },
      });

      setCenters(response.data.data);

      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalItems);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitLoader(true);

    api
      .post("/admin/addCenter", formData)
      .then(() => {
        successToast("Centre added!");
        fetchCenters();
        getExamCenter();
        setShowForm(false);
        setFormData({ centerId: "", centerName: "", collegeName: "" });
      })
      .catch((error) => {
        console.error("Error adding centre", error);
        errorToast(error.response?.data?.message || "Error adding centre");
      })
      .finally(() => setSubmitLoader(false));
  };

  const handleEdit = (center) => {
    setEditData({
      newcenterId: center.centerId,
      centerName: center.centerName,
      collegeName: center.collegeName,
    });
    setEditId(center.centerId);
  };

  const handleSaveEdit = (centerId) => {
    setUpdateLoader(centerId);

    api
      .put(`/admin/editcapicity/${centerId}`, editData)
      .then(() => {
        successToast("Centre details updated!");
        setEditId(null);
        fetchCenters();
      })
      .catch((error) => {
        console.error("Error updating centre", error);

        const message =
          error.response?.data?.message || "Error updating centre";

        errorToast(message);
      })
      .finally(() => {
        setUpdateLoader(null);
      });
  };

  const handleResetSeatNumbers = async (centerId) => {
    const confirm = window.confirm(
      "⚠️ This will completely reset and regenerate seat numbers for all students alphabetically.\n\n" +
        "Use this only if hall tickets are NOT yet distributed.\n\n" +
        "This action is IRREVERSIBLE.\n\nDo you want to continue?",
    );
    if (!confirm) return;

    try {
      setAlgoLoader(centerId);
      const res = await api.post("/admin/generateSeatNumbers/reset", {
        centerId,
      });
      infoToast(res.data.message || "Seat numbers regenerated successfully!");
    } catch (error) {
      console.error("Error in reset seat numbers", error);
      errorToast(
        error.response?.data?.message || "Error resetting seat numbers",
      );
    } finally {
      setAlgoLoader(null);
    }
  };

  // 🔹 Function for Algorithm 2 (Continue)
  const handleContinueSeatNumbers = async (centerId) => {
    const confirm = window.confirm(
      "⚠️ This will assign seat numbers ONLY to newly added students, continuing from the last number.\n\n" +
        "Use this only if hall tickets are ALREADY distributed.\n\n" +
        "This action is IRREVERSIBLE.\n\nDo you want to continue?",
    );
    if (!confirm) return;

    try {
      setAlgoLoader(centerId);
      const res = await api.post("/admin/generateSeatNumbers/continue", {
        centerId,
      });
      infoToast(res.data.message || "Seat numbers continued successfully!");
    } catch (error) {
      console.error("Error in continue seat numbers", error);
      errorToast(
        error.response?.data?.message || "Error continuing seat numbers",
      );
    } finally {
      setAlgoLoader(null);
    }
  };
  const columns = [
    {
      header: "Sr. No.",
      render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Centre ID",
      render: (row) =>
        editId === row.centerId ? (
          <input
            type="number"
            value={editData.newcenterId}
            onChange={(e) =>
              setEditData({
                ...editData,
                newcenterId: e.target.value,
              })
            }
            className="border rounded-md p-1"
          />
        ) : (
          row.centerId.toString().padStart(4, "0")
        ),
    },
    {
      header: "Centre Name",
      render: (row) =>
        editId === row.centerId ? (
          <input
            type="text"
            value={editData.centerName}
            onChange={(e) =>
              setEditData({
                ...editData,
                centerName: e.target.value,
              })
            }
            className="border rounded-md p-1"
          />
        ) : (
          row.centerName
        ),
    },
    {
      header: "Students",
      render: (row) => (
        <span className="font-semibold text-primary">{row.studentCount}</span>
      ),
    },
    {
      header: "College Name",
      render: (row) =>
        editId === row.centerId ? (
          <input
            type="text"
            value={editData.collegeName}
            onChange={(e) =>
              setEditData({
                ...editData,
                collegeName: e.target.value,
              })
            }
            className="border rounded-md p-1"
          />
        ) : (
          row.collegeName
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex justify-center gap-2">
          {editId === row.centerId ? (
            <Button
              onClick={() => handleSaveEdit(row.centerId)}
              loading={updateLoader === row.centerId}
              variant="success"
              startIcon={<SaveAll size={16} />}
            >
              Save
            </Button>
          ) : (
            <>
              <Button
                variant="warning"
                onClick={() => handleEdit(row)}
                startIcon={<Edit size={16} />}
              >
                Edit
              </Button>

              <Button
                onClick={() => {
                  setSelectedCenterId(row.centerId);
                  setShowBulkGenerator(true);
                }}
                startIcon={<FileText size={16} />}
              >
                Tickets
              </Button>

              <Button
                variant="danger"
                onClick={() => handleResetSeatNumbers(row.centerId)}
                loading={algoLoader === row.centerId}
                startIcon={<RefreshCw size={16} />}
              >
                Reset Algo
              </Button>

              <Button
                variant="success"
                onClick={() => handleContinueSeatNumbers(row.centerId)}
                loading={algoLoader === row.centerId}
                startIcon={<ArrowRightCircle size={16} />}
              >
                Continue Algo
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Exam Centre
      </h1>

      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          startIcon={<Plus size={16} />}
        >
          Add Centre
        </Button>
      )}

      {showForm && (
        <div className="mt-4 bg-gray-100 md:p-6 p-2 shadow-custom">
          <h2 className="text-xl font-semibold mb-4 text-secondary">
            Add New Centre
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold">Centre ID</label>
              <input
                type="number"
                name="centerId"
                onWheel={(e) => e.target.blur()}
                value={formData.centerId}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Centre Name</label>
              <input
                type="text"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">College Name</label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={submitLoader}
                loading={submitLoader}
                startIcon={<Save size={16} />}
              >
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={submitLoader}
                startIcon={<X size={16} />}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 p-2 md:p-6 bg-white shadow-custom">
        <div className="overflow-x-auto">
          <div className="flex justify-between px-4">
            <input
              type="text"
              placeholder="Search Centre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-md px-3 py-2 w-full md:w-80"
            />
            <SelectField
              id="examYear"
              label="Exam Year"
              value={examYear}
              onChange={(value) => {
                setExamYear(value);
                setCurrentPage(1);
              }}
              placeholder="Select Exam Year"
              options={yearOptions}
              className="w-full md:w-1/4"
            />
          </div>
          <DataTable
            columns={columns}
            data={centers}
            loading={loading}
            error={error}
            rowKey="centerId"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modal for Ticket Generator */}
      {showBulkGenerator && (
        <BulkHallTicketGenerator
          centerId={selectedCenterId}
          onClose={() => setShowBulkGenerator(false)}
        />
      )}
    </div>
  );
}
