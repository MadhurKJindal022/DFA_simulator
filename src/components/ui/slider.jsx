import React from "react";

export const Slider = ({ min = 0, max = 100, value, onChange }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange && onChange(Number(e.target.value))}
      className="w-full"
    />
  );
};
