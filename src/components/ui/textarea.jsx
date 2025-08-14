/*import React from "react";

export const Textarea = ({ value, onChange, placeholder, className }) => {
  const handleChange = (e) => {
    // Only call onChange if it exists and e.target.value is defined
    if (onChange && e?.target?.value !== undefined) {
      onChange(e.target.value);
    }
  };

  return (
    <textarea
      value={value || ""} // ensure value is never undefined
      onChange={handleChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded p-2 w-full ${className || ""}`}
    />
  );
};
*/

import React from "react";

export const Textarea = React.forwardRef(({ value, onChange, placeholder, className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      value={value || ""}
      onChange={onChange} // ✅ Pass event directly, so e.target.value works
      placeholder={placeholder}
      className={`border border-gray-300 rounded p-2 w-full ${className || ""}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

