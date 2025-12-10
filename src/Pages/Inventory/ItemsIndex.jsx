// src/Pages/Inventory/Items.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, Search } from "lucide-react";

// Import components
import InventoryHeader from "./components/InventoryHeader";
import LocationTabs from "./components/LocationTabs";
import StatsCards from "./components/StatsCards";
import PaginationControls from "./components/PaginationControls";
import BulkActions from "./components/BulkActions";
import FilterSidebar from "./components/FilterSidebar";
import InventoryTable from "./components/InventoryTable";
import ColumnVisibility from "./components/ColumnVisibility"; // Add this import

// API helpers
import categoryAPI from "@/lib/categoryAPI";
import locationAPI from "@/lib/locationAPI";
import accountAPI from "@/lib/accountAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";

// Layout
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const ItemsIndex = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    account_id: "",
    status: "",
  });

  const [activeTab, setActiveTab] = useState("All");
  const [inventoryStats, setInventoryStats] = useState({
    totalQuantity: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dropdown state
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Multi-select state
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState([
    "select",
    "image",
    "code",
    "name",
    "mfc",
    "category",
    "location",
    "qty",
    "unit_cost",
    "status",
    "actions",
  ]);

  // Fetch items
  const fetchItems = async () => {
    try {
      const response = await inventoryItemAPI.getAll();
      console.log("📦 Full API response:", response);

      let itemsArray = [];

      if (Array.isArray(response)) {
        itemsArray = response;
      } else if (response && response.data) {
        itemsArray = response.data;
      } else if (response && Array.isArray(response.items)) {
        itemsArray = response.items;
      }

      console.log("📦 Processed items:", itemsArray);
      setItems(itemsArray);
    } catch (err) {
      console.error("❌ Failed to fetch items:", err);
    }
  };

  // Fetch dropdowns
  const fetchDropdowns = async () => {
    try {
      const [catsRes, locsRes, accsRes] = await Promise.all([
        categoryAPI.getAllCategories(),
        locationAPI.getAuthLocations(),
        accountAPI.getAll(),
      ]);

      setCategories(catsRes || []);
      setLocations(locsRes || []);
      setAccounts(accsRes || []);
    } catch (err) {
      console.error("❌ Dropdown fetch error:", err);
    }
  };

  // Bulk archive function
  const handleBulkArchive = async () => {
    if (selectedItems.size === 0) {
      Swal.fire("Info", "Please select items to archive", "info");
      return;
    }

    const selectedIds = Array.from(selectedItems);

    const result = await Swal.fire({
      title: "Archive Items?",
      html: `You are about to archive <strong>${selectedItems.size}</strong> item(s).<br>This action will deactivate the selected items.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, archive them!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await inventoryItemAPI.bulkarcheive(selectedIds);

        Swal.fire({
          title: "Archived!",
          text: `${selectedItems.size} item(s) have been archived successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the items and clear selection
        fetchItems();
        setSelectedItems(new Set());
      } catch (error) {
        console.error("Failed to archive items:", error);
        Swal.fire("Error", "Failed to archive items", "error");
      }
    }
  };

  useEffect(() => {
    fetchItems();
    fetchDropdowns();
  }, []);

  // Filtered items calculation
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by location tab if not "All"
    if (activeTab !== "All") {
      result = result.filter((item) => {
        const directLocationMatch = item.location_id?.toString() === activeTab;
        const pivotLocationMatch =
          item.itemLocations?.some(
            (loc) => loc.location_id?.toString() === activeTab
          ) ||
          item.item_locations?.some(
            (loc) => loc.location_id?.toString() === activeTab
          );

        return directLocationMatch || pivotLocationMatch;
      });
    }

    // Apply main search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.item_code?.toLowerCase().includes(term) ||
          item.item_name?.toLowerCase().includes(term) ||
          item.specification?.toLowerCase().includes(term) ||
          item.manufacturer_model?.toLowerCase().includes(term)
      );
    }

    // Single-select filters
    if (filters.category) {
      result = result.filter(
        (item) => item.category_id?.toString() === filters.category
      );
    }

    if (filters.location) {
      result = result.filter((item) => {
        const directLocationMatch =
          item.location_id?.toString() === filters.location;
        const pivotLocationMatch =
          item.itemLocations?.some(
            (loc) => loc.location_id?.toString() === filters.location
          ) ||
          item.item_locations?.some(
            (loc) => loc.location_id?.toString() === filters.location
          );
        return directLocationMatch || pivotLocationMatch;
      });
    }

    if (filters.account_id) {
      result = result.filter(
        (item) => item.account_id?.toString() === filters.account_id
      );
    }

    if (filters.status) {
      const isActive = filters.status === "active";
      result = result.filter((item) => item.is_active === isActive);
    }

    return result;
  }, [items, searchTerm, filters, activeTab]);

  // Calculate inventory stats
  useEffect(() => {
    const totalQuantity = filteredItems.reduce(
      (sum, item) =>
        sum + (Number(item.total_quantity) || Number(item.quantity) || 0),
      0
    );

    const outOfStock = filteredItems.filter(
      (item) =>
        (Number(item.total_quantity) || Number(item.quantity) || 0) === 0
    ).length;

    const lowStock = filteredItems.filter((item) => {
      const quantity =
        Number(item.total_quantity) || Number(item.quantity) || 0;
      const reorderLevel = Number(item.reorder_level) || 0;
      return quantity > 0 && quantity <= reorderLevel;
    }).length;

    const totalValue = filteredItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.total_quantity) || Number(item.quantity) || 0) *
          (Number(item.unit_cost) || 0),
      0
    );

    setInventoryStats({ totalQuantity, outOfStock, lowStock, totalValue });
  }, [filteredItems]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      location: "",
      account_id: "",
      status: "",
    });
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      searchTerm ||
      Object.values(filters).some((value) => value !== "") ||
      activeTab !== "All"
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    if (filterName === "location" && value !== "") {
      setActiveTab("All");
    }
  };

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey, checked) => {
    if (checked) {
      setVisibleColumns((prev) => [...prev, columnKey]);
    } else {
      setVisibleColumns((prev) => prev.filter((col) => col !== columnKey));
    }
  };

  // Individual item handlers
  const handleEditClick = (item) => {
    navigate(`/inventory/edit/${item.id}`);
  };

  const handleDeleteClick = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${item.item_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await inventoryItemAPI.remove(item.id);
        fetchItems();
      } catch (error) {
        console.error("Failed to delete item:", error);
        Swal.fire("Error", "Failed to delete item", "error");
      }
    }
  };

  const handleUpdateStatusClick = async (item) => {
    const newStatus = !item.is_active;
    const actionText = newStatus ? "activate" : "deactivate";

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${actionText} the item: ${item.item_name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${actionText} it!`,
    });

    if (result.isConfirmed) {
      try {
        await inventoryItemAPI.updateStatus(item.id, newStatus);
        fetchItems();
      } catch (error) {
        console.error("Failed to update status:", error);
        Swal.fire("Error", "Failed to update status", "error");
      }
    }
  };

  const handleExportExcel = () => {
    console.log("Export to Excel");
    Swal.fire("Info", "Export functionality will be implemented soon", "info");
  };

  // Column definitions for visibility control
  const columnDefinitions = [
    { key: "select", label: "Select" },
    { key: "image", label: "Image" },
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "mfc", label: "Manufacturer" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    { key: "location", label: "Location" },
    { key: "unit_cost", label: "Unit Cost" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-hidden flex flex-col relative">
          {/* Header Section */}
          <InventoryHeader
            onExportExcel={handleExportExcel}
            navigate={navigate}
            onBulkArchive={handleBulkArchive}
            hasSelectedItems={selectedItems.size > 0}
          />

          {/* Location Tabs */}
          <LocationTabs
            locations={locations}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Stats Cards */}
          <StatsCards stats={inventoryStats} />

          {/* Table Controls */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Showing {currentItems.length} of {filteredItems.length} items
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </span>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>

              {/* Column Visibility */}
              <ColumnVisibility
                columns={columnDefinitions}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
              />

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />

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

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <BulkActions
              selectedCount={selectedItems.size}
              onAddToDemand={() => console.log("Add to demand")}
              onPrintLabels={() => console.log("Print labels")}
              onArchive={handleBulkArchive}
            />
          )}

          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            locations={locations}
            accounts={accounts}
            onClearFilters={clearFilters}
          />

          {/* Inventory Table */}
          <InventoryTable
            items={currentItems}
            selectedItems={selectedItems}
            onSelectItem={setSelectedItems}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onUpdateStatus={handleUpdateStatusClick}
            visibleColumns={visibleColumns}
          />
        </main>
      </div>
    </div>
  );
};

export default ItemsIndex;
