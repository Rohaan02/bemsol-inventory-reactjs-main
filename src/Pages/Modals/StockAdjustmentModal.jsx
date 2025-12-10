// components/Modals/StockAdjustmentModal.jsx
import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";
import inventoryItemAPI from "@/lib/InventoryItemApi"; // Your API client

const StockAdjustmentModal = ({
  isOpen,
  onClose,
  item,
  location,
  onAdjustmentSuccess,
}) => {
  const [formData, setFormData] = useState({
    adjustmentType: "increase",
    adjustmentQty: "",
    reason: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);

  // React Select options
  const reasonOptions = [
    { value: "damaged", label: "Damaged Goods" },
    { value: "count_error", label: "Count Error" },
    { value: "theft", label: "Theft/Loss" },
    { value: "expired", label: "Expired Items" },
    { value: "found", label: "Found Items" },
    { value: "quality_check", label: "Quality Check" },
    { value: "vendor_return", label: "Vendor Return" },
    { value: "customer_return", label: "Customer Return" },
    { value: "other", label: "Other" },
  ];

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      minHeight: "42px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.375rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#16a34a"
        : state.isFocused
        ? "#f0fdf4"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#16a34a",
      },
    }),
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        adjustmentType: "increase",
        adjustmentQty: "",
        reason: "",
        comments: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item?.id || !location?.location_id) {
      toast.error("Invalid item or location data");
      return;
    }

    const qty = Number(formData.adjustmentQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid numeric quantity");
      return;
    }

    setLoading(true);

    try {
      const adjustmentData = {
        inventory_item_id: item.id,
        location_id: location.location_id,
        adjustment_type: formData.adjustmentType,
        quantity: qty,
        reason: formData.reason,
        comments: formData.comments,
        transaction_type: "adjustment",
      };

      console.log("Adjustment data being sent:", adjustmentData);

      // Call your API to create the adjustment
      const response = await inventoryItemAPI.createAdjustment(adjustmentData);

      toast.success("Stock adjustment completed successfully!");

      if (onAdjustmentSuccess) {
        onAdjustmentSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error("Adjustment error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to complete stock adjustment";

      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages) => {
          messages.forEach((message) => toast.error(message));
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateNewQty = () => {
    if (!formData.adjustmentQty || location?.currentQty === "-")
      return location?.currentQty || "-";

    const adjustment = parseFloat(formData.adjustmentQty);
    const currentStock =
      location?.currentQty === "-" ? 0 : parseFloat(location.currentQty);

    if (isNaN(currentStock) || isNaN(adjustment)) return "-";

    return formData.adjustmentType === "increase"
      ? (currentStock + adjustment).toFixed(2)
      : (currentStock - adjustment).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Adjust Stock
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Adjust inventory for {item?.item_code} at {location?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Row 1: Item and Location (readonly) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item
                </label>
                <input
                  type="text"
                  value={item?.item_code || "—"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location?.name || "—"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Row 2: Current Qty and Adjustment Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Quantity
                </label>
                <input
                  type="text"
                  value={location?.currentQty || "0"}
                  readOnly
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${
                    location?.isOutOfStock ? "text-red-600" : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="increase"
                      checked={formData.adjustmentType === "increase"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adjustmentType: e.target.value,
                        })
                      }
                      className="mr-2 text-green-600 focus:ring-green-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Increase</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="decrease"
                      checked={formData.adjustmentType === "decrease"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adjustmentType: e.target.value,
                        })
                      }
                      className="mr-2 text-green-600 focus:ring-green-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Decrease</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 3: Adjustment Qty and New Qty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Quantity *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.adjustmentQty}
                  onChange={(e) =>
                    setFormData({ ...formData, adjustmentQty: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  required
                  placeholder="Enter quantity"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Quantity
                </label>
                <input
                  type="text"
                  value={calculateNewQty()}
                  readOnly
                  className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-md text-green-700 font-semibold"
                />
              </div>
            </div>

            {/* Row 4: Reason (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Adjustment *
              </label>
              <Select
                options={reasonOptions}
                value={reasonOptions.find(
                  (opt) => opt.value === formData.reason
                )}
                onChange={(selected) =>
                  setFormData({ ...formData, reason: selected?.value })
                }
                placeholder="Select a reason..."
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                required
                isDisabled={loading}
              />
            </div>

            {/* Row 5: Comments (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add any additional comments or details about this adjustment..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.adjustmentQty || !formData.reason || loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Adjustment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
