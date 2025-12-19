// src/pages/Assets/AssetIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import assetAPI from "@/lib/assetAPI";
import categoryAPI from "@/lib/categoryAPI";
import unitApi from "@/lib/unitApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  Pencil,
  MoreVertical,
  Download,
  Search,
  Settings,
  ArrowUpDown,
  Eye,
  EyeOff,
  X,
  Filter,
  CheckCircle,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const AssetIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [filters, setFilters] = useState({
    asset_type: "",
  });
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Add this function after the existing handler functions
  const handleUpdateStatus = async (asset) => {
    const newStatus = !asset.is_active;
    const action = newStatus ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} this asset?`))
      return;

    try {
      // You need to implement this API call in your assetAPI
      await assetAPI.updateStatus(asset.id, { is_active: newStatus });
      toast.success(`Asset ${action}d successfully`);
      fetchAssets(meta.current_page);
    } catch (error) {
      console.error(`Error ${action}ing asset:`, error);
      toast.error(`Failed to ${action} asset`);
    }
  };

  // Column visibility settings
  const [visibleColumns, setVisibleColumns] = useState({
    image_url: true,
    item_code: true,
    item_name: true,
    model_no: true,
    category: true,
    unit: true,
    unit_price: true,
    asset_type: true,
    maintenance: false,
    tag_prefix: false,
    specifications: false,
    manufacturer_name: false,
    vendor_name: false,
    status: false,
  });

  const navigate = useNavigate();

  // Fetch dropdown data (still needed for display)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, unitsRes] = await Promise.all([
          categoryAPI.getAllCategories(),
          unitApi.getAll(),
        ]);
        setCategories(categoriesRes || []);
        setUnits(unitsRes || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const fetchAssets = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize,
        search: search || undefined,
        asset_type: filters.asset_type || undefined,
      };

      console.log("Fetching assets with params:", params);

      const res = await assetAPI.getAll(params);
      console.log("Assets API response:", res);

      // Handle different response structures
      if (res && res.data) {
        setAssets(res.data);
        setMeta(res.meta || {});
      } else if (Array.isArray(res)) {
        setAssets(res);
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: res.length,
          total: res.length,
          from: 1,
          to: res.length,
        });
      } else {
        setAssets([]);
        setMeta({});
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to fetch assets");
      setAssets([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, [search, filters, pageSize]);

  const assetTypeOptions = [
    { value: "", label: "All Types" },
    { value: "asset", label: "Asset" },
    { value: "machine", label: "Machinery" },
    { value: "power_tools", label: "Power Tools" },
  ];

  const pageSizeOptions = [
    { value: "5", label: "5 per page" },
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "40", label: "40 per page" },
    { value: "all", label: "All records" },
  ];

  // Column definitions
  const columns = [
    { key: "image_url", label: "Image", sortable: false },
    { key: "item_code", label: "Item Code", sortable: true },
    { key: "item_name", label: "Item Name", sortable: true },
    { key: "model_no", label: "Model No", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "unit", label: "Unit", sortable: true },
    { key: "unit_price", label: "Unit Price", sortable: true },
    { key: "asset_type", label: "Asset Type", sortable: true },
    { key: "maintenance", label: "Maintenance", sortable: true },
    { key: "tag_prefix", label: "Tag Prefix", sortable: true },
    { key: "specifications", label: "Specifications", sortable: true },
    { key: "manufacturer_name", label: "Manufacturer", sortable: true },
    { key: "vendor_name", label: "Vendor", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  // Get visible columns
  const getVisibleColumns = () => {
    return columns.filter((col) => visibleColumns[col.key]);
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Reset to default visible columns
  const resetColumnVisibility = () => {
    const newVisibility = {
      image_url: true,
      item_code: true,
      item_name: true,
      model_no: true,
      category: true,
      unit: true,
      unit_price: true,
      asset_type: true,
      maintenance: false,
      tag_prefix: false,
      specifications: false,
      manufacturer_name: false,
      vendor_name: false,
      status: false,
    };
    setVisibleColumns(newVisibility);
  };

  // Show all columns
  const showAllColumns = () => {
    const newVisibility = {};
    columns.forEach((col) => {
      newVisibility[col.key] = true;
    });
    setVisibleColumns(newVisibility);
  };

  // Multi-select
  const handleSelectAsset = (id) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAssets(newSet);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
      setIsAllSelected(false);
    } else {
      // Only select active assets (similar to InventoryTable)
      const allIds = new Set(
        assets.filter((asset) => asset.is_active).map((asset) => asset.id)
      );
      setSelectedAssets(allIds);
      setIsAllSelected(true);
    }
  };

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Sort the assets array
    const sortedAssets = [...assets].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";

      if (direction === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    setAssets(sortedAssets);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await assetAPI.remove(id);
      toast.success("Asset deleted");
      fetchAssets(meta.current_page);
    } catch {
      toast.error("Failed to delete asset");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAssets.size === 0) return toast.error("Select assets first");
    if (!window.confirm(`Delete ${selectedAssets.size} selected assets?`))
      return;
    try {
      await Promise.all(
        Array.from(selectedAssets).map((id) => assetAPI.remove(id))
      );
      toast.success("Selected assets deleted");
      setSelectedAssets(new Set());
      setIsAllSelected(false);
      fetchAssets(meta.current_page);
    } catch {
      toast.error("Failed to delete some assets");
    }
  };

  const handleExport = () => {
    const totalRecords = meta.total || assets.length;
    const currentRecords = assets.length;
    toast.info(`Exporting ${currentRecords}/${totalRecords} records`);
    // Export functionality would go here
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      asset_type: "",
    });
    setSearch("");
  };

  const ActionDropdown = ({ asset }) => {
    const isInactive = !asset.is_active;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white shadow-lg border border-gray-200 rounded-lg"
        >
          {!isInactive && (
            <>
              <DropdownMenuItem
                onClick={() => navigate(`/asset/${asset.id}`)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/assets/edit/${asset.id}`)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(asset.id)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={() => handleUpdateStatus(asset)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            {asset.is_active ? (
              <>
                <Ban className="w-4 h-4 text-red-500" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Activate</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Calculate records info for export button
  const totalRecords = meta.total || assets.length;
  const currentRecords = assets.length;
  const recordsInfo = `${currentRecords}/${totalRecords}`;

  // Get display value for fields
  const getDisplayValue = (asset, columnKey) => {
    switch (columnKey) {
      case "image_url":
        return asset.image_url ? (
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src={asset.image_url}
              alt={asset.item_name}
              className="w-full h-full object-cover rounded-md border border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<div class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center"><span class="text-gray-400 text-xs">No Image</span></div>';
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        );

      case "category":
        return asset.category?.category_name || asset.category_name || "-";

      case "unit":
        return asset.unit?.name || asset.unit_id || "-";

      case "unit_price":
        return asset.unit_cost
          ? `$${parseFloat(asset.unit_cost).toFixed(2)}`
          : "-";

      case "asset_type":
        const typeMap = {
          asset: "Asset",
          machine: "Machinery",
          power_tools: "Power Tools",
        };
        return typeMap[asset.asset_type] || asset.asset_type || "-";

      case "maintenance":
        return asset.maintenance === "yes" ? "Yes" : "No";

      case "specifications":
        return asset.specification ? (
          <span
            className="truncate max-w-[200px] inline-block"
            title={asset.specification}
          >
            {asset.specification.length > 50
              ? `${asset.specification.substring(0, 50)}...`
              : asset.specification}
          </span>
        ) : (
          "-"
        );

      case "manufacturer_name":
        return asset.manufacturer_name || "-";

      case "vendor_name":
        return asset.vendor?.name || asset.name || "-";

      case "status":
        return asset.is_active ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        );

      default:
        return asset[columnKey] || "-";
    }
  };

  // Column settings modal
  const ColumnSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Column Settings
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose which columns to display in the table
            </p>
          </div>
          <button
            onClick={() => setShowColumnSettings(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div
                key={column.key}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  visibleColumns[column.key]
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => toggleColumnVisibility(column.key)}
              >
                <Checkbox
                  checked={visibleColumns[column.key]}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}
                />
                <div className="flex items-center gap-2 flex-1">
                  {visibleColumns[column.key] ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {column.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Button
              onClick={resetColumnVisibility}
              variant="success"
              className="border-gray-300 hover:bg-gray-100"
            >
              Reset to Default
            </Button>
            <Button
              onClick={showAllColumns}
              variant="success"
              className="border-gray-300 hover:bg-gray-100"
            >
              Show All
            </Button>
          </div>
          <Button
            variant="success"
            onClick={() => setShowColumnSettings(false)}
            className="bg-primary-color hover:bg-success-700 text-white"
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        <main className="flex-1 overflow-y-hidden p-4 md:p-6">
          <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Assets
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your asset inventory
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    variant="success"
                    className="flex items-center gap-2 "
                  >
                    <Download className="w-4 h-4" />
                    Export ({recordsInfo})
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => navigate("/assets/add")}
                    className=" text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Asset
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm border border-gray-200 bg-white mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search assets by name, code, or model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Asset Type Filter */}
                    <div className="relative group">
                      <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                          value={filters.asset_type}
                          onChange={(e) =>
                            handleFilterChange("asset_type", e.target.value)
                          }
                          className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                        >
                          {assetTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Records Per Page */}
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          setPageSize(
                            e.target.value === "all"
                              ? "all"
                              : Number(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {pageSizeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Column Settings Button */}
                    <Button
                      onClick={() => setShowColumnSettings(true)}
                      variant="success"
                      className="flex items-center gap-2 "
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Columns</span>
                    </Button>

                    {(filters.asset_type || search) && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table Card */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Asset List
                </CardTitle>

                {/* Row Count Info */}
                <div className="text-sm text-gray-600">
                  {assets.length} of {totalRecords} assets
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12 py-3 px-4">
                              <Checkbox
                                checked={
                                  isAllSelected ||
                                  (selectedAssets.size > 0 &&
                                    selectedAssets.size === assets.length)
                                }
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            {getVisibleColumns().map((column) => (
                              <TableHead
                                key={column.key}
                                className="py-3 px-4 text-left"
                              >
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-gray-700">
                                    {column.label}
                                  </span>
                                  {column.sortable && (
                                    <button
                                      onClick={() => handleSort(column.key)}
                                      className="ml-1 text-gray-400 hover:text-gray-600"
                                    >
                                      <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="py-3 px-4 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assets.length > 0 ? (
                            assets.map((asset) => (
                              <TableRow
                                key={asset.id}
                                className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                  !asset.is_active
                                    ? "!bg-gray-200 cursor-not-allowed"
                                    : ""
                                } ${
                                  selectedAssets.has(asset.id)
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                              >
                                <TableCell className="py-3 px-4">
                                  <Checkbox
                                    checked={selectedAssets.has(asset.id)}
                                    onCheckedChange={() =>
                                      asset.is_active &&
                                      handleSelectAsset(asset.id)
                                    }
                                    disabled={!asset.is_active}
                                  />
                                </TableCell>
                                {getVisibleColumns().map((column) => (
                                  <TableCell
                                    key={column.key}
                                    className="py-3 px-4 text-sm"
                                  >
                                    {getDisplayValue(asset, column.key)}
                                  </TableCell>
                                ))}
                                <TableCell className="py-3 px-4 text-right">
                                  <ActionDropdown asset={asset} />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={getVisibleColumns().length + 2}
                                className="text-center py-12 text-gray-500"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <div className="text-4xl mb-2">📦</div>
                                  <p className="text-lg font-medium mb-2">
                                    No assets found
                                  </p>
                                  <p className="text-sm text-gray-600 mb-4">
                                    {search || filters.asset_type
                                      ? "Try adjusting your search or filters"
                                      : "Add your first asset to get started"}
                                  </p>
                                  {!search && !filters.asset_type && (
                                    <Button
                                      onClick={() => navigate("/assets/add")}
                                      className="bg-primary-color hover:bg-blue-700 text-white"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Asset
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Pagination */}
                    {meta && meta.last_page > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Showing {meta.from || 1} to {meta.to || assets.length}{" "}
                          of {meta.total || assets.length} assets
                        </div>

                        <div className="flex items-center gap-2">
                          {/* First Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(1)}
                            disabled={meta.current_page === 1}
                            className="h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-blue-50"
                            title="First Page"
                          >
                            <ChevronsLeft className="w-4 h-4" />
                          </Button>

                          {/* Previous Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(meta.current_page - 1)}
                            disabled={!meta.prev_page_url}
                            className="h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-blue-50"
                            title="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          {/* Current Page Info */}
                          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-md">
                            <span className="text-sm text-gray-600">Page</span>
                            <span className="font-semibold text-primary-color">
                              {meta.current_page}
                            </span>
                            <span className="text-sm text-gray-500">
                              of {meta.last_page}
                            </span>
                          </div>

                          {/* Next Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(meta.current_page + 1)}
                            disabled={!meta.next_page_url}
                            className="h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-blue-50"
                            title="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>

                          {/* Last Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(meta.last_page)}
                            disabled={meta.current_page === meta.last_page}
                            className="h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-blue-50"
                            title="Last Page"
                          >
                            <ChevronsRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Column Settings Modal */}
      {showColumnSettings && <ColumnSettingsModal />}
    </div>
  );
};

export default AssetIndex;
