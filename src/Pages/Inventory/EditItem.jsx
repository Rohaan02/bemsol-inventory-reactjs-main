// components/inventory/EditItem.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Custom Components
import CategoryDropdown from "./CategoryDropdown";
import LocationManager from "./LocationManager";
import ImageUploader from "./ImageUploader";

// Icons
import { Check, Loader2, X } from "lucide-react";

// API helpers
import categoryAPI from "@/lib/categoryAPI";
import unitApi from "@/lib/unitAPI";
import locationAPI from "@/lib/locationAPI";
import itemTypeAPI from "@/lib/ItemtypeAPI";
import itemSubTypeAPI from "@/lib/ItemSubTypeApi";
import accountAPI from "@/lib/accountAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";
import { manufacturersApi } from "../../lib/manufacturersApi";
import vendorApi from "../../lib/vendorApi";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState("");

  // Dropdown state
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [leafCategories, setLeafCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    specification: "",
    manufacturer_id: "",
    manufacturer_name: "",
    category_id: "",
    reorder_level: "",
    is_serialized: false,
    is_returnable: false,
    unit_cost: "",
    currency: "USD",
    account_id: "",
    weight: "",
    weight_unit: "",
    dimensions: {
      length: "",
      length_unit: "",
      width: "",
      width_unit: "",
      height: "",
      height_unit: "",
    },
    vendor_id: "",
    unit_id: "",
    asset_tag: "",
    model_no: "",
    image: null,
    is_active: true,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manualManufacturer, setManualManufacturer] = useState("");

  // Multiple locations state
  const [itemLocations, setItemLocations] = useState([]);
  const [originalLocations, setOriginalLocations] = useState([]);

  // Format data for react-select
  const locationOptions = locations
    .map((loc) => ({
      value: loc.id.toString(),
      label: loc.name,
      is_active: true,
    }))
    .filter((loc) => loc.is_active);

  const accountOptions = accounts.map((acc) => ({
    value: acc.id.toString(),
    label: `${acc.account_code}-${acc.account_name}`,
  }));

  const manufacturerOptions = manufacturers.map((man) => ({
    value: man.id.toString(),
    label: man.name,
  }));

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id.toString(),
    label: vendor.company_name || vendor.name || `Vendor ${vendor.id}`,
  }));

  const unitOptions = units.map((unit) => ({
    value: unit.id.toString(),
    label: `${unit.name}`,
  }));

  const currencyOptions = [
    { value: "PKR", label: "PKR (RS.)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      fontSize: "14px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
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
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#3b82f6",
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

  // Fetch item data and dropdowns on component mount
  useEffect(() => {
    const fetchItemAndDropdowns = async () => {
      try {
        setLoading(true);

        const [
          catsRes,
          leafCatsRes,
          locsRes,
          typesRes,
          subTypesRes,
          accsRes,
          mfgRes,
          vendorsRes,
          itemRes,
          unitsRes,
        ] = await Promise.all([
          categoryAPI.getAllCategories(),
          categoryAPI.getLeafCategories(),
          locationAPI.getAll(),
          itemTypeAPI.getAll(),
          itemSubTypeAPI.getAll(),
          accountAPI.getAll(),
          manufacturersApi.getAll(),
          vendorApi.getAll(),
          inventoryItemAPI.getById(id),
          unitApi.getAll(),
        ]);

        setCategories(catsRes || []);
        setLeafCategories(leafCatsRes || []);
        setLocations(locsRes || []);
        setTypes(typesRes || []);
        setSubTypes(subTypesRes || []);
        setAccounts(accsRes || []);
        setManufacturers(mfgRes || []);
        setVendors(vendorsRes || []);
        setUnits(unitsRes || []);

        const itemData = itemRes.data;

        console.log("=== COMPLETE ITEM DATA DEBUG ===");
        console.log("Full itemData:", itemData);
        console.log("Item Locations:", itemData.item_locations);
        console.log("Unit ID from API:", itemData.unit_id);
        console.log("Dimensions from API:", itemData.dimensions);
        console.log("Weight unit from API:", itemData.weight_unit);

        // Handle locations data - FIXED: Ensure we get ALL locations
        let locationsData = [];

        if (itemData.item_locations && Array.isArray(itemData.item_locations)) {
          locationsData = itemData.item_locations.map((loc) => ({
            id: loc.id,
            location_id: loc.location_id?.toString() || "",
            aisle: loc.aisle || "",
            row: loc.row || "",
            bin: loc.bin || "",
            quantity: parseInt(loc.quantity) || 0,
            reorder_level: parseInt(loc.reorder_point) || 0,
            is_active: Boolean(
              loc.is_active !== undefined ? loc.is_active : true
            ),
          }));
          console.log("Processed locations:", locationsData);
        }

        // Store original locations for comparison
        setOriginalLocations([...locationsData]);

        // Extract vendor ID properly
        const extractVendorId = (itemData) => {
          if (itemData.vendor_id) {
            if (
              typeof itemData.vendor_id === "object" &&
              itemData.vendor_id.id
            ) {
              return itemData.vendor_id.id.toString();
            }
            return itemData.vendor_id.toString();
          }
          if (itemData.vendor) {
            if (typeof itemData.vendor === "object" && itemData.vendor.id) {
              return itemData.vendor.id.toString();
            }
            return itemData.vendor.toString();
          }
          return "";
        };

        const extractedVendorId = extractVendorId(itemData);

        // Set saved image URL if exists
        if (itemData.image_url) {
          setSavedImageUrl(itemData.image_url);
        }

        // Set selected category if exists
        if (itemData.category_id) {
          const foundCategory =
            leafCatsRes?.find(
              (cat) => cat.id?.toString() === itemData.category_id.toString()
            ) ||
            catsRes?.find(
              (cat) => cat.id?.toString() === itemData.category_id.toString()
            );

          if (foundCategory) {
            setSelectedCategory(foundCategory);
          }
        }

        // Handle manual manufacturer
        if (itemData.manufacturer_name && !itemData.manufacturer_id) {
          setManualManufacturer(itemData.manufacturer_name);
        }

        // Parse dimensions properly
        let parsedDimensions = {
          length: "",
          length_unit: "",
          width: "",
          width_unit: "",
          height: "",
          height_unit: "",
        };

        if (itemData.dimensions) {
          try {
            const dims =
              typeof itemData.dimensions === "string"
                ? JSON.parse(itemData.dimensions)
                : itemData.dimensions;

            parsedDimensions = {
              length: dims.length || "",
              length_unit: dims.length_unit || dims.lengthUnit || "",
              width: dims.width || "",
              width_unit: dims.width_unit || dims.widthUnit || "",
              height: dims.height || "",
              height_unit: dims.height_unit || dims.heightUnit || "",
            };
          } catch (error) {
            console.error("Error parsing dimensions:", error);
          }
        }

        setFormData({
          item_code: itemData.item_code || "",
          item_name: itemData.item_name || "",
          specification: itemData.specification || "",
          manufacturer_id: itemData.manufacturer_id?.toString() || "",
          manufacturer_name: itemData.manufacturer_name || "",
          category_id: itemData.category_id?.toString() || "",
          reorder_level: itemData.reorder_level || itemData.reorder_point || "",
          is_serialized: Boolean(itemData.is_serialized),
          is_returnable: Boolean(itemData.is_returnable),
          unit_cost: itemData.unit_cost || "",
          currency: itemData.currency || "USD",
          account_id: itemData.account_id?.toString() || "",
          weight: itemData.weight || "",
          weight_unit: itemData.weight_unit || "",
          dimensions: parsedDimensions,
          vendor_id: extractedVendorId,
          unit_id: itemData.unit_id?.toString() || "",
          asset_tag: itemData.asset_tag || "",
          model_no: itemData.model_no || "",
          is_active: Boolean(itemData.is_active),
          image: null,
        });

        setItemLocations([...locationsData]);

        console.log("Final formData.unit_id:", itemData.unit_id?.toString());
        console.log("Final dimensions:", parsedDimensions);
        console.log("Final weight_unit:", itemData.weight_unit);
        console.log("=== END DEBUG ===");
      } catch (err) {
        console.error("Failed to fetch data:", err);
        Toast.fire({
          icon: "error",
          title: "Failed to load item for editing.",
        });
        navigate("/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndDropdowns();
  }, [id, navigate]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      category_id: category.id || category._id,
    }));
  };

  // Handle manufacturer selection or creation
  const handleManufacturerChange = (selectedOption, actionMeta) => {
    if (actionMeta.action === "create-option") {
      setFormData((prev) => ({
        ...prev,
        manufacturer_id: "",
        manufacturer_name: selectedOption.value,
      }));
      setManualManufacturer(selectedOption.value);
    } else if (actionMeta.action === "select-option") {
      setFormData((prev) => ({
        ...prev,
        manufacturer_id: selectedOption.value,
        manufacturer_name: "",
      }));
      setManualManufacturer("");
    } else if (actionMeta.action === "clear") {
      setFormData((prev) => ({
        ...prev,
        manufacturer_id: "",
        manufacturer_name: "",
      }));
      setManualManufacturer("");
    }
  };

  // Handle input changes for main form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("dimensions.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle select changes - FIXED: Use value instead of label for unit_id
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle file change
  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      setSavedImageUrl("");
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setSavedImageUrl("");
  };

  // Validate locations
  const validateLocations = () => {
    const locationIds = itemLocations
      .map((loc) => loc.location_id)
      .filter((id) => id);

    // Check for duplicate locations in the current form
    if (new Set(locationIds).size !== locationIds.length) {
      Toast.fire({
        icon: "error",
        title: "Duplicate Location",
        text: "Each location can only be added once.",
      });
      return false;
    }

    // Check if all locations have required fields
    for (let loc of itemLocations) {
      if (!loc.location_id) {
        Toast.fire({
          icon: "error",
          title: "Missing Location",
          text: "Please select a location for all location entries.",
        });
        return false;
      }
    }

    return true;
  };

  // Prepare locations data for submission
  const prepareLocationsData = () => {
    const locationsToSubmit = [];

    itemLocations.forEach((currentLocation) => {
      if (!currentLocation.location_id) return;

      const originalLocation = originalLocations.find(
        (loc) => loc.location_id === currentLocation.location_id
      );

      if (originalLocation) {
        // Update existing location - include the pivot ID
        locationsToSubmit.push({
          id: originalLocation.id,
          location_id: currentLocation.location_id,
          aisle: currentLocation.aisle || "",
          row: currentLocation.row || "",
          bin: currentLocation.bin || "",
          quantity: parseInt(currentLocation.quantity) || 0,
          reorder_level: parseInt(currentLocation.reorder_level) || 0,
          is_active: Boolean(currentLocation.is_active),
          _method: "PUT",
        });
      } else {
        // New location - no ID
        locationsToSubmit.push({
          location_id: currentLocation.location_id,
          aisle: currentLocation.aisle || "",
          row: currentLocation.row || "",
          bin: currentLocation.bin || "",
          quantity: parseInt(currentLocation.quantity) || 0,
          reorder_level: parseInt(currentLocation.reorder_level) || 0,
          is_active: Boolean(currentLocation.is_active),
        });
      }
    });

    // Find locations that were removed
    const removedLocations = originalLocations
      .filter(
        (originalLoc) =>
          !itemLocations.some(
            (currentLoc) => currentLoc.location_id === originalLoc.location_id
          )
      )
      .map((removedLoc) => ({
        id: removedLoc.id,
        _method: "DELETE",
      }));

    return [...locationsToSubmit, ...removedLocations];
  };

  // Handle form update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Item Locations before submission:", itemLocations);
      console.log("Original Locations:", originalLocations);

      // Validate category
      if (!selectedCategory) {
        Toast.fire({
          icon: "warning",
          title: "Category Required",
          text: "Please select a category.",
        });
        setLoading(false);
        return;
      }

      // Validate locations
      if (!validateLocations()) {
        setLoading(false);
        return;
      }

      const form = new FormData();

      // Append main form data
      for (const key in formData) {
        const value = formData[key];
        if (key === "dimensions") {
          form.append("dimensions", JSON.stringify(formData.dimensions));
        } else if (key === "image" && value) {
          form.append("image", value);
        } else if (
          key === "is_serialized" ||
          key === "is_returnable" ||
          key === "is_active"
        ) {
          form.append(key, value ? "1" : "0");
        } else {
          form.append(key, value ?? "");
        }
      }

      // Prepare and append locations data
      const locationsData = prepareLocationsData();
      console.log("Prepared locations data:", locationsData);

      if (locationsData.length > 0) {
        form.append("locations", JSON.stringify(locationsData));
      } else {
        form.append("locations", JSON.stringify([]));
      }

      form.append("_method", "PUT");

      await inventoryItemAPI.update(id, form);
      Toast.fire({
        icon: "success",
        title: "Item updated successfully!",
      });
      navigate("/inventory");
    } catch (err) {
      console.error("Update failed:", err);
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join("\n")
        : err.response?.data?.message || "Failed to update item.";
      Toast.fire({
        icon: "error",
        title: "Update Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Inventory
              </h1>
              <p className="text-gray-600 mt-1">
                Update item details and information
              </p>
              {leafCategories.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Loaded {leafCategories.length} available categories
                </p>
              )}
            </div>
            <Button
              onClick={() => navigate("/inventory")}
              variant="outline"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleUpdate} className="p-6">
              {/* Basic Information Section */}
              <Card className="mb-6 border-0 shadow-none bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-600 rounded"></div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Item Code *</Label>
                      <Input
                        name="item_code"
                        value={formData.item_code}
                        onChange={handleChange}
                        placeholder="BAT-001"
                        className="h-10 text-sm"
                        required
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Item Name *</Label>
                      <Input
                        name="item_name"
                        value={formData.item_name}
                        onChange={handleChange}
                        placeholder="Lithium Battery"
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Specification */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Specification
                      </Label>
                      <Input
                        name="specification"
                        value={formData.specification}
                        onChange={handleChange}
                        placeholder="12V 100Ah LiFePO4 battery"
                        className="h-10 text-sm"
                      />
                    </div>

                    {/* Unit - FIXED: Now using unit_id correctly */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unit</Label>
                      <Select
                        options={unitOptions}
                        value={
                          unitOptions.find(
                            (option) =>
                              option.value === String(formData.unit_id)
                          ) || null
                        }
                        onChange={
                          (selectedOption) =>
                            handleSelectChange("unit_id", selectedOption) // FIXED: Use value instead of label
                        }
                        placeholder="Select Unit"
                        styles={customStyles}
                        isSearchable
                      />
                    </div>

                    {/* Model Number */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Model Number
                      </Label>
                      <Input
                        name="model_no"
                        value={formData.model_no}
                        onChange={handleChange}
                        placeholder="EX-4500 / BP-12 / AM-100 etc."
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Item Details Section */}
              <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-600 rounded"></div>
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Manufacturer
                        <span className="text-xs text-blue-600 ml-1">
                          (Select existing or type to create new)
                        </span>
                      </Label>
                      <CreatableSelect
                        options={manufacturerOptions}
                        value={
                          formData.manufacturer_id
                            ? manufacturerOptions.find(
                                (option) =>
                                  option.value === formData.manufacturer_id
                              )
                            : formData.manufacturer_name
                            ? {
                                value: formData.manufacturer_name,
                                label: formData.manufacturer_name,
                              }
                            : null
                        }
                        onChange={handleManufacturerChange}
                        placeholder="Select or type to create manufacturer"
                        styles={customStyles}
                        isSearchable
                        isClearable
                        formatCreateLabel={(inputValue) =>
                          `Create "${inputValue}"`
                        }
                      />
                      {formData.manufacturer_name && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ New manufacturer: {formData.manufacturer_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Category *
                        <span className="text-xs text-green-600 ml-1">
                          (Select from hierarchical menu)
                        </span>
                      </Label>
                      <CategoryDropdown
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategorySelect}
                        leafCategories={leafCategories}
                        value={
                          leafCategories.find(
                            (option) => option.value === selectedCategory?.id
                          ) || null
                        }
                      />
                      {selectedCategory && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Selected:{" "}
                          {selectedCategory.category_name ||
                            selectedCategory.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Select Vendor
                      </Label>
                      <Select
                        key={`vendor-select-${formData.vendor_id}`}
                        options={vendorOptions}
                        value={
                          vendorOptions.find(
                            (option) => option.value === formData.vendor_id
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("vendor_id", selectedOption)
                        }
                        placeholder="Select Vendor"
                        styles={customStyles}
                        isSearchable
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Asset Tag</Label>
                      <Input
                        name="asset_tag"
                        value={formData.asset_tag}
                        onChange={handleChange}
                        placeholder="Asset Tag"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="space-y-2 hidden">
                      <Label className="text-sm font-medium">
                        Global Reorder Point
                      </Label>
                      <Input
                        name="reorder_level"
                        value={formData.reorder_level}
                        type="number"
                        onChange={handleChange}
                        placeholder="10"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Serialized and Returnable Toggles */}
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="is_serialized"
                          checked={formData.is_serialized}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-colors ${
                            formData.is_serialized
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              formData.is_serialized
                                ? "transform translate-x-5"
                                : "transform translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">Serialized</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="is_returnable"
                          checked={formData.is_returnable}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-colors ${
                            formData.is_returnable
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              formData.is_returnable
                                ? "transform translate-x-5"
                                : "transform translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">Returnable</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Multiple Locations Section */}
              <LocationManager
                itemLocations={itemLocations}
                setItemLocations={setItemLocations}
                originalLocations={originalLocations}
                locationOptions={locationOptions}
                customStyles={customStyles}
              />

              {/* Financial Information Section */}
              <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-600 rounded"></div>
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unit Cost</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          name="unit_cost"
                          value={formData.unit_cost}
                          type="number"
                          step="0.01"
                          onChange={handleChange}
                          placeholder="0.00"
                          className="h-10 text-sm pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Currency</Label>
                      <Select
                        options={currencyOptions}
                        value={
                          currencyOptions.find(
                            (option) => option.value === formData.currency
                          ) || currencyOptions[0]
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("currency", selectedOption)
                        }
                        placeholder="Select Currency"
                        styles={customStyles}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium">Account</Label>
                      <Select
                        options={accountOptions}
                        value={
                          accountOptions.find(
                            (option) => option.value === formData.account_id
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("account_id", selectedOption)
                        }
                        placeholder="Select Account"
                        styles={customStyles}
                        isSearchable
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Properties Section */}
              <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-600 rounded"></div>
                    Physical Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* WEIGHT ROW */}
                  <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Weight</Label>
                      <Input
                        name="weight"
                        value={formData.weight}
                        type="number"
                        step="0.01"
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-10 text-sm"
                      />
                      <span className="text-xs text-black">
                        {formData.weight_unit}
                      </span>
                    </div>

                    {/* LENGTH */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Length</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-10 text-sm"
                      />
                      <span className="text-xs text-black">
                        {formData.dimensions.length_unit}
                      </span>
                    </div>

                    {/* WIDTH */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Width</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-10 text-sm"
                      />
                      <span className="text-xs text-black">
                        {formData.dimensions.width_unit}
                      </span>
                    </div>

                    {/* HEIGHT */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Height</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-10 text-sm"
                      />
                      <span className="text-xs text-black">
                        {formData.dimensions.height_unit}
                      </span>
                    </div>
                  </div>

                  {/* Image Upload with Preview */}
                  <ImageUploader
                    savedImageUrl={savedImageUrl}
                    formData={formData}
                    handleFileChange={handleFileChange}
                    handleRemoveImage={handleRemoveImage}
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          formData.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            formData.is_active
                              ? "transform translate-x-5"
                              : "transform translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                    <Label className="text-sm font-medium cursor-pointer">
                      Active Item
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate("/inventory")}
                  className="h-10 px-6 text-sm bg-red-500 hover:bg-red-600 text-white"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="success"
                  className="h-10 px-8 text-sm text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditItem;
