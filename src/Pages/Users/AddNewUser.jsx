import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import Select from 'react-select';
import userAPI from "@/lib/userAPI";
import locationAPI from "@/lib/locationAPI";
import employeesApi from "../../lib/employeesApi";

export default function AddNewUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    location_ids: [], // 👈 multiple locations
    image: null,
    employee_id: "", // 👈 multiple employees
  });

  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchLocations();
    fetchEmployees();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const locationsData = await locationAPI.getAll();
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await userAPI.getRoles();
      if (res) setRoles(res);
    } catch (error) {
      toast.error("Failed to fetch roles");
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const res = await employeesApi.getAll();
      if (res) setEmployees(res);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };
  
  const employeesOptions = employees.map(employee => ({
    value: employee.id.toString(),
    label: employee.first_name + " " + employee.last_name + " (" + employee.department_name + ")" 
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      setForm((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (selectedOption) => {
    setForm((prev) => ({
      ...prev,
      role: selectedOption ? selectedOption.value : "",
    }));
  };

  // ✅ Updated: Auto-populate full name when employee is selected
  const handleEmployeeChange = (selectedOption) => {
    if (selectedOption) {
      // Find the selected employee from the employees array
      const selectedEmployee = employees.find(
        emp => emp.id.toString() === selectedOption.value
      );
      
      if (selectedEmployee) {
        // Create full name from first and last name
        const fullName = `${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
        
        setForm((prev) => ({
          ...prev,
          employee_id: selectedOption.value,
          name: fullName, // Auto-populate the name field
        }));
      }
    } else {
      // If no employee is selected, clear both fields
      setForm((prev) => ({
        ...prev,
        employee_id: "",
        name: "", // Clear the name field
      }));
    }
  };

  // ✅ Multi-location select handler
  const handleLocationChange = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      location_ids: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
    }));
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.role) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        role: form.role,
        employee_id: form.employee_id,
        location_ids: form.location_ids, // ✅ multiple
      };

      if (form.image) {
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
          if (Array.isArray(userData[key])) {
            userData[key].forEach(val => formData.append(`${key}[]`, val));
          } else {
            formData.append(key, userData[key]);
          }
        });
        formData.append('image', form.image);
        await userAPI.create(formData);
      } else {
        await userAPI.create(userData);
      }

      toast.success("User created successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        location_ids: [],
        image: null,
        employee_id: "",
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      if (error.response?.status === 422) {
        toast.error(Object.values(error.response.data.errors).join(", "));
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const roleOptions = roles.map(role => ({
    value: role.name,
    label: role.name.charAt(0).toUpperCase() + role.name.slice(1)
  }));

  const locationOptions = locations.map(location => ({
    value: location.id,
    label: location.name
  }));

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Page Header - Sticky */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
              <p className="text-sm text-gray-600 mt-1">Add a new user to the system</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="danger"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Card className="w-full bg-white shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Styled Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Employee</label>
                    <Select
                      options={employeesOptions}
                      onChange={handleEmployeeChange}
                      value={employeesOptions.find(option => option.value === form.employee_id) || null}
                      placeholder="Select employee"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isSearchable
                      noOptionsMessage={() => "No employees found"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      name="name"
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address *</label>
                    <input
                      name="email"
                      placeholder="Enter email address"
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <input
                      name="password"
                      placeholder="Enter password"
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                    <input
                      name="confirmPassword"
                      placeholder="Confirm password"
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* React Select Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role *</label>
                    <Select
                      options={roleOptions}
                      onChange={handleRoleChange}
                      value={roleOptions.find(option => option.value === form.role) || null}
                      placeholder="Select a role"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isSearchable
                      noOptionsMessage={() => "No roles found"}
                    />
                  </div>
                  

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Locations</label>
                    <Select
                      options={locationOptions}
                      onChange={handleLocationChange}
                      value={locationOptions.filter(option => form.location_ids.includes(option.value))}
                      placeholder="Select locations (multiple)"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isMulti
                      isSearchable
                      isClearable
                      noOptionsMessage={() => loading ? "Loading locations..." : "No locations found"}
                    />
                  </div>
                </div>

                {/* Enhanced Image Upload with Preview */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Profile Image</label>
                  
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
              </CardContent>
            </Card>
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