import React from "react";
import Select from "react-select";

const CustomSelect = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    isMulti = false,
    isDisabled = false,
    isClearable = true,
    isSearchable = true,
    isRequired = true,
    error = false
}) => {

    const customStyles = {
        placeholder: (provided) => ({
            ...provided,
            color: "#141414",
            fontSize: "16px",
        }),
        control: (provided, state) => ({
            ...provided,
            borderRadius: "1 rem",
            padding: "1 rem",
            borderColor: state.isFocused
                ? "#094D9E"
                : "#c2c0c0",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#094D9E"
                : state.isFocused
                    ? "#094D9E"
                    : "white",

            color: state.isSelected
                ? "white" : state.isFocused ?
                "white" : "#141414",

            cursor: "pointer",
            fontSize: "16px",
        }),

        menu: (provided) => ({
            ...provided,
            borderRadius: "0.5rem",
            overflow: "hidden",
        }),
    };

    return (
        <div className="mb-3">
            {label && (
                <label className="block mb-1">
                    {label}
                </label>
            )}

            <Select
                options={options}
                value={value}
                onChange={onChange}
                required={isRequired}
                isMulti={isMulti}
                isDisabled={isDisabled}
                isClearable={isClearable}
                isSearchable={isSearchable}
                placeholder={placeholder}
                styles={customStyles}
                className="text-sm"
            />
        </div>
    );
};

export default CustomSelect;