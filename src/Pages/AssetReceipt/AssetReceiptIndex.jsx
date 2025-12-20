// src/pages/AssetReceipt/AssetReceiptIndex.jsx
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/ui/data-table";
import assetReceiptAPI from "@/lib/assetReceiptAPI";
import {
  Search,
  Filter,
  ChevronRight,
  Info,
  Camera,
  Trash2,
  X,
  Package,
  Truck,
  User,
  MapPin,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AssetReceiptIndex = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Process sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [processData, setProcessData] = useState({
    vehicleImage: null,
    weightValue: "",
    weightUnit: "kg",
    weightSlipImages: [],
  });

  // Fetch receipts
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await assetReceiptAPI.getAll();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      toast.error("Failed to load receipts");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Filter receipts based on tab selection
  const filteredReceipts = useMemo(() => {
    let filtered = receipts;

    // Apply tab filter
    if (activeTab === "in-transit") {
      filtered = filtered.filter(
        (item) =>
          item.status?.toLowerCase() === "in-transit" ||
          item.receipt_items?.some((ri) => ri.status === "in-transit")
      );
    } else if (activeTab === "arrived") {
      filtered = filtered.filter(
        (item) =>
          item.status?.toLowerCase() === "arrived" ||
          item.receipt_items?.some((ri) => ri.status === "arrived")
      );
    } else if (activeTab === "delayed") {
      filtered = filtered.filter(
        (item) =>
          item.status?.toLowerCase() === "delayed" ||
          item.receipt_items?.some((ri) => ri.status === "delayed")
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.receipt_number?.toLowerCase().includes(term) ||
          item.asset?.item_code?.toLowerCase().includes(term) ||
          item.asset?.item_name?.toLowerCase().includes(term) ||
          item.received_by?.name?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [receipts, activeTab, searchTerm, statusFilter]);

  // Handle receipt selection
  const handleSelectReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsSidebarOpen(true);
  };

  // Handle process completion
  const handleMarkReached = async () => {
    if (!selectedReceipt) return;

    try {
      // Prepare data for API
      const updateData = {
        status: "arrived",
        processed_at: new Date().toISOString(),
        // Add other fields as needed
      };

      await assetReceiptAPI.update(selectedReceipt.id, updateData);
      toast.success("Shipment marked as arrived");
      setIsSidebarOpen(false);
      setProcessData({
        vehicleImage: null,
        weightValue: "",
        weightUnit: "kg",
        weightSlipImages: [],
      });
      fetchReceipts(); // Refresh list
    } catch (error) {
      toast.error("Failed to update shipment");
    }
  };

  // Handle file upload for vehicle image
  const handleVehicleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessData((prev) => ({
          ...prev,
          vehicleImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle weight slip image upload
  const handleWeightSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessData((prev) => ({
          ...prev,
          weightSlipImages: [...prev.weightSlipImages, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove weight slip image
  const removeWeightSlipImage = (index) => {
    setProcessData((prev) => ({
      ...prev,
      weightSlipImages: prev.weightSlipImages.filter((_, i) => i !== index),
    }));
  };

  // DataTable configuration
  const tableColumns = [
    { key: "receipt_number", label: "Receipt #", type: "text" },
    { key: "asset_info", label: "Asset", type: "custom" },
    { key: "date", label: "Date", type: "text" },
    { key: "location", label: "Location", type: "custom" },
    { key: "quantity", label: "Qty", type: "text" },
    { key: "received_by", label: "Received By", type: "custom" },
    { key: "status", label: "Status", type: "badge" },
    { key: "action", label: "Action", type: "custom" },
  ];

  // Transform data for table
  const tableData = useMemo(() => {
    return filteredReceipts.map((receipt) => {
      const mainLocation = receipt.receipt_items?.[0]?.location;
      const totalQuantity =
        receipt.receipt_items?.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        ) || 0;

      // Determine status based on your logic
      let status = "Pending";
      let statusColor = "bg-yellow-100 text-yellow-800";

      if (receipt.status === "arrived" || receipt.status === "completed") {
        status = "Arrived";
        statusColor = "bg-green-100 text-green-800";
      } else if (receipt.status === "in-transit") {
        status = "In Transit";
        statusColor = "bg-blue-100 text-blue-800";
      } else if (receipt.status === "delayed") {
        status = "Delayed";
        statusColor = "bg-red-100 text-red-800";
      }

      return {
        id: receipt.id,
        receipt_number: receipt.receipt_number || "N/A",
        asset_info: (
          <div className="text-sm">
            <div className="font-medium">
              {receipt.asset?.item_name || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {receipt.asset?.item_code || ""}
            </div>
          </div>
        ),
        date: new Date(
          receipt.receipt_date || receipt.created_at
        ).toLocaleDateString(),
        location: mainLocation ? (
          <div className="text-sm">
            <div className="font-medium">{mainLocation.name}</div>
            <div className="text-xs text-gray-500">
              {mainLocation.address || ""}
            </div>
          </div>
        ) : (
          "N/A"
        ),
        quantity: totalQuantity,
        received_by: (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600">
              {receipt.received_by?.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm">
              {receipt.received_by?.name || "N/A"}
            </span>
          </div>
        ),
        status: (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
          >
            {status === "In Transit" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse"></span>
            )}
            {status === "Arrived at Gate" && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5"></span>
            )}
            {status}
          </span>
        ),
        action: (
          <button
            onClick={() => handleSelectReceipt(receipt)}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            Processing
            <ChevronRight className="w-4 h-4" />
          </button>
        ),
        rawData: receipt, // Store original data for reference
      };
    });
  }, [filteredReceipts]);

  // Custom renderers for DataTable
  const customRenderers = {
    asset_info: (item) => item.asset_info,
    location: (item) => item.location,
    received_by: (item) => item.received_by,
    status: (item) => item.status,
    action: (item) => item.action,
  };

  // Table row actions
  const tableRowActions = [
    {
      key: "process",
      label: "Process",
      icon: <Package className="w-4 h-4" />,
      onClick: (item) => handleSelectReceipt(item.rawData),
    },
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => {
        // Navigate to detail view or show modal
        console.log("View details for:", item.rawData);
      },
    },
  ];

  // Table bulk actions
  const tableBulkActions = [
    {
      key: "export",
      label: "Export Selected",
      icon: <Truck className="w-4 h-4" />,
      onClick: (selected) => {
        console.log("Export selected:", selected);
        toast.info("Export feature coming soon");
      },
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Asset Receiving</h1>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
              {filteredReceipts.length} Active Receipts
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => fetchReceipts()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b px-6 py-3">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="border-b-0">
            <TabsTrigger value="all">
              All Receipts ({receipts.length})
            </TabsTrigger>
            <TabsTrigger value="in-transit">
              In-Transit (
              {receipts.filter((r) => r.status === "in-transit").length})
            </TabsTrigger>
            <TabsTrigger value="arrived">
              Arrived ({receipts.filter((r) => r.status === "arrived").length})
            </TabsTrigger>
            <TabsTrigger value="delayed">
              Delayed ({receipts.filter((r) => r.status === "delayed").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Receipt #, Asset, or Receiver..."
              className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in-transit">In-transit</option>
              <option value="arrived">Arrived</option>
              <option value="delayed">Delayed</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Data Table */}
        <div className="flex-1 overflow-hidden">
          <DataTable
            data={tableData}
            columns={tableColumns}
            searchKeys={["receipt_number", "asset_info"]}
            rowActions={tableRowActions}
            bulkActions={tableBulkActions}
            customRenderers={customRenderers}
            loading={loading}
            emptyMessage="No asset receipts found"
          />
        </div>

        {/* Right Panel - Process Sidebar */}
        {isSidebarOpen && selectedReceipt && (
          <div className="w-[450px] border-l bg-white shadow-xl flex flex-col">
            {/* Sidebar Header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Process Receipt
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedReceipt.receipt_number} •{" "}
                  {selectedReceipt.asset?.item_code}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="text-blue-500 w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Loaded weight check is{" "}
                      <span className="font-bold">REQUIRED</span> for this asset
                      type.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Identification */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      1
                    </span>
                    Vehicle Identification
                  </h4>
                  <span className="text-xs text-red-500 font-medium">
                    * Required
                  </span>
                </div>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-800 focus-within:outline-none">
                        <span>Upload vehicle picture</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleVehicleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {processData.vehicleImage && (
                  <div className="mt-4 p-2 border rounded">
                    <img
                      src={processData.vehicleImage}
                      alt="Vehicle"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </section>

              {/* Loaded Weight */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      2
                    </span>
                    Loaded Weight
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Mandatory Step
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-1">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="weight"
                    >
                      Weight Value
                    </label>
                    <input
                      type="number"
                      id="weight"
                      className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      value={processData.weightValue}
                      onChange={(e) =>
                        setProcessData((prev) => ({
                          ...prev,
                          weightValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="uom"
                    >
                      UOM
                    </label>
                    <select
                      id="uom"
                      className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={processData.weightUnit}
                      onChange={(e) =>
                        setProcessData((prev) => ({
                          ...prev,
                          weightUnit: e.target.value,
                        }))
                      }
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="t">Tons (t)</option>
                      <option value="lbs">Pounds (lbs)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weigh Slip Picture(s)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="w-20 h-20 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100">
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleWeightSlipUpload}
                      />
                      <span className="text-gray-400 text-2xl">+</span>
                    </label>
                    {processData.weightSlipImages.map((image, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 rounded-lg border border-gray-300 overflow-hidden relative group"
                      >
                        <img
                          src={image}
                          alt={`Weigh slip ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeWeightSlipImage(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload multiple photos if needed.
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleMarkReached}
                  disabled={
                    !processData.weightValue || !processData.vehicleImage
                  }
                >
                  Mark Received
                </Button>
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetReceiptIndex;
