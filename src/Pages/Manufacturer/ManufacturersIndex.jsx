// src/pages/Manufacturers/ManufacturersIndex.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/themes";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
  Phone,
  Mail,
  Building,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { manufacturersApi } from "../../lib/manufacturersApi";

const ManufacturersIndex = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Search
  const [search, setSearch] = useState("");

  // Multi-select
  const [selectedManufacturers, setSelectedManufacturers] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none',
  });

  const navigate = useNavigate();

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const data = await manufacturersApi.getAll();
      setManufacturers(data || []);
      setFiltered(data || []);
    } catch (error) {
      setError("Failed to fetch manufacturers");
      console.error("Fetch manufacturers error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  // Apply search
  useEffect(() => {
    let result = manufacturers;

    // Apply search
    if (search.trim() !== "") {
      result = result.filter((mfg) =>
        (mfg.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (mfg.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (mfg.contact_person || "").toLowerCase().includes(search.toLowerCase()) ||
        (mfg.phone || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
    setPage(1);
  }, [search, manufacturers]);

  // Apply sorting
  const sortedManufacturers = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === 'none') {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filtered, sortConfig]);

  const paginated = sortedManufacturers.slice((page - 1) * pageSize, page * pageSize);

  // Multi-select handlers
  const handleSelectManufacturer = (manufacturerId) => {
    const newSelected = new Set(selectedManufacturers);
    if (newSelected.has(manufacturerId)) {
      newSelected.delete(manufacturerId);
    } else {
      newSelected.add(manufacturerId);
    }
    setSelectedManufacturers(newSelected);
    setIsAllSelected(false);
  };

  const handleSelectAll = () => {
    if (isAllSelected || selectedManufacturers.size === paginated.length) {
      setSelectedManufacturers(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(paginated.map(mfg => mfg.id));
      setSelectedManufacturers(allIds);
      setIsAllSelected(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedManufacturers.size === 0) {
      toast.error("Please select manufacturers to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedManufacturers.size} manufacturer(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedManufacturers).map(id => 
        manufacturersApi.remove(id)
      );
      
      await Promise.all(deletePromises);
      toast.success(`${selectedManufacturers.size} manufacturer(s) deleted successfully`);
      setSelectedManufacturers(new Set());
      setIsAllSelected(false);
      fetchManufacturers();
    } catch (error) {
      console.error("Delete manufacturers error:", error);
      toast.error("Failed to delete some manufacturers");
    }
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(current => {
      if (current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { key, direction: 'none' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Export to CSV
  const handleExport = () => {
    const dataToExport = selectedManufacturers.size > 0 
      ? manufacturers.filter(mfg => selectedManufacturers.has(mfg.id))
      : manufacturers;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Contact Person', 'Address', 'Description'];
    const csvData = dataToExport.map(mfg => [
      mfg.id,
      mfg.name,
      mfg.email,
      mfg.phone,
      mfg.contact_person,
      mfg.address,
      mfg.description
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manufacturers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} manufacturer(s)`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manufacturer?")) return;

    try {
      await manufacturersApi.remove(id);
      toast.success("Manufacturer deleted successfully");
      fetchManufacturers();
    } catch (error) {
      console.error("Delete manufacturer error:", error);
      toast.error("Failed to delete manufacturer");
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') return <ChevronUp className="w-4 h-4" />;
    if (sortConfig.direction === 'desc') return <ChevronDown className="w-4 h-4" />;
    return null;
  };

  const isSortedActive = (key) => sortConfig.key === key && sortConfig.direction !== 'none';

  // Action dropdown handler for individual manufacturers
  const ActionDropdown = ({ manufacturer }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/manufacturers/edit/${manufacturer.id}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(manufacturer.id)}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="h-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manufacturers</h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary-color hover:bg-primary-color/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExport}>
                    Export All Manufacturers
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExport}
                    disabled={selectedManufacturers.size === 0}
                  >
                    Export Selected ({selectedManufacturers.size})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={() => navigate("/manufacturers/add")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Manufacturer
              </Button>
            </div>
          </div>

          {/* Selected manufacturers actions */}
          {selectedManufacturers.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedManufacturers.size} manufacturer(s) selected
              </span>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
              </Button>
            </div>
          )}

          <Card className="bg-white">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-gray-800">Manufacturer List</CardTitle>
              <Input
                type="text"
                placeholder="Search by name, email, phone, or contact person..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading manufacturers...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <>
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={isAllSelected || (selectedManufacturers.size > 0 && selectedManufacturers.size === paginated.length)}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>

                        <ThSortable
                          field="id"
                          onClick={handleSort}
                          sortIcon={getSortIcon('id')}
                          active={isSortedActive('id')}
                          className="bg-gray-100"
                        >
                          ID
                        </ThSortable>

                        <ThSortable
                          field="name"
                          onClick={handleSort}
                          sortIcon={getSortIcon('name')}
                          active={isSortedActive('name')}
                          className="bg-gray-100"
                        >
                          Name
                        </ThSortable>

                        <TableHead>Contact Info</TableHead>

                        <ThSortable
                          field="contact_person"
                          onClick={handleSort}
                          sortIcon={getSortIcon('contact_person')}
                          active={isSortedActive('contact_person')}
                          className="bg-gray-100"
                        >
                          Contact Person
                        </ThSortable>

                        <TableHead>Address</TableHead>

                        <TableHead>Description</TableHead>

                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.map((manufacturer) => (
                        <TableRow key={manufacturer.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedManufacturers.has(manufacturer.id)}
                              onCheckedChange={() => handleSelectManufacturer(manufacturer.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{manufacturer.id}</TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-600" />
                              <div className="font-semibold">{manufacturer.name}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{manufacturer.email}</span>
                              </div>
                              {manufacturer.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-500" />
                                  <span className="text-sm">{manufacturer.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {manufacturer.contact_person ? (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{manufacturer.contact_person}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[200px]">
                              <span className="text-sm line-clamp-2">
                                {manufacturer.address || 'N/A'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[200px]">
                              <span className="text-sm line-clamp-2">
                                {manufacturer.description || 'N/A'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <ActionDropdown manufacturer={manufacturer} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {paginated.length === 0 && !loading && (
                    <div className="flex justify-center items-center py-8 text-gray-500">
                      No manufacturers found
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
    </div>
  );
};

export default ManufacturersIndex;