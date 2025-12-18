// src/Pages/Inventory/Items.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  Download,
  Printer,
} from "lucide-react";

// Import components
import InventoryHeader from "./components/InventoryHeader";
import LocationTabs from "./components/LocationTabs";
import StatsCards from "./components/StatsCards";
import DataTable from "@/components/ui/data-table";

// API helpers
import categoryAPI from "@/lib/categoryAPI";
import locationAPI from "@/lib/locationAPI";
import accountAPI from "@/lib/accountAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";

const ItemsIndex = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const [activeTab, setActiveTab] = useState("All");
  const [inventoryStats, setInventoryStats] = useState({
    totalQuantity: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
  });

  // Dropdown state
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // DataTable state
  const [selectedItems, setSelectedItems] = useState(new Set());

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

  // Filtered items calculation (only for location tabs, DataTable handles other filters)
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

    return result;
  }, [items, activeTab]);

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

  // Handle filter changes (for location tab coordination)
  const handleFilterChange = (filterName, value) => {
    if (filterName === "location" && value !== "") {
      setActiveTab("All");
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

  // DataTable configuration
  const tableColumns = [
    { key: "select", label: "Select", type: "select" },
    { key: "image", label: "Image", type: "image" },
    {
      key: "item_code",
      label: "Code",
      type: "link",
      linkTemplate: (item) => `/item-tracking/track/${item.id}`,
    },
    { key: "item_name", label: "Name", type: "text" },
    { key: "manufacturer_name", label: "Manufacturer", type: "text" },
    { key: "category_name", label: "Category", type: "text" },
    { key: "location_names", label: "Location", type: "text" },
    { key: "total_quantity", label: "Qty", type: "number", align: "center" },
    { key: "unit_cost", label: "Unit Cost", type: "currency", align: "center" },
    { key: "is_active", label: "Status", type: "badge" },
    { key: "actions", label: "Actions", type: "actions" },
  ];

  const tableFilters = [
    {
      key: "category_id",
      label: "Category",
      options: categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.category_name,
      })),
    },
    {
      key: "location_id",
      label: "Location",
      options: locations.map((loc) => ({
        value: loc.id.toString(),
        label: loc.name,
      })),
    },
    {
      key: "account_id",
      label: "Account",
      options: accounts.map((acc) => ({
        value: acc.id.toString(),
        label: acc.account_name,
      })),
    },
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const tableRowActions = [
    {
      key: "edit",
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditClick,
      showCondition: (item) => item.is_active,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteClick,
      showCondition: (item) => item.is_active,
    },
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => navigate(`/item-tracking/track/${item.id}`),
      showCondition: (item) => item.is_active,
    },
    {
      key: "activate",
      label: "Activate",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      onClick: handleUpdateStatusClick,
      showCondition: (item) => !item.is_active,
    },
    {
      key: "deactivate",
      label: "Dectivate",
      icon: <Ban className="w-4 h-4 text-red-500" />,
      onClick: handleUpdateStatusClick,
      showCondition: (item) => item.is_active,
    },
  ];

  const tableBulkActions = [
    {
      key: "add_to_demand",
      label: "Add to Demand",
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log("Add to demand"),
    },
    {
      key: "print_labels",
      label: "Print Labels",
      icon: <Printer className="w-4 h-4" />,
      onClick: () => console.log("Print labels"),
    },
    {
      key: "archive",
      label: "Archive",
      icon: <Ban className="w-4 h-4" />,
      onClick: handleBulkArchive,
    },
  ];

  const customRenderers = {
    manufacturer_name: (item) =>
      item.manufacturer?.name || item.manufacturer_name || "-",
    category_name: (item) => item.category?.category_name || "-",
    location_names: (item) =>
      item.location_names && item.location_names.length > 0
        ? item.location_names.join(", ")
        : "—",
    total_quantity: (item) => item.total_quantity ?? item.quantity ?? 0,
    is_active: (item) =>
      item.is_active ? (
        <Badge variant="success">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      ),
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
    <div className="h-full">
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

      {/* Data Table */}
      <DataTable
        data={filteredItems}
        columns={tableColumns}
        searchKeys={[
          "item_code",
          "item_name",
          "specification",
          "manufacturer_model",
        ]}
        filterOptions={tableFilters}
        rowActions={tableRowActions}
        bulkActions={tableBulkActions}
        onSelectionChange={setSelectedItems}
        customRenderers={customRenderers}
        getRowClassName={(item) =>
          !item.is_active ? "!bg-gray-200 cursor-not-allowed" : ""
        }
        getRowCursor={(item) => (!item.is_active ? "cursor-not-allowed" : "")}
      />
    </div>
  );
};

export default ItemsIndex;
