import * as React from "react";

const Table = ({ className = "", children }) => (
  <table className={`w-full border-collapse text-sm ${className}`}>
    {children}
  </table>
);

const TableHeader = ({ className = "", children }) => (
  <thead className={`bg-gray-50 ${className}`}>{children}</thead>
);

const TableBody = ({ className = "", children }) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({ className = "", children }) => (
  <tr className={`border-b last:border-0 hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ className = "", children }) => (
  <th
    className={`px-4 py-2 text-left font-medium text-gray-600 ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ className = "", children }) => (
  <td className={`px-4 py-2 text-gray-800 ${className}`}>{children}</td>
);

const ThSortable = ({ field, onClick, sortIcon, children, className = "" }) => (
  <th
    className={`px-4 py-3 cursor-pointer hover:bg-gray-200 transition duration-150 ${className}`}
    onClick={() => onClick(field)}
  >
    <div className="flex items-center justify-start">
      {children}
      {sortIcon}
    </div>
  </th>
);
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ThSortable,
};
