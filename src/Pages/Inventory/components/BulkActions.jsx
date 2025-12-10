// src/Pages/Inventory/components/BulkActions.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Printer, Download } from "lucide-react";

function BulkActions({ selectedCount, onAddToDemand, onPrintLabels }) {
  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex gap-2 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white text-black">
              <Plus className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="min-w-[160px] z-50" sideOffset={5}>
            <DropdownMenuItem onClick={onAddToDemand} className="cursor-pointer flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Add to Demand</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPrintLabels} className="cursor-pointer flex items-center gap-2">
              <Printer className="w-4 h-4" />
              <span>Print Labels</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="text-sm font-medium text-blue-800 ml-auto">
        {selectedCount} item(s) selected
      </span>
    </div>
  );
}

export default BulkActions;