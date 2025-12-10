import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, KeyRound, Settings, Plus, ChevronUp, ChevronDown, Search } from "lucide-react";
import { toast } from "react-toastify";
import userAPI from "@/lib/userAPI";
import { useNavigate } from "react-router-dom";

export default function UserIndex() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page, search, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll({ 
        page, 
        search,
        sort_by: sortField,
        sort_order: sortDirection
      });
      setUsers(res.data);
      setTotalPages(res.meta.last_page);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      await userAPI.resetPassword(id, { 
        password: newPassword, 
        password_confirmation: newPassword 
      });
      toast.success("Password reset successfully");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page when searching
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="h-full">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                {/* Title on left */}
                <CardTitle className="text-lg font-semibold text-gray-800">
                  User Management
                </CardTitle>
                
                {/* Top Right Section with Pagination and New User Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      variant="success"
                      size="sm"
                      className="h-8"
                    >
                      Prev
                    </Button>
                    <span className="min-w-[100px] text-center">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      variant="success"
                      size="sm"
                      className="h-8"
                    >
                      Next
                    </Button>
                  </div>

                  {/* New User Button */}
                  <Button
                    onClick={() => navigate("/users/add")}
                    variant="success"
                    className=" flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" /> New User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Enhanced Search Box */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border p-2 pl-10 rounded w-full text-black"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                   variant="success"
                    className=" flex items-center"
                >
                  Search
                </Button>
                {(search || sortField !== "name" || sortDirection !== "asc") && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setSortField("name");
                      setSortDirection("asc");
                      setPage(1);
                    }}
                    variant="outline"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Responsive Table with Sortable Headers */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {getSortIcon("email")}
                        </div>
                      </TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.roles && user.roles.length > 0
                            ? user.roles.map((r) => r.name).join(", ")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {user.location_names && user.location_names.length > 0
                            ? user.location_names.join(", ")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => navigate(`/users/edit/${user.id}`)}
                              variant="success"
                              className="text-white flex items-center"
                              size="sm"
                            >
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button
                              onClick={() => handleResetPassword(user.id)}
                              variant="success"
                              className="text-white flex items-center"
                              size="sm"
                            >
                              <KeyRound className="w-4 h-4 mr-1" /> Reset
                            </Button>
                            <Button
                              onClick={() => navigate(`/user-permissions/${user.id}`)}
                               variant="success"
                              className="text-white flex items-center"
                              size="sm"
                            >
                              <Settings className="w-4 h-4 mr-1" /> Permissions
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom Pagination (optional - can remove if you prefer only top pagination) */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}