import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { convertToWords } from "../../utils/currencyUtils";
import QRCodeDisplay from "../../utils/QRCodeDisplay";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import purchaseOrderAPI from "../../lib/purchaseOrderApi";

import {
  ArrowLeft,
  Download,
  Printer,
  Eye,
  FileText,
  Building,
  MapPin,
  Calendar,
  User,
  Phone,
  Tag,
  FileDigit,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit2,
  EyeOff,
  MessageSquare,
  Paperclip,
  X,
  Menu,
  FileIcon,
  Check,
  X as XIcon,
} from "lucide-react";

const ShowPurchaseOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const result = await purchaseOrderAPI.getById(id);
      console.log("show po data", result.data);
      if (result.success) {
        setPurchaseOrder(result.data);
      } else {
        toast.error(result.message || "Failed to fetch purchase order");
        navigate("/purchase-orders");
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      toast.error("Failed to load purchase order");
      navigate("/purchase-orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (generatingPDF) return;

    setGeneratingPDF(true);
    toast.info("Generating PDF...");

    try {
      const element = pdfRef.current;
      if (!element) {
        toast.error("Cannot generate PDF - content not found");
        return;
      }

      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;

      element.style.overflow = "visible";
      element.style.height = "auto";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("pdf-content");
          if (clonedElement) {
            clonedElement.style.overflow = "visible";
            clonedElement.style.height = "auto";
            const printElements =
              clonedElement.querySelectorAll(".print\\:block");
            printElements.forEach((el) => {
              el.style.display = "block";
            });
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;

      pdf.save(`Purchase-Order-${purchaseOrder.po_number}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
      case "draft":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "purchased":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading purchase order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="flex h-screen bg-white-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Purchase order not found.</p>
            </div>
          </div>
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
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            {/* Left: Back Button and PO Number */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/purchase-orders")}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100 border border-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Purchase Order #{purchaseOrder.po_number}
                </h1>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(purchaseOrder.created_at)}
                </p>
              </div>
            </div>

            {/* Right: Document Actions and Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Document Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {generatingPDF ? "Generating..." : "PDF"}
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate(`/purchase-orders/edit/${id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>

              {/* Status Badge and Approve Button */}
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getStatusColor(
                    purchaseOrder.status
                  )} flex items-center gap-1 px-3 py-1`}
                >
                  {getStatusIcon(purchaseOrder.status)}
                  {purchaseOrder.status?.charAt(0).toUpperCase() +
                    purchaseOrder.status?.slice(1)}
                </Badge>

                {purchaseOrder.status === "pending" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                )}

                {purchaseOrder.status === "pending" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XIcon className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Vendor, Created By, Location (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Vendor Details Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Vendor Details
                      </h3>
                      {purchaseOrder.vendor?.code && (
                        <Badge variant="outline" className="text-sm">
                          Code: {purchaseOrder.vendor.code}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {purchaseOrder.vendor?.name ||
                            purchaseOrder.vendor?.company_name ||
                            "N/A"}
                        </p>
                        <div className="text-gray-600 mt-1">
                          {purchaseOrder.vendor?.address ? (
                            Array.isArray(purchaseOrder.vendor.address) ? (
                              purchaseOrder.vendor.address.map(
                                (addrObj, index) => (
                                  <p key={index}>{addrObj.address}</p>
                                )
                              )
                            ) : (
                              <p>{purchaseOrder.vendor.address}</p>
                            )
                          ) : (
                            <p>Address not available</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Contact Person
                          </p>
                          <p className="font-medium">
                            {purchaseOrder.key_contact_person || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">
                            {purchaseOrder.vendor?.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {purchaseOrder.vendor?.phone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">GST/NTN</p>
                          <p className="font-medium">
                            {purchaseOrder.vendor?.gst_no || "N/A"} /{" "}
                            {purchaseOrder.vendor?.ntn || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Created By and Location Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Created By Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Created By
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">
                              {purchaseOrder.created_by?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {formatDate(purchaseOrder.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium">
                              {purchaseOrder.created_by?.role || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Delivery Location
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {purchaseOrder.location?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">
                              {purchaseOrder.location?.address || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Delivery Date
                            </p>
                            <p className="font-medium">
                              {formatDate(purchaseOrder.delivery_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Inco Term</p>
                            <p className="font-medium">
                              {purchaseOrder.intco_term || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specification and Terms Card */}
                <Card>
                  <CardContent className="p-6">
                    {/* Specification */}
                    {purchaseOrder.specification && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Specification
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700">
                            {purchaseOrder.specification}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Terms & Conditions */}
                    {purchaseOrder.terms_conditions && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Terms & Conditions
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: purchaseOrder.terms_conditions,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Item Details and Financials (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Item Details Card */}
                <Card id="pdf-content" ref={pdfRef}>
                  <CardContent className="p-6 print:p-0">
                    {/* PO Header for Print */}
                    <div className="hidden print:block mb-6 border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            BEMSOL
                          </h2>
                          <p className="text-sm text-gray-600">
                            Purchase Order
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-end gap-4">
                            <div>
                              <p className="text-sm font-semibold">
                                PO #: {purchaseOrder.po_number}
                              </p>
                              <p className="text-sm">
                                Date: {formatDate(purchaseOrder.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className="inline-block"
                                style={{ width: "50px", height: "50px" }}
                              >
                                <QRCodeDisplay
                                  value={JSON.stringify({
                                    poNumber: purchaseOrder.po_number,
                                    date: purchaseOrder.created_at,
                                    vendor:
                                      purchaseOrder.vendor?.name ||
                                      purchaseOrder.vendor?.company_name,
                                    total: purchaseOrder.total_payable,
                                  })}
                                  size={200}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Items Ordered
                    </h3>

                    {/* Items Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item Description
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              UOM
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Rate
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchaseOrder.items?.map((item, index) => (
                            <tr key={item.id || index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {/* Show inventory item name if available, otherwise use extracted name */}
                                <div className="font-medium">
                                  {item.inventory_item?.item_name ||
                                    item.item_name ||
                                    item.item_description ||
                                    `Item ${index + 1}`}
                                </div>
                                {/* Show inventory item code if available, otherwise try to extract from description */}
                                {item.inventory_item?.item_code && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Code: {item.inventory_item.item_code}
                                  </div>
                                )}
                                {/* Fallback: If no inventory item but we have item_description with code */}
                                {!item.inventory_item?.item_code &&
                                  item.item_code && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Code: {item.item_code}
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {/* Use inventory item UOM if available, otherwise use item UOM */}
                                {item.inventory_item?.uom || item.uom || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                {item.quantity || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                {formatCurrency(item.rate)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        {/* Financial Summary */}
                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                            >
                              Subtotal:
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(purchaseOrder.subtotal)}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                            >
                              GST ({purchaseOrder.gst_rate}%):
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(purchaseOrder.gst_amount)}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                            >
                              Total After Tax:
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(purchaseOrder.total_after_tax)}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                            >
                              WHT ({purchaseOrder.wht_rate}%):
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(purchaseOrder.wht_amount)}
                            </td>
                          </tr>

                          <tr className="bg-gray-100 border-t border-gray-300">
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-sm font-bold text-gray-900 text-right"
                            >
                              Total Payable:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right text-lg">
                              {formatCurrency(purchaseOrder.total_payable)}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-4 bg-gray-50 border-t border-gray-300"
                            >
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                  Amount in Words:
                                </p>
                                <p className="text-sm text-gray-600 italic">
                                  {convertToWords(
                                    purchaseOrder.total_payable
                                  ) || "Zero Rupees Only"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Print Footer */}
                    <div className="hidden print:block mt-8 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            Authorized Signature
                          </p>
                          <div className="h-16 border-b border-gray-300"></div>
                          <p className="text-xs text-gray-500 mt-1">
                            Name & Title
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {formatDate(new Date())}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            Vendor Signature
                          </p>
                          <div className="h-16 border-b border-gray-300"></div>
                          <p className="text-xs text-gray-500 mt-1">
                            Vendor Representative
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: ________________
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Information
                    </h3>

                    <div className="space-y-4">
                      {/* Reference Quote */}
                      {purchaseOrder.ref_quotation_no && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Reference Quote
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {purchaseOrder.ref_quotation_no}
                          </span>
                        </div>
                      )}

                      {/* Conditions */}
                      {purchaseOrder.conditions &&
                        Object.keys(purchaseOrder.conditions).some(
                          (key) => purchaseOrder.conditions[key]
                        ) && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Conditions
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(purchaseOrder.conditions).map(
                                ([key, value]) =>
                                  value && (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-gray-700 capitalize">
                                        {key.replace(/_/g, " ")}
                                      </span>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Attachments */}
                      {purchaseOrder.attachments &&
                        purchaseOrder.attachments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Attachments ({purchaseOrder.attachments.length})
                            </h4>
                            <div className="space-y-2">
                              {purchaseOrder.attachments.map(
                                (attachment, index) => (
                                  <div
                                    key={attachment.id || index}
                                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-700 truncate">
                                        {attachment.file_name ||
                                          `Attachment ${index + 1}`}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        window.open(
                                          attachment.file_url,
                                          "_blank"
                                        )
                                      }
                                    >
                                      View
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-content,
          #pdf-content * {
            visibility: visible;
          }
          #pdf-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShowPurchaseOrder;
