import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import interTransferAPI from "../../lib/InventoryTransferAPI";
import locationAPI from "../../lib/locationAPI";
import { Link } from "react-router-dom";

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
  CheckSquare,
  Square,
  ChevronDownIcon,
  Package,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
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

const InterTransferIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [locations, setLocations] = useState([]);

  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const [pageSize, setPageSize] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const initialFilterOptions = [
    {
      id: "all",
      label: "All",
      color: "bg-indigo-500",
      count: 0,
    },
    {
      id: "pending",
      label: "Pending",
      color: "bg-yellow-500",
      count: 0,
    },
    {
      id: "waiting_transit",
      label: "Waiting Transit",
      color: "bg-blue-500",
      count: 0,
    },
    {
      id: "completed",
      label: "Completed",
      color: "bg-green-500",
      count: 0,
    },
  ];

  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
  const [activeFilter, setActiveFilter] = useState("all");

  const columnConfig = [
    { key: "demand_no", label: "Demand No", sortable: true },
    { key: "date", label: "Demand Date", sortable: true },
    { key: "required_date", label: "Required Date", sortable: true },
    { key: "location", label: "Location", sortable: false },
    { key: "item_name", label: "Item Name", sortable: true },
    { key: "total_qty", label: "A.Q", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
    { key: "processing_status", label: "Status", sortable: false },
    { key: "site_store_officer", label: "Store Officer", sortable: false },
    { key: "site_manager", label: "Site Manager", sortable: false },
    { key: "inventory_manager", label: "Inventory Manager", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const [columnVisibility, setColumnVisibility] = useState({
    demand_no: true,
    date: true,
    required_date: true,
    location: true,
    item_name: true,
    total_qty: true,
    priority: true,
    processing_status: true,
    site_store_officer: true,
    site_manager: true,
    inventory_manager: true,
    actions: true,
  });

  const navigate = useNavigate();

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pageSize === "all" ? 1000 : pageSize,
          search: search || undefined,
          priority: filters.priority || undefined,
          status: filters.status || undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          sort_by: sortConfig.key,
          sort_order: sortConfig.direction,
        };

        // Map activeFilter to correct API field
        if (activeFilter !== "all") {
          if (activeFilter === "waiting_transit") {
            params.processing_status = "waiting_transit";
            delete params.status; // remove status so API doesn't conflict
          } else {
            params.status = activeFilter;
            delete params.processing_status;
          }
        }

        Object.keys(params).forEach((key) => {
          if (params[key] === undefined || params[key] === "") {
            delete params[key];
          }
        });

        const response = await interTransferAPI.getInterTransferDemand(params);

        if (response && response.data) {
          setData(response.data.data || response.data);
          setMeta(
            response.data.meta || {
              current_page: response.current_page || page,
              last_page: response.last_page || 1,
              per_page: response.per_page || pageSize,
              total: response.total || response.data.length,
              from: response.from || 1,
              to: response.to || response.data.length,
            }
          );
        } else {
          setData(response || []);
          setMeta({
            current_page: 1,
            last_page: 1,
            per_page: pageSize,
            total: response?.length || 0,
            from: 1,
            to: response?.length || 0,
          });
        }
      } catch (error) {
        toast.error("Failed to fetch inter-transfer demands");
        console.error("Error fetching data:", error);
        setData([]);
        setMeta({});
      } finally {
        setLoading(false);
      }
    },
    [search, filters, pageSize, sortConfig, activeFilter]
  );

  const fetchLocations = async () => {
    try {
      const locationsData = await locationAPI.getAll();
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchCounts = async () => {
    try {
      const counts = await interTransferAPI.getCounts();
      console.log("Counts from API:", counts);

      // Merge API counts with local counts fallback
      const localCounts = {
        all: data.length,
        pending: data.filter((d) => d.status === "pending").length,
        waiting_transit: data.filter(
          (d) => d.processing_status === "waiting_transit"
        ).length,
        completed: data.filter((d) => d.status === "completed").length,
      };

      // Set filter options counts: use API counts if exists, otherwise fallback to localCounts
      setFilterOptions((prev) =>
        prev.map((option) => ({
          ...option,
          count:
            counts && counts[option.id] !== undefined
              ? counts[option.id]
              : localCounts[option.id] || 0,
        }))
      );
    } catch (error) {
      console.error(
        "Error fetching counts, falling back to local data:",
        error
      );

      // Fallback to local data if API fails
      const localCounts = {
        all: data.length,
        pending: data.filter((d) => d.status === "pending").length,
        waiting_transit: data.filter(
          (d) => d.processing_status === "waiting_transit"
        ).length,
        completed: data.filter((d) => d.status === "completed").length,
      };

      setFilterOptions((prev) =>
        prev.map((option) => ({
          ...option,
          count: localCounts[option.id] || 0,
        }))
      );
    }
  };

  useEffect(() => {
    fetchData(1);
    fetchLocations();
  }, [fetchData]);

  useEffect(() => {
    fetchCounts();
  }, [data]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

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

  const handleColumnVisibilityChange = (columnKey) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleShowAllColumns = () => {
    const newVisibility = {};
    Object.keys(columnVisibility).forEach((key) => {
      newVisibility[key] = true;
    });
    setColumnVisibility(newVisibility);
  };

  const pageSizeOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "40", label: "40" },
    { value: "all", label: "All" },
  ];

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

  const handleSelectItem = (id) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedItems.size === data.length) {
      setSelectedItems(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(data.map((d) => d.id));
      setSelectedItems(allIds);
      setIsAllSelected(true);
    }
  };

  // Add this function to your InterTransferIndex component
  const handleBulkStatusUpdate = async () => {
    if (selectedItems.size === 0) {
      toast.warning("Please select at least one item to update");
      return;
    }

    if (
      !window.confirm(
        `Update processing status of ${selectedItems.size} selected item(s) to "Waiting Transit"?`
      )
    ) {
      return;
    }

    try {
      // Convert Set to Array
      const selectedIds = Array.from(selectedItems);

      // Call the API
      const response = await interTransferAPI.bulkUpdateStatus(
        selectedIds,
        "waiting_transit"
      );

      if (response.success) {
        toast.success(
          `${selectedItems.size} item(s) updated to Waiting Transit`
        );

        // Clear selection
        setSelectedItems(new Set());
        setIsAllSelected(false);

        // Refresh data
        fetchData(meta.current_page);
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating bulk status:", error);
      toast.error("Failed to update processing status");
    }
  };

  // Add this function to clear selection
  const clearSelection = () => {
    setSelectedItems(new Set());
    setIsAllSelected(false);
  };

  // Add this function to select filtered items
  const handleSelectFiltered = () => {
    const currentPageIds = data.map((item) => item.id);
    const newSet = new Set(currentPageIds);
    setSelectedItems(newSet);
    setIsAllSelected(newSet.size === data.length);
  };

  const handleExport = () => {
    const totalRecords = meta.total || data.length;
    const currentRecords = data.length;
    toast.info(`Exporting ${currentRecords}/${totalRecords} records`);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  const clearFilters = () => {
    setFilters({
      priority: "",
      status: "",
      date_from: "",
      date_to: "",
    });
    setSearch("");
    setActiveFilter("all");
  };

  const hasActiveFilters = () => {
    return (
      filters.priority ||
      filters.status ||
      filters.date_from ||
      filters.date_to ||
      search ||
      activeFilter !== "all"
    );
  };

  const generatePageNumbers = (paginationMeta) => {
    if (!paginationMeta.last_page || paginationMeta.last_page <= 1) return [];

    const pages = [];
    const current = paginationMeta.current_page;
    const last = paginationMeta.last_page;
    const delta = 2;

    for (let i = 1; i <= last; i++) {
      if (
        i === 1 ||
        i === last ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
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

  // Add this helper function
  const calculateInterTransferQty = (item) => {
    if (!item.fulfillment_types || !Array.isArray(item.fulfillment_types)) {
      console.log(`Item ${item.id}: No fulfillment types found`);
      return 0;
    }

    // Sum qty from fulfillment types where location_id exists (not null)
    // This represents inter-transfer quantities
    const interTransferQty = item.fulfillment_types.reduce(
      (sum, fulfillment) => {
        // Check if location_id exists (not null)
        if (
          fulfillment.location_id !== null &&
          fulfillment.location_id !== undefined
        ) {
          const qty = parseFloat(fulfillment.qty) || 0;
          console.log(`Item ${item.id}: Inter-transfer fulfillment`, {
            fulfillmentId: fulfillment.id,
            locationId: fulfillment.location_id,
            qty: qty,
            type: fulfillment.type,
          });
          return sum + qty;
        }
        return sum;
      },
      0
    );

    console.log(
      `Item ${item.id}: Total Inter-Transfer Qty = ${interTransferQty}`
    );
    return interTransferQty;
  };

  // Update the getCellData function to use this helper
  // Keep original fetchData function, no flattening needed

  // Update getCellData function
  const getCellData = (item, columnKey) => {
    switch (columnKey) {
      case "demand_no":
        return (
          <Link
            to={`/inter-transfer/show/${item.id}`}
            className="text-primary-color font-semibold hover:underline hover:text-blue-700 transition"
          >
            {item.demand_no || item.transfer_no || "-"}
          </Link>
        );
      case "date":
        return item.date
          ? new Date(item.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      case "required_date":
        return item.required_date
          ? new Date(item.required_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      case "location":
        // Show source location (demand location)
        return item.location?.name || item.source_location?.name || "-";
      case "item_name":
        return (
          <div>
            <div className="font-medium">{item.item_name}</div>
            {item.inventory_item?.item_code && (
              <div className="text-xs text-gray-500">
                Code: {item.inventory_item.item_code}
              </div>
            )}
          </div>
        );
      case "total_qty":
        // Show all location quantities in a dropdown or expandable format
        if (!item.fulfillment_types || !Array.isArray(item.fulfillment_types)) {
          return "-";
        }

        // Get all inter-transfer fulfillments (location_id exists)
        const interTransferFulfillments = item.fulfillment_types.filter(
          (ft) => ft.location_id && ft.type === null
        );

        if (interTransferFulfillments.length === 0) {
          return "-";
        }

        const totalQty = interTransferFulfillments.reduce(
          (sum, ft) => sum + (parseFloat(ft.qty) || 0),
          0
        );

        // Create location map for easier lookup
        const locationMap = locations.reduce((map, loc) => {
          map[loc.id] = loc.name;
          return map;
        }, {});

        return (
          <div className="group relative">
            <div className="font-medium cursor-pointer hover:text-green-700 transition">
              {totalQty.toFixed(2)}
              <span className="text-xs text-gray-500 ml-2">
                ({interTransferFulfillments.length} locations)
              </span>
            </div>

            {/* Location breakdown tooltip */}
            <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3">
                <div className="font-medium text-sm text-gray-900 mb-2">
                  Inter-Transfer Quantities
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {interTransferFulfillments.map((ft, index) => (
                    <div
                      key={ft.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          {locationMap[ft.location_id] ||
                            `Location ${ft.location_id}`}
                        </span>
                      </div>
                      <span className="font-medium text-green-600">
                        {parseFloat(ft.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{totalQty.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "priority":
        return getPriorityBadge(item.priority);
      case "processing_status":
        return item.processing_status || "-";
      case "site_store_officer":
        return getUserBadge(item.site_store_officer, "site_store_officer");
      case "site_manager":
        return getUserBadge(item.site_manager, "site_manager");
      case "inventory_manager":
        return getUserBadge(item.inventory_manager, "inventory_manager");
      default:
        return "-";
    }
  };

  const ActionDropdown = ({ item }) => (
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
          onClick={() => navigate(`/inter-transfer/show/${item.id}`)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const totalRecords = meta.total || data.length;
  const currentRecords = data.length;
  const recordsInfo = `${currentRecords}/${totalRecords}`;

  const currentPageSizeValue =
    pageSizeOptions.find((option) => option.value === pageSize.toString()) ||
    pageSizeOptions[1];

  const visibleColumnsCount =
    Object.values(columnVisibility).filter(Boolean).length;
  const hasSelectedItems = selectedItems.size > 0;

  const renderFilters = () => {
    return (
      <>
        <div className="w-full sm:w-40">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
              placeholder="From Date"
            />
          </div>
        </div>

        <div className="w-full sm:w-40">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
              placeholder="To Date"
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-full min-h-screen bg-white-500">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-1 md:p-2">
          <div className="w-full px-2 md:px-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Inter-Transfer
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage inter-transfer demands between locations
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
                </div>

                <div className="flex gap-2">
                  {hasSelectedItems && (
                    <>
                      <Button
                        onClick={handleBulkStatusUpdate}
                        variant="outline"
                        className="flex items-center gap-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 shadow-sm"
                      >
                        <Truck className="w-4 h-4" />
                        Mark as Waiting Transit ({selectedItems.size})
                      </Button>

                      <Button
                        onClick={clearSelection}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800 shadow-sm"
                      >
                        <CheckSquare className="w-4 h-4" />
                        Clear Selection
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={handleSelectFiltered}
                    variant="outline"
                    className="flex items-center gap-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 shadow-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select All on Page ({data.length})
                  </Button>

                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 bg-primary-color hover:bg-primary-color text-white shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export ({recordsInfo})
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Labels with Colors */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeFilter === filter.id
                      ? "text-white shadow-md"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  } ${activeFilter === filter.id ? filter.color : ""}`}
                >
                  <div className={`w-3 h-3 rounded-full ${filter.color}`}></div>
                  <span>{filter.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.id
                        ? "bg-white text-gray-800"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {/* Search */}
                  <div className="flex-1 w-full sm:max-w-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search transfers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Center - Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    {renderFilters()}

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
                              <span className="text-sm flex-1 font-medium text-gray-700">
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

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12 py-3">
                              <div className="flex items-center">
                                {isAllSelected ||
                                selectedItems.size === data.length ? (
                                  <CheckSquare
                                    className="h-4 w-4 text-primary-color cursor-pointer"
                                    onClick={handleSelectAll}
                                  />
                                ) : (
                                  <Square
                                    className="h-4 w-4 text-gray-400 cursor-pointer"
                                    onClick={handleSelectAll}
                                  />
                                )}
                              </div>
                            </TableHead>

                            {columnConfig.map(
                              (column) =>
                                columnVisibility[column.key] && (
                                  <TableHead
                                    key={column.key}
                                    className={`py-3 text-left font-semibold text-gray-700 ${
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
                          {data.length > 0 ? (
                            data.map((item) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <TableCell className="py-3">
                                  <div className="flex items-center">
                                    {selectedItems.has(item.id) ? (
                                      <CheckSquare
                                        className="h-4 w-4 text-primary-color cursor-pointer"
                                        onClick={() =>
                                          handleSelectItem(item.id)
                                        }
                                      />
                                    ) : (
                                      <Square
                                        className="h-4 w-4 text-gray-400 cursor-pointer"
                                        onClick={() =>
                                          handleSelectItem(item.id)
                                        }
                                      />
                                    )}
                                  </div>
                                </TableCell>

                                {columnConfig.map(
                                  (column) =>
                                    columnVisibility[column.key] && (
                                      <TableCell
                                        key={column.key}
                                        className="py-3 text-sm text-gray-700"
                                      >
                                        {column.key === "actions" ? (
                                          <ActionDropdown item={item} />
                                        ) : column.key === "demand_no" ? (
                                          <Link
                                            to={`/inter-transfer/show/${item.id}`}
                                            className="text-primary-color font-semibold hover:underline hover:text-blue-700 transition"
                                          >
                                            {getCellData(item, column.key)}
                                          </Link>
                                        ) : (
                                          getCellData(item, column.key)
                                        )}
                                      </TableCell>
                                    )
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
                                No inter-transfer demands found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {meta && meta.last_page > 1 ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Showing {meta.from || 1} to {meta.to || data.length}{" "}
                          of {meta.total || data.length} records
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center gap-2">
                          {/* Previous Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchData(meta.current_page - 1)}
                            disabled={!meta.prev_page_url}
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Prev</span>
                          </Button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {generatePageNumbers(meta).map((pageNum, index) =>
                              pageNum === "..." ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 text-gray-500"
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
                                  onClick={() => fetchData(pageNum)}
                                  className={`h-9 w-9 p-0 font-medium ${
                                    pageNum === meta.current_page
                                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                      : "border-gray-300 hover:bg-green-50 text-gray-700"
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
                            onClick={() => fetchData(meta.current_page + 1)}
                            disabled={!meta.next_page_url}
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterTransferIndex;
