import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tab } from "@headlessui/react";
import assetAPI from "@/lib/assetAPI"; // Adjust the import path
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axiosConfig"; // Add this import

import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  Plus,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Building,
  Package,
  Tag,
  Cpu,
  DollarSign,
  Scale,
  Box,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import inventoryItemAPI from "../../lib/InventoryItemApi";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    // Return formatted date for older comments
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    return "Recently";
  }
};

const ViewAsset = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [asset, setAsset] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("comments");
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Compatible Parts State
  const [compatibleParts, setCompatibleParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState("placeholder");
  const [selectedParts, setSelectedParts] = useState([]);

  // Accessories State
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessory, setSelectedAccessory] = useState("placeholder");
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);

  const documentsData = [
    {
      id: 1,
      name: "user_manual.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Jan 15, 2024",
    },
  ];

  // Fetch compatible parts
  useEffect(() => {
    api
      .get("/compatibility-parts")
      .then((response) => {
        // The response has a data property containing the array
        const parts = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data || [];
        setCompatibleParts(parts);
      })
      .catch((error) => {
        console.error("Error fetching compatible parts:", error);
        setCompatibleParts([]);
      });
  }, []);

  // Fetch accessories
  const fetchAccessories = async () => {
    setLoadingAccessories(true);
    try {
      const response = await api.get("/accessories");

      let accessoriesData = [];
      if (Array.isArray(response.data)) {
        accessoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        accessoriesData = response.data.data;
      } else if (Array.isArray(response.data?.accessories)) {
        accessoriesData = response.data.accessories;
      }

      setAccessories(accessoriesData);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      toast.error("Failed to fetch accessories");
      setAccessories([]);
    } finally {
      setLoadingAccessories(false);
    }
  };

  // Fetch accessories when Accessories tab is active
  useEffect(() => {
    if (activeTab === 1) {
      fetchAccessories();
    }
  }, [activeTab]);

  // Fetch asset details
  const fetchAsset = async () => {
    setLoading(true);
    try {
      const response = await assetAPI.getById(id);
      const assetData = response.data ?? response;
      console.log("assetData", assetData);
      setAsset(assetData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch asset details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments function
  const getCommentsData = async () => {
    setLoadingComments(true);
    try {
      console.log("Fetching comments for asset ID:", id);
      // You'll need to implement this API call in your assetAPI
      const response = await inventoryItemAPI.getComments(id);
      console.log("Full API response:", response);

      let commentsData = [];

      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response && Array.isArray(response.comments)) {
        commentsData = response.comments;
      } else if (response && response.data && response.data.comments) {
        commentsData = response.data.comments;
      }

      console.log("Extracted comments data:", commentsData);

      const sortedComments = [...commentsData].sort((a, b) => {
        return (
          new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
        );
      });

      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to fetch comments");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchAsset();
    getCommentsData();
  }, [id]);

  // Refresh comments when sidebar opens to comments section
  useEffect(() => {
    if (sidebarOpen && activeSection === "comments") {
      getCommentsData();
    }
  }, [sidebarOpen, activeSection]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      await inventoryItemAPI.remove(id);
      toast.success("Asset deleted successfully");
      navigate("/assets"); // Redirect to assets list
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    }
  };

  const handleEdit = () => {
    navigate(`/assets/edit/${id}`);
  };

  const handleArchive = async () => {
    if (!window.confirm("Are you sure you want to archive this asset?")) return;

    try {
      await inventoryItemAPI.archive(id);
      toast.success("Asset archived successfully");
      fetchAsset(); // Refresh asset data
    } catch (error) {
      console.error("Error archiving asset:", error);
      toast.error("Failed to archive asset");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setAddingComment(true);
    try {
      await inventoryItemAPI.addComment(id, {
        comment: newComment,
        user_id: 1, // Replace with actual user ID from auth context
      });

      setNewComment("");
      toast.success("Comment added successfully");

      // Refresh comments after adding new one
      getCommentsData();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      toast.success(`${type} uploaded successfully`);
      event.target.value = "";
    }
  };

  // Save accessories function
  const saveAccessories = async () => {
    if (selectedAccessories.length === 0) {
      toast.warning("Please select at least one accessory");
      return;
    }

    try {
      await api.post(`/assets/${id}/accessories`, {
        accessories: selectedAccessories.map((id) => parseInt(id)),
      });

      toast.success("Accessories saved successfully");
    } catch (error) {
      console.error("Error saving accessories:", error);
      toast.error("Failed to save accessories");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen text-black">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg font-medium">Loading asset details...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen text-black">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
        <p className="text-gray-600 mb-6">
          The requested asset could not be found.
        </p>
        <Button
          onClick={() => navigate("/assets")}
          className="bg-green-600 hover:bg-green-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1 overflow-hidden !overflow-y-hidden">
        {/* Full Width Asset Info Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Link
                to="/assets"
                className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="font-semibold">Assets</span>
              </Link>
            </div>
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-gray-300 rounded-lg w-20 h-20 flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden overflow-y-hidden">
                  {asset.image_url ? (
                    <img
                      src={asset.image_url}
                      alt={asset.item_code}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${asset.item_code}&background=random`;
                        e.target.className = "w-full h-full object-contain p-2";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-400 to-gray-600">
                      <Tag size={32} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {asset.item_code}
                        </h2>
                        <Badge
                          variant={asset.is_active ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {asset.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {asset.is_serialized && (
                          <Badge
                            variant="outline"
                            className="border-blue-300 text-blue-700"
                          >
                            <Tag size={12} className="mr-1" />
                            Serialized
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-xl font-semibold text-gray-800 mt-1">
                        {asset.item_name}
                      </h1>
                      <p className="text-gray-600 text-sm mt-1">
                        {asset.model_no}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {asset.unit_cost
                          ? `$${parseFloat(asset.unit_cost).toLocaleString()}`
                          : "—"}
                      </div>
                      <p className="text-sm text-gray-500">Unit Cost</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Building size={14} />
                        Vendor
                      </span>
                      <span className="font-medium">
                        {asset.vendor?.name || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Package size={14} />
                        Category
                      </span>
                      <span>
                        {asset.category?.category_name ||
                          asset.category_id ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Box size={14} />
                        Unit
                      </span>
                      <span>{asset.unit?.name || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Cpu size={14} />
                        Type
                      </span>
                      <span className="capitalize">
                        {asset.asset_type || asset.type || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleEdit}
                      className="flex items-center gap-2 text-black cursor-pointer"
                    >
                      <Edit size={16} />
                      Edit Asset
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleArchive}
                      className="flex items-center gap-2 text-yellow-600 cursor-pointer"
                    >
                      <Archive size={16} />
                      {asset.is_active ? "Archive Asset" : "Unarchive Asset"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="flex items-center gap-2 text-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Delete Asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-black bg-white hover:bg-gray-100 px-3 py-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section with Sidebar */}
        <div className="flex-1 flex overflow-hidden bg-white-50">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-hidden p-4 md:p-6">
            {/* Tabs Section */}
            <Tab.Group
              selectedIndex={activeTab}
              onChange={setActiveTab}
              className="bg-white-50"
            >
              <Tab.List className="flex space-x-2 border-b border-gray-300 mb-4">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      "px-4 py-2 font-medium text-sm rounded-t-lg",
                      selected
                        ? "bg-white border-t border-l border-r border-gray-300 text-green-600"
                        : "text-black hover:text-green-700"
                    )
                  }
                >
                  Overview
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      "px-4 py-2 font-medium text-sm rounded-t-lg",
                      selected
                        ? "bg-white border-t border-l border-r border-gray-300 text-green-600"
                        : "text-black hover:text-green-700"
                    )
                  }
                >
                  Accessories
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      "px-4 py-2 font-medium text-sm rounded-t-lg",
                      selected
                        ? "bg-white border-t border-l border-r border-gray-300 text-green-600"
                        : "text-black hover:text-green-700"
                    )
                  }
                >
                  Compatible Parts
                </Tab>
              </Tab.List>

              <Tab.Panels className="h-full overflow-y-auto">
                <Tab.Panel className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Main Content */}
                    <div
                      className={`${
                        sidebarOpen ? "lg:col-span-8" : "lg:col-span-6"
                      } space-y-6`}
                    >
                      <Card className="bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-green-600 flex items-center gap-2">
                            <FileText size={20} />
                            Asset Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-black">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  <div className="flex items-center gap-1">
                                    <Tag size={14} />
                                    Asset Code
                                  </div>
                                </label>
                                <p className="text-gray-900 font-medium">
                                  {asset.item_code}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Specification
                                </label>
                                <p className="text-gray-900">
                                  {asset.specification || "—"}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  <div className="flex items-center gap-1">
                                    <Building size={14} />
                                    Manufacturer
                                  </div>
                                </label>
                                <p className="text-gray-900">
                                  {asset.manufacturer_name || "—"}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Model Number
                                </label>
                                <p className="text-gray-900">
                                  {asset.model_no || "—"}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Asset Tag
                                </label>
                                <p className="text-gray-900">
                                  {asset.asset_tag || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  <div className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    Financial Details
                                  </div>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Unit Cost
                                    </p>
                                    <p className="font-medium">
                                      {asset.unit_cost
                                        ? `$${asset.unit_cost}`
                                        : "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Currency
                                    </p>
                                    <p className="font-medium">
                                      {asset.currency || "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  <div className="flex items-center gap-1">
                                    <Scale size={14} />
                                    Physical Details
                                  </div>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Weight
                                    </p>
                                    <p className="font-medium">
                                      {asset.weight
                                        ? `${asset.weight} ${asset.weight_unit}`
                                        : "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Dimensions
                                    </p>
                                    <p className="font-medium">
                                      {asset.dimensions || "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Serialization
                                </label>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      asset.is_serialized
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span>
                                    {asset.is_serialized
                                      ? "Serialized Asset"
                                      : "Non-serialized"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Maintenance
                                </label>
                                <Badge
                                  variant={
                                    asset.maintenance === "yes"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {asset.maintenance === "yes"
                                    ? "Requires Maintenance"
                                    : "No Maintenance"}
                                </Badge>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Returnable
                                </label>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      asset.is_returnable
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span>
                                    {asset.is_returnable
                                      ? "Returnable"
                                      : "Non-returnable"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {asset.description && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Description
                              </label>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {asset.description}
                              </p>
                            </div>
                          )}

                          {asset.remarks && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Remarks
                              </label>
                              <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                {asset.remarks}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Location Card moves here when sidebar is open */}
                      {sidebarOpen && activeTab === 0 && (
                        <Card className="bg-white shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Asset Comments
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-black">
                            {loadingComments ? (
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                                <span>Loading comments...</span>
                              </div>
                            ) : comments.length > 0 ? (
                              comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex justify-between items-start border-b py-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={`https://i.pravatar.cc/150?img=${
                                        comment.user?.id || 1
                                      }`}
                                      alt={comment.user?.name || "User"}
                                      className="w-10 h-10 rounded-full"
                                      onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${
                                          comment.user?.name || "User"
                                        }&background=random`;
                                      }}
                                    />
                                    <div>
                                      <p className="font-semibold">
                                        {comment.user?.name || "Unknown User"}
                                      </p>
                                      <p className="text-gray-700 mt-1">
                                        {comment.comment || comment.text}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-gray-500 text-sm whitespace-nowrap">
                                    {formatDate(
                                      comment.created_at || comment.date
                                    )}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                No comments yet. Be the first to comment!
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column - Additional Info when sidebar closed */}
                    {!sidebarOpen && activeTab === 0 && (
                      <div className="lg:col-span-6 space-y-6">
                        <Card className="bg-white shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Asset Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Status</span>
                                <Badge
                                  variant={
                                    asset.status === 1 ? "success" : "secondary"
                                  }
                                >
                                  {asset.status === 1 ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  Maintenance Required
                                </span>
                                <Badge
                                  variant={
                                    asset.maintenance === "yes"
                                      ? "warning"
                                      : "outline"
                                  }
                                >
                                  {asset.maintenance === "yes" ? "Yes" : "No"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  Total Quantity
                                </span>
                                <span className="font-bold text-lg">
                                  {asset.total_quantity || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  Reorder Level
                                </span>
                                <span className="font-medium">
                                  {asset.reorder_level || "Not set"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* <Card className="bg-white shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Category Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {asset.category ? (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Category Name
                                  </span>
                                  <span className="font-medium">
                                    {asset.category.category_name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Category Code
                                  </span>
                                  <span className="font-mono">
                                    {asset.category.code}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">
                                No category information
                              </p>
                            )}
                          </CardContent>
                        </Card> */}

                        <Card className="bg-white shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Asset Comments
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-black">
                            {loadingComments ? (
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                                <span>Loading comments...</span>
                              </div>
                            ) : comments.length > 0 ? (
                              <div className="space-y-3">
                                {comments.slice(0, 3).map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="border-b pb-3 last:border-b-0"
                                  >
                                    <div className="flex items-start gap-2">
                                      <img
                                        src={`https://i.pravatar.cc/150?img=${
                                          comment.user?.id || 1
                                        }`}
                                        alt={comment.user?.name || "User"}
                                        className="w-8 h-8 rounded-full mt-1"
                                      />
                                      <div className="flex-1">
                                        <div className="flex justify-between">
                                          <span className="font-semibold text-sm">
                                            {comment.user?.name ||
                                              "Unknown User"}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(
                                              comment.created_at || comment.date
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 text-sm mt-1">
                                          {comment.comment || comment.text}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {comments.length > 3 && (
                                  <Button
                                    variant="link"
                                    className="text-green-600 p-0 h-auto"
                                    onClick={() => setSidebarOpen(true)}
                                  >
                                    View all {comments.length} comments
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                No comments yet.
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Active Section Content when sidebar is open and on overview tab */}
                    {sidebarOpen && activeTab === 0 && (
                      <div className="lg:col-span-4 space-y-6">
                        {/* Comments Section */}
                        {activeSection === "comments" && (
                          <Card className="bg-white shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-green-600 flex items-center gap-2">
                                <MessageSquare size={20} />
                                Comments
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {loadingComments ? (
                                <div className="flex justify-center items-center py-8">
                                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                                </div>
                              ) : (
                                <>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {comments.length === 0 ? (
                                      <div className="text-center py-4 text-gray-500">
                                        No comments yet. Be the first to
                                        comment!
                                      </div>
                                    ) : (
                                      comments.map((comment) => (
                                        <div
                                          key={comment.id}
                                          className="border-b border-gray-100 pb-3 last:border-b-0"
                                        >
                                          <div className="flex items-start gap-2 mb-1">
                                            <img
                                              src={`https://i.pravatar.cc/150?img=${
                                                comment.user?.id || 1
                                              }`}
                                              alt={comment.user?.name || "User"}
                                              className="w-8 h-8 rounded-full mt-1"
                                              onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${
                                                  comment.user?.name || "User"
                                                }&background=random`;
                                              }}
                                            />
                                            <div className="flex-1">
                                              <div className="flex justify-between items-start">
                                                <span className="font-semibold text-gray-900">
                                                  {comment.user?.name ||
                                                    "Unknown User"}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {formatDate(
                                                    comment.created_at ||
                                                      comment.date
                                                  )}
                                                </span>
                                              </div>
                                              <p className="text-gray-700 text-sm mt-1">
                                                {comment.comment ||
                                                  comment.text}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="Add a comment about this asset..."
                                      value={newComment}
                                      onChange={(e) =>
                                        setNewComment(e.target.value)
                                      }
                                      className="min-h-[80px] resize-none"
                                      disabled={addingComment}
                                    />
                                    <Button
                                      onClick={handleAddComment}
                                      disabled={
                                        !newComment.trim() || addingComment
                                      }
                                      className="w-full bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      {addingComment ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Posting...
                                        </>
                                      ) : (
                                        <>
                                          <Send size={16} className="mr-2" />
                                          Post Comment
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Documents Section */}
                        {activeSection === "documents" && (
                          <Card className="bg-white shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-green-600 flex items-center gap-2">
                                <FileText size={20} />
                                Documents
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                {documentsData.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center gap-3 p-2 border border-gray-200 rounded"
                                  >
                                    <FileText
                                      size={20}
                                      className="text-blue-600"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {doc.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {doc.type} • {doc.size}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <FileText
                                  size={24}
                                  className="mx-auto text-gray-400 mb-2"
                                />
                                <p className="text-sm text-gray-500 mb-2">
                                  Drop files here or click to upload
                                </p>
                                <Input
                                  type="file"
                                  onChange={(e) =>
                                    handleFileUpload(e, "document")
                                  }
                                  className="hidden"
                                  id="document-upload"
                                />
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("document-upload")
                                      .click()
                                  }
                                >
                                  Choose Files
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Images Section */}
                        {activeSection === "images" && (
                          <Card className="bg-white shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-green-600 flex items-center gap-2">
                                <ImageIcon size={20} />
                                Images
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8">
                                {asset.image_url ? (
                                  <>
                                    <div className="mb-4">
                                      <img
                                        src={asset.image_url}
                                        alt={asset.item_name}
                                        className="mx-auto max-h-48 rounded-lg shadow"
                                      />
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                      Current asset image
                                    </p>
                                  </>
                                ) : (
                                  <ImageIcon
                                    size={48}
                                    className="mx-auto text-gray-400 mb-4"
                                  />
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 mb-2">
                                    {asset.image_url
                                      ? "Replace image"
                                      : "Add asset image"}
                                  </p>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFileUpload(e, "image")
                                    }
                                    className="hidden"
                                    id="image-upload"
                                  />
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                      document
                                        .getElementById("image-upload")
                                        .click()
                                    }
                                  >
                                    {asset.image_url
                                      ? "Replace Image"
                                      : "Upload Image"}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  {/* ACCESSORIES TAB */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        Accessories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {loadingAccessories ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-green-600 mr-2" />
                          <span>Loading accessories...</span>
                        </div>
                      ) : (
                        <>
                          {/* Current Accessories Table */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Current Accessories
                            </h3>
                            {asset.accessories &&
                            asset.accessories.length > 0 ? (
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">#</TableHead>
                                      <TableHead>Accessory Name</TableHead>
                                      <TableHead>ID</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {asset.accessories.map(
                                      (accessory, index) => (
                                        <TableRow key={accessory.id}>
                                          <TableCell>{index + 1}</TableCell>
                                          <TableCell className="font-medium">
                                            {accessory.name ||
                                              accessory.item_name ||
                                              `Accessory ${accessory.id}`}
                                          </TableCell>
                                          <TableCell className="text-gray-500">
                                            {accessory.id}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500 border rounded-lg">
                                <Package
                                  size={48}
                                  className="mx-auto text-gray-400 mb-4"
                                />
                                <p>No accessories assigned to this asset.</p>
                              </div>
                            )}
                          </div>

                          {/* Add New Accessories Section */}
                          <div className="pt-6 border-t">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Add New Accessories
                            </h3>
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Select Accessories
                                </label>
                                <Select
                                  value={selectedAccessory}
                                  onValueChange={(value) => {
                                    if (value && value !== "placeholder") {
                                      if (
                                        !selectedAccessories.includes(value)
                                      ) {
                                        setSelectedAccessories([
                                          ...selectedAccessories,
                                          value,
                                        ]);
                                      }
                                      setSelectedAccessory("placeholder");
                                    }
                                  }}
                                  className="w-full"
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an accessory..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="placeholder" disabled>
                                      Select an accessory...
                                    </SelectItem>
                                    {accessories
                                      .filter(
                                        (accessory) =>
                                          !selectedAccessories.includes(
                                            accessory.id.toString()
                                          ) &&
                                          !asset.accessories?.some(
                                            (a) => a.id === accessory.id
                                          )
                                      )
                                      .map((accessory) => (
                                        <SelectItem
                                          key={accessory.id}
                                          value={accessory.id.toString()}
                                        >
                                          {accessory.name ||
                                            accessory.item_name ||
                                            `Accessory ${accessory.id}`}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Selected accessories to add table */}
                            {selectedAccessories.length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Accessories to Add
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-12">
                                          #
                                        </TableHead>
                                        <TableHead>Accessory Name</TableHead>
                                        <TableHead>Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedAccessories.map(
                                        (accessoryId, index) => {
                                          const accessory = accessories.find(
                                            (a) =>
                                              a.id.toString() === accessoryId
                                          );
                                          return (
                                            <TableRow key={accessoryId}>
                                              <TableCell>{index + 1}</TableCell>
                                              <TableCell className="font-medium">
                                                {accessory
                                                  ? accessory.name ||
                                                    accessory.item_name ||
                                                    `Accessory ${accessory.id}`
                                                  : "Unknown Accessory"}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setSelectedAccessories(
                                                      selectedAccessories.filter(
                                                        (id) =>
                                                          id !== accessoryId
                                                      )
                                                    );
                                                  }}
                                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                >
                                                  Remove
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex justify-end gap-2 pt-6 border-t">
                              <Button
                                variant="outline"
                                className="bg-white hover:bg-slate-200"
                                onClick={() => {
                                  if (selectedAccessories.length > 0) {
                                    setSelectedAccessories([]);
                                    toast.info(
                                      "All pending accessories cleared"
                                    );
                                  }
                                }}
                                disabled={selectedAccessories.length === 0}
                              >
                                Clear Pending
                              </Button>
                              <Button
                                className="bg-green-900 text-white hover:bg-green-700"
                                onClick={saveAccessories}
                                disabled={selectedAccessories.length === 0}
                              >
                                Add Accessories
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Tab.Panel>
                <Tab.Panel>
                  {/* COMPATIBLE PARTS TAB */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        Compatible Parts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Compatible Parts Table */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Current Compatible Parts
                        </h3>
                        {asset.compatibility_parts &&
                        asset.compatibility_parts.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">#</TableHead>
                                  <TableHead>Part Name</TableHead>
                                  <TableHead>ID</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {asset.compatibility_parts.map(
                                  (part, index) => (
                                    <TableRow key={part.id}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell className="font-medium">
                                        {part.name || `Part ${part.id}`}
                                      </TableCell>
                                      <TableCell className="text-gray-500">
                                        {part.id}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 border rounded-lg">
                            <Cpu
                              size={48}
                              className="mx-auto text-gray-400 mb-4"
                            />
                            <p>No compatible parts assigned to this asset.</p>
                          </div>
                        )}
                      </div>

                      {/* Add New Compatible Parts Section */}
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Add New Compatible Parts
                        </h3>
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Select Compatible Parts
                            </label>
                            <Select
                              value={selectedPart}
                              onValueChange={(value) => {
                                if (value && value !== "placeholder") {
                                  if (!selectedParts.includes(value)) {
                                    setSelectedParts([...selectedParts, value]);
                                  }
                                  setSelectedPart("placeholder");
                                }
                              }}
                              className="w-full"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a compatible part..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placeholder" disabled>
                                  Select a part...
                                </SelectItem>
                                {compatibleParts
                                  .filter(
                                    (part) =>
                                      !selectedParts.includes(
                                        part.id.toString()
                                      ) &&
                                      !asset.compatibility_parts?.some(
                                        (p) => p.id === part.id
                                      )
                                  )
                                  .map((part) => (
                                    <SelectItem
                                      key={part.id}
                                      value={part.id.toString()}
                                    >
                                      {part.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Selected parts to add table */}
                        {selectedParts.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Parts to Add
                            </h4>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Part Name</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedParts.map((partId, index) => {
                                    const part = compatibleParts.find(
                                      (p) => p.id.toString() === partId
                                    );
                                    return (
                                      <TableRow key={partId}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                          {part ? part.name : "Unknown Part"}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedParts(
                                                selectedParts.filter(
                                                  (id) => id !== partId
                                                )
                                              );
                                            }}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                          >
                                            Remove
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-6 border-t">
                          <Button
                            variant="outline"
                            className="bg-white hover:bg-slate-200"
                            onClick={() => {
                              if (selectedParts.length > 0) {
                                setSelectedParts([]);
                                toast.info("All pending parts cleared");
                              }
                            }}
                            disabled={selectedParts.length === 0}
                          >
                            Clear Pending
                          </Button>
                          <Button
                            className="bg-green-900 text-white hover:bg-green-700"
                            onClick={async () => {
                              if (selectedParts.length === 0) {
                                toast.warning(
                                  "Please select at least one part"
                                );
                                return;
                              }

                              try {
                                await api.post(
                                  `/assets/${id}/compatible-parts`,
                                  {
                                    compatible_parts: selectedParts.map((id) =>
                                      parseInt(id)
                                    ),
                                  }
                                );

                                toast.success(
                                  "Compatible parts saved successfully"
                                );
                                // Refresh the asset data to show the new parts
                                fetchAsset();
                                // Clear the selected parts
                                setSelectedParts([]);
                              } catch (error) {
                                console.error(
                                  "Error saving compatible parts:",
                                  error
                                );
                                toast.error("Failed to save compatible parts");
                              }
                            }}
                            disabled={selectedParts.length === 0}
                          >
                            Add Compatible Parts
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* Fixed Right Sidebar */}
          <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`h-10 w-10 ${
                sidebarOpen ? "bg-green-100 text-green-600" : ""
              }`}
            >
              {sidebarOpen ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </Button>

            {sidebarOpen && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection("comments")}
                  className={`h-10 w-10 ${
                    activeSection === "comments"
                      ? "bg-green-100 text-green-600"
                      : ""
                  }`}
                >
                  <MessageSquare size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection("documents")}
                  className={`h-10 w-10 ${
                    activeSection === "documents"
                      ? "bg-green-100 text-green-600"
                      : ""
                  }`}
                >
                  <FileText size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection("images")}
                  className={`h-10 w-10 ${
                    activeSection === "images"
                      ? "bg-green-100 text-green-600"
                      : ""
                  }`}
                >
                  <ImageIcon size={20} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAsset;
