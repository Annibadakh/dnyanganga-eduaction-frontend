import { useState, useEffect, useRef } from "react";
import { FileText, Loader2, AlertCircle, Download, X, CheckCircle } from "lucide-react";

export default function BulkHallTicketGenerator({ centerId, onClose }) {
  const [progress, setProgress] = useState({
    stage: 'initializing',
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

  const getStageDisplay = () => {
    switch (progress.stage) {
      case 'initializing':
        return { text: 'Initializing...', color: 'text-blue-600' };
      case 'fetching':
        return { text: 'Fetching Students', color: 'text-blue-600' };
      case 'students_fetched':
        return { text: 'Students Loaded', color: 'text-green-600' };
      case 'fetching_subjects':
        return { text: 'Loading Subjects', color: 'text-blue-600' };
      case 'generating':
        return { text: 'Generating Hall Tickets', color: 'text-blue-600' };
      case 'merging':
        return { text: 'Merging PDFs', color: 'text-blue-600' };
      case 'complete':
        return { text: 'Completed!', color: 'text-green-600' };
      default:
        return { text: 'Processing...', color: 'text-blue-600' };
    }
  };

  const stageDisplay = getStageDisplay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Bulk Hall Ticket Generator</h2>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-blue-700 rounded-full p-1 transition-colors"
            disabled={!isComplete && !error}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Section */}
          {!isComplete && !error && (
            <div className="space-y-6">
              {/* Stage Display */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {progress.stage === 'complete' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  )}
                  <h3 className={`text-2xl font-bold ${stageDisplay.color}`}>
                    {stageDisplay.text}
                  </h3>
                </div>
                <p className="text-gray-600">{progress.message}</p>
              </div>

              {/* Student Count Badge */}
              {progress.totalStudents > 0 && (
                <div className="flex justify-center">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                    Total Students: {progress.totalStudents}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {progress.stage === 'generating' && progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {progress.current} / {progress.total} ({getProgressPercentage()}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  {progress.studentName && (
                    <p className="text-sm text-gray-500 text-center">
                      Current: {progress.studentName}
                    </p>
                  )}
                </div>
              )}

              {/* Stage Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { stage: 'fetching', label: 'Fetch Students', icon: '📋' },
                  { stage: 'students_fetched', label: 'Load Data', icon: '✓' },
                  { stage: 'generating', label: 'Generate PDFs', icon: '📄' },
                  { stage: 'merging', label: 'Merge Files', icon: '🔗' }
                ].map((item, idx) => {
                  const isActive = progress.stage === item.stage;
                  const isPassed = ['students_fetched', 'generating', 'merging', 'complete'].includes(progress.stage) && 
                    ['fetching', 'students_fetched', 'generating', 'merging'].indexOf(item.stage) < 
                    ['fetching', 'students_fetched', 'generating', 'merging'].indexOf(progress.stage);
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg text-center transition-all ${
                        isActive 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : isPassed 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-700' : isPassed ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-semibold">Error</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          {pdfUrl && isComplete && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Generated Successfully
                  </h3>
                  <p className="text-gray-600">
                    Center ID: {centerId} | Year: {new Date().getFullYear()} | 
                    Total: {progress.totalStudents} tickets
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
              <iframe
                src={pdfUrl}
                className="w-full h-[60vh] border-2 border-gray-300 rounded-md"
                title="Hall Ticket Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}