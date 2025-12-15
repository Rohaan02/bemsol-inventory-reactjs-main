import React, { useState } from "react";

const ShipmentsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const tabs = [
    "All",
    "In Transit",
    "Delivered",
    "Pending",
    "Cancelled",
    "Closed",
    "Completed",
  ];

  const shipments = [
    {
      id: "S25-00001",
      origin: "Market Purchase",
      destination: "Warehouse A, NY",
      type: "Market Purchase",
      date: "2023-10-26",
    },
    {
      id: "S25-00002",
      origin: "Warehouse B, IL",
      destination: "Vendor Supply Co.",
      type: "Send to Vendor",
      date: "2023-10-22",
    },
    {
      id: "S25-00003",
      origin: "Warehouse A, NY",
      destination: "Warehouse B, IL",
      type: "Inter-Store Transfer",
      date: "2023-10-20",
    },
    {
      id: "S25-00004",
      origin: "Market Purchase",
      destination: "Warehouse B, IL",
      type: "Market Purchase",
      date: "2023-10-18",
    },
    {
      id: "S25-00005",
      origin: "Warehouse A, NY",
      destination: "Retail Store, NV",
      type: "Inter-Store Transfer",
      date: "2023-10-15",
    },
    {
      id: "S25-00006",
      origin: "Warehouse B, IL",
      destination: "Vendor Supply Co.",
      type: "Send to Vendor",
      date: "2023-10-12",
    },
  ];

  return (
    <div className="min-h-screen bg-background-light font-display text-gray-800 p-8">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-4xl font-black text-[#052e16] leading-tight tracking-tight">
          Shipments
        </h1>
        <button
          onClick={() => console.log("Create New")}
          className="flex items-center justify-center rounded-[0.5rem] h-10 px-4 bg-[#052e16] text-white text-sm font-bold shadow-sm hover:opacity-90 transition"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          <span className="truncate">Create New</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                activeTab === tab
                  ? "bg-[#052e16]/20 text-[#052e16]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <label className="flex flex-col min-w-[10rem] h-12 w-full">
          <div className="flex w-full items-stretch rounded-[0.5rem] h-full">
            <div className="flex items-center justify-center pl-4 bg-gray-100 rounded-l-[0.5rem] border border-r-0 border-gray-200 text-gray-500">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, origin, destination..."
              className="flex-1 px-4 h-full rounded-r-[0.5rem] border border-gray-200 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#052e16]/50"
            />
          </div>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                ID#
              </th>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                Origin
              </th>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                Type
              </th>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                Created Date
              </th>
              <th className="px-4 py-3 text-left text-gray-600 text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-gray-900 text-sm">{s.id}</td>
                <td className="px-4 py-2 text-gray-900 text-sm">{s.origin}</td>
                <td className="px-4 py-2 text-gray-500 text-sm">
                  {s.destination}
                </td>
                <td className="px-4 py-2 text-gray-500 text-sm">{s.type}</td>
                <td className="px-4 py-2 text-gray-500 text-sm">{s.date}</td>
                <td className="px-4 py-2 text-gray-500 text-sm font-bold">
                  <button
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
                  >
                    <span className="material-symbols-outlined">•••</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isActionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">Actions</h2>
              <p className="text-gray-600">
                This is a placeholder for shipment actions. You can add options
                like 'View Details', 'Edit Shipment', 'Cancel Shipment', etc.
              </p>
              <button
                onClick={() => setIsActionsOpen(false)}
                className="mt-4 w-full h-10 px-4 bg-gray-200 text-gray-900 rounded-[0.5rem] font-bold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsList;
