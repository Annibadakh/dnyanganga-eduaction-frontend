import React from "react";
import Select from "react-select";

const CustomMultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  isRequired = false,
  error = false,
  className = "",
  labelClassName = "",
}) => {
  const customStyles = {
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280", // gray-500
      fontSize: "14px",
    }),
    control: (provided, state) => ({
      ...provided,
      borderRadius: "0.5rem", // 8px (rounded-lg)
      padding: "2px",
      minHeight: "42px",
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "#094D9E"
        : "#d1d5db", // border-gray-300
      boxShadow: state.isFocused
        ? "0 0 0 1px #094D9E"
        : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#094D9E",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 8px",
      gap: "4px",
      flexWrap: "nowrap", // keep all selected values on a single line
      overflowX: "auto", // horizontal scroll when values overflow
      overflowY: "hidden", // never grow vertically
      height: "100%",
      alignItems: "center",
      minWidth: 0,
      scrollbarWidth: "none", // Firefox: hide scrollbar
      msOverflowStyle: "none", // IE/Edge: hide scrollbar
      "::-webkit-scrollbar": { display: "none" }, // Chrome/Safari: hide scrollbar
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e6f0fa", // Light brand tint
      borderRadius: "0.375rem",
      margin: "2px 0",
      display: "flex",
      alignItems: "center",
      flexShrink: 0, // don't compress chips; let the container scroll instead
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#094D9E",
      fontSize: "13px",
      fontWeight: "500",
      paddingLeft: "6px",
      paddingRight: "6px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#094D9E",
      borderRadius: "0 0.375rem 0.375rem 0",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#094D9E",
        color: "#ffffff",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#094D9E"
        : state.isFocused
        ? "#f3f4f6" // light gray hover
        : "#ffffff",
      color: state.isSelected
        ? "#ffffff"
        : "#1f2937", // gray-800
      cursor: "pointer",
      fontSize: "14px",
      padding: "10px 12px",
      "&:active": {
        backgroundColor: "#094D9E",
        color: "#ffffff",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // shadow-md
      zIndex: 50,
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}

      <Select
        options={options}
        value={value}
        onChange={onChange}
        required={isRequired}
        isMulti={true}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        placeholder={placeholder}
        styles={customStyles}
        className="text-sm min-w-52"
        closeMenuOnSelect={false} // Great for UX in multi-select dropdowns
        blurInputOnSelect={false}
      />
    </div>
  );
};

export default CustomMultiSelect;
