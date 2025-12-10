import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { convertToWords } from "../../utils/currencyUtils";
import QRCodeDisplay from "../../utils/QRCodeDisplay";
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
} from "lucide-react";

import purchaseOrderAPI from "../../lib/purchaseOrderApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ViewPurchaseOrder = () => {
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
      if (result.success) {
        setPurchaseOrder(result.data);
        console.log("PO Data:", result.data);
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

      // Store original styles
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;

      // Set styles for PDF generation
      element.style.overflow = "visible";
      element.style.height = "auto";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Ensure all content is visible in the clone
          const clonedElement = clonedDoc.getElementById("pdf-content");
          if (clonedElement) {
            clonedElement.style.overflow = "visible";
            clonedElement.style.height = "auto";
            // Show all hidden print elements
            const printElements =
              clonedElement.querySelectorAll(".print\\:block");
            printElements.forEach((el) => {
              el.style.display = "block";
            });
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Restore original styles
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;

      // Download the PDF
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
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
              <p className="mt-4 text-gray-600">Loading purchase order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Action Header */}
          <div className="flex justify-between items-center mb-6 no-print">
            <div className="flex items-center gap-4">
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
                Purchase Order Details
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="flex items-center gap-2 bg-primary-color hover:bg-primary-color-hover text-white px-3 py-2 text-sm font-semibold rounded-lg transition-colors shadow disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {generatingPDF ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-primary-color text-white"
              >
                <Printer className="w-4 h-4" />
                Print/Preview
              </Button>
            </div>
          </div>

          {/* Main Content - Print Friendly */}
          <div className="max-w-6xl mx-auto" id="pdf-content" ref={pdfRef}>
            <Card className="bg-white print:shadow-none print:border-0">
              <CardContent className="p-8 print:p-0">
                {/* Print Header - Only shows when printing */}

                {/* PO Header Section */}
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                  {/* Company Name on Left */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">BEMSOL</h2>
                  </div>

                  {/* Purchase Order Title in Center */}
                  <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      PURCHASE ORDER
                    </h1>
                  </div>

                  {/* PO Details and QR Code on Right */}
                  <div className="flex-1 text-right">
                    <div className="inline-flex items-end gap-4">
                      {/* PO Details */}
                      <div className="text-right space-y-1">
                        <div>
                          <span className="text-gray-600 text-sm">PO #: </span>
                          <span className="font-semibold">
                            {purchaseOrder.po_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm">Date: </span>
                          <span>{formatDate(purchaseOrder.created_at)}</span>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            purchaseOrder.status
                          )} flex items-center gap-1 text-xs justify-end`}
                        >
                          {getStatusIcon(purchaseOrder.status)}
                          {purchaseOrder.status?.charAt(0).toUpperCase() +
                            purchaseOrder.status?.slice(1)}
                        </Badge>
                      </div>

                      {/* QR Code */}
                      <div className="text-right">
                        <div
                          className="inline-block"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <QRCodeDisplay
                            value={JSON.stringify({
                              poNumber: purchaseOrder.po_number,
                              date: purchaseOrder.created_at,
                              vendor: purchaseOrder.vendor_name,
                              total: purchaseOrder.total_payable,
                            })}
                            size={256}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Scan QR</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company and PO Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Company Info */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      From:
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        BEMSOL pvt Ltd
                      </p>
                      <p className="text-gray-600">
                        Address: 9-B, NESPAK Society, Phase II, Canal Bank Road,
                        Lahore, Pakistan
                      </p>
                      <p className="text-gray-600">UAN: +92 (42) 111 236 765</p>
                      <p className="text-gray-600">
                        GST # 03-04-8400-1307-3 NTN # 2498262-8
                      </p>
                      <p className="text-gray-600">Email: info@bemsol.com</p>
                    </div>
                  </div>

                  {/* PO Info */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Info:
                      </h2>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">PO Date:</span>
                        <span>{formatDate(purchaseOrder.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span>{formatDate(purchaseOrder.delivery_date)}</span>
                      </div>
                      {purchaseOrder.ref_quotation_no && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Reference Quote:
                          </span>
                          <span>{purchaseOrder.ref_quotation_no}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inco Term:</span>
                        <span>{purchaseOrder.intco_term}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor and Delivery Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Vendor Information */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Vendor Information
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600">
                        Code: {purchaseOrder.vendor?.code || "N/A"}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {purchaseOrder.vendor?.name ||
                          purchaseOrder.vendor?.company_name ||
                          "N/A"}
                      </p>
                      <div className="text-gray-600">
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
                      <p className="text-gray-600">
                        Email: {purchaseOrder.vendor?.email || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        Phone: {purchaseOrder.vendor?.phone || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        GST: {purchaseOrder.vendor?.gst_no || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        NTN: {purchaseOrder.vendor?.ntn || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        Contact Person:{" "}
                        {purchaseOrder.key_contact_person || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Information
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">
                        {purchaseOrder.location?.name || "Delivery Location"}
                      </p>
                      <p className="text-gray-600">
                        {purchaseOrder.location?.address ||
                          "Address not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specification */}
                <div className="mb-8">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Specification
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-gray-700">
                      {purchaseOrder.specification ||
                        "No specification provided"}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-8">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Items Ordered
                  </h3>
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
                              <div className="font-medium">
                                {item.inventoryItem?.item_name ||
                                  item.item_name ||
                                  `Item ${index + 1}`}
                              </div>
                              {item.inventoryItem?.item_code && (
                                <div className="text-xs text-gray-500">
                                  Code: {item.inventoryItem.item_code}
                                </div>
                              )}
                              {item.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.uom || "N/A"}
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

                      {/* Financial Summary in Table Footer */}
                      <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                        {/* Subtotal */}
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

                        {/* GST */}
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

                        {/* Total After Tax */}
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

                        {/* WHT */}
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

                        {/* Total Payable */}
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

                        {/* Amount in Words */}
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
                                {convertToWords(purchaseOrder.total_payable) ||
                                  "Zero Rupees Only"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Terms and Conditions */}
                {purchaseOrder.terms_conditions && (
                  <div className="mb-8">
                    <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Terms & Conditions
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: purchaseOrder.terms_conditions,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {purchaseOrder.conditions && (
                  <div className="mb-8">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                      Conditions
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                      {Object.entries(purchaseOrder.conditions).map(
                        ([key, value]) =>
                          value && (
                            <div key={key} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700 capitalize">
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
                    <div className="mb-8">
                      <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Attachments ({purchaseOrder.attachments.length})
                      </h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {purchaseOrder.attachments.map(
                            (attachment, index) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                              >
                                <FileText className="w-8 h-8 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {attachment.file_name ||
                                      `Attachment ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {attachment.file_size
                                      ? `Size: ${(
                                          attachment.file_size /
                                          1024 /
                                          1024
                                        ).toFixed(2)} MB`
                                      : "Size unknown"}
                                  </p>
                                </div>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    window.open(attachment.file_url, "_blank")
                                  }
                                >
                                  View
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Footer for Print */}
                <div className="mt-12 pt-8 border-t border-gray-200 print:mt-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Authorized Signature
                      </p>
                      <div className="h-20 border-b border-gray-300"></div>
                      <p className="text-xs text-gray-500 mt-1">Name & Title</p>
                      <p className="text-xs text-gray-500">
                        Date: {formatDate(new Date())}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Vendor Signature
                      </p>
                      <div className="h-20 border-b border-gray-300"></div>
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
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
          .print\\:mt-16 {
            margin-top: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewPurchaseOrder;
