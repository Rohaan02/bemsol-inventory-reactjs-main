// src/pages/SiteDemands/ViewSiteDemand.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
// import inventoryItemAPI from "../../lib/InventoryItemApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  ThumbsUp,
  ThumbsDown,
  Barcode,
  Copy,
  CheckCheck,
  Hash,
  Truck,
  ShoppingCart,
  FileText,
  Building,
  BarChart3,
  Warehouse,
  Plus,
  Minus,
  Edit3,
  X,
  ClipboardList,
  Store,
  Home,
} from "lucide-react";
import Select from "react-select";

const ViewSiteDemand = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demand, setDemand] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [approvedQuantity, setApprovedQuantity] = useState("");
  const [copiedSerial, setCopiedSerial] = useState(null);

  // New state for location stock
  const [locationStock, setLocationStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  // New state for fulfillment allocation
  const [fulfillmentAllocations, setFulfillmentAllocations] = useState([]);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [allocationQty, setAllocationQty] = useState("");

  // New state for external allocations (PO, Market Purchase, Site Purchase)
  const [externalAllocations, setExternalAllocations] = useState({
    po: 0,
    market_purchase: 0,
    site_purchase: 0,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        setLoading(true);
        const res = await siteDemandAPI.getById(id);
        const demandData = res.data || res;
        setDemand(demandData);
        setApprovedQuantity(demandData.quantity || "");

        // Fetch location stock if inventory item exists
        if (demandData.inventory_item_id) {
          fetchLocationStock(demandData.inventory_item_id);
        }
      } catch (error) {
        console.error("Error fetching site demand:", error);
        toast.error("Failed to load site demand data");
        navigate("/site-demands");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDemand();
    }
  }, [id, navigate]);

  // Fetch location stock data
  const fetchLocationStock = async (itemId) => {
    try {
      setLoadingStock(true);
      const res = await siteDemandAPI.getStockFromLocation(itemId);
      const stockData = res.data || res;
      setLocationStock(stockData);
    } catch (error) {
      console.error("Error fetching location stock:", error);
      toast.error("Failed to load location stock data");
    } finally {
      setLoadingStock(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "In Process":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Approved":
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Process":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate current stock for each location
  const calculateLocationStock = () => {
    const locations = {};

    locationStock.forEach((transaction) => {
      const locationId = transaction.location_id;
      const locationName =
        transaction.location?.name || `Location ${locationId}`;

      if (!locations[locationId]) {
        locations[locationId] = {
          id: locationId,
          name: locationName,
          currentStock: 0,
          transactions: [],
        };
      }

      locations[locationId].currentStock += parseFloat(transaction.quantity);
      locations[locationId].transactions.push(transaction);
    });

    return Object.values(locations);
  };

  // Get total available stock across all locations
  const getTotalStock = () => {
    return calculateLocationStock().reduce(
      (total, location) => total + location.currentStock,
      0
    );
  };

  // Calculate total allocated from locations
  const getTotalLocationAllocations = () => {
    return fulfillmentAllocations.reduce(
      (total, allocation) => total + allocation.quantity,
      0
    );
  };

  // Calculate total external allocations
  const getTotalExternalAllocations = () => {
    return (
      externalAllocations.po +
      externalAllocations.market_purchase +
      externalAllocations.site_purchase
    );
  };

  // Calculate total allocated (locations + external)
  const getTotalAllocated = () => {
    return getTotalLocationAllocations() + getTotalExternalAllocations();
  };

  // Calculate remaining quantity to fulfill
  const getRemainingQuantity = () => {
    const approvedQty = parseInt(approvedQuantity) || 0;
    return approvedQty - getTotalAllocated();
  };

  // Get allocated quantity for a location
  const getAllocatedQuantityForLocation = (locationId) => {
    const allocation = fulfillmentAllocations.find(
      (a) => a.locationId === locationId
    );
    return allocation ? allocation.quantity : 0;
  };

  // Handle add/edit allocation
  const handleAddAllocation = (location) => {
    const remainingQty = getRemainingQuantity();
    if (remainingQty <= 0) {
      toast.error("All quantity has been allocated");
      return;
    }

    setEditingAllocation({
      locationId: location.id,
      locationName: location.name,
      currentStock: location.currentStock,
      maxQty: Math.min(location.currentStock, remainingQty),
    });
    setAllocationQty("");
  };

  const handleEditAllocation = (allocation) => {
    const location = calculateLocationStock().find(
      (loc) => loc.id === allocation.locationId
    );
    if (!location) return;

    const otherAllocations = fulfillmentAllocations.filter(
      (a) => a.locationId !== allocation.locationId
    );
    const otherAllocatedQty = otherAllocations.reduce(
      (total, a) => total + a.quantity,
      0
    );
    const remainingQty =
      (parseInt(approvedQuantity) || 0) -
      (otherAllocatedQty + getTotalExternalAllocations());

    setEditingAllocation({
      locationId: allocation.locationId,
      locationName: allocation.locationName,
      currentStock: location.currentStock,
      maxQty: Math.min(location.currentStock, remainingQty),
      existingQty: allocation.quantity,
    });
    setAllocationQty(allocation.quantity.toString());
  };

  const handleSaveAllocation = () => {
    const qty = parseInt(allocationQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (qty > editingAllocation.maxQty) {
      toast.error(
        `Quantity cannot exceed ${editingAllocation.maxQty} (available: ${editingAllocation.currentStock})`
      );
      return;
    }

    const existingAllocationIndex = fulfillmentAllocations.findIndex(
      (a) => a.locationId === editingAllocation.locationId
    );

    const newAllocation = {
      locationId: editingAllocation.locationId,
      locationName: editingAllocation.locationName,
      quantity: qty,
    };

    let newAllocations;
    if (existingAllocationIndex >= 0) {
      newAllocations = [...fulfillmentAllocations];
      newAllocations[existingAllocationIndex] = newAllocation;
    } else {
      newAllocations = [...fulfillmentAllocations, newAllocation];
    }

    const totalAllocated =
      getTotalAllocated() + (qty - (editingAllocation.existingQty || 0));
    const approvedQty = parseInt(approvedQuantity) || 0;

    if (totalAllocated > approvedQty) {
      toast.error(
        `Total allocated quantity (${totalAllocated}) cannot exceed approved quantity (${approvedQty})`
      );
      return;
    }

    setFulfillmentAllocations(newAllocations);
    setEditingAllocation(null);
    setAllocationQty("");
    toast.success(
      `Allocated ${qty} units from ${editingAllocation.locationName}`
    );
  };

  const handleRemoveAllocation = (locationId) => {
    setFulfillmentAllocations(
      fulfillmentAllocations.filter((a) => a.locationId !== locationId)
    );
    toast.success("Allocation removed");
  };

  // Handle external allocation changes
  const handleExternalAllocationChange = (type, value) => {
    const qty = parseInt(value) || 0;

    // Calculate new total allocation
    const currentTotal = getTotalAllocated();
    const currentExternal = externalAllocations[type];
    const newTotal = currentTotal - currentExternal + qty;
    const approvedQty = parseInt(approvedQuantity) || 0;

    if (newTotal > approvedQty) {
      toast.error(
        `Total allocated quantity (${newTotal}) cannot exceed approved quantity (${approvedQty})`
      );
      return;
    }

    setExternalAllocations((prev) => ({
      ...prev,
      [type]: qty,
    }));
  };

  // Prepare fulfillment types data for API
  const prepareFulfillmentTypesData = () => {
    const fulfillmentTypes = [];

    // Add location allocations (type will be null)
    fulfillmentAllocations.forEach((allocation) => {
      fulfillmentTypes.push({
        type: null, // null for location allocations
        location_id: allocation.locationId,
        qty: allocation.quantity,
      });
    });

    // Add external allocations (PO, Market Purchase, Site Purchase)
    if (externalAllocations.po > 0) {
      fulfillmentTypes.push({
        type: "po",
        location_id: null, // null for external allocations
        qty: externalAllocations.po,
      });
    }

    if (externalAllocations.market_purchase > 0) {
      fulfillmentTypes.push({
        type: "market_purchase",
        location_id: null, // null for external allocations
        qty: externalAllocations.market_purchase,
      });
    }

    if (externalAllocations.site_purchase > 0) {
      fulfillmentTypes.push({
        type: "site_purchase",
        location_id: null, // null for external allocations
        qty: externalAllocations.site_purchase,
      });
    }

    return fulfillmentTypes;
  };

  const handleSubmitFulfillment = async () => {
    const totalAllocated = getTotalAllocated();
    const approvedQty = parseInt(approvedQuantity) || 0;

    if (totalAllocated !== approvedQty) {
      toast.error(
        `Total allocated quantity (${totalAllocated}) must equal approved quantity (${approvedQty})`
      );
      return;
    }

    try {
      setActionLoading(true);

      const fulfillmentTypesData = prepareFulfillmentTypesData();

      // Call API to save fulfillment types
      await siteDemandAPI.submitFulfillment(demand.id, {
        fulfillment_types: fulfillmentTypesData,
      });

      toast.success("Fulfillment submitted successfully");
    } catch (error) {
      console.error("Error submitting fulfillment:", error);
      toast.error("Failed to submit fulfillment");
    } finally {
      setActionLoading(false);
    }
  };

  // In the handleApprove function, update the data preparation:

  // In the handleApprove function, update the data preparation:

  const handleApprove = async () => {
    try {
      setActionLoading(true);

      const approvedQty = parseInt(approvedQuantity);
      if (isNaN(approvedQty) || approvedQty < 0) {
        toast.error("Please enter a valid approved quantity");
        return;
      }

      const approvalRemarks = remarks.trim() || "";

      // Check if total allocations match approved quantity
      const totalAllocated = getTotalAllocated();
      if (totalAllocated !== approvedQty) {
        toast.error(
          `Total allocated quantity (${totalAllocated}) must equal approved quantity (${approvedQty})`
        );
        return;
      }

      // Prepare fulfillment types data for API
      const fulfillmentTypes = [];

      // Add location allocations (type will be null)
      fulfillmentAllocations.forEach((allocation) => {
        fulfillmentTypes.push({
          type: null, // null for location allocations
          location_id: allocation.locationId,
          qty: allocation.quantity,
        });
      });

      // Add external allocations (PO, Market Purchase, Site Purchase)
      if (externalAllocations.po > 0) {
        fulfillmentTypes.push({
          type: "po",
          location_id: null, // null for external allocations
          qty: externalAllocations.po,
        });
      }

      if (externalAllocations.market_purchase > 0) {
        fulfillmentTypes.push({
          type: "market_purchase",
          location_id: null, // null for external allocations
          qty: externalAllocations.market_purchase,
        });
      }

      if (externalAllocations.site_purchase > 0) {
        fulfillmentTypes.push({
          type: "site_purchase",
          location_id: null, // null for external allocations
          qty: externalAllocations.site_purchase,
        });
      }

      // Prepare data for approval
      const data = {
        approved_quantity: approvedQty,
        remarks: approvalRemarks,
        fulfillment_types: fulfillmentTypes, // Changed from fulfillment_allocations to fulfillment_types
      };

      console.log("Sending approval data:", data);

      let response;
      response = await siteDemandAPI.approveBySiteManager(demand.id, data);
      toast.success("Demand approved successfully by site manager");

      // Refresh demand data to get updated information
      const res = await siteDemandAPI.getById(id);
      const updatedDemand = res.data || res;
      setDemand(updatedDemand);

      setShowApproveForm(false);
      setRemarks("");
      setApprovedQuantity("");
      setFulfillmentAllocations([]);
      setExternalAllocations({ po: 0, market_purchase: 0, site_purchase: 0 });
    } catch (error) {
      console.error("Approval failed:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to approve demand");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);

      const rejectionRemarks = remarks.trim();
      if (!rejectionRemarks) {
        toast.error("Remarks are required for rejection");
        return;
      }

      // Simulate API call
      // await siteDemandAPI.rejectDemand(demand.id, rejectionRemarks);
      toast.success("Demand rejected successfully");

      setShowRejectForm(false);
      setRemarks("");
    } catch (error) {
      console.error("Error rejecting demand:", error);
      toast.error("Failed to reject demand");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen bg-white-500">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="flex h-full min-h-screen bg-white-500">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Site demand not found</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const locationStockData = calculateLocationStock();
  const totalStock = getTotalStock();
  const remainingQty = getRemainingQuantity();
  const totalLocationAllocations = getTotalLocationAllocations();
  const totalExternalAllocations = getTotalExternalAllocations();
  const totalAllocated = getTotalAllocated();

  return (
    <div className="flex h-full min-h-screen bg-white-500">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="full-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/site-demands")}
                  className="flex items-center gap-2 bg-primary-color"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Site Demand Details
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Demand No: {demand.demand_no}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-primary-color text-white text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>

                {!showApproveForm && (
                  <Button
                    onClick={() => setShowApproveForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </Button>
                )}

                {!showRejectForm && (
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    variant="outline"
                    className="border-red-300 bg-red-500 text-white flex items-center gap-2 text-sm"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </Button>
                )}
              </div>
            </div>

            {/* Basic Information - Single Row */}
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Demand No
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {demand.demand_no}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Item
                    </Label>
                    <p className="font-semibold text-gray-900 truncate">
                      {demand.item_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Quantity
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {demand.quantity || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Priority
                    </Label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        demand.priority
                      )}`}
                    >
                      {demand.priority}
                    </span>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Status
                    </Label>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(demand.processing_status)}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          demand.processing_status
                        )}`}
                      >
                        {demand.processing_status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Date
                    </Label>
                    <p className="text-gray-900 text-sm">
                      {new Date(demand.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval/Rejection Forms */}
            {(showApproveForm || showRejectForm) && (
              <Card
                className={`border-l-4 ${
                  showApproveForm ? "border-l-green-500" : "border-l-red-500"
                }`}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {showApproveForm ? "Approve Demand" : "Reject Demand"}
                  </h3>
                  <div className="space-y-3">
                    {showApproveForm && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Requested Quantity
                          </Label>
                          <p className="text-lg font-bold text-gray-900">
                            {demand.quantity || 0}
                          </p>
                        </div>
                        <div>
                          <Label
                            htmlFor="approvedQuantity"
                            className="text-sm font-medium text-gray-700"
                          >
                            Approved Quantity *
                          </Label>
                          <Input
                            type="number"
                            id="approvedQuantity"
                            value={approvedQuantity}
                            onChange={(e) =>
                              setApprovedQuantity(e.target.value)
                            }
                            min="0"
                            max={demand.quantity}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label
                        htmlFor="remarks"
                        className="text-sm font-medium text-gray-700"
                      >
                        Remarks {showRejectForm && "*"}
                      </Label>
                      <textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter remarks..."
                        rows={2}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        required={showRejectForm}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={showApproveForm ? handleApprove : handleReject}
                        disabled={
                          actionLoading ||
                          (showRejectForm && !remarks.trim()) ||
                          (showApproveForm && !approvedQuantity)
                        }
                        className={`flex items-center gap-2 text-sm ${
                          showApproveForm
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        } text-white`}
                      >
                        {actionLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : showApproveForm ? (
                          <ThumbsUp className="w-4 h-4" />
                        ) : (
                          <ThumbsDown className="w-4 h-4" />
                        )}
                        {actionLoading
                          ? "Processing..."
                          : showApproveForm
                          ? "Approve"
                          : "Reject"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowApproveForm(false);
                          setShowRejectForm(false);
                          setRemarks("");
                          setApprovedQuantity(demand.quantity || "");
                        }}
                        disabled={actionLoading}
                        className="bg-gray-500 text-white text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allocation Section - Three Columns */}
            {demand.inventory_item_id && showApproveForm && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Stock Card */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Warehouse className="w-5 h-5 text-blue-600" />
                      Available Stock Allocation
                      {loadingStock && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {loadingStock ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : locationStockData.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No stock data available.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Total Stock Summary */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-900 text-sm">
                                Total Available
                              </span>
                            </div>
                            <span className="text-xl font-bold text-blue-700">
                              {totalStock.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Location-wise Stock */}
                        <div className="space-y-2">
                          {locationStockData.map((location) => {
                            const allocatedQty =
                              getAllocatedQuantityForLocation(location.id);
                            const availableAfterAllocation =
                              location.currentStock - allocatedQty;

                            return (
                              <div
                                key={location.id}
                                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900 text-sm">
                                      {location.name}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-green-600" />
                                    <span className="font-bold text-green-700">
                                      {location.currentStock.toFixed(0)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">
                                    {allocatedQty > 0
                                      ? `Allocated: ${allocatedQty}`
                                      : "Available"}
                                  </span>
                                  <Button
                                    onClick={() =>
                                      handleAddAllocation(location)
                                    }
                                    disabled={
                                      availableAfterAllocation <= 0 ||
                                      remainingQty <= 0
                                    }
                                    size="sm"
                                    variant="success"
                                    className="h-6 text-xs bg-primary-color hover:bg-primary-color-hover text-white"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Allocate
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Location Allocations Summary */}
                        {fulfillmentAllocations.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700 text-sm">
                                Total from Locations:
                              </span>
                              <span className="font-bold text-blue-700">
                                {totalLocationAllocations}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* External Allocations Card */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                      External Allocations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* PO Allocation */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center gap-2 mb-3">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">
                            Add to PO
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="poQty"
                            className="text-sm font-medium text-gray-700"
                          >
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            id="poQty"
                            value={externalAllocations.po}
                            onChange={(e) =>
                              handleExternalAllocationChange(
                                "po",
                                e.target.value
                              )
                            }
                            min="0"
                            max={remainingQty + externalAllocations.po}
                            placeholder="Enter PO quantity"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum: {remainingQty + externalAllocations.po}
                          </p>
                        </div>
                      </div>

                      {/* Market Purchase Allocation */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex items-center gap-2 mb-3">
                          <Store className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-900">
                            Add to Market Purchase
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="marketPurchaseQty"
                            className="text-sm font-medium text-gray-700"
                          >
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            id="marketPurchaseQty"
                            value={externalAllocations.market_purchase}
                            onChange={(e) =>
                              handleExternalAllocationChange(
                                "market_purchase",
                                e.target.value
                              )
                            }
                            min="0"
                            max={
                              remainingQty + externalAllocations.market_purchase
                            }
                            placeholder="Enter market purchase quantity"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum:{" "}
                            {remainingQty + externalAllocations.market_purchase}
                          </p>
                        </div>
                      </div>

                      {/* Site Purchase Allocation */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center gap-2 mb-3">
                          <Home className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">
                            Add to Site Purchase
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="sitePurchaseQty"
                            className="text-sm font-medium text-gray-700"
                          >
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            id="sitePurchaseQty"
                            value={externalAllocations.site_purchase}
                            onChange={(e) =>
                              handleExternalAllocationChange(
                                "site_purchase",
                                e.target.value
                              )
                            }
                            min="0"
                            max={
                              remainingQty + externalAllocations.site_purchase
                            }
                            placeholder="Enter site purchase quantity"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum:{" "}
                            {remainingQty + externalAllocations.site_purchase}
                          </p>
                        </div>
                      </div>

                      {/* External Allocations Summary */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700 text-sm">
                            Total External:
                          </span>
                          <span className="font-bold text-purple-700">
                            {totalExternalAllocations}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fulfillment Summary Card */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-green-600" />
                      Allocation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Allocation Summary */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Approved Quantity:
                            </span>
                            <span className="font-bold text-gray-900">
                              {approvedQuantity || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              From Locations:
                            </span>
                            <span className="font-bold text-blue-700">
                              {totalLocationAllocations}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              From External:
                            </span>
                            <span className="font-bold text-purple-700">
                              {totalExternalAllocations}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-green-200 pt-2">
                            <span className="text-gray-800 font-semibold">
                              Total Allocated:
                            </span>
                            <span
                              className={`font-bold text-lg ${
                                totalAllocated === parseInt(approvedQuantity)
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {totalAllocated}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Remaining:</span>
                            <span
                              className={`font-bold ${
                                remainingQty > 0
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {remainingQty}
                            </span>
                          </div>
                        </div>
                        {remainingQty === 0 && (
                          <div className="mt-3 text-center text-green-600 font-medium text-sm">
                            ✓ All quantity allocated
                          </div>
                        )}
                      </div>

                      {/* Location Allocations List */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Location Allocations
                        </Label>
                        {fulfillmentAllocations.length === 0 ? (
                          <div className="text-center text-gray-500 py-4 text-sm">
                            No location allocations yet.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {fulfillmentAllocations.map((allocation, index) => (
                              <div
                                key={allocation.locationId}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">
                                    {allocation.locationName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Quantity: {allocation.quantity}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleEditAllocation(allocation)
                                    }
                                    className="h-6 w-6 p-0 text-blue-600"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveAllocation(
                                        allocation.locationId
                                      )
                                    }
                                    className="h-6 w-6 p-0 text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      {(fulfillmentAllocations.length > 0 ||
                        totalExternalAllocations > 0) && (
                        <Button
                          onClick={handleSubmitFulfillment}
                          variant="success"
                          disabled={remainingQty > 0 || actionLoading}
                          className="w-full text-white"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Allocation ({totalAllocated}/
                              {approvedQuantity || 0})
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Allocation Modal */}
            {editingAllocation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Allocate Quantity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Location: {editingAllocation.locationName}
                      </Label>
                      <p className="text-sm text-gray-600">
                        Available: {editingAllocation.currentStock} units
                      </p>
                      <p className="text-sm text-gray-600">
                        Maximum allocation: {editingAllocation.maxQty} units
                      </p>
                    </div>

                    <div>
                      <Label
                        htmlFor="allocationQty"
                        className="text-sm font-medium text-gray-700"
                      >
                        Quantity to Allocate *
                      </Label>
                      <Input
                        type="number"
                        id="allocationQty"
                        value={allocationQty}
                        onChange={(e) => setAllocationQty(e.target.value)}
                        min="1"
                        max={editingAllocation.maxQty}
                        placeholder={`Enter quantity (max: ${editingAllocation.maxQty})`}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveAllocation}
                        disabled={!allocationQty}
                        variant="success"
                        className="flex-1 text-white"
                      >
                        Save Allocation
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingAllocation(null);
                          setAllocationQty("");
                        }}
                        variant="danger"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewSiteDemand;
