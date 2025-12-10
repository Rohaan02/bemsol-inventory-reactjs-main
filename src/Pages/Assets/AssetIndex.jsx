// src/pages/Assets/AssetIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import assetAPI from "@/lib/assetApi";
import ItemtypeAPI from "@/lib/ItemtypeAPI";
import inventoryItemAPI from "@/lib/InventoryItemApi";
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
  Plus,
  Trash2,
  Pencil,
  MoreVertical,
  Download,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Select from "react-select";

const AssetIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [types, setTypes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filters, setFilters] = useState({
    type_id: "",
    inventory_item_id: "",
    status: "",
  });
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesRes, inventoryRes] = await Promise.all([
          ItemtypeAPI.getAll(),
          inventoryItemAPI.getAll(),
        ]);
        console.log("Types response:", typesRes);
        console.log("Inventory items response:", inventoryRes);
        setTypes(typesRes || []);
        setInventoryItems(inventoryRes || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("Failed to load filter data");
      }
    };
    fetchDropdownData();
  }, []);

  const fetchAssets = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pageSize === "all" ? 1000 : pageSize, // Large number for "all"
        search: search || undefined,
        type_id: filters.type_id || undefined,
        inventory_item_id: filters.inventory_item_id || undefined,
        status: filters.status || undefined,
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

  // Format data for react-select
  const typeOptions = useMemo(
    () =>
      types.map((type) => ({
        value: type.id?.toString(),
        label: type.type_name || type.name || `Type ${type.id}`,
      })),
    [types]
  );

  const inventoryItemOptions = useMemo(
    () =>
      inventoryItems.map((item) => ({
        value: item.id?.toString(),
        label: `${item.item_number || ""} - ${
          item.item_name || `Item ${item.id}`
        }`,
      })),
    [inventoryItems]
  );

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Under Maintenance" },
  ];

  const pageSizeOptions = [
    { value: "5", label: "5 per page" },
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "40", label: "40 per page" },
    { value: "all", label: "All records" },
  ];

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      fontSize: "14px",
      borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "14px",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#16a34a"
        : state.isFocused
        ? "#dcfce7"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#16a34a",
        color: "white",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
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
      const allIds = new Set(assets.map((a) => a.id));
      setSelectedAssets(allIds);
      setIsAllSelected(true);
    }
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

  const handleFilterChange = (name, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const clearFilters = () => {
    setFilters({
      type_id: "",
      inventory_item_id: "",
      status: "",
    });
    setSearch("");
  };

  const generatePageNumbers = () => {
    if (!meta.last_page || meta.last_page <= 1) return [];

    const pages = [];
    const current = meta.current_page;
    const last = meta.last_page;
    const delta = 2;

    for (let i = 1; i <= last; i++) {
      if (
        i === 1 ||
        i === last ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const ActionDropdown = ({ asset }) => (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Calculate records info for export button
  const totalRecords = meta.total || assets.length;
  const currentRecords = assets.length;
  const recordsInfo = `${currentRecords}/${totalRecords}`;

  // Get current values for react-select
  const currentTypeValue =
    typeOptions.find((option) => option.value === filters.type_id) || null;
  const currentInventoryValue =
    inventoryItemOptions.find(
      (option) => option.value === filters.inventory_item_id
    ) || null;
  const currentStatusValue =
    statusOptions.find((option) => option.value === filters.status) || null;
  const currentPageSizeValue =
    pageSizeOptions.find((option) => option.value === pageSize.toString()) ||
    pageSizeOptions[1];

  return (
    <div className="flex h-full min-h-screen bg-white-500">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
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
                    className="text-white flex items-center"
                  >
                    <Download className="w-4 h-4" />
                    Export ({recordsInfo})
                  </Button>
                  <Button
                    onClick={() => navigate("/assets/add")}
                    variant="success"
                    className="text-white flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Asset
                  </Button>
                </div>

                {selectedAssets.size > 0 && (
                  <Button
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedAssets.size})
                  </Button>
                )}
              </div>
            </div>

            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {/* Left Side - Search */}
                  <div className="w-full sm:w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Center - Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="w-full sm:w-40">
                      <Select
                        options={[
                          { value: "", label: "All Types" },
                          ...typeOptions,
                        ]}
                        value={currentTypeValue}
                        onChange={(selectedOption) =>
                          handleFilterChange("type_id", selectedOption)
                        }
                        placeholder="Type"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    <div className="w-full sm:w-48">
                      <Select
                        options={[
                          { value: "", label: "All Items" },
                          ...inventoryItemOptions,
                        ]}
                        value={currentInventoryValue}
                        onChange={(selectedOption) =>
                          handleFilterChange(
                            "inventory_item_id",
                            selectedOption
                          )
                        }
                        placeholder="Inventory Item"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    <div className="w-full sm:w-40">
                      <Select
                        options={statusOptions}
                        value={currentStatusValue}
                        onChange={(selectedOption) =>
                          handleFilterChange("status", selectedOption)
                        }
                        placeholder="Status"
                        styles={customStyles}
                        isSearchable
                        isClearable
                      />
                    </div>

                    {(filters.type_id ||
                      filters.inventory_item_id ||
                      filters.status ||
                      search) && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Right Side - Page Size */}
                  <div className="w-full sm:w-40">
                    <Select
                      options={pageSizeOptions}
                      value={currentPageSizeValue}
                      onChange={(selectedOption) =>
                        setPageSize(
                          selectedOption.value === "all"
                            ? "all"
                            : Number(selectedOption.value)
                        )
                      }
                      styles={customStyles}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12 py-3">
                              <Checkbox
                                checked={
                                  isAllSelected ||
                                  (selectedAssets.size > 0 &&
                                    selectedAssets.size === assets.length)
                                }
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Asset Tag</TableHead>
                            <TableHead>Item No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Depreciation</TableHead>
                            <TableHead>Useful Life</TableHead>
                            <TableHead>Maintenance</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assets.length > 0 ? (
                            assets.map((asset) => (
                              <TableRow
                                key={asset.id}
                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <TableCell className="py-3">
                                  <Checkbox
                                    checked={selectedAssets.has(asset.id)}
                                    onCheckedChange={() =>
                                      handleSelectAsset(asset.id)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="py-3 font-medium text-gray-900">
                                  {asset.id}
                                </TableCell>
                                <TableCell className="py-3">
                                  {asset.tag_prefix}-
                                  {String(asset.serial_number).padStart(4, "0")}
                                </TableCell>
                                <TableCell className="py-3 text-gray-700">
                                  {asset.item_number}
                                </TableCell>
                                <TableCell className="py-3 font-medium text-gray-900">
                                  {asset.item_name}
                                </TableCell>
                                <TableCell className="py-3 text-gray-600 max-w-xs truncate">
                                  {asset.description}
                                </TableCell>
                                <TableCell className="py-3 text-gray-700">
                                  {asset.type_id}
                                </TableCell>
                                <TableCell className="py-3 text-gray-700">
                                  {asset.depreciation}%
                                </TableCell>
                                <TableCell className="py-3 text-gray-700">
                                  {asset.useful_life} years
                                </TableCell>
                                <TableCell className="py-3">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      asset.maintenance
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {asset.maintenance ? "Yes" : "No"}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                  <ActionDropdown asset={asset} />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={11}
                                className="text-center py-8 text-gray-500"
                              >
                                No assets found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {meta && meta.last_page > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Showing {meta.from || 1} to {meta.to || assets.length}{" "}
                          of {meta.total || assets.length} assets
                        </div>

                        {/* Enhanced Pagination */}
                        <div className="flex items-center gap-2">
                          {/* Previous Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(meta.current_page - 1)}
                            disabled={!meta.prev_page_url}
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Prev</span>
                          </Button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {generatePageNumbers().map((pageNum, index) =>
                              pageNum === "..." ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 text-gray-500"
                                >
                                  ...
                                </span>
                              ) : (
                                <Button
                                  key={pageNum}
                                  variant={
                                    pageNum === meta.current_page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => fetchAssets(pageNum)}
                                  className={`h-9 w-9 p-0 font-medium ${
                                    pageNum === meta.current_page
                                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                      : "border-gray-300 hover:bg-green-50 text-gray-700"
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              )
                            )}
                          </div>

                          {/* Next Page */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAssets(meta.current_page + 1)}
                            disabled={!meta.next_page_url}
                            className="h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-green-50 flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>

                          {/* Page Info */}
                          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-white border border-gray-300 rounded-md">
                            <span className="text-sm text-gray-600">Page</span>
                            <span className="font-semibold text-green-600">
                              {meta.current_page}
                            </span>
                            <span className="text-sm text-gray-500">
                              of {meta.last_page}
                            </span>
                          </div>
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
    </div>
  );
};

export default AssetIndex;
