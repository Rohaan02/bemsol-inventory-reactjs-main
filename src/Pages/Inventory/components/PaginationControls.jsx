// src/components/inventory/PaginationControls.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 bg-primary-color"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm text-gray-600 min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 bg-primary-color"
        variant="outline"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          onItemsPerPageChange(Number(value));
          onPageChange(1);
        }}
      >
        <SelectTrigger className="w-20 h-8 text-sm">
          <SelectValue placeholder={itemsPerPage} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaginationControls;