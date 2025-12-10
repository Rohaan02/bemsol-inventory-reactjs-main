import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Icons
import {
  Loader2,
  ArrowLeft,
  Trash2,
  ShoppingCart,
  DollarSign,
  Check,
  X,
  User,
  MapPin,
  FileText,
} from "lucide-react";

// API
import marketPurchaseApi from "@/lib/MarketPurchaseApi";
import siteDemandApi from "@/lib/siteDemandApi";
import locationAPI from "../../lib/locationAPI";
import userAPI from "../../lib/userAPI";
import vendorAPI from "../../lib/vendorApi";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const AddMarketPurchase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [siteDemands, setSiteDemands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(false);

  // Purchase status options
  const purchaseStatusOptions = [
    { value: "Scheduled", label: "Scheduled" },
    { value: "Partial", label: "Partial" },
    { value: "Ordered", label: "Ordered" },
    { value: "Not Available", label: "Not Available" },
    { value: "MPN Pending", label: "MPN Pending" },
  ];

  const [formData, setFormData] = useState({
    location_id: "",
    destination_id: "",
    requested_by: "",
  });

  // Market Purchase Note state
  const [mpnData, setMpnData] = useState({
    vendor_id: "",
    rate: "",
    amount: 0,
    invoice_picture: null,
    description: "",
    remarks: "",
    purchase_remarks: "",
  });

  useEffect(() => {
    fetchMarketPurchaseDemands();
    fetchLocations();
    fetchUsers();
    fetchVendors();
  }, []);

  const fetchMarketPurchaseDemands = async () => {
    setLoadingDemands(true);
    try {
      const response = await siteDemandApi.getDemandByType("market_purchase");
      console.log("Market Purchase Demands API Response:", response);

      if (Array.isArray(response)) {
        setSiteDemands(response);
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching site demands:", error);
      Toast.fire({
        icon: "error",
        title: "Failed to load site demands",
      });
    } finally {
      setLoadingDemands(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await locationAPI.getAll();
      let locationsArray = [];

      if (Array.isArray(locationsData)) {
        locationsArray = locationsData;
      } else if (locationsData && Array.isArray(locationsData.data)) {
        locationsArray = locationsData.data;
      }

      setLocations(locationsArray);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      let usersArray = [];

      if (Array.isArray(response)) {
        usersArray = response;
      } else if (response && Array.isArray(response.data)) {
        usersArray = response.data;
      }

      setUsers(usersArray);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const vendorsData = await vendorAPI.getAll();
      setVendors(vendorsData || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  const calculateTotalPrice = (item) => {
    const quantity = parseFloat(item.quantity_purchased) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const calculateGrandTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + calculateTotalPrice(item);
    }, 0);
  };

  // Calculate MPN amount
  const calculateMpnAmount = () => {
    const rate = parseFloat(mpnData.rate) || 0;
    const totalQuantity = selectedItems.reduce((total, item) => {
      return total + (parseFloat(item.quantity_purchased) || 0);
    }, 0);
    return rate * totalQuantity;
  };

  const addItem = (option) => {
    if (!option?.data) return;

    const demand = option.data;
    console.log("Selected Demand Data:", demand); // Debug log

    const existingItem = selectedItems.find(
      (item) => item.site_demand_id === demand.id
    );

    if (existingItem) {
      Toast.fire({
        icon: "warning",
        title: "Item already added to purchase",
      });
      return;
    }

    // Get image from inventory item using image_url attribute
    const imageUrl =
      demand.inventory_item?.image_url ||
      demand.inventory_item?.image ||
      demand.picture ||
      "";

    // Get location name - check multiple possible paths
    let locationName = "Unknown Location";
    if (demand.location?.name) {
      locationName = demand.location.name;
    } else if (demand.location_name) {
      locationName = demand.location_name;
    } else if (demand.location_id && locations.length > 0) {
      // Fallback: find location name from locations list
      const location = locations.find((loc) => loc.id === demand.location_id);
      locationName = location?.name || "Unknown Location";
    }

    const newItem = {
      site_demand_id: demand.id,
      demand_no: demand.demand_no,
      item_name: demand.item_name,
      unit: demand.inventory_item?.unit || "",
      specification:
        demand.inventory_item?.specification || demand.specification || "",
      approved_quantity: demand.quantity,
      quantity_remaining: demand.quantity_remaining || demand.quantity,
      quantity_purchased: "",
      unit_price: "",
      purchase_status: "Scheduled",
      purchase_remarks: "",
      picture: imageUrl,
      inventory_item_id: demand.inventory_item?.id || demand.item_id,
      destination_id: "",
      source_location_id: demand.location_id,
      source_location_name: locationName,
    };

    setSelectedItems((prev) => [...prev, newItem]);

    // Auto-set source location from the first selected item
    if (selectedItems.length === 0 && demand.location_id) {
      setFormData((prev) => ({
        ...prev,
        location_id: demand.location_id,
      }));
      console.log("Auto-set source location ID:", demand.location_id);
    }
  };

  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update the updateItem function to handle destination_id properly
  const updateItem = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Validate purchase quantity doesn't exceed approved + remaining
          if (field === "quantity_purchased") {
            const purchaseQty = parseFloat(value) || 0;
            const maxAllowed =
              (item.approved_quantity || 0) + (item.quantity_remaining || 0);

            if (purchaseQty > maxAllowed) {
              Toast.fire({
                icon: "warning",
                title: `Purchase quantity cannot exceed ${maxAllowed}`,
              });
              return { ...item, [field]: maxAllowed.toString() };
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add this specific function to handle destination selection
  const updateItemDestination = (index, selectedOption) => {
    const destinationId = selectedOption?.value || "";
    setSelectedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, destination_id: destinationId } : item
      )
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMpnDataChange = (field, value) => {
    setMpnData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate amount when rate changes
      if (field === "rate") {
        updated.amount = calculateMpnAmount();
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMpnData((prev) => ({
        ...prev,
        invoice_picture: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Please add at least one item to purchase",
      });
      return;
    }

    // Validate that purchase quantities and prices are provided
    const invalidItems = selectedItems.filter(
      (item) =>
        !item.quantity_purchased ||
        !item.unit_price ||
        item.quantity_purchased <= 0 ||
        item.unit_price <= 0
    );

    if (invalidItems.length > 0) {
      Toast.fire({
        icon: "warning",
        title: "Please enter valid quantity and price for all items",
      });
      return;
    }

    // Validate form data
    if (
      !formData.location_id ||
      !formData.destination_id ||
      !formData.requested_by ||
      !mpnData.vendor_id ||
      !mpnData.rate
    ) {
      Toast.fire({
        icon: "warning",
        title: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        purchaser_id: "1", // You need to set this from user context or authentication
        requested_by: formData.requested_by,
        location_id: formData.location_id, // This will be mapped to source_location_id in backend
        destination_id: formData.destination_id, // This will be mapped to destination_location_id in backend
        vendor_id: mpnData.vendor_id,
        rate: parseFloat(mpnData.rate),
        amount: calculateMpnAmount(),
        description: mpnData.description,
        remarks: mpnData.remarks,
        purchase_remarks: mpnData.purchase_remarks,
        invoice_picture: mpnData.invoice_picture,
        items: selectedItems.map((item) => ({
          site_demand_id: item.site_demand_id,
          inventory_item_id: item.inventory_item_id,
          demand_no: item.demand_no, // Add this missing field
          item_name: item.item_name,
          unit: item.unit,
          specification: item.specification,
          approved_quantity: parseFloat(item.approved_quantity),
          quantity_remaining: parseFloat(item.quantity_remaining),
          quantity_purchased: parseFloat(item.quantity_purchased),
          unit_price: parseFloat(item.unit_price),
          purchase_status: item.purchase_status,
          purchase_remarks: item.purchase_remarks,
          destination_id: item.destination_id,
          picture: item.picture,
        })),
      };

      console.log("Submitting market purchase:", submitData);

      const response = await marketPurchaseApi.createBulkPurchase(submitData);

      if (response.success) {
        Toast.fire({
          icon: "success",
          title: "Market Purchase created successfully",
        });
        navigate("/market-purchases");
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to create purchase",
      });
    } finally {
      setLoading(false);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      fontSize: "14px",
    }),
  };

  // Site demand options with source location displayed
  const siteDemandOptions = siteDemands.map((demand) => {
    // Get location name for display in dropdown
    let locationName = "Unknown Location";
    if (demand.location?.name) {
      locationName = demand.location.name;
    } else if (demand.location_name) {
      locationName = demand.location_name;
    }

    return {
      value: demand.id,
      label: `${demand.demand_no} - ${demand.item_name} (${locationName}) - Qty: ${demand.quantity}`,
      data: demand,
    };
  });

  // Destination options - all locations except the selected source location
  const destinationOptions = locations
    .filter((location) => location.id !== formData.location_id)
    .map((location) => ({
      value: location.id,
      label: location.name,
    }));

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name || user.username || `User ${user.id}`,
  }));

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id,
    label: vendor.company_name || vendor.name || `Vendor ${vendor.id}`,
  }));

  // Get source location name for display
  const getSourceLocationName = () => {
    if (selectedItems.length > 0 && formData.location_id) {
      const firstItem = selectedItems[0];
      return firstItem.source_location_name || "Unknown Location";
    }
    return "Not selected";
  };

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/market-purchases")}
                className="flex items-center gap-2 bg-black text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedItems.length > 0
                    ? `Create Market Purchase (${selectedItems.length} items)`
                    : "Create Market Purchase"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Create market purchase from site demands
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Item Selection with Source Location Info */}
            <Card>
              <CardHeader>
                <CardTitle>Add Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Select Item *
                      </Label>
                      <Select
                        options={siteDemandOptions}
                        onChange={addItem}
                        placeholder={
                          loadingDemands
                            ? "Loading demands..."
                            : "Search and select item from site demands..."
                        }
                        styles={customStyles}
                        isSearchable
                        isDisabled={loadingDemands}
                      />
                      {loadingDemands && (
                        <p className="text-xs text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                          Loading site demands...
                        </p>
                      )}
                      {!loadingDemands && siteDemandOptions.length === 0 && (
                        <p className="text-xs text-orange-600">
                          No market purchase demands found.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Source Location Information
                      </Label>
                      <div className="p-3 border border-gray-200 rounded bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {getSourceLocationName()}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          Source location is automatically detected from the
                          first selected demand item. All items must be from the
                          same location.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Items Table */}
            {selectedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Selected Items ({selectedItems.length})</span>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Image
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Demand # & Details
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            UOM
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty Approved
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty Remaining
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Purchase Qty
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Estimate Rate
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Price
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Destination
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedItems.map((item, index) => {
                          const maxPurchaseQty =
                            (item.approved_quantity || 0) +
                            (item.quantity_remaining || 0);

                          return (
                            <tr key={index}>
                              <td className="px-3 py-2">
                                <div className="flex-shrink-0">
                                  {item.picture ? (
                                    <img
                                      src={item.picture}
                                      alt={item.item_name}
                                      className="h-10 w-10 rounded object-cover border"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center">
                                      <span className="text-xs text-gray-400">
                                        No Image
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div>
                                  <p className="text-xs font-medium text-blue-600">
                                    {item.demand_no}
                                  </p>
                                  <p className="text-xs font-medium">
                                    {item.item_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.specification}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Source: {item.source_location_name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-600">
                                  {item.unit}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={item.approved_quantity}
                                  readOnly
                                  className="h-7 w-16 bg-gray-50 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={item.quantity_remaining}
                                  readOnly
                                  className="h-7 w-16 bg-gray-50 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.quantity_purchased}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "quantity_purchased",
                                      e.target.value
                                    )
                                  }
                                  className="h-7 w-16 text-xs"
                                  placeholder="Qty"
                                  min="0"
                                  max={maxPurchaseQty}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Max: {maxPurchaseQty}
                                </p>
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "unit_price",
                                      e.target.value
                                    )
                                  }
                                  className="h-7 w-20 text-xs"
                                  placeholder="Rate"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-green-700">
                                    {calculateTotalPrice(item).toFixed(2)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  options={destinationOptions}
                                  value={
                                    destinationOptions.find(
                                      (opt) => opt.value === item.destination_id
                                    ) || null
                                  }
                                  onChange={(option) =>
                                    updateItemDestination(index, option)
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      height: "28px",
                                      minHeight: "28px",
                                      fontSize: "11px",
                                      width: "120px",
                                    }),
                                    menu: (base) => ({
                                      ...base,
                                      fontSize: "11px",
                                    }),
                                  }}
                                  placeholder="Select"
                                  isDisabled={!formData.location_id}
                                />
                                {!item.destination_id && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Required
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  options={purchaseStatusOptions}
                                  value={
                                    purchaseStatusOptions.find(
                                      (opt) =>
                                        opt.value === item.purchase_status
                                    ) || null
                                  }
                                  onChange={(option) =>
                                    updateItem(
                                      index,
                                      "purchase_status",
                                      option?.value || "Scheduled"
                                    )
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      height: "28px",
                                      minHeight: "28px",
                                      fontSize: "11px",
                                      width: "120px",
                                    }),
                                    menu: (base) => ({
                                      ...base,
                                      fontSize: "11px",
                                    }),
                                  }}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200 h-7 w-7"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                        <tr>
                          <td colSpan="8" className="px-3 py-2 text-right">
                            <span className="text-xs font-medium text-gray-700">
                              Grand Total:
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-green-700">
                                {calculateGrandTotal().toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Purchase Remarks Section */}
                    <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50">
                      <Label className="text-xs font-medium">
                        Purchase Remarks
                      </Label>
                      <Input
                        type="text"
                        value={mpnData.purchase_remarks}
                        onChange={(e) =>
                          handleMpnDataChange(
                            "purchase_remarks",
                            e.target.value
                          )
                        }
                        placeholder="Enter purchase remarks"
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Information - Updated without source location selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Purchase Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Source Location
                    </Label>
                    <div className="p-2 border border-gray-200 rounded bg-gray-50 text-sm text-gray-600">
                      {getSourceLocationName()}
                    </div>
                    <p className="text-xs text-gray-500">
                      Auto-detected from selected demand items
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Destination Location *
                    </Label>
                    <Select
                      options={destinationOptions}
                      value={
                        destinationOptions.find(
                          (opt) => opt.value === formData.destination_id
                        ) || null
                      }
                      onChange={(option) =>
                        handleInputChange("destination_id", option?.value || "")
                      }
                      placeholder="Select destination"
                      styles={customStyles}
                      required
                      isDisabled={!formData.location_id}
                    />
                    {!formData.location_id && (
                      <p className="text-xs text-gray-500">
                        Please select items first to auto-detect source location
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Requested By *
                    </Label>
                    <Select
                      options={userOptions}
                      value={
                        userOptions.find(
                          (opt) => opt.value === formData.requested_by
                        ) || null
                      }
                      onChange={(option) =>
                        handleInputChange("requested_by", option?.value || "")
                      }
                      placeholder="Select user"
                      styles={customStyles}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Purchase Note Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Market Purchase Note (MPN)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">MPN ID</Label>
                    <div className="p-2 border border-gray-200 rounded bg-gray-50 text-sm text-gray-600">
                      Auto-generated (MPN25-00000)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vendor *</Label>
                    <Select
                      options={vendorOptions}
                      value={
                        vendorOptions.find(
                          (opt) => opt.value === mpnData.vendor_id
                        ) || null
                      }
                      onChange={(option) =>
                        handleMpnDataChange("vendor_id", option?.value || "")
                      }
                      placeholder="Select vendor"
                      styles={customStyles}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rate *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={mpnData.rate}
                      onChange={(e) =>
                        handleMpnDataChange("rate", e.target.value)
                      }
                      placeholder="Enter rate"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Amount</Label>
                    <Input
                      type="number"
                      value={calculateMpnAmount().toFixed(2)}
                      readOnly
                      className="h-10 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Invoice Picture
                    </Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="h-10"
                    />
                    {mpnData.invoice_picture && (
                      <p className="text-xs text-green-600">
                        Selected: {mpnData.invoice_picture.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <textarea
                      value={mpnData.description}
                      onChange={(e) =>
                        handleMpnDataChange("description", e.target.value)
                      }
                      placeholder="Add summary information of the MPN"
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-vertical"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Remarks</Label>
                    <textarea
                      value={mpnData.remarks}
                      onChange={(e) =>
                        handleMpnDataChange("remarks", e.target.value)
                      }
                      placeholder="Add remarks or information from purchaser"
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] resize-vertical"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/market-purchases")}
                    className="bg-red-500 hover:bg-red-600 text-white border-red-200 text-sm px-4 py-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || selectedItems.length === 0}
                    className="bg-primary-color hover:bg-primary-color-hover text-white text-sm px-4 py-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Purchase...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Create Purchase ({selectedItems.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddMarketPurchase;
