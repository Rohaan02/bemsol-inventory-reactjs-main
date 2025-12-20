import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Settings, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Printer,
  Download,
} from "lucide-react";

// Internal FilterSidebar Component
const FilterSidebar = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  filterOptions = [],
  onClearFilters,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filterOptions.map((filterOption) => (
              <div key={filterOption.key} className="space-y-2">
                <Label
                  htmlFor={`${filterOption.key}-filter`}
                  className="text-sm font-medium"
                >
                  {filterOption.label}
                </Label>
                <Select
                  value={filters[filterOption.key] || ""}
                  onValueChange={(value) =>
                    onFilterChange(filterOption.key, value)
                  }
                >
                  <SelectTrigger id={`${filterOption.key}-filter`}>
                    <SelectValue placeholder={`All ${filterOption.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {filterOption.label}</SelectItem>
                    {filterOption.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full flex items-center gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Internal ColumnVisibility Component
const ColumnVisibility = ({ columns, visibleColumns, onColumnToggle }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-primary-color hover:bg-primary-color/90 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            onClick={() =>
              onColumnToggle(column.key, !visibleColumns.includes(column.key))
            }
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

// Internal PaginationControls Component
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

// Internal BulkActions Component
const BulkActions = ({ selectedCount, bulkActions = [] }) => {
  if (selectedCount === 0 || bulkActions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex gap-2 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white text-black"
            >
              <Plus className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="min-w-[160px] z-50"
            sideOffset={5}
          >
            {bulkActions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onClick}
                className="cursor-pointer flex items-center gap-2"
              >
                {action.icon}
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="text-sm font-medium text-blue-800 ml-auto">
        {selectedCount} item(s) selected
      </span>
    </div>
  );
};

const DataTable = ({
  // Data props
  data = [],
  columns = [],

  // Search props
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [], // Array of keys to search in

  // Filter props
  filterable = true,
  filterOptions = [], // Array of { key, label, options: [{value, label}] }

  // Column visibility props
  columnVisibility = true,

  // Pagination props
  paginated = true,
  itemsPerPageOptions = [10, 20, 50],
  defaultItemsPerPage = 10,

  // Bulk actions props
  bulkActions = [], // Array of { key, label, icon, onClick }
  selectable = true,

  // Row actions props
  rowActions = [], // Array of { key, label, icon, onClick, showCondition }

  // Custom renderers
  customRenderers = {}, // Object with column keys as keys and render functions as values

  // Row styling
  getRowClassName, // Function that takes an item and returns additional CSS classes
  getRowCursor, // Function that takes an item and returns cursor style

  // Loading state
  loading = false,

  // Empty state
  emptyMessage = "No data found",

  // Callbacks
  onRowClick,
  onSelectionChange,
}) => {
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchable && searchTerm && searchKeys.length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }

    // Apply filters
    if (filterable && filterOptions.length > 0) {
      filterOptions.forEach((filterOption) => {
        const filterValue = filters[filterOption.key];
        if (filterValue) {
          result = result.filter((item) => {
            const itemValue = item[filterOption.key];
            return itemValue && itemValue.toString() === filterValue;
          });
        }
      });
    }

    return result;
  }, [data, searchTerm, filters, searchKeys, filterOptions]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage, paginated]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handlers
  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleColumnToggle = (columnKey, checked) => {
    setVisibleColumns((prev) =>
      checked ? [...prev, columnKey] : prev.filter((col) => col !== columnKey)
    );
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set());
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(paginatedData.map((item) => item.id));
      setSelectedItems(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasActiveFilters = () => {
    return searchTerm || Object.values(filters).some((value) => value);
  };

  // Render cell content
  const renderCell = (item, column) => {
    if (customRenderers[column.key]) {
      return customRenderers[column.key](item);
    }

    const value = item[column.key];

    switch (column.type) {
      case "image":
        return value ? (
          <img
            src={value}
            alt={item.name || item.title || "Image"}
            className="w-10 h-10 object-cover rounded-md"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        );

      case "badge":
        return value ? (
          <Badge variant={value.variant || "default"}>
            {value.label || value}
          </Badge>
        ) : null;

      case "currency":
        return value ? `PKR ${value}` : "-";

      case "link":
        return (
          <Link
            to={column.linkTemplate ? column.linkTemplate(item) : "#"}
            className="text-blue-500 hover:underline"
          >
            {value}
          </Link>
        );

      case "boolean":
        return value ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Ban className="w-4 h-4 text-red-500" />
        );

      default:
        return value || "-";
    }
  };

  const isAllSelected =
    selectable &&
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedItems.has(item.id));

  return (
    <div className="h-full flex flex-col">
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          Showing {paginatedData.length} of {filteredData.length} items
          {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
        </span>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          {searchable && (
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          )}

          {/* Column Visibility */}
          {columnVisibility && (
            <ColumnVisibility
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
          )}

          {/* Pagination Controls */}
          {paginated && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}

          {/* Filter Button */}
          {filterable && (
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white h-9"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge className="w-5 h-5 flex items-center justify-center bg-red-500 text-white p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectable && (
        <BulkActions
          selectedCount={selectedItems.size}
          bulkActions={bulkActions}
        />
      )}

      {/* Filter Sidebar */}
      {filterable && (
        <FilterSidebar
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Table */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow">
        <div className="overflow-y-hidden h-full">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">{emptyMessage}</div>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
                <tr>
                  {/* Select Column */}
                  {selectable && visibleColumns.includes("select") && (
                    <th className="px-4 py-3 bg-gray-100 w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </th>
                  )}

                  {/* Data Columns */}
                  {columns.map(
                    (column) =>
                      visibleColumns.includes(column.key) &&
                      column.key !== "select" && (
                        <th
                          key={column.key}
                          className={`px-4 py-3 bg-gray-100 ${
                            column.align === "center" ? "text-center" : ""
                          }`}
                        >
                          {column.label}
                        </th>
                      )
                  )}

                  {/* Actions Column */}
                  {rowActions.length > 0 && (
                    <th className="px-4 py-3 bg-gray-100 text-center">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t ${
                      selectedItems.has(item.id)
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    } ${getRowClassName ? getRowClassName(item) : ""} ${
                      getRowCursor
                        ? getRowCursor(item)
                        : onRowClick
                        ? "cursor-pointer"
                        : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {/* Select Cell */}
                    {selectable && visibleColumns.includes("select") && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map(
                      (column) =>
                        visibleColumns.includes(column.key) &&
                        column.key !== "select" && (
                          <td
                            key={column.key}
                            className={`px-4 py-3 ${
                              column.align === "center" ? "text-center" : ""
                            }`}
                          >
                            {renderCell(item, column)}
                          </td>
                        )
                    )}

                    {/* Actions Cell */}
                    {rowActions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-2">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-[140px]"
                            >
                              {rowActions.map((action) => {
                                if (
                                  action.showCondition &&
                                  !action.showCondition(item)
                                ) {
                                  return null;
                                }
                                return (
                                  <DropdownMenuItem
                                    key={action.key}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(item);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    {action.icon}
                                    <span>{action.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
