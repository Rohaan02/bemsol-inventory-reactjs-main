import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Checkbox from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const CreateShipment = () => {
  const [items, setItems] = useState([
    { id: "IT-00123", name: 'Steel Pipe 2"', uom: "Pcs", qty: 50, sendQty: 50 },
    {
      id: "IT-00456",
      name: "Cement Bag 50kg",
      uom: "Bag",
      qty: 100,
      sendQty: 80,
    },
  ]);

  useEffect(() => {
    const iconLink = document.createElement("link");
    iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  const [addedWeight, setAddedWeight] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [preReqs, setPreReqs] = useState({
    weighBridge: false,
    crane: false,
    lifter: false,
    manual: false,
  });
  const [remarks, setRemarks] = useState("");

  const handleSendQtyChange = (index, value) => {
    const updated = [...items];
    updated[index].sendQty = value;
    setItems(updated);
  };

  const approxWeight = items.reduce((sum, i) => sum + (i.sendQty || 0), 0);

  return (
    <div className="bg-background-light p-6 lg:p-8 min-h-screen font-display">
      <h1 className="text-2xl font-bold text-[#052e16] mb-6">
        Create Shipment
      </h1>

      <div className="bg-white p-8 rounded-[0.5rem] shadow-md space-y-6">
        {/* Shipment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shipment #
            </label>
            <Input value="S25-000000" readOnly className="rounded-[0.5rem]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Origin Location
            </label>
            <Select value="" onValueChange={(v) => console.log(v)}>
              <SelectItem value="Warehouse A">Warehouse A (Main)</SelectItem>
              <SelectItem value="Warehouse B">Warehouse B</SelectItem>
              <SelectItem value="Factory Outlet">Factory Outlet</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destination Type
            </label>
            <Select value="" onValueChange={(v) => console.log(v)}>
              <SelectItem value="Location">Location</SelectItem>
              <SelectItem value="Vendor">Vendor</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destination Address
            </label>
            <Select value="" onValueChange={(v) => console.log(v)}>
              <SelectItem value="">Select a location</SelectItem>
              <SelectItem value="Warehouse C">Warehouse C (North)</SelectItem>
              <SelectItem value="Warehouse D">Warehouse D (South)</SelectItem>
              <SelectItem value="Retail Store A">Retail Store A</SelectItem>
            </Select>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-[#052e16] mb-4">Items</h2>

          <div className="flex gap-3 mb-4">
            <button className="bg-[#052e16] text-white px-4 py-2 rounded-[0.5rem] hover:bg-green-900 transition">
              Add Item from Inventory
            </button>
            <button className="border border-[#052e16] text-[#052e16] px-4 py-2 rounded-[0.5rem] hover:bg-[#052e16] hover:text-white transition">
              Add Item from Waiting Transit
            </button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Quantity to be Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.sendQty}
                        onChange={(e) => handleSendQtyChange(i, e.target.value)}
                        className="w-24 rounded-[0.5rem]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-red-600 rounded-[0.5rem] px-2 py-1 hover:bg-red-100 transition">
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Weights & Vehicle Type */}
        <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Approx. Weight of all items (kg)
            </label>
            <Input
              value={`${approxWeight} kg`}
              readOnly
              className="rounded-[0.5rem]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Weight (Added by User)
            </label>
            <Input
              type="number"
              value={addedWeight}
              onChange={(e) => setAddedWeight(e.target.value)}
              className="rounded-[0.5rem]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Suggested Vehicle Type
            </label>
            <Select
              value={vehicleType}
              onValueChange={(v) => setVehicleType(v)}
            >
              <SelectItem value="truck">Truck (5 Ton)</SelectItem>
              <SelectItem value="van">Van</SelectItem>
            </Select>
          </div>
        </div>

        {/* Pre-requisites */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-[#052e16]">
            Loading/Unloading Pre-requisites
          </h3>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Checkbox
              label="Weigh Bridge Slip"
              checked={preReqs.weighBridge}
              onCheckedChange={(v) =>
                setPreReqs({ ...preReqs, weighBridge: v })
              }
            />
            <Checkbox
              label="Crane Needed"
              checked={preReqs.crane}
              onCheckedChange={(v) => setPreReqs({ ...preReqs, crane: v })}
            />
            <Checkbox
              label="Lifter Needed"
              checked={preReqs.lifter}
              onCheckedChange={(v) => setPreReqs({ ...preReqs, lifter: v })}
            />
            <Checkbox
              label="Manual Loading"
              checked={preReqs.manual}
              onCheckedChange={(v) => setPreReqs({ ...preReqs, manual: v })}
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="rounded-[0.5rem]"
          />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
          <button className="border border-[#052e16] text-[#052e16] px-4 py-2 rounded-[0.5rem] hover:bg-[#052e16] hover:text-white transition">
            Cancel
          </button>
          <button className="bg-[#052e16] text-white px-4 py-2 rounded-[0.5rem] hover:bg-green-900 transition">
            Create Shipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
