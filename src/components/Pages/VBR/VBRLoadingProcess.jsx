import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { WaitingTransitDialog } from "../../Dialogs/WaitingTransitDialog";

const VBRLoadingProcess = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-8 font-sans bg-gray-100 text-gray-900 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Loading Process
          </h1>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                VBR No.
              </p>
              <p className="text-lg font-bold text-gray-800">12345XYZ</p>
            </div>
            <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Vehicle
              </p>
              <p className="text-lg font-bold text-gray-800">TR-6789</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-2">
          <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300">
            Save as Draft
          </Button>
          <Button
            className="bg-primary text-white flex items-center gap-2"
            onClick={() => navigate("/vbr-management/dispatch")}
          >
            <span className="material-symbols-outlined text-lg">send</span>
            Ready for Dispatch
          </Button>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6 space-x-4">
        <Button
          className="bg-blue-100 text-blue-600 flex items-center gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Waiting Transit Item
          <WaitingTransitDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </Button>

        <Button className="bg-purple-100 text-purple-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">add_box</span>
          Add Inventory Item
        </Button>
      </div>

      {/* Shipment Items */}
      <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              local_shipping
            </span>
            Shipment 1:{" "}
            <span className="font-normal text-gray-600">SHP-001</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Input type="checkbox" className="w-4 h-4" />
                </TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead>Required Qty</TableHead>
                <TableHead>Loaded Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Input type="checkbox" className="w-4 h-4" />
                </TableCell>
                <TableCell>
                  <p className="font-medium">Cement Bags - Grade A</p>
                  <p className="text-sm text-gray-500">SKU: CEM-001A</p>
                </TableCell>
                <TableCell>500</TableCell>
                <TableCell>
                  <Input type="number" defaultValue={500} className="w-24" />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Loaded
                  </span>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Loading Details Section */}
      <section className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Loading Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <Label>Unloading Instructions</Label>
              <Textarea placeholder="e.g., Use forklift, handle with care..." />
            </div>
            <div>
              <Label>Loading Remarks (Shipment Level)</Label>
              <Textarea placeholder="e.g., Loading delayed due to rain..." />
            </div>
          </div>

          {/* Middle column */}
          <div className="space-y-4">
            <div>
              <Label>Accompanying Person (Biometric ID)</Label>
              <Input placeholder="Enter Biometric ID" />
            </div>
            <div>
              <Label>Name</Label>
              <Input value="John Doe" readOnly className="bg-gray-200" />
            </div>
            <div>
              <Label>Position</Label>
              <Input value="Supervisor" readOnly className="bg-gray-200" />
            </div>
            <div>
              <Label>Company Person Contact Number</Label>
              <Input value="+1 234 567 890" readOnly className="bg-gray-200" />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <Label>Estimated Arrival Time and Date</Label>
              <Input type="datetime-local" />
            </div>

            <div>
              <Label>Picture of the Loaded Vehicle (3+)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined text-4xl text-gray-500">
                    cloud_upload
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG (3+ files)
                  </p>
                  <Input
                    type="file"
                    id="dropzone-file"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxlCFN9wDSgpD1GLMzD8lSEg0dGF19GaB4a6XdkN7KShc1JXpSh7l7NrHp88X1N4ZsD3N9DlZgiLFWZoGjBzt9W4_Fc2PoKyQhCUndicw6cN3Q9zpQxHlq7RpKNuKO19dkUNOnhJA0NK08pdxaf5nsd8Ii1rs7_Ja_yQbF4aK4V5gyNBbD8M7LEsscnuT5PQPMipYg8AeD86vybwLNQz1TsdiZQVvi5MlXH1GaTobPO7REEHKMyGuXvjA1dUZ86rg1QQpyo9Ys4q8"
                  className="rounded-md object-cover h-16 w-full"
                  alt="Side view"
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2cBZLQIkD8dNwKhGGyIbcCDL-CCx3YrF7pqdUaZ8GBJIOu5eJgzifDdDMwstCrJSZKGr7vdyJLk2gTQhTHCKTu4P6-93DmpEcE4goN7ahK91ZZ_SQSLK8T155r3VJx4oNZ9iE5OXxmN0hkwNkkcxKpNy_1fRCokNQcJDLN4e2PlMzTy831fZlztPUIuUiJoZ4KpddZ1rdqL49ZaMzONnh3OYpmiP0SdPNCZqNRcIRuEBvJtHIhtAmKpA9s_36-d8CLrB9Id07ppg"
                  className="rounded-md object-cover h-16 w-full"
                  alt="Rear view"
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh8YAjAu51cVMV0jFKw_O98WxrHSItLw_MJR4V9Rf38FNUGuaaQ0gB7p5_IKwHbET5djavbhEQP27u8QFICOrdU79rYsKadDFZvcp4J_6VgzdbuRpbdVFrhzHc3uQmTqoQAKjl_aIVtW6AaZq25L1nPRdW4i_iIBzqBmr6jPNtz2UYOfJzC0qCFCpjT9f4gscfJTDTSreequd-jeQKPOOL3HCffjAYDIWwWWNdu198anipBqoGvo_ujhBWQX7L05pqS5YfNnCjkmg"
                  className="rounded-md object-cover h-16 w-full"
                  alt="Cargo close-up"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VBRLoadingProcess;
