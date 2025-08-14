/*import React, { useState, createContext, useContext } from "react";

const DropdownMenuContext = createContext();

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children }) {
  const { open } = useContext(DropdownMenuContext);
  if (!open) return null;
  return (
    <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
}

// NOTE: You had error about DropdownMenuSeparator missing, so add it:
export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-200 my-1" />;
}*/

// components/ui/dropdown-menu.jsx
import React, { useState, createContext, useContext } from "react";

const DropdownMenuContext = createContext();

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children }) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  if (!open) return null;

  return (
    <div
      className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
      onClick={() => setOpen(false)} // close menu when clicking inside
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${className || ""}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-200 my-1" />;
}

