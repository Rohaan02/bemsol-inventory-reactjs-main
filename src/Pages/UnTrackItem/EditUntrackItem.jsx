// src/Pages/UntrackItem/EditUntrackItem.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@radix-ui/themes";
import ImagePreview from "../../components/ui/image-preview";
import { toast } from "react-toastify";
import untrackItemAPI from "../../lib/untrackItemAPI";
import inventoryItemAPI from "../../lib/InventoryItemApi";
import Select from "react-select";

// ✅ Add your layout imports
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const EditUntrackItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [savedImageUrl, setSavedImageUrl] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    item_number: "",
    item_name: "",
    specification: "",
    description: "",
    picture: null,
    linked_item_id: "",
    tag: "",
    remarks: "",
    service_status: "",
  });

  // Options for dropdowns
  const tagOptions = [
    { value: "Sample", label: "Sample" },
    { value: "Spare", label: "Spare" },
    { value: "For Repair", label: "For Repair" },
    { value: "Broken", label: "Broken" },
    { value: "New", label: "New" },
  ];

  const statusOptions = [
    { value: "Sample", label: "Sample" },
    { value: "Broken", label: "Broken" },
    { value: "For Repair", label: "For Repair" },
    { value: "Spare", label: "Spare" },
    { value: "Installed", label: "Installed" },
  ];

  // Format data for react-select
  const itemOptions = items.map((item) => ({
    value: item.id.toString(),
    label: `${item.item_name} - ${item.item_code}`,
  }));

  // ✅ Fetch inventory items and existing untracked item
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchItems = async () => {
    try {
      const data = await inventoryItemAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load inventory items");
    }
  };

  const fetchData = async () => {
    try {
      setFetching(true);

      // Fetch inventory items
      await fetchItems();

      // Fetch untracked item data
      const response = await untrackItemAPI.getById(id);
      const data = response.data || response;

      console.log("Fetched untracked item data:", data);

      // Set saved image URL if exists
      if (data.picture_url) {
        setSavedImageUrl(data.picture_url);
      }

      setFormData({
        item_number: data.item_number || "",
        item_name: data.item_name || "",
        specification: data.specification || "",
        description: data.description || "",
        picture: null,
        linked_item_id: data.linked_item_id?.toString() || "",
        tag: data.tag || "Sample",
        remarks: data.remarks || "",
        service_status: data.service_status || "Sample",
      });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch data");
    } finally {
      setFetching(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user selects an option
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle file upload
  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, picture: file }));
    // Clear saved image URL when new file is selected
    if (file) {
      setSavedImageUrl("");
    }
  };

  // ✅ Handle remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, picture: null }));
    setSavedImageUrl("");
  };

  // ✅ Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.item_name || formData.item_name.trim() === "") {
      errors.item_name = "Item name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick validation
    if (!formData.item_name || formData.item_name.trim() === "") {
      toast.error("Item name is required");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      submitData.append("item_name", formData.item_name);
      submitData.append("item_number", formData.item_number);
      submitData.append("specification", formData.specification);
      submitData.append("description", formData.description);
      submitData.append("linked_item_id", formData.linked_item_id);
      submitData.append("tag", formData.tag);
      submitData.append("remarks", formData.remarks);
      submitData.append("service_status", formData.service_status);

      if (formData.picture) {
        submitData.append("picture", formData.picture);
      }

      console.log("Final submission - item_name:", formData.item_name);

      await untrackItemAPI.update(id, submitData);
      toast.success("Untracked item updated successfully");
      navigate("/untracked-items");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "42px",
      minHeight: "42px",
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

  // Get current values for dropdowns
  const currentItem =
    itemOptions.find((option) => option.value === formData.linked_item_id) ||
    null;
  const currentTag =
    tagOptions.find((option) => option.value === formData.tag) || tagOptions[0];
  const currentStatus =
    statusOptions.find((option) => option.value === formData.service_status) ||
    statusOptions[0];

  // Check if we have any image to display (saved or new)
  const hasImage = savedImageUrl || formData.picture;

  if (fetching) {
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* <Header /> */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {/* <Header /> */}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Untracked Item</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Item Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Number
                    </label>
                    <Input
                      type="text"
                      name="item_number"
                      value={formData.item_number || ""}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  {/* Item Name - Required Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="item_name"
                      value={formData.item_name || ""}
                      onChange={handleChange}
                      className={`w-full ${
                        formErrors.item_name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      placeholder="Enter item name"
                    />
                    {formErrors.item_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.item_name}
                      </p>
                    )}
                  </div>

                  {/* Specification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specification
                    </label>
                    <Input
                      type="text"
                      name="specification"
                      value={formData.specification || ""}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Linked Inventory Item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Linked Inventory Item
                    </label>
                    <Select
                      options={itemOptions}
                      value={currentItem}
                      onChange={(selectedOption) =>
                        handleSelectChange("linked_item_id", selectedOption)
                      }
                      placeholder="Select an inventory item"
                      styles={customStyles}
                      isSearchable
                      isClearable
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag
                    </label>
                    <Select
                      options={tagOptions}
                      value={currentTag}
                      onChange={(selectedOption) =>
                        handleSelectChange("tag", selectedOption)
                      }
                      placeholder="Select Tag"
                      styles={customStyles}
                    />
                  </div>

                  {/* Service Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Status
                    </label>
                    <Select
                      options={statusOptions}
                      value={currentStatus}
                      onChange={(selectedOption) =>
                        handleSelectChange("service_status", selectedOption)
                      }
                      placeholder="Select Status"
                      styles={customStyles}
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="Additional notes or comments..."
                    />
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="border-t pt-6 mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Item Image
                </label>
                <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
                  {hasImage ? (
                    <div className="flex flex-col items-center space-y-4 w-full">
                      <div className="relative">
                        {savedImageUrl ? (
                          <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            <img
                              src={savedImageUrl}
                              alt="Saved item"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <ImagePreview
                            file={formData.picture}
                            onChange={handleFileChange}
                            size="lg"
                          />
                        )}
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                          type="button"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {savedImageUrl
                          ? "Click the remove button to delete the image"
                          : "Click the image to change or use remove button above"}
                      </p>
                      {savedImageUrl && (
                        <div className="text-center">
                          <ImagePreview
                            file={formData.picture}
                            onChange={handleFileChange}
                            size="md"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Or click above to upload a new image
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors w-full">
                      <ImagePreview
                        file={formData.picture}
                        onChange={handleFileChange}
                        size="lg"
                      />
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Click to upload item image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => navigate("/untracked-items")}
                  variant="danger"
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className=" px-8"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Item"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUntrackItem;
