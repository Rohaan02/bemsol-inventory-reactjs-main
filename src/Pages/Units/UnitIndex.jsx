// src/Pages/Units/UnitIndex.jsx
import React, { useEffect, useState } from "react";
import unitAPI from "@/lib/unitAPI";
import { toast } from "react-toastify";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const UnitIndex = () => {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [unitsPerPage] = useState(5);

  // modal
  const [open, setOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  // Fetch units
  const fetchUnits = async () => {
    setLoading(true);
    const data = await unitAPI.getAll();
    setUnits(data);
    setFilteredUnits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Search filter
  useEffect(() => {
    const results = units.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUnits(results);
    setCurrentPage(1);
  }, [search, units]);

  // Pagination
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);

  // Handlers
  const handleOpenAdd = () => {
    setEditingUnit(null);
    setFormData({ name: "" });
    setOpen(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    try {
      await unitAPI.remove(id);
      toast.success("Unit deleted successfully!");
      fetchUnits();
    } catch (error) {
      toast.error("Failed to delete unit.");
    }
  };

  const handleSave = async () => {
    try {
      if (editingUnit) {
        await unitAPI.update(editingUnit.id, formData);
        toast.success("Unit updated successfully!");
      } else {
        await unitAPI.create(formData);
        toast.success("Unit created successfully!");
      }
      setOpen(false);
      fetchUnits();
    } catch (error) {
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Validation error");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <div className="h-full">
          <div className="bg-white shadow rounded-lg p-4">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Unit Of Measurement</h2>
              <button
                onClick={handleOpenAdd}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Unit
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center mb-4">
              <Search className="w-4 h-4 mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="Search units..."
                className="border px-3 py-2 rounded w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center p-4">
                        Loading...
                      </td>
                    </tr>
                  ) : currentUnits.length > 0 ? (
                    currentUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-100">
                        <td className="p-2 border">{unit.id}</td>
                        <td className="p-2 border">{unit.name}</td>
                        <td className="p-2 border text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-200">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={5}>
                              <DropdownMenuItem
                                onClick={() => handleEdit(unit)}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(unit.id)}
                                className="flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center p-4">
                        No units found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Unit" : "Add Unit Of Measurement"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block mb-2 text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded border bg-yellow-500 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              {editingUnit ? "Update" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitIndex;
