import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";

const CreateTransferRequest = () => {
  const [originLocation, setOriginLocation] = useState("");
  const [destinationType, setDestinationType] = useState("location");
  const [destinationValue, setDestinationValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Industrial Drill D-500",
      sku: "DR-500-X",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzo-7yiUFY0GmYvAW2sMhJHtP3_QOVDaYE8OtSVf_rQwqiN2rDvgcrf7X5JiKrDEJft4jR_7wT16_32PCmekkXHz6e6YOfAn-OFBXr0LdAoxDuHMibPkbewrH-N2JLMEQY9SFB_d_2WZdcT5Crnet9lLVhvWjtYZ1By2VPU9bTQnixpMowTZJIb0te4xeEog4JThUGjj6pEaoX2Iy3sgqmHno66ohY8tGEpWW3x1-HAixOtk2eots3zpG9YaTs2vfRS-_SriUoEAA",
      uom: "Unit",
      available: 45,
      quantity: 5,
      purpose: "",
    },
    {
      id: 2,
      name: "Safety Gloves (Pack)",
      sku: "SG-PACK-M",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDARtQl-6A2w24IH2U3kRUcYdhgo2Cxixex9EA7H5YfaLrr83jXD_0QJ84KrxgHsYsCLBXYUzBRAo_dwoAnZnKhNnSyNGP1bvyhz7qWL6iXDokd9WOr-Ci1FyAiIAjTBYntb-cCWKxYAKPDBOGgVBuFtAIoBPYspOamZPok8y5oR_6I7WzS5sMBe731bnRvDs50oI2RJFFkq61iQ1zk7GZ9P00cAodexMTo8EocjqZODCrYKnjSOZXiq2eyUl8kvvxakCDhMWO3ij8",
      uom: "Box",
      available: 120,
      quantity: 20,
      purpose: "Seasonal restock",
    },
  ]);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
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
              primary: "#10b981",
              "primary-hover": "#059669",
              "background-light": "#f3f4f6",
              "background-dark": "#111827",
              "surface-light": "#ffffff",
              "surface-dark": "#1f2937",
              "sidebar-bg": "#052e16",
            },
            fontFamily: {
              display: ["Inter", "sans-serif"],
              body: ["Inter", "sans-serif"],
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

  const originLocations = [
    { id: "ny_central", label: "NY Central Warehouse" },
    { id: "la_hub", label: "LA Distribution Hub" },
    { id: "tx_store", label: "TX Retail Store #4" },
  ];

  const destinations = {
    location: [
      { id: "store_55", label: "Chicago Retail Store #55" },
      { id: "store_12", label: "Miami Retail Store #12" },
    ],
    vendor: [
      { id: "vendor_a", label: "Vendor A - Tech Supplies" },
      { id: "vendor_b", label: "Vendor B - Safety Gear" },
    ],
    other: [
      { id: "other_1", label: "Other Destination 1" },
      { id: "other_2", label: "Other Destination 2" },
    ],
  };

  const handleQuantityChange = (id, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(Math.max(1, value), item.available) }
          : item
      )
    );
  };

  const handlePurposeChange = (id, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, purpose: value } : item))
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddItems = () => {
    const newItem = {
      id: items.length + 1,
      name: "New Item",
      sku: "NEW-ITEM-" + (items.length + 1),
      image: "",
      uom: "Unit",
      available: 100,
      quantity: 1,
      purpose: "",
    };
    setItems([...items, newItem]);
  };

  const handleQuickTemplate = (template) => {
    switch (template) {
      case "urgent":
        setRemarks(
          "URGENT: Need immediate transfer for production line.\nPriority: High"
        );
        break;
      case "seasonal":
        setRemarks(
          "Seasonal restock for upcoming holiday season.\nDeadline: End of month"
        );
        break;
      case "maintenance":
        setRemarks(
          "Transfer for scheduled maintenance and calibration.\nSpecial handling required"
        );
        break;
      case "clear":
        setRemarks("");
        break;
    }
  };

  const handleSubmit = () => {
    if (!originLocation) {
      alert("Please select an origin location.");
      return;
    }
    if (!destinationValue) {
      alert("Please select a destination.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item to transfer.");
      return;
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    console.log("Submitting transfer request:", {
      originLocation,
      destinationType,
      destinationValue,
      items,
      remarks,
      totalItems,
    });
    alert(
      `Transfer request submitted successfully!\nTotal Items: ${totalItems}`
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background-light font-body">
      {/* Header */}
      <header className="h-16 bg-surface-light border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Create Transfer Request
          </h1>
          <nav className="flex text-sm text-gray-500 mt-0.5">
            <span className="hover:text-primary cursor-pointer">Transfers</span>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">New Request</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Request Information Card */}
        <section className="bg-surface-light rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="material-icons text-primary text-xl">info</span>
              Request Information
            </h2>
            <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Draft
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Transfer Request ID */}
            <div className="space-y-1">
              <Label
                htmlFor="request_id"
                className="block text-sm font-medium text-gray-700"
              >
                Transfer Request ID
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-gray-400 text-sm">
                    tag
                  </span>
                </div>
                <Input
                  id="request_id"
                  readOnly
                  className="pl-9 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-primary focus:ring-primary sm:text-sm cursor-not-allowed"
                  value="ST25-0000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated ID</p>
            </div>

            {/* Origin Location */}
            <div className="space-y-1">
              <Label
                htmlFor="origin_location"
                className="block text-sm font-medium text-gray-700"
              >
                Origin Location
              </Label>
              <Select value={originLocation} onValueChange={setOriginLocation}>
                <SelectTrigger className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                  <SelectValue placeholder="Select Origin Store..." />
                </SelectTrigger>
                <SelectContent>
                  {originLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <Label className="block text-sm font-medium text-gray-700">
                Destination
              </Label>
              <div className="flex gap-2">
                <Select
                  value={destinationType}
                  onValueChange={setDestinationType}
                >
                  <SelectTrigger className="block w-1/3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={destinationValue}
                  onValueChange={setDestinationValue}
                >
                  <SelectTrigger className="block w-2/3 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <SelectValue placeholder="Select Destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations[destinationType]?.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>
                        {dest.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Items to Transfer Card */}
        <section className="bg-surface-light rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="material-icons text-primary text-xl">
                  list_alt
                </span>
                Items to Transfer
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select items from Inventory View (Location Wise)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddItems}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <span className="material-icons text-lg mr-2">add</span>
                Add Items
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Info
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Qty
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded bg-gray-100 object-cover"
                              />
                            ) : (
                              <span className="material-icons text-gray-400">
                                inventory_2
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        UOM: {item.uom}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Available: {item.available}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        max={item.available}
                        className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Input
                        value={item.purpose}
                        onChange={(e) =>
                          handlePurposeChange(item.id, e.target.value)
                        }
                        placeholder="Line level purpose"
                        className="w-48 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-800"
                          >
                            <span className="material-icons">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuantityChange(item.id, item.available)
                            }
                          >
                            <span className="material-icons text-sm mr-2 text-green-500">
                              maximize
                            </span>
                            Set to Max Available
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <span className="material-icons text-sm mr-2">
                              exposure_minus_1
                            </span>
                            Set to Minimum
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <span className="material-icons text-sm mr-2">
                              delete
                            </span>
                            Remove Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-right">
              Total Items:{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span>
            </p>
          </div>
        </section>

        {/* General Remarks Card */}
        <section className="bg-surface-light rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-xl">comment</span>
            General Remarks
          </h2>
          <div>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Add any additional notes or instructions for this transfer request..."
              rows={3}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <span className="material-icons text-lg mr-2">send</span>
            Submit for Approval
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateTransferRequest;
