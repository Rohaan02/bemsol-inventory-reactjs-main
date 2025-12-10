// src/components/inventory/InventoryTable.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@radix-ui/themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

const InventoryTable = ({
  items,
  selectedItems,
  onSelectItem,
  onEdit,
  onDelete,
  onUpdateStatus,
  visibleColumns = [], // All columns visible by default
}) => {
  // Define all possible columns
  const allColumns = [
    { key: 'select', label: 'Select', visible: true },
    { key: 'image', label: 'Image', visible: true },
    { key: 'code', label: 'Code', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'mfc', label: 'Mfc', visible: true },
    { key: 'category', label: 'Category', visible: true },
    {key:  'unit', label: 'Unit', visible: true},
    { key: 'location', label: 'Location', visible: true },
   
    { key: 'unit_cost', label: 'Unit Cost', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ];

  // Use provided visibleColumns or default to all columns
  const columnsToShow = visibleColumns.length > 0 
    ? allColumns.filter(col => visibleColumns.includes(col.key))
    : allColumns;

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    onSelectItem(newSelected);
  };

  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedItems.has(item.id) || !item.is_active);

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectItem(new Set());
    } else {
      // only active items can be selected
      const allIds = new Set(items.filter((item) => item.is_active).map((item) => item.id));
      onSelectItem(allIds);
    }
  };

  // Helper function to check if column is visible
  const isColumnVisible = (columnKey) => {
    return columnsToShow.some(col => col.key === columnKey);
  };

  return (
    <div className="flex-1 overflow-hidden bg-white rounded-lg border border-gray-200 shadow">
      <div className="h-full overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
            <tr>
              {/* Select Column */}
              {isColumnVisible('select') && (
                <th className="px-4 py-3 bg-gray-100 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                </th>
              )}
              
              {/* Image Column */}
              {isColumnVisible('image') && (
                <th className="px-4 py-3 bg-gray-100">Image</th>
              )}
              
              {/* Code Column */}
              {isColumnVisible('code') && (
                <th className="px-4 py-3 bg-gray-100">Code</th>
              )}
              
              {/* Name Column */}
              {isColumnVisible('name') && (
                <th className="px-4 py-3 bg-gray-100">Name</th>
              )}
              
              {/* Manufacturer Column */}
              {isColumnVisible('mfc') && (
                <th className="px-4 py-3 bg-gray-100">Mfc</th>
              )}
              
              {/* Category Column */}
              {isColumnVisible('category') && (
                <th className="px-4 py-3 bg-gray-100">Category</th>
              )}
              {/* Unit Column */}
              {isColumnVisible('unit') && (
                <th className="px-4 py-3 bg-gray-100">Unit</th>
              )}
              
              {/* Location Column */}
              {isColumnVisible('location') && (
                <th className="px-4 py-3 bg-gray-100">Location</th>
              )}
              
             
              
              {/* Unit Cost Column */}
              {isColumnVisible('unit_cost') && (
                <th className="px-4 py-3 bg-gray-100 text-center">Unit Cost</th>
              )}
              
              {/* Status Column */}
              {isColumnVisible('status') && (
                <th className="px-4 py-3 bg-gray-100">Status</th>
              )}
              
              {/* Actions Column */}
              {isColumnVisible('actions') && (
                <th className="px-4 py-3 bg-gray-100 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isInactive = !item.is_active;
              return (
                <tr
                  key={item.id}
                  className={`border-t ${
                    isInactive
                      ? "bg-gray-200 cursor-not-allowed"
                      : selectedItems.has(item.id)
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Select Cell */}
                  {isColumnVisible('select') && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() =>
                          !isInactive && handleSelectItem(item.id)
                        }
                        disabled={isInactive}
                      />
                    </td>
                  )}
                  
                  {/* Image Cell */}
                  {isColumnVisible('image') && (
                    <td className="px-4 py-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                  )}
                  
                  {/* Code Cell */}
                  {isColumnVisible('code') && (
                    <td className="px-4 py-3">
                      <Link
                        to={`/item-tracking/track/${item.id}`}
                        className={`${
                          isInactive
                            ? "text-gray-500 hover:underline"
                            : "text-blue-500 hover:underline"
                        }`}
                      >
                        {item.item_code}
                      </Link>
                    </td>
                  )}

                  {/* Name Cell */}
                  {isColumnVisible('name') && (
                    <td className="px-4 py-3">{item.item_name}</td>
                  )}
                  
                  {/* Manufacturer Cell */}
                  {isColumnVisible('mfc') && (
                    <td className="px-4 py-3">
                      {item.manufacturer?.name || item.manufacturer_name || "-"}
                    </td>
                  )}
                  
                  {/* Category Cell */}
                  {isColumnVisible('category') && (
                    <td className="px-4 py-3">
                      {item.category?.category_name || "-"}
                    </td>
                  )}
                  {/* Unit Cell */}
                  {isColumnVisible('unit') && (
                    <td className="px-4 py-3">
                      {item.unit?.name || item.unit_name || "-"}
                    </td>
                  )}
                  
                  {/* Location Cell */}
                  {isColumnVisible('location') && (
                    <td className="px-4 py-3">
                     
                        
                         {item.location_names && item.location_names.length > 0
                            ? item.location_names.join(", ")
                            : "—"}
                    </td>
                  )}
                  
                  {/* Quantity Cell */}
                  {isColumnVisible('qty') && (
                    <td className="px-4 py-3 text-center">
                      {item.quantity ?? 0}
                    </td>
                  )}
                  
                  {/* Unit Cost Cell */}
                  {isColumnVisible('unit_cost') && (
                    <td className="px-4 py-3 text-center">
                      {item.unit_cost ? `PKR ${item.unit_cost}` : "-"}
                    </td>
                  )}
                  
                  {/* Status Cell */}
                  {isColumnVisible('status') && (
                    <td className="px-4 py-3">
                      {item.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </td>
                  )}
                  
                  {/* Actions Cell */}
                  {isColumnVisible('actions') && (
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[140px]">
                            {!isInactive && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onEdit(item)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDelete(item)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(item)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              <span>{item.is_active ? "Deactivate" : "Activate"}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;