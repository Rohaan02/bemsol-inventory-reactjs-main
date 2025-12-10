// src/pages/SiteDemands/TrackDemand.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";

const TrackDemand = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demand, setDemand] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const fetchDemandDetails = async () => {
    try {
      setLoading(true);
      // Fetch demand details
      const demandRes = await siteDemandAPI.getById(id);
      if (demandRes.success) {
        setDemand(demandRes.data);
      }

      // Fetch user logs
      const logsRes = await siteDemandAPI.getSiteDemandLog(id);
      console.log("logsRes:", logsRes);
      if (logsRes.success) {
        setLogs(logsRes.data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching demand details:", error);
      toast.error("Failed to load demand details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDemandDetails();
    }
  }, [id]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Process": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Approved: "bg-green-100 text-green-800",
      inter_store_transfer: "bg-purple-100 text-purple-800",
      site_purchase: "bg-orange-100 text-orange-800",
      purchase_order: "bg-indigo-100 text-indigo-800",
    };

    return (
      <Badge
        className={`${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={`${priorityStyles[priority] || "bg-gray-100 text-gray-800"}`}
      >
        {priority}
      </Badge>
    );
  };

  const getActivityIcon = (activityType) => {
    const icons = {
      created: <FileText className="w-4 h-4 text-blue-600" />,
      updated: <Clock className="w-4 h-4 text-orange-600" />,
      deleted: <XCircle className="w-4 h-4 text-red-600" />,
      approved: <CheckCircle className="w-4 h-4 text-green-600" />,
      site_manager_approval: <CheckCircle className="w-4 h-4 text-green-600" />,
      inventory_manager_approval: (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ),
      quantity_changed: <AlertCircle className="w-4 h-4 text-yellow-600" />,
      status_changed: <Info className="w-4 h-4 text-purple-600" />,
    };

    return icons[activityType] || <Info className="w-4 h-4 text-gray-600" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatActivityType = (activityType) => {
    const typeMap = {
      // Basic CRUD
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",

      // Approvals
      approved: "Approved",
      site_manager_approval: "Site Manager Approval",
      inventory_manager_approval: "Inventory Manager Approval",

      // Specific actions
      quantity_changed: "Quantity Changed",
      status_changed: "Status Changed",
      priority_changed: "Priority Changed",
      fulfillment_type_changed: "Fulfillment Type Changed",
    };

    return (
      typeMap[activityType] ||
      activityType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const formatFieldName = (fieldName) => {
    const fieldLabels = {
      processing_status: "Processing Status",
      inventory_manager_id: "Inventory Manager",
      site_manager_id: "Site Manager",
      site_store_officer_id: "Site Store Officer",
      approved_quantity: "Approved Quantity",
      quantity: "Quantity",
      priority: "Priority",
      fulfillment_type: "Fulfillment Type",
      purpose: "Purpose",
      remarks: "Remarks",
      updated_at: "Last Updated",
      created_at: "Created At",
      date: "Demand Date",
      required_date: "Required Date",
      demand_no: "Demand Number",
      item_name: "Item Name",
      location_id: "Location",
      notify_user_id: "Notify User",
      serial_numbers: "Serial Numbers",
      scheduled_purchase_date: "Scheduled Purchase Date",
      purchase_status: "Purchase Status",
      purchase_qty: "Purchase Quantity",
      actual_purchase_qty: "Actual Purchase Quantity",
      price: "Price",
      purchase_amount: "Purchase Amount",
      estimate_rate: "Estimate Rate",
      estimate_amount: "Estimate Amount",
      deliver_to: "Deliver To",
      purchaser_remarks: "Purchaser Remarks",
      mnp_no: "MPN Number",
      vendor_id: "Vendor",
      final_remarks: "Final Remarks",
      description: "Description",
      invoice_attachment: "Invoice Attachment",
      image: "Image",
    };

    return (
      fieldLabels[fieldName] ||
      fieldName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const formatFieldValue = (fieldName, value) => {
    if (value === null || value === undefined || value === "") {
      return "None";
    }

    // Handle date fields
    const dateFields = [
      "updated_at",
      "created_at",
      "date",
      "required_date",
      "scheduled_purchase_date",
    ];
    if (dateFields.includes(fieldName) && value) {
      return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Handle user ID fields
    const userFields = [
      "inventory_manager_id",
      "site_manager_id",
      "site_store_officer_id",
      "notify_user_id",
    ];
    if (userFields.includes(fieldName) && value) {
      return `User ID: ${value}`;
    }

    // Handle status fields
    const statusFields = ["processing_status", "purchase_status"];
    if (statusFields.includes(fieldName) && value) {
      return value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Handle priority fields
    if (fieldName === "priority" && value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    // Handle fulfillment type
    if (fieldName === "fulfillment_type" && value) {
      return value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Handle JSON fields
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const formatChangesDescription = (description) => {
    if (!description) return null;

    // Replace field names with user-friendly labels in the description
    let formattedDescription = description;

    // Create a mapping of field names to labels
    const fieldMappings = {
      processing_status: "Processing Status",
      inventory_manager_id: "Inventory Manager",
      site_manager_id: "Site Manager",
      approved_quantity: "Approved Quantity",
      quantity: "Quantity",
      priority: "Priority",
      fulfillment_type: "Fulfillment Type",
      purpose: "Purpose",
      remarks: "Remarks",
      updated_at: "Last Updated",
      created_at: "Created At",
    };

    Object.entries(fieldMappings).forEach(([key, label]) => {
      const regex = new RegExp(`\\b${key}\\b`, "g");
      formattedDescription = formattedDescription.replace(regex, label);
    });

    return formattedDescription;
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="success"
                  size="sm"
                  asChild
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Link to="/site-demands">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Demands
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Demand Tracking
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Complete history and activity log for demand{" "}
                    {demand?.demand_no}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Demand Details */}
              <div className="lg:col-span-1 space-y-6">
                {/* Demand Summary Card */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Demand Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {console.log("Demand data:", demand)}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Demand No
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {demand?.demand_no}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date
                        </p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {demand?.date
                            ? new Date(demand.date).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Item Name
                      </p>
                      <p className="text-md font-semibold text-gray-900">
                        {demand?.item_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Quantity
                        </p>
                        <p className="text-md font-semibold text-gray-900">
                          {demand?.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Approved Qty
                        </p>
                        <p className="text-md font-semibold text-gray-900">
                          {demand?.approved_quantity || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Priority
                        </p>
                        <div className="mt-1">
                          {getPriorityBadge(demand?.priority)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Status
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(demand?.processing_status)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Fulfillment Type
                      </p>
                      <p className="text-sm text-gray-900 capitalize">
                        {demand?.fulfillment_type?.replace(/_/g, " ") || "-"}
                      </p>
                    </div>

                    {demand?.purpose && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Purpose
                        </p>
                        <p className="text-sm text-gray-900">
                          {demand.purpose}
                        </p>
                      </div>
                    )}

                    {demand?.remarks && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Remarks
                        </p>
                        <p className="text-sm text-gray-900">
                          {demand.remarks}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Approval Chain Card */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Approval Chain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Created By
                        </span>
                        <span className="text-sm text-gray-900">
                          {demand?.site_store_officer?.name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Site Manager
                        </span>
                        <span className="text-sm text-gray-900">
                          {demand?.site_manager?.name || "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Inventory Manager
                        </span>
                        <span className="text-sm text-gray-900">
                          {demand?.inventory_manager?.name || "Pending"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Activity Log */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm border border-gray-200 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Activity History
                      <Badge variant="secondary" className="ml-2">
                        {logs.length} activities
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {logs.length > 0 ? (
                      <div className="space-y-4">
                        {logs.map((log, index) => (
                          <div key={log.id} className="flex gap-4">
                            {/* Timeline line */}
                            {index !== logs.length - 1 && (
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm">
                                  {getActivityIcon(log.activity_type)}
                                </div>
                                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                              </div>
                            )}
                            {index === logs.length - 1 && (
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm">
                                  {getActivityIcon(log.activity_type)}
                                </div>
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 pb-4">
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {formatActivityType(log.activity_type)}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                      By {log.user_name} ({log.user_role})
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                      {formatDate(log.created_at)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        log.created_at
                                      ).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>

                                {log.changes_description && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-700">
                                      {formatChangesDescription(
                                        log.changes_description
                                      )}
                                    </p>
                                  </div>
                                )}

                                {log.remarks && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Remarks:
                                      </span>{" "}
                                      {log.remarks}
                                    </p>
                                  </div>
                                )}

                                {/* Show old and new values if available */}
                                {log.old_values &&
                                  Object.keys(log.old_values).length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="font-medium text-gray-500 mb-1">
                                          Before:
                                        </p>
                                        <div className="space-y-1">
                                          {Object.entries(log.old_values).map(
                                            ([key, value]) => (
                                              <p
                                                key={key}
                                                className="text-gray-600"
                                              >
                                                <span className="font-medium">
                                                  {formatFieldName(key)}:
                                                </span>{" "}
                                                {formatFieldValue(key, value)}
                                              </p>
                                            )
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-500 mb-1">
                                          After:
                                        </p>
                                        <div className="space-y-1">
                                          {Object.entries(
                                            log.new_values || {}
                                          ).map(([key, value]) => (
                                            <p
                                              key={key}
                                              className="text-gray-600"
                                            >
                                              <span className="font-medium">
                                                {formatFieldName(key)}:
                                              </span>{" "}
                                              {formatFieldValue(key, value)}
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          No activity history found for this demand.
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
    </div>
  );
};

export default TrackDemand;
