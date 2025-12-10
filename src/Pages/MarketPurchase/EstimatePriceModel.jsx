import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, DollarSign, Download, CheckCircle } from "lucide-react";
import siteDemandApi from "@/lib/siteDemandApi";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi"; // Add this import
import inventoryItemAPI from "@/lib/InventoryItemApi";

const EstimatePriceModel = ({ isOpen, onClose, onSubmit, selectedItems }) => {
  const [estimateData, setEstimateData] = useState({
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSavedEstimates, setHasSavedEstimates] = useState(false);

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      initializeItems();
    } else {
      // Reset data when dialog closes
      setEstimateData({ items: [] });
      setHasSavedEstimates(false);
    }
  }, [isOpen, selectedItems]);

  const initializeItems = async () => {
  setLoading(true);
  try {
    const itemsWithPrices = await Promise.all(
      selectedItems.map(async (item) => {
        let lastPurchasePrice = 0;
        
        // Fetch last purchase price for the item
        try {
          const priceData = await inventoryItemAPI.getLastPurchasePrice(item.inventory_item_id || item.id);
          lastPurchasePrice = parseFloat(priceData.last_purchase_price) || 0;
        } catch (error) {
          console.warn(`Could not fetch price for item ${item.id}:`, error);
        }

        // Check if this is a schedule item (has schedule_id and scheduled_qty)
        const isScheduleItem = item.schedule_id && item.scheduled_qty;
        
        // For schedules, use scheduled_qty, otherwise use purchase_qty
        const purchaseQty = isScheduleItem ? parseFloat(item.scheduled_qty) || 0 : (parseFloat(item.purchase_qty) || 0);
        
        // Check for existing estimates - prioritize schedule estimates for schedule items
        let existingEstimateRate = 0;
        let existingEstimateAmount = 0;
        let hasExistingEstimate = false;

        if (isScheduleItem) {
          // For schedule items, check both estimated_rate and estimate_rate
          existingEstimateRate = parseFloat(item.estimated_rate) || parseFloat(item.estimate_rate) || lastPurchasePrice;
          existingEstimateAmount = parseFloat(item.estimated_amount) || parseFloat(item.estimate_amount) || (purchaseQty * existingEstimateRate);
          hasExistingEstimate = !!(item.estimated_rate && item.estimated_amount);
        } else {
          // For regular items, use estimate_rate and estimate_amount
          existingEstimateRate = parseFloat(item.estimate_rate) || lastPurchasePrice;
          existingEstimateAmount = parseFloat(item.estimate_amount) || (purchaseQty * existingEstimateRate);
          hasExistingEstimate = !!(item.estimate_rate && item.estimate_amount);
        }

        return {
          id: item.id,
          schedule_id: item.schedule_id, // Add schedule_id for schedule items
          demand_no: item.demand_no || `DEM-${item.id}`,
          item_code: item.item_code || item.inventory_item?.item_code || "N/A",
          item_name: item.item_name || item.inventory_item?.item_name || "N/A",
          purchase_qty: purchaseQty,
          scheduled_qty: parseFloat(item.scheduled_qty) || 0, // Add scheduled_qty for schedule items
          approved_qty: parseFloat(item.purchaseQty) || 0,
          last_purchase_price: lastPurchasePrice,
          estimate_rate: existingEstimateRate,
          estimate_amount: existingEstimateAmount,
          has_saved_estimate: hasExistingEstimate,
          is_schedule_item: isScheduleItem, // Flag to identify schedule items
        };
      })
    );

    // Check if any items already have saved estimates
    const hasExistingEstimates = itemsWithPrices.some(item => item.has_saved_estimate);
    setHasSavedEstimates(hasExistingEstimates);

    setEstimateData({
      items: itemsWithPrices,
    });
  } catch (error) {
    console.error("Error initializing items:", error);
  } finally {
    setLoading(false);
  }
};

  const handleRateChange = (itemId, value) => {
    const rate = parseFloat(value) || 0;
    setEstimateData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const quantity = item.scheduled_qty || item.purchase_qty || 0;
          const estimateAmount = quantity * rate;
          return {
            ...item,
            estimate_rate: rate,
            estimate_amount: estimateAmount,
            has_saved_estimate: false, // Remove saved flag when user edits
          };
        }
        return item;
      }),
    }));
    setHasSavedEstimates(false); // Reset saved flag when any value changes
  };

  const handleQtyChange = (itemId, value) => {
    const qty = Math.max(0, parseFloat(value) || 0);
    setEstimateData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const estimateAmount = qty * (item.estimate_rate || 0);
          return {
            ...item,
            purchase_qty: qty,
            estimate_amount: estimateAmount,
            has_saved_estimate: false, // Remove saved flag when user edits
          };
        }
        return item;
      }),
    }));
    setHasSavedEstimates(false); // Reset saved flag when any value changes
  };

  const handleSubmit = async () => {
  // Validate required fields
  if (estimateData.items.length === 0) {
    alert("No items to update");
    return;
  }

  // Validate estimate rates
  const invalidRates = estimateData.items.filter(item => !item.estimate_rate || item.estimate_rate <= 0);
  if (invalidRates.length > 0) {
    alert("All estimate rates must be greater than 0");
    return;
  }

  // Check if we have schedule items
  const scheduleItems = estimateData.items.filter(item => item.is_schedule_item);
  const regularItems = estimateData.items.filter(item => !item.is_schedule_item);

  try {
    setSubmitting(true);

    let scheduleResults = [];
    let demandResults = [];

    if (scheduleItems.length > 0) {
      // Handle schedule items - update purchase_schedule table
      scheduleResults = await Promise.all(
        scheduleItems.map(async (item) => {
          const scheduleData = {
            schedule_id: item.schedule_id,
            estimated_rate: parseFloat(item.estimate_rate),
            estimated_amount: parseFloat(item.estimate_amount),
            estimated_by: 1, // Replace with actual user ID from your auth context
          };

          console.log("Updating schedule estimate:", scheduleData);
          return await marketPurchaseAPI.updateScheduleEstimate(scheduleData);
        })
      );
      console.log("Schedule update results:", scheduleResults);
    }

    if (regularItems.length > 0) {
      // Handle regular items - update site_demands table (existing logic)
      const submitData = {
        selected_ids: regularItems.map(item => item.id),
        estimate_rate: regularItems[0]?.estimate_rate,
        estimate_amount: calculateTotalAmount(regularItems),
        items: regularItems.map(item => ({
          id: item.id,
          estimate_rate: parseFloat(item.estimate_rate),
          estimate_amount: parseFloat(item.estimate_amount),
        })),
      };

      console.log("Updating regular demands:", submitData);
      demandResults = await siteDemandApi.updateEstimatePrices(submitData);
      console.log("Demand update results:", demandResults);
    }

    // Success message
    let successMessage = "Estimates updated successfully!";
    if (scheduleItems.length > 0 && regularItems.length > 0) {
      successMessage = `${scheduleItems.length} schedule(s) and ${regularItems.length} demand(s) updated successfully!`;
    } else if (scheduleItems.length > 0) {
      successMessage = `${scheduleItems.length} schedule(s) updated successfully!`;
    } else if (regularItems.length > 0) {
      successMessage = `${regularItems.length} demand(s) updated successfully!`;
    }

    alert(successMessage);
    
    // Update local state to reflect saved estimates
    setEstimateData(prev => ({
      items: prev.items.map(item => ({
        ...item,
        has_saved_estimate: true // Mark as saved after successful update
      }))
    }));
    setHasSavedEstimates(true);
    
    onClose();
    if (onSubmit) {
      onSubmit(estimateData.items);
    }
  } catch (error) {
    console.error("API Error:", error);
    
    // Handle different error formats
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.errors) {
        // Laravel validation errors
        const errors = errorData.errors;
        const errorMessages = Object.keys(errors).map(key => 
          `${key}: ${errors[key].join(', ')}`
        ).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else if (errorData.message) {
        // General error message
        alert(errorData.message);
      } else {
        alert("An error occurred while updating estimates.");
      }
    } else if (error.message) {
      alert(error.message);
    } else {
      alert("An unexpected error occurred. Please try again.");
    }
  } finally {
    setSubmitting(false);
  }
};

  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ["Type", "Demand No", "Item Code", "Item Name", "Quantity", "Last Purchase Price", "Estimate Rate", "Estimate Amount", "Status"];
      const csvContent = [
        headers.join(","),
        ...estimateData.items.map(item => [
          item.is_schedule_item ? "Schedule" : "Demand",
          item.demand_no,
          `"${item.item_code}"`,
          `"${item.item_name}"`,
          item.scheduled_qty || item.purchase_qty,
          item.last_purchase_price.toFixed(2),
          item.estimate_rate.toFixed(2),
          item.estimate_amount.toFixed(2),
          item.has_saved_estimate ? "Saved" : "Unsaved"
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `estimate_prices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("CSV file exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting to CSV.");
    }
  };

  const calculateTotalAmount = (items = null) => {
    const targetItems = items || estimateData.items;
    return targetItems.reduce((total, item) => total + (item.estimate_amount || 0), 0);
  };

  const countSavedEstimates = () => {
    return estimateData.items.filter(item => item.has_saved_estimate).length;
  };

  const getScheduleItemsCount = () => {
    return estimateData.items.filter(item => item.is_schedule_item).length;
  };

  const getRegularItemsCount = () => {
    return estimateData.items.filter(item => !item.is_schedule_item).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {getScheduleItemsCount() > 0 ? "Update Schedule Estimates" : "Update Estimate Rates"}
            {hasSavedEstimates && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Saved Estimates
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          {estimateData.items.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  {getScheduleItemsCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-700">Schedules:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getScheduleItemsCount()} item(s)
                      </span>
                    </div>
                  )}
                  {getRegularItemsCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Demands:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {getRegularItemsCount()} item(s)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Item Details
                </CardTitle>
                <Button
                  onClick={exportToExcel}
                  variant="success"
                  className="flex items-center gap-2"
                  disabled={loading || estimateData.items.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading items and prices...</p>
                </div>
              ) : estimateData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items loaded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[120px]">Demand No</TableHead>
                        <TableHead>Item Details</TableHead>
                        <TableHead className="w-[100px]">
                          {getScheduleItemsCount() > 0 ? "Scheduled Qty" : "Purchase Qty"}
                        </TableHead>
                        <TableHead className="w-[130px]">Last Price</TableHead>
                        <TableHead className="w-[140px]">Estimate Rate *</TableHead>
                        <TableHead className="w-[130px]">Amount</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimateData.items.map((item) => (
                        <TableRow key={item.id} className={item.has_saved_estimate ? "bg-green-50" : ""}>
                          <TableCell>
                            {item.is_schedule_item ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                Schedule
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                Demand
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.demand_no}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.item_name}</div>
                              {item.item_code && item.item_code !== "N/A" && (
                                <div className="text-sm text-gray-500">
                                  Code: {item.item_code}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.scheduled_qty || item.purchase_qty}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              className="w-20"
                              disabled={submitting}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 text-right">
                              {item.last_purchase_price.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.estimate_rate}
                                onChange={(e) => handleRateChange(item.id, e.target.value)}
                                className="w-24"
                                placeholder="0.00"
                                required
                                disabled={submitting}
                              />
                              {item.has_saved_estimate && (
                                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold">
                              {item.estimate_amount.toFixed(2)}
                            </div>
                            {item.has_saved_estimate && (
                              <div className="text-xs text-green-600 mt-1">Saved</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.has_saved_estimate ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Saved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Unsaved
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Summary Footer */}
                  {estimateData.items.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">Items with saved estimates:</span>
                          <span className="font-semibold text-green-600">
                            {countSavedEstimates()} of {estimateData.items.length}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-700">Total Estimate Amount:</span>
                          <span className="text-xl font-bold text-green-600 ml-3">
                            {calculateTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 pt-4 border-t">
          <Button 
            variant="danger" 
            onClick={onClose} 
            className="flex items-center gap-2"
            disabled={submitting}
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            className="flex items-center gap-2 bg-primary-color hover:bg-primary-color-hover text-white"
            disabled={loading || submitting || estimateData.items.length === 0}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : hasSavedEstimates ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Update Saved Estimates
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Save Estimate Rates
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimatePriceModel;