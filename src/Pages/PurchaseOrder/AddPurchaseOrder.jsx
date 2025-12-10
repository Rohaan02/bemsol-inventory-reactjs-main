import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { toast } from "react-toastify";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Import APIs
import vendorAPI from "../../lib/vendorApi";
import locationAPI from "../../lib/locationAPI";
import inventoryAPI from "../../lib/InventoryItemApi";
import purchaseOrderAPI from "../../lib/purchaseOrderApi";
// import unitApi from "../../lib/unitAPI";
import PendingDemandModal from "../Modals/PendingDemandModal";

import {
  ArrowLeft,
  Save,
  Building,
  MapPin,
  FileText,
  Calculator,
  Plus,
  Trash2,
  X,
  Upload,
  ShoppingCart,
  Tag,
  User,
  Phone,
  Calendar,
  FileDigit,
  Users,
} from "lucide-react";

const CreatePurchaseOrder = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [vendorAddresses, setVendorAddresses] = useState([]);
  const [vendorContactPersons, setVendorContactPersons] = useState([]);
  const [units, setUnits] = useState([]);
  const [showPendingDemandModal, setShowPendingDemandModal] = useState(false);
  const [showLoaded, setShowLoaded] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [loadedWeight, setLoadedWeight] = useState("");
  const [emptyWeight, setEmptyWeight] = useState("");

  const [isLoading, setIsLoading] = useState({
    vendors: false,
    locations: false,
    items: false,
  });
  const navigate = useNavigate();

  // Add this function to handle selected items from modal
  // Add this function to handle selected items from modal
  const handleAddDemandItems = (lineItems) => {
    console.log("Items from modal:", lineItems);

    // Extract all unique demand IDs
    const newDemandIds = [
      ...new Set(lineItems.map((item) => item.demand_id).filter(Boolean)),
    ];

    // Transform the line items to ensure they match the items dropdown structure
    const transformedItems = lineItems.map((demandItem) => {
      // Find the matching item from the items list to get proper label
      const matchingItem = items.find(
        (item) => item.value === demandItem.item_id?.toString()
      );

      return {
        ...demandItem,
        // Ensure the item_id matches the format expected by the dropdown
        item_id: demandItem.item_id?.toString() || "",
        // Use the matching item's label if found, otherwise use the demand item description
        item_description:
          matchingItem?.label || demandItem.item_description || "",
        // Auto-populate UOM from the matching item if available
        uom: matchingItem?.unit_name || demandItem.uom || "",
        // Ensure demand_id is properly set
        demand_id: demandItem.demand_id?.toString() || "",
      };
    });

    // Update form data with both line items and demand_ids
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, ...transformedItems],
      demand_ids: [...prev.demand_ids, ...newDemandIds],
    }));

    // Recalculate totals with the new items
    setTimeout(() => {
      calculateTotals([...formData.line_items, ...transformedItems]);
    }, 0);
  };

  // Updated Intco Terms dropdown options with INCOTERMS
  const intcoTerms = [
    { value: "EXW", label: "EXW - Ex Works" },
    { value: "FCA", label: "FCA - Free Carrier" },
    { value: "FAS", label: "FAS - Free Alongside Ship" },
    { value: "FOB", label: "FOB - Free On Board" },
    { value: "CFR", label: "CFR - Cost and Freight" },
    { value: "CIF", label: "CIF - Cost, Insurance and Freight" },
    { value: "CPT", label: "CPT - Carriage Paid To" },
    { value: "CIP", label: "CIP - Carriage and Insurance Paid To" },
    { value: "DPU", label: "DPU - Delivered at Place Unloaded" },
    { value: "DAP", label: "DAP - Delivered at Place" },
    { value: "DDP", label: "DDP - Delivered Duty Paid" },
  ];

  // Radio button groups for conditions
  const conditionGroups = [
    {
      id: "tax",
      label: "Tax",
      description: "Price is inclusive or Exclusive of all taxes",
      options: [
        { value: "inclusive", label: "Price is inclusive of all taxes" },
        { value: "exclusive", label: "Price is exclusive of all taxes" },
      ],
    },
    {
      id: "wht",
      label: "WHT",
      description: "WHT exemption certificate to be provided by vendor",
      options: [
        { value: "yes", label: "Yes - Certificate to be provided" },
        { value: "no", label: "No - Certificate not required" },
      ],
    },
    {
      id: "delivery_scope",
      label: "Delivery Scope",
      description: "Delivery is scope of vendor/customer",
      options: [
        { value: "vendor", label: "Delivery is scope of vendor" },
        { value: "customer", label: "Delivery is scope of customer" },
      ],
    },
    {
      id: "delivery_cost",
      label: "Delivery Cost",
      description: "Delivery is free/amount to be paid",
      options: [
        { value: "free", label: "Delivery is free" },
        { value: "paid", label: "Amount to be paid" },
      ],
    },
    {
      id: "delivery_damages",
      label: "Delivery Damages",
      description: "Vendor is responsible for damages in shipping",
      options: [
        { value: "yes", label: "Yes - Vendor is responsible" },
        { value: "no", label: "No - Vendor is not responsible" },
      ],
    },
  ];

  const [formData, setFormData] = useState({
    po_number: "PO-00005",
    vendor_id: "",
    vendor_address: "",
    location_id: "",
    delivery_date: "",
    contact_person_name: "",
    contact_person_mobile: "",
    ref_quotation_no: "",
    intco_term: "",
    label: "",
    specification: "",
    line_items: [
      {
        id: 1,
        item_id: "",
        item_description: "",
        uom: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ],
    terms_conditions: `<p><strong>Payment Terms:</strong></p>
    <p>1. Payment will be as per actual quanity received and accepted</p>
    <p><strong>Terms and Conditions:</strong></p>
    `,
    subtotal: 0,
    gst_rate: 18,
    gst_amount: 0,
    total_after_tax: 0,
    wht_rate: 5,
    wht_amount: 0,
    total_payable: 0,
    in_words: "Zero Rupees Only",
    load_weight: "",
    empty_weight: "",
    conditions: {
      tax: "",
      wht: "",
      delivery_scope: "",
      delivery_cost: "",
      delivery_damages: "",
    },
    demand_ids: [],
  });

  const [attachedFiles, setAttachedFiles] = useState([]);

  // Fetch next PO number
  const fetchNextPONumber = async () => {
    try {
      const result = await purchaseOrderAPI.getNextPONumber();
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          po_number: result.data.next_po_number,
        }));
      }
    } catch (error) {
      console.error("Error fetching next PO number:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchVendors();
    fetchLocations();
    fetchItems();
    fetchNextPONumber();
  }, []);

  const fetchVendors = async () => {
    setIsLoading((prev) => ({ ...prev, vendors: true }));
    try {
      const vendorsData = await vendorAPI.getAll();
      const vendorOptions = vendorsData.map((vendor) => ({
        value: vendor.id.toString(),
        label: `${vendor.vendor_code || "N/A"} - ${
          vendor.name || vendor.company_name || "Unknown Vendor"
        }`,
        addresses: vendor.addresses || [],
        other_contact_persons: vendor.other_contact_persons || [],
      }));

      console.log(
        "All vendors with addresses and contact persons:",
        vendorOptions
      );

      setVendors(vendorOptions);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setIsLoading((prev) => ({ ...prev, vendors: false }));
    }
  };

  const handleVendorChange = (selected) => {
    const vendorId = selected?.value || "";

    console.log("Selected Vendor:", selected);

    // Update vendor_id in form data
    handleChange("vendor_id", vendorId);

    // Clear previous address and contact person selections
    handleChange("vendor_address", "");
    handleChange("contact_person_name", "");
    handleChange("contact_person_mobile", "");

    if (selected) {
      // Handle addresses
      if (selected.addresses) {
        const addresses =
          typeof selected.addresses === "string"
            ? JSON.parse(selected.addresses)
            : selected.addresses;

        console.log("Selected Vendor Addresses:", addresses);

        const addressOptions = addresses.map((addr, index) => ({
          value: addr.address,
          label: addr.address,
          originalIndex: index,
        }));

        setVendorAddresses(addressOptions);
      } else {
        setVendorAddresses([]);
      }

      // Handle contact persons
      if (selected.other_contact_persons) {
        const contactPersons =
          typeof selected.other_contact_persons === "string"
            ? JSON.parse(selected.other_contact_persons)
            : selected.other_contact_persons;

        console.log("Selected Vendor Contact Persons:", contactPersons);

        const contactOptions = contactPersons.map((contact, index) => ({
          value: index.toString(),
          label: `${contact.name} - ${contact.mobile}`,
          name: contact.name,
          mobile: contact.mobile,
        }));

        setVendorContactPersons(contactOptions);

        // Auto-select the first contact person if available
        if (contactOptions.length > 0) {
          const firstContact = contactOptions[0];
          handleChange("contact_person_name", firstContact.name);
          handleChange("contact_person_mobile", firstContact.mobile);
        }
      } else {
        setVendorContactPersons([]);
      }
    } else {
      setVendorAddresses([]);
      setVendorContactPersons([]);
    }
  };

  const handleContactPersonChange = (selected) => {
    if (selected) {
      handleChange("contact_person_name", selected.name);
      handleChange("contact_person_mobile", selected.mobile);
    } else {
      handleChange("contact_person_name", "");
      handleChange("contact_person_mobile", "");
    }
  };

  const fetchLocations = async () => {
    setIsLoading((prev) => ({ ...prev, locations: true }));
    try {
      const locationsData = await locationAPI.getAll();
      const locationOptions = locationsData.map((location) => ({
        value: location.id.toString(),
        label: location.name || "Unknown Location",
        deliveryAddress: location.address || location.delivery_address || "",
        contactPerson: location.contact_person || "",
        contactMobile: location.contact_mobile || location.phone || "",
      }));
      setLocations(locationOptions);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading((prev) => ({ ...prev, locations: false }));
    }
  };

  const fetchItems = async () => {
    setIsLoading((prev) => ({ ...prev, items: true }));
    try {
      const itemsData = await inventoryAPI.getActiveItems();
      console.log("Items API Response:", itemsData);
      const itemOptions = itemsData.map((item) => ({
        value: item.id.toString(),
        label: `${item.item_code} - ${item.item_name}`,
        rate: item.unit_cost || item.price || 0,
        item_name: item.item_name,
        item_code: item.item_code,
        unit_name: item.unit?.name || "", // Get UOM from item data
      }));
      setItems(itemOptions);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsLoading((prev) => ({ ...prev, items: false }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConditionChange = (groupId, value) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [groupId]: value,
      },
    }));
  };

  // FIXED: Proper number handling in line item changes with auto UOM selection
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.line_items];

    if (field === "item_id") {
      const selectedItem = items.find((item) => item.value === value);
      if (selectedItem) {
        const quantity = parseFloat(updatedItems[index].quantity) || 0;
        const rate = parseFloat(selectedItem.rate) || 0;
        const amount = quantity * rate;

        updatedItems[index] = {
          ...updatedItems[index],
          item_id: value,
          item_description: selectedItem.item_name || "",
          uom: selectedItem.unit_name || "", // Auto-populate UOM from item data
          rate: rate,
          amount: parseFloat(amount.toFixed(2)),
        };
      }
    } else if (field === "quantity" || field === "rate") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].quantity) || 0;
      const rate =
        field === "rate"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].rate) || 0;
      const amount = quantity * rate;

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: parseFloat(value) || 0,
        amount: parseFloat(amount.toFixed(2)),
      };
    } else if (field === "demand_id") {
      // Handle demand_id updates and update the demand_ids array
      const oldDemandId = updatedItems[index].demand_id;
      const newDemandId = value;

      updatedItems[index] = {
        ...updatedItems[index],
        demand_id: value,
      };

      // Update the demand_ids array
      if (newDemandId && !formData.demand_ids.includes(newDemandId)) {
        setFormData((prev) => ({
          ...prev,
          demand_ids: [
            ...prev.demand_ids.filter((id) => id !== oldDemandId),
            newDemandId,
          ],
        }));
      } else if (!newDemandId && oldDemandId) {
        setFormData((prev) => ({
          ...prev,
          demand_ids: prev.demand_ids.filter((id) => id !== oldDemandId),
        }));
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      line_items: updatedItems,
    }));

    // Recalculate totals after a brief delay to ensure state is updated
    setTimeout(() => {
      calculateTotals(updatedItems);
    }, 0);
  };

  const addLineItem = () => {
    const newId =
      Math.max(...formData.line_items.map((item) => item.id), 0) + 1;
    const newItem = {
      id: newId,
      item_id: "",
      item_description: "",
      uom: "",
      quantity: 0,
      rate: 0,
      amount: 0,
    };

    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, newItem],
    }));
  };

  const removeLineItem = (index) => {
    if (formData.line_items.length > 1) {
      const updatedItems = formData.line_items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        line_items: updatedItems,
      }));
      calculateTotals(updatedItems);
    }
  };

  // FIXED: Proper financial calculations with number handling
  const calculateTotals = (lineItems = formData.line_items) => {
    console.log("Calculating totals for items:", lineItems);

    // Calculate subtotal from line items
    const subtotal = lineItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);

    const gst_rate = parseFloat(formData.gst_rate) || 0;
    const wht_rate = parseFloat(formData.wht_rate) || 0;

    const gst_amount = subtotal * (gst_rate / 100);
    const total_after_tax = subtotal + gst_amount;
    const wht_amount = total_after_tax * (wht_rate / 100);
    const total_payable = total_after_tax - wht_amount;

    const in_words = convertToWords(total_payable);

    console.log("Calculated amounts:", {
      subtotal,
      gst_amount,
      total_after_tax,
      wht_amount,
      total_payable,
    });

    setFormData((prev) => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst_amount: parseFloat(gst_amount.toFixed(2)),
      total_after_tax: parseFloat(total_after_tax.toFixed(2)),
      wht_amount: parseFloat(wht_amount.toFixed(2)),
      total_payable: parseFloat(total_payable.toFixed(2)),
      in_words: in_words,
    }));
  };

  const convertToWords = (amount) => {
    if (amount === 0) return "Zero Rupees Only";

    const rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);

    // Simple and reliable conversion
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    let words = `${formatNumber(rupees)} Rupees`;
    if (paisa > 0) {
      words += ` and ${paisa} Paisa`;
    }
    words += " Only";

    return words;
  };

  const handleGSTRateChange = (value) => {
    const gst_rate = parseFloat(value) || 0;
    const subtotal = parseFloat(formData.subtotal) || 0;
    const gst_amount = subtotal * (gst_rate / 100);
    const total_after_tax = subtotal + gst_amount;
    const wht_amount = total_after_tax * (formData.wht_rate / 100);
    const total_payable = total_after_tax - wht_amount;
    const in_words = convertToWords(total_payable);

    setFormData((prev) => ({
      ...prev,
      gst_rate: gst_rate,
      gst_amount: parseFloat(gst_amount.toFixed(2)),
      total_after_tax: parseFloat(total_after_tax.toFixed(2)),
      wht_amount: parseFloat(wht_amount.toFixed(2)),
      total_payable: parseFloat(total_payable.toFixed(2)),
      in_words: in_words,
    }));
  };

  const handleWHTRateChange = (value) => {
    const wht_rate = parseFloat(value) || 0;
    const subtotal = parseFloat(formData.subtotal) || 0;
    const gst_amount = subtotal * (formData.gst_rate / 100);
    const total_after_tax = subtotal + gst_amount;
    const wht_amount = total_after_tax * (wht_rate / 100);
    const total_payable = total_after_tax - wht_amount;
    const in_words = convertToWords(total_payable);

    setFormData((prev) => ({
      ...prev,
      wht_rate: wht_rate,
      gst_amount: parseFloat(gst_amount.toFixed(2)),
      total_after_tax: parseFloat(total_after_tax.toFixed(2)),
      wht_amount: parseFloat(wht_amount.toFixed(2)),
      total_payable: parseFloat(total_payable.toFixed(2)),
      in_words: in_words,
      // Auto-set WHT condition when amount is 0
      conditions: {
        ...prev.conditions,
        wht: wht_amount === 0 ? "yes" : prev.conditions.wht,
      },
    }));
  };

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      const isValid =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isValid) {
        toast.error(
          `Invalid file type: ${file.name}. Only PDF, images, and Word documents are allowed.`
        );
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    }
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewLocation = () => {
    if (!newLocationName.trim()) {
      toast.error("Please enter location name");
      return;
    }

    const newLocation = {
      value: (locations.length + 1).toString(),
      label: newLocationName.trim(),
      address: locationAddress.trim(),
    };

    setLocations((prev) => [...prev, newLocation]);
    setFormData((prev) => ({
      ...prev,
      location_id: newLocation.value,
    }));
    setNewLocationName("");
    setShowLocationModal(false);
    toast.success("Location added successfully");
  };

  const validateForm = () => {
    if (!formData.vendor_id) {
      toast.error("Please select a vendor");
      return false;
    }

    if (!formData.location_id) {
      toast.error("Please select a delivery location");
      return false;
    }

    if (!formData.delivery_date) {
      toast.error("Please select delivery date");
      return false;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.delivery_date < today) {
      toast.error("Delivery date cannot be in the past");
      return false;
    }

    const validLineItems = formData.line_items.filter(
      (item) => item.item_id && item.quantity > 0 && item.rate >= 0
    );

    if (validLineItems.length === 0) {
      toast.error("Please add at least one valid line item");
      return false;
    }

    for (let i = 0; i < formData.line_items.length; i++) {
      const item = formData.line_items[i];
      if (!item.item_id) {
        toast.error(`Please select an item for line ${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Please enter a valid quantity for line ${i + 1}`);
        return false;
      }
      if (!item.rate || item.rate < 0) {
        toast.error(`Please enter a valid rate for line ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  // FIXED: Proper FormData handling with number conversion
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // DEBUG: Log the form data before sending
      console.log("=== FORM DATA BEFORE SUBMISSION ===");
      console.log("Financial amounts:", {
        subtotal: formData.subtotal,
        gst_amount: formData.gst_amount,
        total_after_tax: formData.total_after_tax,
        wht_amount: formData.wht_amount,
        total_payable: formData.total_payable,
      });
      console.log("Conditions:", formData.conditions);
      console.log("Line items:", formData.line_items);

      const submitData = new FormData();

      // Add basic fields
      submitData.append("vendor_id", formData.vendor_id);
      submitData.append("location_id", formData.location_id);
      submitData.append("delivery_date", formData.delivery_date);
      submitData.append(
        "contact_person_name",
        formData.contact_person_name || ""
      );
      submitData.append(
        "contact_person_mobile",
        formData.contact_person_mobile || ""
      );
      submitData.append("ref_quotation_no", formData.ref_quotation_no || "");
      submitData.append("intco_term", formData.intco_term || "");
      submitData.append("label", formData.label || "");

      submitData.append("gst_rate", formData.gst_rate.toString());
      submitData.append("wht_rate", formData.wht_rate.toString());
      submitData.append("terms_conditions", formData.terms_conditions);
      submitData.append("load_weight", formData.load_weight.toString());
      submitData.append("empty_weight", formData.empty_weight.toString());
      Object.keys(formData.conditions).forEach((key) => {
        if (formData.conditions[key] !== null) {
          submitData.append(
            `conditions[${key}]`,
            formData.conditions[key].toString()
          );
        }
      });
      // Add demand IDs - this is crucial for updating demands
      formData.demand_ids.forEach((demandId, index) => {
        submitData.append(`demand_ids[${index}]`, demandId.toString());
      });
      // FIXED: Ensure numbers are sent as strings but properly formatted
      submitData.append("subtotal", formData.subtotal.toString());
      submitData.append("gst_amount", formData.gst_amount.toString());
      submitData.append("total_after_tax", formData.total_after_tax.toString());
      submitData.append("wht_amount", formData.wht_amount.toString());
      submitData.append("total_payable", formData.total_payable.toString());
      submitData.append("in_words", formData.in_words || "");

      // Add conditions
      Object.keys(formData.conditions).forEach((key) => {
        submitData.append(`conditions[${key}]`, formData.conditions[key]);
      });

      // Add line items with proper number formatting
      formData.line_items.forEach((item, index) => {
        submitData.append(`line_items[${index}][item_id]`, item.item_id);
        submitData.append(
          `line_items[${index}][item_description]`,
          item.item_description
        );
        submitData.append(`line_items[${index}][uom]`, item.uom);
        submitData.append(
          `line_items[${index}][quantity]`,
          item.quantity.toString()
        );
        submitData.append(`line_items[${index}][rate]`, item.rate.toString());
        submitData.append(
          `line_items[${index}][amount]`,
          item.amount.toString()
        );
        // Add demand ID if available
        if (item.demand_id) {
          submitData.append(
            `line_items[${index}][demand_id]`,
            item.demand_id.toString()
          );
        }
      });

      // Add attachments
      attachedFiles.forEach((file, index) => {
        submitData.append(`attachments[${index}]`, file);
      });

      // DEBUG: Log FormData entries
      console.log("=== FORM DATA ENTRIES ===");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const result = await purchaseOrderAPI.create(submitData);

      if (result.success) {
        toast.success("Purchase Order created successfully");
        setTimeout(() => {
          navigate("/purchase-orders");
        }, 1500);
      } else {
        toast.error(result.message || "Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key].join(", ")}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create purchase order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Improved custom select styles to prevent glitches
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "2px 4px",
      minHeight: "40px",
      backgroundColor: "white",
      fontSize: "14px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "14px",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    container: (base) => ({
      ...base,
      zIndex: (state) => (state.isFocused ? 9999 : 1),
    }),
  };

  // FIXED: Improved dropdown styles specifically for item selection
  const itemSelectStyles = {
    ...customSelectStyles,
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    container: (base) => ({ ...base, zIndex: "auto" }),
  };

  // Add this useEffect after your other useEffects
  useEffect(() => {
    // Auto-set WHT condition when WHT amount is 0
    if (formData.wht_amount === 0 && formData.conditions.wht !== "yes") {
      setFormData((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          wht: "yes",
        },
      }));
    }
  }, [formData.wht_amount, formData.conditions.wht]);

  const selectedLocation = locations.find(
    (loc) => loc.value === formData.location_id
  );

  // Find currently selected contact person for display
  const selectedContactPerson = vendorContactPersons.find(
    (contact) =>
      contact.name === formData.contact_person_name &&
      contact.mobile === formData.contact_person_mobile
  );

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/purchase-orders")}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Purchase Orders
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Purchase Order
            </h1>
          </div>

          <Card className="max-w-7xl mx-auto bg-white border-0 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Purchase Order Information
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Details
                  </h3>

                  <div className="grid grid-cols-12 gap-4">
                    {/* PO Number */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="po_number"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        PO Number
                      </Label>
                      <Input
                        id="po_number"
                        value={formData.po_number}
                        readOnly
                        className="bg-blue-50 border-blue-200 py-2 text-base font-bold text-blue-800 border rounded-md"
                      />
                    </div>
                    {/* Delivery Date */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="delivery_date"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Delivery Date *
                      </Label>
                      <Input
                        id="delivery_date"
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) =>
                          handleChange("delivery_date", e.target.value)
                        }
                        className="py-2 text-sm"
                        required
                      />
                    </div>
                    {/* Label */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="label"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Tag className="w-4 h-4 text-blue-600" />
                        Label
                      </Label>
                      <Select
                        options={[
                          { value: "urgent", label: "Urgent" },
                          { value: "standard", label: "Standard" },
                          { value: "low-priority", label: "Low Priority" },
                        ]}
                        value={
                          formData.label
                            ? { value: formData.label, label: formData.label }
                            : null
                        }
                        onChange={(selected) =>
                          handleChange("label", selected?.value || "")
                        }
                        placeholder="Please select"
                        styles={customSelectStyles}
                      />
                    </div>

                    {/* Delivery Address */}
                    <div className="col-span-6 space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Select Location *
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          options={locations}
                          value={locations.find(
                            (opt) => opt.value === formData.location_id
                          )}
                          onChange={(selected) =>
                            handleChange("location_id", selected?.value || "")
                          }
                          placeholder={
                            isLoading.locations
                              ? "Loading locations..."
                              : "Select delivery address..."
                          }
                          styles={customSelectStyles}
                          isSearchable
                          className="flex-1"
                          isLoading={isLoading.locations}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLocationModal(true)}
                          className="flex items-center gap-2 bg-primary-color hover:bg-primary-color-hover text-white px-3 py-2 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {selectedLocation && selectedLocation.deliveryAddress && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedLocation.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Vendor */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="vendor_id"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Building className="w-4 h-4 text-blue-600" />
                        Select Vendor *
                      </Label>
                      <Select
                        options={vendors}
                        value={vendors.find(
                          (opt) => opt.value === formData.vendor_id
                        )}
                        onChange={handleVendorChange}
                        placeholder={
                          isLoading.vendors
                            ? "Loading vendors..."
                            : "Select vendor..."
                        }
                        styles={customSelectStyles}
                        isSearchable
                        isLoading={isLoading.vendors}
                      />
                    </div>

                    {/* Address Selection - Only show when vendor is selected */}
                    {formData.vendor_id && (
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label
                          htmlFor="vendor_address"
                          className="flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                          <MapPin className="w-4 h-4 text-blue-600" />
                          Select Vendor Address
                        </Label>
                        <Select
                          options={vendorAddresses}
                          value={vendorAddresses.find(
                            (opt) => opt.value === formData.vendor_address
                          )}
                          onChange={(selected) =>
                            handleChange(
                              "vendor_address",
                              selected?.value || ""
                            )
                          }
                          placeholder={
                            vendorAddresses.length === 0
                              ? "No addresses available"
                              : "Select address..."
                          }
                          styles={customSelectStyles}
                          isSearchable
                          isDisabled={vendorAddresses.length === 0}
                        />
                        {vendorAddresses.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            No addresses found for this vendor
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contact Person Selection - Only show when vendor is selected */}
                    {formData.vendor_id && vendorContactPersons.length > 0 && (
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label
                          htmlFor="contact_person"
                          className="flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                          Select Contact Person
                        </Label>
                        <Select
                          options={vendorContactPersons}
                          value={selectedContactPerson}
                          onChange={handleContactPersonChange}
                          placeholder="Select contact person..."
                          styles={customSelectStyles}
                          isSearchable
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {vendorContactPersons.length} contact person(s)
                          available
                        </p>
                      </div>
                    )}

                    {/* Reference Quotation No */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="ref_quotation_no"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <FileDigit className="w-4 h-4 text-blue-600" />
                        Reference Quotation No
                      </Label>
                      <Input
                        id="ref_quotation_no"
                        value={formData.ref_quotation_no}
                        onChange={(e) =>
                          handleChange("ref_quotation_no", e.target.value)
                        }
                        placeholder="Enter quotation number"
                        className="py-2 text-sm"
                      />
                    </div>

                    {/* Intco Term */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                      <Label
                        htmlFor="inco_term"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Inco Term
                      </Label>
                      <Select
                        options={intcoTerms}
                        value={intcoTerms.find(
                          (opt) => opt.value === formData.intco_term
                        )}
                        onChange={(selected) =>
                          handleChange("intco_term", selected?.value || "")
                        }
                        placeholder="Select intco term..."
                        styles={customSelectStyles}
                        isSearchable
                      />
                    </div>

                    {/* Contact Person Name */}
                    <div className="col-span-12 md:col-span-6 space-y-2 hidden">
                      <Label
                        htmlFor="contact_person_name"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Contact Person Name
                      </Label>
                      <Input
                        id="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={(e) =>
                          handleChange("contact_person_name", e.target.value)
                        }
                        placeholder="Enter contact person name"
                        className="py-2 text-sm"
                      />
                    </div>

                    {/* Contact Person Mobile */}
                    <div className="col-span-12 md:col-span-6 space-y-2 hidden">
                      <Label
                        htmlFor="contact_person_mobile"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                        Contact Person Mobile
                      </Label>
                      <Input
                        id="contact_person_mobile"
                        value={formData.contact_person_mobile}
                        onChange={(e) =>
                          handleChange("contact_person_mobile", e.target.value)
                        }
                        placeholder="Enter mobile number"
                        className="py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Line Items
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLineItem}
                        className="flex items-center gap-2 bg-primary-color hover:bg-primary-color-hover text-white py-1 px-3 rounded text-sm font-semibold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Line Item
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPendingDemandModal(true)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm font-semibold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Pending Demand
                      </Button>
                    </div>
                  </div>
                  {/* Add the modal */}
                  <PendingDemandModal
                    isOpen={showPendingDemandModal}
                    onClose={() => setShowPendingDemandModal(false)}
                    onSelectItems={handleAddDemandItems}
                  />

                  <div className="relative border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="min-w-full text-sm md:text-base border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="w-10 px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            Sr
                          </th>
                          <th className="w-[35%] px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            Item Description
                          </th>
                          <th className="w-[18%] px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            Specification
                          </th>
                          <th className="w-[12%] px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            UOM
                          </th>
                          <th className="w-[10%] px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            Qty
                          </th>
                          <th className="w-[12%] px-2 py-2 text-left font-semibold text-gray-700 text-xs text-center">
                            Unit Cost
                          </th>
                          <th className="w-[13%] px-2 py-2 text-center font-semibold text-gray-700 text-xs">
                            Amount
                          </th>

                          <th className="w-[8%] px-2 py-2 text-left font-semibold text-gray-700 text-xs">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.line_items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-2 py-2 text-center">
                              {index + 1}
                            </td>

                            {/* Item Description - FIXED: Improved dropdown styling */}
                            <td className="px-2 py-2">
                              <Select
                                options={items}
                                value={items.find(
                                  (opt) => opt.value === item.item_id
                                )}
                                onChange={(selected) =>
                                  handleLineItemChange(
                                    index,
                                    "item_id",
                                    selected?.value || ""
                                  )
                                }
                                placeholder={
                                  isLoading.items
                                    ? "Loading..."
                                    : "Select item..."
                                }
                                styles={itemSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable
                                isLoading={isLoading.items}
                              />
                            </td>

                            {/* Specification */}
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={item.item_description || ""}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "item_description",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter specification"
                              />
                            </td>

                            {/* UOM - REMOVED: Unit dropdown selection, now auto-populated */}
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={item.uom || ""}
                                readOnly
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-100 text-gray-600"
                                placeholder="Auto from item"
                              />
                            </td>

                            {/* Quantity */}
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>

                            {/* Unit Cost */}
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "rate",
                                    e.target.value
                                  )
                                }
                                className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>

                            {/* Amount */}
                            <td className="px-2 py-2 text-center font-semibold text-gray-800 text-sm">
                              {Number(item.amount || 0).toLocaleString(
                                "en-PK",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="px-2 py-2 hidden">
                              <input
                                type="text"
                                value={item.demand_id}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "demand_id",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            {/* Action */}
                            <td className="px-2 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLineItem(index)}
                                className="h-7 w-7 p-0 hover:bg-red-50 text-red-600 rounded transition-colors inline-flex items-center justify-center"
                                disabled={formData.line_items.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Footer with totals */}
                      <tfoot className="bg-white border-t-2 border-gray-200 text-xs sm:text-sm md:text-base">
                        {/* Subtotal */}
                        <tr>
                          <td colSpan="5"></td>
                          <td className="text-right font-semibold text-gray-700">
                            Subtotal
                          </td>
                          <td className="text-right font-bold text-gray-900">
                            {formData.subtotal.toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        {/* GST */}
                        <tr>
                          <td colSpan="5"></td>
                          <td className="text-right font-semibold text-gray-700">
                            GST
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.gst_rate}
                                onChange={(e) =>
                                  handleGSTRateChange(e.target.value)
                                }
                                className="w-16 border border-gray-300 h-7 text-xs text-right rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-xs">%</span>
                              <span className="ml-2 text-right w-20 text-sm">
                                {formData.gst_amount.toLocaleString("en-PK", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Total After Tax */}
                        <tr>
                          <td colSpan="5"></td>
                          <td className="text-right font-semibold text-gray-700">
                            Total After Tax
                          </td>
                          <td className="text-right font-semibold text-gray-800">
                            {formData.total_after_tax.toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        {/* WHT */}
                        <tr>
                          <td colSpan="5"></td>
                          <td className="text-right font-semibold text-gray-700">
                            W.H.T
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.wht_rate}
                                onChange={(e) =>
                                  handleWHTRateChange(e.target.value)
                                }
                                className="w-16 border border-gray-300 h-7 text-xs text-right rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-xs">%</span>
                              <span className="ml-2 text-right w-20 text-sm">
                                {formData.wht_amount.toLocaleString("en-PK", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Total Payable */}
                        <tr className="bg-blue-50">
                          <td colSpan="5"></td>
                          <td className="text-right font-bold text-gray-900">
                            Total Payable
                          </td>
                          <td className="text-right font-bold text-blue-700">
                            {formData.total_payable.toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Documents and Terms */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Documents Section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Documents
                      </h3>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 transition-colors hover:border-blue-400">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                          <Upload className="w-12 h-12 text-gray-400" />
                          <span className="text-sm text-gray-600 font-medium">
                            Drag and drop files to upload
                          </span>
                          <span className="text-xs text-gray-500">
                            Supports PDF, Images, Word documents
                          </span>
                        </label>
                      </div>

                      {attachedFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700 text-sm">
                            Attached Files:
                          </h4>
                          {attachedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700 font-medium text-sm">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 p-0 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Conditions Section with Radio Groups */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Conditions
                      </h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {conditionGroups.map((group) => (
                            <div
                              key={group.id}
                              className="border border-gray-200 rounded-lg p-4 bg-white"
                            >
                              <div className="mb-3">
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {group.label}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {group.description}
                                </p>
                              </div>
                              <div className="space-y-2">
                                {group.options.map((option) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="radio"
                                      id={`${group.id}_${option.value}`}
                                      name={group.id}
                                      value={option.value}
                                      checked={
                                        formData.conditions[group.id] ===
                                        option.value
                                      }
                                      onChange={(e) =>
                                        handleConditionChange(
                                          group.id,
                                          e.target.value
                                        )
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <Label
                                      htmlFor={`${group.id}_${option.value}`}
                                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                                    >
                                      {option.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* vehicle load */}
                    <div className="space-y-3">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Vehicle Weight Required
                        </h3>

                        <div className="grid grid-cols-12 gap-4">
                          {/* Loaded Weight Checkbox */}
                          <div className="col-span-12 md:col-span-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <input
                                type="checkbox"
                                checked={showLoaded}
                                onChange={() => setShowLoaded(!showLoaded)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              Loaded Weight
                            </label>
                          </div>

                          {/* Empty Weight Checkbox */}
                          <div className="col-span-12 md:col-span-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <input
                                type="checkbox"
                                checked={showEmpty}
                                onChange={() => setShowEmpty(!showEmpty)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                              Empty Weight
                            </label>
                          </div>

                          {/* Loaded Weight Input */}
                          {showLoaded && (
                            <div className="col-span-12 md:col-span-6 space-y-2">
                              <Label
                                htmlFor="loaded_weight"
                                className="text-sm font-medium text-gray-700"
                              >
                                Loaded Weight
                              </Label>
                              <Input
                                id="load_weight"
                                type="number"
                                value={formData.load_weight}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    load_weight: e.target.value,
                                  })
                                }
                                placeholder="Enter loaded weight"
                                className="border-gray-300 rounded-md py-2 px-2 text-base"
                              />
                            </div>
                          )}

                          {/* Empty Weight Input */}
                          {showEmpty && (
                            <div className="col-span-12 md:col-span-6 space-y-2">
                              <Label
                                htmlFor="empty_weight"
                                className="text-sm font-medium text-gray-700"
                              >
                                Empty Weight
                              </Label>
                              <Input
                                id="empty_weight"
                                type="number"
                                value={formData.empty_weight}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    empty_weight: e.target.value,
                                  })
                                }
                                placeholder="Enter empty weight"
                                className="border-gray-300 rounded-md py-2 px-2 text-base"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Terms & Conditions Section with CKEditor */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Terms & Conditions
                      </h3>

                      <div className="border border-gray-300 rounded-lg">
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.terms_conditions}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            handleChange("terms_conditions", data);
                          }}
                          config={{
                            toolbar: [
                              "heading",
                              "|",
                              "bold",
                              "italic",
                              "bulletedList",
                              "numberedList",
                              "|",
                              "undo",
                              "redo",
                            ],
                            height: "200px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/purchase-orders")}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 text-sm font-semibold rounded-lg transition-colors shadow"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    className="bg-primary-color text-white px-5 py-2 text-sm font-semibold rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create Order"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Add Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add New Location
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLocationModal(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="location_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Location Name *
                    </Label>
                    <Input
                      id="location_name"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Enter location name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="location_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Add Address *
                    </Label>
                    <Input
                      id="location_name"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Enter location Address"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setShowLocationModal(false)}
                      className="px-4 py-2 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="success"
                      onClick={addNewLocation}
                      className="bg-blue-600 bg-primary-color px-4 py-2 text-sm"
                    >
                      Add Location
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;
