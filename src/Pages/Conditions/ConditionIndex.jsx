// src/pages/Conditions/ConditionIndex.jsx
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
import conditionAPI from "@/lib/conditionApi";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";

const ConditionIndex = () => {
  const [conditions, setConditions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCondition, setEditCondition] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [conditionName, setConditionName] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      const res = await conditionAPI.getAll();
      setConditions(res || []);
      setFiltered(res || []);
    } catch {
      setError("Failed to fetch conditions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(conditions);
    } else {
      setFiltered(
        conditions.filter((condition) =>
          (condition.name || "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    setPage(1);
  }, [search, conditions]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = async () => {
    if (!conditionName.trim()) return;

    try {
      setSaving(true);

      let res;
      if (editCondition) {
        // update existing
        res = await conditionAPI.update(editCondition.id, {
          name: conditionName,
        });
      } else {
        // create new
        res = await conditionAPI.create({
          name: conditionName,
        });
      }

      if (res?.success) {
        toast.success(res.message || "Operation successful", {
          position: "top-right",
          autoClose: 3000,
        });
        setConditionName("");
        setEditCondition(null);
        setOpen(false);
        fetchConditions();
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

  const handleEdit = (condition) => {
    setEditCondition(condition);
    setConditionName(condition.name);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this condition?"))
      return;

    try {
      const res = await conditionAPI.remove(id);
      if (res?.success) {
        toast.success(res.message || "Condition deleted", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchConditions();
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
            <h1 className="text-2xl font-bold text-gray-900">Conditions</h1>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Condition
            </Button>
          </div>

          <Card className="bg-white w-full flex flex-col flex-1">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-gray-800">Condition List</CardTitle>
              <Input
                type="text"
                placeholder="Search conditions..."
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
                        <TableHead>Condition Name</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((condition) => (
                        <TableRow key={condition.id}>
                          <TableCell>{condition.id}</TableCell>
                          <TableCell>{condition.name}</TableCell>
                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => handleEdit(condition)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(condition.id)}
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

                  {paginated.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      No conditions found
                    </div>
                  )}

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

      {/* Add/Edit Condition Modal */}
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogHeader>
          <h2 className="text-xl font-bold">
            {editCondition ? "Edit Condition" : "Add Condition"}
          </h2>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Input
            placeholder="Condition Name"
            value={conditionName}
            onChange={(e) => setConditionName(e.target.value)}
          />
        </DialogBody>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editCondition ? "Update" : "Save"}
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

export default ConditionIndex;
