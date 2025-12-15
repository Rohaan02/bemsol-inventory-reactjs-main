import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VBRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const vbrStatus = "Approved";

  const tabs = [
    "All",
    "Waiting Transit",
    "In-shipment",
    "In-transit",
    "Completed",
    "Cancelled",
  ];

  const quotations = [
    {
      vendor: "FastTracks Logistics",
      vehicle: "Mazda (Open)",
      price: "45,000",
      date: "Oct 24, 2025",
      status: "Approved",
    },
    {
      vendor: "Global Transporters",
      vehicle: "Shehzore",
      price: "52,000",
      date: "Oct 23, 2025",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono flex items-center gap-3">
            {id}
            <span className="text-lg font-sans font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-md border border-green-200 dark:border-green-800">
              [Status: Approved]
            </span>
          </h1>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Transporter
          </span>
        </div>

        <div className="flex gap-2">
          {/* Activity Button */}
          <button
            onClick={() => {
              document
                .getElementById("details-content")
                .classList.add("hidden");
              document
                .getElementById("activity-content")
                .classList.remove("hidden");
            }}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
          >
            <span className="material-symbols-outlined text-sm text-gray-500">
              history
            </span>
            Activity
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
          >
            <span className="material-symbols-outlined text-sm text-gray-500">
              print
            </span>
            Print
          </button>

          {/* Edit Request Button */}
          <button className="inline-flex items-center gap-2 rounded-md bg-sidebar-green px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">
            <span className="material-symbols-outlined text-sm text-white">
              edit
            </span>
            Edit Request
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Created on Oct 24, 2025 by John Doe
      </p>

      {/* Tabs */}
      <div className="border-b mb-6 flex gap-6 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          ["Shipment Numbers", "SHP-10023, SHP-10024"],
          ["Route", "Lahore → Karachi"],
          ["Total Weight", "4,500 KG"],
          ["Vehicle Type Req.", "Mazda / Flatbed"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border rounded-lg p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">
              {label}
            </p>
            <p className="mt-1 text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Quotation */}
          <div className="bg-white border rounded-xl">
            <div className="px-6 py-4 border-b flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
              <span className="material-symbols-outlined text-blue-600">
                local_shipping
              </span>
              <h3 className="text-lg font-semibold">Transporter Quotations</h3>
            </div>

            <div className="p-4 bg-blue-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="border rounded px-2 py-1.5 text-sm">
                  <option>Select Vendor</option>
                  <option>FastTracks Logistics</option>
                  <option>Global Transporters</option>
                </select>

                <input
                  placeholder="Vehicle Type"
                  className="border rounded px-2 py-1.5 text-sm"
                />

                <input
                  placeholder="Cost (PKR)"
                  type="number"
                  className="border rounded px-2 py-1.5 text-sm"
                />

                <button className="bg-blue-600 text-white rounded text-sm">
                  Submit
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Vendor</th>
                    <th className="px-6 py-3 text-left">Vehicle</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotations.map((q, i) => (
                    <tr
                      key={i}
                      className={q.status === "Approved" ? "bg-green-50" : ""}
                    >
                      <td className="px-6 py-4 font-medium">{q.vendor}</td>
                      <td className="px-6 py-4 text-gray-500">{q.vehicle}</td>
                      <td className="px-6 py-4 font-semibold">{q.price}</td>
                      <td className="px-6 py-4 text-gray-500">{q.date}</td>
                      <td className="px-6 py-4 text-right">
                        {q.status === "Approved" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs">
                            Approved
                          </span>
                        ) : (
                          <button className="text-blue-600 text-sm">
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b font-semibold">Items in VBR</div>

          <div>
            <div className="bg-gray-50 px-5 py-2 flex justify-between text-xs font-bold">
              Shipment # SHP-10023
              <span className="bg-green-100 text-green-700 px-2 rounded">
                Ready
              </span>
            </div>

            <ul className="divide-y">
              <li className="px-5 py-3 flex justify-between">
                <div>
                  <p className="font-medium">Induction Motor 5HP</p>
                  <p className="text-xs text-gray-500">IM-5002</p>
                </div>
                <p className="font-bold">2 Units</p>
              </li>

              <li className="px-5 py-3 flex justify-between">
                <div>
                  <p className="font-medium">Copper Wiring Roll</p>
                  <p className="text-xs text-gray-500">CW-200</p>
                </div>
                <p className="font-bold">50 Meters</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-xs text-gray-400">
        © 2025 LogiTrack Systems. All rights reserved.
      </div>
    </div>
  );
};

export default VBRDetails;
