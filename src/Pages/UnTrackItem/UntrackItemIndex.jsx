// src/pages/UntrackItem/UntrackItemIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import baseUrl from "../../lib/BaseUrl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  Download,
  Filter,
  Eye,
  Car,
} from "lucide-react";
import DataTable from "@/components/ui/data-table";
import untrackItemAPI from "@/lib/untrackItemAPI";

const UntrackItemIndex = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bulk Import Modal
  const [openImport, setOpenImport] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // DataTable state
  const [selectedItems, setSelectedItems] = useState(new Set());

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await untrackItemAPI.getAll();

      // Handle different response structures
      let itemsArray = [];

      if (Array.isArray(res)) {
        itemsArray = res;
      } else if (res && Array.isArray(res.data)) {
        itemsArray = res.data;
      } else if (res && Array.isArray(res.items)) {
        itemsArray = res.items;
      } else if (res && res.success && Array.isArray(res.data)) {
        itemsArray = res.data;
      }

      setItems(itemsArray);
      console.log("un items", itemsArray);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Get unique tags and statuses for filters
  // Note: Your data doesn't have 'tag' or 'service_status' properties
  // Adjust these based on what's actually in your data
  const availableConditions = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const conditions = items.map((item) => item.condition).filter(Boolean);
    return [...new Set(conditions)];
  }, [items]);

  const availableCategories = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const categories = items
      .map((item) => item.category?.category_name)
      .filter(Boolean);
    return [...new Set(categories)];
  }, [items]);

  // Bulk delete selected items
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedItems.size} item(s)?`
      )
    )
      return;

    try {
      const deletePromises = Array.from(selectedItems).map((id) =>
        untrackItemAPI.remove(id)
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedItems.size} item(s) deleted successfully`);
      setSelectedItems(new Set());
      fetchItems();
    } catch {
      toast.error("Failed to delete some items");
    }
  };

  // Export to CSV
  const handleExport = () => {
    const dataToExport =
      selectedItems.size > 0
        ? items.filter((item) => selectedItems.has(item.id))
        : items;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Convert to CSV
    const headers = [
      "ID",
      "Item Code",
      "Item Name",
      "Specification",
      "Model No",
      "Manufacturer",
      "Category",
      "Unit",
      "Quantity",
      "Weight",
      "Condition",
      "Remarks",
      "Archived",
    ];

    const csvData = dataToExport.map((item) => [
      item.id,
      item.item_code,
      item.item_name,
      item.specification,
      item.model_no,
      item.manufacturer,
      item.category?.category_name || "N/A",
      item.unit?.name || "N/A",
      item.quantity,
      `${item.weight} ${item.weight_unit}`,
      item.condition,
      item.remarks,
      item.archived ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `untracked-items-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} item(s)`);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImporting(true);
      const res = await untrackItemAPI.bulkImport(formData);
      console.log("Bulk import response:", res);
      toast.success("Bulk import completed successfully");
      setOpenImport(false);
      setFile(null);
      fetchItems();
    } catch (error) {
      console.error("Bulk import failed:", error.response || error);
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // DataTable configuration - FIXED
  const tableColumns = [
    { key: "select", label: "Select", type: "select" },
    { key: "id", label: "ID", type: "text" },
    { key: "picture", label: "Picture", type: "image" },
    { key: "item_code", label: "Item Code", type: "text" },
    { key: "item_name", label: "Item Name", type: "text" },
    { key: "specification", label: "Specification", type: "text" },
    { key: "model_no", label: "Model No", type: "text" },
    { key: "manufacturer", label: "Manufacturer", type: "text" },
    { key: "category_name", label: "Category", type: "custom" },
    { key: "unit_name", label: "Unit", type: "text" },
    { key: "quantity", label: "Qty", type: "text" },
    { key: "weight_display", label: "Weight", type: "text" },
    { key: "condition", label: "Condition", type: "text" },
    // { key: "archived", label: "Status", type: "badge" },
    // Remove duplicate actions column - DataTable should handle this automatically
  ];

  const tableFilters = [
    {
      key: "condition",
      label: "Condition",
      options: availableConditions.map((condition) => ({
        value: condition,
        label: condition,
      })),
    },
    {
      key: "category_name",
      label: "Category",
      options: availableCategories.map((category) => ({
        value: category,
        label: category,
      })),
    },
  ];

  const tableRowActions = [
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      onClick: (item) => navigate(`/untrack-items/edit/${item.id}`),
    },
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => navigate(`/untrack-items/show/${item.id}`),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: async (item) => {
        if (!window.confirm("Are you sure you want to delete this item?"))
          return;
        try {
          const res = await untrackItemAPI.remove(item.id);
          if (res?.success) {
            toast.success(res.message || "Item deleted");
            fetchItems();
          } else {
            toast.error(res?.message || "Failed to delete");
          }
        } catch {
          toast.error("Something went wrong");
        }
      },
    },
  ];

  const tableBulkActions = [
    {
      key: "delete_selected",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteSelected,
    },
    {
      key: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: handleExport,
    },
  ];

  // Transform data for the table
  const tableData = useMemo(() => {
    return items.map((item) => ({
      ...item,
      category_name: item.category?.category_name || "N/A",
      unit_name: item.unit?.name || "N/A",
      weight_display: `${item.weight || 0} ${item.weight_unit || ""}`,
      // Add any other transformed fields here
    }));
  }, [items]);

  const customRenderers = {
    picture: (item) =>
      item.picture_url ? (
        <img
          src={item.picture_url}
          alt="pic"
          className="h-10 w-10 object-cover rounded"
        />
      ) : (
        <span className="text-gray-400">No Image</span>
      ),
    category_name: (item) => (
      <div className="text-sm">
        <div className="font-medium">
          {item.category?.category_name || "N/A"}
        </div>
        <div className="text-xs text-gray-500">{item.category?.code || ""}</div>
      </div>
    ),
    // archived: (item) =>
    //   item.archived ? (
    //     <Badge variant="destructive">Archived</Badge>
    //   ) : (
    //     <Badge variant="success">Active</Badge>
    //   ),
  };

  return (
    <div className="h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Untracked Items</h1>
        <div className="flex gap-2">
          <Button
            className="bg-primary-color hover:bg-primary-color/90 text-white"
            onClick={() => setOpenImport(true)}
          >
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>

          <Button
            className="bg-primary-color hover:bg-primary-color/90 text-white"
            onClick={() => navigate("/untrack-items/add")}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        searchKeys={["item_code", "item_name", "model_no", "manufacturer"]}
        filterOptions={tableFilters}
        rowActions={tableRowActions}
        bulkActions={tableBulkActions}
        onSelectionChange={setSelectedItems}
        customRenderers={customRenderers}
        loading={loading}
        emptyMessage="No untracked items found"
        getRowClassName={(item) =>
          item.archived ? "bg-gray-200 cursor-not-allowed" : ""
        }
        getRowCursor={(item) => (item.archived ? "cursor-not-allowed" : "")}
      />

      {/* Bulk Import Modal */}
      <Dialog open={openImport} onOpenChange={setOpenImport} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Download the sample file and fill in data according to our
              migration structure.
            </p>
            <a
              href={`${baseUrl}/sample_untracked_item.csv`}
              download
              className="text-blue-600 underline"
            >
              Download Sample File
            </a>
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 text-white"
            >
              {importing ? "Importing..." : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UntrackItemIndex;
