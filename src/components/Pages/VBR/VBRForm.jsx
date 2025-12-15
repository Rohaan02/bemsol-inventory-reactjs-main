import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Loader from "@/components/ui/loader";

const VBRForm = () => {
  const { id } = useParams(); // undefined => create
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const vbrTitle = isEdit ? `${id}` : "VBR-2025-8921 (Creation)";

  const [loading, setLoading] = useState(false);

  /* -------------------- Inject Fonts + Tailwind CDN -------------------- */
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
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#19e66b",
              "background-light": "#f6f8f7",
              "background-dark": "#112117",
              "sidebar-green": "#052e16",
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

  /* -------------------- Mock Quotations -------------------- */
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
      status: "Disabled",
    },
  ];

  if (loading) {
    return <Loader className="h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-28">
      {/* ---------------- Header ---------------- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vbrTitle}</h1>
            <p className="text-sm text-gray-500">
              Created on Oct 24, 2025 by John Doe
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- Basic Info ---------------- */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Associated Shipments
            </label>
            <input
              className="w-full rounded-md border-gray-300"
              placeholder="SHP-10023, SHP-10024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Origin</label>
            <select className="w-full rounded-md border-gray-300">
              <option>Lahore (Main WH)</option>
              <option>Karachi (Port)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Destination
            </label>
            <select className="w-full rounded-md border-gray-300">
              <option>Karachi (Port)</option>
              <option>Lahore (Main WH)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Total Weight (KG)
            </label>
            <input
              type="number"
              className="w-full rounded-md border-gray-300"
              defaultValue="4500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Vehicle Type
            </label>
            <select className="w-full rounded-md border-gray-300">
              <option>Mazda / Flatbed</option>
              <option>Shehzore</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Date Required
            </label>
            <input
              type="date"
              className="w-full rounded-md border-gray-300"
              defaultValue="2025-10-26"
            />
          </div>
        </div>
      </div>

      {/* ---------------- Quotations ---------------- */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="px-6 py-4 border-b flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
          <span className="material-symbols-outlined text-blue-600">
            local_shipping
          </span>
          <h3 className="text-lg font-semibold">Transporter Quotations</h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Vendor</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </tr>
            </TableHeader>

            <TableBody>
              {quotations.map((q, i) => (
                <TableRow key={i}>
                  <TableCell>{q.vendor}</TableCell>
                  <TableCell>{q.vehicle}</TableCell>
                  <TableCell className="font-semibold">{q.price}</TableCell>
                  <TableCell>{q.date}</TableCell>
                  <TableCell className="text-right">
                    {q.status === "Approved" ? (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                        Approved
                      </span>
                    ) : (
                      <span className="text-gray-400">Disabled</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* ---------------- Items in VBR ---------------- */}
      <div className="bg-white rounded-xl border mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold flex items-center gap-2">
          <span className="material-icons-outlined text-gray-500">
            inventory_2
          </span>
          Items in VBR
        </div>

        <Tabs defaultValue="SHP-10023" className="w-full">
          <TabsList className="border-b px-4 py-2 flex gap-2">
            <TabsTrigger value="SHP-10023">SHP-10023</TabsTrigger>
            <TabsTrigger value="SHP-10024">SHP-10024</TabsTrigger>
          </TabsList>

          {/* -------- Shipment 1 -------- */}
          <TabsContent value="SHP-10023">
            <div className="border-b bg-gray-50 px-5 py-2 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Shipment # SHP-10023
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Ready
              </span>
            </div>

            <ul className="divide-y">
              <li className="px-5 py-3 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Induction Motor 5HP</p>
                    <p className="text-xs text-gray-500">Code: IM-5002</p>
                  </div>
                  <p className="text-sm font-bold">
                    2{" "}
                    <span className="text-xs font-normal text-gray-500">
                      Units
                    </span>
                  </p>
                </div>
              </li>

              <li className="px-5 py-3 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Copper Wiring Roll</p>
                    <p className="text-xs text-gray-500">Code: CW-200</p>
                  </div>
                  <p className="text-sm font-bold">
                    50{" "}
                    <span className="text-xs font-normal text-gray-500">
                      Meters
                    </span>
                  </p>
                </div>
              </li>
            </ul>
          </TabsContent>

          {/* -------- Shipment 2 -------- */}
          <TabsContent value="SHP-10024">
            <div className="border-b bg-gray-50 px-5 py-2 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Shipment # SHP-10024
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Packing
              </span>
            </div>

            <ul className="divide-y">
              <li className="px-5 py-3 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Control Panel Box</p>
                    <p className="text-xs text-gray-500">Code: CP-X10</p>
                  </div>
                  <p className="text-sm font-bold">
                    1{" "}
                    <span className="text-xs font-normal text-gray-500">
                      Unit
                    </span>
                  </p>
                </div>
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      {/* ---------------- Footer Actions ---------------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>

        <Button variant="secondary">Save Draft</Button>

        <Button variant="success">Submit for Approval</Button>
      </div>
    </div>
  );
};

export default VBRForm;
