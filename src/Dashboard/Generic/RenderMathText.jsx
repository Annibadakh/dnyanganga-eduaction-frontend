import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  const content = text.trim();

  try {
    // Normal text
    if (!(content.startsWith("$") && content.endsWith("$"))) {
      return (
        <div
          style={{
            textAlign: "left",
            width: "100%",
          }}
        >
          {content}
        </div>
      );
    }

    let latex = content.slice(1, -1).trim();

    // Convert \displaylines{...} to a left-aligned array
    if (latex.startsWith("\\displaylines{") && latex.endsWith("}")) {
      latex = latex.replace(/^\\displaylines\{/, "").replace(/\}$/, "");
      latex = `\\begin{array}{l}${latex}\\end{array}`;
    }

    const isBlockMath =
      latex.includes("\\\\") ||
      latex.includes("\\text{") ||
      latex.includes("\\begin{");

    const katexStyles = `
      .custom-katex-left .katex-display {
        text-align: left !important;
        margin: 0 !important;
      }

      .custom-katex-left .katex-display > .katex {
        text-align: left !important;
      }
    `;

    return (
      <div
        className="custom-katex-left"
        style={{
          textAlign: "left",
          width: "100%",
        }}
      >
        <style>{katexStyles}</style>

        {isBlockMath ? <BlockMath math={latex} /> : <InlineMath math={latex} />}
      </div>
    );
  } catch (error) {
    console.error("KaTeX Render Error:", error);

    return (
      <div
        style={{
          textAlign: "left",
          width: "100%",
        }}
      >
        {text}
      </div>
    );
  }
};

export default renderMathText;
