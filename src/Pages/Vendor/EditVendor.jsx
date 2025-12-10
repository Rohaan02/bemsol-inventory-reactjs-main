import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  ArrowLeft,
  Save,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import vendorAPI from "../../lib/vendorApi";
import vendorTypeAPI from "@/lib/vendorTypeAPI";
import whtAPI from "../../lib/whtaxesApi";
import taxPayerTypeAPI from "@/lib/taxPayerTypeAPI";
import bankApi from "@/lib/bankApi"; // Import bank API

const EditVendor = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Dropdown options state
  const [vendorTypes, setVendorTypes] = useState([]);
  const [taxPayerTypes, setTaxPayerTypes] = useState([]);
  const [whtOptions, setWhtOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]); // Add bank options
  const [isedit, setIsedit] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    cnic_number: false,
    sales_tax_number: false,
    ntn: false,
    mobile_number: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    product_services: "",
    vendor_type_id: [],
    tax_payer_type_id: "",
    wht_id: "",
    addresses: [""],
    key_contact_person: "",
    mobile_number: "",
    cnic_number: "",
    cnic_attachment: [],
    sales_tax_number: "",
    ntn: "",
    documents: [],
    bank_accounts: [{ bank_id: "", bank_name: "", account_number: "" }],
    other_contact_person: "",
    other_contact_mobile: "",
    remarks: "",
    status: 1,
  });

  const [attachedFiles, setAttachedFiles] = useState({
    cnic: [],
    documents: [],
  });

  // Validation functions
  const validateCNIC = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length === 13;
  };

  const validateSalesTaxNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length === 13;
  };

  const validateNTN = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length === 8;
  };

  const validateMobileNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length >= 10 && numbers.length <= 15;
  };

  // Update validation errors
  const updateValidationErrors = (field, value) => {
    let isValid = true;

    switch (field) {
      case "cnic_number":
        isValid = value === "" || validateCNIC(value);
        break;
      case "sales_tax_number":
        isValid = value === "" || validateSalesTaxNumber(value);
        break;
      case "ntn":
        isValid = value === "" || validateNTN(value);
        break;
      case "mobile_number":
        isValid = validateMobileNumber(value);
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [field]: !isValid,
    }));

    return isValid;
  };

  // CNIC Mask: 31303-1961256-9 (13 digits)
  const formatCNIC = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(
        12,
        13
      )}`;
    }
  };

  // Sales Tax Number Mask: 00-00-0000-000-00 (13 digits)
  const formatSalesTaxNumber = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(
        4
      )}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(
        4,
        8
      )}-${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(
        4,
        8
      )}-${numbers.slice(8, 11)}-${numbers.slice(11, 13)}`;
    }
  };

  // NTN Mask: 0000000-0 (8 digits)
  const formatNTN = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 7) {
      return numbers;
    } else {
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 8)}`;
    }
  };

  // Load dropdown data from APIs
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setDropdownLoading(true);

        const [vendorTypesData, taxPayerTypesData, whtData, banksData] =
          await Promise.all([
            vendorTypeAPI.getAll(),
            taxPayerTypeAPI.getAll(),
            whtAPI.getAll(),
            bankApi.getAll(), // Fetch banks
          ]);

        setVendorTypes(
          vendorTypesData.map((type) => ({
            value: type.id,
            label: type.name,
          }))
        );

        setTaxPayerTypes(
          taxPayerTypesData.map((type) => ({
            value: type.id,
            label: type.name,
          }))
        );

        setWhtOptions(
          whtData.map((wht) => ({
            value: wht.id,
            label: `${wht.name} (${wht.value}%)`,
          }))
        );

        // Set bank options for dropdown
        setBankOptions(
          banksData.map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))
        );
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setDropdownLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Fetch vendor data
  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return;

      try {
        setFetching(true);
        const response = await vendorAPI.getById(id);
        console.log("API Response:", response);

        if (response && response.data) {
          const vendor = response.data;
          console.log("Vendor data:", vendor);

          // Transform backend data to match form structure
          setFormData({
            name: vendor.name || "",
            product_services: vendor.product_services || "",
            vendor_type_id:
              vendor.vendor_types?.map((vt) => ({
                value: vt.id,
                label: vt.name,
              })) || [],
            tax_payer_type_id: vendor.tax_payer_type_id || "",
            wht_id: vendor.wht_id || "",
            addresses: vendor.addresses?.map((addr) => addr.address) || [""],
            key_contact_person: vendor.key_contact_person || "",
            mobile_number: vendor.mobile_number || "",
            cnic_number: vendor.cnic_number || "",
            cnic_attachment: vendor.cnic_attachment || [],
            sales_tax_number: vendor.sales_tax_number || "",
            ntn: vendor.ntn || "",
            documents: vendor.documents || [],
            bank_accounts:
              vendor.bank_accounts?.length > 0
                ? vendor.bank_accounts.map((acc) => ({
                    bank_id: acc.bank_id || "",
                    bank_name: acc.bank_name || "",
                    account_number: acc.account_number || "",
                  }))
                : [{ bank_id: "", bank_name: "", account_number: "" }],
            other_contact_person: vendor.other_contact_person || "",
            other_contact_mobile: vendor.other_contact_mobile || "",
            remarks: vendor.remarks || "",
            status: vendor.status || 1,
          });

          // Validate existing data
          if (vendor.cnic_number)
            updateValidationErrors("cnic_number", vendor.cnic_number);
          if (vendor.sales_tax_number)
            updateValidationErrors("sales_tax_number", vendor.sales_tax_number);
          if (vendor.ntn) updateValidationErrors("ntn", vendor.ntn);
          if (vendor.mobile_number)
            updateValidationErrors("mobile_number", vendor.mobile_number);

          // Set existing files
          if (vendor.cnic_attachment && vendor.cnic_attachment.length > 0) {
            setAttachedFiles((prev) => ({
              ...prev,
              cnic: vendor.cnic_attachment.map((file) => ({
                name: typeof file === "string" ? file : file.name,
                url: typeof file === "string" ? file : file.url,
              })),
            }));
          }

          if (vendor.documents && vendor.documents.length > 0) {
            setAttachedFiles((prev) => ({
              ...prev,
              documents: vendor.documents.map((doc) => ({
                name: typeof doc === "string" ? doc : doc.name,
                url: typeof doc === "string" ? doc : doc.url,
              })),
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching vendor:", error);
        toast.error("Failed to fetch vendor details");
        navigate("/vendors");
      } finally {
        setFetching(false);
      }
    };

    fetchVendor();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCNICChange = (value) => {
    const formattedValue = formatCNIC(value);
    handleChange("cnic_number", formattedValue);
    updateValidationErrors("cnic_number", formattedValue);
  };

  const handleSalesTaxNumberChange = (value) => {
    const formattedValue = formatSalesTaxNumber(value);
    handleChange("sales_tax_number", formattedValue);
    updateValidationErrors("sales_tax_number", formattedValue);
  };

  const handleNTNChange = (value) => {
    const formattedValue = formatNTN(value);
    handleChange("ntn", formattedValue);
    updateValidationErrors("ntn", formattedValue);
  };

  const handleMobileNumberChange = (value) => {
    handleChange("mobile_number", value);
    updateValidationErrors("mobile_number", value);
  };

  const handleAddressChange = (index, value) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index] = value;
    handleChange("addresses", updatedAddresses);
  };

  const addAddress = () => {
    handleChange("addresses", [...formData.addresses, ""]);
  };

  const removeAddress = (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    handleChange("addresses", updatedAddresses);
  };

  // Updated bank account handlers
  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...formData.bank_accounts];

    if (field === "bank_id") {
      // When bank is selected, also update bank_name
      const selectedBank = bankOptions.find((bank) => bank.value === value);
      updatedAccounts[index] = {
        ...updatedAccounts[index],
        bank_id: value,
        bank_name: selectedBank ? selectedBank.label : "",
      };
    } else {
      updatedAccounts[index] = {
        ...updatedAccounts[index],
        [field]: value,
      };
    }

    handleChange("bank_accounts", updatedAccounts);
  };

  const addBankAccount = () => {
    handleChange("bank_accounts", [
      ...formData.bank_accounts,
      { bank_id: "", bank_name: "", account_number: "" },
    ]);
  };

  const removeBankAccount = (index) => {
    if (formData.bank_accounts.length > 1) {
      const updatedAccounts = formData.bank_accounts.filter(
        (_, i) => i !== index
      );
      handleChange("bank_accounts", updatedAccounts);
    }
  };

  const handleFileUpload = (type, files) => {
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      const isValid =
        file.type === "application/pdf" || file.type.startsWith("image/");
      if (!isValid) {
        toast.error(
          `Invalid file type: ${file.name}. Only PDF and images are allowed.`
        );
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...validFiles],
      }));

      const fileNames = validFiles.map((file) => file.name);
      if (type === "cnic") {
        handleChange("cnic_attachment", [
          ...formData.cnic_attachment,
          ...fileNames,
        ]);
      } else {
        handleChange("documents", [...formData.documents, ...fileNames]);
      }
    }
  };

  const removeFile = (type, index) => {
    setAttachedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

    if (type === "cnic") {
      const updatedFiles = formData.cnic_attachment.filter(
        (_, i) => i !== index
      );
      handleChange("cnic_attachment", updatedFiles);
    } else {
      const updatedFiles = formData.documents.filter((_, i) => i !== index);
      handleChange("documents", updatedFiles);
    }
  };

  const prepareFormData = () => {
    const data = { ...formData };

    // Keep as arrays, don't convert to JSON strings
    if (data.addresses && data.addresses.length > 0) {
      data.addresses = data.addresses
        .filter((addr) => addr.trim() !== "")
        .map((address, index) => ({
          id: index + 1,
          type: index === 0 ? "primary" : "secondary",
          address: address.trim(),
          is_default: index === 0,
        }));
    } else {
      data.addresses = [];
    }

    // Convert vendor_type_id array to comma-separated string
    if (data.vendor_type_id && Array.isArray(data.vendor_type_id)) {
      data.vendor_type_id = data.vendor_type_id
        .map((item) => item.value)
        .join(",");
    }

    // Prepare bank accounts data with bank_id
    if (data.bank_accounts && data.bank_accounts.length > 0) {
      data.bank_accounts = data.bank_accounts
        .filter((acc) => acc.bank_id && acc.account_number.trim() !== "")
        .map((account, index) => ({
          id: index + 1,
          bank_id: account.bank_id, // Save bank ID
          bank_name: account.bank_name.trim(),
          account_number: account.account_number.trim(),
          is_default: index === 0,
        }));
    } else {
      data.bank_accounts = [];
    }

    // Keep as arrays
    if (!data.cnic_attachment || !Array.isArray(data.cnic_attachment)) {
      data.cnic_attachment = [];
    }

    if (!data.documents || !Array.isArray(data.documents)) {
      data.documents = [];
    }

    console.log("Sending data:", data);
    return data;
  };

  const validateForm = () => {
    const errors = {
      cnic_number:
        formData.cnic_number !== "" && !validateCNIC(formData.cnic_number),
      sales_tax_number:
        formData.sales_tax_number !== "" &&
        !validateSalesTaxNumber(formData.sales_tax_number),
      ntn: formData.ntn !== "" && !validateNTN(formData.ntn),
      mobile_number: !validateMobileNumber(formData.mobile_number),
    };

    setValidationErrors(errors);

    return !Object.values(errors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    if (!formData.key_contact_person.trim()) {
      toast.error("Key contact person is required");
      return;
    }

    if (!formData.mobile_number.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    const validBankAccounts = formData.bank_accounts.filter(
      (acc) => acc.bank_id && acc.account_number.trim() !== ""
    );

    if (validBankAccounts.length === 0) {
      toast.error(
        "At least one valid bank account with account number is required"
      );
      return;
    }

    setLoading(true);
    try {
      const preparedData = prepareFormData();
      await vendorAPI.update(id, preparedData);
      toast.success("Vendor updated successfully");
      navigate("/vendors");
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast.error(error.response?.data?.message || "Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "2px 4px",
      minHeight: "40px",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e5e7eb",
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: "500",
    }),
  };

  // Helper function to get input border class based on validation
  const getInputBorderClass = (field) => {
    return validationErrors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
  };

  if (fetching || dropdownLoading) {
    return (
      <div className="flex h-full min-h-screen bg-white-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
            <div className="text-center">Loading vendor details...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/vendors")}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vendors
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Edit Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Vendor Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter vendor name"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="product_services"
                        className="flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        Products / Services
                      </Label>
                      <Input
                        id="product_services"
                        value={formData.product_services}
                        onChange={(e) =>
                          handleChange("product_services", e.target.value)
                        }
                        placeholder="Enter products or services provided"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Vendor Type
                      </Label>
                      <Select
                        isMulti
                        options={vendorTypes}
                        value={formData.vendor_type_id}
                        onChange={(selected) =>
                          handleChange("vendor_type_id", selected)
                        }
                        placeholder="Select vendor types..."
                        styles={customSelectStyles}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="key_contact_person"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Key Contact Person *
                      </Label>
                      <Input
                        id="key_contact_person"
                        value={formData.key_contact_person}
                        onChange={(e) =>
                          handleChange("key_contact_person", e.target.value)
                        }
                        placeholder="Enter key contact person name"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile_number"
                        className="flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Mobile Number *
                      </Label>
                      <div className="relative">
                        <Input
                          id="mobile_number"
                          value={formData.mobile_number}
                          onChange={(e) =>
                            handleMobileNumberChange(e.target.value)
                          }
                          placeholder="Enter mobile number"
                          required
                          className={getInputBorderClass("mobile_number")}
                        />
                        {validationErrors.mobile_number && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                        )}
                      </div>
                      {validationErrors.mobile_number && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Mobile number should be 10-15 digits
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="cnic_number"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        CNIC Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="cnic_number"
                          value={formData.cnic_number}
                          onChange={(e) => handleCNICChange(e.target.value)}
                          placeholder="31303-1961256-9"
                          maxLength={15}
                          className={getInputBorderClass("cnic_number")}
                        />
                        {validationErrors.cnic_number && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">
                          Format: XXXXX-XXXXXXX-X (13 digits)
                        </p>
                        {validationErrors.cnic_number && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Invalid CNIC format
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CNIC Attachments
                      </Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileUpload("cnic", e.target.files)
                        }
                        className="cursor-pointer border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {attachedFiles.cnic.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {attachedFiles.cnic.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm truncate">
                                {file.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile("cnic", index)}
                                className="h-6 w-6 p-0 hover:bg-red-100"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Other Contact Person */}
                <div className="space-y-2">
                  <Label
                    htmlFor="other_contact_person"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Other Contact Person
                  </Label>
                  <Input
                    id="other_contact_person"
                    value={formData.other_contact_person}
                    onChange={(e) =>
                      handleChange("other_contact_person", e.target.value)
                    }
                    placeholder="Enter other contact person name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Other Contact Mobile */}
                <div className="space-y-2">
                  <Label
                    htmlFor="other_contact_mobile"
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Other Contact Mobile
                  </Label>
                  <div className="relative">
                    <Input
                      id="other_contact_mobile"
                      value={formData.other_contact_mobile}
                      onChange={(e) =>
                        handleChange("other_contact_mobile", e.target.value)
                      }
                      placeholder="Enter other contact mobile number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Address Information
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAddress}
                      className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Add Address
                    </Button>
                  </div>

                  {formData.addresses.map((address, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          value={address}
                          onChange={(e) =>
                            handleAddressChange(index, e.target.value)
                          }
                          placeholder="Enter complete address"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {formData.addresses.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAddress(index)}
                          className="flex items-center gap-1 bg-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tax Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Tax Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="sales_tax_number"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Sales Tax Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="sales_tax_number"
                          value={formData.sales_tax_number}
                          onChange={(e) =>
                            handleSalesTaxNumberChange(e.target.value)
                          }
                          placeholder="00-00-0000-000-00"
                          maxLength={17}
                          className={getInputBorderClass("sales_tax_number")}
                        />
                        {validationErrors.sales_tax_number && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">
                          Format: XX-XX-XXXX-XXX-XX (13 digits)
                        </p>
                        {validationErrors.sales_tax_number && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Invalid format
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ntn" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        NTN
                      </Label>
                      <div className="relative">
                        <Input
                          id="ntn"
                          value={formData.ntn}
                          onChange={(e) => handleNTNChange(e.target.value)}
                          placeholder="0000000-0"
                          maxLength={9}
                          className={getInputBorderClass("ntn")}
                        />
                        {validationErrors.ntn && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">
                          Format: XXXXXXX-X (8 digits)
                        </p>
                        {validationErrors.ntn && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Invalid format
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Tax Payer Type
                      </Label>
                      <Select
                        options={taxPayerTypes}
                        value={taxPayerTypes.find(
                          (opt) => opt.value === formData.tax_payer_type_id
                        )}
                        onChange={(selected) =>
                          handleChange(
                            "tax_payer_type_id",
                            selected?.value || ""
                          )
                        }
                        placeholder="Select tax payer type"
                        styles={customSelectStyles}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Withholding Tax (WHT)
                      </Label>
                      <Select
                        options={whtOptions}
                        value={whtOptions.find(
                          (opt) => opt.value === formData.wht_id
                        )}
                        onChange={(selected) =>
                          handleChange("wht_id", selected?.value || "")
                        }
                        placeholder="Select WHT"
                        styles={customSelectStyles}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Account Information - UPDATED */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bank Account Information
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBankAccount}
                      className="flex items-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Add Account
                    </Button>
                  </div>

                  {formData.bank_accounts.map((account, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <Label>Bank *</Label>
                        <Select
                          options={bankOptions}
                          value={bankOptions.find(
                            (opt) => opt.value === account.bank_id
                          )}
                          onChange={(selected) =>
                            handleBankAccountChange(
                              index,
                              "bank_id",
                              selected?.value || ""
                            )
                          }
                          placeholder="Select bank"
                          styles={customSelectStyles}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number *</Label>
                        <Input
                          value={account.account_number}
                          onChange={(e) =>
                            handleBankAccountChange(
                              index,
                              "account_number",
                              e.target.value
                            )
                          }
                          placeholder="Enter account number"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bank Name (Auto-filled)</Label>
                        <Input
                          value={account.bank_name}
                          readOnly
                          placeholder="Auto-filled from selection"
                          className="bg-gray-50 border-gray-300"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.bank_accounts.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeBankAccount(index)}
                            className="flex items-center gap-1 bg-red-500 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Documents */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Additional Documents
                  </h3>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Supporting Documents
                    </Label>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload("documents", e.target.files)
                      }
                      className="cursor-pointer border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {attachedFiles.documents.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {attachedFiles.documents.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("documents", index)}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Additional Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange("remarks", e.target.value)}
                      placeholder="Enter any additional remarks"
                      rows={3}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      options={[
                        { value: 1, label: "Active" },
                        { value: 0, label: "Inactive" },
                      ]}
                      value={{
                        value: formData.status,
                        label: formData.status === 1 ? "Active" : "Inactive",
                      }}
                      onChange={(selected) =>
                        handleChange("status", selected?.value || 1)
                      }
                      styles={customSelectStyles}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/vendors")}
                    className="px-3 py-1 text-sm bg-gred-500 hover"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-primary-color hover:bg-primary-color/90 text-white"
                  >
                    <Save className="w-3 h-3" />
                    {loading ? "Updating..." : "Update"}
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

export default EditVendor;
