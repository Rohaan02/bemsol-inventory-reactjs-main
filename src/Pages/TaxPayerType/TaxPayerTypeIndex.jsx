// src/pages/TaxPayerType/TaxPayerTypeIndex.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import taxPayerTypeAPI from "../../lib/taxPayerTypeAPI";

const TaxPayerTypeIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taxPayerTypes, setTaxPayerTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaxPayerTypes();
  }, []);

  const fetchTaxPayerTypes = async () => {
    setLoading(true);
    try {
      const data = await taxPayerTypeAPI.getAll();
      setTaxPayerTypes(data);
    } catch (error) {
      console.error("Error fetching tax payer types:", error);
      toast.error("Failed to load tax payer types");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tax payer type?")) {
      return;
    }

    try {
      const response = await taxPayerTypeAPI.remove(id);
      if (response.success) {
        toast.success(response.message || "Tax payer type deleted successfully");
        fetchTaxPayerTypes();
      } else {
        toast.error(response.message || "Failed to delete tax payer type");
      }
    } catch (error) {
      console.error("Delete tax payer type error:", error);
      toast.error(error.response?.data?.message || "Failed to delete tax payer type");
    }
  };

  const toggleDropdown = (id, e) => {
    if (e) {
      e.stopPropagation();
    }
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const filteredTaxPayerTypes = taxPayerTypes.filter(type =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tax Payer Types</h1>
            <Button
              onClick={() => navigate("/tax-payer-types/add")}
              className="bg-primary-color hover:bg-primary-color/90 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Type
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800">Tax Payer Type List</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search tax payer types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTaxPayerTypes.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                            No tax payer types found
                          </td>
                        </tr>
                      ) : (
                        filteredTaxPayerTypes.map((type) => (
                          <tr key={type.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {type.name}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="flex justify-center">
                                {/* 3-dot dropdown for all screen sizes */}
                                <div className="relative">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => toggleDropdown(type.id, e)}
                                    className="flex items-center gap-1 p-2 bg-white text-black"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>

                                  {activeDropdown === type.id && (
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/tax-payer-types/edit/${type.id}`);
                                          setActiveDropdown(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(type.id);
                                          setActiveDropdown(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-md"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TaxPayerTypeIndex;