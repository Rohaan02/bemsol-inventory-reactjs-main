import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// API helpers
import categoryAPI from "@/lib/categoryAPI";
import locationAPI from "@/lib/locationAPI";
import itemTypeAPI from "@/lib/ItemtypeAPI";
import itemSubTypeAPI from "@/lib/ItemSubTypeApi";
import accountAPI from "@/lib/accountAPI";
import unitAPI from "@/lib/unitAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";

// Layout
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Icons
import {
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Package,
  ArrowDownCircle,
  AlertTriangle,
  DollarSign,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

// SweetAlert2 Toast Mixin for top-right notifications
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// MultiSelect Component
const MultiSelect = ({
  options = [],
  selectedValues = [],
  onValueChange,
  placeholder = "Select...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onValueChange(newSelected);
  };

  const removeValue = (value, e) => {
    e.stopPropagation();
    const newSelected = selectedValues.filter((v) => v !== value);
    onValueChange(newSelected);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onValueChange([]);
  };

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-md bg-white cursor-pointer min-h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          <>
            {selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {option.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => removeValue(option.value, e)}
                />
              </Badge>
            ))}
            {selectedOptions.length > 0 && (
              <X
                className="h-3 w-3 cursor-pointer text-gray-500 ml-1"
                onClick={clearAll}
              />
            )}
          </>
        )}
        <ChevronDown className="h-4 w-4 ml-auto text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedValues.includes(option.value) ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => {}}
                className="mr-2"
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Items = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: [],
    location: [],
    item_type: [],
    item_sub_type: [],
    account_id: [],
    status: [],
  });

  const [activeTab, setActiveTab] = useState("All");
  const [inventoryStats, setInventoryStats] = useState({
    totalQuantity: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: "item_code",
    direction: "ascending",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dynamic filter state
  const [dynamicFilter, setDynamicFilter] = useState({
    field: "item_name",
    value: "",
  });

  // Dropdown state
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [filteredSubTypes, setFilteredSubTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Inventory Tree state
  const [inventoryTree, setInventoryTree] = useState([]);
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  // Fetch items
  const fetchItems = async () => {
    try {
      const data = await inventoryItemAPI.getAll();
      const itemsArray = Array.isArray(data) ? data : [];
      setItems(itemsArray);
      console.log("Fetched items:", itemsArray);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      Toast.fire({ icon: "error", title: "Failed to load inventory items." });
    }
  };

  // Fetch dropdowns
  const fetchDropdowns = async () => {
    try {
      const [catsRes, locsRes, typesRes, subTypesRes, accsRes] =
        await Promise.all([
          categoryAPI.getAllCategories(),
          locationAPI.getAll(),
          itemTypeAPI.getAll(),
          itemSubTypeAPI.getAll(),
          accountAPI.getAll(),
        ]);

      setCategories(catsRes || []);
      setLocations(locsRes || []);
      setTypes(typesRes || []);
      setSubTypes(subTypesRes || []);
      setFilteredSubTypes(subTypesRes || []);
      setAccounts(accsRes || []);

      // Build inventory tree structure
      buildInventoryTree(typesRes, subTypesRes);
    } catch (err) {
      console.error("Dropdown fetch error:", err);
    }
  };

  // Build inventory tree structure
  const buildInventoryTree = (typesData, subTypesData) => {
    const tree = (typesData || []).map((type) => ({
      ...type,
      children: (subTypesData || []).filter(
        (subType) => subType.item_type_id === type.id
      ),
    }));
    setInventoryTree(tree);
  };

  // Toggle expand/collapse for inventory tree
  const toggleTypeExpand = (typeId) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        newSet.delete(typeId);
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  // Filter sub-types based on selected types
  useEffect(() => {
    if (filters.item_type.length > 0) {
      const filtered = subTypes.filter((subType) =>
        filters.item_type.includes(subType.item_type_id.toString())
      );
      setFilteredSubTypes(filtered);
    } else {
      setFilteredSubTypes(subTypes);
    }
  }, [filters.item_type, subTypes]);

  useEffect(() => {
    fetchItems();
    fetchDropdowns();
  }, []);

  // Utility function to safely get nested property value for sorting
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // Sorting logic
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key) || "";
        const bValue = getNestedValue(b, sortConfig.key) || "";

        // Handle numeric comparison for Quantity and Unit Cost
        const isNumeric = ["quantity", "unit_cost"].includes(sortConfig.key);
        const valA = isNumeric ? Number(aValue) : String(aValue).toLowerCase();
        const valB = isNumeric ? Number(bValue) : String(bValue).toLowerCase();

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  // Filtered items calculation
  const filteredItems = useMemo(() => {
    let result = [...sortedItems];

    // Filter by location tab if not "All"
    if (activeTab !== "All") {
      result = result.filter(
        (item) => item.location_id?.toString() === activeTab
      );
    }

    // Apply main search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.item_code?.toLowerCase().includes(term) ||
          item.item_name?.toLowerCase().includes(term) ||
          item.specification?.toLowerCase().includes(term) ||
          item.manufacturer_model?.toLowerCase().includes(term) ||
          item.item_type?.name?.toLowerCase().includes(term) ||
          item.item_sub_type?.name?.toLowerCase().includes(term)
      );
    }

    // Dynamic filter
    if (dynamicFilter.value && dynamicFilter.field) {
      const filterValue = dynamicFilter.value.toLowerCase();
      result = result.filter((item) => {
        const fieldValue = getNestedValue(item, dynamicFilter.field);
        const itemValue = fieldValue?.toString().toLowerCase();
        return itemValue?.includes(filterValue);
      });
    }

    // Multi-select filters
    if (filters.category.length > 0) {
      result = result.filter((item) =>
        filters.category.includes(item.category_id?.toString())
      );
    }
    if (filters.location.length > 0) {
      result = result.filter((item) =>
        filters.location.includes(item.location_id?.toString())
      );
    }
    if (filters.item_type.length > 0) {
      result = result.filter((item) =>
        filters.item_type.includes(item.item_type_id?.toString())
      );
    }
    if (filters.item_sub_type.length > 0) {
      result = result.filter((item) =>
        filters.item_sub_type.includes(item.item_sub_type_id?.toString())
      );
    }
    if (filters.account_id.length > 0) {
      result = result.filter((item) =>
        filters.account_id.includes(item.account_id?.toString())
      );
    }
    if (filters.status.length > 0) {
      result = result.filter((item) => {
        const status = item.is_active ? "active" : "inactive";
        return filters.status.includes(status);
      });
    }

    return result;
  }, [sortedItems, searchTerm, filters, activeTab, dynamicFilter, locations]);

  // Calculate inventory stats separately
  useEffect(() => {
    const totalQuantity = filteredItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    const outOfStock = filteredItems.filter(
      (item) => (Number(item.quantity) || 0) === 0
    ).length;
    const lowStock = filteredItems.filter((item) => {
      const quantity = Number(item.quantity) || 0;
      const reorderLevel = Number(item.reorder_level) || 0;
      return quantity > 0 && quantity <= reorderLevel;
    }).length;
    const totalValue = filteredItems.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0),
      0
    );

    setInventoryStats({ totalQuantity, outOfStock, lowStock, totalValue });
  }, [filteredItems]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Render sorting arrows in table header
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === "ascending" ? (
      <span className="ml-1">▲</span>
    ) : (
      <span className="ml-1">▼</span>
    );
  };

  // Handle multi-select filter changes
  const handleMultiSelectFilterChange = (filterName, values) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: values,
    }));

    // When locations are selected from multi-select, reset the active tab to "All"
    if (filterName === "location" && values.length > 0) {
      setActiveTab("All");
    }
  };

  const handleTabChange = (newTabValue) => {
    setActiveTab(newTabValue);
    // If a tab is selected (not "All") AND location filters are set, clear the location filters
    if (newTabValue !== "All" && filters.location.length > 0) {
      handleMultiSelectFilterChange("location", []);
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: [],
      location: [],
      item_type: [],
      item_sub_type: [],
      account_id: [],
      status: [],
    });
    setDynamicFilter({ field: "item_name", value: "" });
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      searchTerm ||
      dynamicFilter.value ||
      Object.values(filters).some((value) => value.length > 0) ||
      activeTab !== "All"
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Handle pagination changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handles the edit action
  const handleEditClick = (item) => {
    navigate(`/inventory/edit/${item.id}`);
  };

  // Handles the delete action
  const handleDeleteClick = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this! Deleting item: ${item.item_name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await inventoryItemAPI.remove(item.id);
          Toast.fire({
            icon: "success",
            title: "Item deleted successfully!",
          });
          fetchItems();
        } catch (error) {
          console.error("Failed to delete item:", error);
          Toast.fire({
            icon: "error",
            title: "Failed to delete item.",
          });
        }
      }
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Create CSV content with inventory tree levels as separate columns
    const headers = [
      "Item Code",
      "Item Name",
      "Manufacturer",
      "Description",
      "Category",
      "Location",
      "Quantity",
      "Unit Cost",
      "Type",
      "Sub Type",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredItems.map((item) =>
        [
          `"${item.item_code || ""}"`,
          `"${item.item_name || ""}"`,
          `"${item.manufacturer_model || ""}"`,
          `"${item.description || ""}"`,
          `"${item.category?.category_name || ""}"`,
          `"${item.location?.name || ""}"`,
          item.quantity || 0,
          item.unit_cost || 0,
          `"${item.item_type?.name || ""}"`,
          `"${item.item_sub_type?.name || ""}"`,
          `"${item.is_active ? "Active" : "Inactive"}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Inventory Items</h2>
              <div className="flex gap-2">
                <Button
                  onClick={exportToExcel}
                  className="bg-primary-color hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  onClick={() => navigate("/inventory/add")}
                  className="bg-primary-color hover:bg-primary-color/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create New Item
                </Button>
              </div>
            </div>

            {/* Combined Row: Tabs (Left) + Search, Pagination, Filters (Right) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              {/* Location Tabs - Left Side */}
              <div className="flex-1 min-w-0">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  <button
                    onClick={() => handleTabChange("All")}
                    className={`px-3 py-1 text-sm font-medium whitespace-nowrap relative 
                      ${
                        activeTab === "All"
                          ? "text-primary-color after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary-color"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    All Locations
                  </button>
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleTabChange(loc.id.toString())}
                      className={`px-3 py-1 text-sm font-medium whitespace-nowrap relative 
                        ${
                          activeTab === loc.id.toString()
                            ? "text-primary-color after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary-color"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Search, Pagination, Filter Button */}
              <div className="flex items-center gap-3">
                {/* Search Input - Small */}
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>

                {/* Pagination Controls - Compact */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 bg-primary-color"
                    variant="outline"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
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

                {/* Filter Button */}
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
              </div>
            </div>

            {/* Inventory Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Quantity
                  </CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(inventoryStats.totalQuantity)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Out of Stock
                  </CardTitle>
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {inventoryStats.outOfStock}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Low Stock
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    {inventoryStats.lowStock}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Inventory Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    PKR
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    }).format(inventoryStats.totalValue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expanded Filters */}
            {filtersOpen && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Dynamic Filter
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={dynamicFilter.field}
                        onValueChange={(value) =>
                          setDynamicFilter((prev) => ({
                            ...prev,
                            field: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="item_name">Item Name</SelectItem>
                          <SelectItem value="item_code">Item Code</SelectItem>
                          <SelectItem value="manufacturer_model">
                            Manufacturer
                          </SelectItem>
                          <SelectItem value="specification">
                            Specification
                          </SelectItem>
                          <SelectItem value="item_type.name">Type</SelectItem>
                          <SelectItem value="item_sub_type.name">
                            Sub Type
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Search..."
                        value={dynamicFilter.value}
                        onChange={(e) =>
                          setDynamicFilter((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <MultiSelect
                      options={categories.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.category_name,
                      }))}
                      selectedValues={filters.category}
                      onValueChange={(values) =>
                        handleMultiSelectFilterChange("category", values)
                      }
                      placeholder="All Categories"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <MultiSelect
                      options={locations.map((loc) => ({
                        value: loc.id.toString(),
                        label: loc.name,
                      }))}
                      selectedValues={filters.location}
                      onValueChange={(values) => {
                        handleMultiSelectFilterChange("location", values);
                        if (activeTab !== "All") {
                          setActiveTab("All");
                        }
                      }}
                      placeholder="All Locations"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Item Type</Label>
                    <MultiSelect
                      options={types.map((t) => ({
                        value: t.id.toString(),
                        label: t.name,
                      }))}
                      selectedValues={filters.item_type}
                      onValueChange={(values) =>
                        handleMultiSelectFilterChange("item_type", values)
                      }
                      placeholder="All Types"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Item Sub Type</Label>
                    <MultiSelect
                      options={filteredSubTypes.map((st) => ({
                        value: st.id.toString(),
                        label: st.name,
                      }))}
                      selectedValues={filters.item_sub_type}
                      onValueChange={(values) =>
                        handleMultiSelectFilterChange("item_sub_type", values)
                      }
                      placeholder="All Sub Types"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account</Label>
                    <MultiSelect
                      options={accounts.map((acc) => ({
                        value: acc.id.toString(),
                        label: acc.account_name,
                      }))}
                      selectedValues={filters.account_id}
                      onValueChange={(values) =>
                        handleMultiSelectFilterChange("account_id", values)
                      }
                      placeholder="All Accounts"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <MultiSelect
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                      selectedValues={filters.status}
                      onValueChange={(values) =>
                        handleMultiSelectFilterChange("status", values)
                      }
                      placeholder="All Status"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Showing {currentItems.length} of {filteredItems.length} items
              </span>
            </div>
          </div>

          {/* Scrollable Table Section */}
          <div className="flex-1 overflow-hidden bg-white rounded-lg border border-gray-200 shadow">
            <div className="h-full overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 bg-gray-100">Image</th>
                    <ThSortable
                      field="item_code"
                      onClick={requestSort}
                      sortIcon={getSortIcon("item_code")}
                      className="bg-gray-100"
                    >
                      Code
                    </ThSortable>
                    <ThSortable
                      field="item_name"
                      onClick={requestSort}
                      sortIcon={getSortIcon("item_name")}
                      className="bg-gray-100"
                    >
                      Name
                    </ThSortable>
                    <ThSortable
                      field="manufacturer_model"
                      onClick={requestSort}
                      sortIcon={getSortIcon("manufacturer_model")}
                      className="bg-gray-100"
                    >
                      Mfc
                    </ThSortable>
                    <ThSortable
                      field="description"
                      onClick={requestSort}
                      sortIcon={getSortIcon("description")}
                      className="bg-gray-100"
                    >
                      Desc
                    </ThSortable>
                    <ThSortable
                      field="category.category_name"
                      onClick={requestSort}
                      sortIcon={getSortIcon("category.category_name")}
                      className="bg-gray-100"
                    >
                      Category
                    </ThSortable>
                    <ThSortable
                      field="location.name"
                      onClick={requestSort}
                      sortIcon={getSortIcon("location.name")}
                      className="bg-gray-100"
                    >
                      Location
                    </ThSortable>
                    <ThSortable
                      field="quantity"
                      onClick={requestSort}
                      sortIcon={getSortIcon("quantity")}
                      className="bg-gray-100 text-center"
                    >
                      QTY
                    </ThSortable>
                    <ThSortable
                      field="unit_cost"
                      onClick={requestSort}
                      sortIcon={getSortIcon("unit_cost")}
                      className="bg-gray-100 text-center"
                    >
                      Unit Cost
                    </ThSortable>
                    <ThSortable
                      field="item_type.name"
                      onClick={requestSort}
                      sortIcon={getSortIcon("item_type.name")}
                      className="bg-gray-100"
                    >
                      Type
                    </ThSortable>
                    <ThSortable
                      field="item_sub_type.name"
                      onClick={requestSort}
                      sortIcon={getSortIcon("item_sub_type.name")}
                      className="bg-gray-100"
                    >
                      S.Type
                    </ThSortable>
                    <th className="px-4 py-3 bg-gray-100">Status</th>
                    <th className="px-4 py-3 bg-gray-100 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
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
                        <td className="px-4 py-3">
                          <Link
                            to={`/item-tracking/track/${item.id}`}
                            className="text-blue-500 hover:underline"
                          >
                            {item.item_code}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{item.item_name}</td>
                        <td className="px-4 py-3">
                          {item.manufacturer_model || "-"}
                        </td>
                        <td className="px-4 py-3">{item.description || "-"}</td>
                        <td className="px-4 py-3">
                          {item.category?.category_name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.location?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.quantity ?? 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.unit_cost ? `PKR ${item.unit_cost}` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.item_type?.name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.item_sub_type?.name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.is_active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-2"
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" sideOffset={5}>
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(item)}
                                  className="flex items-center gap-2 bg-primary-color hover:bg-green-600 text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(item)}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="12"
                        className="text-center py-8 text-gray-500"
                      >
                        {items.length === 0 ? (
                          "No items found. Create your first inventory item."
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-gray-300" />
                            <span>No items match your search criteria</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="mt-2"
                            >
                              Clear filters
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper component for sortable table headers
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

export default Items;
