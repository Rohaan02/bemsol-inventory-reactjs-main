// src/components/ui/dialog.jsx
import React from "react";

export const Dialog = ({ open, onOpenChange, children, size = "5xl" }) => {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "5xl": "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size] || "max-w-5xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};


export const DialogBody = ({ children }) => (
  <div className="p-6">{children}</div>
);
export const DialogContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="border-b px-6 py-4">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-bold">{children}</h2>
);

export const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-500 mt-1">{children}</p>
);

export const DialogFooter = ({ children }) => (
  <div className="border-t px-6 py-4 flex justify-end space-x-2">{children}</div>
);

export const DialogActionButton = ({ onClick, saving = false, children }) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
  >
    {saving ? "Saving..." : children}
  </button>
);
// Pre-styled Cancel button
export const DialogCancelButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md"
  >
    Cancel
  </button>
);