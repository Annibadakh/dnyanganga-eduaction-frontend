import React from "react";

const VARIANTS = {
    primary: "bg-primary text-white hover:bg-blue-600",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-500",
    info: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 text-gray-700 bg-gray-200 hover:bg-gray-300",
    outlineDanger: "border border-red-500 text-red-500 hover:bg-red-50",
};

const Button = ({
    children,
    onClick,
    loading = false,
    disabled = false,
    variant = "primary",
    className = "",
    type = "button",
    fullWidth = false,
    startIcon = null,
    endIcon = null,
}) => {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`
        relative inline-flex items-center justify-center gap-2
        rounded font-bold py-2 px-4
        transition-all duration-200
        ${VARIANTS[variant] || VARIANTS.primary}
        ${isDisabled ? "opacity-80 cursor-not-allowed" : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
        >
            {/* Content (keeps width stable) */}
            <span
                className={`flex items-center gap-2 ${loading ? "opacity-0" : "opacity-100"
                    }`}
            >
                {startIcon && (
                    <span className="flex items-center justify-center">
                        {startIcon}
                    </span>
                )}

                <span>{children}</span>

                {endIcon && (
                    <span className="flex items-center justify-center">
                        {endIcon}
                    </span>
                )}
            </span>

            {/* Loader */}
            {loading && (
                <span className="absolute flex items-center justify-center">
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </span>
            )}
        </button>
    );
};

export default Button;