// src/Pages/UntrackItem/ViewUntrackItem.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import untrackItemAPI from "../../lib/untrackItemAPI";
import InventoryItemAPI from "../../lib/InventoryItemApi";

// Layout imports
// import { Sidebar } from "../../components/layout/Sidebar";
// import { Header } from "../../components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Printer } from "lucide-react";

const ViewUntrackItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState(null);
  const [linkedItem, setLinkedItem] = useState(null);

  // Fetch untracked item data
  useEffect(() => {
    fetchItemData();
  }, [id]);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      const response = await untrackItemAPI.getById(id);
      const data = response.data || response;

      console.log("Fetched untracked item data:", data);
      setItemData(data);

      // Fetch linked inventory item if exists
      if (data.linked_item_id) {
        try {
          const linkedItemResponse = await InventoryItemAPI.getById(
            data.linked_item_id
          );
          setLinkedItem(linkedItemResponse.data || linkedItemResponse);
        } catch (error) {
          console.error("Error fetching linked item:", error);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch item data");
      navigate("/untracked-items");
    } finally {
      setLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download as PDF (basic implementation)
  const handleDownload = () => {
    toast.info("Download feature would be implemented here");
    // In a real implementation, you would generate a PDF here
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sample":
        return "bg-blue-100 text-blue-800";
      case "broken":
        return "bg-red-100 text-red-800";
      case "for repair":
        return "bg-orange-100 text-orange-800";
      case "spare":
        return "bg-green-100 text-green-800";
      case "installed":
        return "bg-purple-100 text-purple-800";
      case "new":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Tag badge colors
  const getTagColor = (tag) => {
    switch (tag?.toLowerCase()) {
      case "sample":
        return "bg-blue-100 text-blue-800";
      case "spare":
        return "bg-green-100 text-green-800";
      case "for repair":
        return "bg-orange-100 text-orange-800";
      case "broken":
        return "bg-red-100 text-red-800";
      case "new":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* <Header /> */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading item details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!itemData) {
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* <Header /> */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="text-center py-12">
              <p className="text-gray-500">Item not found</p>
              <Button
                onClick={() => navigate("/untracked-items")}
                className="mt-4 bg-white text-black"
              >
                Back to Untracked Items
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {/* <Header /> */}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => navigate("/untracked-items")}
                  className="flex items-center gap-2 bg-black text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Untracked Item Details
                  </h1>
                  <p className="text-gray-600">
                    Complete information about the untracked item
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Core details and identification information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Item Number
                        </label>
                        <p className="text-gray-900 mt-1">
                          {itemData.item_number || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Item Name
                        </label>
                        <p className="text-gray-900 font-medium mt-1">
                          {itemData.item_name || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Tag
                        </label>
                        <div className="mt-1">
                          {itemData.tag ? (
                            <Badge className={getTagColor(itemData.tag)}>
                              {itemData.tag}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Service Status
                        </label>
                        <div className="mt-1">
                          {itemData.service_status ? (
                            <Badge
                              className={getStatusColor(
                                itemData.service_status
                              )}
                            >
                              {itemData.service_status}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specification */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Specification
                      </label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                        {itemData.specification || (
                          <span className="text-gray-400">
                            No specification provided
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                        {itemData.description || (
                          <span className="text-gray-400">
                            No description provided
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Remarks
                      </label>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                        {itemData.remarks || (
                          <span className="text-gray-400">
                            No remarks provided
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Linked Item Information */}
                {linkedItem && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Linked Inventory Item
                      </CardTitle>
                      <CardDescription>
                        Connected inventory item information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Item Code
                          </label>
                          <p className="text-gray-900 mt-1">
                            {linkedItem.item_code}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Item Name
                          </label>
                          <p className="text-gray-900 mt-1">
                            {linkedItem.item_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Category
                          </label>
                          <p className="text-gray-900 mt-1">
                            {linkedItem.category_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Current Stock
                          </label>
                          <p className="text-gray-900 mt-1">
                            {linkedItem.current_stock || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Image and Metadata */}
              <div className="space-y-6">
                {/* Image Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Item Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {itemData.picture_url ? (
                      <div className="text-center">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                          <img
                            src={itemData.picture_url}
                            alt={itemData.item_name || "Untracked Item"}
                            className="w-full h-64 object-cover rounded-lg mx-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Click to view full size
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                          No image available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .bg-gray-100 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewUntrackItem;
