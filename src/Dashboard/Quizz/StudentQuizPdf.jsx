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
 * Wrapping note: every container in this file that can hold text is
 * explicitly `boxSizing: "border-box"` + `overflowWrap/wordBreak: break-word`.
 * renderMathText() already wraps its own output correctly (see its
 * `rowStyle`), but that only matters if the *ancestor* boxes here don't
 * silently grow past their intended width when html2canvas captures them —
 * a fixed width combined with content-box sizing (the default) makes the
 * true rendered width = width + padding, which is what caused the earlier
 * clipped/un-wrapped text in the PDF.
 *
 * Props:
 *  data: { summary, student, questions }  // same shape returned by
 *        GET /quiz/student/result/:studentQuizId/pdf
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
              breakInside: "avoid",
            }}
          >
            {/* Question header */}
            <div
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
                      <div>{renderMathText(opt.text)}</div>
                      {opt.imageUrl && (
                        <img
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

            {/* Solution */}
            {question.solutionDescription && (
              <div
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
                <div>{renderMathText(question.solutionDescription)}</div>
                {question.solutionUrl && (
                  <img
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
