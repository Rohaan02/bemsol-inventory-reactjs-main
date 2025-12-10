import * as React from "react";

export const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
      className={`w-full border rounded p-2 bg-white ${props.className || ""}`}
      style={{
        maxHeight: "200px", // around 10 items (depends on item height)
        overflowY: "auto",
      }}
    >
      {children}
    </select>
  );
};

export const SelectTrigger = ({ children, ...props }) => {
  return (
    <div {...props} className={`border rounded p-2 bg-white`}>
      {children}
    </div>
  );
};

export const SelectValue = ({ placeholder, value }) => {
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ children }) => {
  return <>{children}</>;
};

export const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
