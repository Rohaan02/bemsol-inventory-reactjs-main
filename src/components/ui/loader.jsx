// src/components/ui/loader.jsx
import React from "react";

export const Loader = ({ size = 40, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-black"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Loader;
