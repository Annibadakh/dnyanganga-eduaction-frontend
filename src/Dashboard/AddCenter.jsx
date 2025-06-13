import React, { useState, useEffect } from "react";
import api from "../Api";

const AddCenter = () => {
  const [centers, setCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ centerName: "", capicity: "", collegeName: "" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ capicity: "", collegeName: "" });
  const [submitLoader, setSubmitLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(null);
  const [updateLoader, setUpdateLoader] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = () => {
    api
      .get("/admin/getExamCenters")
      .then((response) => setCenters(response.data.data))
      .catch((error) => console.error("Error fetching centers", error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCenter = { 
      ...formData, 
      capicity: parseInt(formData.capicity) 
    };
    setSubmitLoader(true)
    api
      .post("/admin/addCenter", newCenter)
      .then(() => {
        alert("Center added!");
        fetchCenters();
        setShowForm(false);
        setFormData({ centerName: "", capicity: "", collegeName: "" });
        setSubmitLoader(false);
      })
      .catch((error) => {
        console.error("Error adding center", error);
        alert(error.response?.data?.message || "Error adding center");
        setSubmitLoader(false);
      })
  };

  const handleDelete = (centerId) => {
    if (!window.confirm("Are you sure you want to delete this center?")) return;
    setDeleteLoader(centerId);
    api
      .delete(`/admin/deleteExamCenter/${centerId}`)
      .then(() => {
        fetchCenters();
        setDeleteLoader(null);
      })
      .catch((error) => {
        console.error("Error deleting center", error);
        setDeleteLoader(null);
      });
  };

  const handleEdit = (center) => {
    setEditData({ 
      capicity: center.capicity, 
      collegeName: center.collegeName 
    });
    setEditId(center.centerId);
  };

  const handleSaveEdit = (centerId) => {
    setUpdateLoader(centerId);
    api
      .put(`/admin/editcapicity/${centerId}`, { 
        capicity: parseInt(editData.capicity), 
        collegeName: editData.collegeName 
      })
      .then(() => {
        alert("Center details updated!");
        setEditId(null);
        fetchCenters();
        setUpdateLoader(null);
      })
      .catch((error) => {
        console.error("Error updating center", error);
        setUpdateLoader(null);
      });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Exam Center Management</h1>

      <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Add Center
      </button>

      {showForm && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold">Center Name:</label>
              <input type="text" name="centerName" value={formData.centerName} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">College Name:</label>
              <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Capacity:</label>
              <input type="number" name="capicity" value={formData.capicity} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitLoader}
                className="bg-green-500 disabled:opacity-50 min-w-20 text-white px-4 py-2 rounded-md hover:bg-green-600 grid place-items-center">
                  {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
              <button type="button" disabled={submitLoader} onClick={() => setShowForm(false)} className="bg-gray-500 text-white disabled:opacity-50 px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Sr. No</th>
              <th className="border p-2">Center Id</th>
              <th className="border p-2">Center Name</th>
              <th className="border p-2">College Name</th>
              <th className="border p-2">Capacity</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {centers.length > 0 ? (
              centers.map((center, index) => (
                <tr key={center.centerId} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{center.centerId}</td>
                  <td className="border p-2">{center.centerName}</td>
                  <td className="border p-2 text-center">
                    {editId === center.centerId ? (
                      <input type="text" value={editData.collegeName} onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })} className="w-28 p-1 border rounded-md" />
                    ) : (
                      center.collegeName
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {editId === center.centerId ? (
                      <input type="number" value={editData.capicity} onChange={(e) => setEditData({ ...editData, capicity: e.target.value })} className="w-20 p-1 border rounded-md" />
                    ) : (
                      center.capicity
                    )}
                  </td>
                  <td className="border p-2 text-center gap-2 flex flex-row">
                    {editId === center.centerId ? (
                      <button
                        onClick={() => handleSaveEdit(center.centerId)}
                        disabled={updateLoader == center.centerId}
                        className="bg-green-500 text-white px-3 py-1 min-w-14 disabled:opacity-50 rounded-md hover:bg-green-600 grid place-items-center">
                          {updateLoader == center.centerId ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Save"}
                        </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(center)}
                        className="bg-yellow-500 text-white min-w-14 px-3 py-1 rounded-md hover:bg-yellow-600">
                          Edit
                        </button>
                    )}
                    <button
                      onClick={() => handleDelete(center.centerId)} 
                      disabled={deleteLoader == center.centerId}
                      className="bg-red-500 text-white min-w-20 disabled:opacity-50 px-3 py-1 rounded-md hover:bg-red-600 ml-1 grid place-items-center">
                        {deleteLoader == center.centerId ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Delete"}
                      </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border p-2 text-center text-gray-500">No centers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddCenter;
