import { useCallback, useEffect, useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";
import PdfViewerModal from "../Generic/PdfViewerModal";

// Hall ticket + result of the logged-in student (the server takes the student from the token)
const DOCUMENTS = [
  {
    key: "hallTicket",
    title: "Hall Ticket",
    description: "Exam hall ticket with your seat number, exam centre and subjects.",
    url: "/pdf/student/hall-ticket",
  },
  {
    key: "result",
    title: "Result",
    description: "Subject-wise marks and percentage of your exam.",
    url: "/pdf/student/result",
  },
];

// Error replies of a blob request come back as a Blob — read the server's message from it
const readBlobError = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || fallback;
};

const StudentDocuments = () => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(""); // "<key>:preview" | "<key>:download"
  const [actionError, setActionError] = useState({});
  const [preview, setPreview] = useState(null); // { url, fileName, title }

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/pdf/student/documents");
      setStatus(res.data?.data || {});
    } catch (error) {
      setLoadError(error.response?.data?.message || "Could not load your documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Free the blob URL when the preview closes
  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const fetchPdf = async (doc) => {
    const res = await api.get(doc.url, { responseType: "blob" });
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match ? match[1] : `${doc.title.replace(/\s+/g, "_")}.pdf`;
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    return { url, fileName };
  };

  const handleAction = async (doc, mode) => {
    setBusy(`${doc.key}:${mode}`);
    setActionError((prev) => ({ ...prev, [doc.key]: "" }));
    try {
      const { url, fileName } = await fetchPdf(doc);
      if (mode === "preview") {
        setPreview({ url, fileName, title: doc.title });
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (error) {
      const message = await readBlobError(error, `Could not get your ${doc.title.toLowerCase()}. Please try again.`);
      setActionError((prev) => ({ ...prev, [doc.key]: message }));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto mb-16">
      <h1 className="text-2xl font-bold text-primary mb-4">Hall Ticket & Result</h1>

      {loading && <p>Loading...</p>}

      {!loading && loadError && (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-red-600 text-sm mb-3">{loadError}</p>
          <Button variant="primary" onClick={fetchStatus}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENTS.map((doc) => {
            const info = status[doc.key] || {};
            const available = !!info.available;
            return (
              <div
                key={doc.key}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-xl text-gray-800">{doc.title}</h2>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {available ? "Available" : "Not available"}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{doc.description}</p>

                {!available && info.message && (
                  <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                    {info.message}
                  </p>
                )}

                {actionError[doc.key] && (
                  <p className="text-sm text-red-600">{actionError[doc.key]}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                  <Button
                    variant="outline"
                    disabled={!available || !!busy}
                    onClick={() => handleAction(doc, "preview")}
                  >
                    {busy === `${doc.key}:preview` ? "Loading..." : "Preview"}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!available || !!busy}
                    onClick={() => handleAction(doc, "download")}
                  >
                    {busy === `${doc.key}:download` ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PdfViewerModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        pdfUrl={preview?.url}
        fileName={preview?.fileName}
        title={preview?.title}
      />
    </div>
  );
};

export default StudentDocuments;
