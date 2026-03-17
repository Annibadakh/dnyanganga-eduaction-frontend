import { useState } from "react";

const PdfViewerModal = ({
  isOpen,
  onClose,
  pdfUrl,
  fileName = "document.pdf",
  title = "PDF Preview",
  subTitle,
}) => {
  const [viewMode, setViewMode] = useState("options");

  if (!isOpen || !pdfUrl) return null;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open(pdfUrl, "_blank");
    if (!newWindow) {
      window.location.href = pdfUrl;
    }
  };

  // 👉 MOBILE OPTIONS SCREEN
  if (isMobile && viewMode === "options") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {title}
            </h2>
            {subTitle && (
              <p className="text-gray-600 text-sm">{subTitle}</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              Download PDF
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
            >
              Open in Browser
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 👉 MAIN VIEW (DESKTOP / MOBILE PREVIEW)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 md:p-4 border-b bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold truncate">
              {title}
            </h2>
            {subTitle && (
              <p className="text-sm text-gray-600 truncate">
                {subTitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setViewMode("options")}
                className="text-sm bg-gray-200 px-3 py-1 rounded"
              >
                Options
              </button>
            )}
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          {isMobile ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded border-2 border-dashed">
              <p className="text-gray-600 text-center mb-4">
                PDF preview may not work well on mobile.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Download
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Open
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border rounded"
              title="PDF Preview"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 md:p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600 truncate">
            File: {fileName}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenInNewTab}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Open
            </button>
            <button
              onClick={handleDownload}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PdfViewerModal;