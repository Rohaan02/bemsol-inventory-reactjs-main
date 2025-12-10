import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Icons
import { Plus, Edit, Trash2, Eye, Car, Loader2, Search, Download, ChevronUp, ChevronDown, CheckSquare, Square } from "lucide-react";

// API
import vehicleAPI from "@/lib/vehicleAPI";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const VehicleIndex = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleAPI.getAll();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      Toast.fire({ icon: "error", title: "Failed to load vehicles." });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle =>
      Object.values(vehicle).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [vehicles, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedVehicles.size === filteredAndSortedVehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredAndSortedVehicles.map(v => v.id)));
    }
  };

  const toggleSelectVehicle = (id) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVehicles(newSelected);
  };

  const isAllSelected = filteredAndSortedVehicles.length > 0 && selectedVehicles.size === filteredAndSortedVehicles.length;
  const isSomeSelected = selectedVehicles.size > 0 && selectedVehicles.size < filteredAndSortedVehicles.length;

  // Delete handlers
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete vehicle "${name}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#ca8a04",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await vehicleAPI.remove(id);
        Toast.fire({ icon: "success", title: "Vehicle deleted successfully!" });
        fetchVehicles();
        setSelectedVehicles(new Set());
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        Toast.fire({ icon: "error", title: "Failed to delete vehicle." });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedVehicles.size} vehicle(s). This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#ca8a04",
      confirmButtonText: `Yes, delete ${selectedVehicles.size} vehicle(s)!`,
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = Array.from(selectedVehicles).map(id => vehicleAPI.remove(id));
        await Promise.all(deletePromises);
        Toast.fire({ icon: "success", title: `${selectedVehicles.size} vehicle(s) deleted successfully!` });
        fetchVehicles();
        setSelectedVehicles(new Set());
      } catch (error) {
        console.error("Error deleting vehicles:", error);
        Toast.fire({ icon: "error", title: "Failed to delete some vehicles." });
      }
    }
  };

  // Export handler
  const handleExport = () => {
    const dataToExport = filteredAndSortedVehicles.map(vehicle => ({
      Name: vehicle.name,
      Model: vehicle.model,
      Year: vehicle.year,
      'Registration No': vehicle.reg_no,
      Color: vehicle.color || 'N/A',
      'Current Meter': vehicle.current_meter,
      Status: vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1),
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Toast.fire({ icon: "success", title: "Data exported successfully!" });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-green-100 text-green-800 border border-green-200",
      inactive: "bg-gray-100 text-gray-800 border border-gray-200",
      maintenance: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/default-vehicle.png';
    return image.startsWith('http') ? image : `/storage/vehicles/${image}`;
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
              <p className="text-gray-600 mt-1">Manage your fleet vehicles</p>
            </div>
            <Button
              onClick={() => navigate("/vehicles/add")}
              className="flex items-center gap-2 bg-primary-color text-white hover:bg-primary-color/90"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                  
                  {selectedVehicles.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedVehicles.size} selected
                      </span>
                      <Button
                        onClick={handleBulkDelete}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex items-center gap-2 bg-primary-color text-white hover:bg-primary-color/90"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {isAllSelected ? (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          ) : isSomeSelected ? (
                            <div className="w-4 h-4 border-2 border-green-600 bg-green-600 bg-opacity-20 rounded" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('model')}
                      >
                        <div className="flex items-center gap-1">
                          Model
                          {getSortIcon('model')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('year')}
                      >
                        <div className="flex items-center gap-1">
                          Year
                          {getSortIcon('year')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('reg_no')}
                      >
                        <div className="flex items-center gap-1">
                          Reg No
                          {getSortIcon('reg_no')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('current_meter')}
                      >
                        <div className="flex items-center gap-1">
                          Meter (km)
                          {getSortIcon('current_meter')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center">
                          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first vehicle"}
                          </p>
                          {!searchTerm && (
                            <Button
                              onClick={() => navigate("/vehicles/add")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Vehicle
                            </Button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedVehicles.has(vehicle.id)}
                              onChange={() => toggleSelectVehicle(vehicle.id)}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                              <img
                                src={getImageUrl(vehicle.image)}
                                alt={vehicle.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/images/default-vehicle.png';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {vehicle.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {vehicle.model}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {vehicle.year}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {vehicle.reg_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {vehicle.current_meter}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                                className="h-8 w-8 p-0 bg-primary-color text-white hover:bg-primary-color/90"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                                className="h-8 w-8 p-0 bg-primary-color text-white hover:bg-primary-color/90"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(vehicle.id, vehicle.name)}
                                className="h-8 w-8 p-0 bg-red-600 text-white hover:bg-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default VehicleIndex;