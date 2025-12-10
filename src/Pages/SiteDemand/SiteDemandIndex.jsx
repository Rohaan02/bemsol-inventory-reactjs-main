// src/pages/SiteDemands/SiteDemandIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import InterStoreTransfer from "../Modals/InterStoreTransfer";
import inventoryTransferAPI from "@/lib/InventoryTransferAPI";
// import TrackDemand from "./TrackDemand";
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
  MoreVertical,
  Download,
  Search,
  Eye,
  User,
  Building,
  Warehouse,
  ShoppingCart,
  Lock,
  ChevronUp,
  ChevronDown,
  Settings,
  Columns,
  Truck,
  Calendar,
  ThumbsUp,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import Select from "react-select";
import { useAuth } from "../../contexts/AuthContext";

const SiteDemandIndex = () => {
  const [demands, setDemands] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDemands, setSelectedDemands] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { hasPermission, permissions } = useAuth();

  console.log("permissions typeof:", typeof permissions[0]);
  console.log("permissions raw:", permissions);

  useEffect(() => {
    console.log("SiteDemand permissions updated:", permissions);
  }, [permissions]);

  const [filters, setFilters] = useState({
    priority: "",
    fulfillment_type: "",
    processing_status: "",
    date_from: "",
    date_to: "",
  });
  const [pageSize, setPageSize] = useState(10);
  const [bulkApproving, setBulkApproving] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Column visibility state - ADDED pending_qty
  const [columnVisibility, setColumnVisibility] = useState({
    demand_no: true,
    date: true,
    item_name: true,
    quantity: true,
    approved_quantity: true,
    pending_qty: true, // NEW COLUMN
    priority: true,
    fulfillment_type: true,
    processing_status: true,
    site_store_officer: true,
    site_manager: true,
    inventory_manager: true,
    actions: true,
  });

  const navigate = useNavigate();
  // Add this state for the modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedDemandForTransfer, setSelectedDemandForTransfer] =
    useState(null);

  // Function to calculate pending quantity
  const calculatePendingQty = (demand) => {
    const quantity = parseFloat(demand.quantity) || 0;
    const approvedQuantity = parseFloat(demand.approved_quantity) || 0;
    return Math.max(0, quantity - approvedQuantity);
  };

  const fetchDemands = async (page = 1) => {
    try {
      setLoading(true);

      // FIX: Ensure pageSize is properly handled for "all" option
      const perPageValue = pageSize === "all" ? 1000 : parseInt(pageSize);

      const params = {
        page,
        per_page: perPageValue,
        search: search || undefined,
        priority: filters.priority || undefined,
        fulfillment_type: filters.fulfillment_type || undefined,
        processing_status: filters.processing_status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
      };

      console.log("API Request Params:", params); // Debug log

      // Remove undefined parameters
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const res = await siteDemandAPI.getAll(params);
      console.log("Site demands fetched:", res);

      if (res && res.data) {
        setDemands(res.data.data || res.data);
        setMeta(res.data.meta || res.meta || {});

        // Debug: Check the actual records count
        const recordsCount = (res.data.data || res.data).length;
        console.log(
          `Records fetched: ${recordsCount}, Page size requested: ${perPageValue}`
        );
      } else if (Array.isArray(res)) {
        setDemands(res);
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: res.length,
          total: res.length,
          from: 1,
          to: res.length,
        });
      } else {
        setDemands([]);
        setMeta({});
      }
    } catch (error) {
      console.error("Error fetching site demands:", error);
      toast.error("Failed to fetch site demands");
      setDemands([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle transfer action
  const handleTransfer = (demand) => {
    setSelectedDemandForTransfer(demand);
    setTransferModalOpen(true);
  };

  // Add this function to handle transfer submission
  const handleTransferSubmit = async (transferData) => {
    try {
      // Use the transferData exactly as it comes from the modal
      const response = await inventoryTransferAPI.create(transferData);

      toast.success("Demand transferred successfully!");
      setTransferModalOpen(false);
      setSelectedDemandForTransfer(null);
      fetchDemands(meta.current_page);
    } catch (error) {
      console.error("Error transferring demand:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to transfer demand";

      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages) =>
          messages.forEach((msg) => toast.error(msg))
        );
      }
    }
  };

  // Bulk approve function for inventory manager
  const handleBulkApprove = async () => {
    if (selectedDemands.size === 0) {
      toast.error("Please select demands to approve");
      return;
    }

    try {
      setBulkApproving(true);

      // Convert Set → Array → Numbers
      const demandIds = Array.from(selectedDemands).map((id) => Number(id));

      console.log("=== BULK APPROVE DEBUG ===");
      console.log("Raw selectedDemands:", selectedDemands);
      console.log("Processed demandIds:", demandIds);
      console.log("Payload structure:", { demand_ids: demandIds });
      console.log("========================");

      const response = await siteDemandAPI.approveByInventoryManager(demandIds);

      if (response.data.success) {
        toast.success(response.data.message);

        const { approved_count, already_approved, errors } = response.data.data;

        if (already_approved.length > 0) {
          toast.warning(
            `${already_approved.length} demand(s) were already approved`
          );
        }

        if (errors.length > 0) {
          errors.forEach((error) => toast.error(error));
        }

        fetchDemands();
        setSelectedDemands(new Set());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Bulk approval failed:", error);

      if (error.response) {
        console.error("Server response:", error.response.data);
        toast.error(`Failed: ${error.response.data.message}`);
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error("Request setup error");
      }
    } finally {
      setBulkApproving(false);
    }
  };

  // Check if user has inventory manager role
  const userHasRole = (role) => {
    // Replace this with your actual role checking logic
    const userRoles = ["inventory_manager", "admin"]; // Example roles
    return userRoles.includes(role);
  };

  // Check if selected demands are eligible for bulk approval
  const areSelectedDemandsEligibleForApproval = () => {
    if (selectedDemands.size === 0) return false;

    const selectedDemandList = demands.filter((demand) =>
      selectedDemands.has(demand.id)
    );

    // Check if all selected demands are approved by site manager and not already approved by inventory manager
    return selectedDemandList.every(
      (demand) => demand.site_manager_id && !demand.inventory_manager_id
    );
  };

  useEffect(() => {
    fetchDemands(1);
  }, [search, filters, pageSize, sortConfig]);

  // Handle column sorting - FIXED FUNCTION
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Get sort icon for column header - FIXED FUNCTION
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col -space-y-1">
          <ChevronUp className="w-3 h-3 opacity-40" />
          <ChevronDown className="w-3 h-3 opacity-40" />
        </div>
      );
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-green-600 font-bold" />
    ) : (
      <ChevronDown className="w-4 h-4 text-green-600 font-bold" />
    );
  };

  // Handle column visibility toggle
  const handleColumnVisibilityChange = (columnKey) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Reset all columns to visible
  const handleShowAllColumns = () => {
    setColumnVisibility({
      demand_no: true,
      date: true,
      item_name: true,
      quantity: true,
      approved_quantity: true,
      pending_qty: true, // NEW COLUMN
      priority: true,
      fulfillment_type: true,
      processing_status: true,
      site_store_officer: true,
      site_manager: true,
      inventory_manager: true,
      actions: true,
    });
  };

  // Check if demand is editable (only Pending status can be edited)
  const isDemandEditable = (demand) => {
    return demand.processing_status === "Pending";
  };

  // Options for filters
  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" },
  ];

  const fulfillmentTypeOptions = [
    { value: "", label: "All Types" },
    { value: "inter_store_transfer", label: "Inter Store Transfer" },
    { value: "site_purchase", label: "Site Purchase" },
    { value: "market_purchase", label: "Market Purchase" },
    { value: "purchase_order", label: "Purchase Order" },
  ];

  // Updated status options with Inter Store Transfer and Site Purchase
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "In Process", label: "In Process" },
    { value: "Completed", label: "Completed" },
    { value: "Rejected", label: "Rejected" },
    { value: "Approved", label: "Approved" },
    { value: "inter_store_transfer", label: "Inter Store Transfer" },
    { value: "site_purchase", label: "Site Purchase" },
    { value: "purchase_order", label: "Purchase Order" },
  ];

  const pageSizeOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "40", label: "40" },
    { value: "all", label: "All" },
  ];

  // Column configuration - ADDED pending_qty
  const columnConfig = [
    { key: "demand_no", label: "Demand No", sortable: true },
    { key: "date", label: "Demand Date", sortable: true },
    { key: "item_name", label: "Item Name", sortable: true },
    { key: "quantity", label: "Qty", sortable: true },
    { key: "approved_quantity", label: "Approved Qty", sortable: true },
    { key: "pending_qty", label: "Pending Qty", sortable: true }, // NEW COLUMN
    { key: "priority", label: "Priority", sortable: true },
    { key: "fulfillment_type", label: "Type", sortable: true },
    { key: "processing_status", label: "Status", sortable: true },
    { key: "site_store_officer", label: "Created By", sortable: false },
    { key: "site_manager", label: "Approved By", sortable: false },
    { key: "inventory_manager", label: "Approved By", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      fontSize: "14px",
      borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "14px",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#16a34a"
        : state.isFocused
        ? "#dcfce7"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#16a34a",
        color: "white",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
  };

  // Multi-select
  const handleSelectDemand = (id) => {
    const newSet = new Set(selectedDemands);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDemands(newSet);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedDemands.size === demands.length) {
      setSelectedDemands(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(demands.map((d) => d.id));
      setSelectedDemands(allIds);
      setIsAllSelected(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this site demand?")) return;
    try {
      await siteDemandAPI.remove(id);
      toast.success("Site demand deleted");
      fetchDemands(meta.current_page);
    } catch {
      toast.error("Failed to delete site demand");
    }
  };

  // Add selected demands to purchase order
  const handleAddToPurchaseOrder = async () => {
    if (selectedDemands.size === 0) {
      toast.error("Please select demands to add to purchase order");
      return;
    }

    try {
      // Filter selected demands that are pending
      const selectedDemandIds = Array.from(selectedDemands);
      const pendingDemands = demands.filter(
        (demand) =>
          selectedDemandIds.includes(demand.id) &&
          demand.processing_status === "Pending"
      );

      if (pendingDemands.length === 0) {
        toast.error("Only pending demands can be added to purchase order");
        return;
      }

      // Here you would typically call your API to create a purchase order
      // For now, we'll show a success message
      toast.success(`Added ${pendingDemands.length} demands to purchase order`);

      // Clear selection after successful operation
      setSelectedDemands(new Set());
      setIsAllSelected(false);

      // Refresh the demands list
      fetchDemands(meta.current_page);
    } catch (error) {
      console.error("Error adding to purchase order:", error);
      toast.error("Failed to add demands to purchase order");
    }
  };

  // Add single demand to purchase order
  const handleAddSingleToPurchaseOrder = async (demand) => {
    if (demand.processing_status !== "Pending") {
      toast.error("Only pending demands can be added to purchase order");
      return;
    }

    try {
      // Here you would typically call your API to add this demand to a purchase order
      toast.success(`Demand ${demand.demand_no} added to purchase order`);

      // Refresh the demands list
      fetchDemands(meta.current_page);
    } catch (error) {
      console.error("Error adding to purchase order:", error);
      toast.error("Failed to add demand to purchase order");
    }
  };

  const handleExport = () => {
    const totalRecords = meta.total || demands.length;
    const currentRecords = demands.length;
    toast.info(`Exporting ${currentRecords}/${totalRecords} records`);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: "",
      fulfillment_type: "",
      processing_status: "",
      date_from: "",
      date_to: "",
    });
    setSearch("");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.priority ||
      filters.fulfillment_type ||
      filters.processing_status ||
      filters.date_from ||
      filters.date_to ||
      search
    );
  };

  // Enhanced pagination number generation
  const generatePageNumbers = () => {
    if (!meta.last_page || meta.last_page <= 1) return [];

    const pages = [];
    const current = meta.current_page;
    const last = meta.last_page;
    const delta = 1; // Show fewer pages for cleaner look

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, current - delta);
    let rangeEnd = Math.min(last - 1, current + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add page numbers in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < last - 1) {
      pages.push("...");
    }

    // Always show last page if there is more than one page
    if (last > 1) {
      pages.push(last);
    }

    return pages;
  };

  // Updated status badge with new statuses
  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Process": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Approved: "bg-green-100 text-green-800",
      inter_store_transfer: "bg-purple-100 text-purple-800",
      site_purchase: "bg-orange-100 text-orange-800",
      purchase_order: "bg-indigo-100 text-indigo-800",
    };

    // Format display text for status
    const statusText = {
      inter_store_transfer: "Inter Store Transfer",
      site_purchase: "Site Purchase",
      purchase_order: "Purchase Order",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          priorityStyles[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority}
      </span>
    );
  };

  // Pending quantity badge - NEW FUNCTION
  const getPendingQtyBadge = (demand) => {
    const pendingQty = calculatePendingQty(demand);

    let badgeClass = "bg-gray-100 text-gray-800";
    if (pendingQty > 0) {
      badgeClass = "bg-orange-100 text-orange-800";
    }
    if (pendingQty === 0) {
      badgeClass = "bg-green-100 text-green-800";
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
      >
        <Clock className="w-3 h-3" />
        {pendingQty}
      </span>
    );
  };

  const getUserBadge = (user, type) => {
    if (!user) return null;

    const icons = {
      site_store_officer: <User className="w-3 h-3" />,
      site_manager: <Building className="w-3 h-3" />,
      inventory_manager: <Warehouse className="w-3 h-3" />,
    };

    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {icons[type]}
        <span>{user.name}</span>
      </div>
    );
  };

  const ActionDropdown = ({ demand }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white shadow-lg border border-gray-200 rounded-lg"
      >
        <DropdownMenuItem
          onClick={() => navigate(`/site-demands/show/${demand.id}`)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <Eye className="h-4 w-4" />
          <span>Approve</span>
        </DropdownMenuItem>

        {/* Transfer option - only for inter_store_transfer type */}
        {demand.fulfillment_type === "inter_store_transfer" && (
          <DropdownMenuItem
            onClick={() => handleTransfer(demand)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-purple-600"
          >
            <Truck className="h-4 w-4" />
            <span>Transfer</span>
          </DropdownMenuItem>
        )}
        {demand.fulfillment_type === "site_purchase" && (
          <DropdownMenuItem
            onClick={() =>
              navigate("/site-purchase/create", {
                state: { demandId: demand.id },
              })
            }
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-purple-600"
          >
            <Truck className="h-4 w-4" />
            <span>Site Purchase</span>
          </DropdownMenuItem>
        )}

        {/* Edit action - only enabled for Pending status */}
        {isDemandEditable(demand) ? (
          <DropdownMenuItem
            onClick={() => navigate(`/site-demands/edit/${demand.id}`)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 px-3 py-2 cursor-not-allowed text-gray-400 opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>Edit (Locked)</span>
          </DropdownMenuItem>
        )}

        {/* Delete action - only enabled for Pending status */}
        {isDemandEditable(demand) ? (
          <DropdownMenuItem
            onClick={() => handleDelete(demand.id)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2 px-3 py-2 cursor-not-allowed text-gray-400 opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>Delete (Locked)</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Calculate records info for export button
  const totalRecords = meta.total || demands.length;
  const currentRecords = demands.length;
  const recordsInfo = `${currentRecords}/${totalRecords}`;

  // Get current values for react-select
  const currentPriorityValue =
    priorityOptions.find((option) => option.value === filters.priority) || null;
  const currentFulfillmentValue =
    fulfillmentTypeOptions.find(
      (option) => option.value === filters.fulfillment_type
    ) || null;
  const currentStatusValue =
    statusOptions.find(
      (option) => option.value === filters.processing_status
    ) || null;
  const currentPageSizeValue =
    pageSizeOptions.find((option) => option.value === pageSize.toString()) ||
    pageSizeOptions[1];

  // Count visible columns for responsive display
  const visibleColumnsCount =
    Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="h-full">
      {/* Full Width Container */}
      <div className="w-full mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Site Demands
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage site material demands and requests
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 bg-primary-color hover:bg-primary-color text-white shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export ({recordsInfo})
                  </Button>

                  {selectedDemands.size > 0 && (
                    <>
                      {/* Bulk Approve Button for Inventory Manager */}
                      {userHasRole("inventory_manager") &&
                        hasPermission("approve_sitedemand") &&
                        areSelectedDemandsEligibleForApproval() && (
                          <Button
                            onClick={handleBulkApprove}
                            disabled={bulkApproving}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm"
                          >
                            {bulkApproving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <ThumbsUp className="w-4 h-4" />
                                Approve ({selectedDemands.size})
                              </>
                            )}
                          </Button>
                        )}
                    </>
                  )}
                  {hasPermission("create_sitedemand") && (
                    <Button
                      onClick={() => navigate("/site-demands/add")}
                      className="bg-primary-color hover:bg-primary-color-hover text-white flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Demand
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Card */}
            <Card className="w-full shadow-sm border border-gray-200 bg-white">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {/* Center - Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    {/* Priority Filter */}
                    <div className="w-full sm:w-40">
                      <Select
                        options={priorityOptions}
                        value={currentPriorityValue}
                        onChange={(selectedOption) =>
                          handleFilterChange(
                            "priority",
                            selectedOption?.value || ""
                          )
                        }
                        placeholder="Priority"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    {/* Fulfillment Type Filter */}
                    <div className="w-full sm:w-48">
                      <Select
                        options={fulfillmentTypeOptions}
                        value={currentFulfillmentValue}
                        onChange={(selectedOption) =>
                          handleFilterChange(
                            "fulfillment_type",
                            selectedOption?.value || ""
                          )
                        }
                        placeholder="Fulfillment Type"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-40">
                      <Select
                        options={statusOptions}
                        value={currentStatusValue}
                        onChange={(selectedOption) =>
                          handleFilterChange(
                            "processing_status",
                            selectedOption?.value || ""
                          )
                        }
                        placeholder="Status"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    {/* Date From Filter */}
                    <div className="w-full sm:w-40">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="date"
                          value={filters.date_from}
                          onChange={(e) =>
                            handleFilterChange("date_from", e.target.value)
                          }
                          className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
                          placeholder="From Date"
                        />
                      </div>
                    </div>

                    {/* Date To Filter */}
                    <div className="w-full sm:w-40">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="date"
                          value={filters.date_to}
                          onChange={(e) =>
                            handleFilterChange("date_to", e.target.value)
                          }
                          className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
                          placeholder="To Date"
                        />
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters() && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="h-10 px-4 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Column Settings */}
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 border border-gray-300 bg-white hover:bg-green-50 flex items-center gap-2 transition-colors shadow-sm"
                        >
                          <Settings className="w-4 h-4 text-gray-700" />
                          <span className="text-gray-700"></span>
                          <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            {visibleColumnsCount}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 bg-white shadow-xl border border-gray-300 rounded-md max-h-96 overflow-y-auto z-[100]"
                        sideOffset={5}
                      >
                        <DropdownMenuLabel className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Columns className="w-4 h-4 text-gray-600" />
                            <span>Table Columns</span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowAllColumns();
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                          >
                            Show All
                          </Button>
                        </DropdownMenuLabel>

                        <DropdownMenuGroup className="p-2 space-y-1">
                          {columnConfig.map((column) => (
                            <div
                              key={column.key}
                              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                              onClick={() =>
                                handleColumnVisibilityChange(column.key)
                              }
                            >
                              <Checkbox
                                checked={columnVisibility[column.key]}
                                onCheckedChange={() => {}}
                                className="cursor-pointer data-[state=checked]:bg-green-600"
                              />
                              <span className="text-sm text-gray-700 flex-1 font-medium">
                                {column.label}
                              </span>
                              {column.sortable && (
                                <ChevronUp className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-gray-200" />

                        <div className="p-3 bg-gray-50 rounded-b-md">
                          <div className="text-xs text-gray-600 text-center font-medium">
                            {visibleColumnsCount} of {columnConfig.length}{" "}
                            columns visible
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Right Side - Page Size */}
                  <div className="w-full sm:w-40">
                    <Select
                      options={pageSizeOptions}
                      value={currentPageSizeValue}
                      onChange={(selectedOption) =>
                        setPageSize(
                          selectedOption.value === "all"
                            ? "all"
                            : Number(selectedOption.value)
                        )
                      }
                      styles={customStyles}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 w-full">
                {loading ? (
                  <div className="flex justify-center items-center py-12 w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Full Width Table Container */}
                    <div className="w-full overflow-x-auto">
                      <Table className="w-full min-w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12 py-3 px-4">
                              <Checkbox
                                checked={
                                  isAllSelected ||
                                  (selectedDemands.size > 0 &&
                                    selectedDemands.size === demands.length)
                                }
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>

                            {/* Dynamic Headers based on visibility */}
                            {columnConfig.map(
                              (column) =>
                                columnVisibility[column.key] && (
                                  <TableHead
                                    key={column.key}
                                    className={`py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap ${
                                      column.sortable
                                        ? "cursor-pointer hover:bg-gray-100 transition-colors group"
                                        : ""
                                    }`}
                                    onClick={
                                      column.sortable
                                        ? () => handleSort(column.key)
                                        : undefined
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{column.label}</span>
                                      {column.sortable && (
                                        <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity ml-2">
                                          {getSortIcon(column.key)}
                                        </div>
                                      )}
                                    </div>
                                  </TableHead>
                                )
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {demands.length > 0 ? (
                            demands.map((demand) => (
                              <TableRow
                                key={demand.id}
                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <TableCell className="py-3 px-4">
                                  <Checkbox
                                    checked={selectedDemands.has(demand.id)}
                                    onCheckedChange={() =>
                                      handleSelectDemand(demand.id)
                                    }
                                  />
                                </TableCell>

                                {/* Dynamic Cells based on visibility */}
                                {columnVisibility.demand_no && (
                                  <TableCell className="py-3 px-4 font-mono text-sm text-gray-700 font-semibold">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/site-demands/track/${demand.id}`
                                        )
                                      }
                                      className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline font-semibold text-left w-full"
                                    >
                                      {demand.demand_no}
                                    </button>
                                  </TableCell>
                                )}

                                {columnVisibility.date && (
                                  <TableCell className="py-3 px-4 font-mono text-sm text-gray-700 font-semibold">
                                    {demand.date
                                      ? new Date(
                                          demand.date
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "-"}
                                  </TableCell>
                                )}

                                {columnVisibility.item_name && (
                                  <TableCell className="py-3 px-4 font-medium text-gray-900">
                                    {demand.item_name}
                                  </TableCell>
                                )}

                                {columnVisibility.quantity && (
                                  <TableCell className="py-3 px-4 font-medium text-gray-900">
                                    {demand.quantity}
                                  </TableCell>
                                )}

                                {columnVisibility.approved_quantity && (
                                  <TableCell className="py-3 px-4 font-medium text-gray-900">
                                    {demand.approved_quantity
                                      ? demand.approved_quantity
                                      : "-"}
                                  </TableCell>
                                )}

                                {/* NEW: Pending Quantity Column */}
                                {columnVisibility.pending_qty && (
                                  <TableCell className="py-3 px-4">
                                    {getPendingQtyBadge(demand)}
                                  </TableCell>
                                )}

                                {columnVisibility.priority && (
                                  <TableCell className="py-3 px-4">
                                    {getPriorityBadge(demand.priority)}
                                  </TableCell>
                                )}

                                {columnVisibility.fulfillment_type && (
                                  <TableCell className="py-3 px-4 text-gray-700 capitalize">
                                    {demand.fulfillment_type?.replace("_", " ")}
                                  </TableCell>
                                )}

                                {columnVisibility.processing_status && (
                                  <TableCell className="py-3 px-4">
                                    {getStatusBadge(demand.processing_status)}
                                  </TableCell>
                                )}

                                {columnVisibility.site_store_officer && (
                                  <TableCell className="py-3 px-4">
                                    {getUserBadge(
                                      demand.site_store_officer,
                                      "site_store_officer"
                                    )}
                                  </TableCell>
                                )}

                                {columnVisibility.site_manager && (
                                  <TableCell className="py-3 px-4">
                                    {getUserBadge(
                                      demand.site_manager,
                                      "site_manager"
                                    )}
                                  </TableCell>
                                )}

                                {columnVisibility.inventory_manager && (
                                  <TableCell className="py-3 px-4">
                                    {getUserBadge(
                                      demand.inventory_manager,
                                      "inventory_manager"
                                    )}
                                  </TableCell>
                                )}

                                {columnVisibility.actions && (
                                  <TableCell className="py-3 px-4 text-right">
                                    <ActionDropdown demand={demand} />
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={
                                  Object.values(columnVisibility).filter(
                                    Boolean
                                  ).length + 1
                                }
                                className="text-center py-8 text-gray-500"
                              >
                                No site demands found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Full Width Pagination */}
                    {meta && meta.last_page > 1 && (
                      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Showing {meta.from || 1} to{" "}
                          {meta.to || demands.length} of{" "}
                          {meta.total || demands.length} demands
                        </div>

                        {/* Enhanced Pagination with Better Controls */}
                        <div className="flex items-center gap-2">
                          {/* Previous Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchDemands(meta.current_page - 1)}
                            disabled={
                              !meta.prev_page_url || meta.current_page === 1
                            }
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Previous</span>
                          </Button>

                          {/* Page Numbers - Enhanced */}
                          <div className="flex items-center gap-1">
                            {generatePageNumbers().map((pageNum, index) =>
                              pageNum === "..." ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 py-1 text-gray-500 font-medium"
                                >
                                  ...
                                </span>
                              ) : (
                                <Button
                                  key={pageNum}
                                  variant={
                                    pageNum === meta.current_page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => fetchDemands(pageNum)}
                                  className={`h-9 min-w-9 px-3 font-medium transition-all ${
                                    pageNum === meta.current_page
                                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm"
                                      : "border-gray-300 hover:bg-green-50 text-gray-700 hover:text-green-700 hover:border-green-300"
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              )
                            )}
                          </div>

                          {/* Next Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchDemands(meta.current_page + 1)}
                            disabled={
                              !meta.next_page_url ||
                              meta.current_page === meta.last_page
                            }
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>

                          {/* Page Info */}
                          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm">
                            <span className="text-sm text-gray-600">Page</span>
                            <span className="font-semibold text-green-600 text-sm">
                              {meta.current_page}
                            </span>
                            <span className="text-sm text-gray-500">
                              of {meta.last_page}
                            </span>
                          </div>
                        </div>

                        {/* Records Per Page Info */}
                        <div className="text-xs text-gray-500 hidden lg:block">
                          {pageSize === "all"
                            ? "Showing all records"
                            : `${pageSize} per page`}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

      {/* Transfer Modal */}
      <InterStoreTransfer
        isOpen={transferModalOpen}
        onClose={() => {
          setTransferModalOpen(false);
          setSelectedDemandForTransfer(null);
        }}
        onSubmit={handleTransferSubmit}
        demand={selectedDemandForTransfer}
      />
    </div>
  );
};

export default SiteDemandIndex;
