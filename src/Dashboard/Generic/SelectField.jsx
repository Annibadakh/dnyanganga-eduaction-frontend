import React from "react";

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
  labelClassName = "",
  selectClassName = "",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label
        htmlFor={id}
        className={`text-sm text-gray-600 whitespace-nowrap ${labelClassName}`}
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectClassName}`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
