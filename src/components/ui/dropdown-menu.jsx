import * as React from "react";

export function DropdownMenu({ children }) {
  return <div className="relative inline-block text-left">{children}</div>;
}

export function DropdownMenuTrigger({ asChild, children }) {
  return React.cloneElement(children, {
    onClick: (e) => {
      e.stopPropagation();
      const menu = e.currentTarget.nextSibling;
      if (menu) {
        menu.classList.toggle("hidden");
      }
    },
  });
}

export function DropdownMenuContent({ align = "end", children }) {
  return (
    <div
      className={`absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden z-50 ${
        align === "end" ? "right-0" : "left-0"
      }`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left ${className}`}
    >
      {children}
    </button>
  );
}
export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-100 my-1" />;
}
export function DropdownMenuLabel({ children, className = "" }) {
  return (
    <div
      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 ${className}`}
    >
      {children}
    </div>
  );
}
export function DropdownMenuGroup({ children, className = "" }) {
  return (
    <div className={`px-4 py-2 text-sm text-gray-700 ${className}`}>{children}</div>
  );
}
