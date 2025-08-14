import React, { useState, createContext, useContext, useRef, useEffect } from "react";

const PopoverContext = createContext();

export function Popover({ children }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <PopoverContext.Provider value={{ open, setOpen, popoverRef }}>
      <div ref={popoverRef} className="relative inline-block text-left">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children }) {
  const { setOpen } = useContext(PopoverContext);
  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className="cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
    >
      {children}
    </div>
  );
}

export function PopoverContent({ children, side = "bottom", align = "start", className = "" }) {
  const { open } = useContext(PopoverContext);
  if (!open) return null;

  // Positioning styles
  let positionClasses = "mt-2";
  if (side === "top") positionClasses = "mb-2 bottom-full";
  if (side === "right") positionClasses = "ml-2 left-full";
  if (side === "left") positionClasses = "mr-2 right-full";

  let alignClasses = "";
  if (align === "center") alignClasses = "left-1/2 -translate-x-1/2";
  if (align === "end") alignClasses = "right-0";

  return (
    <div
      className={`absolute z-50 w-64 rounded-md shadow-lg bg-white border border-gray-200 ${positionClasses} ${alignClasses} ${className}`}
    >
      {children}
    </div>
  );
}
