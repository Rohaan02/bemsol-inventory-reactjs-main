import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import ItemsubTypeAPI from "../../lib/ItemSubTypeApi";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const ItemSubTypeIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subTypes, setSubTypes] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  const [open, setOpen] = useState(false);
  const [editSubType, setEditSubType] = useState(null);
  const [form, setForm] = useState({ name: "", item_type_id: "" });

  // Fetch sub types and types
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, types] = await Promise.all([
        ItemsubTypeAPI.getAll(),
        ItemsubTypeAPI.getItemType(),
      ]);
      setSubTypes(subs);
      setItemTypes(types);
    } catch {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save or update
  const handleSave = async () => {
    try {
      if (editSubType) {
        await ItemsubTypeAPI.update(editSubType.id, form);
        toast.success("Sub type updated successfully.");
      } else {
        await ItemsubTypeAPI.create(form);
        toast.success("Sub type created successfully.");
      }
      fetchData();
      setOpen(false);
      setForm({ name: "", item_type_id: "" });
      setEditSubType(null);
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Validation failed. Please check inputs.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  // Edit
  const handleEdit = (sub) => {
    setEditSubType(sub);
    setForm({ name: sub.name, item_type_id: sub.item_type_id });
    setOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub type?")) return;
    try {
      await ItemsubTypeAPI.remove(id);
      toast.success("Sub type deleted successfully.");
      fetchData();
    } catch {
      toast.error("Failed to delete sub type.");
    }
  };

  // Pagination + Search
  const filtered = subTypes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Item Sub Types</h2>
              <Button
                onClick={() => {
                  setForm({ name: "", item_type_id: "" });
                  setEditSubType(null);
                  setOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Sub Type
              </Button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 p-2 border rounded w-1/3"
            />

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : current.length > 0 ? (
                  current.map((sub, index) => (
                    <TableRow key={sub.id}>
                      <TableCell>{indexOfFirst + index + 1}</TableCell>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>
                        {itemTypes.find((t) => t.id === sub.item_type_id)?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-200">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(sub)}
                              className="flex items-center"
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(sub.id)}
                              className="flex items-center text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center">
                      No sub types found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="space-x-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editSubType ? "Edit Sub Type" : "Add Sub Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter sub type name"
              className="w-full p-2 border rounded"
            />
            <select
              name="item_type_id"
              value={form.item_type_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Item Type</option>
              {itemTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {editSubType ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemSubTypeIndex;
