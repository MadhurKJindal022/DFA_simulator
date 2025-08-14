import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null; // Do not render if closed

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children }) {
  return (
    <div className="relative bg-white p-6 rounded shadow-lg max-w-lg w-full">
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4 font-semibold text-lg">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export function DialogFooter({ children }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}

export function DialogClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
    >
      ✕
    </button>
  );
}
