import React from "react";

export function Badge({ className = "", children, variant = "default", ...props }) {
  const baseStyles = "inline-block px-2 py-0.5 text-xs font-medium rounded-full";

  const variants = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
