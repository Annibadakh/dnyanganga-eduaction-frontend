import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  Download,
  X,
  CheckCircle,
  Users,
} from "lucide-react";

export default function BulkHallTicketGenerator({ centerId, onClose }) {
  const [progress, setProgress] = useState({
    stage: "fetching",
    message: "",
    current: 0,
    total: 0,
    totalStudents: 0,
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

  // Server-Sent Events read through fetch() so the admin's login token can be sent
  // (the browser EventSource API cannot send an Authorization header).
  const handleEvent = (data) => {
    if (data.stage === "error") {
      setError(data.message);
      return true;
    }

    if (data.stage === "complete") {
      setProgress({
        stage: "complete",
        message: data.message,
        current: data.totalGenerated,
        total: data.totalGenerated,
        totalStudents: data.totalGenerated,
      });

      // Convert base64 to blob
      const byteCharacters = atob(data.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
      setIsComplete(true);
      return true;
    }

    setProgress(data);
    return false;
  };

  const generateTickets = async () => {
    setError("");
    setPdfUrl(null);
    setIsComplete(false);

    const controller = new AbortController();
    eventSourceRef.current = { close: () => controller.abort() };

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      let token = "";
      try {
        token = JSON.parse(localStorage.getItem("user"))?.token || "";
      } catch {
        token = "";
      }

      const response = await fetch(
        `${apiBaseUrl}/pdf/bulk-generate-progress?centerId=${encodeURIComponent(centerId)}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          signal: controller.signal,
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
      if (!response.ok || !response.body) {
        let message = "Error generating hall tickets.";
        try {
          message = (await response.json()).message || message;
        } catch {
          // non-JSON error body
        }
        setError(message);
        return;
      }

      // Parse the SSE stream: events are separated by a blank line, data lines start with "data: "
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const dataLines = rawEvent
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart());
          if (dataLines.length === 0) continue; // heartbeat / comment
          if (handleEvent(JSON.parse(dataLines.join("\n")))) {
            finished = true;
            controller.abort();
            break;
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Bulk hall ticket stream error:", err);
      setError("Connection error. Please try again.");
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
                    {progress.stage === "fetching" && "Fetching Students..."}
                    {progress.stage === "students_fetched" && "Students Loaded"}
                    {progress.stage === "generating" &&
                      "Generating Hall Tickets"}
                  </h3>
                  <p className="text-gray-600">{progress.message}</p>
                </div>
              </div>

              {/* Progress Bar with Counter - Only show during generation */}
              {progress.totalStudents > 0 && (
                <div className="space-y-4">
                  {/* Counter Display */}
                  {/* <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {progress.current}
                      <span className="text-gray-400 mx-2">/</span>
                      <span className="text-gray-600">{progress.totalStudents}</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {progress.stage === 'generating' ? 'Hall Tickets Generated' : 'Total Students'}
                    </p>
                  </div> */}

                  {/* Progress Bar */}
                  {/* <div className="space-y-2">
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
                  </div> */}
                </div>
              )}
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
                  <h3 className="text-lg font-semibold text-red-900 mb-1">
                    Error Occurred
                  </h3>
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
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-0">
                  {/* Left Section */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-green-900 text-center md:text-left">
                        Generation Complete!
                      </h3>
                      <p className="text-green-700 text-sm md:text-base text-center md:text-left">
                        Successfully generated {progress.totalStudents} hall
                        tickets
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <button
                    onClick={handleDownload}
                    className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold text-sm md:text-base">
                      Download PDF
                    </span>
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
