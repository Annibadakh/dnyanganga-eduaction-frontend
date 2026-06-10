import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  const math = text.trim();

  try {
    if (math.startsWith("$") && math.endsWith("$")) {
      const latex = math.slice(1, -1).trim();

      // Use BlockMath when multiline text exists
      if (
        latex.includes("\\\\") ||
        latex.includes("\\text{")
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
