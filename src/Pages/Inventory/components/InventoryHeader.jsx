// src/components/inventory/InventoryHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Plus,
  ChevronDown,
  Package,
  Cpu,
  Car,
  Eye,
  Archive,
} from "lucide-react";

const InventoryHeader = ({
  onExportExcel,
  navigate,
  onBulkArchive,
  hasSelectedItems,
}) => {
  return (
    <div className="flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <div className="flex gap-2">
          <Button
            onClick={onBulkArchive}
            disabled={!hasSelectedItems}
            className={`bg-white hover:bg-gray-100 text-black border border-gray-300 ${
              !hasSelectedItems ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            onClick={onExportExcel}
            className="bg-primary-color hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <DropdownMenu>
            <Button
              onClick={() => navigate("/inventory/add")}
              className="bg-primary-color hover:bg-primary-color/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
