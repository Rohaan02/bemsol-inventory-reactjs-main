// src/components/ui/tabs.jsx
import React, { createContext, useContext, useState, useMemo } from "react";
import clsx from "clsx"; // optional, but if you don't have it you can remove clsx usage below

const TabsContext = createContext();

export function Tabs({ children, defaultValue = null, className }) {
  // find first TabsTrigger value if default not provided
  const initial = defaultValue;
  const [value, setValue] = useState(initial);
  const ctx = useMemo(() => ({ value, setValue }), [value]);
  return (
    <TabsContext.Provider value={ctx}>
      <div className={clsx("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return <div className={clsx("flex gap-2", className)}>{children}</div>;
}

/**
 * TabsTrigger props:
 *  - value (string required)
 *  - children
 *  - className
 */
export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={clsx(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        active
          ? "border-b-2 border-indigo-600 text-indigo-700"
          : "text-gray-600 hover:text-gray-800",
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * TabsContent props:
 *  - value (string required) — content shown when value matches
 *  - children
 *  - className
 */
export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  return ctx.value === value ? <div className={className}>{children}</div> : null;
}

// default export for convenience (optional)
export default {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};
