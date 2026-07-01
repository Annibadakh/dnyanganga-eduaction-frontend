import React from "react";

const DateField = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
  return (
    <div
      className={`min-w-52 flex items-center gap-2 border border-gray-300 p-2 ${className}`}
    >
      <label
        htmlFor={id}
        className={`text-sm font-medium text-gray-600 whitespace-nowrap ${labelClassName}`}
      >
        {label}
      </label>

      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={`flex-1 outline-none bg-transparent ${inputClassName}`}
      />
    </div>
  );
};

export default DateField;
