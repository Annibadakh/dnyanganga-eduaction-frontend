import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// Undo common LaTeX text-mode escapes so plain prose displays correctly
const unescapeLatexText = (str) =>
  str
    .replace(/\\\\/g, "\n") // \\ -> line break
    .replace(/\\([%$&#_{}])/g, "$1") // \%, \$, \&, \#, \_, \{, \}
    .replace(/\\textbackslash\{?\}?/g, "\\")
    .replace(/~/g, " ") // non-breaking space -> normal space
    .replace(/[ \t]+/g, " ") // collapse repeated spaces
    .trim();

// If the ENTIRE string passed in is one \text{...} wrapper (balanced braces,
// nothing before/after it), return the inner text. Otherwise null.
const extractWholeText = (latex) => {
  const prefix = "\\text{";
  if (!latex.startsWith(prefix)) return null;

  let depth = 1;
  let i = prefix.length;
  for (; i < latex.length; i++) {
    if (latex[i] === "{") depth++;
    else if (latex[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }

  if (depth !== 0) return null; // unbalanced — bail, let KaTeX handle it
  const inner = latex.slice(prefix.length, i);
  const rest = latex.slice(i + 1).trim();

  return rest === "" ? inner : null; // must be the ONLY thing in the string
};

// Strip an outer \displaylines{...} or \begin{array}{...}...\end{array} wrapper,
// returning the interior. If no wrapper matches, returns the string unchanged.
const stripWrapper = (str) => {
  if (str.startsWith("\\displaylines{") && str.endsWith("}")) {
    return str.slice("\\displaylines{".length, -1).trim();
  }
  const arrMatch = str.match(
    /^\\begin\{array\}\{[^}]*\}([\s\S]*)\\end\{array\}$/,
  );
  if (arrMatch) return arrMatch[1].trim();
  return str;
};

// Split on the LaTeX row separator (\\, or several backslashes), dropping empties
const splitRows = (str) =>
  str
    .split(/\\{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

// If EVERY row in a (possibly wrapped) multi-line block is a pure \text{...}
// with no real math, return the extracted+unescaped lines. Otherwise null.
const extractPureTextLines = (latex) => {
  const body = stripWrapper(latex);
  const rows = splitRows(body);
  if (rows.length === 0) return null;

  const lines = [];
  for (const row of rows) {
    const t = extractWholeText(row);
    if (t === null) return null; // some row has real math or mixed content — bail
    lines.push(unescapeLatexText(t));
  }
  return lines;
};

const PlainWrapped = ({ children }) => (
  <div
    className="whitespace-pre-wrap break-words"
    style={{ textAlign: "left", width: "100%" }}
  >
    {children}
  </div>
);

const renderMathText = (text) => {
  if (!text) return null;

  const content = text.trim();

  try {
    // Not wrapped in $...$ at all — plain text
    if (!(content.startsWith("$") && content.endsWith("$"))) {
      return <PlainWrapped>{content}</PlainWrapped>;
    }

    const latex = content.slice(1, -1).trim();

    // Case A: whole content is one plain "$ \text{...} $" — e.g. the DNA example
    const wholeText = extractWholeText(latex);
    if (wholeText !== null) {
      return <PlainWrapped>{unescapeLatexText(wholeText)}</PlainWrapped>;
    }

    // Case B: whole content is a displaylines/array of ONLY \text{...} rows —
    // pure prose split into lines (statement + lettered options), no real math.
    // This is your phospholipids example.
    const textLines = extractPureTextLines(latex);
    if (textLines !== null) {
      return (
        <div
          className="space-y-1.5"
          style={{ textAlign: "left", width: "100%" }}
        >
          {textLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-words">
              {line}
            </div>
          ))}
        </div>
      );
    }

    // Case C: genuine math — proceed with KaTeX as before.
    let mathLatex = latex;
    if (mathLatex.startsWith("\\displaylines{") && mathLatex.endsWith("}")) {
      mathLatex = mathLatex.replace(/^\\displaylines\{/, "").replace(/\}$/, "");
      mathLatex = `\\begin{array}{l}${mathLatex}\\end{array}`;
    }

    const isBlockMath =
      mathLatex.includes("\\\\") || mathLatex.includes("\\begin{");

    const katexStyles = `
      .custom-katex-left .katex-display {
        text-align: left !important;
        margin: 0 !important;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
      }
      .custom-katex-left .katex-display > .katex {
        text-align: left !important;
        white-space: normal !important;
      }
      .custom-katex-left .katex {
        white-space: normal !important;
        word-break: break-word;
      }
      .custom-katex-left .katex-html {
        white-space: normal !important;
      }
    `;

    return (
      <div
        className="custom-katex-left"
        style={{
          textAlign: "left",
          width: "100%",
          maxWidth: "100%",
          overflowWrap: "break-word",
        }}
      >
        <style>{katexStyles}</style>
        {isBlockMath ? (
          <BlockMath math={mathLatex} />
        ) : (
          <InlineMath math={mathLatex} />
        )}
      </div>
    );
  } catch (error) {
    console.error("KaTeX Render Error:", error);
    return <PlainWrapped>{text}</PlainWrapped>;
  }
};

export default renderMathText;
