// src/pages/Accounts/AccountIndex.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import accountAPI from "@/lib/accountAPI";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";

const AccountsIndex = () => {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAccount, setEditAccount] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountAPI.getAll();
      setAccounts(res || []);
      setFiltered(res || []);
    } catch {
      setError("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(accounts);
    } else {
      setFiltered(
        accounts.filter((a) =>
          (a.account_name || "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    setPage(1);
  }, [search, accounts]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = async () => {
    if (!accountName.trim()) return;

    try {
      setSaving(true);

      let res;
      if (editAccount) {
        // update existing
        res = await accountAPI.update(editAccount.id, {
          account_name: accountName,
        });
      } else {
        // create new (backend auto-generates account_code)
        res = await accountAPI.create({
          account_name: accountName,
        });
      }

      if (res?.success) {
        toast.success(res.message || "Operation successful", {
          position: "top-right",
          autoClose: 3000,
        });
        setAccountName("");

        setEditAccount(null);
        setOpen(false);
        fetchAccounts();
      } else {
        toast.error(res?.message || "Operation failed", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response.data.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).forEach((messages) => {
          messages.forEach((msg) =>
            toast.error(msg, { position: "top-right", autoClose: 5000 })
          );
        });
      } else {
        toast.error("Something went wrong", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (acc) => {
    setEditAccount(acc);
    setAccountName(acc.account_name);

    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;

    try {
      const res = await accountAPI.remove(id);
      if (res?.success) {
        toast.success(res.message || "Account deleted", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchAccounts();
      } else {
        toast.error(res?.message || "Failed to delete", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch {
      toast.error("Something went wrong", { position: "top-right" });
    }
  };

  return (
    <div className="h-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Account
            </Button>
          </div>

          <Card className="bg-white w-full flex flex-col flex-1">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-gray-800">Account List</CardTitle>
              <Input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>

            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>

                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((acc) => (
                        <TableRow key={acc.id}>
                          <TableCell>{acc.id}</TableCell>
                          <TableCell>{acc.account_code}</TableCell>
                          <TableCell>{acc.account_name}</TableCell>

                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => handleEdit(acc)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(acc.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <span className="text-gray-700">
                      Page {page} of {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

      {/* Add/Edit Account Modal */}
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogHeader>
          <h2 className="text-xl font-bold">
            {editAccount ? "Edit Account" : "Add Account"}
          </h2>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Input
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </DialogBody>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editAccount ? "Update" : "Save"}
          </Button>
          <Button
            onClick={() => setOpen(false)}
            className="bg-yellow-300 hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AccountsIndex;
