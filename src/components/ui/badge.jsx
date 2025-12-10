import React from "react";
import clsx from "clsx";

/**
 * Badge component
 * @param {string} variant - "default" | "success" | "warning" | "destructive" | "outline"
 * @param {string} className - extra classes
 * @param {React.ReactNode} children - content inside badge
 */
export const Badge = ({ variant = "default", className, children }) => {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};
