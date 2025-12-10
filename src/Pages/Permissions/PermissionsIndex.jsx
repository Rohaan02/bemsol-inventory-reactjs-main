import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import permissionAPI from "@/lib/permissionAPI";
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

const PermissionsIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);

  const [open, setOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);
  const [form, setForm] = useState({ name: "" });

  // Fetch all permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await permissionAPI.getAll();
      setPermissions(data);
    } catch {
      toast.error("Failed to fetch permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save or update permission
  const handleSave = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Permission name is required");
        return;
      }

      if (editPermission) {
        await permissionAPI.update(editPermission.id, form);
        toast.success("Permission updated successfully.");
      } else {
        await permissionAPI.create(form);
        toast.success("Permission created successfully.");
      }
      fetchPermissions();
      setOpen(false);
      setForm({ name: "" });
      setEditPermission(null);
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Validation failed. Please check input.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  // Edit
  const handleEdit = (permission) => {
    setEditPermission(permission);
    setForm({ name: permission.name });
    setOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;
    try {
      await permissionAPI.remove(id);
      toast.success("Permission deleted successfully.");
      fetchPermissions();
    } catch {
      toast.error("Failed to delete permission.");
    }
  };

  // Filter and pagination
  const filtered = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
              <h2 className="text-xl font-bold">Permissions</h2>
              <Button
                onClick={() => {
                  setForm({ name: "" });
                  setEditPermission(null);
                  setOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Permission
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
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="3" className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : current.length > 0 ? (
                  current.map((permission, index) => (
                    <TableRow key={permission.id}>
                      <TableCell>{indexOfFirst + index + 1}</TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-200">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(permission)}
                              className="flex items-center"
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(permission.id)}
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
                    <TableCell colSpan="3" className="text-center">
                      No permissions found.
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
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPermission ? "Edit Permission" : "Add Permission"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter permission name"
              className="w-full p-2 border rounded"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              variant="danger" 
              className="bg-yellow-600 hover:bg-red-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="success"
              className=""
            >
              {editPermission ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsIndex;
