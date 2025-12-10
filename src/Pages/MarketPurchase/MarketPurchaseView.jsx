import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileImage, Loader2 } from "lucide-react";
import marketPurchaseApi from "../../lib/MarketPurchaseApi";
import { toast } from "react-toastify";
const MarketPurchaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  useEffect(() => {
    loadDetails();
  }, [id]);
  const loadDetails = async () => {
      try {
        const data = await marketPurchaseApi.getFullMarketPurchaseDetails(id);
        setDetails(data);
        console.log('mp view data', data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load market purchase details");
      } finally {
        setLoading(false);
      }
    };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-color" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        No data found.
      </div>
    );
  }

  const { demand, schedule, market_purchase, orders, attachments } = details;

  return (
    <div className="flex h-full min-h-screen bg-white-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/market-purchases")}
              className="flex items-center gap-2 bg-primary-color text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Market Purchase Details</h1>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">

            {/* Demand Info */}
            <Card>
              <CardHeader>
                <CardTitle>Site Demand Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <p><strong>Date:</strong> {demand?.date}</p>
                <p><strong>Approved Qty:</strong> {demand?.approved_qty}</p>
                <p><strong>Status:</strong> {demand?.processing_status}</p>
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Schedule</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <p><strong>Scheduled Date:</strong> {schedule?.scheduled_date}</p>
                <p><strong>Scheduled Qty:</strong> {schedule?.scheduled_qty}</p>
                <p><strong>Deliver To:</strong> {schedule?.deliver_to}</p>
                <p><strong>Status:</strong> {schedule?.status}</p>
                <p><strong>Estimated Rate:</strong> {schedule?.estimated_rate}</p>
                <p><strong>Estimated Amount:</strong> {schedule?.estimated_amount}</p>
              </CardContent>
            </Card>

            {/* Market Purchase Info */}
            <Card>
              <CardHeader>
                <CardTitle>Market Purchase</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-4">
                <p><strong>Order Date:</strong> {market_purchase?.order_date}</p>
                <p><strong>Actual Purchase Qty:</strong> {market_purchase?.actual_purchase_qty}</p>
                <p><strong>Received Qty:</strong> {market_purchase?.received_qty}</p>
                <p><strong>Purchase Amount:</strong> {market_purchase?.purchase_amount}</p>
                <p><strong>Vendor:</strong> {market_purchase?.vendor?.name}</p>
                <p><strong>Rate:</strong> {market_purchase?.rate}</p>
                <p><strong>Amount:</strong> {market_purchase?.amount}</p>
                <p><strong>Status:</strong> {market_purchase?.purchase_status}</p>
                <p><strong>Description:</strong> {market_purchase?.description}</p>
                <p><strong>Remarks:</strong> {market_purchase?.remarks}</p>

                {market_purchase?.order_image && (
                  <div>
                    <p className="font-semibold">Order Image</p>
                    <img
                      src={market_purchase.order_image}
                      alt="Order"
                      className="w-40 rounded shadow border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.length ? (
                    orders.map((o) => (
                      <div
                        key={o.id}
                        className="border rounded p-4 flex justify-between bg-gray-50"
                      >
                        <div>
                          <p><strong>Date:</strong> {o.date}</p>
                          <p><strong>Ordered Qty:</strong> {o.order_qty}</p>
                          <p><strong>Received Qty:</strong> {o.received_qty}</p>
                          <p><strong>Notes:</strong> {o.notes}</p>
                        </div>

                        {o.attachment && (
                          <a
                            href={o.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center text-primary-color"
                          >
                            <FileImage className="w-10 h-10" />
                            Attachment
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No purchase orders found.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments (MPN)</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                {attachments?.length ? (
                  attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.file_url}
                      target="_blank"
                      className="flex flex-col items-center border rounded p-3 shadow bg-gray-50"
                    >
                      <FileImage className="w-12 h-12 text-primary-color" />
                      <span className="text-sm mt-1">{a.file_name}</span>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500">No attachments found.</p>
                )}
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketPurchaseView;
