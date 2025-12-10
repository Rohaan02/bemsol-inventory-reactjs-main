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
import { X, ShoppingCart, Building, Calendar, FileText, AlertCircle, Package, DollarSign } from "lucide-react";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi";

const PurchaserModel = ({ isOpen, onClose, onSubmit, selectedItems }) => {
  const [purchaseData, setPurchaseData] = useState({
    items: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingRemainingQty, setLoadingRemainingQty] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dropdown options for purchase status
  const purchaseStatusOptions = [
    { value: "Mark Purchase", label: "Mark Purchase" },
    { value: "Ordered", label: "Ordered" },
    { value: "Not Available", label: "Not Available" },
    { value: "Completed", label: "Completed" }
  ];

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      initializePurchaseData();
      setSaveSuccess(false);
    }
  }, [isOpen, selectedItems]);

  const initializePurchaseData = async () => {
    setLoadingRemainingQty(true);
    try {
      const itemsWithRemainingQty = await Promise.all(
        selectedItems.map(async (item) => {
          // Check if this is a schedule item
          const isScheduleItem = item.schedule_id && item.scheduled_qty;
          
          let remainingQty = parseFloat(item.scheduled_qty) || 0;
          let purchasedQty = 0;

          // For schedule items, fetch remaining quantity
          if (isScheduleItem) {
            try {
              const remainingData = await marketPurchaseAPI.getScheduleRemainingQty(item.schedule_id);
              if (remainingData.success) {
                remainingQty = remainingData.data.remaining_qty;
                purchasedQty = remainingData.data.purchased_qty;
              }
            } catch (error) {
              console.warn(`Could not fetch remaining quantity for schedule ${item.schedule_id}:`, error);
            }
          }

          return {
            id: item.id,
            schedule_id: item.schedule_id,
            demand_no: item.demand_no || `DEM-${item.id}`,
            item_code: item.item_code || item.inventory_item?.item_code || "N/A",
            item_name: item.item_name || item.inventory_item?.item_name || "N/A",
            purchase_qty: isScheduleItem ? item.scheduled_qty : (item.purchase_qty || 0),
            scheduled_qty: item.scheduled_qty,
            remaining_qty: remainingQty,
            purchased_qty: purchasedQty,
            approved_qty: item.approved_quantity,
            purchase_status: "Mark Purchase",
            purchaser_remarks: item.purchaser_remarks || "",
            actual_purchase_qty: Math.min(remainingQty, isScheduleItem ? remainingQty : (item.purchase_qty || 0)),
            purchase_amount: "0",
            rate: "0",
            order_date: "",
            invoice_file: null,
            is_schedule_item: isScheduleItem,
          };
        })
      );

      setPurchaseData({
        items: itemsWithRemainingQty,
      });
      setValidationErrors({});
    } catch (error) {
      console.error("Error initializing purchase data:", error);
    } finally {
      setLoadingRemainingQty(false);
    }
  };

  const handleItemActualQtyChange = (itemId, value) => {
    // Remove decimal places and allow only whole numbers
    const newQty = Math.max(0, parseInt(value) || 0);
    
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          // For schedule items, validate against remaining quantity
          if (item.is_schedule_item) {
            const remainingQty = parseFloat(item.remaining_qty) || 0;
            // User cannot exceed remaining quantity
            const actualQty = Math.min(newQty, remainingQty);
            
            // Auto-calculate purchase amount when quantity changes
            const rate = parseFloat(item.rate) || 0;
            const calculatedAmount = (actualQty * rate).toFixed(2);
            
            // Clear validation error for this item
            setValidationErrors(prevErrors => {
              const newErrors = { ...prevErrors };
              delete newErrors[itemId];
              return newErrors;
            });
            
            return { 
              ...item, 
              actual_purchase_qty: actualQty,
              purchase_amount: calculatedAmount
            };
          } else {
            // For non-schedule items, use the value as is
            const rate = parseFloat(item.rate) || 0;
            const calculatedAmount = (newQty * rate).toFixed(2);
            
            return { 
              ...item, 
              actual_purchase_qty: newQty,
              purchase_amount: calculatedAmount
            };
          }
        }
        return item;
      }),
    }));
  };

  const handleItemRateChange = (itemId, value) => {
    // Allow decimal for rate
    const rate = parseFloat(value) || 0;
    
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          // Auto-calculate purchase amount when rate changes
          const actualQty = parseFloat(item.actual_purchase_qty) || 0;
          const calculatedAmount = (actualQty * rate).toFixed(2);
          
          return { 
            ...item, 
            rate: rate,
            purchase_amount: calculatedAmount
          };
        }
        return item;
      }),
    }));
  };

  const handleItemAmountChange = (itemId, value) => {
    // Allow decimal for amount
    const amount = parseFloat(value) || 0;
    
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          return { 
            ...item, 
            purchase_amount: amount
          };
        }
        return item;
      }),
    }));
  };

  const handleItemRemarksChange = (itemId, value) => {
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, purchaser_remarks: value } : item
      ),
    }));
  };

  const handleItemStatusChange = (itemId, value) => {
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { 
          ...item, 
          purchase_status: value,
          order_date: value !== "Ordered" ? "" : item.order_date,
          invoice_file: value !== "Ordered" ? null : item.invoice_file
        } : item
      ),
    }));
  };

  const handleOrderDateChange = (itemId, value) => {
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, order_date: value } : item
      ),
    }));
  };

  const handleInvoiceFileChange = (itemId, file) => {
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, invoice_file: file } : item
      ),
    }));
  };

  const validateForm = () => {
    const errors = {};

    purchaseData.items.forEach((item) => {
      // Validate actual purchase quantity is not negative
      if (item.actual_purchase_qty < 0) {
        errors[item.id] = "Actual purchase quantity cannot be negative";
      }

      // Validate that quantity is not zero
      if (item.actual_purchase_qty <= 0) {
        errors[item.id] = "Actual purchase quantity must be greater than 0";
      }

      // For schedule items, validate against remaining quantity
      if (item.is_schedule_item && item.actual_purchase_qty > item.remaining_qty) {
        errors[item.id] = `Cannot exceed remaining quantity of ${item.remaining_qty}`;
      }

      // Validate purchase amount is not negative
      if (item.purchase_amount < 0) {
        errors[item.id] = "Purchase amount cannot be negative";
      }

      // Validate purchase amount is provided
      if (!item.purchase_amount || item.purchase_amount <= 0) {
        errors[item.id] = "Purchase amount is required";
      }

      // Validate ordered items have date
      if (item.purchase_status === "Ordered" && !item.order_date) {
        errors[item.id] = "Order date is required for 'Ordered' status";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setSaveSuccess(false);

      const purchasePromises = purchaseData.items.map(async (item) => {
        const formData = new FormData();

        formData.append('purchase_schedule_id', item.schedule_id);
        formData.append('actual_purchase_qty', item.actual_purchase_qty || 0);
        formData.append('purchase_amount', item.purchase_amount || 0);
        formData.append('purchase_status', item.purchase_status);
        formData.append('purchaser_remarks', item.purchaser_remarks || '');
        
        if (item.order_date) {
          formData.append('order_date', item.order_date);
        }

        if (item.invoice_file) {
          formData.append('order_image', item.invoice_file);
        }

        return await marketPurchaseAPI.createMarketPurchase(formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      });

      const results = await Promise.all(purchasePromises);
      
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        setSaveSuccess(true);
        const successMessage = `${purchaseData.items.length} market purchase record(s) created successfully!`;
        
        // Show success state for 2 seconds before closing
        setTimeout(() => {
          onClose();
          if (onSubmit) {
            onSubmit(results);
          }
        }, 2000);
        
      } else {
        const failedCount = results.filter(result => !result.success).length;
        alert(`${failedCount} purchase record(s) failed to create. Please try again.`);
      }
    } catch (error) {
      console.error("Purchase creation error:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = Object.keys(errors).map(key => 
            `${key}: ${errors[key].join(', ')}`
          ).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else if (errorData.message) {
          alert(errorData.message);
        } else {
          alert("An error occurred while creating purchase records.");
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

  // Helper function to check if status is "Ordered"
  const isOrderedStatus = (status) => status === "Ordered";

  // Calculate total remaining quantity
  const calculateTotalRemainingQty = () => {
    return purchaseData.items.reduce((total, item) => total + (parseFloat(item.remaining_qty) || 0), 0);
  };

  // Calculate total actual purchase quantity
  const calculateTotalActualQty = () => {
    return purchaseData.items.reduce((total, item) => total + (parseFloat(item.actual_purchase_qty) || 0), 0);
  };

  // Calculate total purchased quantity
  const calculateTotalPurchasedQty = () => {
    return purchaseData.items.reduce((total, item) => total + (parseFloat(item.purchased_qty) || 0), 0);
  };

  // Calculate total purchase amount
  const calculateTotalPurchaseAmount = () => {
    return purchaseData.items.reduce((total, item) => total + (parseFloat(item.purchase_amount) || 0), 0);
  };

  // Check if actual quantity exceeds remaining quantity
  const hasExceededRemainingQty = (item) => {
    if (!item.is_schedule_item) return false;
    const remainingQty = parseFloat(item.remaining_qty) || 0;
    const actualQty = parseFloat(item.actual_purchase_qty) || 0;
    return actualQty > remainingQty;
  };

  if (loadingRemainingQty) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[95vw] h-[90vh]">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Loading purchase data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="h-6 w-6 text-green-600" />
                Create Market Purchase 
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({purchaseData.items.filter(item => item.is_schedule_item).length} schedules)
                </span>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Summary Card */}
              {purchaseData.items.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-700">Total Remaining Qty:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {calculateTotalRemainingQty().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-700">Total New Purchase:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {calculateTotalActualQty().toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-700">Total Amount:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          ${calculateTotalPurchaseAmount().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Already Purchased:</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {calculateTotalPurchasedQty().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Items:</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {purchaseData.items.length}
                        </span>
                      </div>
                    </div>
                    {purchaseData.items.some(item => item.is_schedule_item) && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>For schedule items: You can only purchase the remaining quantity.</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Items Table */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Purchase Items ({purchaseData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Demand No</TableHead>
                          <TableHead className="whitespace-nowrap">Item Details</TableHead>
                          <TableHead className="whitespace-nowrap">Already Purchased</TableHead>
                          <TableHead className="whitespace-nowrap">Remaining Qty</TableHead>
                          <TableHead className="whitespace-nowrap">Purchase Qty *</TableHead>
                          <TableHead className="whitespace-nowrap">Rate</TableHead>
                          <TableHead className="whitespace-nowrap">Purchase Amount *</TableHead>
                          <TableHead className="whitespace-nowrap">Purchase Status</TableHead>
                          <TableHead className="whitespace-nowrap">Remarks</TableHead>
                          <TableHead className="whitespace-nowrap">Order Date</TableHead>
                          <TableHead className="whitespace-nowrap">Invoice</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseData.items.map((item) => (
                          <TableRow key={item.id} className={validationErrors[item.id] ? "bg-red-50" : ""}>
                            <TableCell className="font-mono text-sm whitespace-nowrap">
                              {item.demand_no}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div>
                                <div className="font-medium">{item.item_name}</div>
                                {item.item_code && item.item_code !== "N/A" && (
                                  <div className="text-sm text-gray-500">
                                    {item.item_code}
                                  </div>
                                )}
                                {item.is_schedule_item && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Schedule Item
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm text-gray-600 text-center">
                                <Package className="h-4 w-4 text-gray-400 inline mr-1" />
                                {(item.purchased_qty || 0).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm text-blue-600 text-center font-medium">
                                {(item.remaining_qty || 0).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  max={item.is_schedule_item ? item.remaining_qty : undefined}
                                  value={item.actual_purchase_qty || 0}
                                  onChange={(e) => handleItemActualQtyChange(item.id, e.target.value)}
                                  className={`w-20 ${validationErrors[item.id] ? "border-red-500" : ""}`}
                                  placeholder="0"
                                />
                                {item.is_schedule_item && (
                                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                                    <div 
                                      className={`w-3 h-3 rounded-full ${
                                        hasExceededRemainingQty(item) 
                                          ? "bg-red-500" 
                                          : "bg-green-500"
                                      }`}
                                      title={hasExceededRemainingQty(item) 
                                        ? "Exceeds remaining quantity" 
                                        : "Within remaining quantity"
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                              {validationErrors[item.id] && (
                                <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {validationErrors[item.id]}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="relative w-[110px]">
                              
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={item.rate || 0}
                                  onChange={(e) => handleItemRateChange(item.id, e.target.value)}
                                  className="w-20 pl-6"
                                  placeholder="0.00"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="relative">
                               
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.purchase_amount || 0}
                                  onChange={(e) => handleItemAmountChange(item.id, e.target.value)}
                                  className={`w-24 pl-6 ${validationErrors[item.id] ? "border-red-500" : ""}`}
                                  placeholder="0.00"
                                  readOnly
                                />
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <select
                                value={item.purchase_status}
                                onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              >
                                {purchaseStatusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Input
                                value={item.purchaser_remarks}
                                onChange={(e) => handleItemRemarksChange(item.id, e.target.value)}
                                placeholder="Purchase remarks..."
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {isOrderedStatus(item.purchase_status) ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <Input
                                    type="date"
                                    value={item.order_date}
                                    onChange={(e) => handleOrderDateChange(item.id, e.target.value)}
                                    className="w-32"
                                    required
                                  />
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm text-center">-</div>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {isOrderedStatus(item.purchase_status) ? (
                                <div className="flex flex-col gap-1">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => handleInvoiceFileChange(item.id, e.target.files[0])}
                                    className="w-full"
                                  />
                                  {item.invoice_file && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <FileText className="h-3 w-3" />
                                      {item.invoice_file.name}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm text-center">-</div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-white">
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button 
                variant="danger" 
                onClick={onClose} 
                className="flex items-center gap-2"
                disabled={submitting}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                className="text-white flex items-center gap-2"
                disabled={submitting || purchaseData.items.length === 0 || Object.keys(validationErrors).length > 0}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Purchase...
                  </>
                ) : saveSuccess ? (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    Purchase Created Successfully!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Create Purchase Records
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaserModel;