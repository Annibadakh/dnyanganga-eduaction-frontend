import { useState, useEffect } from "react";
import api from "../Api";
import BulkHallTicketGenerator from "./BulkHallTicketGenerator";
import { FileText, RefreshCw, ArrowRightCircle } from "lucide-react";

export default function AddCenter() {
  const [centers, setCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    centerId: "",
    centerName: "",
    collegeName: ""
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    centerName: "",
    collegeName: ""
  });
  const [submitLoader, setSubmitLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(null);

  // Bulk Ticket Generator Modal
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [algoLoader, setAlgoLoader] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = () => {
    api
      .get("/admin/getExamCentersDetails")
      .then((response) => setCenters(response.data.data))
      .catch((error) => console.error("Error fetching centre", error));
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
        alert("Centre added!");
        fetchCenters();
        setShowForm(false);
        setFormData({ centerId: "", centerName: "", collegeName: "" });
      })
      .catch((error) => {
        console.error("Error adding centre", error);
        alert(error.response?.data?.message || "Error adding centre");
      })
      .finally(() => setSubmitLoader(false));
  };

  const handleEdit = (center) => {
    setEditData({
      centerName: center.centerName,
      collegeName: center.collegeName
    });
    setEditId(center.centerId);
  };

  const handleSaveEdit = (centerId) => {
    setUpdateLoader(centerId);
    api
      .put(`/admin/editcapicity/${centerId}`, editData)
      .then(() => {
        alert("Centre details updated!");
        setEditId(null);
        fetchCenters();
      })
      .catch((error) => console.error("Error updating centre", error))
      .finally(() => setUpdateLoader(null));
  };

  const handleResetSeatNumbers = async (centerId) => {
    const confirm = window.confirm(
      "⚠️ This will completely reset and regenerate seat numbers for all students alphabetically.\n\n" +
      "Use this only if hall tickets are NOT yet distributed.\n\n" +
      "This action is IRREVERSIBLE.\n\nDo you want to continue?"
    );
    if (!confirm) return;

    try {
      setAlgoLoader(centerId);
      const res = await api.post("/admin/generateSeatNumbers/reset", { centerId });
      alert(res.data.message || "Seat numbers regenerated successfully!");
    } catch (error) {
      console.error("Error in reset seat numbers", error);
      alert(error.response?.data?.message || "Error resetting seat numbers");
    } finally {
      setAlgoLoader(null);
    }
  };

  // 🔹 Function for Algorithm 2 (Continue)
  const handleContinueSeatNumbers = async (centerId) => {
    const confirm = window.confirm(
      "⚠️ This will assign seat numbers ONLY to newly added students, continuing from the last number.\n\n" +
      "Use this only if hall tickets are ALREADY distributed.\n\n" +
      "This action is IRREVERSIBLE.\n\nDo you want to continue?"
    );
    if (!confirm) return;

    try {
      setAlgoLoader(centerId);
      const res = await api.post("/admin/generateSeatNumbers/continue", { centerId });
      alert(res.data.message || "Seat numbers continued successfully!");
    } catch (error) {
      console.error("Error in continue seat numbers", error);
      alert(error.response?.data?.message || "Error continuing seat numbers");
    } finally {
      setAlgoLoader(null);
    }
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        Exam Centre
      </h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Centre
        </button>
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
              <button
                type="submit"
                disabled={submitLoader}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {submitLoader ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 p-2 md:p-6 bg-white shadow-custom">
        <div className="overflow-x-auto">
          <table className="table-auto w-full border text-center text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 border whitespace-nowrap">Sr. No.</th>
                <th className="p-3 border whitespace-nowrap">Centre ID</th>
                <th className="p-3 border whitespace-nowrap">Centre Name</th>
                <th className="p-3 border whitespace-nowrap">College Name</th>
                <th className="p-3 border whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {centers.length > 0 ? (
                centers.map((center, index) => (
                  <tr key={center.centerId} className="border-b hover:bg-gray-50">
                    <td className="p-3 border whitespace-nowrap">{index + 1}</td>
                    <td className="p-3 border whitespace-nowrap">
                      {center.centerId.toString().padStart(4, "0")}
                    </td>
                    <td className="p-3 border whitespace-nowrap">
                      {editId === center.centerId ? (
                        <input
                          type="text"
                          value={editData.centerName}
                          onChange={(e) =>
                            setEditData({ ...editData, centerName: e.target.value })
                          }
                          className="p-1 border rounded-md"
                        />
                      ) : (
                        center.centerName
                      )}
                    </td>
                    <td className="p-3 border whitespace-nowrap">
                      {editId === center.centerId ? (
                        <input
                          type="text"
                          value={editData.collegeName}
                          onChange={(e) =>
                            setEditData({ ...editData, collegeName: e.target.value })
                          }
                          className="p-1 border rounded-md"
                        />
                      ) : (
                        center.collegeName
                      )}
                    </td>

                    {/* 🔹 ACTION BUTTONS */}
                    <td className="p-3 border whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        {editId === center.centerId ? (
                          <button
                            onClick={() => handleSaveEdit(center.centerId)}
                            disabled={updateLoader === center.centerId}
                            className="bg-green-500 text-white px-3 py-1 rounded-md"
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(center)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCenterId(center.centerId);
                                setShowBulkGenerator(true);
                              }}
                              className="bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-800 flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" /> Tickets
                            </button>

                            {/* 🔹 New Buttons for Seat Number Generation */}
                            <button
                              onClick={() => handleResetSeatNumbers(center.centerId)}
                              disabled={algoLoader === center.centerId}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center gap-1"
                            >
                              <RefreshCw className="w-4 h-4" />
                              {algoLoader === center.centerId ? "Processing..." : "Reset Algo"}
                            </button>

                            <button
                              onClick={() => handleContinueSeatNumbers(center.centerId)}
                              disabled={algoLoader === center.centerId}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-1"
                            >
                              <ArrowRightCircle className="w-4 h-4" />
                              {algoLoader === center.centerId ? "Processing..." : "Continue Algo"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-gray-500">
                    No centers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
