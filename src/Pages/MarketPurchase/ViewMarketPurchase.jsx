// src/pages/SiteDemands/ViewSiteDemand.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "react-toastify";
import siteDemandAPI from "../../lib/siteDemandApi";
import {
  ArrowLeft,
  Calendar,
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  ShoppingCart,
  User,
  MapPin,
  DollarSign,
  Truck,
  Building,
  ClipboardList,
  Tag,
  MessageCircle,
  BarChart3,
  CreditCard,
  Shield,
  Users,
  Store,
  Eye,
  Download,
  Printer,
  Edit2,
  Check,
  X as XIcon,
  Info,
  Percent,
  Package2,
  Wallet,
  Receipt,
  FileDigit,
} from "lucide-react";

const ViewMarketPurchase = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demand, setDemand] = useState(null);
  const navigate = useParams();
  const { id } = useParams();

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        setLoading(true);
        const res = await siteDemandAPI.getById(id);
        const demandData = res.data || res;
        setDemand(demandData);
      } catch (error) {
        console.error("Error fetching site demand:", error);
        toast.error("Failed to load site demand data");
        navigate("/market-purchases");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDemand();
    }
  }, [id, navigate]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in process":
      case "in progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in process":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status, label) => (
    <Badge
      className={`${getStatusColor(status)} flex items-center gap-1 px-3 py-1`}
    >
      {getStatusIcon(status)}
      {label || status}
    </Badge>
  );

  const renderDetail = (label, value, icon = null, transform = null) => {
    let displayValue = value;

    if (value === null || value === undefined || value === "") {
      displayValue = "N/A";
    } else if (transform === "currency") {
      displayValue = formatCurrency(value);
    } else if (transform === "date") {
      displayValue = formatDate(value);
    } else if (transform === "capitalize") {
      displayValue = String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    } else if (transform === "boolean") {
      displayValue = value ? "Yes" : "No";
    }

    return (
      <div className="flex flex-col space-y-1">
        <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
          {icon}
          {label}
        </div>
        <div className="text-sm text-gray-900 font-medium">{displayValue}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading market purchase...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Market purchase not found.</p>
            </div>
          </div>
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
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            {/* Left: Back Button and Demand Number */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/market-purchases")}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100 border border-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Market Purchase #{demand.demand_no || demand.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(demand.date || demand.created_at)}
                </p>
              </div>
            </div>

            {/* Right: Document Actions and Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Document Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/market-purchases/edit/${id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {getStatusBadge(demand.processing_status || demand.status)}

                {/* Action Buttons based on status */}
                {(demand.processing_status === "pending" ||
                  demand.status === "pending") && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XIcon className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Basic Information (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Demand Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileDigit className="w-5 h-5 text-blue-600" />
                        Demand Information
                      </h3>
                      {demand.priority && (
                        <Badge className={getPriorityColor(demand.priority)}>
                          {demand.priority} Priority
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderDetail(
                        "Demand Number",
                        demand.demand_no,
                        <Hash className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Demand Date",
                        demand.date,
                        <Calendar className="w-4 h-4" />,
                        "date"
                      )}
                      {renderDetail(
                        "Processing Status",
                        demand.processing_status,
                        <Clock className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Fulfillment Type",
                        demand.fulfillment_type,
                        <Truck className="w-4 h-4" />,
                        "capitalize"
                      )}
                      {renderDetail(
                        "Approved By",
                        demand.approved_by?.name,
                        <User className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Approved Date",
                        demand.approved_date,
                        <Calendar className="w-4 h-4" />,
                        "date"
                      )}
                    </div>

                    {/* Description */}
                    {demand.description && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Description
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {demand.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Item and Quantity Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Package2 className="w-5 h-5 text-green-600" />
                      Item & Quantity Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderDetail(
                        "Item Name",
                        demand.item_name,
                        <Package className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Item Code",
                        demand.item_code,
                        <Tag className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Requested Quantity",
                        demand.quantity,
                        <BarChart3 className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Approved Quantity",
                        demand.approved_quantity,
                        <Shield className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Unit of Measure",
                        demand.uom,
                        <ClipboardList className="w-4 h-4" />
                      )}
                      {renderDetail(
                        "Deliver To",
                        demand.deliver_to,
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>

                    {/* Quantity Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">
                            Requested
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {demand.quantity || 0}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-700">
                            Approved
                          </div>
                          <div className="text-lg font-bold text-green-900">
                            {demand.approved_quantity || 0}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-medium text-purple-700">
                            Actual
                          </div>
                          <div className="text-lg font-bold text-purple-900">
                            {demand.actual_purchase_qty || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Financial and Vendor Information (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Financial Details Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      Financial Details
                    </h3>

                    <div className="space-y-4">
                      {/* Rate Information */}
                      <div className="grid grid-cols-2 gap-4">
                        {renderDetail(
                          "Estimate Rate",
                          demand.estimate_rate,
                          <DollarSign className="w-4 h-4" />,
                          "currency"
                        )}
                        {renderDetail(
                          "Purchase Price",
                          demand.price,
                          <DollarSign className="w-4 h-4" />,
                          "currency"
                        )}
                      </div>

                      {/* Amount Information */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">
                            Estimate Amount
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(demand.estimate_amount)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">
                            Purchase Amount
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {formatCurrency(demand.purchase_amount)}
                          </div>
                        </div>
                        {demand.variance_amount && (
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-sm font-medium text-yellow-700">
                              Variance Amount
                            </div>
                            <div className="text-lg font-bold text-yellow-900">
                              {formatCurrency(demand.variance_amount)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Variance Percentage */}
                      {demand.variance_percentage && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-700">
                              Variance Percentage
                            </div>
                            <Badge
                              className={
                                demand.variance_percentage > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              <Percent className="w-3 h-3 mr-1" />
                              {Math.abs(demand.variance_percentage).toFixed(2)}%
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor & Schedule Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Vendor Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building className="w-5 h-5 text-orange-600" />
                          Vendor Information
                        </h3>
                        <div className="space-y-3">
                          {renderDetail(
                            "Vendor Name",
                            demand.vendor_name || demand.vendor?.name,
                            <Store className="w-4 h-4" />
                          )}
                          {renderDetail(
                            "Vendor Code",
                            demand.vendor?.code,
                            <Tag className="w-4 h-4" />
                          )}
                          {renderDetail(
                            "Contact Person",
                            demand.contact_person,
                            <Users className="w-4 h-4" />
                          )}
                          {renderDetail(
                            "Contact Number",
                            demand.contact_number,
                            <FileDigit className="w-4 h-4" />
                          )}
                          {renderDetail(
                            "MPN Number",
                            demand.mpn_no || demand.mnp_no,
                            <Receipt className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Schedule Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          Schedule Information
                        </h3>
                        <div className="space-y-3">
                          {renderDetail(
                            "Scheduled Date",
                            demand.scheduled_purchase_date,
                            <Calendar className="w-4 h-4" />,
                            "date"
                          )}
                          {renderDetail(
                            "Expected Delivery",
                            demand.expected_delivery_date,
                            <Truck className="w-4 h-4" />,
                            "date"
                          )}
                          {renderDetail(
                            "Actual Delivery",
                            demand.actual_delivery_date,
                            <CheckCircle className="w-4 h-4" />,
                            "date"
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Remarks & Notes Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                      Remarks & Notes
                    </h3>

                    <div className="space-y-4">
                      {/* Purchaser Remarks */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Purchaser Remarks
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px]">
                          <p className="text-sm text-gray-700">
                            {demand.purchaser_remarks || "No remarks provided"}
                          </p>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Additional Notes
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px]">
                          <p className="text-sm text-gray-700">
                            {demand.notes ||
                              demand.additional_remarks ||
                              "No additional notes"}
                          </p>
                        </div>
                      </div>
                    </div>
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

export default ViewMarketPurchase;
