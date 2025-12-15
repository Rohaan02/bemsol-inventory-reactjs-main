import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

const NoVBRGateIn = () => {
  const [shipmentQuery, setShipmentQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const lexendLink = document.createElement("link");
    lexendLink.href =
      "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";
    lexendLink.rel = "stylesheet";
    document.head.appendChild(lexendLink);

    const tailwindScript = document.createElement("script");
    tailwindScript.src =
      "https://cdn.tailwindcss.com?plugins=forms,container-queries";
    tailwindScript.async = true;
    tailwindScript.onload = () => {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#2563eb",
              "background-light": "#f8fafc",
            },
            fontFamily: {
              display: ["Lexend", "sans-serif"],
            },
          },
        },
      };
    };
    document.head.appendChild(tailwindScript);
  }, []);

  return (
    <main className="bg-background-light text-gray-800 min-h-screen p-8 font-display">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">No-VBR Shipments Gate In</h1>
        <p className="text-gray-500 mt-1">
          Create a new gate-in record for non-inventory related shipments.
        </p>
      </header>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <form className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Gate Inwards #</Label>
              <Input value="GI-25-000000" readOnly />
              <p className="mt-1 text-xs text-gray-500">Auto-incremented ID</p>
            </div>

            <div>
              <Label>Shipment #</Label>
              <div className="relative">
                <Input
                  value={shipmentQuery}
                  onChange={(e) => setShipmentQuery(e.target.value)}
                  placeholder="Start typing shipment, vendor or PO..."
                />
                <span className="material-symbols-outlined text-gray-400 text-xl absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  search
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Search by Shipment #, Vendor Name, PO #, or Vendor ID
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Vehicle Registration Number</Label>
              <Input placeholder="e.g., ABC-123" />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input placeholder="Enter driver’s full name" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>CNIC Number</Label>
              <Input placeholder="e.g., 42101-*******-1" />
              <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  security
                </span>
                Value will be masked and validated
              </p>
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input type="tel" placeholder="e.g., 0300-*******" />
              <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  security
                </span>
                Value will be masked and validated
              </p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label>Remarks</Label>
            <Textarea
              placeholder="Add any relevant notes or comments..."
              rows={4}
            />
          </div>

          {/* Auto-Approved / Buttons */}
          <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="material-symbols-outlined text-green-600 text-lg">
                check_circle
              </span>
              <p className="text-sm font-semibold text-green-700">
                Auto-Approved
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" className="bg-white">
                Cancel
              </Button>

              <Button
                className="bg-primary text-white hover:bg-blue-700 transition-colors"
                onClick={() => setSubmitting(true)}
              >
                {submitting && <Loader className="mr-2 h-4 w-4" />}
                Submit Gate In
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default NoVBRGateIn;
