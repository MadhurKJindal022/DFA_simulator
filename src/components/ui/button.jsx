import React from "react";

export function Button({ className = "", children, variant = "default", ...props }) {
  const baseStyles =
    "px-4 py-2 rounded-xl font-medium focus:outline-none transition-all";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
