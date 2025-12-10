import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import sitePurchaseAPI from "../../lib/sitePurchaseAPI";
import inventoryItemAPI from "../../lib/InventoryItemApi";
import locationAPI from "../../lib/locationAPI";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";
import Select from "react-select";

const SitePurchaseAdd = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDemand, setFetchingDemand] = useState(true);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [demandData, setDemandData] = useState(null);
  const [amount, setAmount] = useState(0);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    site_demand_no: "",
    purchase_date: new Date().toISOString().split("T")[0],
    inventory_item_id: "",
    demand_qty: "",
    purchase_qty: "",
    unit_cost: "",
    amount: 0,
    status: "pending",
    remarks: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const demandId = location.state?.demandId || location.state?.demand?.id;

  // Fetch demand data
  const fetchDemandData = async () => {
    if (!demandId) {
      toast.error("No demand ID provided");
      setFetchingDemand(false);
      navigate("/site-demands");
      return;
    }

    try {
      setFetchingDemand(true);
      const demandResponse = await siteDemandAPI.getById(demandId);
      console.log("Demand API Response:", demandResponse);

      if (demandResponse.success && demandResponse.data) {
        const demand = demandResponse.data;
        setDemandData(demand);

        // Pre-fill form with demand data for site purchase
        setFormData((prev) => ({
          ...prev,
          site_demand_no: demand.demand_no || "",
          purchase_date: new Date().toISOString().split("T")[0],
          inventory_item_id: demand.inventory_item_id || "",
          demand_qty: demand.quantity || "",
          approved_qty: demand.approved_quantity || "",
          purchase_qty: demand.quantity || "", // Default to demand quantity
          unit_cost: "",
          amount: 0,
          status: "pending",
          remarks: `Site Purchase for Demand #${demand.demand_no}`,
        }));
      } else {
        toast.error("Failed to load demand data");
        navigate("/site-demands");
      }
    } catch (error) {
      console.error("Error fetching demand data:", error);
      toast.error("Failed to load demand data");
      navigate("/site-demands");
    } finally {
      setFetchingDemand(false);
    }
  };

  const fetchData = async () => {
    try {
      const [items, locationsData] = await Promise.all([
        inventoryItemAPI.getAll(),
        locationAPI.getAll(),
      ]);
      setInventoryItems(items);
      setLocations(locationsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchDemandData();
    fetchData();
  }, [demandId]);

  // Calculate amount when purchase_qty or unit_cost changes
  useEffect(() => {
    const purchaseQty = parseFloat(formData.purchase_qty) || 0;
    const unitCost = parseFloat(formData.unit_cost) || 0;
    const calculatedAmount = purchaseQty * unitCost;

    setAmount(calculatedAmount);
    setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
  }, [formData.purchase_qty, formData.unit_cost]);

  const statusOptions = sitePurchaseAPI.getStatusOptions();

  // Custom option component for inventory items with images
  const formatOptionLabel = ({ data, label }) => (
    <div className="flex items-center gap-3">
      {data.image_url ? (
        <img
          src={data.image_url}
          alt={data.item_name}
          className="w-6 h-6 object-cover rounded border border-gray-200"
        />
      ) : (
        <div className="w-6 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
          <ImageIcon className="w-3 h-3 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {data.item_name}
        </div>
        <div className="text-xs text-gray-500 truncate">{data.item_code}</div>
      </div>
    </div>
  );

  const inventoryItemOptions = inventoryItems.map((item) => ({
    value: item.id,
    label: `${item.item_code} - ${item.item_name}`,
    data: item,
  }));

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
  };

  const handleInputChange = (eOrName, value) => {
    if (typeof eOrName === "string") {
      setFormData((prev) => ({ ...prev, [eOrName]: value }));
    } else {
      const { name, value } = eOrName.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "inventory_item_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    } else if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const handleQuantityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnitCostChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        unit_cost: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.purchase_date) {
      toast.error("Purchase date is required");
      return false;
    }

    if (!formData.inventory_item_id) {
      toast.error("Inventory item is required");
      return false;
    }

    if (!formData.purchase_qty || parseFloat(formData.purchase_qty) <= 0) {
      toast.error("Valid purchase quantity is required");
      return false;
    }

    if (!formData.unit_cost || parseFloat(formData.unit_cost) < 0) {
      toast.error("Valid unit cost is required");
      return false;
    }

    if (!formData.status) {
      toast.error("Status is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for site purchase API
      const submitData = {
        site_demand_no: formData.site_demand_no,
        purchase_date: formData.purchase_date,
        inventory_item_id: formData.inventory_item_id,
        demand_qty: parseFloat(formData.demand_qty),
        purchase_qty: parseFloat(formData.purchase_qty),
        unit_cost: parseFloat(formData.unit_cost),
        amount: amount,
        status: formData.status,
        remarks: formData.remarks,
      };

      console.log("Submitting site purchase data:", submitData);

      const response = await sitePurchaseAPI.create(submitData);

      if (response.success) {
        toast.success("Site purchase created successfully");
        navigate("/site-purchases"); // Navigate to site purchases list
      } else {
        toast.error(response.message || "Failed to create site purchase");
      }
    } catch (error) {
      console.error("Error creating site purchase:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create site purchase"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDemand) {
    return (
      <div className="flex h-full min-h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
              <p className="mt-2 text-gray-600">Loading demand data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/site-demands")}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Create Site Purchase
                </h1>
                <p className="text-gray-600 mt-1">
                  Create purchase order for site demand
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm border border-gray-200 bg-white">
              <form onSubmit={handleSubmit}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Site Purchase Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Original Demand Information */}
                  {demandData && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-800 mb-3">
                            Original Demand Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">
                                Demand No:
                              </span>
                              <p className="text-blue-900 font-semibold">
                                {demandData.demand_no}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Date:
                              </span>
                              <p className="text-blue-900">{demandData.date}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Priority:
                              </span>
                              <p className="text-blue-900 capitalize">
                                {demandData.priority}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Status:
                              </span>
                              <p className="text-blue-900 capitalize">
                                {demandData.processing_status}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-blue-700">
                                Purpose:
                              </span>
                              <p className="text-blue-900">
                                {demandData.purpose}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Demand Qty:
                              </span>
                              <p className="text-blue-900">
                                {demandData.quantity}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">
                                Approved Qty:
                              </span>
                              <p className="text-blue-900">
                                {demandData.approved_quantity || "N/A"}
                              </p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-4">
                              <span className="font-medium text-blue-700">
                                Item Details:
                              </span>
                              <p className="text-blue-900 font-medium">
                                {demandData.item_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Purchase Date */}
                    <div>
                      <Label
                        htmlFor="purchase_date"
                        className="text-sm font-medium text-gray-700"
                      >
                        Purchase Date *
                      </Label>
                      <Input
                        type="date"
                        id="purchase_date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleInputChange}
                        required
                        className="mt-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700"
                      >
                        Status *
                      </Label>
                      <Select
                        options={statusOptions}
                        value={
                          statusOptions.find(
                            (option) => option.value === formData.status
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("status", selectedOption)
                        }
                        placeholder="Select status..."
                        styles={customStyles}
                        isSearchable={false}
                        required
                      />
                    </div>

                    {/* Inventory Item */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="inventory_item_id"
                        className="text-sm font-medium text-gray-700"
                      >
                        Inventory Item *
                      </Label>
                      <Select
                        options={inventoryItemOptions}
                        value={
                          inventoryItemOptions.find(
                            (option) =>
                              option.value === formData.inventory_item_id
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(
                            "inventory_item_id",
                            selectedOption
                          )
                        }
                        placeholder="Select inventory item..."
                        styles={customStyles}
                        formatOptionLabel={formatOptionLabel}
                        isClearable
                        isSearchable
                        required
                      />
                    </div>

                    {/* Demand Quantity (Read-only) */}
                    <div>
                      <Label
                        htmlFor="demand_qty"
                        className="text-sm font-medium text-gray-700"
                      >
                        Approved Quantity
                      </Label>
                      <Input
                        type="number"
                        id="demand_qty"
                        name="demand_qty"
                        value={formData.approved_qty}
                        onChange={handleInputChange}
                        readOnly
                        className="mt-1 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                      />
                    </div>

                    {/* Purchase Quantity */}
                    <div>
                      <Label
                        htmlFor="purchase_qty"
                        className="text-sm font-medium text-gray-700"
                      >
                        Purchase Quantity *
                      </Label>
                      <Input
                        type="number"
                        id="purchase_qty"
                        name="purchase_qty"
                        value={formData.purchase_qty}
                        onChange={handleQuantityChange}
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="Enter purchase quantity"
                        className="mt-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div>
                      <Label
                        htmlFor="unit_cost"
                        className="text-sm font-medium text-gray-700"
                      >
                        Unit Cost *
                      </Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          id="unit_cost"
                          name="unit_cost"
                          value={formData.unit_cost}
                          onChange={handleUnitCostChange}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    {/* Calculated Amount (Read-only) */}
                    <div>
                      <Label
                        htmlFor="amount"
                        className="text-sm font-medium text-gray-700"
                      >
                        Total Amount
                      </Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          id="amount"
                          name="amount"
                          value={amount.toFixed(2)}
                          readOnly
                          className="pl-10 focus:ring-green-500 focus:border-green-500 bg-gray-50 font-semibold"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated: {formData.purchase_qty || 0} ×{" "}
                        {formData.unit_cost || 0}
                      </p>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <Label
                      htmlFor="remarks"
                      className="text-sm font-medium text-gray-700"
                    >
                      Remarks
                    </Label>
                    <Textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      placeholder="Enter any additional remarks or notes"
                      rows={4}
                      className="mt-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/site-demands")}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black border border-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Creating..." : "Create Purchase"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SitePurchaseAdd;
