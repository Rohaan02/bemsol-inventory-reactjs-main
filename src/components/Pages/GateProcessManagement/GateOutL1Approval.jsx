import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Checkbox from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const GateOutL1Approval = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
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
              "background-light": "#f3f4f6",
              "background-dark": "#111827",
            },
            fontFamily: {
              display: ["Roboto", "sans-serif"],
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

  // Items data
  const items = [
    {
      id: 1,
      name: "Laptop Model X",
      code: "LT-MX-001",
      quantity: 2,
      purpose: "Repair",
      returnable: true,
    },
    {
      id: 2,
      name: "Industrial Pump",
      code: "IP-25B",
      quantity: 1,
      purpose: "Sample",
      returnable: false,
    },
    {
      id: 3,
      name: "Projector",
      code: "PJ-HD-4K",
      quantity: 1,
      purpose: "Repair",
      returnable: true,
    },
  ];

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleApprove = () => {
    console.log("Approving items:", selectedItems);
    alert(`Approved ${selectedItems.length} items`);
  };

  const handleReject = () => {
    console.log("Rejecting items:", selectedItems);
    alert(`Rejected ${selectedItems.length} items`);
  };

  return (
    <div className="min-h-screen bg-background-light font-display">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              L1 Approval - Gate Out Requests
            </h2>
            <p className="mt-1 text-gray-500">
              Review and approve/reject pending Gate Out requests.
            </p>
          </header>

          {/* Main Card */}
          <Card className="shadow-md">
            {/* Card Header */}
            <CardHeader className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Request: GO-25-0000001
              </h3>
            </CardHeader>

            <CardContent className="p-6">
              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <Label className="block text-sm font-medium text-gray-500 mb-1">
                    Receiver (Vendor)
                  </Label>
                  <p className="text-base text-gray-900">
                    Global Tech Supplies
                  </p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-500 mb-1">
                    Shipment #
                  </Label>
                  <p className="text-base text-gray-900">SH-1025</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-500 mb-1">
                    Vehicle Registration
                  </Label>
                  <p className="text-base text-gray-900">ABC-1234</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-500 mb-1">
                    Driver Name
                  </Label>
                  <p className="text-base text-gray-900">John Doe</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </Label>
                  <Badge className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending L1 Approval
                  </Badge>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-8">
                <h4 className="text-md font-semibold mb-4 text-gray-900">
                  Items for Gate Out
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableCell className="p-4">
                          <Checkbox
                            checked={
                              selectedItems.length === items.length &&
                              items.length > 0
                            }
                            onCheckedChange={selectAllItems}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Code
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purpose
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Returnable
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-4">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() =>
                                toggleItemSelection(item.id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.code}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.purpose}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.returnable ? (
                              <span className="material-icons text-green-500">
                                check_circle
                              </span>
                            ) : (
                              <span className="material-icons text-red-500">
                                cancel
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>

            {/* Card Footer with Actions */}
            <CardFooter className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleReject}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-100"
              >
                Reject Selected
              </Button>
              <Button
                onClick={handleApprove}
                className="px-5 py-2.5 text-sm font-medium text-white  bg-green-800 hover:bg-black"
              >
                Approve Selected
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GateOutL1Approval;
