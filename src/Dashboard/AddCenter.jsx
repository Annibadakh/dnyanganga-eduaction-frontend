import React, { useState, useEffect } from "react";
import api from "../Api";

const AddCenter = () => {
  const [centers, setCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ centerId: "", centerName: "", capicity: "", collegeName: "" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ centerName: "", capicity: "", collegeName: "" });
  const [submitLoader, setSubmitLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(null);
  const [updateLoader, setUpdateLoader] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = () => {
    api.get("/admin/getExamCentersDetails")
      .then((response) => setCenters(response.data.data))
      .catch((error) => console.error("Error fetching centre", error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCenter = { ...formData, capicity: parseInt(formData.capicity) };
    setSubmitLoader(true);
    api.post("/admin/addCenter", newCenter)
      .then(() => {
        alert("Centre added!");
        fetchCenters();
        setShowForm(false);
        setFormData({ centerId: "", centerName: "", capicity: "", collegeName: "" });
        setSubmitLoader(false);
      })
      .catch((error) => {
        console.error("Error adding centre", error);
        alert(error.response?.data?.message || "Error adding centre");
        setSubmitLoader(false);
      });
  };

  const handleDelete = (centerId) => {
    if (!window.confirm("Are you sure you want to delete this centre?")) return;
    setDeleteLoader(centerId);
    api.delete(`/admin/deleteExamCenter/${centerId}`)
      .then(() => {
        fetchCenters();
        setDeleteLoader(null);
      })
      .catch((error) => {
        console.error("Error deleting centre", error);
        setDeleteLoader(null);
      });
  };

  const handleEdit = (center) => {
    setEditData({ centerName: center.centerName, capicity: center.capicity, collegeName: center.collegeName });
    setEditId(center.centerId);
  };

  const handleSaveEdit = (centerId) => {
    setUpdateLoader(centerId);
    api.put(`/admin/editcapicity/${centerId}`, {
      centerName: editData.centerName,
      capicity: parseInt(editData.capicity),
      collegeName: editData.collegeName
    })
      .then(() => {
        alert("Centre details updated!");
        setEditId(null);
        fetchCenters();
        setUpdateLoader(null);
      })
      .catch((error) => {
        console.error("Error updating centre", error);
        setUpdateLoader(null);
      });
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">Exam Centre</h1>

      {!showForm && (<button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Add Centre
      </button>)}

      {showForm && (
        <div className="mt-4 bg-gray-100 md:p-6 p-2 shadow-custom">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New Centre</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold">Centre ID</label>
              <input type="number" name="centerId" onWheel={(e) => e.target.blur()} value={formData.centerId} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Centre Name</label>
              <input type="text" name="centerName" value={formData.centerName} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">College Name</label>
              <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex space-x-2">
              <button type="submit" disabled={submitLoader} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50">
                {submitLoader ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} disabled={submitLoader} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 p-2 md:p-6 bg-white shadow-custom ">
        <div className="overflow-x-auto">
          <table className="table-auto w-full border text-center border-gray-300 overflow-hidden text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 whitespace-nowrap border">Sr. No.</th>
              <th className="p-3 whitespace-nowrap border">Centre ID.</th>
              <th className="p-3 whitespace-nowrap border">Centre Name</th>
              <th className="p-3 whitespace-nowrap border">College Name</th>
              <th className="p-3 whitespace-nowrap border">Capacity</th>
              <th className="p-3 whitespace-nowrap border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {centers.length > 0 ? (
              centers.map((center, index) => (
                <tr key={center.centerId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap border">{index + 1}</td>
                  <td className="p-3 whitespace-nowrap border">{center.centerId.toString().padStart(4, '0')}</td>
                  <td className="p-3 whitespace-nowrap border">
                    {editId === center.centerId ? (
                      <input type="text" value={editData.centerName} onChange={(e) => setEditData({ ...editData, centerName: e.target.value })} className="w-full p-1 border rounded-md" />
                    ) : (
                      center.centerName
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap border">
                    {editId === center.centerId ? (
                      <input type="text" value={editData.collegeName} onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })} className="w-full p-1 border rounded-md" />
                    ) : (
                      center.collegeName
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap border">
                    {editId === center.centerId ? (
                      <input type="number" value={editData.capicity} onWheel={(e) => e.target.blur()} onChange={(e) => setEditData({ ...editData, capicity: e.target.value })} className="w-20 p-1 border rounded-md" />
                    ) : (
                      center.capicity
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap border">
                    <div className="flex justify-center space-x-2">
                      {editId === center.centerId ? (
                        <button
                          onClick={() => handleSaveEdit(center.centerId)}
                          disabled={updateLoader === center.centerId}
                          className="bg-green-500 text-white px-3 py-1 min-w-14 flex items-center justify-center rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {updateLoader === center.centerId ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "Save"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(center)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                      {/* <button
                        onClick={() => handleDelete(center.centerId)}
                        disabled={deleteLoader === center.centerId}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleteLoader === center.centerId ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "Delete"}
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No centers found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AddCenter;
