import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { toast } from "react-toastify";
import Select from 'react-select';
import userAPI from "@/lib/userAPI";
import locationAPI from "@/lib/locationAPI";
import employeesApi from "../../lib/employeesApi";
export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    employee_id: "",
    location_ids: [], // Multiple locations
    image: null,
  });

  useEffect(() => {
    fetchUserData();
    fetchRoles();
    fetchLocations();
    fetchEmployees();
  }, [id]);
// Add this useEffect to handle employee selection after employees are fetched
useEffect(() => {
  if (employees.length > 0 && formData.employee_id) {
    console.log("Employees loaded, current employee_id:", formData.employee_id);
    console.log("Available employee options:", employeesOptions);
    
    const selectedEmployee = employeesOptions.find(
      emp => emp.value === formData.employee_id.toString()
    );
    console.log("Selected employee found:", selectedEmployee);
  }
}, [employees, formData.employee_id]);
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userData = await userAPI.getById(id);
      console.log("User data received:", userData);
      
      if (!userData) {
        throw new Error("User not found");
      }

      const user = userData.data || userData;
      
      if (!user) {
        throw new Error("User data is empty");
      }

      // Handle locations - assuming user.locations is an array of location objects
      const userLocations = user.locations || [];
      const locationIds = userLocations.map(loc => loc.id);
      const employeeId = user.employee_id || 
                      user.employee?.id || 
                      user.employee_id?.toString() || 
                      "";
    
    console.log("Employee ID found:", employeeId);
    console.log("Available employees:", employees);
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : "",
        location_ids: locationIds,
        employee_id: employeeId || "", 
        image: null,
      });

      // Set image preview if user has an image
      if (user.image_url || user.avatar) {
        setImagePreview(user.image_url || user.avatar);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      if (userAPI.getRoles) {
        const rolesData = await userAPI.getRoles();
        const rolesList = rolesData?.data || rolesData || [];
        setRoles(rolesList);
      } else {
        setRoles(['admin', 'user', 'editor']);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles(['admin', 'user', 'editor']);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await locationAPI.getAll();
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    }
  };
  const fetchEmployees = async () => {
    try {
      const employeesData = await employeesApi.getAll();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
  };
  const employeesOptions = employees.map(employee => ({
    value: employee.id.toString(),
    label: employee.first_name + " " + employee.last_name + " (" + employee.department_name + ")"
    }));
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle React Select changes
  const handleRoleChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      role: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleLocationChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      location_ids: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
    }));
  };
 const handleEmployeeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      employee_id: selectedOption ? selectedOption.value : "",
    }));
  };
  // Handle image upload with preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name.trim() || !formData.email.trim()) {
    toast.error("Name and email are required");
    return;
  }

  setSaving(true);

  try {
    const updateData = {
      name: formData.name,
      email: formData.email,
      ...(formData.role && { role: formData.role }),
      ...(formData.employee_id && { employee_id: formData.employee_id }), // Add this line
      ...(formData.location_ids.length > 0 && { location_ids: formData.location_ids })
    };

    // Handle file upload if image is selected
    if (formData.image) {
      const formDataObj = new FormData();
      Object.keys(updateData).forEach(key => {
        if (Array.isArray(updateData[key])) {
          updateData[key].forEach(val => formDataObj.append(`${key}[]`, val));
        } else {
          formDataObj.append(key, updateData[key]);
        }
      });
      formDataObj.append('image', formData.image);
      await userAPI.update(id, formDataObj);
    } else {
      await userAPI.update(id, updateData);
    }

    toast.success("User updated successfully");
    navigate("/users");
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(key => {
        toast.error(errors[key][0]);
      });
    } else if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to update user");
    }
  } finally {
    setSaving(false);
  }
};

  // Prepare options for React Select
  const roleOptions = roles.map(role => ({
    value: role.name || role,
    label: (role.name || role).charAt(0).toUpperCase() + (role.name || role).slice(1)
  }));

  const locationOptions = locations.map(location => ({
    value: location.id,
    label: location.name
  }));

  // Get selected locations for multi-select
  const selectedLocations = locationOptions.filter(option => 
    formData.location_ids.includes(option.value)
  );

  if (loading) {
    return (
      <div className="flex h-full min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Page Header - Sticky */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
              <p className="text-sm text-gray-600 mt-1">Update user information and permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="danger"
                
                onClick={() => navigate("/users")}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              {/* Main Form Card */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        User Information
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Update the user's basic details and role assignment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter full name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Role Field with React Select */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        User Role
                      </Label>
                      <Select
                        options={roleOptions}
                        value={roleOptions.find(option => option.value === formData.role)}
                        onChange={handleRoleChange}
                        placeholder="Select a role"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isSearchable
                        noOptionsMessage={() => "No roles found"}
                      />
                      <p className="text-xs text-gray-500">
                        Assign a role to define user permissions and access levels
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Employee
                      </Label>
                     <Select
                        options={employeesOptions}
                        value={employeesOptions.find(option => 
                          option.value === formData.employee_id?.toString()
                        )}
                        onChange={handleEmployeeChange}
                        placeholder="Select employee"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isSearchable
                        noOptionsMessage={() => "No employees found"}
                      />
                    </div>

                    {/* Locations Field with React Select */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Locations
                      </Label>
                      <Select
                        options={locationOptions}
                        value={selectedLocations}
                        onChange={handleLocationChange}
                        placeholder="Select locations (multiple)"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isMulti
                        isSearchable
                        isClearable
                        noOptionsMessage={() => "No locations found"}
                      />
                      <p className="text-xs text-gray-500">
                        Select multiple locations this user should have access to
                      </p>
                    </div>

                    {/* Image Upload with Preview */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Profile Image
                      </Label>
                      
                      {imagePreview ? (
                        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Image preview</p>
                            <p className="text-xs text-gray-500">Click the upload area to change image</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-green-500 transition-colors bg-gray-50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-600">Click to upload profile image</p>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        name="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card className="mt-6 shadow-sm border-0 bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-blue-100 rounded-md mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Update Information</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Changes to user roles, locations, and permissions will take effect immediately after saving.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for React Select */}
      <style jsx>{`
        .react-select-container .react-select__control {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          min-height: 48px;
          transition: all 0.2s;
        }
        .react-select-container .react-select__control:hover {
          border-color: #9ca3af;
        }
        .react-select-container .react-select__control--is-focused {
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
        }
        .react-select-container .react-select__menu {
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-select-container .react-select__multi-value {
          background-color: #d1fae5;
          border-radius: 0.375rem;
        }
        .react-select-container .react-select__multi-value__label {
          color: #065f46;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}