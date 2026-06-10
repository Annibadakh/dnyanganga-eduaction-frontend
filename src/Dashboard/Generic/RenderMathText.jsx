import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  const math = text.trim();

  try {
    if (math.startsWith("$") && math.endsWith("$")) {
      const latex = math.slice(1, -1).trim();

      // Display-mode environments
      if (
        latex.includes("\\displaylines") ||
        latex.includes("\\begin{aligned}") ||
        latex.includes("\\begin{array}") ||
        latex.includes("\\\\")
      ) {
        return <BlockMath math={latex} />;
      }

      return <InlineMath math={latex} />;
    }

    return <span>{text}</span>;
  } catch (err) {
    console.error("KaTeX Error:", err);
    return <span>{text}</span>;
  }
};

export default renderMathText;
