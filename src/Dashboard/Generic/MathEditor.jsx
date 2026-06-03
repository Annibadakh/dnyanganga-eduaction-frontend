import { useEffect, useRef } from "react";
import "mathlive";

const MathEditor = ({
  value = "",
  onChange,
  placeholder = "Type here...",
  className = "",
}) => {
  const mathFieldRef = useRef(null);

  useEffect(() => {
    const mf = mathFieldRef.current;

    if (!mf) return;

    // Default to text mode
    mf.defaultMode = "text";
    mf.mode = "text";

    mf.value = value || "";

    if (mf.value === "") {
      mf.mode = "text";
    }
    const handleInput = () => {
      onChange?.(mf.value);
    };

    mf.addEventListener("input", handleInput);

    return () => {
      mf.removeEventListener("input", handleInput);
    };
  }, []);

  useEffect(() => {
    if (mathFieldRef.current && mathFieldRef.current.value !== value) {
      mathFieldRef.current.value = value || "";
    }
  }, [value]);

  return (
    <math-field
      ref={mathFieldRef}
      placeholder={placeholder}
      class={`
        w-full min-h-[52px]
        border border-gray-300
        rounded-lg
        px-3 py-2
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-blue-300
        bg-white
        ${className}
      `}
      style={{
        display: "block",
      }}
    />
  );
};

export default MathEditor;
