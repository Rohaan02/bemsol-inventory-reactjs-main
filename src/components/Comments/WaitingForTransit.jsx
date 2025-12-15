import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const WaitingForTransit = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const shipmentData = [
    {
      serialNo: "WT-00001",
      itemCode: "SB-2023",
      itemName: "Steel Beams",
      specification: "I-Beam, 30ft",
      uom: "Units",
      quantity: "150",
      origin: "Main Warehouse",
      destination: "Site A",
      type: "Purchase Order",
      status: "Waiting Transit",
    },
    {
      serialNo: "WT-00002",
      itemCode: "CM-2023",
      itemName: "Concrete Mix",
      specification: "Grade 40",
      uom: "Bags",
      quantity: "500",
      origin: "Supplier Depot",
      destination: "Site B",
      type: "Purchase Order",
      status: "In-shipment",
    },
    {
      serialNo: "WT-00003",
      itemCode: "SH-2023",
      itemName: "Safety Helmets",
      specification: "Type 1, Class E",
      uom: "Units",
      quantity: "200",
      origin: "Site A Store",
      destination: "Site C Store",
      type: "Inter Store Transfer",
      status: "In-transit",
    },
    {
      serialNo: "WT-00004",
      itemCode: "PP-45/B",
      itemName: "Pump Parts",
      specification: "Impeller #87B",
      uom: "Set",
      quantity: "5",
      origin: "Main Warehouse",
      destination: "Vendor Repair Shop",
      type: "Vendor",
      status: "Completed",
    },
  ];

  const tabsList = [
    "All",
    "Waiting Transit",
    "In-shipment",
    "In-transit",
    "Completed",
    "Cancelled",
  ];

  const filteredByTab = shipmentData.filter((s) =>
    activeTab === "All" ? true : s.status === activeTab
  );

  const filteredData = filteredByTab.filter((s) =>
    `${s.itemCode} ${s.itemName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-5">
      <h1 className="text-2xl font-semibold text-slate-800">
        Waiting for Transit
      </h1>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="mt-4"
      >
        <TabsList className="flex gap-2">
          {tabsList.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="mt-4 max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by item code, name, reference..."
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No</TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Specification</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((s, i) => (
              <TableRow key={i}>
                <TableCell>{s.serialNo}</TableCell>
                <TableCell>{s.itemCode}</TableCell>
                <TableCell>{s.itemName}</TableCell>
                <TableCell>{s.specification}</TableCell>
                <TableCell>{s.uom}</TableCell>
                <TableCell>{s.quantity}</TableCell>
                <TableCell>{s.origin}</TableCell>
                <TableCell>{s.destination}</TableCell>
                <TableCell>{s.type}</TableCell>
                <TableCell>
                  <td className="px-4 py-2 text-gray-500 text-sm font-bold">
                    <button
                      onClick={() => setIsActionsOpen(!isActionsOpen)}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
                    >
                      <span className="material-symbols-outlined">•••</span>
                    </button>
                  </td>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filteredData.length && (
          <p className="p-4 text-center text-slate-600">No data found.</p>
        )}
      </div>
    </div>
  );
};

export default WaitingForTransit;
