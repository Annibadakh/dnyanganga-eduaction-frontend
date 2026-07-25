import { forwardRef } from "react";
import renderMathText from "../Generic/RenderMathText";

/**
 * StudentQuizPdf
 * ----------------
 * Print-friendly, hidden-render layout used only for PDF generation
 * via html2pdf/html2canvas. Kept deliberately plain:
 *  - no shadows, hover states, or animations
 *  - no pagination (all questions render at once)
 *  - no Back / Download buttons
 *  - no ImagePreview modal — plain <img> tags only
 *
 * Page-break safety: we inject a <style> block with
 * `page-break-inside: avoid` (the legacy property html2pdf actually
 * reads via getComputedStyle) via a single `.pdf-avoid-break` class.
 *
 * That class is applied at TWO levels for every question:
 *  1. Group level — question header+image, each option, and the
 *     solution block are each wrapped as a whole, so related content
 *     (e.g. solution text + its diagram) is pushed to the next page
 *     together rather than being separated.
 *  2. Element level — the question text, each option's text, the
 *     solution text, and every <img> individually also carry the
 *     class. This is what actually stops a single long paragraph or
 *     image from being sliced in half at a page boundary: if it
 *     won't fit in the remaining space, html2pdf pushes that whole
 *     element (and, per point 1, everything grouped with it) down
 *     to the next page instead of cutting through it.
 *
 * NOTE: this only works if the html2pdf() call that consumes this
 * markup has `pagebreak: { mode: [...] }` configured to include
 * 'css' (the html2pdf default does). If a custom html2canvas+jsPDF
 * slicing routine is used instead of html2pdf.js's own pagination,
 * these classes are inert and the slicing logic itself needs to
 * account for avoid-elements.
 *
 * Props:
 *  data: { summary, student, questions }
 *  imgBaseUrl: optional base URL to prefix relative image paths
 */
const StudentQuizPdf = forwardRef(({ data, imgBaseUrl = "" }, ref) => {
  if (!data) return null;

  const { summary, questions, student } = data;

  return (
    <div
      id="student-quiz-pdf"
      ref={ref}
      style={{
        width: "800px",
        boxSizing: "border-box",
        padding: "32px",
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      {/* Real CSS — html2pdf reads page-break-inside via getComputedStyle */}
      <style>{`
        .pdf-avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `}</style>

      {/* ── Title ── */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "4px",
        }}
      >
        Quiz Result
      </h1>

      {student?.studentName ? (
        <p style={{ textAlign: "center", fontSize: "13px", margin: "0 0 2px" }}>
          {student.studentName}
          {student.studentId ? ` (${student.studentId})` : ""}
        </p>
      ) : null}

      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#6b7280",
          marginBottom: "16px",
        }}
      >
        Student Quiz ID: {student?.studentQuizId || data.studentQuizId}
      </p>

      {/* ── Summary ── */}
      <table
        className="pdf-avoid-break"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          fontSize: "13px",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            <SummaryCell label="Total Questions" value={summary.total} />
            <SummaryCell label="Correct" value={summary.correct} />
            <SummaryCell label="Wrong" value={summary.wrong} />
            <SummaryCell label="Not Attempted" value={summary.notAttempted} />
            <SummaryCell label="Marks Obtained" value={summary.marksObtained} />
          </tr>
        </tbody>
      </table>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #d1d5db",
          margin: "16px 0",
        }}
      />

      {/* ── Questions ── */}
      {questions.map((q, index) => {
        const question = q.Question;
        const isNotAttempted = !q.selectedAns || q.selectedAns.length === 0;
        const questionNumber = index + 1;

        return (
          <div
            key={q.id}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {/* Question header + image — keep together as a group,
                and each also individually break-safe */}
            <div className="pdf-avoid-break">
              <div
                className="pdf-avoid-break"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: "13px",
                    fontWeight: 600,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  <span style={{ marginRight: "4px" }}>Q{questionNumber}.</span>
                  {renderMathText(question.questionText)}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {isNotAttempted
                    ? "Skipped"
                    : q.marksObtained > 0
                      ? `+${q.marksObtained}`
                      : `${q.marksObtained}`}
                </span>
              </div>

              {question.imageUrl && (
                <img
                  className="pdf-avoid-break"
                  src={`${imgBaseUrl}${question.imageUrl}`}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: "220px",
                    marginBottom: "10px",
                    display: "block",
                  }}
                />
              )}
            </div>

            {/* Options */}
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              {question.options.map((opt) => {
                const isCorrect = question.correctAns.includes(opt.index);
                const isSelected = q.selectedAns?.includes(opt.index);

                let bg = "#ffffff";
                let border = "#e5e7eb";
                let textColor = "#374151";
                if (isCorrect) {
                  bg = "#f0fdf4";
                  border = "#bbf7d0";
                  textColor = "#166534";
                } else if (isSelected) {
                  bg = "#fef2f2";
                  border = "#fecaca";
                  textColor = "#b91c1c";
                }

                return (
                  <div
                    key={opt.id}
                    className="pdf-avoid-break"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "6px 10px",
                      marginBottom: "4px",
                      border: `1px solid ${border}`,
                      background: bg,
                      color: textColor,
                      fontSize: "12px",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>
                      {opt.index}.
                    </span>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      <div className="pdf-avoid-break">
                        {renderMathText(opt.text)}
                      </div>
                      {opt.imageUrl && (
                        <img
                          className="pdf-avoid-break"
                          src={`${imgBaseUrl}${opt.imageUrl}`}
                          alt=""
                          style={{
                            maxWidth: "100%",
                            maxHeight: "140px",
                            marginTop: "6px",
                            display: "block",
                          }}
                        />
                      )}
                    </div>
                    {isCorrect && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Correct
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Your Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Solution — whole section (label + text + image) moves
                to the next page as one unit if it won't fit */}
            {question.solutionDescription && (
              <div
                className="pdf-avoid-break"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: "8px",
                  padding: "8px 10px",
                  background: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: "12px",
                  borderRadius: "4px",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "10px",
                    textTransform: "uppercase",
                    margin: "0 0 4px",
                  }}
                >
                  Solution
                </p>
                <div className="pdf-avoid-break">
                  {renderMathText(question.solutionDescription)}
                </div>
                {question.solutionUrl && (
                  <img
                    className="pdf-avoid-break"
                    src={`${imgBaseUrl}${question.solutionUrl}`}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: "180px",
                      marginTop: "8px",
                      display: "block",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

const SummaryCell = ({ label, value }) => (
  <td
    style={{
      textAlign: "center",
      padding: "8px",
      border: "1px solid #e5e7eb",
      boxSizing: "border-box",
      overflowWrap: "break-word",
      wordBreak: "break-word",
    }}
  >
    <div
      style={{ fontSize: "10px", textTransform: "uppercase", color: "#6b7280" }}
    >
      {label}
    </div>
    <div style={{ fontSize: "16px", fontWeight: 700 }}>{value}</div>
  </td>
);

StudentQuizPdf.displayName = "StudentQuizPdf";

export default StudentQuizPdf;
