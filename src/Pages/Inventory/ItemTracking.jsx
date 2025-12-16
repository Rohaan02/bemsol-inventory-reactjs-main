import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tab } from "@headlessui/react";
import inventoryItemAPI from "@/lib/InventoryItemApi";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import LocationsCard from "./LocationCard";
import InventoryActivity from "./InventoryActivity";

import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Archive,
  Plus,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
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

const ItemTracking = () => {
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("comments");
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  const documentsData = [
    {
      id: 1,
      name: "user_manual.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Jan 15, 2024",
    },
  ];

  // Fetch comments function
  const getCommentsData = async () => {
    setLoadingComments(true);
    try {
      console.log("Fetching comments for item ID:", id);
      const response = await inventoryItemAPI.getComments(id);
      console.log("Full API response:", response);

      // Handle different response structures
      let commentsData = [];

      if (Array.isArray(response)) {
        // Response is directly an array
        commentsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response has data property that's an array
        commentsData = response.data;
      } else if (response && Array.isArray(response.comments)) {
        // Response has comments property
        commentsData = response.comments;
      } else if (response && response.data && response.data.comments) {
        // Response has data.comments property
        commentsData = response.data.comments;
      }

      console.log("Extracted comments data:", commentsData);

      // Sort comments by date (newest first)
      const sortedComments = [...commentsData].sort((a, b) => {
        return (
          new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
        );
      });

      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      console.error("Error response:", error.response);
      toast.error("Failed to fetch comments");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch item details
  const fetchItem = async () => {
    try {
      const response = await inventoryItemAPI.getById(id);
      const itemData = response.data ?? response;
      console.log("itemData", itemData);
      setItem(itemData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch item details");
    }
  };

  useEffect(() => {
    fetchItem();
    getCommentsData();
  }, [id]);

  // Refresh comments when sidebar opens to comments section
  useEffect(() => {
    if (sidebarOpen && activeSection === "comments") {
      getCommentsData();
    }
  }, [sidebarOpen, activeSection]);

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

  if (!item)
    return (
      <div className="flex-1 flex justify-center items-center text-black">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading item details...
      </div>
    );

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Full Width Item Info Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Link
                to="/inventory"
                className="flex items-center gap-1 px-2 py-1"
              >
                <ArrowLeft size={16} />
                <span className="font-semibold">Parts</span>
              </Link>
            </div>
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-gray-300 rounded-lg w-20 h-20 flex items-center justify-center text-xl font-bold text-gray-600">
                  <img
                    src={item.image_url}
                    alt={item.item_code}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold">{item.item_code}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        Category
                      </span>
                      <span>
                        {item.category?.category_name ||
                          item.category_id ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        Model Number
                      </span>
                      <span>{item.model_no || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">UPC</span>
                      <span>{item.unit?.name || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        Unit Cost
                      </span>
                      <span>{item.unit_cost ? `${item.unit_cost}` : "—"}</span>
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
                      className="text-gray-600"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="flex items-center gap-2 text-black cursor-pointer">
                      Update Qty
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 text-black cursor-pointer">
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-black bg-white hover:bg-gray-100 px-2 py-1"
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Tabs Section */}
            <Tab.Group
              selectedIndex={activeTab}
              onChange={setActiveTab}
              className="bg-white-50"
            >
              <Tab.List className="flex space-x-2 border-b border-gray-300 mb-4 ">
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
                  Inventory Activity
                </Tab>
              </Tab.List>

              <Tab.Panels className="h-[calc(100vh-300px)] overflow-y-auto">
                <Tab.Panel className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Main Content */}
                    <div
                      className={`${
                        sidebarOpen ? "lg:col-span-8" : "lg:col-span-6"
                      } space-y-6`}
                    >
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="text-green-600">
                            Item Full Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-black">
                          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <tbody>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 border font-semibold">
                                  Part Number
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.item_code}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 border font-semibold">
                                  Item Name:
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.item_name || "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 border font-semibold">
                                  Specification:
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.specification || "—"}
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 border font-semibold">
                                  Manufacturer
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.manufacturer?.name ||
                                    item.manufacturer_name ||
                                    "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 border font-semibold">
                                  Re-Order Point
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.reorder_level || "—"}
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 border font-semibold">
                                  Weight
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.weight || "—"}
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 border font-semibold">
                                  Dimension
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.dimensions?.legnth || "—"},{" "}
                                  {item.dimensions?.width || "-"},{" "}
                                  {item.dimensions?.height || "-"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 border font-semibold">
                                  Account Title:
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.account?.account_name || "—"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>

                      <Card className="bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-green-600">
                            Inventory Remarks
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

                      {/* Location Card moves here when sidebar is open */}
                      {sidebarOpen && (
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Location Analytics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <LocationsCard item={item} />
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column - Location Card when sidebar closed */}
                    {!sidebarOpen && (
                      <div className="lg:col-span-6">
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-green-600">
                              Location Analytics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <LocationsCard item={item} />
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Active Section Content when sidebar is open */}
                    {sidebarOpen && (
                      <div className="lg:col-span-4 space-y-6">
                        {/* Comments Section */}
                        {activeSection === "comments" && (
                          <Card className="bg-white">
                            <CardHeader>
                              <CardTitle className="text-green-600">
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
                                      placeholder="Add a comment..."
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
                          <Card className="bg-white">
                            <CardHeader>
                              <CardTitle className="text-green-600">
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
                          <Card className="bg-white">
                            <CardHeader>
                              <CardTitle className="text-green-600">
                                Images
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8">
                                <ImageIcon
                                  size={48}
                                  className="mx-auto text-gray-400 mb-4"
                                />
                                <p className="text-gray-500 mb-4">
                                  No images uploaded yet
                                </p>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 mb-2">
                                    Drop images here or click to upload
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
                                    Choose Images
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
                  <Card className="bg-white">
                    <CardContent className="text-black">
                      <InventoryActivity itemId={id} />
                    </CardContent>
                  </Card>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* Fixed Right Sidebar - Starts from tabs section */}
          <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`h-10 w-10 ${sidebarOpen ? "bg-primary-color" : ""}`}
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

export default ItemTracking;
