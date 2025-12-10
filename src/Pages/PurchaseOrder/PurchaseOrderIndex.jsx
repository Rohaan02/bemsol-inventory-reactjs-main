import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@radix-ui/themes";
import Select from "react-select";
import { toast } from "react-toastify";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
  Edit,
  Trash2,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

import purchaseOrderAPI from "../../lib/purchaseOrderApi";
import vendorAPI from "../../lib/vendorApi";
import locationAPI from "../../lib/locationAPI";

export default function PurchaseOrderIndex() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedColumns = localStorage.getItem("purchaseOrderColumns");
    return savedColumns
      ? JSON.parse(savedColumns)
      : {
          po_number: true,
          status: true,
          vendor: true,
          location: true,
          delivery_date: true,
          contact_person_name: true,
          contact_person_mobile: true,
          ref_quotation_no: true,
          intco_term: true,
          label: true,
          specification: true,
          items_count: true,
          subtotal: true,
          gst_rate: true,
          gst_amount: true,
          total_after_tax: true,
          wht_rate: true,
          wht_amount: true,
          total_payable: true,

          actions: true,
        };
  });

  // Filter States
  const [selectedParts, setSelectedParts] = useState(null); // This was unused, but kept it
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedPartLocation, setSelectedPartLocation] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    parts: [
      { value: "all", label: "All Parts" },
      { value: "electronic", label: "Electronic Components" },
      { value: "mechanical", label: "Mechanical Parts" },
      { value: "office", label: "Office Supplies" },
      { value: "consumables", label: "Consumables" },
    ],
    vendor: [],
    partLocations: [],
    labels: [
      { value: "all", label: "All Labels" },
      { value: "urgent", label: "Urgent" },
      { value: "office", label: "Office" },
      { value: "rd", label: "R&D" },
      { value: "shipping", label: "Shipping" },
    ],
    status: [
      { value: "all", label: "All Status" },
      { value: "draft", label: "Draft" },
      { value: "pending", label: "Pending Approval" },
      { value: "rejected", label: "Rejected" },
      { value: "approved", label: "Approved" },
      { value: "purchased", label: "Purchased" },
    ],
  });

  // Custom styles for React Select (unchanged)
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "36px",
      height: "36px",
      borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      boxShadow: state.isFocused ? "0 0 0 1px #6b7280" : "none",
      "&:hover": {
        borderColor: "#6b7280",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "36px",
      padding: "0 8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "36px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: "14px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: "#f3f4f6",
        color: "#374151",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#374151",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
  };

  // Fetch vendors and locations for dropdowns
  const fetchVendorsAndLocations = async () => {
    try {
      const [vendorsData, locationsData] = await Promise.all([
        vendorAPI.getAll(),
        locationAPI.getAll(),
      ]);

      setDropdownOptions((prev) => ({
        ...prev,
        vendor: [
          { value: "all", label: "All Vendors" },
          ...vendorsData.map((vendor) => ({
            value: vendor.id.toString(),
            label: vendor.name || vendor.company_name || "Unknown Vendor",
          })),
        ],
        partLocations: [
          { value: "all", label: "All Locations" },
          ...locationsData.map((location) => ({
            value: location.id.toString(),
            label: location.name || "Unknown Location",
          })),
        ],
      }));
    } catch (error) {
      console.error("Error fetching vendors and locations:", error);
    }
  };

  // Fetch purchase orders from API
  const fetchPurchaseOrders = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      // Clean up filters: remove 'all' values as API likely expects them to be absent
      const cleanFilters = { ...filters };
      if (cleanFilters.status === "all") delete cleanFilters.status;
      if (cleanFilters.vendor_id === "all") delete cleanFilters.vendor_id;
      if (cleanFilters.location_id === "all") delete cleanFilters.location_id;
      if (cleanFilters.label === "all") delete cleanFilters.label;
      if (cleanFilters.search === "") delete cleanFilters.search;

      console.log("Fetching with filters:", cleanFilters);

      const result = await purchaseOrderAPI.getAll(
        cleanFilters,
        page,
        pagination.per_page
      );

      if (result.success) {
        setPurchaseOrders(result.data);
        setPagination(
          result.meta || {
            current_page: page,
            last_page: result.meta?.last_page || 1,
            per_page: pagination.per_page,
            total: result.meta?.total || result.data.length,
          }
        );
      } else {
        toast.error(result.message || "Failed to fetch purchase orders");
        setPurchaseOrders([]); // Clear data on failure
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        }); // Reset pagination
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  // *** FIXED ***
  // Helper function to build the current filter object
  const getCurrentFilters = () => {
    const filters = {};

    if (searchQuery) {
      filters.search = searchQuery;
    }

    // Priority to the dropdown
    if (selectedStatus && selectedStatus.value !== "all") {
      filters.status = selectedStatus.value;
    }
    // Fallback to the tab
    else if (activeTab !== "all") {
      filters.status = activeTab;
    }

    if (selectedVendor && selectedVendor.value !== "all") {
      filters.vendor_id = selectedVendor.value;
    }
    if (selectedPartLocation && selectedPartLocation.value !== "all") {
      filters.location_id = selectedPartLocation.value;
    }
    if (selectedLabels && selectedLabels.value !== "all") {
      filters.label = selectedLabels.value;
    }
    return filters;
  };

  // Load data on component mount
  useEffect(() => {
    fetchPurchaseOrders(1, getCurrentFilters()); // Use helper
    fetchVendorsAndLocations();
  }, []); // Only runs once on mount

  // *** REMOVED conflicting useEffect [activeTab] ***

  // *** FIXED ***
  // Handle search and filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = getCurrentFilters();
      fetchPurchaseOrders(1, filters); // Always fetch page 1 when filters change
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedStatus,
    selectedVendor,
    selectedPartLocation,
    selectedLabels,
    activeTab,
  ]); // Added activeTab

  // Sort function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortConfig.key) return purchaseOrders;

    return [...purchaseOrders].sort((a, b) => {
      // Handle nested properties like vendor.name
      const getNestedValue = (obj, path) => {
        if (!path) return obj;
        const keys = path.split(".");
        return keys.reduce(
          (acc, key) => (acc && acc[key] !== null ? acc[key] : undefined),
          obj
        );
      };

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Special handling for relational data
      if (sortConfig.key === "vendor") {
        aValue = a.vendor?.name || a.vendor?.company_name;
        bValue = b.vendor?.name || b.vendor?.company_name;
      } else if (sortConfig.key === "location") {
        aValue = a.location?.name;
        bValue = b.location?.name;
      }

      // Fallback for null/undefined values
      aValue = aValue || "";
      bValue = bValue || "";

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData();

  // *** FIXED ***
  // Pagination handlers
  const handlePreviousPage = () => {
    if (pagination.current_page > 1) {
      fetchPurchaseOrders(pagination.current_page - 1, getCurrentFilters()); // Pass filters
    }
  };

  // *** FIXED ***
  const handleNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchPurchaseOrders(pagination.current_page + 1, getCurrentFilters()); // Pass filters
    }
  };

  // Status badge colors (unchanged)
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "approved":
        return "bg-green-500";
      case "purchased":
        return "bg-blue-500";
      case "received_partial":
        return "bg-green-500";
      case "received_full":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "purchased":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "received_partial":
        return "bg-green-100 text-green-800 border-green-300";
      case "received_full":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Delete purchase order
  const handleDelete = async (id, poNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete purchase order ${poNumber}?`
      )
    ) {
      return;
    }

    try {
      const result = await purchaseOrderAPI.remove(id);
      if (result.success) {
        toast.success("Purchase order deleted successfully");
        // Refetch with current filters and page
        fetchPurchaseOrders(pagination.current_page, getCurrentFilters());
      } else {
        toast.error(result.message || "Failed to delete purchase order");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("Failed to delete purchase order");
    }
  };

  // Update status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const result = await purchaseOrderAPI.updateStatus(id, newStatus);
      if (result.success) {
        toast.success("Status updated successfully");
        // Refetch with current filters and page
        fetchPurchaseOrders(pagination.current_page, getCurrentFilters());
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const tabs = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft", dot: true },
    { value: "pending", label: "Pending Approval", dot: true },
    { value: "rejected", label: "Rejected", dot: true },
    { value: "approved", label: "Approved", dot: true },
    { value: "purchased", label: "Purchased", dot: true },
    { value: "received_partial", label: "Received, Partial", dot: true },
    { value: "received_full", label: "Received, Full", dot: true },
  ];

  // Column configuration
  const columns = [
    { key: "po_number", label: "PO Number", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "vendor", label: "Vendor", sortable: true },
    { key: "location", label: "Delivery Location", sortable: true },
    { key: "delivery_date", label: "Delivery Date", sortable: true },
    { key: "contact_person_name", label: "Contact Person", sortable: true },
    { key: "contact_person_mobile", label: "Contact Mobile", sortable: true },
    { key: "ref_quotation_no", label: "Ref Quotation No", sortable: true },
    { key: "intco_term", label: "Intco Term", sortable: true },
    { key: "label", label: "Label", sortable: true },
    { key: "specification", label: "Specification", sortable: true },
    { key: "items_count", label: "Items Count", sortable: true },
    { key: "subtotal", label: "Subtotal", sortable: true },
    { key: "gst_rate", label: "GST Rate %", sortable: true },
    { key: "gst_amount", label: "GST Amount", sortable: true },
    { key: "total_after_tax", label: "Total After Tax", sortable: true },
    { key: "wht_rate", label: "WHT Rate %", sortable: true },
    { key: "wht_amount", label: "WHT Amount", sortable: true },
    { key: "total_payable", label: "Total Payable", sortable: true },

    { key: "actions", label: "Actions", sortable: false },
  ];

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Reset all columns to visible
  const resetColumns = () => {
    const allVisible = {};
    columns.forEach((column) => {
      allVisible[column.key] = true;
    });
    setVisibleColumns(allVisible);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };
  const handleCreatePurchase = (orderId) => {
    navigate(`/market-purchases/create?po_id=${orderId}`);
  };

  // Save column preferences to localStorage
  useEffect(() => {
    localStorage.setItem(
      "purchaseOrderColumns",
      JSON.stringify(visibleColumns)
    );
  }, [visibleColumns]);

  return (
    <div className="h-full">
          {/* Header Section */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                Purchase Orders
                <span className="ml-2 text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded font-normal">
                  Learn More
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 text-xl"
              >
                ...
              </Button>
              <Button
                onClick={() => navigate("/purchase-orders/add")}
                className="flex items-center gap-2 bg-primary-color text-white"
              >
                <Plus className="h-4 w-4" />
                Add Purchase Order
              </Button>
            </div>
          </div>

          {/* Horizontal Tabs with Status Colors */}
          <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? "text-green-500 border-green-500 font-semibold"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
                onClick={() => {
                  if (tab.value !== "more") {
                    setActiveTab(tab.value);
                  }
                  // You can add logic for 'more' button here
                }}
              >
                {tab.dot && (
                  <span
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      tab.value
                    )}`}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sticky Search and Filter Bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-6 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by PO number, vendor..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-32">
                <Select
                  options={dropdownOptions.vendor}
                  value={selectedVendor}
                  onChange={setSelectedVendor}
                  placeholder="Vendor"
                  styles={customStyles}
                  isSearchable={true} // Vendors list can be long
                  isClearable={true}
                />
              </div>

              <div className="w-40">
                <Select
                  options={dropdownOptions.partLocations}
                  value={selectedPartLocation}
                  onChange={setSelectedPartLocation}
                  placeholder="Part Locations"
                  styles={customStyles}
                  isSearchable={true} // Locations list can be long
                  isClearable={true}
                />
              </div>

              <div className="w-28">
                <Select
                  options={dropdownOptions.labels}
                  value={selectedLabels}
                  onChange={setSelectedLabels}
                  placeholder="Labels"
                  styles={customStyles}
                  isSearchable={false}
                  isClearable={true}
                />
              </div>

              <div className="w-32">
                <Select
                  options={dropdownOptions.status}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Status"
                  styles={customStyles}
                  isSearchable={false}
                  isClearable={true}
                />
              </div>

              {/* *** FIXED *** "Filters" button */}
              <Button
                variant="outline"
                className="whitespace-nowrap flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white px-3"
                onClick={() => fetchPurchaseOrders(1, getCurrentFilters())} // Manually apply
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              {/* *** FIXED *** "Clear" button */}
              <Button
                variant="outline"
                className="whitespace-nowrap px-3 bg-gray-500 text-white"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus(null);
                  setSelectedVendor(null);
                  setSelectedPartLocation(null);
                  setSelectedLabels(null);
                  setSelectedParts(null);
                  setActiveTab("all");
                  fetchPurchaseOrders(1, {}); // Fetch with empty filters
                }}
              >
                Clear
              </Button>

              {/* Spacer to push pagination to right */}
              <div className="flex-1"></div>

              {/* Pagination and Settings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <span>({pagination.total} total)</span>
                </div>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 border-r border-gray-300 rounded-none"
                    onClick={handlePreviousPage}
                    disabled={pagination.current_page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-none"
                    onClick={handleNextPage}
                    disabled={
                      pagination.current_page >= pagination.last_page || loading
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Column Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white text-black"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 max-h-96 overflow-y-auto"
                  >
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Columns</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetColumns}
                        className="h-6 text-xs"
                      >
                        Reset All
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map((column) => (
                      <DropdownMenuItem
                        key={column.key}
                        className="flex items-center justify-between"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span>{column.label}</span>
                        <Checkbox
                          checked={visibleColumns[column.key]}
                          onCheckedChange={() =>
                            toggleColumnVisibility(column.key)
                          }
                        />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Purchase Orders Table with Scroll */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="h-full flex flex-col">
                {/* Loading State */}
                {loading && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-color" />
                    <span className="ml-2 text-gray-600">
                      Loading purchase orders...
                    </span>
                  </div>
                )}

                {/* Table Container with Scroll */}
                {!loading && (
                  <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gray-50 border-b sticky top-0 z-5">
                        <tr>
                          {columns.map(
                            (column) =>
                              visibleColumns[column.key] && (
                                <th
                                  key={column.key}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  <div className="flex items-center gap-1">
                                    {column.label}
                                    {column.sortable && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-gray-200"
                                        onClick={() => handleSort(column.key)}
                                      >
                                        <ArrowUpDown className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </th>
                              )
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length === 0 ? (
                          <tr>
                            <td
                              colSpan={
                                columns.filter((c) => visibleColumns[c.key])
                                  .length
                              }
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No purchase orders found
                            </td>
                          </tr>
                        ) : (
                          sortedData.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              {visibleColumns.po_number && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <strong>{order.po_number}</strong>
                                </td>
                              )}
                              {visibleColumns.status && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                      order.status
                                    )}`}
                                  >
                                    {order.status?.charAt(0).toUpperCase() +
                                      order.status?.slice(1).replace("_", " ")}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.vendor && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.vendor?.name ||
                                    order.vendor?.company_name ||
                                    "N/A"}
                                </td>
                              )}
                              {visibleColumns.location && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.location?.name || "N/A"}
                                </td>
                              )}
                              {visibleColumns.delivery_date && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {formatDate(order.delivery_date)}
                                </td>
                              )}
                              {visibleColumns.contact_person_name && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.contact_person_name || "-"}
                                </td>
                              )}
                              {visibleColumns.contact_person_mobile && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.contact_person_mobile || "-"}
                                </td>
                              )}
                              {visibleColumns.ref_quotation_no && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.ref_quotation_no || "-"}
                                </td>
                              )}
                              {visibleColumns.intco_term && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {order.intco_term || "-"}
                                </td>
                              )}
                              {visibleColumns.label && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-100 text-gray-800"
                                  >
                                    {order.label || "Standard"}
                                  </Badge>
                                </td>
                              )}
                              {visibleColumns.specification && (
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                  <div
                                    className="truncate"
                                    title={order.specification}
                                  >
                                    {order.specification || "No specification"}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.items_count && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                                  {order.items_count || 0}
                                </td>
                              )}
                              {visibleColumns.subtotal && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {formatCurrency(order.subtotal)}
                                </td>
                              )}
                              {visibleColumns.gst_rate && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {order.gst_rate}%
                                </td>
                              )}
                              {visibleColumns.gst_amount && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {formatCurrency(order.gst_amount)}
                                </td>
                              )}
                              {visibleColumns.total_after_tax && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {formatCurrency(order.total_after_tax)}
                                </td>
                              )}
                              {visibleColumns.wht_rate && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {order.wht_rate}%
                                </td>
                              )}
                              {visibleColumns.wht_amount && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {formatCurrency(order.wht_amount)}
                                </td>
                              )}
                              {visibleColumns.total_payable && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(order.total_payable)}
                                </td>
                              )}

                              {visibleColumns.actions && (
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      {/* View - Always available */}
                                      <DropdownMenuItem
                                        onClick={() =>
                                          navigate(
                                            `/purchase-orders/${order.id}`
                                          )
                                        }
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                      >
                                        <Eye className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">
                                          Preview
                                        </span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          navigate(
                                            `/purchase-order/show/${order.id}`
                                          )
                                        }
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                      >
                                        <Eye className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">
                                          View
                                        </span>
                                      </DropdownMenuItem>

                                      {/* Edit - Only available for draft status */}
                                      {order.status === "draft" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            navigate(
                                              `/purchase-orders/${order.id}/edit`
                                            )
                                          }
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                        >
                                          <Edit className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">
                                            Edit Order
                                          </span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Show disabled edit option for non-draft status with tooltip */}
                                      {order.status !== "draft" && (
                                        <DropdownMenuItem
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-not-allowed opacity-50"
                                          disabled
                                        >
                                          <Edit className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                          <span className="text-sm text-gray-500">
                                            {order.status === "pending"
                                              ? "Under Review"
                                              : order.status === "approved"
                                              ? "Cannot Edit"
                                              : order.status === "rejected"
                                              ? "Rejected"
                                              : "Cannot Edit"}
                                          </span>
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator />

                                      {/* Create Purchase - Only available for approved POs */}
                                      {order.status === "approved" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleCreatePurchase(order.id)
                                          }
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                        >
                                          <svg
                                            className="h-4 w-4 text-blue-600 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                          </svg>
                                          <span className="text-sm text-blue-700">
                                            Create Purchase
                                          </span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Status Actions */}
                                      {order.status === "draft" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusUpdate(
                                              order.id,
                                              "pending"
                                            )
                                          }
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                        >
                                          <svg
                                            className="h-4 w-4 text-yellow-600 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span className="text-sm text-yellow-700">
                                            Submit for Approval
                                          </span>
                                        </DropdownMenuItem>
                                      )}

                                      {order.status === "pending" && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleStatusUpdate(
                                                order.id,
                                                "approved"
                                              )
                                            }
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                          >
                                            <svg
                                              className="h-4 w-4 text-green-600 flex-shrink-0"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                            <span className="text-sm text-green-700">
                                              Approve
                                            </span>
                                          </DropdownMenuItem>

                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleStatusUpdate(
                                                order.id,
                                                "rejected"
                                              )
                                            }
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                          >
                                            <svg
                                              className="h-4 w-4 text-red-600 flex-shrink-0"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                              />
                                            </svg>
                                            <span className="text-sm text-red-700">
                                              Reject
                                            </span>
                                          </DropdownMenuItem>
                                        </>
                                      )}

                                      {/* Status information for approved/rejected POs */}
                                      {(order.status === "approved" ||
                                        order.status === "rejected") && (
                                        <DropdownMenuItem
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-default"
                                          disabled
                                        >
                                          {order.status === "approved" ? (
                                            <>
                                              <svg
                                                className="h-4 w-4 text-green-600 flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M5 13l4 4L19 7"
                                                />
                                              </svg>
                                              <span className="text-sm text-green-700 font-medium">
                                                Approved
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <svg
                                                className="h-4 w-4 text-red-600 flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M6 18L18-6M6 6l12 12"
                                                />
                                              </svg>
                                              <span className="text-sm text-red-700 font-medium">
                                                Rejected
                                              </span>
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator />

                                      {/* Delete - Only available for draft status */}
                                      {order.status === "draft" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(
                                              order.id,
                                              order.po_number
                                            )
                                          }
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600 flex-shrink-0" />
                                          <span className="text-sm text-red-700">
                                            Delete
                                          </span>
                                        </DropdownMenuItem>
                                      )}

                                      {/* Disabled delete for non-draft status */}
                                      {order.status !== "draft" && (
                                        <DropdownMenuItem
                                          className="flex items-center gap-3 px-3 py-2.5 cursor-not-allowed opacity-50"
                                          disabled
                                        >
                                          <Trash2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                          <span className="text-sm text-gray-500">
                                            {order.status === "pending"
                                              ? "Under Review"
                                              : order.status === "approved"
                                              ? " Approved"
                                              : "Cannot Delete"}
                                          </span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
