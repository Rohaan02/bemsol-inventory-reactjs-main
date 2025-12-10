import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Label } from "@radix-ui/react-label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building,
  Phone,
  User,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import vendorAPI from "@/lib/vendorApi";

const VendorIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });

  // Filter Sidebar visibility
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Dynamic filters
  const [filters, setFilters] = useState([
    { field: "name", operator: "contains", value: "" },
  ]);

  const filterFields = [
    { value: "name", label: "Vendor Name" },
    { value: "key_contact_person", label: "Contact Person" },
    { value: "mobile_number", label: "Mobile Number" },
    { value: "cnic_number", label: "CNIC Number" },
    { value: "sales_tax_number", label: "Sales Tax Number" },
    { value: "ntn", label: "NTN" },
    { value: "product_services", label: "Product/Services" },
    { value: "remarks", label: "Remarks" },
  ];

  const filterOperators = [
    { value: "contains", label: "contains" },
    { value: "equals", label: "equals" },
    { value: "startsWith", label: "starts with" },
    { value: "endsWith", label: "ends with" },
  ];

  const navigate = useNavigate();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorAPI.getAll();
      setVendors(res || []);
      setFiltered(res || []);
    } catch {
      setError("Failed to fetch vendors");
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = vendors;

    // Apply dynamic filters
    const activeFilters = filters.filter(
      (filter) => filter.value.trim() !== ""
    );
    if (activeFilters.length > 0) {
      result = result.filter((vendor) => {
        return activeFilters.every((filter) => {
          const vendorValue = String(vendor[filter.field] || "").toLowerCase();
          const filterValue = filter.value.toLowerCase();

          switch (filter.operator) {
            case "contains":
              return vendorValue.includes(filterValue);
            case "equals":
              return vendorValue === filterValue;
            case "startsWith":
              return vendorValue.startsWith(filterValue);
            case "endsWith":
              return vendorValue.endsWith(filterValue);
            default:
              return true;
          }
        });
      });
    }

    // Apply global search
    if (search.trim() !== "") {
      result = result.filter(
        (vendor) =>
          (vendor.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (vendor.key_contact_person || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (vendor.mobile_number || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (vendor.cnic_number || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (vendor.sales_tax_number || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (vendor.ntn || "").toLowerCase().includes(search.toLowerCase()) ||
          (vendor.product_services || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (getVendorTypes(vendor) || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFiltered(result);
    setPage(1);
  }, [search, vendors, filters]);

  // Helper function to get vendor types as string
  const getVendorTypes = (vendor) => {
    if (vendor.vendor_types && Array.isArray(vendor.vendor_types)) {
      return vendor.vendor_types.map((vt) => vt.name).join(", ");
    }
    return "";
  };

  // Helper function to get primary address
  const getPrimaryAddress = (vendor) => {
    if (
      vendor.addresses &&
      Array.isArray(vendor.addresses) &&
      vendor.addresses.length > 0
    ) {
      const primaryAddress =
        vendor.addresses.find((addr) => addr.is_default) || vendor.addresses[0];
      return primaryAddress.address || "N/A";
    }
    return "N/A";
  };

  // Helper function to get tax payer type name
  const getTaxPayerType = (vendor) => {
    return vendor.tax_payer_type?.name || "N/A";
  };

  // Helper function to get WHT name
  const getWHT = (vendor) => {
    return vendor.wht?.name || "N/A";
  };

  // Apply sorting
  const sortedVendors = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === "none") {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle special fields
      if (sortConfig.key === "vendor_types") {
        aValue = getVendorTypes(a);
        bValue = getVendorTypes(b);
      } else if (sortConfig.key === "address") {
        aValue = getPrimaryAddress(a);
        bValue = getPrimaryAddress(b);
      } else if (sortConfig.key === "tax_payer_type") {
        aValue = getTaxPayerType(a);
        bValue = getTaxPayerType(b);
      } else if (sortConfig.key === "wht") {
        aValue = getWHT(a);
        bValue = getWHT(b);
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

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

  const paginated = sortedVendors.slice((page - 1) * pageSize, page * pageSize);

  // Filter handlers
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { field: "name", operator: "contains", value: "" },
    ]);
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFilter = (index, field, value) => {
    setFilters((prev) =>
      prev.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      )
    );
  };

  const clearAllFilters = () => {
    setFilters([{ field: "name", operator: "contains", value: "" }]);
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

  // Export to CSV
  const handleExport = () => {
    const dataToExport = vendors;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "ID",
      "Vendor Name",
      "Product/Services",
      "Vendor Types",
      "Contact Person",
      "Mobile Number",
      "CNIC Number",
      "Sales Tax Number",
      "NTN",
      "Tax Payer Type",
      "WHT",
      "Primary Address",
      "Status",
    ];

    const csvData = dataToExport.map((vendor) => [
      vendor.id,
      vendor.name,
      vendor.product_services,
      getVendorTypes(vendor),
      vendor.key_contact_person,
      vendor.mobile_number,
      vendor.cnic_number,
      vendor.sales_tax_number,
      vendor.ntn,
      getTaxPayerType(vendor),
      getWHT(vendor),
      getPrimaryAddress(vendor),
      vendor.status === 1 ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vendors-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} vendor(s)`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await vendorAPI.remove(id);
      toast.success("Vendor deleted successfully");
      fetchVendors();
    } catch {
      toast.error("Failed to delete vendor");
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    }
    if (sortConfig.direction === "desc") {
      return <ChevronDown className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
  };

  // Pagination handlers
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Sortable table header component
  const SortableHeader = ({ children, field, className = "" }) => (
    <TableHead
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  // Action dropdown handler for individual vendors
  const ActionDropdown = ({ vendor }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/vendors/edit/${vendor.id}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(vendor.id)}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>

              <Button
                className="bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>

              <Button
                className="bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => navigate("/vendors/add")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Vendor
              </Button>
            </div>
          </div>

          <Card className="bg-white">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-gray-800">Vendor List</CardTitle>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />

                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 whitespace-nowrap">
                      Show:
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 bg-primary-color"
                        >
                          {pageSize}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                          onClick={() => handlePageSizeChange(50)}
                        >
                          50
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePageSizeChange(100)}
                        >
                          100
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 whitespace-nowrap">
                      Page:
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary-color"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                      >
                        «
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary-color"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        ‹
                      </Button>

                      {getPageNumbers().map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            pageNum === page
                              ? "bg-primary-color text-white"
                              : ""
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary-color"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(page + 1)}
                      >
                        ›
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary-color"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(totalPages)}
                      >
                        »
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="id" className="bg-gray-100">
                          ID
                        </SortableHeader>
                        <SortableHeader field="id" className="bg-gray-100">
                          Code
                        </SortableHeader>

                        <SortableHeader field="name" className="bg-gray-100">
                          Vendor Name
                        </SortableHeader>

                        <SortableHeader
                          field="vendor_types"
                          className="bg-gray-100"
                        >
                          Vendor Types
                        </SortableHeader>

                        <SortableHeader
                          field="key_contact_person"
                          className="bg-gray-100"
                        >
                          Contact Person
                        </SortableHeader>

                        <SortableHeader
                          field="mobile_number"
                          className="bg-gray-100"
                        >
                          Mobile
                        </SortableHeader>

                        <SortableHeader
                          field="tax_payer_type"
                          className="bg-gray-100"
                        >
                          Tax Payer Type
                        </SortableHeader>

                        <TableHead className="bg-gray-100">Address</TableHead>

                        <TableHead className="bg-gray-100">Status</TableHead>

                        <TableHead className="bg-gray-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.map((vendor) => (
                        <TableRow key={vendor.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {vendor.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {vendor.vendor_code}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{vendor.name}</span>
                            </div>
                            {vendor.product_services && (
                              <div className="text-xs text-gray-500 mt-1">
                                {vendor.product_services}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {vendor.vendor_types?.map((type, index) => (
                                <span
                                  key={type.id}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {type.name}
                                </span>
                              )) || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vendor.key_contact_person ? (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                {vendor.key_contact_person}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {vendor.mobile_number ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-500" />
                                {vendor.mobile_number}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>{getTaxPayerType(vendor)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {getPrimaryAddress(vendor)}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                vendor.status === 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {vendor.status === 0 ? "Inactive" : "Active"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ActionDropdown vendor={vendor} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Bottom Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {(page - 1) * pageSize + 1} to{" "}
                      {Math.min(page * pageSize, filtered.length)} of{" "}
                      {filtered.length} vendors
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
        </main>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l z-50 transform transition-transform duration-300 ease-in-out ${
          filtersOpen ? "translate-x-0" : "translate-x-full"
        }`}
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
          {/* Global Search */}
          <div>
            <Label htmlFor="global-search" className="text-sm font-medium mb-2">
              Global Search
            </Label>
            <Input
              id="global-search"
              type="text"
              placeholder="Search all fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dynamic Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Field Filters</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addFilter}
                className="h-8 bg-primary-color"
              >
                <Plus className="w-3 h-3 mr-1 " /> Add Filter
              </Button>
            </div>
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Select
                      value={filter.field}
                      onValueChange={(value) =>
                        updateFilter(index, "field", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filter.operator}
                      onValueChange={(value) =>
                        updateFilter(index, "operator", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOperators.map((operator) => (
                          <SelectItem
                            key={operator.value}
                            value={operator.value}
                          >
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value..."
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(index, "value", e.target.value)
                      }
                    />
                  </div>

                  {filters.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {filters.some((f) => f.value.trim() !== "") && (
            <div className="pt-2">
              <Label className="text-sm font-medium mb-2">Active Filters</Label>
              <div className="space-y-2">
                {filters
                  .filter((filter) => filter.value.trim() !== "")
                  .map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded text-sm"
                    >
                      <span>
                        {
                          filterFields.find((f) => f.value === filter.field)
                            ?.label
                        }{" "}
                        {filter.operator} "{filter.value}"
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFilter(index, "value", "")}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary-color text-white"
                onClick={() => setFiltersOpen(false)}
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-yellow-500"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorIndex;
