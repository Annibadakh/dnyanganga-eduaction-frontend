import { useRef, useState } from "react";
import api from "../../Api";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import StudentQuizPdf from "../Quizz/StudentQuizPdf";

const PDF_CAPTURE_WIDTH = 800;

const waitForRender = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 150);
      });
    });
  });

const QuizPdfDownload = ({ studentQuizId, className = "" }) => {
  const [pdfData, setPdfData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef(null);

  const downloadPdf = async () => {
    if (isDownloading || !studentQuizId) return;
    setIsDownloading(true);

    try {
      const res = await api.get(`/quiz/student/result/${studentQuizId}/pdf`);
      setPdfData(res.data);

      await waitForRender();

      const node = pdfRef.current;
      if (!node) throw new Error("PDF layout did not mount");

      const fileNameBase =
        res.data?.student?.studentName?.replace(/\s+/g, "_") || studentQuizId;

      await html2pdf()
        .set({
          margin: 10,
          filename: `quiz-result-${fileNameBase}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            windowWidth: PDF_CAPTURE_WIDTH,
            width: PDF_CAPTURE_WIDTH,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(node)
        .save();
    } catch (err) {
      console.error("PDF download error:", err);
      alert(err.response?.data?.message || "Error generating PDF");
    } finally {
      setPdfData(null);
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 ${className}`}
        onClick={downloadPdf}
        disabled={isDownloading}
      >
        <Download size={16} />
        {isDownloading ? "Preparing PDF..." : "Download PDF"}
      </button>

      {pdfData && (
        <div
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
          }}
        >
          <StudentQuizPdf ref={pdfRef} data={pdfData} />
        </div>
      )}
    </>
  );
};

export default QuizPdfDownload;
