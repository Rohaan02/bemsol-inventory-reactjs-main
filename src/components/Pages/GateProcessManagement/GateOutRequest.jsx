import React, { useEffect, useState } from "react";

/* UI Components */
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

const GateOutRequest = () => {
  const [allReturnable, setAllReturnable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const iconLink = document.createElement("link");
    iconLink.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    const tailwindScript = document.createElement("script");
    tailwindScript.src = "https://cdn.tailwindcss.com?plugins=forms,typography";
    tailwindScript.async = true;
    tailwindScript.onload = () => {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#19e66b",
              "background-light": "#f6f8f7",
            },
            fontFamily: {
              display: ["Roboto", "sans-serif"],
            },
          },
        },
      };
    };
    document.head.appendChild(tailwindScript);
  }, []);

  return (
    <div className="font-display bg-background-light min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gate Out Request Creation (Shipment Items Pre-filled)
        </h1>
        <p className="text-gray-500 mt-1">
          For items leaving the location for repair, samples, or other works.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Gate Out Request #</Label>
            <Input value="GO-25-000000" readOnly />
          </div>

          <div>
            <Label>Receiver</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Personnel or Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor-a">Vendor A</SelectItem>
                <SelectItem value="tech-b">Technician B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Shipment #</Label>
            <Select defaultValue="sh-001234">
              <SelectTrigger>
                <SelectValue placeholder="Select Shipment to Pre-fill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sh-001234">SH-24-001234</SelectItem>
                <SelectItem value="sh-001235">SH-24-001235</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vehicle Registration Number</Label>
            <Input />
          </div>

          <div>
            <Label>Driver Name</Label>
            <Input />
          </div>

          <div>
            <Label>CNIC Number</Label>
            <Input />
          </div>

          <div>
            <Label>Contact Number</Label>
            <Input />
          </div>
        </div>

        {/* Items */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Items</h2>

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                All Items Returnable
              </span>
              <div
                onClick={() => setAllReturnable(!allReturnable)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  allReturnable ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allReturnable ? "translate-x-6" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Serial / Tag #</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>PMP-001</TableCell>
                  <TableCell className="font-medium">Industrial Pump</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>SN-589304</TableCell>
                  <TableCell>For Repair</TableCell>
                  <TableCell>Leaking from seal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>VLV-045</TableCell>
                  <TableCell className="font-medium">Gate Valve 6"</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>For Repair</TableCell>
                  <TableCell>Stuck in open position</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Attachments */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Attachments</h2>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <span className="material-icons-outlined text-4xl text-gray-400">
              cloud_upload
            </span>
            <p className="mt-2 text-sm text-gray-600">
              Upload pictures of the vehicle and items being sent.
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex justify-end gap-4 ">
          <Button className="bg-gray-200" variant="outline">
            Cancel
          </Button>
          <Button
            className="bg-emerald-800 text-white hover:bg-emerald-600 flex items-center gap-2"
            onClick={() => setLoading(true)}
          >
            {loading && <Loader className="h-4 w-4" />}
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GateOutRequest;
