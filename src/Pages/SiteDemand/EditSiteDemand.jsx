import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import inventoryItemAPI from "../../lib/InventoryItemApi";
import locationAPI from "../../lib/locationAPI";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import Select from "react-select";

const EditSiteDemand = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demand, setDemand] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    date: "",
    required_date: "",
    item_name: "",
    quantity: "",
    inventory_item_id: "",
    location_id: "",
    priority: "Medium",
    fulfillment_type: "site_purchase",
    processing_status: "Pending",
    remarks: "",
    image: null,
    demand_no: "",
    purpose: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const isImageRequired =
    !formData.inventory_item_id && formData.item_name.trim() !== "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch demand data
        const demandRes = await siteDemandAPI.getById(id);
        const demandData = demandRes.data || demandRes;
        setDemand(demandData);

        // Set form data
        setFormData({
          date: demandData.date?.split("T")[0] || "",
          required_date: demandData.required_date?.split("T")[0] || "",
          item_name: demandData.item_name || "",
          quantity: demandData.quantity || 0,
          inventory_item_id: demandData.inventory_item_id || "",
          location_id: demandData.location_id || "",
          priority: demandData.priority || "Medium",
          fulfillment_type: demandData.fulfillment_type || "site_purchase",
          processing_status: demandData.processing_status || "Pending",
          remarks: demandData.remarks || "",
          image: demandData.image || null,
          demand_no: demandData.demand_no || "",
          purpose: demandData.purpose || "",
        });

        // Set image preview if exists
        if (demandData.image_url) {
          setImagePreview(demandData.image_url);
        }

        // Fetch inventory items and locations
        const [items, locationsData] = await Promise.all([
          inventoryItemAPI.getAll(),
          locationAPI.getAll(),
        ]);
        setInventoryItems(items);
        setLocations(locationsData);

        // Set selected item if inventory_item_id exists
        if (demandData.inventory_item_id) {
          const item = items.find(
            (item) => item.id === demandData.inventory_item_id
          );
          setSelectedItem(item || null);
        }

        // Set selected location if location_id exists
        if (demandData.location_id) {
          const location = locationsData.find(
            (loc) => loc.id === demandData.location_id
          );
          setSelectedLocation(location || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load site demand data");
        navigate("/site-demands");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // Fetch stock info when item or location changes
  useEffect(() => {
    const checkStockInfo = async () => {
      if (formData.inventory_item_id && formData.location_id) {
        try {
          const stockData = await siteDemandAPI.getStockInfo(
            formData.inventory_item_id,
            formData.location_id
          );
          setStockInfo(stockData);
        } catch (error) {
          console.error("Failed to fetch stock info:", error);
          setStockInfo(null);
        }
      } else {
        setStockInfo(null);
      }
    };

    checkStockInfo();
  }, [formData.inventory_item_id, formData.location_id]);

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" },
  ];

  const fulfillmentTypeOptions = [
    { value: "site_purchase", label: "Site Purchase" },
    { value: "inter_store_transfer", label: "Inter Store Transfer" },
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Process", label: "In Process" },
    { value: "Completed", label: "Completed" },
    { value: "Rejected", label: "Rejected" },
  ];

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

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
    data: location,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "inventory_item_id") {
      const item = selectedOption ? selectedOption.data : null;
      setSelectedItem(item);

      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
        item_name: selectedOption ? selectedOption.data.item_name : "",
      }));
    } else if (name === "location_id") {
      const location = selectedOption ? selectedOption.data : null;
      setSelectedLocation(location);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      quantity: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📝 Form data to be submitted:", formData);
    setLoading(true);

    try {
      const submitData = new FormData();

      // Tell Laravel this is a PUT request
      submitData.append("_method", "PUT");

      // Append specific fields you want to update
      submitData.append("remarks", formData.remarks || "");
      submitData.append("quantity", formData.quantity || "");
      submitData.append("priority", formData.priority || "");
      submitData.append("fulfillment_type", formData.fulfillment_type || "");
      submitData.append("processing_status", formData.processing_status || "");
      submitData.append("required_date", formData.required_date || "");
      submitData.append("location_id", formData.location_id || "");
      submitData.append("inventory_item_id", formData.inventory_item_id || "");
      submitData.append("item_name", formData.item_name || "");

      // Append image if exists
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      // Debug log to confirm FormData contents
      console.log("📦 FormData entries:");
      for (let pair of submitData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      // Send as POST (Laravel interprets as PUT)
      const response = await siteDemandAPI.update(id, submitData);

      console.log("✅ Update response:", response);

      if (response.success) {
        toast.success("Site demand updated successfully");
        navigate("/site-demands");
      } else {
        toast.error(response.message || "Failed to update site demand");
      }
    } catch (error) {
      console.error("❌ Error updating site demand:", error);
      console.error("🔍 Error response:", error.response);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update site demand"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !demand) {
    return (
      <div className="flex h-full min-h-screen bg-gray-50">
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

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/site-demands")}
                className="flex items-center gap-2 bg-primary-color hover:bg-primary-color-hover text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Edit Site Demand
                </h1>
                <p className="text-gray-600 mt-1">
                  {demand?.demand_no && `Demand No: ${demand.demand_no}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm border border-gray-200 bg-white">
              <form onSubmit={handleSubmit}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Edit Demand Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Stock Information */}
                  {stockInfo && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-blue-800">
                            Stock Information
                          </h4>
                          <p className="text-blue-700 text-sm">
                            Available Stock:{" "}
                            <strong>{stockInfo.available_stock}</strong> units
                            {formData.fulfillment_type ===
                              "inter_store_transfer" && (
                              <span
                                className={`ml-2 ${
                                  parseInt(formData.quantity) >
                                  stockInfo.available_stock
                                    ? "text-red-600 font-semibold"
                                    : "text-green-600"
                                }`}
                              >
                                (Requested: {formData.quantity || 0})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Required Date */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="required_date"
                        className="text-sm font-medium text-gray-700"
                      >
                        Required Date *
                      </Label>
                      <Input
                        type="date"
                        id="required_date"
                        name="required_date"
                        value={formData.required_date}
                        onChange={handleInputChange}
                        required
                        min={formData.date}
                        className="mt-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Demand Number (Read-only) */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="demand_no"
                        className="text-sm font-medium text-gray-700"
                      >
                        Site Demand Number
                      </Label>
                      <Input
                        type="text"
                        id="demand_no"
                        name="demand_no"
                        value={formData.demand_no}
                        readOnly
                        className="mt-1 focus:ring-green-500 focus:border-green-500 bg-gray-50 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-generated sequential number (cannot be changed)
                      </p>
                    </div>

                    {/* Location Selection */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="location_id"
                        className="text-sm font-medium text-gray-700"
                      >
                        Location *
                      </Label>
                      <Select
                        options={locationOptions}
                        value={
                          locationOptions.find(
                            (option) => option.value === formData.location_id
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("location_id", selectedOption)
                        }
                        placeholder="Select location..."
                        styles={customStyles}
                        isClearable
                        isSearchable
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="demand_purpose"
                        className="text-sm font-medium text-gray-700"
                      >
                        Demand Purpose
                      </Label>
                      <Input
                        type="text"
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        placeholder="Enter purpose of this demand"
                        className="mt-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Inventory Item Selection with Images */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="inventory_item_id"
                        className="text-sm font-medium text-gray-700"
                      >
                        Select Inventory Item
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
                        placeholder="Search and select inventory item..."
                        styles={customStyles}
                        formatOptionLabel={formatOptionLabel}
                        isClearable
                        isSearchable
                      />
                    </div>

                    {/* Item Name and Quantity */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="item_name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Item Name *
                        </Label>
                        <Input
                          type="text"
                          id="item_name"
                          name="item_name"
                          value={formData.item_name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter item name"
                          readOnly={!!formData.inventory_item_id}
                          className={`mt-1 focus:ring-green-500 focus:border-green-500 ${
                            formData.inventory_item_id ? "bg-gray-50" : ""
                          }`}
                        />
                        {!formData.inventory_item_id &&
                          formData.item_name.trim() !== "" && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Image upload required for manual item entry
                            </p>
                          )}
                      </div>

                      <div>
                        <Label
                          htmlFor="quantity"
                          className="text-sm font-medium text-gray-700"
                        >
                          Quantity *
                        </Label>
                        <Input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleQuantityChange}
                          required
                          min="1"
                          placeholder="Enter quantity"
                          className="mt-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="priority"
                        className="text-sm font-medium text-gray-700"
                      >
                        Priority *
                      </Label>
                      <Select
                        options={priorityOptions}
                        value={
                          priorityOptions.find(
                            (option) => option.value === formData.priority
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("priority", selectedOption)
                        }
                        styles={customStyles}
                        isSearchable={false}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="fulfillment_type"
                        className="text-sm font-medium text-gray-700"
                      >
                        Fulfillment Type *
                      </Label>
                      <Select
                        options={fulfillmentTypeOptions}
                        value={
                          fulfillmentTypeOptions.find(
                            (option) =>
                              option.value === formData.fulfillment_type
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange("fulfillment_type", selectedOption)
                        }
                        styles={customStyles}
                        isSearchable={false}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label
                        htmlFor="processing_status"
                        className="text-sm font-medium text-gray-700"
                      >
                        Processing Status *
                      </Label>
                      <Select
                        options={statusOptions}
                        value={
                          statusOptions.find(
                            (option) =>
                              option.value === formData.processing_status
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleSelectChange(
                            "processing_status",
                            selectedOption
                          )
                        }
                        styles={customStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Item Image
                      </Label>
                      {isImageRequired && (
                        <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                          Required *
                        </span>
                      )}
                    </div>

                    {isImageRequired && !imagePreview && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Image upload is required when entering item name
                          manually
                        </p>
                      </div>
                    )}

                    <div className="mt-1">
                      {!imagePreview ? (
                        <div
                          className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            isImageRequired && !imageFile
                              ? "border-amber-300 bg-amber-50"
                              : "border-gray-300"
                          }`}
                        >
                          <div className="space-y-1 text-center">
                            <ImageIcon
                              className={`mx-auto h-12 w-12 ${
                                isImageRequired && !imageFile
                                  ? "text-amber-400"
                                  : "text-gray-400"
                              }`}
                            />
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label
                                htmlFor="image-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                              >
                                <span>Upload an image</span>
                                <input
                                  id="image-upload"
                                  name="image"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  ref={fileInputRef}
                                  required={isImageRequired}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 2MB
                            </p>
                            {isImageRequired && (
                              <p className="text-xs text-amber-600 mt-1">
                                Image is required for this item
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-48 w-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {demand?.image && !imagePreview && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current image will be kept if no new image is uploaded
                      </p>
                    )}
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
                    className="bg-red-500 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-color text-white flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Updating..." : "Update Demand"}
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

export default EditSiteDemand;
