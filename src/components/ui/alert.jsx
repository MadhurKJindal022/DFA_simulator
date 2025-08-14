import React from "react";

export function Alert({ children, className = "" }) {
  return (
    <div className={`border-l-4 border-red-500 bg-red-50 p-4 text-red-700 ${className}`}>
      {children}
    </div>
  );
}

// If you want AlertDescription (your code imports it), add:

export function AlertDescription({ children }) {
  return <p className="mt-1 text-sm text-red-600">{children}</p>;
}
