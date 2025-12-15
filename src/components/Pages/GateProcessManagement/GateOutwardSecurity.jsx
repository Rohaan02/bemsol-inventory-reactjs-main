import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Checkbox from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GateOutwardSecurity = () => {
  const [selectedRequest, setSelectedRequest] = useState("");
  const [cooApproval, setCooApproval] = useState(false);
  const [securityRemarks, setSecurityRemarks] = useState("");

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
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
              primary: "#052e16",
              "background-light": "#f4f4f5",
              "background-dark": "#18181b",
            },
            fontFamily: {
              display: ["Inter", "sans-serif"],
            },
            borderRadius: {
              DEFAULT: "0.5rem",
            },
          },
        },
      };
    };
    document.head.appendChild(tailwindScript);
  }, []);

  const gateOutRequests = [
    { id: "1", value: "GO-25-0000123", label: "GO-25-0000123 - To Vendor XYZ" },
    {
      id: "2",
      value: "GO-25-0000124",
      label: "GO-25-0000124 - Sample for Analysis",
    },
    {
      id: "3",
      value: "GO-25-0000125",
      label: "GO-25-0000125 - To Repair Center",
    },
  ];

  const handleMarkEnRoute = () => {
    if (!cooApproval) {
      alert("Please confirm Dispatch Approval from COO before proceeding.");
      return;
    }

    if (!selectedRequest) {
      alert("Please select a gate out request.");
      return;
    }

    console.log("Marking vehicle en-route for:", selectedRequest);
    alert(`Vehicle marked as En-Route for request: ${selectedRequest}`);
  };

  return (
    <div className="min-h-screen bg-background-light font-display">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Gate Outward Process
            </h2>
            <p className="text-gray-500 mt-1">
              Managed by Security Office. Select an approved request to proceed.
            </p>
          </header>

          {/* Main Form Card */}
          <Card className="p-6 shadow-sm">
            <CardContent className="space-y-6 p-0">
              {/* Request Selection */}
              <div className="mb-6">
                <Label
                  htmlFor="gateOutRequest"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Approved Gate Out Request
                </Label>
                <Select
                  value={selectedRequest}
                  onValueChange={setSelectedRequest}
                >
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-700 focus:border-green-700">
                    <SelectValue placeholder="Choose a request..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gateOutRequests.map((request) => (
                      <SelectItem key={request.id} value={request.value}>
                        {request.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Shipment ID
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    SH-45-00891
                  </p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Destination
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    Vendor XYZ, Industrial Area
                  </p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Vehicle Registration
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    ABC-123
                  </p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Driver Name
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    John Doe
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700">
                    Items
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    2x Electric Motor, 5x Gearbox Assembly
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700">
                    Total Asset Value
                  </Label>
                  <p className="mt-1 text-base text-gray-900 font-semibold">
                    $ 55,000.00
                  </p>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Security Remarks */}
              <div>
                <Label
                  htmlFor="security-remarks"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Security Remarks (Optional)
                </Label>
                <Textarea
                  id="security-remarks"
                  placeholder="Enter any relevant information..."
                  value={securityRemarks}
                  onChange={(e) => setSecurityRemarks(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-700 focus:border-green-700"
                  rows={3}
                />
              </div>

              {/* High Value Warning */}
              <div className="relative flex items-start bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex-shrink-0">
                  <span className="material-icons text-yellow-500">
                    warning_amber
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    High-Value Asset Detected
                  </p>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      The total value of assets in this shipment is above the
                      threshold.
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center">
                        <Checkbox
                          id="coo-approval"
                          checked={cooApproval}
                          onCheckedChange={(checked) => setCooApproval(checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label
                          htmlFor="coo-approval"
                          className="ml-3 block text-sm font-medium text-yellow-800"
                        >
                          I confirm Dispatch Approval from COO has been
                          received.
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleMarkEnRoute}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-green-800"
                >
                  <span className="material-icons mr-2">local_shipping</span>
                  Mark Vehicle En-Route
                </Button>
              </div>

              {/* Information Box */}
              <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="material-icons text-blue-500">info</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Clicking 'Mark Vehicle En-Route' will update the status to{" "}
                      <span className="font-semibold">Shipment Dispatched</span>{" "}
                      and <span className="font-semibold">En-route</span>. The
                      destination store will be notified to acknowledge the
                      upcoming shipment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GateOutwardSecurity;
