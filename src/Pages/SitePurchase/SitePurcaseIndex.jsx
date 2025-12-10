// src/pages/SitePurchase/SitePurchaseIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThSortable,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  Download,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Truck,
  Package,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import sitePurchaseAPI from "@/lib/sitePurchaseAPI";

const SitePurchaseIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Multi-select
  const [selectedPurchases, setSelectedPurchases] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: new Set(),
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });

  // Filter Sidebar visibility
  const [filtersOpen, setFiltersOpen] = useState(false);

  const navigate = useNavigate();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await sitePurchaseAPI.getAll();
      console.log("API Response:", res); // Debug log

      // Handle different response structures
      let purchasesData = [];
      if (Array.isArray(res)) {
        purchasesData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        purchasesData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        purchasesData = res.data.data;
      } else {
        console.warn("Unexpected API response structure:", res);
      }

      setPurchases(purchasesData);
      setFiltered(purchasesData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setError("Failed to fetch site purchases");
      setPurchases([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Get unique values for filters
  const availableStatuses = useMemo(() => {
    if (!Array.isArray(purchases)) return [];

    const statuses = purchases
      .map((purchase) => purchase.status)
      .filter(Boolean);
    return [...new Set(statuses)];
  }, [purchases]);

  // Apply filters and search
  useEffect(() => {
    let result = Array.isArray(purchases) ? purchases : [];

    // Apply search
    if (search.trim() !== "") {
      result = result.filter(
        (purchase) =>
          (purchase.purchase_no || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (purchase.site_demand_no || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (purchase.inventory_item?.item_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (purchase.site_demand?.item_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (purchase.remarks || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filters
    if (filters.status.size > 0) {
      result = result.filter(
        (purchase) => purchase.status && filters.status.has(purchase.status)
      );
    }

    setFiltered(result);
    setPage(1);
  }, [search, purchases, filters]);

  // Apply sorting
  const sortedPurchases = useMemo(() => {
    if (!Array.isArray(filtered)) return [];
    if (!sortConfig.key || sortConfig.direction === "none") {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle inventory item name sorting
      if (sortConfig.key === "inventory_item_name") {
        aValue = a.inventory_item?.item_name || "";
        bValue = b.inventory_item?.item_name || "";
      }

      // Handle site demand item name sorting
      if (sortConfig.key === "site_demand_item_name") {
        aValue = a.site_demand?.item_name || "";
        bValue = b.site_demand?.item_name || "";
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle numeric values
      if (
        ["demand_qty", "purchase_qty", "unit_cost", "amount"].includes(
          sortConfig.key
        )
      ) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filtered, sortConfig]);

  const paginated = Array.isArray(sortedPurchases)
    ? sortedPurchases.slice((page - 1) * pageSize, page * pageSize)
    : [];

  // Multi-select handlers
  const handleSelectPurchase = (purchaseId) => {
    const newSelected = new Set(selectedPurchases);
    if (newSelected.has(purchaseId)) {
      newSelected.delete(purchaseId);
    } else {
      newSelected.add(purchaseId);
    }
    setSelectedPurchases(newSelected);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (!Array.isArray(paginated)) return;

    if (isAllSelected || selectedPurchases.size === paginated.length) {
      setSelectedPurchases(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(paginated.map((purchase) => purchase.id));
      setSelectedPurchases(allIds);
      setIsAllSelected(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPurchases.size === 0) {
      toast.error("Please select purchases to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedPurchases.size} purchase(s)?`
      )
    )
      return;

    try {
      const deletePromises = Array.from(selectedPurchases).map((id) =>
        sitePurchaseAPI.remove(id)
      );

      await Promise.all(deletePromises);
      toast.success(
        `${selectedPurchases.size} purchase(s) deleted successfully`
      );
      setSelectedPurchases(new Set());
      setIsAllSelected(false);
      fetchPurchases();
    } catch {
      toast.error("Failed to delete some purchases");
    }
  };

  // Filter handlers
  const handleStatusFilter = (status) => {
    const newStatus = new Set(filters.status);
    if (newStatus.has(status)) {
      newStatus.delete(status);
    } else {
      newStatus.add(status);
    }
    setFilters((prev) => ({ ...prev, status: newStatus }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: new Set(),
    });
    setSearch("");
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      if (current.direction === "desc") {
        return { key, direction: "none" };
      }
      return { key, direction: "asc" };
    });
  };

  // Export to Excel
  const handleExport = () => {
    const dataToExport =
      selectedPurchases.size > 0
        ? purchases.filter((purchase) => selectedPurchases.has(purchase.id))
        : purchases;

    if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Convert to CSV
    const headers = [
      "Purchase No",
      "Purchase Date",
      "Demand No",
      "Item Name",
      "Demand Qty",
      "Purchase Qty",
      "Unit Cost",
      "Amount",
      "Status",
      "Remarks",
    ];
    const csvData = dataToExport.map((purchase) => [
      purchase.purchase_no,
      purchase.purchase_date,
      purchase.site_demand_no,
      purchase.inventory_item?.item_name ||
        purchase.site_demand?.item_name ||
        "N/A",
      purchase.demand_qty,
      purchase.purchase_qty,
      purchase.unit_cost,
      purchase.amount,
      purchase.status,
      purchase.remarks,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `site-purchases-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} purchase(s)`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?"))
      return;

    try {
      const res = await sitePurchaseAPI.remove(id);
      if (res?.success) {
        toast.success(res.message || "Purchase deleted");
        fetchPurchases();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === "asc")
      return <ChevronUp className="w-4 h-4" />;
    if (sortConfig.direction === "desc")
      return <ChevronDown className="w-4 h-4" />;
    return null;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      purchase: { color: "bg-blue-100 text-blue-800", icon: Package },
      partial_purchase: {
        color: "bg-orange-100 text-orange-800",
        icon: Package,
      },
      received: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {status ? status.replace(/_/g, " ") : "Unknown"}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
    }).format(amount || 0);
  };

  // Pagination handlers
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Action dropdown handler for individual purchases
  const ActionDropdown = ({ purchase }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/site-purchases/edit/${purchase.id}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleDelete(purchase.id)}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // helper to know if a column is actively sorted
  const isSortedActive = (key) =>
    sortConfig.key === key && sortConfig.direction !== "none";

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {/* Page Header - Always full width */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Site Purchases</h1>
            <div className="flex gap-2">
              {/* Filter button toggles right sidebar */}
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary-color hover:bg-primary-color/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExport}>
                    Export All Purchases
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleExport}
                    disabled={selectedPurchases.size === 0}
                  >
                    Export Selected ({selectedPurchases.size})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active filters display */}
          {filters.status.size > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from(filters.status).map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  Status: {status.replace(/_/g, " ")}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleStatusFilter(status)}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Table Container - This area adjusts when filters are open */}
          <div
            className={`transition-all duration-300 ${
              filtersOpen ? "mr-80" : "mr-0"
            }`}
          >
            <Card className="bg-white">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-gray-800">Purchase List</CardTitle>

                {/* Search and Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search purchases here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-4 text-sm">
                    {/* Page Size Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 whitespace-nowrap">
                        Show:
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-gray-300"
                          >
                            {pageSize === "all" ? "All" : pageSize}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-20">
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(10)}
                          >
                            10
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(20)}
                          >
                            20
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(30)}
                          >
                            30
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange(40)}
                          >
                            40
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePageSizeChange("all")}
                          >
                            All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 whitespace-nowrap">
                        Page:
                      </span>
                      <div className="flex items-center gap-1">
                        {/* First Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === 1}
                          onClick={() => setPage(1)}
                        >
                          «
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          ‹
                        </Button>

                        {/* Current Page Display */}
                        <div className="px-3 py-1 bg-primary-color text-white rounded-md font-medium min-w-10 text-center">
                          {page}
                        </div>

                        {/* Next Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage(page + 1)}
                        >
                          ›
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-primary-color text-white"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage(totalPages)}
                        >
                          »
                        </Button>
                      </div>

                      {/* Total Pages */}
                      <span className="text-gray-600 whitespace-nowrap">
                        of {totalPages || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center">
                    <p>Loading purchases...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={fetchPurchases} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : !Array.isArray(paginated) || paginated.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">
                      {search || filters.status.size > 0
                        ? "No purchases match your filters"
                        : "No purchases found"}
                    </p>
                    {(search || filters.status.size > 0) && (
                      <Button onClick={clearAllFilters} className="mt-2">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Table with vertical scroll */}
                    <div className="overflow-x-auto">
                      <div className="max-h-[500px] overflow-y-auto">
                        <Table className="min-w-full text-sm">
                          <TableHeader className="sticky top-0 bg-gray-100 z-10">
                            <TableRow>
                              <TableHead className="w-12 sticky left-0 bg-gray-100 z-20">
                                <Checkbox
                                  checked={
                                    isAllSelected ||
                                    (selectedPurchases.size > 0 &&
                                      selectedPurchases.size ===
                                        paginated.length)
                                  }
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>

                              <ThSortable
                                field="purchase_no"
                                onClick={handleSort}
                                sortIcon={getSortIcon("purchase_no")}
                                active={isSortedActive("purchase_no")}
                                className="bg-gray-100"
                              >
                                Purchase No
                              </ThSortable>

                              <ThSortable
                                field="purchase_date"
                                onClick={handleSort}
                                sortIcon={getSortIcon("purchase_date")}
                                active={isSortedActive("purchase_date")}
                                className="bg-gray-100"
                              >
                                Purchase Date
                              </ThSortable>

                              <ThSortable
                                field="site_demand_no"
                                onClick={handleSort}
                                sortIcon={getSortIcon("site_demand_no")}
                                active={isSortedActive("site_demand_no")}
                                className="bg-gray-100"
                              >
                                Demand No
                              </ThSortable>

                              <ThSortable
                                field="inventory_item_name"
                                onClick={handleSort}
                                sortIcon={getSortIcon("inventory_item_name")}
                                active={isSortedActive("inventory_item_name")}
                                className="bg-gray-100"
                              >
                                Item Name
                              </ThSortable>

                              <ThSortable
                                field="demand_qty"
                                onClick={handleSort}
                                sortIcon={getSortIcon("demand_qty")}
                                active={isSortedActive("demand_qty")}
                                className="bg-gray-100"
                              >
                                Demand Qty
                              </ThSortable>

                              <ThSortable
                                field="purchase_qty"
                                onClick={handleSort}
                                sortIcon={getSortIcon("purchase_qty")}
                                active={isSortedActive("purchase_qty")}
                                className="bg-gray-100"
                              >
                                Purchase Qty
                              </ThSortable>

                              <ThSortable
                                field="unit_cost"
                                onClick={handleSort}
                                sortIcon={getSortIcon("unit_cost")}
                                active={isSortedActive("unit_cost")}
                                className="bg-gray-100"
                              >
                                Unit Cost
                              </ThSortable>

                              <ThSortable
                                field="amount"
                                onClick={handleSort}
                                sortIcon={getSortIcon("amount")}
                                active={isSortedActive("amount")}
                                className="bg-gray-100"
                              >
                                Amount
                              </ThSortable>

                              <ThSortable
                                field="status"
                                onClick={handleSort}
                                sortIcon={getSortIcon("status")}
                                active={isSortedActive("status")}
                                className="bg-gray-100"
                              >
                                Status
                              </ThSortable>

                              {/* ACTIONS COLUMN */}
                              <TableHead className="text-center bg-gray-100">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {paginated.map((purchase) => (
                              <TableRow
                                key={purchase.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="sticky left-0 bg-white z-10">
                                  <Checkbox
                                    checked={selectedPurchases.has(purchase.id)}
                                    onCheckedChange={() =>
                                      handleSelectPurchase(purchase.id)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-semibold text-blue-600">
                                  {purchase.purchase_no || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {purchase.purchase_date || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    {purchase.site_demand_no || "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {purchase.inventory_item?.item_name ||
                                    purchase.site_demand?.item_name ||
                                    "N/A"}
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold">
                                    {purchase.demand_qty || 0}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold">
                                    {purchase.purchase_qty || 0}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {formatCurrency(purchase.unit_cost)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 font-semibold text-green-600">
                                    {formatCurrency(purchase.amount)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(purchase.status)}
                                </TableCell>

                                {/* ACTIONS CELL */}
                                <TableCell>
                                  <div className="flex justify-center">
                                    <ActionDropdown purchase={purchase} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Bottom Pagination */}
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} to{" "}
                        {Math.min(page * pageSize, filtered.length)} of{" "}
                        {filtered.length} purchases
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <span className="text-gray-700 px-3">
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Filter Sidebar - Starts from table header level */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l z-40 transform transition-transform duration-300 ease-in-out ${
          filtersOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          marginTop: "140px",
          height: "calc(100vh - 140px)",
        }}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <div className="space-y-2">
              {availableStatuses.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No statuses available
                </div>
              ) : (
                availableStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.status.has(status)}
                      onCheckedChange={() => handleStatusFilter(status)}
                    />
                    <label className="text-sm capitalize">
                      {status.replace(/_/g, " ")}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setFiltersOpen(false)}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearAllFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when filters are open */}
      {filtersOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
};

export default SitePurchaseIndex;
