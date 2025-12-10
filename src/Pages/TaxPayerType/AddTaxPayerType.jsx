// src/pages/TaxPayerType/AddTaxPayerType.jsx
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
import taxPayerTypeAPI from "../../lib/taxPayerTypeAPI";

const AddTaxPayerType = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: "",
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
      newErrors.name = "Tax payer type name is required";
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
      const response = await taxPayerTypeAPI.create(formData);
      
      if (response.success) {
        toast.success(response.message || "Tax payer type created successfully");
        navigate("/tax-payer-types");
      } else {
        toast.error(response.message || "Failed to create tax payer type");
      }
    } catch (error) {
      console.error("Create tax payer type error:", error);
      
      if (error.response?.status === 422) {
        // Handle validation errors from server
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
        toast.error("Please fix the form errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to create tax payer type");
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
              onClick={() => navigate("/tax-payer-types")}
              className="flex items-center gap-2 bg-primary-color"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Tax Payer Type</h1>
          </div>

          <Card className="bg-white max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-gray-800">Tax Payer Type Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Payer Type Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter tax payer type name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/tax-payer-types")}
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
                    {loading ? "Creating..." : "Create Tax Payer Type"}
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

export default AddTaxPayerType;