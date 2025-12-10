// src/pages/Location/LocationIndex.jsx
import React, { useEffect, useState } from "react";
import locationAPI from "@/lib/locationAPI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LocationIndex = () => {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", address: "" });

  // Fetch all locations
  const fetchLocations = async () => {
    const data = await locationAPI.getAll();
    setLocations(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Search filter
  useEffect(() => {
    setFiltered(
      locations.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, locations]);

  // Handle save/update
  const handleSave = async () => {
    try {
      if (form.id) {
        await locationAPI.update(form.id, { name: form.name, address: form.address });
        toast.success("Location updated successfully!");
      } else {
        await locationAPI.create({ name: form.name, address: form.address || "" });
        toast.success("Location created successfully!");
      }
      setOpen(false);
      setForm({ id: null, name: "" , address: "" });
      fetchLocations();
    } catch (error) {
      if (error.response?.status === 422) {
        toast.error(Object.values(error.response.data.errors).join(", "));
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  // Handle edit
  const handleEdit = (loc) => {
    setForm({ id: loc.id, name: loc.name, address: loc.address });
    setOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    try {
      await locationAPI.remove(id);
      toast.success("Location deleted successfully!");
      fetchLocations();
    } catch {
      toast.error("Failed to delete location");
    }
  };

  return (
    <div className="h-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Locations</h1>
            <Button
              onClick={() => setOpen(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((loc, index) => (
                    <TableRow key={loc.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{loc.name}</TableCell>
                      <TableCell>{loc.address}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button
      className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200"
      aria-label="Actions"
    >
      <MoreHorizontal className="w-5 h-5" />
    </button>
  </DropdownMenuTrigger>

  {/* ⬇️ Add position="popper" and sideOffset */}
  <DropdownMenuContent align="end" sideOffset={5} position="popper">
    <DropdownMenuItem
      onClick={() => handleEdit(loc)}
      className="flex items-center gap-2"
    >
      <Pencil className="w-4 h-4" />
      <span>Edit</span>
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => handleDelete(loc.id)}
      className="flex items-center gap-2 text-red-600"
    >
      <Trash2 className="w-4 h-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

                        </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No locations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Location" : "Add Location"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Location Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="py-4">
            <Input
              placeholder="Location Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="bg-yellow-500 text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 text-white">
              {form.id ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LocationIndex;
