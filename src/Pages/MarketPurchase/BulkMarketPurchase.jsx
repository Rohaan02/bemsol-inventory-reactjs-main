import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Trash2,
  ShoppingCart,
} from "lucide-react";

// API
import marketPurchaseApi from "@/lib/MarketPurchaseApi";
import siteDemandApi from "@/lib/siteDemandApi";
import locationAPI from "@/lib/locationAPI";
import vendorApi from "@/lib/vendorApi";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const BulkMarketPurchase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [siteDemands, setSiteDemands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Selected items for bulk purchase
  const [selectedItems, setSelectedItems] = useState([]);

  // Form data for the main purchase
  const [formData, setFormData] = useState({
    purchaser_id: "",
    location_id: "",
    priority: "Medium",
    vehicle_type: "company_vehicle",
    asset_id: "",
    rental_vehicle_number: "",
    driver_contact_number: "",
    freight_terms: "prepaid",
  });

  useEffect(() => {
    fetchPendingSiteDemands();
    fetchLocations();
    fetchVendors();
    fetchVehicles();
  }, []);

  const fetchPendingSiteDemands = async () => {
    try {
      const response = await siteDemandApi.getByStatus("Completed");
      if (response.success) {
        setSiteDemands(response.data);
      }
    } catch (error) {
      console.error("Error fetching site demands:", error);
      Toast.fire({
        icon: "error",
        title: "Failed to load site demands",
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await locationAPI.getAll();
      setLocations(locationsData || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const vendorsData = await vendorApi.getAll();
      setVendors(vendorsData || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await marketPurchaseApi.getVehicles();
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const siteDemandOptions = siteDemands.map((demand) => ({
    value: demand.id,
    label: `${demand.demand_no} - ${demand.item_name} (Qty: ${demand.quantity})`,
    data: demand,
  }));

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id,
    label: vendor.company_name || vendor.name,
  }));

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.name} - ${vehicle.plate_number}`,
  }));

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" },
  ];

  const vehicleTypeOptions = [
    { value: "company_vehicle", label: "Company Vehicle" },
    { value: "rental_vehicle", label: "Rental Vehicle" },
  ];

  const freightTermsOptions = [
    { value: "prepaid", label: "Prepaid" },
    { value: "postpaid", label: "Postpaid" },
  ];

  const purchaseStatusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Purchased", label: "Purchased" },
    { value: "Ordered", label: "Ordered" },
    { value: "Not Available", label: "Not Available" },
  ];

  // Add item to selected items
  const addItem = (option) => {
    if (!option?.data) return;

    const demand = option.data;
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

    const newItem = {
      site_demand_id: demand.id,
      item_name: demand.item_name,
      unit: demand.inventory_item?.unit || "",
      specification:
        demand.inventory_item?.specification || demand.specification || "",
      approved_quantity: demand.quantity,
      quantity_purchased: "",
      unit_price: "",
      purchase_status: "Pending",
      expected_delivery_date: "",
      vendor_id: "",
    };

    setSelectedItems((prev) => [...prev, newItem]);
  };

  // Remove item from selected items
  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const updateItem = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        purchaser_id: formData.purchaser_id || "1", // Replace with actual user ID from auth
        items: selectedItems,
      };

      console.log("Submitting bulk purchase:", submitData);

      // You'll need to create this API method
      const response = await marketPurchaseApi.createBulkPurchase(submitData);

      if (response.success) {
        Toast.fire({
          icon: "success",
          title: "Bulk purchase created successfully",
        });
        navigate("/market-purchases");
      }
    } catch (error) {
      console.error("Error creating bulk purchase:", error);
      Toast.fire({
        icon: "error",
        title:
          error.response?.data?.message || "Failed to create bulk purchase",
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

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/market-purchases")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Bulk Market Purchase
                </h1>
                <p className="text-gray-600 mt-1">
                  Add multiple items to a single purchase order
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchase Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Location *</Label>
                      <Select
                        options={locationOptions}
                        value={
                          locationOptions.find(
                            (opt) => opt.value === formData.location_id
                          ) || null
                        }
                        onChange={(option) =>
                          handleInputChange("location_id", option?.value || "")
                        }
                        placeholder="Select location"
                        styles={customStyles}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority *</Label>
                      <Select
                        options={priorityOptions}
                        value={
                          priorityOptions.find(
                            (opt) => opt.value === formData.priority
                          ) || null
                        }
                        onChange={(option) =>
                          handleInputChange(
                            "priority",
                            option?.value || "Medium"
                          )
                        }
                        placeholder="Select priority"
                        styles={customStyles}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transportation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Transportation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Vehicle Type *
                      </Label>
                      <Select
                        options={vehicleTypeOptions}
                        value={
                          vehicleTypeOptions.find(
                            (opt) => opt.value === formData.vehicle_type
                          ) || null
                        }
                        onChange={(option) =>
                          handleInputChange(
                            "vehicle_type",
                            option?.value || "company_vehicle"
                          )
                        }
                        placeholder="Select vehicle type"
                        styles={customStyles}
                        required
                      />
                    </div>

                    {formData.vehicle_type === "company_vehicle" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Select Vehicle
                        </Label>
                        <Select
                          options={vehicleOptions}
                          value={
                            vehicleOptions.find(
                              (opt) => opt.value === formData.asset_id
                            ) || null
                          }
                          onChange={(option) =>
                            handleInputChange("asset_id", option?.value || "")
                          }
                          placeholder="Select company vehicle"
                          styles={customStyles}
                        />
                      </div>
                    )}

                    {formData.vehicle_type === "rental_vehicle" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Rental Vehicle Number
                        </Label>
                        <Input
                          value={formData.rental_vehicle_number}
                          onChange={(e) =>
                            handleInputChange(
                              "rental_vehicle_number",
                              e.target.value
                            )
                          }
                          placeholder="Enter rental vehicle number"
                          className="h-10"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Driver Contact Number *
                      </Label>
                      <Input
                        value={formData.driver_contact_number}
                        onChange={(e) =>
                          handleInputChange(
                            "driver_contact_number",
                            e.target.value
                          )
                        }
                        placeholder="Enter driver contact number"
                        className="h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Freight Terms *
                      </Label>
                      <Select
                        options={freightTermsOptions}
                        value={
                          freightTermsOptions.find(
                            (opt) => opt.value === formData.freight_terms
                          ) || null
                        }
                        onChange={(option) =>
                          handleInputChange(
                            "freight_terms",
                            option?.value || "prepaid"
                          )
                        }
                        placeholder="Select freight terms"
                        styles={customStyles}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Selected Items ({selectedItems.length})</span>
                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("item-selector").focus()
                      }
                      className="bg-primary-color hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Item
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Approved Qty
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Purchase Qty
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Unit Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium">
                                    {item.item_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.specification}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={item.approved_quantity}
                                  readOnly
                                  className="h-8 w-20 bg-gray-50"
                                />
                              </td>
                              <td className="px-4 py-3">
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
                                  className="h-8 w-20"
                                  placeholder="Qty"
                                />
                              </td>
                              <td className="px-4 py-3">
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
                                  className="h-8 w-24"
                                  placeholder="Price"
                                />
                              </td>
                              <td className="px-4 py-3">
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
                                      option?.value || "Pending"
                                    )
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      height: "32px",
                                      minHeight: "32px",
                                      fontSize: "12px",
                                    }),
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        No items selected. Add items to create a purchase order.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Item Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Select Site Demand
                    </Label>
                    <Select
                      id="item-selector"
                      options={siteDemandOptions}
                      onChange={addItem}
                      placeholder="Search and select site demand..."
                      styles={customStyles}
                      isSearchable
                    />
                    <p className="text-sm text-gray-500">
                      Only approved site demands are shown
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || selectedItems.length === 0}
                      className="w-full bg-primary-color hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating Purchase...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Create Purchase Order ({selectedItems.length} items)
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/market-purchases")}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BulkMarketPurchase;
