import React from "react";

export const Select = ({ options = [], value, onChange, className }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`border border-gray-300 rounded px-2 py-1 ${className || ""}`}
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
