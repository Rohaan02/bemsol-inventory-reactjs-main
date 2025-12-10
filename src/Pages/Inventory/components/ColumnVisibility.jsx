// src/components/inventory/ColumnVisibility.jsx
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Check } from "lucide-react";

const ColumnVisibility = ({ columns, visibleColumns, onColumnToggle }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9
         bg-primary-color hover:bg-primary-color-hover text-white">
          <Settings className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            onClick={() => onColumnToggle(column.key, !visibleColumns.includes(column.key))}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="capitalize">{column.label}</span>
            {visibleColumns.includes(column.key) && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnVisibility;