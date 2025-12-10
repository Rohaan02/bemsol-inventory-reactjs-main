// src/components/inventory/InventoryHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, ChevronDown, Package, Cpu, Car, Eye, Archive } from "lucide-react";

const InventoryHeader = ({ onExportExcel, navigate, onBulkArchive, hasSelectedItems }) => {
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
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary-color hover:bg-primary-color/90 text-white">
                <Plus className="h-4 w-4 mr-2" /> 
                Create New
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => navigate("/inventory/add")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Package className="h-4 w-4" />
                <span>Inventory</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate("/assets")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="h-4 w-4" />
                <span>Asset</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate("/vehicles")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Car className="h-4 w-4" />
                <span>Vehicle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;