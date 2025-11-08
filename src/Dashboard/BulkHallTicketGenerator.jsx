import { useState, useEffect, useRef } from "react";
import { FileText, Loader2, AlertCircle, Download, X, CheckCircle, Users } from "lucide-react";

export default function BulkHallTicketGenerator({ centerId, onClose }) {
  const [progress, setProgress] = useState({
    stage: 'fetching',
    message: '',
    current: 0,
    total: 0,
    totalStudents: 0
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    generateTickets();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  const generateTickets = async () => {
    setError("");
    setPdfUrl(null);
    setIsComplete(false);

    try {
      // Create EventSource for SSE
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const eventSource = new EventSource(
        `${apiBaseUrl}/pdf/bulk-generate-progress?centerId=${centerId}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.stage === 'error') {
          setError(data.message);
          eventSource.close();
          return;
        }

        if (data.stage === 'complete') {
          setProgress({
            stage: 'complete',
            message: data.message,
            current: data.totalGenerated,
            total: data.totalGenerated,
            totalStudents: data.totalGenerated
          });
          
          // Convert base64 to blob
          const byteCharacters = atob(data.pdfData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setPdfBlob(blob);
          setIsComplete(true);
          eventSource.close();
          return;
        }

        setProgress(data);
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('Connection error. Please try again.');
        eventSource.close();
      };

    } catch (err) {
      setError(err.message || "Error generating hall tickets.");
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `BulkHallTickets_Center_${centerId}_${new Date().getFullYear()}.pdf`;
    link.click();
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bulk Hall Ticket Generator</h2>
              <p className="text-blue-100 text-sm">Center ID: {centerId}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            disabled={!isComplete && !error}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Progress Section */}
          {!isComplete && !error && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Main Status */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {progress.stage === 'fetching' && 'Fetching Students...'}
                    {progress.stage === 'students_fetched' && 'Students Loaded'}
                    {progress.stage === 'generating' && 'Generating Hall Tickets'}
                  </h3>
                  <p className="text-gray-600">{progress.message}</p>
                </div>
              </div>

              {/* Student Count Card */}
              {progress.totalStudents > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700">
                        {progress.totalStudents}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Total Students
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar with Counter */}
              {progress.stage === 'generating' && progress.total > 0 && (
                <div className="space-y-4">
                  {/* Counter Display */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {progress.current}
                      <span className="text-gray-400 mx-2">/</span>
                      <span className="text-gray-600">{progress.total}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Hall Tickets Generated</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>Progress</span>
                      <span className="text-blue-600">{getProgressPercentage()}%</span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${getProgressPercentage()}%` }}
                      >
                        {getProgressPercentage() > 10 && (
                          <span className="text-white text-xs font-bold">
                            {getProgressPercentage()}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Indicators */}
              <div className="flex items-center justify-center gap-4">
                {/* Stage 1: Fetching */}
                <div className={`flex flex-col items-center ${
                  progress.stage === 'fetching' 
                    ? 'opacity-100' 
                    : progress.stage === 'students_fetched' || progress.stage === 'generating'
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    progress.stage === 'fetching'
                      ? 'bg-blue-600 text-white'
                      : progress.stage === 'students_fetched' || progress.stage === 'generating'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {progress.stage === 'students_fetched' || progress.stage === 'generating' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-bold">1</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">Fetch Students</span>
                </div>

                {/* Connector */}
                <div className={`w-16 h-1 ${
                  progress.stage === 'students_fetched' || progress.stage === 'generating'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}></div>

                {/* Stage 2: Count */}
                <div className={`flex flex-col items-center ${
                  progress.stage === 'students_fetched'
                    ? 'opacity-100'
                    : progress.stage === 'generating'
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    progress.stage === 'students_fetched'
                      ? 'bg-blue-600 text-white'
                      : progress.stage === 'generating'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {progress.stage === 'generating' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-bold">2</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">Count Students</span>
                </div>

                {/* Connector */}
                <div className={`w-16 h-1 ${
                  progress.stage === 'generating'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}></div>

                {/* Stage 3: Generating */}
                <div className={`flex flex-col items-center ${
                  progress.stage === 'generating' ? 'opacity-100' : 'opacity-40'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    progress.stage === 'generating'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">Generate Tickets</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-1">Error Occurred</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          {pdfUrl && isComplete && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-900">Generation Complete!</h3>
                      <p className="text-green-700">
                        Successfully generated {progress.totalStudents} hall tickets
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Download PDF</span>
                  </button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="bg-gray-100 rounded-xl p-4 shadow-inner">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[60vh] border-2 border-gray-300 rounded-lg bg-white"
                  title="Hall Ticket Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}