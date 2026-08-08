import React from "react";

const TextField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  min,
  max,
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
  return (
    <div
      className={`min-w-52 flex flex-wrap items-center gap-2 border border-gray-300 p-2 ${className}`}
    >
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-gray-600 whitespace-nowrap ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`flex-1 min-w-0 outline-none bg-transparent ${inputClassName}`}
      />
    </div>
  );
};

export default TextField;
