// components/Modals/AddToPOModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import inventoryItemAPI from "../../lib/InventoryItemApi";
import vendorAPI from "../../lib/vendorApi";
import dayjs from "dayjs";

const AddToPOModal = ({ isOpen, onClose, item, location }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    poType: "new",
    existingPO: "",
    vendor: "",
    orderQty: "",
    unitCost: item?.unit_cost || "",
    expectedDate: "",
  });

  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // React Select options
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

  // Mock data - replace with API calls
  useEffect(() => {
    if (isOpen) {
      // Simulate API calls for vendors and purchase orders

      getVendors();
      getPurchaseOrders();

      setFormData({
        poType: "new",
        existingPO: "",
        vendor: "",
        orderQty: "",
        unitCost: item?.unit_cost || "",
        expectedDate: "",
      });
    }
  }, [isOpen, item]);
  const getPurchaseOrders = async () => {
    try {
      const res = await inventoryItemAPI.getDraftPO(); // returns array
      console.log("POs:", res.data);
      const formatted = res.data.map((po) => ({
        value: po.id,
        label: `${po.po_number} | ${dayjs(po.created_at).format(
          "DD MMM YYYY"
        )} | ${po.vendor?.name ?? ""}`,
      }));

      setPurchaseOrders(formatted);
    } catch (error) {
      console.error("Error fetching draft POs:", error);
    }
  };

  const getVendors = async () => {
    try {
      const res = await vendorAPI.getAll(); // returns array of vendors

      const formatted = res.map((v) => ({
        value: v.id,
        label: v.name, // OR `${v.vendor_code} - ${v.name}`
      }));

      setVendors(formatted);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.poType === "new") {
        // ---- CREATE NEW PO ----
        const payload = {
          vendor_id: formData.vendor,
          items: [
            {
              inventory_item_id: item.id,
              quantity: formData.orderQty,
              rate: formData.unitCost,
              uom: item.uom || "PCS",
              description: item.item_description || item.item_code,
            },
          ],
        };

        const res = await inventoryItemAPI.addItemtoExistingPO(payload);
        console.log("New PO created:", res);
        alert("Purchase Order created successfully");
      } else if (formData.poType === "existing") {
        // ---- ADD ITEM TO EXISTING PO ----
        const payload = {
          po_id: formData.existingPO,
          item_id: item.id,
          qty: parseFloat(formData.orderQty),
          rate: parseFloat(formData.unitCost),
        };

        const res = await inventoryItemAPI.addItemtoExistingPO(payload);
        console.log("Item added to existing PO:", res);
        alert("Item added to existing Purchase Order");
      }

      // Reset form & close modal
      setFormData({
        poType: "new",
        existingPO: "",
        vendor: "",
        orderQty: "",
        unitCost: item?.unit_cost || "",
        expectedDate: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting PO:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const pendingPOQty = location?.pendingPOQty || 0;
  const currentStock =
    location?.currentQty === "-" ? 0 : parseInt(location?.currentQty) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add to Purchase Order
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create or add to purchase order for {item?.item_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Item Information Row */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Number
                </label>
                <input
                  type="text"
                  value={item?.item_code || "—"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location?.name || "—"}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-600"
                />
              </div>
            </div>

            {/* Stock Information Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock Qty
                </label>
                <input
                  type="text"
                  value={currentStock}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pending PO Qty
                </label>
                <input
                  type="text"
                  value={pendingPOQty}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* PO Type Radio Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Purchase Order Type
              </label>
              <div className="flex gap-6">
                <label className="flex items-center hidden">
                  <input
                    type="radio"
                    name="poType"
                    value="new"
                    checked={formData.poType === "new"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        poType: e.target.value,
                        existingPO: "",
                      })
                    }
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    New Purchase Order
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="poType"
                    value="existing"
                    checked={formData.poType === "existing"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        poType: e.target.value,
                        vendor: "",
                      })
                    }
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Existing Purchase Order
                  </span>
                </label>
              </div>
            </div>

            {/* Existing PO Selection */}
            {formData.poType === "existing" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Purchase Order *
                </label>
                <Select
                  options={purchaseOrders}
                  value={purchaseOrders.find(
                    (opt) => opt.value === formData.existingPO
                  )}
                  onChange={(selected) =>
                    setFormData({ ...formData, existingPO: selected.value })
                  }
                  placeholder="Select purchase order..."
                  styles={customStyles}
                />
              </div>
            )}

            {/* Vendor Selection */}
            {formData.poType === "new" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vendor *
                </label>
                <Select
                  options={vendors}
                  value={vendors.find((opt) => opt.value === formData.vendor)}
                  onChange={(selected) =>
                    setFormData({ ...formData, vendor: selected.value })
                  }
                  placeholder="Select vendor..."
                  styles={customStyles}
                />
              </div>
            )}

            {/* Order Details Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.orderQty}
                  onChange={(e) =>
                    setFormData({ ...formData, orderQty: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Cost *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Total Cost Calculation */}
            {formData.orderQty && formData.unitCost && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Total Cost:
                  </span>
                  <span className="text-lg font-semibold text-green-700">
                    $
                    {(
                      parseFloat(formData.orderQty) *
                      parseFloat(formData.unitCost)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.orderQty ||
                !formData.unitCost ||
                (formData.poType === "new" && !formData.vendor) ||
                (formData.poType === "existing" && !formData.existingPO)
              }
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formData.poType === "new"
                ? "Create Purchase Order"
                : "Add to PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToPOModal;
