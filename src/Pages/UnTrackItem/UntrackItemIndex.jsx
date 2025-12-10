// src/pages/UntrackItem/UntrackItemIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import BaseUrl from "@/lib/BaseUrl";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Download,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Car,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import untrackItemAPI from "@/lib/untrackItemAPI";
import baseUrl from "../../lib/BaseUrl";

const UntrackItemIndex = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Bulk Import Modal
  const [openImport, setOpenImport] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Multi-select
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Filters (tags & status sets)
  const [filters, setFilters] = useState({
    tags: new Set(),
    status: new Set(),
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });

  // Filter Sidebar visibility
  const [filtersOpen, setFiltersOpen] = useState(false);

  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await untrackItemAPI.getAll();
      setItems(res || []);
      console.log("un items", res);
      setFiltered(res || []);
    } catch {
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Get unique tags and statuses for filters
  const availableTags = useMemo(() => {
    const tags = items.map((item) => item.tag).filter(Boolean);
    return [...new Set(tags)];
  }, [items]);

  const availableStatuses = useMemo(() => {
    const statuses = items.map((item) => item.service_status).filter(Boolean);
    return [...new Set(statuses)];
  }, [items]);

  // Apply filters and search
  useEffect(() => {
    let result = items;

    // Apply search
    if (search.trim() !== "") {
      result = result.filter(
        (i) =>
          (i.item_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (i.vehicle?.inventory_items?.item_name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // Apply tag filters
    if (filters.tags.size > 0) {
      result = result.filter((item) => item.tag && filters.tags.has(item.tag));
    }

    // Apply status filters
    if (filters.status.size > 0) {
      result = result.filter(
        (item) => item.service_status && filters.status.has(item.service_status)
      );
    }

    setFiltered(result);
    setPage(1);
  }, [search, items, filters]);

  // Apply sorting
  const sortedItems = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === "none") {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle inventory_items.item_name sorting
      if (sortConfig.key === "inventory_items_item_name") {
        aValue = a.vehicle?.inventory_items?.item_name || "";
        bValue = b.vehicle?.inventory_items?.item_name || "";
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle boolean values (archived column)
      if (typeof aValue === "boolean") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filtered, sortConfig]);

  const paginated = sortedItems.slice((page - 1) * pageSize, page * pageSize);

  // Multi-select handlers
  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedItems.size === paginated.length) {
      setSelectedItems(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(paginated.map((item) => item.id));
      setSelectedItems(allIds);
      setIsAllSelected(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedItems.size} item(s)?`
      )
    )
      return;

    try {
      const deletePromises = Array.from(selectedItems).map((id) =>
        untrackItemAPI.remove(id)
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedItems.size} item(s) deleted successfully`);
      setSelectedItems(new Set());
      setIsAllSelected(false);
      fetchItems();
    } catch {
      toast.error("Failed to delete some items");
    }
  };

  // Filter handlers
  const handleTagFilter = (tag) => {
    const newTags = new Set(filters.tags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setFilters((prev) => ({ ...prev, tags: newTags }));
  };

  const handleStatusFilter = (status) => {
    const newStatus = new Set(filters.status);
    if (newStatus.has(status)) {
      newStatus.delete(status);
    } else {
      newStatus.add(status);
    }
    setFilters((prev) => ({ ...prev, status: newStatus }));
  };

  const clearAllFilters = () => {
    setFilters({
      tags: new Set(),
      status: new Set(),
    });
    setSearch("");
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      if (current.direction === "desc") {
        return { key, direction: "none" };
      }
      return { key, direction: "asc" };
    });
  };

  // Get sort icon for a column
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="w-3 h-3" />;
    }
    if (sortConfig.direction === "desc") {
      return <ChevronDown className="w-3 h-3" />;
    }
    return <ChevronUp className="w-3 h-3 opacity-30" />;
  };

  // Check if a column is actively sorted
  const isSortedActive = (key) =>
    sortConfig.key === key && sortConfig.direction !== "none";

  // Sortable Table Head Component
  const SortableTableHead = ({ field, children, className = "" }) => (
    <TableHead
      className={`bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <div className="flex flex-col">{getSortIcon(field)}</div>
      </div>
    </TableHead>
  );

  // Export to Excel
  const handleExport = () => {
    const dataToExport =
      selectedItems.size > 0
        ? items.filter((item) => selectedItems.has(item.id))
        : items;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Convert to CSV
    const headers = [
      "ID",
      "Item No",
      "Item Name",
      "Specification",
      "Description",
      "Tag",
      "Remarks",
      "Status",
      "Inventory Item",
      "Archived",
    ];
    const csvData = dataToExport.map((item) => [
      item.id,
      item.item_number,
      item.item_name,
      item.specification,
      item.description,
      item.tag,
      item.remarks,
      item.service_status,
      item.vehicle?.inventory_items?.item_name || "N/A",
      item.archived ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `untracked-items-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} item(s)`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await untrackItemAPI.remove(id);
      if (res?.success) {
        toast.success(res.message || "Item deleted");
        fetchItems();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImporting(true);
      const res = await untrackItemAPI.bulkImport(formData);
      console.log("Bulk import response:", res);
      toast.success("Bulk import completed successfully");
      setOpenImport(false);
      setFile(null);
      fetchItems();
    } catch (error) {
      console.error("Bulk import failed:", error.response || error);
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // Get inventory item display name
  const getInventoryItemDisplay = (item) => {
    if (!item.vehicle?.inventory_items?.item_name) return "N/A";
    return item.vehicle.inventory_items.item_name;
  };

  // Pagination handlers
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Action dropdown handler for individual items
  const ActionDropdown = ({ item }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/untrack-items/edit/${item.id}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/untrack-items/show/${item.id}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(item.id)}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="h-full">
          {/* Page Header - Always full width */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Untracked Items
            </h1>
            <div className="flex gap-2">
              {/* Filter button toggles right sidebar */}
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>

              <Button
                className="bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setOpenImport(true)}
              >
                <Upload className="w-4 h-4 mr-2" /> Import
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary-color hover:bg-primary-color/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExport}>
                    Export All Items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleExport}
                    disabled={selectedItems.size === 0}
                  >
                    Export Selected ({selectedItems.size})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => navigate("/untrack-items/add")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(filters.tags.size > 0 || filters.status.size > 0) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from(filters.tags).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Tag: {tag}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleTagFilter(tag)}
                  />
                </span>
              ))}
              {Array.from(filters.status).map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Status: {status}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleStatusFilter(status)}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Table Container - This area adjusts when filters are open */}
          <div
            className={`transition-all duration-300 ${
              filtersOpen ? "mr-80" : "mr-0"
            }`}
          >
            <Card className="bg-white">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-gray-800">Item List</CardTitle>

                {/* Search and Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search items here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-4 text-sm">
                    {/* Page Size Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 whitespace-nowrap">
                        Show:
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-gray-300"
                          >
                            {pageSize === "all" ? "All" : pageSize}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-20">
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(10)}
                          >
                            10
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(20)}
                          >
                            20
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(30)}
                          >
                            30
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(40)}
                          >
                            40
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange("all")}
                          >
                            All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 whitespace-nowrap">
                        Page:
                      </span>
                      <div className="flex items-center gap-1">
                        {/* First Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === 1}
                          onClick={() => setPage(1)}
                        >
                          «
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          ‹
                        </Button>

                        {/* Current Page Display */}
                        <div className="px-3 py-1 bg-primary-color text-white rounded-md font-medium min-w-10 text-center">
                          {page}
                        </div>

                        {/* Next Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage(page + 1)}
                        >
                          ›
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage(totalPages)}
                        >
                          »
                        </Button>
                      </div>

                      {/* Total Pages */}
                      <span className="text-gray-600 whitespace-nowrap">
                        of {totalPages || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center">
                    <p>Loading...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Table with vertical scroll */}
                    <div className="overflow-x-auto">
                      <div className="max-h-[500px] overflow-y-auto">
                        <Table className="min-w-full text-sm">
                          <TableHeader className="sticky top-0 bg-gray-100 z-10">
                            <TableRow>
                              <TableHead className="w-12 sticky left-0 bg-gray-100 z-20">
                                <Checkbox
                                  checked={
                                    isAllSelected ||
                                    (selectedItems.size > 0 &&
                                      selectedItems.size === paginated.length)
                                  }
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>

                              <SortableTableHead field="id">
                                ID
                              </SortableTableHead>

                              <TableHead className="bg-gray-100">
                                Picture
                              </TableHead>

                              <SortableTableHead field="item_number">
                                Item No
                              </SortableTableHead>

                              <SortableTableHead field="item_name">
                                Item Name
                              </SortableTableHead>

                              <SortableTableHead field="specification">
                                Specification
                              </SortableTableHead>

                              <SortableTableHead field="description">
                                Description
                              </SortableTableHead>

                              {/* INVENTORY ITEM COLUMN */}
                              <SortableTableHead field="inventory_items_item_name">
                                Inventory Item
                              </SortableTableHead>

                              <SortableTableHead field="tag">
                                Tag
                              </SortableTableHead>

                              <SortableTableHead field="remarks">
                                Remarks
                              </SortableTableHead>

                              <SortableTableHead field="service_status">
                                Status
                              </SortableTableHead>

                              <SortableTableHead field="archived">
                                Archived
                              </SortableTableHead>

                              {/* ACTIONS COLUMN */}
                              <TableHead className="text-center bg-gray-100">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {paginated.map((item) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="sticky left-0 bg-white z-10">
                                  <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() =>
                                      handleSelectItem(item.id)
                                    }
                                  />
                                </TableCell>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>
                                  {item.picture ? (
                                    <img
                                      src={item.picture_url}
                                      alt="pic"
                                      className="h-10 w-10 object-cover rounded"
                                    />
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                                <TableCell>{item.item_number}</TableCell>
                                <TableCell>{item.item_name}</TableCell>
                                <TableCell>{item.specification}</TableCell>
                                <TableCell>{item.description}</TableCell>

                                {/* INVENTORY ITEM CELL */}
                                <TableCell>
                                  {item.vehicle?.inventory_items?.item_name ? (
                                    <div className="flex items-center gap-2">
                                      <Car className="h-4 w-4 text-green-600" />
                                      <div className="text-sm">
                                        <div className="font-medium">
                                          {
                                            item.vehicle.inventory_items
                                              .item_name
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell>{item.tag}</TableCell>
                                <TableCell>{item.remarks}</TableCell>
                                <TableCell>{item.service_status}</TableCell>
                                <TableCell>
                                  {item.archived ? (
                                    <span className="text-red-600 font-medium">
                                      Archived
                                    </span>
                                  ) : (
                                    <span className="text-green-600 font-medium">
                                      Active
                                    </span>
                                  )}
                                </TableCell>
                                {/* ACTIONS CELL */}
                                <TableCell>
                                  <div className="flex justify-center">
                                    <ActionDropdown item={item} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Bottom Pagination */}
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} to{" "}
                        {Math.min(page * pageSize, filtered.length)} of{" "}
                        {filtered.length} items
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <span className="text-gray-700 px-3">
                          Page {page} of {totalPages || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

      {/* Filter Sidebar - Starts from table header level */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l z-40 transform transition-transform duration-300 ease-in-out ${
          filtersOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          marginTop: "140px",
          height: "calc(100vh - 140px)",
        }}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableTags.length === 0 ? (
                <div className="text-sm text-gray-500">No tags</div>
              ) : (
                availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.tags.has(tag)}
                      onCheckedChange={() => handleTagFilter(tag)}
                    />
                    <label className="text-sm">{tag}</label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <div className="space-y-2">
              {availableStatuses.length === 0 ? (
                <div className="text-sm text-gray-500">No statuses</div>
              ) : (
                availableStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.status.has(status)}
                      onCheckedChange={() => handleStatusFilter(status)}
                    />
                    <label className="text-sm">{status}</label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setFiltersOpen(false)}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearAllFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when filters are open */}
      {filtersOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      {/* Bulk Import Modal */}
      <Dialog open={openImport} onOpenChange={setOpenImport} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Download the sample file and fill in data according to our
              migration structure.
            </p>
            <a
              href={`${baseUrl}/sample_untracked_item.csv`}
              download
              className="text-blue-600 underline"
            >
              Download Sample File
            </a>
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 text-white"
            >
              {importing ? "Importing..." : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UntrackItemIndex;
