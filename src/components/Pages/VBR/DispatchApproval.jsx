import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const DispatchApproval = () => {
  useEffect(() => {
    // Load Google Fonts
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
    ];
    fonts.forEach((href) => {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    });
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 p-6 border-b border-gray-200 bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Logistics Manager Dispatch Approval
        </h1>
        <p className="text-gray-500 mt-1">
          Review shipment details and approve for dispatch.
        </p>
      </header>

      <main className="p-6 lg:p-8 space-y-8">
        {/* Shipment Details */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Shipment #SHP-10523
              </h2>
              <p className="text-gray-500">
                Status:{" "}
                <span className="font-medium text-yellow-600">
                  Ready for Dispatch Approval
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Vehicle:{" "}
                <span className="font-semibold text-gray-700">TR-456-XYZ</span>
              </p>
              <p className="text-sm text-gray-500">
                Driver:{" "}
                <span className="font-semibold text-gray-700">John Doe</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Origin</p>
              <p className="font-medium text-gray-800">
                Main Warehouse - New York
              </p>
            </div>
            <div>
              <p className="text-gray-500">Destination</p>
              <p className="font-medium text-gray-800">District Hub - Boston</p>
            </div>
            <div>
              <p className="text-gray-500">Estimated Arrival</p>
              <p className="font-medium text-gray-800">
                July 28, 2024, 09:00 AM
              </p>
            </div>
          </div>
        </section>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-4">
          <span className="material-icons-outlined text-blue-600 mt-1">
            info
          </span>
          <div>
            <h3 className="font-semibold text-blue-800">
              Dispatch Approval from COO Required
            </h3>
            <p className="text-blue-700 text-sm mt-1">
              This shipment contains high-value assets exceeding $50,000.
              Approval from the Chief Operating Officer is mandatory before
              dispatch.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="loaded">
          <TabsList>
            <TabsTrigger value="loaded">Loaded Items (3)</TabsTrigger>
            <TabsTrigger value="not-loaded">
              Not Loaded Items (1)
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2 border border-red-200">
                Alert
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loaded">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Loaded Items Table */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Loaded Items
                  </h3>
                  <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mr-2 border border-red-200">
                      Extra Inventory Item
                    </span>
                    Requires individual approval
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Approval</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Industrial Server Rack</TableCell>
                        <TableCell>SRV-RACK-001</TableCell>
                        <TableCell>2 Units</TableCell>
                        <TableCell>$35,000</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Standard
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-red-50">
                        <TableCell>
                          High-Performance Blade Server
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Added from Inventory
                          </span>
                        </TableCell>
                        <TableCell>BLD-SRV-HP-008</TableCell>
                        <TableCell>5 Units</TableCell>
                        <TableCell>$20,000</TableCell>
                        <TableCell>
                          <label className="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-gray-700 font-medium">
                              Approve Item
                            </span>
                          </label>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500 flex items-start gap-2">
                  <span className="material-icons-outlined text-sm">info</span>
                  <p>
                    Items marked as "Added from Inventory" were not part of the
                    original shipping manifest and require manual line-item
                    approval before dispatch.
                  </p>
                </div>
              </section>

              {/* Approval Actions */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Approval Actions
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="approval-status"
                    >
                      Update Status
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white text-gray-900"
                      id="approval-status"
                    >
                      <option>Select new status...</option>
                      <option selected>Shipment Dispatched</option>
                      <option>Hold Shipment</option>
                      <option>Reject Shipment</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="remarks"
                    >
                      Remarks (Optional)
                    </label>
                    <Textarea
                      id="remarks"
                      placeholder="Add any final comments..."
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      checked
                      id="notify-stakeholders"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="notify-stakeholders"
                      className="ml-3 text-sm font-medium text-gray-700"
                    >
                      Notify destination store & stakeholders
                    </label>
                  </div>
                </div>

                <Button disabled className="w-full mt-2" variant="success">
                  Awaiting COO Approval
                </Button>
                <Button className="w-full mt-2" variant="danger">
                  Reject Shipment
                </Button>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
