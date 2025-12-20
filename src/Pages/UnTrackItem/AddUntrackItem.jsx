import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import Checkbox from "@/components/ui/checkbox";
import ImagePreview from "../../components/ui/image-preview";
import { toast } from "react-toastify";
import untrackItemAPI from "../../lib/untrackItemAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";
// import vehicleAPI from "@/lib/vehicleAPI";
import Select from "react-select";

const AddUntrackItem = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    item_number: "",
    item_name: "",
    specification: "",
    description: "",

    picture: null,

    inventory_item_id: "",
    tag: "Sample",
    remarks: "",
    service_status: "Sample",
  });

  const tags = ["Sample", "Spare", "For Repair", "Broken", "New"];
  const statuses = ["Sample", "Broken", "For Repair", "Spare", "Installed"];

  // Format data for react-select
  const itemOptions = items.map((item) => ({
    value: item.id.toString(),
    label: `${item.item_name} - ${item.item_code}`,
  }));

  const tagOptions = tags.map((tag) => ({
    value: tag,
    label: tag,
  }));

  const statusOptions = statuses.map((status) => ({
    value: status,
    label: status,
  }));

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await inventoryItemAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    setForm((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await untrackItemAPI.create(form);
      toast.success("✅ Item saved successfully");
      navigate("/untracked-items");
    } catch (err) {
      if (err.response?.data?.errors) {
        // Laravel validation errors
        Object.values(err.response.data.errors)
          .flat()
          .forEach((msg) => toast.error(` ${msg}`));
      } else {
        // General error fallback
        toast.error(` ${err.response?.data?.message || "Failed to save item"}`);
      }
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

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* <Header /> */}

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="bg-gray-100 px-6 py-4 rounded-t-2xl border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                ➕ Add New Untracked Item
              </h2>
            </div>

            {/* Scrollable body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-200px)]"
            >
              <div className="grid grid-cols-6 gap-4">
                {/* Item Number */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Item Number
                  </label>
                  <Input
                    className="bg-gray-200 text-gray-900 text-sm rounded-lg cursor-not-allowed"
                    type="text"
                    name="item_number"
                    value={form.item_number}
                    readOnly
                  />
                </div>

                {/* Item Name */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <Input
                    type="text"
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Specification */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Specification
                  </label>
                  <Input
                    type="text"
                    name="specification"
                    value={form.specification}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>

                {/* Picture */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Picture
                  </label>
                  <ImagePreview
                    file={form.picture}
                    onChange={(file) => setForm({ ...form, picture: file })}
                  />
                </div>

                {/* Linked Vehicle */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Linked Inventory (Optional)
                  </label>
                  <Select
                    options={itemOptions}
                    value={
                      itemOptions.find(
                        (option) => option.value === form.inventory_item_id
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("inventory_item_id", selectedOption)
                    }
                    placeholder="Select a Invenotry Item"
                    styles={customStyles}
                    isSearchable
                    isClearable
                  />
                </div>

                {/* Tag */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Tag
                  </label>
                  <Select
                    options={tagOptions}
                    value={
                      tagOptions.find((option) => option.value === form.tag) ||
                      tagOptions[0]
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("tag", selectedOption)
                    }
                    placeholder="Select tag"
                    styles={customStyles}
                  />
                </div>

                {/* Service Status */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Service Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={
                      statusOptions.find(
                        (option) => option.value === form.service_status
                      ) || statusOptions[0]
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("service_status", selectedOption)
                    }
                    placeholder="Select status"
                    styles={customStyles}
                  />
                </div>

                {/* Remarks */}
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional notes or comments..."
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => navigate("/untracked-items")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="success"
                  className="text-white"
                >
                  {loading ? "Saving..." : "Save Item"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddUntrackItem;
