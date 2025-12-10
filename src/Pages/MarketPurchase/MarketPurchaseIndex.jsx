import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import locationAPI from "../../lib/locationAPI";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi";
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
import ItemPurchaseModel from "./ItemPurchaseModel";
import MarketPurchaseNoteModel from "./MarketPurchaseNoteModel";
import EstimatePriceModel from "./EstimatePriceModel";
import PurchaserModel from "./PurchaserModel";
import ScheduleTable from "./TableData/ScheduleTable";
import MarketPurchaseDatatable from "./TableData/MarketPurchaseDatatable";
import MPNDatatable from "./TableData/MPNDatatable";
import MPNOrderedDataTable from "./TableData/MPOrderedDataTable";
import OrderedModel from "./OrderedModel";
import GenerateOrderMPNModel from "./GenerateOrderMPNModel";

const MarketPurchaseIndex = () => {
  const [demands, setDemands] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [meta, setMeta] = useState({});
  const [scheduleMeta, setScheduleMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDemands, setSelectedDemands] = useState(new Set());
  const [selectedSchedules, setSelectedSchedules] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEstimatePriceModal, setShowEstimatePriceModal] = useState(false);
  const [showPurchaserModal, setShowPurchaserModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showScheduleTable, setShowScheduleTable] = useState(false);
  //hook for marketpurchase mpn and purchases
  const [marketPurchaseData, setMarketPurchaseData] = useState([]);
  const [mpnData, setMpnData] = useState([]);
  const [marketPurchaseMeta, setMarketPurchaseMeta] = useState({});
  const [mpnMeta, setMpnMeta] = useState({});
  const [marketPurchaseLoading, setMarketPurchaseLoading] = useState(false);
  const [mpnLoading, setMpnLoading] = useState(false);
  //hook for marketpurchase ordered data
  const [orderedData, setOrderedData] = useState([]);
  const [orderedMeta, setOrderedMeta] = useState({});
  const [orderedLoading, setOrderedLoading] = useState(false);
  const [showOrderedModal, setShowOrderedModal] = useState(false);
  const [showGenerateOrderMPNModal, setShowGenerateOrderMPNModal] =
    useState(false);

  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    date_from: "",
    date_to: "",
    mpn_no: "",
    vendor_id: "",
  });

  const [pageSize, setPageSize] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const calculateApprovedQty = (demand) => {
    if (!demand.fulfillment_types || !Array.isArray(demand.fulfillment_types)) {
      console.log(`Demand ${demand.id}: No fulfillment types found`);
      return 0;
    }

    const marketPurchaseFulfillment = demand.fulfillment_types.find(
      (ft) => ft.type === "market_purchase"
    );

    const approvedQty = marketPurchaseFulfillment
      ? parseFloat(marketPurchaseFulfillment.qty) || 0
      : 0;

    console.log(`Demand ${demand.id}: Approved Qty Calculation`, {
      fulfillmentTypes: demand.fulfillment_types,
      marketPurchaseFulfillment,
      approvedQty,
    });

    return approvedQty;
  };

  const calculateTotalScheduledQty = (demand) => {
    if (
      !demand.purchase_schedules ||
      !Array.isArray(demand.purchase_schedules)
    ) {
      console.log(`Demand ${demand.id}: No purchase schedules found`);
      return 0;
    }

    const totalScheduled = demand.purchase_schedules.reduce((sum, schedule) => {
      const scheduledQty = parseFloat(schedule.scheduled_qty) || 0;
      console.log(`Schedule ${schedule.id}: Scheduled Qty`, scheduledQty);
      return sum + scheduledQty;
    }, 0);

    console.log(`Demand ${demand.id}: Total Scheduled Qty`, {
      totalScheduled,
      scheduleCount: demand.purchase_schedules.length,
      schedules: demand.purchase_schedules.map((s) => ({
        id: s.id,
        scheduled_qty: s.scheduled_qty,
      })),
    });

    return totalScheduled;
  };
  // Calculate total purchased quantity from ALL market_purchases for this demand
  const calculateTotalPurchasedQty = (demand) => {
    if (
      !demand.purchase_schedules ||
      !Array.isArray(demand.purchase_schedules)
    ) {
      return 0;
    }

    let totalPurchased = 0;

    demand.purchase_schedules.forEach((schedule) => {
      if (
        schedule.market_purchases &&
        Array.isArray(schedule.market_purchases)
      ) {
        schedule.market_purchases.forEach((purchase) => {
          const purchaseQty = parseFloat(purchase.actual_purchase_qty) || 0;
          totalPurchased += purchaseQty;
        });
      }
    });

    console.log(`Demand ${demand.id}: Total Purchased Qty =`, totalPurchased);
    return totalPurchased;
  };

  // Calculate pending schedule quantity (approved_qty - total_scheduled_qty)
  const calculatePendingScheduleQty = (demand) => {
    const approvedQty = calculateApprovedQty(demand);
    const totalScheduledQty = calculateTotalScheduledQty(demand);
    const pendingScheduleQty = Math.max(0, approvedQty - totalScheduledQty);

    console.log(`Demand ${demand.id}: Pending Schedule Calculation`, {
      approvedQty,
      totalScheduledQty,
      pendingScheduleQty,
      formula: `${approvedQty} - ${totalScheduledQty} = ${pendingScheduleQty}`,
    });

    return pendingScheduleQty;
  };
  // Calculate pending purchase quantity (total_scheduled_qty - total_purchased_qty)
  const calculatePendingPurchaseQty = (demand) => {
    const totalScheduledQty = calculateTotalScheduledQty(demand);
    const totalPurchaseQty = calculateTotalPurchasedQty(demand);
    const pendingPurchaseQty = Math.max(
      0,
      totalScheduledQty - totalPurchaseQty
    );
    return pendingPurchaseQty;
  };

  // Legacy function for backward compatibility - FIXED
  const calculatePendingQty = (demand) => {
    return calculatePendingPurchaseQty(demand);
  };
  const initialFilterOptions = [
    {
      id: "all",
      label: "All",
      color: "bg-indigo-500",
      count: 0,
    },
    {
      id: "pending_schedule",
      label: "Schedule",
      color: "bg-yellow-500",
      count: 0,
    },

    {
      id: "ordered",
      label: "Ordered",
      color: "bg-green-500",
      count: 0,
    },
    {
      id: "purchases_pending_mpn",
      label: "Purchases/Pending MPN",
      color: "bg-orange-500",
      count: 0,
    },
    {
      id: "mpn",
      label: "MPN",
      color: "bg-purple-500",
      count: 0,
    },
    {
      id: "closed",
      label: "Closed",
      color: "bg-gray-500",
      count: 0,
    },
  ];

  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);

  const minimalColumns = [
    "mnp_no",
    "item_name",
    "total_qty",
    "scheduled_qty",
    "purchase_qty",
    "pending_qty",
    "actual_purchase_qty",
    "price",
    "purchase_amount",
    "vendor",
    "invoice_attachment",
    "actions",
  ];

  const [columnVisibility, setColumnVisibility] = useState({
    demand_no: true,
    date: true,
    required_date: true,
    location: true,
    item_name: true,
    total_qty: true,
    scheduled_qty: true,
    total_purchase_qty: true,
    pending_qty: true,
    pending_purchase_qty: true,
    priority: true,
    purpose: true,
    site_store_officer: true,
    site_manager: true,
    inventory_manager: true,
    invoice_attachment: true,
    actions: true,
  });

  useEffect(() => {
    if (activeFilter === "mpn") {
      const newVisibility = {};
      Object.keys(columnVisibility).forEach((key) => {
        newVisibility[key] = minimalColumns.includes(key);
      });
      setColumnVisibility(newVisibility);
    } else {
      const newVisibility = {};
      Object.keys(columnVisibility).forEach((key) => {
        newVisibility[key] = true;
      });
      setColumnVisibility(newVisibility);
    }
  }, [activeFilter]);

  const navigate = useNavigate();

  const fetchDemands = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        mpn_no: filters.mpn_no || undefined,
        vendor_id: filters.vendor_id || undefined,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
      };

      if (activeFilter !== "all") {
        params[activeFilter] = true;
      }

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      console.log("Fetching demands with params:", params);

      let res;
      if (activeFilter === "mpn") {
        res = await marketPurchaseAPI.getMinimalColumns(params);
      } else {
        res = await marketPurchaseAPI.getAll(params);
      }

      console.log("Market demand response:", res);

      if (res && res.data) {
        setDemands(res.data.data || res.data);
        setMeta(res.data.meta || res.meta || {});
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

  const fetchSchedules = async (page = 1) => {
    try {
      setScheduleLoading(true);

      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      console.log("Fetching schedules with params:", params);

      const res = await marketPurchaseAPI.getAllSchedules(params);
      console.log("Schedules response:", res);

      if (res && res.data) {
        setSchedules(res.data.data || res.data);
        setScheduleMeta(res.data.meta || res.meta || {});
      } else {
        setSchedules([]);
        setScheduleMeta({});
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules");
      setSchedules([]);
      setScheduleMeta({});
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await locationAPI.getAll();
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      setVendors([
        { id: 1, name: "Vendor A" },
        { id: 2, name: "Vendor B" },
        { id: 3, name: "Vendor C" },
      ]);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  //fetch mpn and market purchase
  const fetchPendingMPNData = async (page = 1) => {
    try {
      setMarketPurchaseLoading(true);
      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
      };

      const response = await marketPurchaseAPI.getPendingMPN(params);

      if (response && response.data) {
        setMarketPurchaseData(response.data.data || response.data);
        setMarketPurchaseMeta(response.data.meta || response.meta || {});
      } else {
        setMarketPurchaseData([]);
        setMarketPurchaseMeta({});
      }
    } catch (error) {
      console.error("Error fetching pending MPN data:", error);
      toast.error("Failed to fetch pending MPN data");
      setMarketPurchaseData([]);
      setMarketPurchaseMeta({});
    } finally {
      setMarketPurchaseLoading(false);
    }
  };

  const fetchMPNData = async (page = 1) => {
    try {
      setMpnLoading(true);
      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
        mpn_no: filters.mpn_no || undefined,
        vendor_id: filters.vendor_id || undefined,
      };

      const response = await marketPurchaseAPI.getMPNData(params);

      if (response && response.data) {
        setMpnData(response.data.data || response.data);
        setMpnMeta(response.data.meta || response.meta || {});
      } else {
        setMpnData([]);
        setMpnMeta({});
      }
    } catch (error) {
      console.error("Error fetching MPN data:", error);
      toast.error("Failed to fetch MPN data");
      setMpnData([]);
      setMpnMeta({});
    } finally {
      setMpnLoading(false);
    }
  };

  const fetchMarketPurchaseCounts = async () => {
    try {
      const response = await marketPurchaseAPI.getCountMarketPurchase();
      console.log("Market Purchase Counts Response:", response);

      if (response && response.success) {
        // Check response.success, not response.data.success
        const counts = response.data; // counts are directly in response.data
        console.log("Counts data:", counts);

        setFilterOptions((prev) =>
          prev.map((option) => ({
            ...option,
            count: counts[option.id] || 0,
          }))
        );
      } else {
        console.error("Invalid response structure:", response);
        // Fallback to local counts
        updateLocalCounts();
      }
    } catch (error) {
      console.error("Error fetching market purchase counts:", error);
      // Fallback to local counts
      updateLocalCounts();
    }
  };

  // Fallback function to calculate counts locally
  const updateLocalCounts = () => {
    const localCounts = {
      all: demands.length,
      pending_schedule: schedules.filter((s) => !s.scheduled_date).length,
      scheduled: schedules.filter((s) => !s.scheduled_date).length,
      ordered: orderedData.length,
      purchases_pending_mpn: marketPurchaseData.filter((mp) => !mp.mpn_no)
        .length,
      mpn: mpnData.length,
      closed: demands.filter((d) => d.purchase_status === "Closed").length,
    };

    setFilterOptions((prev) =>
      prev.map((option) => ({
        ...option,
        count: localCounts[option.id] || 0,
      }))
    );
  };
  const fetchMPOrderedData = async (page = 1) => {
    try {
      setOrderedLoading(true);
      const response = await marketPurchaseAPI.getOrderedData({
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
      });

      console.log("mp Ordered Data:", response);

      // Set the orderedData state with the response data
      if (response && response.data) {
        setOrderedData(response.data.data || response.data);
        setOrderedMeta(response.data.meta || response.meta || {});
      } else {
        setOrderedData([]);
        setOrderedMeta({});
      }
    } catch (error) {
      console.error("Error fetching market purchase ordered data:", error);
      toast.error("Failed to fetch market purchase ordered data");
      setOrderedData([]);
      setOrderedMeta({});
    } finally {
      setOrderedLoading(false);
    }
  };

  useEffect(() => {
    if (activeFilter === "pending_schedule") {
      fetchSchedules(1);
    } else if (activeFilter === "scheduled") {
      fetchSchedules(1);
    } else if (activeFilter === "purchases_pending_mpn") {
      fetchPendingMPNData(1);
    } else if (activeFilter === "mpn") {
      fetchMPNData(1);
    } else if (activeFilter === "Ordered") {
      fetchMPOrderedData(1);
    } else {
      fetchDemands(1);
    }
    fetchLocations();
    fetchVendors();
    // Refresh counts after fetching new data
    setTimeout(() => {
      fetchMarketPurchaseCounts();
    }, 500);
  }, [search, filters, pageSize, sortConfig, activeFilter]);

  // Update your counts useEffect
  useEffect(() => {
    fetchMarketPurchaseCounts();
  }, [demands, schedules, marketPurchaseData, mpnData, orderedData]);

  const fetchCounts = async () => {
    try {
      const counts = await marketPurchaseAPI.getCounts();
      console.log("Counts from API:", counts);

      setFilterOptions((prev) =>
        prev.map((option) => ({
          ...option,
          count: counts[option.id] || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching counts:", error);
      const localCounts = {
        all: demands.length,
        pending_schedule: demands.filter(
          (d) => d.scheduled_purchase_date === null
        ).length,
        scheduled: demands.filter((d) => d.purchase_status === "Scheduled")
          .length,
        ordered: demands.filter((d) => d.purchase_status === "Ordered").length,
        purchases_pending_mpn: demands.filter(
          (d) => d.purchase_status === "Pending MPN"
        ).length,
        mpn: demands.filter((d) => d.mnp_no && d.mnp_no !== "").length,
        closed: demands.filter((d) => d.purchase_status === "Closed").length,
      };

      setFilterOptions((prev) =>
        prev.map((option) => ({
          ...option,
          count: localCounts[option.id] || 0,
        }))
      );
    }
  };

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
    if (activeFilter === "mpn" && minimalColumns.includes(columnKey)) {
      toast.info("This column cannot be hidden in current filter mode");
      return;
    }

    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleShowAllColumns = () => {
    if (activeFilter === "mpn") {
      const newVisibility = {};
      Object.keys(columnVisibility).forEach((key) => {
        newVisibility[key] = minimalColumns.includes(key);
      });
      setColumnVisibility(newVisibility);
      toast.info("Only essential columns are shown in MPN/Pending MPN mode");
    } else {
      const newVisibility = {};
      Object.keys(columnVisibility).forEach((key) => {
        newVisibility[key] = true;
      });
      setColumnVisibility(newVisibility);
    }
  };

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
  ];

  const pageSizeOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "40", label: "40" },
    { value: "all", label: "All" },
  ];

  const columnConfig = [
    { key: "demand_no", label: "Demand No", sortable: true },
    { key: "date", label: "Demand Date", sortable: true },
    { key: "required_date", label: "Required Date", sortable: true },
    { key: "location", label: "Location", sortable: false },
    { key: "item_name", label: "Item Name", sortable: true },
    { key: "total_qty", label: "A.Q", sortable: true },
    { key: "scheduled_qty", label: "S.Q", sortable: false },
    { key: "total_purchase_qty", label: "P.Q", sortable: false },
    { key: "pending_qty", label: "P.S.Q", sortable: true },
    { key: "pending_purchase_qty", label: "P.P.Q", sortable: true },
    { key: "priority", label: "Priority", sortable: true },

    { key: "purpose", label: "Purpose", sortable: false },
    { key: "site_store_officer", label: "Store Officer", sortable: false },
    { key: "site_manager", label: "Site Manager", sortable: false },
    { key: "inventory_manager", label: "Inventory Manager", sortable: false },

    { key: "actions", label: "Actions", sortable: false },
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

  const handleSelectDemand = (id) => {
    const newSet = new Set(selectedDemands);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDemands(newSet);
    setIsAllSelected(false);
  };

  const handleSelectSchedule = (scheduleId) => {
    const newSet = new Set(selectedSchedules);
    if (newSet.has(scheduleId)) {
      newSet.delete(scheduleId);
    } else {
      newSet.add(scheduleId);
    }
    setSelectedSchedules(newSet);
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

  const handleSelectAllSchedules = () => {
    if (selectedSchedules.size === schedules.length) {
      setSelectedSchedules(new Set());
    } else {
      const allIds = new Set(schedules.map((s) => s.id));
      setSelectedSchedules(allIds);
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

  const handleActionClick = (action, e) => {
    e?.stopPropagation();

    switch (action) {
      case "scheduled":
        if (selectedDemands.size > 0) {
          setShowPurchaseModal(true);
        } else {
          toast.error("Please select items first");
        }
        break;
      case "estimate_rate":
        if (selectedDemands.size > 0) {
          setShowEstimatePriceModal(true);
        } else {
          toast.error("Please select items first");
        }
        break;
      case "purchaser_model":
        if (selectedDemands.size > 0) {
          setShowPurchaserModal(true);
        } else {
          toast.error("Please select items first");
        }
        break;
      case "closed":
        toast.info("Mark as Closed functionality");
        break;
      case "mpn_generate":
        if (selectedDemands.size > 0) {
          setShowNoteModal(true);
        } else {
          toast.error("Please select items first");
        }
        break;
      case "receive_order": // NEW ACTION
        if (selectedDemands.size > 0) {
          setShowOrderedModal(true);
        } else {
          toast.error("Please select items first");
        }
        break; // ADD THIS BREAK
      case "generate_order_mpn": // NEW ACTION
        if (selectedDemands.size > 0) {
          setShowGenerateOrderMPNModal(true);
        } else {
          toast.error("Please select items first");
        }
        break; // ADD THIS BREAK
      default:
        break;
    }

    setShowActionDropdown(false);
  };

  const handleScheduleAction = (action, schedule) => {
    switch (action) {
      case "estimate_price":
        // For schedule estimate, we'll pass the schedule data to the existing modal
        setSelectedDemands(new Set([schedule.site_demand_id])); // Set the demand ID
        setShowEstimatePriceModal(true);
        break;
      case "view_details":
        toast.info(`View details for schedule ${schedule.id}`);
        break;
      case "mark_purchased":
        toast.info(`Mark purchased for schedule ${schedule.id}`);
        break;
      default:
        break;
    }
  };
  // Update the handleBulkScheduleAction function
  const handleBulkScheduleAction = (action, e) => {
    e?.stopPropagation();

    if (selectedSchedules.size === 0) {
      toast.error("Please select schedules first");
      return;
    }

    switch (action) {
      case "estimate_price":
        // Get all demand IDs from selected schedules
        const demandIds = new Set();
        schedules.forEach((schedule) => {
          if (selectedSchedules.has(schedule.id) && schedule.site_demand_id) {
            demandIds.add(schedule.site_demand_id);
          }
        });

        if (demandIds.size > 0) {
          setSelectedDemands(demandIds);
          setShowEstimatePriceModal(true);
        } else {
          toast.error("No valid demands found for selected schedules");
        }
        break;
      case "mark_purchased":
        // For schedules, show the purchaser model
        setSelectedDemands(new Set()); // Clear any previous demand selections
        setShowPurchaserModal(true);
        break;
      case "receive_order": // NEW ACTION FOR SCHEDULES
        setShowOrderedModal(true);
        break;
      default:
        break;
    }

    setShowActionDropdown(false);
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

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (filterId === "pending_schedule") {
      setShowScheduleTable(true);
      fetchSchedules(1);
    } else if (filterId === "purchases_pending_mpn") {
      setShowScheduleTable(false);
      fetchPendingMPNData(1);
    } else if (filterId === "mpn") {
      setShowScheduleTable(false);
      fetchMPNData(1);
    } else if (filterId === "ordered") {
      // Changed from 'Ordered' to 'ordered'
      setShowScheduleTable(false);
      fetchMPOrderedData(1);
    } else {
      setShowScheduleTable(false);
      fetchDemands(1);
    }
  };
  const handleSelectMarketPurchase = (id) => {
    const newSet = new Set(selectedDemands);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDemands(newSet);
  };

  const handleSelectAllMarketPurchase = () => {
    if (selectedDemands.size === marketPurchaseData.length) {
      setSelectedDemands(new Set());
    } else {
      const allIds = new Set(marketPurchaseData.map((item) => item.id));
      setSelectedDemands(allIds);
    }
  };
  const clearFilters = () => {
    setFilters({
      priority: "",
      status: "",
      date_from: "",
      date_to: "",
      mpn_no: "",
      vendor_id: "",
    });
    setSearch("");
  };

  const hasActiveFilters = () => {
    return (
      filters.priority ||
      filters.status ||
      filters.date_from ||
      filters.date_to ||
      filters.mpn_no ||
      filters.vendor_id ||
      search
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      Scheduled: "bg-blue-100 text-blue-800",
      Partial: "bg-yellow-100 text-yellow-800",
      Ordered: "bg-green-100 text-green-800",
      "Not Available": "bg-red-100 text-red-800",
      "MPN Pending": "bg-purple-100 text-purple-800",
      Pending: "bg-yellow-100 text-yellow-800",
      "In Process": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Approved: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
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

  const getCellData = (demand, columnKey) => {
    // Calculate all quantities for this demand
    const approvedQty = calculateApprovedQty(demand);
    const totalScheduledQty = calculateTotalScheduledQty(demand);
    const totalPurchasedQty = calculateTotalPurchasedQty(demand);
    const pendingScheduleQty = calculatePendingScheduleQty(demand);
    const pendingPurchaseQty = calculatePendingPurchaseQty(demand);

    console.log(`=== Demand ${demand.id} Display Quantities ===`);
    console.log({
      approvedQty,
      totalScheduledQty,
      totalPurchasedQty,
      pendingScheduleQty,
      pendingPurchaseQty,
    });
    console.log(`=== End Demand ${demand.id} Display ===`);

    switch (columnKey) {
      case "demand_no":
        return demand.demand_no;
      case "date":
        return demand.date
          ? new Date(demand.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      case "required_date":
        return demand.required_date
          ? new Date(demand.required_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      case "location":
        return demand.location?.name || "-";
      case "item_name":
        return (
          <div>
            <div className="font-medium">{demand.item_name}</div>
            {demand.inventory_item?.item_code && (
              <div className="text-xs text-gray-500">
                Code: {demand.inventory_item.item_code}
              </div>
            )}
          </div>
        );
      case "total_qty":
        // Show approved quantity
        return approvedQty > 0 ? approvedQty.toFixed(2) : "-";
      case "scheduled_qty":
        // Show total scheduled quantity
        return totalScheduledQty > 0 ? totalScheduledQty.toFixed(2) : "-";
      case "total_purchase_qty":
        // Show total scheduled quantity
        return totalPurchasedQty > 0 ? totalPurchasedQty.toFixed(2) : "-";
      case "pending_qty":
        // Show pending purchase quantity (scheduled - purchased)
        return pendingScheduleQty > 0 ? (
          <span className="font-medium text-orange-600">
            {pendingScheduleQty.toFixed(2)}
          </span>
        ) : pendingScheduleQty === 0 ? (
          <span className="font-medium text-green-600">0.00</span>
        ) : (
          "-"
        );
      case "pending_purchase_qty":
        // Show pending purchase quantity (scheduled - purchased)
        return pendingPurchaseQty > 0 ? (
          <span className="font-medium text-orange-600">
            {pendingPurchaseQty.toFixed(2)}
          </span>
        ) : pendingPurchaseQty === 0 ? (
          <span className="font-medium text-green-600">0.00</span>
        ) : (
          "-"
        );
      case "priority":
        return getPriorityBadge(demand.priority);

      case "purpose":
        return demand.purpose || "-";

      case "site_store_officer":
        return getUserBadge(demand.site_store_officer, "site_store_officer");
      case "site_manager":
        return getUserBadge(demand.site_manager, "site_manager");
      case "inventory_manager":
        return getUserBadge(demand.inventory_manager, "inventory_manager");

      default:
        return "-";
    }
  };

  const toggleActionDropdown = (e) => {
    e?.stopPropagation();
    setShowActionDropdown(!showActionDropdown);
  };

  const handlePurchaseSubmit = async (purchaseData) => {
    try {
      console.log("Purchase data:", purchaseData);
      toast.success("Purchase scheduled successfully");
      setShowPurchaseModal(false);
      setSelectedDemands(new Set());
      fetchDemands(meta.current_page);
    } catch (error) {
      console.error("Error scheduling purchase:", error);
      toast.error("Failed to schedule purchase");
    }
  };
  const handleOrderSubmit = async (orderData) => {
    try {
      console.log("Order data:", orderData);
      toast.success("Order received successfully");
      setShowOrderedModal(false);
      setSelectedDemands(new Set());

      // Refresh the current data based on active filter
      if (activeFilter === "ordered") {
        fetchMPOrderedData(orderedMeta.current_page || 1);
      } else if (activeFilter === "pending_schedule") {
        fetchSchedules(scheduleMeta.current_page || 1);
      } else {
        fetchDemands(meta.current_page || 1);
      }
    } catch (error) {
      console.error("Error receiving order:", error);
      toast.error("Failed to receive order");
    }
  };

  // Add handleOrderSubmit RIGHT HERE - after handlePurchaseSubmit
  const getSelectedDemandItems = () => {
    if (showScheduleTable && activeFilter === "pending_schedule") {
      // For schedules, get the associated demand items with schedule data
      const scheduleIds = Array.from(selectedSchedules);
      const selectedSchedulesData = schedules.filter((schedule) =>
        scheduleIds.includes(schedule.id)
      );

      return selectedSchedulesData.map((schedule) => {
        const demand = schedule.site_demand;
        return {
          ...demand,
          schedule_id: schedule.id,
          scheduled_qty: parseFloat(schedule.scheduled_qty),
          purchase_status: schedule.purchase_status,
          purchaser_remarks: schedule.purchaser_remarks,
          actual_purchase_qty: schedule.actual_purchase_qty,
          order_date: schedule.order_date,
          received_qty: schedule.received_qty || 0,
          order_status: schedule.order_status || "Ordered",
        };
      });
    } else if (activeFilter === "purchases_pending_mpn") {
      // For Market Purchase data - use the actual market purchase data
      const selectedMarketPurchases = marketPurchaseData.filter((item) =>
        selectedDemands.has(item.id)
      );

      return selectedMarketPurchases.map((purchase) => ({
        ...purchase,
        purchase_schedule_id: purchase.purchase_schedule_id || purchase.id,
        demand_no: purchase.demand_no,
        item_name: purchase.item_name,
        item_code: purchase.item_code,
        purchase_qty: purchase.purchase_qty,
        actual_purchase_qty:
          purchase.actual_purchase_qty || purchase.purchase_qty,

        rate: purchase.rate || 0,
        price: purchase.rate || 0,
        purchase_amount: purchase.purchase_amount || 0,
        purchase_status: purchase.purchase_status,
        received_qty: purchase.received_qty || 0,
        order_status: purchase.order_status || "Ordered",
      }));
    } else if (activeFilter === "ordered") {
      // For ordered data - use the ordered data (location now comes from API)
      const selectedOrderedItems = orderedData.filter((item) =>
        selectedDemands.has(item.id)
      );

      console.log(
        "Selected ordered items with location:",
        selectedOrderedItems
      );

      return selectedOrderedItems.map((order) => ({
        ...order,
        demand_no: order.demand_no,
        item_name: order.item_name,
        item_code: order.item_code,
        actual_purchase_qty: order.actual_purchase_qty || order.purchase_qty,
        received_qty: order.received_qty || 0,
        order_status: order.order_status || "Ordered",
        location: order.location || "Location not found", // Use location from API
        vendor_name: order.vendor_name,
        invoice_no: order.invoice_no,
        expected_delivery_date: order.expected_delivery_date,
        is_serialized: order.is_serialized,
      }));
    } else {
      // For regular demands
      return demands.filter((demand) => selectedDemands.has(demand.id));
    }
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
          onClick={() => navigate(`/market-purchase/show/${demand.id}`)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const totalRecords = meta.total || demands.length;
  const currentRecords = demands.length;
  const recordsInfo = `${currentRecords}/${totalRecords}`;

  const currentVendorValue =
    vendorOptions.find((option) => option.value === filters.vendor_id) || null;
  const currentPageSizeValue =
    pageSizeOptions.find((option) => option.value === pageSize.toString()) ||
    pageSizeOptions[1];

  const visibleColumnsCount =
    Object.values(columnVisibility).filter(Boolean).length;
  // Update the hasSelectedItems calculation
  const hasSelectedItems = showScheduleTable
    ? selectedSchedules.size > 0
    : selectedDemands.size > 0;

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

        {activeFilter === "mpn" && (
          <div className="w-full sm:w-48">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="MPN No"
                value={filters.mpn_no}
                onChange={(e) => handleFilterChange("mpn_no", e.target.value)}
                className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}

        {activeFilter === "mpn" && (
          <div className="w-full sm:w-48">
            <Select
              options={vendorOptions}
              value={currentVendorValue}
              onChange={(selectedOption) =>
                handleFilterChange("vendor_id", selectedOption?.value || "")
              }
              placeholder="Vendor"
              styles={customStyles}
              isSearchable
              isClearable
            />
          </div>
        )}
      </>
    );
  };

  const renderTableContent = () => {
    if (
      (showScheduleTable && activeFilter === "pending_schedule") ||
      activeFilter === "scheduled"
    ) {
      return (
        <ScheduleTable
          schedules={schedules}
          selectedSchedules={selectedSchedules}
          onScheduleSelect={handleSelectSchedule}
          onSelectAll={handleSelectAllSchedules}
          loading={scheduleLoading}
          meta={scheduleMeta}
          onActionClick={handleScheduleAction}
          fetchSchedules={fetchSchedules}
        />
      );
    } else if (activeFilter === "purchases_pending_mpn") {
      return (
        <MarketPurchaseDatatable
          data={marketPurchaseData}
          loading={marketPurchaseLoading}
          selectedItems={selectedDemands}
          onSelectItem={handleSelectMarketPurchase}
          onSelectAll={handleSelectAllMarketPurchase}
          isAllSelected={selectedDemands.size === marketPurchaseData.length}
        />
      );
    } else if (activeFilter === "mpn") {
      return <MPNDatatable data={mpnData} loading={mpnLoading} />;
    } else if (activeFilter === "ordered") {
      return (
        <MPNOrderedDataTable
          data={orderedData}
          loading={orderedLoading}
          selectedItems={selectedDemands}
          onSelectItem={handleSelectMarketPurchase}
          onSelectAll={handleSelectAllMarketPurchase}
          isAllSelected={selectedDemands.size === orderedData.length}
        />
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12 py-3">
                  <div className="flex items-center">
                    {isAllSelected ||
                    selectedDemands.size === demands.length ? (
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
                        } ${
                          minimalColumns.includes(column.key)
                            ? "bg-purple-50 border-r border-purple-100"
                            : ""
                        }`}
                        onClick={
                          column.sortable
                            ? () => handleSort(column.key)
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              minimalColumns.includes(column.key)
                                ? "text-purple-700 font-bold"
                                : ""
                            }
                          >
                            {column.label}
                            {minimalColumns.includes(column.key) && (
                              <span className="text-xs text-purple-500 ml-1">
                                *
                              </span>
                            )}
                          </span>
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
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        {selectedDemands.has(demand.id) ? (
                          <CheckSquare
                            className="h-4 w-4 text-primary-color cursor-pointer"
                            onClick={() => handleSelectDemand(demand.id)}
                          />
                        ) : (
                          <Square
                            className="h-4 w-4 text-gray-400 cursor-pointer"
                            onClick={() => handleSelectDemand(demand.id)}
                          />
                        )}
                      </div>
                    </TableCell>

                    {columnConfig.map(
                      (column) =>
                        columnVisibility[column.key] && (
                          <TableCell
                            key={column.key}
                            className={`py-3 text-sm text-gray-700 ${
                              minimalColumns.includes(column.key)
                                ? "bg-purple-50 border-r border-purple-100"
                                : ""
                            }`}
                          >
                            {column.key === "actions" ? (
                              <ActionDropdown demand={demand} />
                            ) : column.key === "demand_no" ? (
                              <Link
                                to={`/market-purchases/${demand.id}/view`}
                                className="text-primary-color font-semibold hover:underline hover:text-blue-700 transition"
                              >
                                {demand.demand_no}
                              </Link>
                            ) : (
                              getCellData(demand, column.key)
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
                      Object.values(columnVisibility).filter(Boolean).length + 1
                    }
                    className="text-center py-8 text-gray-500"
                  >
                    No records found for the selected filter
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }
  };

  return (
    <div className="h-full">
          <div className="w-full px-2 md:px-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Market Purchase
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage market purchase demands and MPN
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
                        placeholder="Search demands..."
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
                          {activeFilter === "mpn" && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                              MPN Mode
                            </span>
                          )}
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
                            {activeFilter === "mpn" ? "Minimal" : "Show All"}
                          </Button>
                        </DropdownMenuLabel>

                        <DropdownMenuGroup className="p-2 space-y-1">
                          {columnConfig.map((column) => {
                            const isMinimalColumn = minimalColumns.includes(
                              column.key
                            );
                            const isForcedVisible =
                              activeFilter === "mpn" && isMinimalColumn;

                            return (
                              <div
                                key={column.key}
                                className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border ${
                                  isForcedVisible
                                    ? "border-purple-200 bg-purple-50 cursor-not-allowed"
                                    : "border-transparent hover:border-gray-200"
                                }`}
                                onClick={() =>
                                  !isForcedVisible &&
                                  handleColumnVisibilityChange(column.key)
                                }
                              >
                                <Checkbox
                                  checked={columnVisibility[column.key]}
                                  onCheckedChange={() => {}}
                                  className={`cursor-pointer data-[state=checked]:bg-green-600 ${
                                    isForcedVisible
                                      ? "cursor-not-allowed opacity-60"
                                      : ""
                                  }`}
                                  disabled={isForcedVisible}
                                />
                                <span
                                  className={`text-sm flex-1 font-medium ${
                                    isForcedVisible
                                      ? "text-purple-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {column.label}
                                  {isForcedVisible && (
                                    <span className="text-xs text-purple-500 ml-1">
                                      (Required)
                                    </span>
                                  )}
                                </span>
                                {column.sortable && (
                                  <ChevronUp className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            );
                          })}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-gray-200" />

                        <div className="p-3 bg-gray-50 rounded-b-md">
                          <div className="text-xs text-gray-600 text-center font-medium">
                            {visibleColumnsCount} of {columnConfig.length}{" "}
                            columns visible
                            {activeFilter === "mpn" && (
                              <div className="text-purple-600 mt-1">
                                MPN Mode: Minimal columns shown
                              </div>
                            )}
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

              {hasSelectedItems && (
                <div className="relative p-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={toggleActionDropdown}
                    className="h-6 px-2 text-xs flex items-center gap-1"
                  >
                    Actions
                    <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  {/* Action Dropdown */}
                  {showActionDropdown && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {showScheduleTable ? (
                          // Schedule actions
                          <>
                            <button
                              onClick={(e) =>
                                handleBulkScheduleAction("estimate_price", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              <span>Add Estimate</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleBulkScheduleAction("mark_purchased", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                              <span>Mark Purchased</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleBulkScheduleAction("receive_order", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              <span>Receive Order</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleActionClick("generate_order_mpn", e)
                              } // FIXED: Use handleActionClick
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                              <span>Generate MPN</span>
                            </button>
                          </>
                        ) : activeFilter === "purchases_pending_mpn" ? (
                          // Market Purchase actions - MPN specific
                          <>
                            <button
                              onClick={(e) =>
                                handleActionClick("mpn_generate", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                              <span>Generate MPN</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleActionClick("estimate_rate", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              <span>Update Estimate</span>
                            </button>
                            <button
                              onClick={(e) => handleActionClick("closed", e)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              <span>Mark as Closed</span>
                            </button>
                          </>
                        ) : activeFilter === "ordered" ? (
                          // Ordered items actions
                          <>
                            <button
                              onClick={(e) =>
                                handleActionClick("receive_order", e)
                              }
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              <span>Receive Order</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleActionClick("generate_order_mpn", e)
                              } // ADD THIS FOR ORDERED ITEMS TOO
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                              <span>Generate MPN</span>
                            </button>
                          </>
                        ) : (
                          // Regular demand actions
                          <>
                            <button
                              onClick={(e) => handleActionClick("scheduled", e)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                              <span>Schedule</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-0">
                {loading && !showScheduleTable ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    {renderTableContent()}

                    {(meta && meta.last_page > 1 && !showScheduleTable) ||
                    (scheduleMeta &&
                      scheduleMeta.last_page > 1 &&
                      showScheduleTable) ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Showing{" "}
                          {showScheduleTable
                            ? scheduleMeta.from || 1
                            : meta.from || 1}{" "}
                          to{" "}
                          {showScheduleTable
                            ? scheduleMeta.to || schedules.length
                            : meta.to || demands.length}{" "}
                          of{" "}
                          {showScheduleTable
                            ? scheduleMeta.total || schedules.length
                            : meta.total || demands.length}{" "}
                          records
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center gap-2">
                          {/* Previous Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              showScheduleTable
                                ? fetchSchedules(
                                    showScheduleTable
                                      ? scheduleMeta.current_page - 1
                                      : meta.current_page - 1
                                  )
                                : fetchDemands(meta.current_page - 1)
                            }
                            disabled={
                              showScheduleTable
                                ? !scheduleMeta.prev_page_url
                                : !meta.prev_page_url
                            }
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Prev</span>
                          </Button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {generatePageNumbers(
                              showScheduleTable ? scheduleMeta : meta
                            ).map((pageNum, index) =>
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
                                    pageNum ===
                                    (showScheduleTable
                                      ? scheduleMeta.current_page
                                      : meta.current_page)
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    showScheduleTable
                                      ? fetchSchedules(pageNum)
                                      : fetchDemands(pageNum)
                                  }
                                  className={`h-9 w-9 p-0 font-medium ${
                                    pageNum ===
                                    (showScheduleTable
                                      ? scheduleMeta.current_page
                                      : meta.current_page)
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
                            onClick={() =>
                              showScheduleTable
                                ? fetchSchedules(
                                    showScheduleTable
                                      ? scheduleMeta.current_page + 1
                                      : meta.current_page + 1
                                  )
                                : fetchDemands(meta.current_page + 1)
                            }
                            disabled={
                              showScheduleTable
                                ? !scheduleMeta.next_page_url
                                : !meta.next_page_url
                            }
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

      {/* Purchase Modal */}
      <ItemPurchaseModel
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSubmit={handlePurchaseSubmit}
        selectedItems={getSelectedDemandItems()}
        locations={locations}
      />
      <MarketPurchaseNoteModel
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        selectedItems={getSelectedDemandItems()}
      />
      <EstimatePriceModel
        isOpen={showEstimatePriceModal}
        onClose={() => setShowEstimatePriceModal(false)}
        selectedItems={getSelectedDemandItems()}
      />
      <PurchaserModel
        isOpen={showPurchaserModal}
        onClose={() => setShowPurchaserModal(false)}
        onSubmit={handlePurchaseSubmit}
        selectedItems={getSelectedDemandItems()}
      />
      <OrderedModel
        isOpen={showOrderedModal}
        onClose={() => setShowOrderedModal(false)}
        onSubmit={handleOrderSubmit}
        selectedItems={getSelectedDemandItems()}
      />

      <GenerateOrderMPNModel
        isOpen={showGenerateOrderMPNModal}
        onClose={() => setShowGenerateOrderMPNModal(false)}
        onSubmit={handleOrderSubmit} // You might want to create a separate handler for this
        selectedItems={getSelectedDemandItems()}
      />
    </div>
  );
};

export default MarketPurchaseIndex;
