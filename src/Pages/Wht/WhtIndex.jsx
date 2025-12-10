// src/pages/WHT/WhtIndex.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import whtAPI from "../../lib/whtaxesApi";

const WhtIndex = () => {
  const [loading, setLoading] = useState(false);
  const [whts, setWhts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWhts();
  }, []);

  const fetchWhts = async () => {
    setLoading(true);
    try {
      const data = await whtAPI.getAll();
      setWhts(data);
    } catch (error) {
      console.error("Error fetching WHTs:", error);
      toast.error("Failed to load WHTs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this WHT?")) {
      return;
    }

    try {
      const response = await whtAPI.remove(id);
      if (response.success) {
        toast.success(response.message || "WHT deleted successfully");
        fetchWhts();
      } else {
        toast.error(response.message || "Failed to delete WHT");
      }
    } catch (error) {
      console.error("Delete WHT error:", error);
      toast.error(error.response?.data?.message || "Failed to delete WHT");
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

  const filteredWhts = whts.filter(wht =>
    Object.values(wht).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="h-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Withholding Taxes</h1>
            <Button
              onClick={() => navigate("/wht/add")}
              className="bg-primary-color hover:bg-primary-color/90 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New WHT
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800">WHT List</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search WHTs..."
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
                          Rate
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWhts.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                            No WHTs found
                          </td>
                        </tr>
                      ) : (
                        filteredWhts.map((wht) => (
                          <tr key={wht.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {wht.name}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {wht.value}%
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="flex justify-center">
                                {/* 3-dot dropdown for all screen sizes */}
                                <div className="relative">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => toggleDropdown(wht.id, e)}
                                    className="flex items-center gap-1 p-2 bg-white text-black"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>

                                  {activeDropdown === wht.id && (
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/wht/edit/${wht.id}`);
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
                                          handleDelete(wht.id);
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
    </div>
  );
};

export default WhtIndex;