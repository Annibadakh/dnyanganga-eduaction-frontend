import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  const content = text.trim();

  try {
    // Not LaTeX
    if (!(content.startsWith("$") && content.endsWith("$"))) {
      return <span>{content}</span>;
    }

    let latex = content.slice(1, -1).trim();

    // Convert \displaylines{...} to aligned environment
    if (
      latex.startsWith("\\displaylines{") &&
      latex.endsWith("}")
    ) {
      latex = latex
        .replace(/^\\displaylines\{/, "")
        .replace(/\}$/, "");

      latex = `\\begin{aligned}${latex}\\end{aligned}`;
    }

    const isBlockMath =
      latex.includes("\\\\") ||
      latex.includes("\\text{") ||
      latex.includes("\\begin{") ||
      latex.includes("\\displaylines");

    return isBlockMath ? (
      <BlockMath math={latex} />
    ) : (
      <InlineMath math={latex} />
    );
  } catch (error) {
    console.error("KaTeX Render Error:", error);
    return <span>{text}</span>;
  }
};

export default renderMathText;
