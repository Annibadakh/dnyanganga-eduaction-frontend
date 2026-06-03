import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  // Remove surrounding $...$ if present
  const math = text.trim();

  try {
    if (math.startsWith("$") && math.endsWith("$")) {
      return <InlineMath math={math.substring(1, math.length - 1)} />;
    }

    return <span>{text}</span>;
  } catch (err) {
    console.error("KaTeX Error:", err);
    return <span>{text}</span>;
  }
};

export default renderMathText;
