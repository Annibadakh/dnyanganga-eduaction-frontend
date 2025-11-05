import { useState, useEffect } from "react";
import { FileText, Loader2, AlertCircle, Download, X } from "lucide-react";
import api from "../Api";

export default function BulkHallTicketGenerator({ centerId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    generateTickets();
  }, []);

  const generateTickets = async () => {
    setLoading(true);
    setError("");
    setPdfUrl(null);
    try {
      const response = await api.get(`/pdf/bulk-generate?centerId=${centerId}`, {
        responseType: "blob"
      });
      // console.log(response);
      if (response.status === 204) {
        setError("No students found for this center.");
        return;
      }
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
    } catch (err) {
      // console.log(err.status);
      setError(
        err.response?.data?.message || "Error generating hall tickets."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `BulkHallTickets_Center_${centerId}.pdf`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-300 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Bulk Hall Ticket Generator</h2>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 rounded-full p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading && (
            <div className="flex justify-center items-center h-64 text-primary font-semibold">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Generating...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {pdfUrl && !loading && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  Center ID: {centerId} | Year: {new Date().getFullYear()}
                </h3>
                <button
                  onClick={handleDownload}
                  className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-[65vh] border rounded-md"
                title="Hall Ticket Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
