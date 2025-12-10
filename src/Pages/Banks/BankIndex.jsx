import React, { useEffect, useState } from "react";
import bankApi from "../../lib/bankApi";
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

const BankIndex = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  const [open, setOpen] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [form, setForm] = useState({ name: "" });

  // Fetch all banks
  const fetchBanks = async () => {
    setLoading(true);
    try {
      const data = await bankApi.getAll();
      setBanks(data);
    } catch {
      toast.error("Failed to fetch banks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save or update bank
  const handleSave = async () => {
    try {
      if (editBank) {
        await bankApi.update(editBank.id, form);
        toast.success("Bank updated successfully.");
      } else {
        await bankApi.create(form);
        toast.success("Bank created successfully.");
      }
      fetchBanks();
      setOpen(false);
      setForm({ name: "" });
      setEditBank(null);
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Validation failed. Please check input.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  // Edit - Fixed to use the bank data directly
  const handleEdit = (bank) => {
    setEditBank(bank);
    setForm({
      name: bank.name || ""
    });
    setOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank?")) return;
    try {
      await bankApi.remove(id);
      toast.success("Bank deleted successfully.");
      fetchBanks();
    } catch {
      toast.error("Failed to delete bank.");
    }
  };

  // Pagination + Search - Only search by name
  const filtered = banks.filter((bank) =>
    bank.name.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="h-full">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Banks</h2>
              <Button
                onClick={() => {
                  setForm({ name: "" });
                  setEditBank(null);
                  setOpen(true);
                }}
                className="bg-primary-color hover:bg-primary-color-dark text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Bank
              </Button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 p-2 border rounded w-1/3"
            />

            {/* Table - Only name column */}
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
                  current.map((bank, index) => (
                    <TableRow key={bank.id}>
                      <TableCell>{indexOfFirst + index + 1}</TableCell>
                      <TableCell>{bank.name}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-200">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(bank)}
                              className="flex items-center"
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(bank.id)}
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
                      No banks found.
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
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

      {/* Modal - Only name field */}
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBank ? "Edit Bank" : "Add Bank"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter bank name"
              className="w-full p-2 border rounded"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              variant="outline" 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary-color hover:bg-primary-color-dark text-white"
            >
              {editBank ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankIndex;