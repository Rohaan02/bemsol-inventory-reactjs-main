// src/pages/Assets/AddAsset.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import assetAPI from "@/lib/assetApi";
import ItemtypeAPI from "@/lib/ItemtypeAPI"; // Your item types API
import inventoryItemAPI from "@/lib/InventoryItemApi"; // Your inventory items API
import { ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react";
import Select from "react-select";

const AddAsset = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [types, setTypes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [formData, setFormData] = useState({
    item_number: "",
    item_name: "",
    tag_prefix: "",
    type_id: "",
    inventory_item_id: "",
    depreciation: "",
    useful_life: "",
    maintenance: false,
    description: "",
    remarks: "",
  });

  const [picture, setPicture] = useState(null);

  const navigate = useNavigate();

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesRes, inventoryRes] = await Promise.all([
          ItemtypeAPI.getAll(),
          inventoryItemAPI.getAll(),
        ]);

        console.log("Types response:", typesRes);
        console.log("Inventory items response:", inventoryRes);

        setTypes(typesRes || []);
        setInventoryItems(inventoryRes || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("Failed to load form data");
      }
    };

    fetchDropdownData();
  }, []);

  // Format data for react-select
  const typeOptions = types.map((type) => ({
    value: type.id.toString(),
    label: type.type_name || type.name || `Type ${type.id}`,
  }));

  const inventoryItemOptions = inventoryItems.map((item) => ({
    value: item.id.toString(),
    label: `${item.item_code} - ${item.item_name}` || `Item ${item.id}`,
  }));

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Select a valid image file (JPEG, PNG, GIF, SVG)");
        return;
      }

      setPicture(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPicture(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.item_number ||
      !formData.item_name ||
      !formData.tag_prefix ||
      !formData.type_id
    ) {
      toast.error("Item Number, Item Name, Tag Prefix, and Type are required");
      return;
    }

    if (!/^\d+$/.test(formData.item_number)) {
      toast.error("Item Number must be numeric");
      return;
    }

    if (!/^[A-Za-z]{2}$/.test(formData.tag_prefix)) {
      toast.error("Tag Prefix must be exactly 2 letters");
      return;
    }

    const submitData = new FormData();

    // Append all form data
    Object.keys(formData).forEach((key) => {
      if (key === "maintenance") {
        submitData.append(key, formData[key] ? "1" : "0");
      } else {
        submitData.append(key, formData[key] || "");
      }
    });

    // Append picture if exists
    if (picture) {
      submitData.append("picture", picture);
    }

    try {
      setLoading(true);
      const response = await assetAPI.create(submitData);
      toast.success("Asset created successfully!");

      // Show the generated tag if available
      if (response.data?.tag) {
        toast.info(`Asset Tag: ${response.data.tag}`);
      }

      navigate("/assets");
    } catch (error) {
      console.error("Create asset error:", error);

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.values(errors)
          .flat()
          .forEach((errorMsg) => {
            toast.error(errorMsg);
          });
      } else {
        toast.error(error.response?.data?.message || "Failed to create asset");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/assets")}
                  className="flex items-center gap-2 bg-white mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Add New Asset
                </h1>
                <p className="text-gray-600 mt-1">
                  Create a new asset in your inventory
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about the asset
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="item_number"
                        className="text-sm font-medium"
                      >
                        Item Number *
                      </Label>
                      <Input
                        id="item_number"
                        type="text"
                        value={formData.item_number}
                        onChange={(e) =>
                          handleInputChange("item_number", e.target.value)
                        }
                        placeholder="e.g., 1001"
                        required
                        pattern="[0-9]*"
                        className="focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-xs text-gray-500">
                        Numeric value only
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="item_name"
                        className="text-sm font-medium"
                      >
                        Item Name *
                      </Label>
                      <Input
                        id="item_name"
                        type="text"
                        value={formData.item_name}
                        onChange={(e) =>
                          handleInputChange("item_name", e.target.value)
                        }
                        placeholder="e.g., Laptop Dell XPS 13"
                        required
                        className="focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="tag_prefix"
                        className="text-sm font-medium"
                      >
                        Tag Prefix *
                      </Label>
                      <Input
                        id="tag_prefix"
                        type="text"
                        value={formData.tag_prefix}
                        onChange={(e) =>
                          handleInputChange(
                            "tag_prefix",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="e.g., LT"
                        required
                        maxLength={2}
                        className="uppercase focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-xs text-gray-500">
                        Exactly 2 letters (e.g., LT for Laptop)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type_id" className="text-sm font-medium">
                        Type *
                      </Label>
                      <Select
                        options={typeOptions}
                        value={
                          typeOptions.find(
                            (option) => option.value === formData.type_id
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("type_id", selectedOption)
                        }
                        placeholder="Select type"
                        styles={customStyles}
                        isSearchable
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Detailed description of the asset..."
                      rows={3}
                      className="focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial & Additional Information */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Financial & Additional Information
                  </CardTitle>
                  <CardDescription>
                    Depreciation and maintenance details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="inventory_item_id"
                        className="text-sm font-medium"
                      >
                        Inventory Item
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
                        placeholder="Select inventory item"
                        styles={customStyles}
                        isSearchable
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="depreciation"
                        className="text-sm font-medium"
                      >
                        Depreciation Rate (%)
                      </Label>
                      <Input
                        id="depreciation"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.depreciation}
                        onChange={(e) =>
                          handleInputChange("depreciation", e.target.value)
                        }
                        placeholder="e.g., 10.5"
                        className="focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="useful_life"
                        className="text-sm font-medium"
                      >
                        Useful Life (Years)
                      </Label>
                      <Input
                        id="useful_life"
                        type="number"
                        min="0"
                        value={formData.useful_life}
                        onChange={(e) =>
                          handleInputChange("useful_life", e.target.value)
                        }
                        placeholder="e.g., 5"
                        className="focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="maintenance"
                      checked={formData.maintenance}
                      onCheckedChange={(checked) =>
                        handleInputChange("maintenance", checked)
                      }
                    />
                    <Label
                      htmlFor="maintenance"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Requires Maintenance
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Picture */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Asset Picture
                  </CardTitle>
                  <CardDescription>
                    Upload a picture of the asset (JPEG, PNG, GIF, SVG - Max
                    2MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img
                          src={imagePreview}
                          alt="Asset preview"
                          className="w-full h-48 object-contain rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          JPEG, PNG, GIF, SVG (MAX. 2MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Remarks */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Remarks
                  </CardTitle>
                  <CardDescription>
                    Additional notes or comments about the asset
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    placeholder="Any additional remarks or comments..."
                    rows={4}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/assets")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Create Asset
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

export default AddAsset;
