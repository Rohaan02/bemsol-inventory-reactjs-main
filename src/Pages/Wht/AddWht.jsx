// src/pages/WHT/AddWht.jsx
import { useState } from "react";
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
  ArrowLeft,
  Save,
} from "lucide-react";
import whtAPI from "../../lib/whtaxesApi";

const AddWht = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "WHT name is required";
    }

    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) < 0) {
      newErrors.value = "Valid rate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      const response = await whtAPI.create({
        ...formData,
        value: parseFloat(formData.value)
      });
      
      if (response.success) {
        toast.success(response.message || "WHT created successfully");
        navigate("/whts");
      } else {
        toast.error(response.message || "Failed to create WHT");
      }
    } catch (error) {
      console.error("Create WHT error:", error);
      
      if (error.response?.status === 422) {
        // Handle validation errors from server
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
        toast.error("Please fix the form errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to create WHT");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/wht")}
              className="flex items-center gap-2 bg-primary-color"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Withholding Tax</h1>
          </div>

          <Card className="bg-white max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-gray-800">WHT Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WHT Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter WHT name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Value (Rate) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate (%) *
                    </label>
                    <Input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="100"
                      className={`w-full ${errors.value ? 'border-red-500' : ''}`}
                      placeholder="Enter rate percentage"
                    />
                    {errors.value && (
                      <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/wht")}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-color hover:bg-primary-color/90 text-white"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create WHT"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AddWht;