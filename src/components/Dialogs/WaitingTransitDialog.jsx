import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";

export const WaitingTransitDialog = ({ open, onOpenChange }) => {
  const [selectedShipment, setSelectedShipment] = useState("SHP-2023-089");
  const [selectedItemsCount, setSelectedItemsCount] = useState(2);
  const [items, setItems] = useState([
    {
      id: "ITM-TRANS-001",
      name: "Safety Helmets - Yellow",
      uom: "Unit",
      availableQty: 45,
      qtyToAdd: 45,
      selected: true,
    },
    {
      id: "ITM-TRANS-005",
      name: "Reflective Vests (L)",
      uom: "Box",
      availableQty: 12,
      qtyToAdd: 10,
      selected: true,
    },
    {
      id: "ITM-TRANS-008",
      name: "Industrial Gloves",
      uom: "Pair",
      availableQty: 200,
      qtyToAdd: 0,
      selected: false,
    },
    {
      id: "ITM-TRANS-012",
      name: "First Aid Kit (Std)",
      uom: "Unit",
      availableQty: 5,
      qtyToAdd: 0,
      selected: false,
    },
  ]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const toggleItem = (index) => {
    const newItems = [...items];
    newItems[index].selected = !newItems[index].selected;
    setItems(newItems);
    setSelectedItemsCount(newItems.filter((i) => i.selected).length);
  };

  const handleQtyChange = (index, value) => {
    const newItems = [...items];
    newItems[index].qtyToAdd = Number(value);
    setItems(newItems);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      ></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-[#052e16]">
            Add Waiting Transit Item
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          {/* Left - Shipments */}
          <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select Shipment
              </h4>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-icons text-gray-400 text-sm">
                    search
                  </span>
                </span>
                <Input
                  className="pl-9 pr-3 py-1.5 text-sm w-full"
                  placeholder="Search Shipment No..."
                />
              </div>
            </div>
            <ul className="divide-y divide-gray-100">
              {["SHP-2023-089", "SHP-2023-092", "SHP-2023-104"].map((ship) => (
                <li key={ship}>
                  <div
                    onClick={() => setSelectedShipment(ship)}
                    className={`w-full cursor-pointer text-left px-4 py-4 border-l-4 shadow-sm ${
                      selectedShipment === ship
                        ? "bg-white border-primary"
                        : "border-transparent hover:bg-gray-50 transition-colors"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`font-medium ${
                          selectedShipment === ship
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {ship}
                      </span>
                      {ship === "SHP-2023-089" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Origin: Warehouse A
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
                      3 Waiting Items
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Item Table */}
          <div className="w-3/4 flex flex-col bg-white">
            <div className="p-6 pb-2 flex justify-between items-end mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Waiting Transit Items
                </h4>
                <p className="text-sm text-gray-500">
                  Shipment:{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedShipment}
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Selected:{" "}
                <span className="font-bold text-primary">
                  {selectedItemsCount} items
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 pb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold">
                      <input type="checkbox" />
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold">
                      Item Code
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold">
                      Item Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold">
                      UOM
                    </th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold">
                      Available Qty
                    </th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold w-32">
                      Qty to Add
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={item.selected ? "bg-emerald-50/30" : ""}
                    >
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(idx)}
                        />
                      </td>
                      <td className="px-3 py-4 font-medium">{item.id}</td>
                      <td className="px-3 py-4">{item.name}</td>
                      <td className="px-3 py-4">{item.uom}</td>
                      <td className="px-3 py-4 text-right">
                        {item.availableQty}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Input
                          type="number"
                          value={item.qtyToAdd}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          disabled={!item.selected}
                          className="text-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-emerald-700 flex items-center gap-2">
                <span className="material-icons text-sm">check</span>
                Add Selected Items ({selectedItemsCount})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
