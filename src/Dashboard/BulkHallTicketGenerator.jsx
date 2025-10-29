import { useState } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function BulkHallTicketGenerator() {
  const [centerId, setCenterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  
  const handleGenerate = async () => {
    if (!centerId.trim()) {
      setError('Please enter a valid Center ID');
      return;
    }

    setLoading(true);
    setError('');
    setPdfUrl(null);
    setPdfBlob(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/pdf/bulk-generate`, {
        params: {
          centerId: centerId,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfUrl(url);
      setPdfBlob(blob);
      
      // Extract filename from response headers if available
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          console.log('Generated PDF:', match[1].replace(/['"]/g, ''));
        }
      }

    } catch (err) {
      // Handle axios error response
      if (err.response) {
        // Server responded with error status
        if (err.response.data instanceof Blob) {
          // Error response is JSON in blob format
          const text = await err.response.data.text();
          try {
            const errorData = JSON.parse(text);
            setError(errorData.message || 'Failed to generate hall tickets');
          } catch {
            setError('Failed to generate hall tickets');
          }
        } else {
          setError(err.response.data?.message || 'Failed to generate hall tickets');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        setError(err.message || 'An error occurred while generating hall tickets');
      }
      console.error('Error generating bulk hall tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `BulkHallTickets_Center${centerId}_${new Date().getFullYear()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setCenterId('');
    setPdfUrl(null);
    setPdfBlob(null);
    setError('');
    setStudentCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Bulk Hall Ticket Generator
            </h1>
          </div>
          {/* <p className="text-gray-600 text-lg">
            Generate hall tickets for all students at an exam center
          </p> */}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="max-w-2xl mx-auto">
            <label htmlFor="centerId" className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Center ID
            </label>
            <div className="flex gap-4">
              <input
                id="centerId"
                type="text"
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter Center ID (e.g., 101)"
                disabled={loading}
                className="flex-1 px-4 py-3 border-1 border-primary  rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !centerId.trim()}
                className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
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

        {/* PDF Preview and Download Section */}
        {pdfUrl && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Action Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Hall Tickets Generated</h2>
                  <p className="text-indigo-200 text-sm">
                    Center ID: {centerId} | Year: {new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-indigo-800 text-white font-semibold rounded-lg hover:bg-indigo-900 transition-all"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-inner overflow-hidden" style={{ height: '75vh' }}>
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Hall Ticket Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions
        {!pdfUrl && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Instructions</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Enter the Exam Center ID in the input field above</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Click the "Generate" button to create hall tickets for all students at that center</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Preview the generated PDF in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Download the PDF file containing all hall tickets</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only students with the current exam year ({new Date().getFullYear()}) will be included in the generated hall tickets.
              </p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}