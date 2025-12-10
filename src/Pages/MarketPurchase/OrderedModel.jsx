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
import { X, ShoppingCart, Building, Calendar, FileText, AlertCircle, Package, DollarSign, MapPin, Barcode } from "lucide-react";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi";

const OrderedModel = ({ isOpen, onClose, onSubmit, selectedItems }) => {
  const [orderedData, setOrderedData] = useState({
    items: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrderedData, setLoadingOrderedData] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [serialNumbers, setSerialNumbers] = useState({}); // { itemId: [serial1, serial2, ...] }

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      initializeOrderedData();
      setSaveSuccess(false);
      setSerialNumbers({});
    }
  }, [isOpen, selectedItems]);

  const initializeOrderedData = async () => {
    setLoadingOrderedData(true);
    try {
      // Auto-detect location from the first selected item
      const firstItem = selectedItems[0];
      const detectedLocation = firstItem?.location || "";
      
      setSelectedLocation(detectedLocation);

      const itemsWithOrderData = await Promise.all(
        selectedItems.map(async (item, index) => {
          // Get received quantity from existing data if available
          let receivedQty = parseFloat(item.received_qty) || 0;
          let actualPurchaseQty = parseFloat(item.actual_purchase_qty) || 
                                parseFloat(item.purchase_qty) || 0;

          // If this is a schedule item, fetch additional data
          if (item.schedule_id) {
            try {
              const scheduleData = await marketPurchaseAPI.getScheduleDetails(item.schedule_id);
              if (scheduleData.success) {
                receivedQty = scheduleData.data.received_qty || receivedQty;
                actualPurchaseQty = scheduleData.data.actual_purchase_qty || actualPurchaseQty;
              }
            } catch (error) {
              console.warn(`Could not fetch schedule details for ${item.schedule_id}:`, error);
            }
          }

          // Check if item is serialized from inventory_items profile
          const isSerialized = item.is_serialized || false;
          console.log('item serial :',isSerialized);

          return {
            id: item.id,
            schedule_id: item.schedule_id,
            demand_no: item.demand_no || `DEM-${item.id}`,
            item_code: item.item_code || item.inventory_item?.item_code || "N/A",
            item_name: item.item_name || item.inventory_item?.item_name || "N/A",
            location: item.location,
            actual_purchase_qty: actualPurchaseQty,
            received_qty: receivedQty,
            pending_qty: Math.max(0, actualPurchaseQty - receivedQty),
            order_status: item.order_status || "Ordered",
            order_remarks: item.order_remarks || "",
            order_date: item.order_date || new Date().toISOString().split('T')[0],
            expected_delivery_date: item.expected_delivery_date || "",
            invoice_no: item.invoice_no || "",
            vendor_name: item.vendor_name || item.vendor?.name || "",
            rate: item.rate || "0",
            purchase_amount: item.purchase_amount || "0",
            invoice_file: item.invoice_file || null,
            is_schedule_item: !!item.schedule_id,
            is_serialized: isSerialized, // Add serialization flag

          };
        })
      );

      setOrderedData({
        items: itemsWithOrderData,
      });
      setValidationErrors({});
    } catch (error) {
      console.error("Error initializing ordered data:", error);
    } finally {
      setLoadingOrderedData(false);
    }
  };

  const handleItemReceivedQtyChange = (itemId, value) => {
    const newReceivedQty = Math.max(0, parseInt(value) || 0);
    
    setOrderedData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          // FIX: Use pending_qty as the maximum limit, not actual_purchase_qty
          const pendingQty = parseFloat(item.pending_qty) || 0;
          const receivedQty = Math.min(newReceivedQty, pendingQty); // Max is pending_qty
          const newPendingQty = Math.max(0, pendingQty - receivedQty);
          
          // Auto-update status based on received quantity
          let newStatus = item.order_status;
          if (receivedQty === 0) {
            newStatus = "Ordered";
          } else if (receivedQty > 0 && receivedQty < pendingQty) {
            newStatus = "Partially Received";
          } else if (receivedQty === pendingQty) {
            newStatus = "Received";
          }
          
          // Clear validation error for this item
          setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[itemId];
            return newErrors;
          });

          // Initialize serial numbers array when received quantity changes
          if (item.is_serialized) {
            setSerialNumbers(prev => {
              const currentSerials = prev[itemId] || [];
              const newSerials = [...currentSerials];
              
              // Adjust serial numbers array based on new received quantity
              if (receivedQty > currentSerials.length) {
                // Add empty slots for new serial numbers
                while (newSerials.length < receivedQty) {
                  newSerials.push("");
                }
              } else if (receivedQty < currentSerials.length) {
                // Remove extra serial numbers
                newSerials.length = receivedQty;
              }
              
              return {
                ...prev,
                [itemId]: newSerials
              };
            });
          }
          
          return { 
            ...item, 
            received_qty: receivedQty,
            //pending_qty: newPendingQty,
            order_status: newStatus
          };
        }
        return item;
      }),
    }));
  };

  const handleSerialNumberChange = (itemId, index, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.map((serial, i) => 
        i === index ? value : serial
      ) || []
    }));
  };

  const handleItemRemarksChange = (itemId, value) => {
    setOrderedData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, order_remarks: value } : item
      ),
    }));
  };

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    setOrderedData((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        location: value
      }))
    }));
  };

  const validateForm = () => {
    const errors = {};

    orderedData.items.forEach((item) => {
      // Validate received quantity is not negative
      if (item.received_qty < 0) {
        errors[item.id] = "Received quantity cannot be negative";
      }

      // FIX: Validate that received quantity doesn't exceed PENDING quantity (not purchased quantity)
      if (item.received_qty > item.pending_qty) {
        errors[item.id] = `Cannot receive more than pending quantity of ${item.pending_qty}`;
      }

      // Validate that received quantity is provided
      if (!item.received_qty || item.received_qty === 0) {
        errors[item.id] = "Received quantity is required";
      }

      // Validate serial numbers for serialized items
      if (item.is_serialized && item.received_qty > 0) {
        const itemSerials = serialNumbers[item.id] || [];
        const emptySerials = itemSerials.filter(serial => !serial.trim()).length;
        
        if (emptySerials > 0) {
          errors[item.id] = `Please enter all ${item.received_qty} serial number(s) for this item`;
        }

        // Check for duplicate serial numbers
        const uniqueSerials = new Set(itemSerials.filter(serial => serial.trim()));
        if (uniqueSerials.size !== itemSerials.filter(serial => serial.trim()).length) {
          errors[item.id] = "Duplicate serial numbers are not allowed";
        }
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

      // Prepare data for bulk receive with serial numbers
      const ordersToSubmit = orderedData.items.map(item => ({
        market_purchase_id: item.id,
        received_qty: item.received_qty || 0,
        notes: item.order_remarks || '',
      
        location: selectedLocation,
      }));

      console.log('Submitting bulk orders with serials:', ordersToSubmit);

      // Call bulk receive API
      const response = await marketPurchaseAPI.receiveBulkOrders({
        orders: ordersToSubmit,
        location: selectedLocation
      });

      if (response.success) {
        setSaveSuccess(true);
        const successMessage = `${response.data.length} order(s) received successfully!`;
        
        // Show success state for 2 seconds before closing
        setTimeout(() => {
          onClose();
          if (onSubmit) {
            onSubmit(response.data);
          }
        }, 2000);
        
      } else {
        if (response.errors && response.errors.length > 0) {
          alert(`Some orders failed:\n${response.errors.join('\n')}`);
        } else {
          alert("Failed to receive orders. Please try again.");
        }
      }
    } catch (error) {
      console.error("Order receive error:", error);
      
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
          alert("An error occurred while receiving orders.");
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

  // Calculate total actual purchase quantity
  const calculateTotalActualQty = () => {
    return orderedData.items.reduce((total, item) => total + (parseFloat(item.actual_purchase_qty) || 0), 0);
  };

  // Calculate total received quantity
  const calculateTotalReceivedQty = () => {
    return orderedData.items.reduce((total, item) => total + (parseFloat(item.received_qty) || 0), 0);
  };

  // Calculate total pending quantity
  const calculateTotalPendingQty = () => {
    return orderedData.items.reduce((total, item) => total + (parseFloat(item.pending_qty) || 0), 0);
  };

  // FIX: Check if received quantity exceeds PENDING quantity (not purchased quantity)
  const hasExceededPendingQty = (item) => {
    const pendingQty = parseFloat(item.pending_qty) || 0;
    const receivedQty = parseFloat(item.received_qty) || 0;
    return receivedQty > pendingQty;
  };
  if (loadingOrderedData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[95vw] h-[90vh]">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading ordered data...</span>
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
                <Package className="h-6 w-6 text-blue-600" />
                Receive Ordered Items
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({orderedData.items.length} items)
                </span>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Summary Card */}
              {orderedData.items.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-700">Total Ordered:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {calculateTotalActualQty().toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-700">Total Received:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {calculateTotalReceivedQty().toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-700">Pending Receipt:</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          {calculateTotalPendingQty().toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-700">Serialized Items:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {orderedData.items.filter(item => item.is_serialized).length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Location Display */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="h-4 w-4" />
                        <span>Delivery Location:</span>
                      </div>
                      <Input
                        value={selectedLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="Enter delivery location..."
                        className="w-64"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ordered Items Table */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Items to Receive ({orderedData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Demand No</TableHead>
                          <TableHead className="whitespace-nowrap">Item Details</TableHead>
                          <TableHead className="whitespace-nowrap">Location</TableHead>
                          <TableHead className="whitespace-nowrap">Ordered Qty</TableHead>
                          <TableHead className="whitespace-nowrap">Received Qty *</TableHead>
                          <TableHead className="whitespace-nowrap">Pending Qty</TableHead>
                          <TableHead className="whitespace-nowrap">Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderedData.items.map((item) => (
                          <React.Fragment key={item.id}>
                            <TableRow className={validationErrors[item.id] ? "bg-red-50" : ""}>
                              <TableCell className="font-mono text-sm whitespace-nowrap">
                                {item.demand_no}
                                {item.is_serialized && (
                                  <Barcode className="h-3 w-3 text-purple-600 inline ml-1" />
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {item.item_name}
                                    {item.is_serialized && (
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                        Serialized
                                      </span>
                                    )}
                                  </div>
                                  {item.item_code && item.item_code !== "N/A" && (
                                    <div className="text-sm text-gray-500">
                                      {item.item_code}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 text-gray-400 inline mr-1" />
                                  {item.location || "Not specified"}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="text-sm text-blue-600 text-center font-medium">
                                  {(item.actual_purchase_qty || 0).toFixed(0)}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="relative">
                                  {/* FIX: Set max to pending_qty instead of actual_purchase_qty */}
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    max={item.pending_qty} // Now using pending_qty as max
                                    value={item.received_qty || 0}
                                    onChange={(e) => handleItemReceivedQtyChange(item.id, e.target.value)}
                                    className={`w-24 ${validationErrors[item.id] ? "border-red-500" : ""}`}
                                    placeholder="0"
                                  />
                                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                                    {/* FIX: Updated to check against pending quantity */}
                                    <div 
                                      className={`w-3 h-3 rounded-full ${
                                        hasExceededPendingQty(item) 
                                          ? "bg-red-500" 
                                          : item.received_qty === item.pending_qty
                                          ? "bg-green-500"
                                          : item.received_qty > 0
                                          ? "bg-yellow-500"
                                          : "bg-gray-400"
                                      }`}
                                      title={
                                        hasExceededPendingQty(item) 
                                          ? "Exceeds pending quantity" 
                                          : item.received_qty === item.pending_qty
                                          ? "Receiving all pending"
                                          : item.received_qty > 0
                                          ? "Partially receiving"
                                          : "Not receiving"
                                      }
                                    />
                                  </div>
                                </div>
                                {validationErrors[item.id] && (
                                  <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {validationErrors[item.id]}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  Max: {item.pending_qty}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="text-sm text-center font-medium">
                                  <span className={
                                    item.pending_qty > 0 
                                      ? "text-orange-600" 
                                      : "text-green-600"
                                  }>
                                    {(item.pending_qty || 0).toFixed(0)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Input
                                  value={item.order_remarks}
                                  onChange={(e) => handleItemRemarksChange(item.id, e.target.value)}
                                  placeholder="Remarks..."
                                  className="w-full text-sm"
                                />
                              </TableCell>
                            </TableRow>
                           
                          </React.Fragment>
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
                disabled={submitting || orderedData.items.length === 0 || Object.keys(validationErrors).length > 0}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Receiving Orders...
                  </>
                ) : saveSuccess ? (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    Orders Received Successfully!
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Receive Orders ({calculateTotalReceivedQty().toFixed(0)})
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

export default OrderedModel;