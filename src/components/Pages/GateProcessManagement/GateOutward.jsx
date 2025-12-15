import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const GateOutward = () => {
  useEffect(() => {
    // load css/fonts
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
              primary: "#052e16",
              "background-light": "#f3f4f6",
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
    <main className="min-h-screen bg-background-light font-display text-gray-900 p-8">
      {/* Header Top */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Gate Pass Generation
          </h2>
          <p className="text-gray-600">
            Review the approved shipment details and generate the gate pass.
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
            Approved for Dispatch
          </span>
        </div>
      </div>

      {/* Shipment Details */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <Label>Shipment ID</Label>
            <p className="font-semibold">SHP-2024-0815A</p>
          </div>
          <div>
            <Label>Vehicle Number</Label>
            <p className="font-semibold">MH12-AB-1234</p>
          </div>
          <div>
            <Label>Driver Name</Label>
            <p className="font-semibold">Ramesh Kumar</p>
          </div>
          <div>
            <Label>Origin Location</Label>
            <p className="font-semibold">Mumbai Warehouse</p>
          </div>
          <div>
            <Label>Destination</Label>
            <p className="font-semibold">Pune Retail Store</p>
          </div>
          <div>
            <Label>Dispatch Time</Label>
            <p className="font-semibold">15 Aug 2024, 10:30 AM</p>
          </div>
        </div>
      </section>

      {/* Loaded Items Summary */}
      <section className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Loaded Items Summary</h2>
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  code: "ITM-001",
                  desc: "Heavy Machinery Part A",
                  qty: "10 Units",
                  status: "Loaded",
                },
                {
                  code: "ITM-002",
                  desc: "Industrial Component B",
                  qty: "25 Units",
                  status: "Loaded",
                },
              ].map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.desc}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Generate Gate Pass Button */}
      <div className="flex justify-end mb-8">
        <Button className="bg-primary text-white px-6 py-3 flex items-center gap-2">
          <span className="material-icons-outlined">print</span>
          Generate & Print Gate Pass
        </Button>
      </div>

      {/* Final Confirmation Info Box */}
      <section className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <div className="flex gap-4">
          <span className="material-icons-outlined text-blue-500">info</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              Final Confirmation
            </h3>
            <p className="text-sm text-blue-700 mt-2">
              1. Upon generating the gate pass, the origin location inventory
              will be updated accordingly.
            </p>
            <p className="text-sm text-blue-700">
              2. The shipment is complete if the destination is not Inter-store
              transfer.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GateOutward;
