import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Icons
import { Check, Upload, Loader2, X, Car } from "lucide-react";

// API
import vehicleAPI from "@/lib/vehicleAPI";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const EditVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    year: new Date().getFullYear(),
    reg_no: "",
    color: "",
    current_meter: "",
    image: null,
    status: "active",
  });

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getById(id);
      setVehicle(response.data);
      setFormData({
        name: response.data.name,
        model: response.data.model,
        year: response.data.year,
        reg_no: response.data.reg_no,
        color: response.data.color || "",
        current_meter: response.data.current_meter,
        status: response.data.status,
        image: null,
      });
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      Toast.fire({ icon: "error", title: "Failed to load vehicle." });
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      await vehicleAPI.update(id, submitData);
      Toast.fire({ icon: "success", title: "Vehicle updated successfully!" });
      navigate("/vehicles");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      const errorMessage = error.response?.data?.message || "Failed to update vehicle.";
      Toast.fire({ icon: "error", title: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  if (loading && !vehicle) {
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
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
              <p className="text-gray-600 mt-1">Update vehicle information</p>
            </div>
            <Button
              onClick={() => navigate("/vehicles")}
              variant="outline"
              className="flex items-center gap-2 bg-yellow-400"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information Section */}
              <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-600 rounded"></div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vehicle Name *</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Toyota Hilux"
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Model *</Label>
                      <Input
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Hilux Double Cab"
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Year *</Label>
                      <Select
                        value={formData.year.toString()}
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, year: parseInt(val) }))
                        }
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Registration No *</Label>
                      <Input
                        name="reg_no"
                        value={formData.reg_no}
                        onChange={handleChange}
                        placeholder="ABC-123"
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Color</Label>
                      <Input
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="White"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Meter (km) *</Label>
                      <Input
                        name="current_meter"
                        value={formData.current_meter}
                        onChange={handleChange}
                        type="number"
                        step="0.01"
                        placeholder="15000.50"
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Image Section */}
              <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-600 rounded"></div>
                    Status & Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, status: val }))
                        }
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vehicle Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Input
                          type="file"
                          name="image"
                          onChange={handleChange}
                          className="hidden"
                          id="image-upload"
                          accept="image/*"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer block">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload new vehicle image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                          {formData.image ? (
                            <p className="text-xs text-green-600 mt-2">
                              Selected: {formData.image.name}
                            </p>
                          ) : vehicle?.image && (
                            <p className="text-xs text-blue-600 mt-2">
                              Current image will be kept
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate("/vehicles")}
                  className="h-10 px-6 text-sm bg-yellow-400"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-8 text-sm bg-primary-color hover:bg-primary-color/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Vehicle
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditVehicle;