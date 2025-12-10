import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/axiosConfig";
import userAPI from "@/lib/userAPI";
import { useParams } from "react-router-dom";

export default function PermissionIndex() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUser();
    fetchPermissions();
  }, [id]);

  const fetchUser = async () => {
    const res = await userAPI.getById(id);
    setUser(res);
    setUserPermissions(res.permissions.map((p) => p.name));
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permissions");
      setPermissions(res.data); // grouped object
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleToggle = (permission) => {
    setUserPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    try {
      await userAPI.updatePermissions(id, userPermissions);
      toast.success("Permissions updated successfully");
    } catch {
      toast.error("Failed to update permissions");
    }
  };

  return (
     <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">
          <Card className="bg-white shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                Manage Permissions for {user ? user.name : "User"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full mb-4 text-black"
              />

              {/* Scrollable permissions */}
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(permissions).map(([group, perms]) => {
                  const filtered = perms.filter((perm) =>
                    perm.name.toLowerCase().includes(search.toLowerCase())
                  );
                  if (filtered.length === 0) return null;

                  return (
                    <div key={group} className="mb-6">
                      <h3 className="font-semibold text-lg capitalize mb-2 text-gray-700">
                        {group}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {filtered.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center space-x-2 border p-2 rounded bg-gray-50 hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={userPermissions.includes(perm.name)}
                              onChange={() => handleToggle(perm.name)}
                            />
                            <span className="capitalize text-black">
                              {perm.name.replace(/_/g, " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={handleSave}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
