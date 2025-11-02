import { useState, useEffect } from "react";
import { Download, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import api from "../Api";
export default function AddCenter() {
  const [centers, setCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ centerId: "", centerName: "", capicity: "", collegeName: "" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ centerName: "", capicity: "", collegeName: "" });
  const [submitLoader, setSubmitLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(null);
  const [updateLoader, setUpdateLoader] = useState(null);
  
  // Bulk Hall Ticket Generator States
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = () => {
    // Replace with your actual API call
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

  // Bulk Hall Ticket Generator Functions
  // Bulk Hall Ticket Generator Functions
  const openBulkGenerator = async (centerId) => {
    setSelectedCenterId(centerId.toString());
    setShowBulkGenerator(true);
    setError('');
    setPdfUrl(null);
    setPdfBlob(null);
    setLoading(true);
    
    // Automatically call generate
    try {
      const response = await api.get(`/pdf/bulk-generate?centerId=${centerId}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPdfBlob(blob);

      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          console.log('Generated PDF:', match[1].replace(/['"]/g, ''));
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while generating hall tickets';
      setError(message);
      console.error('Error generating bulk hall tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeBulkGenerator = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setShowBulkGenerator(false);
    setSelectedCenterId('');
    setPdfUrl(null);
    setPdfBlob(null);
    setError('');
  };

  const handleGenerate = async () => {
  if (!selectedCenterId.trim()) {
    setError('Please enter a valid Center ID');
    return;
  }

  setLoading(true);
  setError('');
  setPdfUrl(null);
  setPdfBlob(null);

  try {

    const response = await api.get(`/pdf/bulk-generate?centerId=${selectedCenterId}`, {
      responseType: 'blob',
    });

    const blob = response.data;
    const url = URL.createObjectURL(blob);

    setPdfUrl(url);
    setPdfBlob(blob);

    // Extract filename if provided in headers
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        console.log('Generated PDF:', match[1].replace(/['"]/g, ''));
      }
    }

  } catch (err) {
    // Axios error handling
    const message =
      err.response?.data?.message ||
      err.message ||
      'An error occurred while generating hall tickets';
    setError(message);
    console.error('Error generating bulk hall tickets:', err);
  } finally {
    setLoading(false);
  }
};


  const handleDownload = () => {
    if (!pdfBlob) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `BulkHallTickets_Center${selectedCenterId}_${new Date().getFullYear()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setPdfBlob(null);
    setError('');
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">Exam Centre</h1>

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Centre
        </button>
      )}

      {showForm && (
        <div className="mt-4 bg-gray-100 md:p-6 p-2 shadow-custom">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Add New Centre</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold">Centre ID</label>
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
              <label className="block text-gray-700 font-semibold">Centre Name</label>
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
              <label className="block text-gray-700 font-semibold">College Name</label>
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
                onClick={handleSubmit} 
                disabled={submitLoader} 
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {submitLoader ? <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit"}
              </button>
              <button 
                onClick={() => setShowForm(false)} 
                disabled={submitLoader} 
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-2 md:p-6 bg-white shadow-custom">
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
                        <input 
                          type="text" 
                          value={editData.centerName} 
                          onChange={(e) => setEditData({ ...editData, centerName: e.target.value })} 
                          className="w-full p-1 border rounded-md" 
                        />
                      ) : (
                        center.centerName
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap border">
                      {editId === center.centerId ? (
                        <input 
                          type="text" 
                          value={editData.collegeName} 
                          onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })} 
                          className="w-full p-1 border rounded-md" 
                        />
                      ) : (
                        center.collegeName
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap border">
                      {editId === center.centerId ? (
                        <input 
                          type="number" 
                          value={editData.capicity} 
                          onWheel={(e) => e.target.blur()} 
                          onChange={(e) => setEditData({ ...editData, capicity: e.target.value })} 
                          className="w-20 p-1 border rounded-md" 
                        />
                      ) : (
                        center.capicity
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap border">
                      <div className="flex justify-center space-x-2 gap-y-2">
                        {editId === center.centerId ? (
                          <button
                            onClick={() => handleSaveEdit(center.centerId)}
                            disabled={updateLoader === center.centerId}
                            className="bg-green-500 text-white px-3 py-1 min-w-14 flex items-center justify-center rounded-md hover:bg-green-600 disabled:opacity-50"
                          >
                            {updateLoader === center.centerId ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "Save"}
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
                              onClick={() => openBulkGenerator(center.centerId)}
                              className="bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-800 flex items-center gap-1"
                              title="Generate Bulk Hall Tickets"
                            >
                              <FileText className="w-4 h-4" />
                              Tickets
                            </button>
                          </>
                        )}
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

      {/* Bulk Hall Ticket Generator Modal */}
      {showBulkGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-300 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="bg-primary text-white px-4 md:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold">Bulk Hall Ticket Generator</h2>
              </div>
              <button
                onClick={closeBulkGenerator}
                className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!pdfUrl ? (
                <div className="max-w-2xl mx-auto">
                  <div className="p-4 md:p-8 rounded-xl">
                    {/* <label htmlFor="centerId" className="block text-sm font-semibold text-gray-700 mb-2">
                      Exam Center ID
                    </label> */}
                    <div className="grid place-items-center gap-4">
                      {/* <input
                        id="centerId"
                        type="text"
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Enter Center ID (e.g., 101)"
                        disabled={loading}
                        className="flex-1 px-4 py-3 border-2 border-primary rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
                      /> */}
                      <button
                        onClick={handleGenerate}
                        disabled={loading || !selectedCenterId.trim()}
                        className="px-6 md:px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5" />
                            Generate
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">Error</p>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Action Bar */}
                  <div className="bg-primary px-4 md:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-white">
                      <FileText className="w-6 h-6" />
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">Hall Tickets Generated</h3>
                        <p className="text-white text-sm">
                          Center ID: {selectedCenterId} | Year: {new Date().getFullYear()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleDownload}
                        className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">Download</span>
                      </button>
                      {/* <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                      >
                        New Search
                      </button> */}
                    </div>
                  </div>

                  {/* PDF Preview */}
                  <div className="p-4 md:p-6 bg-gray-50">
                    <div className="bg-white rounded-lg shadow-inner overflow-hidden" style={{ height: '60vh' }}>
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="Hall Ticket Preview"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}