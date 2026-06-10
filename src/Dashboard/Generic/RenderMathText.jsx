import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderMathText = (text) => {
  if (!text) return null;

  try {
    if (text.includes("\\displaylines")) {
      const latex = text.replace("\\displaylines", "").trim();

      return (
        <div className="overflow-x-auto">
          <BlockMath math={latex} />
        </div>
      );
    }

    if (text.startsWith("$") && text.endsWith("$")) {
      return <InlineMath math={text.slice(1, -1)} />;
    }

    return <span>{text}</span>;
  } catch (err) {
    console.error("KaTeX Error:", err);
    return <span>{text}</span>;
  }
};

export default renderMathText;
