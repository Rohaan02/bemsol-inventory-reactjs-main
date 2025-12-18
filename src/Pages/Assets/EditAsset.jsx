// src/pages/Assets/EditAsset.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import assetAPI from "@/lib/assetAPI";
import inventoryItemAPI from "@/lib/inventoryItemAPI";
import unitApi from "@/lib/unitApi";
import categoryAPI from "@/lib/categoryAPI";
import accountAPI from "@/lib/accountAPI";
import vendorAPI from "@/lib/vendorAPI";
import CategoryDropdown from "./CategoryDropdown";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Package,
  Scale,
  DollarSign,
  Settings,
  Link2,
  FileText,
  Info,
  Loader2,
  Eye,
} from "lucide-react";
import Select from "react-select";

const EditAsset = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  const [formData, setFormData] = useState({
    // General Asset Details
    item_name: "",
    model_no: "",
    unit_id: "",
    category_id: "",
    category_name: "",
    manufacturer_name: "",
    specification: "",

    // Physical Details
    weight_value: "",
    weight_unit: "kg",
    length: "",
    length_unit: "cm",
    width: "",
    width_unit: "cm",
    height: "",
    height_unit: "cm",

    // Financial & Vendor Details
    unit_price: "",
    account_id: "",
    vendor_id: "",

    // Asset Type & Settings
    asset_type: "asset",
    maintenance: "no",
    tag_type: 1,
    tag_prefix: "",
    serialized: false,

    // Linked Inventory
    linked_inventory_id: "",

    // Remarks
    remarks: "",
    image: null,
  });

  const navigate = useNavigate();

  // Asset Type options
  const assetTypeOptions = [
    { value: "asset", label: "Asset" },
    { value: "machine", label: "Machinery" },
    { value: "power_tools", label: "Power Tools" },
  ];

  // Maintenance options
  const maintenanceOptions = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
    { value: "scheduled", label: "Scheduled" },
  ];

  // Weight unit options
  const weightUnitOptions = [
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "ton", label: "ton" },
    { value: "lb", label: "lb" },
  ];

  // Dimension unit options
  const dimensionUnitOptions = [
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
    { value: "m", label: "m" },
  ];

  // Fetch asset data and dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        // Fetch asset data
        const assetResponse = await assetAPI.getById(id);
        const assetData = assetResponse.data || assetResponse;

        console.log("Asset data:", assetData);

        // Fetch dropdown data
        const [inventoryRes, uomRes, categoriesRes, accountsRes, vendorsRes] =
          await Promise.all([
            inventoryItemAPI.getAll(),
            unitApi.getAll(),
            categoryAPI.getAllCategories(),
            accountAPI.getAll(),
            vendorAPI.getAll(),
          ]);

        setInventoryItems(inventoryRes || []);
        setUomList(uomRes || []);
        setCategories(categoriesRes || []);
        setAccounts(accountsRes || []);
        setVendors(vendorsRes || []);

        // Process dimensions
        let dimensions = {};
        if (assetData.dimensions) {
          try {
            dimensions =
              typeof assetData.dimensions === "string"
                ? JSON.parse(assetData.dimensions)
                : assetData.dimensions;
          } catch (e) {
            console.error("Error parsing dimensions:", e);
            dimensions = {};
          }
        }

        // Set form data
        setFormData({
          item_name: assetData.item_name || "",
          model_no: assetData.model_no || "",
          unit_id: assetData.unit_id ? assetData.unit_id.toString() : "",
          category_id: assetData.category_id
            ? assetData.category_id.toString()
            : "",
          category_name:
            assetData.category?.category_name || assetData.category_name || "",
          manufacturer_name: assetData.manufacturer_name || "",
          specification: assetData.specification || "",

          weight_value: assetData.weight?.toString() || "",
          weight_unit: assetData.weight_unit || "kg",

          length: dimensions?.length?.value?.toString() || "",
          length_unit: dimensions?.length?.unit || "cm",
          width: dimensions?.width?.value?.toString() || "",
          width_unit: dimensions?.width?.unit || "cm",
          height: dimensions?.height?.value?.toString() || "",
          height_unit: dimensions?.height?.unit || "cm",

          unit_price: assetData.unit_cost?.toString() || "",
          account_id: assetData.account_id
            ? assetData.account_id.toString()
            : "",
          vendor_id: assetData.vendor_id ? assetData.vendor_id.toString() : "",

          asset_type: assetData.asset_type || "asset",
          maintenance: assetData.maintenance || "no",
          tag_type: assetData.tag_type === 1 || assetData.tag_type === true,
          tag_prefix: assetData.tag_prefix || "",
          serialized:
            assetData.is_serialized === 1 || assetData.is_serialized === true,

          linked_inventory_id: assetData.linked_inventory_id
            ? assetData.linked_inventory_id.toString()
            : "",
          remarks: assetData.remarks || "",
          image: null,
        });

        // Set existing image if available
        if (assetData.image_url) {
          setExistingImage(assetData.image_url);
          if (typeof assetData.image_url === "string") {
            setImagePreview(assetData.image_url);
          }
        }

        // Set existing documents if available
        if (assetData.documents && Array.isArray(assetData.documents)) {
          setExistingDocuments(assetData.documents);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load asset data");
        navigate("/assets");
      } finally {
        setFetchingData(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // Format data for react-select
  const inventoryItemOptions = inventoryItems.map((item) => ({
    value: item.id.toString(),
    label: `${item.item_code || ""} - ${item.item_name || `Item ${item.id}`}`,
  }));

  const uomOptions = uomList.map((uom) => ({
    value: uom.id.toString(),
    label: uom.name || uom.name || `UOM ${uom.id}`,
  }));

  const glAccountOptions = accounts.map((account) => ({
    value: account.id.toString(),
    label: `${account.account_code || ""} - ${
      account.account_name || `Account ${account.id}`
    }`,
  }));

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id.toString(),
    label: vendor.vendor_name || vendor.name || `Vendor ${vendor.id}`,
  }));

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (category) {
      const categoryId = category.id || category._id;
      const categoryName = category.category_name || category.name || "";

      setFormData((prev) => ({
        ...prev,
        category_id: categoryId.toString(),
        category_name: categoryName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category_id: "",
        category_name: "",
      }));
    }
  };

  // Get selected category object for display
  const getSelectedCategory = () => {
    if (!formData.category_id) return null;

    // Function to find category in nested structure
    const findCategory = (categories, id) => {
      for (const category of categories) {
        if (!category) continue;

        if (
          (category.id && category.id.toString() === id) ||
          (category._id && category._id.toString() === id)
        ) {
          return category;
        }

        // Check children if available
        const children = category.children || category.subcategories || [];
        if (children.length > 0) {
          const found = findCategory(children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categories, formData.category_id);
  };

  // Handle asset type change for tag prefix
  useEffect(() => {
    const generateTagPrefix = () => {
      const { asset_type, item_name, tag_prefix } = formData;

      // Don't auto-generate if user has manually modified tag prefix
      if (tag_prefix && tag_prefix.trim() !== "" && tag_prefix !== "GL-")
        return;

      let newPrefix = "";

      switch (asset_type) {
        case "asset":
          if (item_name && item_name.length >= 3) {
            newPrefix = item_name.substring(0, 3).toUpperCase();
          }
          break;
        case "machine":
          if (item_name && item_name.length >= 3) {
            newPrefix = item_name.substring(0, 3).toUpperCase();
          }
          break;
        case "power_tools":
          newPrefix = "GL-";
          break;
        default:
          newPrefix = "";
      }

      if (newPrefix !== tag_prefix) {
        setFormData((prev) => ({
          ...prev,
          tag_prefix: newPrefix,
        }));
      }

      // Auto-check tag type for Machinery and Power Tools
      if (asset_type === "machine" || asset_type === "power_tools") {
        if (!formData.tag_type) {
          setFormData((prev) => ({
            ...prev,
            tag_type: true,
          }));
        }
      }
    };

    generateTagPrefix();
  }, [formData.asset_type, formData.item_name]);

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

  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleFileChange = (e, type) => {
    const fileList = e.target.files;

    if (type === "picture") {
      const file = fileList[0];
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

        // Update formData and preview
        setFormData((prev) => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else if (type === "documents") {
      const newFiles = Array.from(fileList);
      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 5 * 1024 * 1024) {
        toast.error("Total file size must be less than 5MB");
        return;
      }
      setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setExistingImage(null);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.item_name || !formData.unit_id || !formData.category_id) {
      toast.error("Item Name, UOM, and Category are required");
      return;
    }

    const submitData = new FormData();

    // Map form data to backend fields
    submitData.append("_method", "PUT"); // For Laravel PUT request
    submitData.append("item_name", formData.item_name);
    submitData.append("model_no", formData.model_no || "");
    submitData.append("unit_id", parseInt(formData.unit_id));
    submitData.append("category_id", parseInt(formData.category_id));
    submitData.append("manufacturer_name", formData.manufacturer_name || "");
    submitData.append("specification", formData.specification || "");

    // Weight
    if (formData.weight_value) {
      submitData.append("weight", parseFloat(formData.weight_value));
      submitData.append("weight_unit", formData.weight_unit || "kg");
    } else {
      submitData.append("weight", 0);
      submitData.append("weight_unit", "kg");
    }

    // Dimensions object
    const dimensions = {};
    if (formData.length) {
      submitData.append(
        "dimensions[length][value]",
        parseFloat(formData.length)
      );
      submitData.append(
        "dimensions[length][unit]",
        formData.length_unit || "cm"
      );
    }
    if (formData.width) {
      submitData.append("dimensions[width][value]", parseFloat(formData.width));
      submitData.append("dimensions[width][unit]", formData.width_unit || "cm");
    }
    if (formData.height) {
      submitData.append(
        "dimensions[height][value]",
        parseFloat(formData.height)
      );
      submitData.append(
        "dimensions[height][unit]",
        formData.height_unit || "cm"
      );
    }

    // Financial
    submitData.append("unit_cost", parseFloat(formData.unit_price) || 0);

    if (formData.account_id) {
      submitData.append("account_id", parseInt(formData.account_id));
    } else {
      submitData.append("account_id", "");
    }

    if (formData.vendor_id) {
      submitData.append("vendor_id", parseInt(formData.vendor_id));
    } else {
      submitData.append("vendor_id", "");
    }

    // Asset settings
    submitData.append("asset_type", formData.asset_type || "asset");
    submitData.append("maintenance", formData.maintenance || "no");
    submitData.append("tag_type", formData.tag_type ? 1 : 0); // Independent from serialized
    submitData.append("tag_prefix", formData.tag_prefix || "");
    submitData.append("is_serialized", formData.serialized ? 1 : 0); // Serialization is independent
    submitData.append("remarks", formData.remarks || "");
    submitData.append("is_active", 1);
    submitData.append("status", 1);

    // Linked inventory
    if (formData.linked_inventory_id) {
      submitData.append(
        "linked_inventory_id",
        parseInt(formData.linked_inventory_id)
      );
    } else {
      submitData.append("linked_inventory_id", "");
    }

    // Append picture if exists
    if (formData.image) {
      submitData.append("image", formData.image);
    } else if (!existingImage && formData.image === null) {
      // If removing existing image
      submitData.append("remove_image", "1");
    }

    // Append documents if exist
    documents.forEach((doc, index) => {
      submitData.append(`documents[${index}]`, doc);
    });

    // Remove deleted documents
    existingDocuments.forEach((doc, index) => {
      if (!doc) return;
      submitData.append(`remove_documents[${index}]`, doc.id || index);
    });

    try {
      setLoading(true);
      const response = await assetAPI.update(id, submitData);
      toast.success("Asset updated successfully!");
      navigate("/assets");
    } catch (error) {
      console.error("Update asset error:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors)
          .flat()
          .forEach((errorMsg) => {
            toast.error(errorMsg);
          });
      } else {
        toast.error(error.response?.data?.message || "Failed to update asset");
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

  return (
    <div className="flex h-full min-h-screen bg-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/assets")}
                  className="flex items-center gap-2 bg-white border-gray-300 mb-4 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Assets
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Edit Asset
                </h1>
                <p className="text-gray-600 mt-1">Update asset details</p>
              </div>
            </div>

            {fetchingData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading asset data...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. General Asset Details */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      1. General Asset Details
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Essential information about the asset
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="item_name"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="item_name"
                          type="text"
                          value={formData.item_name}
                          onChange={(e) =>
                            handleInputChange("item_name", e.target.value)
                          }
                          placeholder="Asset Name"
                          required
                          className="w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="model_no"
                          className="text-sm font-medium"
                        >
                          Model Number
                        </Label>
                        <Input
                          id="model_no"
                          type="text"
                          value={formData.model_no}
                          onChange={(e) =>
                            handleInputChange("model_no", e.target.value)
                          }
                          placeholder="e.g., Makita DGA504"
                          className="w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="unit_id"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          UOM (Unit of Measurement){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          options={uomOptions}
                          value={
                            uomOptions.find(
                              (option) => option.value === formData.unit_id
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange("unit_id", selectedOption)
                          }
                          placeholder="Select UOM"
                          styles={customStyles}
                          isSearchable
                          required
                          className="w-full"
                          isLoading={fetchingData}
                        />
                        {uomOptions.length === 0 && !fetchingData && (
                          <p className="text-xs text-yellow-600">
                            No UOM options available
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="category_id"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <CategoryDropdown
                          selectedCategory={getSelectedCategory()}
                          onCategorySelect={handleCategorySelect}
                          leafCategories={true}
                        />
                        {formData.category_name && (
                          <p className="text-xs text-gray-600 mt-1">
                            Selected:{" "}
                            <span className="font-medium">
                              {formData.category_name}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="manufacturer_name"
                          className="text-sm font-medium"
                        >
                          Manufacturer
                        </Label>
                        <Input
                          id="manufacturer_name"
                          type="text"
                          value={formData.manufacturer_name}
                          onChange={(e) =>
                            handleInputChange(
                              "manufacturer_name",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Bosch, Makita, Dell"
                          className="w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <Label
                        htmlFor="specification"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        Specifications <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="specification"
                        value={formData.specification}
                        onChange={(e) =>
                          handleInputChange("specification", e.target.value)
                        }
                        placeholder="Enter detailed specifications..."
                        rows={3}
                        required
                        className="w-full focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Physical Details */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      2. Physical Details
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Dimensions and weight information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="weight_value"
                          className="text-sm font-medium"
                        >
                          Weight
                        </Label>
                        <div className="flex gap-2 w-full">
                          <Input
                            id="weight_value"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.weight_value}
                            onChange={(e) =>
                              handleInputChange("weight_value", e.target.value)
                            }
                            placeholder="e.g., 5.5"
                            className="flex-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Select
                            options={weightUnitOptions}
                            value={
                              weightUnitOptions.find(
                                (option) =>
                                  option.value === formData.weight_unit
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              handleSelectChange("weight_unit", selectedOption)
                            }
                            styles={customStyles}
                            className="w-32"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="length" className="text-sm font-medium">
                          Length
                        </Label>
                        <div className="flex gap-2 w-full">
                          <Input
                            id="length"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.length}
                            onChange={(e) =>
                              handleInputChange("length", e.target.value)
                            }
                            placeholder="Length"
                            className="flex-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Select
                            options={dimensionUnitOptions}
                            value={
                              dimensionUnitOptions.find(
                                (option) =>
                                  option.value === formData.length_unit
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              handleSelectChange("length_unit", selectedOption)
                            }
                            styles={customStyles}
                            className="w-32"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="width" className="text-sm font-medium">
                          Width
                        </Label>
                        <div className="flex gap-2 w-full">
                          <Input
                            id="width"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.width}
                            onChange={(e) =>
                              handleInputChange("width", e.target.value)
                            }
                            placeholder="Width"
                            className="flex-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Select
                            options={dimensionUnitOptions}
                            value={
                              dimensionUnitOptions.find(
                                (option) => option.value === formData.width_unit
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              handleSelectChange("width_unit", selectedOption)
                            }
                            styles={customStyles}
                            className="w-32"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-medium">
                          Height
                        </Label>
                        <div className="flex gap-2 w-full">
                          <Input
                            id="height"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.height}
                            onChange={(e) =>
                              handleInputChange("height", e.target.value)
                            }
                            placeholder="Height"
                            className="flex-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Select
                            options={dimensionUnitOptions}
                            value={
                              dimensionUnitOptions.find(
                                (option) =>
                                  option.value === formData.height_unit
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              handleSelectChange("height_unit", selectedOption)
                            }
                            styles={customStyles}
                            className="w-32"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Financial & Vendor Details */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      3. Financial & Vendor Details
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Pricing and supplier information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="unit_price"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Unit Price <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.unit_price}
                          onChange={(e) =>
                            handleInputChange("unit_price", e.target.value)
                          }
                          placeholder="e.g., 1500.00"
                          required
                          className="w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500">
                          Numeric value only (no currency symbol)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="account_id"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          GL / Expense Account{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          options={glAccountOptions}
                          value={
                            glAccountOptions.find(
                              (option) => option.value === formData.account_id
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange("account_id", selectedOption)
                          }
                          placeholder="Select Account"
                          styles={customStyles}
                          isSearchable
                          required
                          className="w-full"
                          isLoading={fetchingData}
                        />
                        {glAccountOptions.length === 0 && !fetchingData && (
                          <p className="text-xs text-yellow-600">
                            No GL accounts available
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="vendor_id"
                          className="text-sm font-medium"
                        >
                          Vendor
                        </Label>
                        <Select
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
                          className="w-full"
                          isLoading={fetchingData}
                        />
                        {vendorOptions.length === 0 && !fetchingData && (
                          <p className="text-xs text-yellow-600">
                            No vendors available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Serialized Check in Sales Column Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            Serialization Status
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Enable if this asset requires unique serial numbers
                            for tracking
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="serialized_sales"
                            checked={formData.serialized}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("serialized", checked)
                            }
                          />
                          <Label
                            htmlFor="serialized_sales"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Is Serialized Asset
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Asset Type & Settings */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      4. Asset Type & Settings
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Asset classification and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="asset_type"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Asset Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          options={assetTypeOptions}
                          value={
                            assetTypeOptions.find(
                              (option) => option.value === formData.asset_type
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange("asset_type", selectedOption)
                          }
                          placeholder="Select Asset Type"
                          styles={customStyles}
                          isSearchable
                          required
                          className="w-full"
                        />
                        {(formData.asset_type === "power_tools" ||
                          formData.asset_type === "machine") && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                              {formData.asset_type === "power_tools"
                                ? 'Tag prefix will auto-fill to "GL-" for Power Tools'
                                : "Tag type will be automatically enabled for Machinery"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="maintenance"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Maintenance <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          options={maintenanceOptions}
                          value={
                            maintenanceOptions.find(
                              (option) => option.value === formData.maintenance
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange("maintenance", selectedOption)
                          }
                          placeholder="Select Maintenance"
                          styles={customStyles}
                          isSearchable
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tag Type</Label>
                        <div className="flex items-center gap-2 pt-2">
                          <Checkbox
                            id="tag_type"
                            checked={formData.tag_type}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("tag_type", checked)
                            }
                            disabled={
                              formData.asset_type === "machine" ||
                              formData.asset_type === "power_tools"
                            }
                          />
                          <Label
                            htmlFor="tag_type"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Enable Tag
                            {(formData.asset_type === "machine" ||
                              formData.asset_type === "power_tools") && (
                              <span className="text-xs text-blue-600 ml-1">
                                (Auto-enabled)
                              </span>
                            )}
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="tag_prefix"
                          className="text-sm font-medium"
                        >
                          Tag Prefix
                        </Label>
                        <div className="flex items-center gap-2">
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
                            placeholder={
                              formData.asset_type === "power_tools"
                                ? "GL-"
                                : formData.asset_type === "machine"
                                ? "First 3 chars of name"
                                : "First 3 chars of name"
                            }
                            maxLength={
                              formData.asset_type === "power_tools" ? 3 : 3
                            }
                            className="uppercase w-full focus:ring-blue-500 focus:border-blue-500"
                            readOnly={formData.asset_type === "power_tools"}
                          />
                          {formData.asset_type === "power_tools" && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.asset_type === "power_tools"
                            ? "Fixed prefix for Power Tools"
                            : formData.asset_type === "machine"
                            ? "First 3 characters of asset name"
                            : "First 3 characters of asset name"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. Linked Inventory & Documentation */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      6. Linked Inventory & Documentation
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Link to inventory items and upload files
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="linked_inventory_id"
                            className="text-sm font-medium"
                          >
                            Linked Inventory Item
                          </Label>
                          <Select
                            options={inventoryItemOptions}
                            value={
                              inventoryItemOptions.find(
                                (option) =>
                                  option.value === formData.linked_inventory_id
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              handleSelectChange(
                                "linked_inventory_id",
                                selectedOption
                              )
                            }
                            placeholder="Select inventory item"
                            styles={customStyles}
                            isSearchable
                            className="w-full"
                            isLoading={fetchingData}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Link this asset to an existing inventory item
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="assetPicture"
                            className="text-sm font-medium"
                          >
                            Upload Picture
                          </Label>
                          {imagePreview || existingImage ? (
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <img
                                src={imagePreview || existingImage}
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
                              {existingImage && !imagePreview && (
                                <div className="absolute top-2 left-2">
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                    Existing Image
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  JPEG, PNG, GIF, SVG (MAX. 2MB)
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                                onChange={(e) => handleFileChange(e, "picture")}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="assetDocument"
                            className="text-sm font-medium"
                          >
                            Document Attachment
                          </Label>
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileText className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Multiple files can be attached (MAX. 5MB each)
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              onChange={(e) => handleFileChange(e, "documents")}
                            />
                          </label>

                          {/* Existing Documents */}
                          {existingDocuments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium">
                                Existing files:
                              </p>
                              {existingDocuments.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-blue-50 rounded border w-full"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm truncate">
                                      {doc.name ||
                                        doc.filename ||
                                        `Document ${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {doc.url && (
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                        title="View document"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeExistingDocument(index)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                      title="Remove document"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* New Documents */}
                          {documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium">
                                New files to upload:
                              </p>
                              {documents.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-green-50 rounded border w-full"
                                >
                                  <span className="text-sm truncate flex-1">
                                    {doc.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="remarks"
                            className="text-sm font-medium"
                          >
                            Remarks
                          </Label>
                          <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) =>
                              handleInputChange("remarks", e.target.value)
                            }
                            placeholder="Additional notes or remarks..."
                            rows={4}
                            className="w-full focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/assets")}
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 px-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 flex items-center gap-2"
                    disabled={loading || fetchingData}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating Asset...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Asset
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditAsset;
