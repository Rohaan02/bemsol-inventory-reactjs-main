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
import Select from "react-select";
import { X, ShoppingCart, Building, Package, FileText, CheckCircle, AlertCircle } from "lucide-react";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi";
import vendorAPI from "@/lib/vendorApi";

const GenerateOrderMPNModel = ({ isOpen, onClose, selectedItems, onSubmit }) => {
  const [purchaseData, setPurchaseData] = useState({
    vendor: null,
    items: [],
    description: "",
    final_remarks: "",
    invoice_attachment: [],
    mpn_date: new Date().toISOString().split('T')[0]
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      initializeData();
    }
  }, [isOpen, selectedItems]);

  const initializeData = async () => {
    try {
      // Load selected items with received quantities
      const items = selectedItems.map(item => {
        const actualPurchaseQty = parseFloat(item.actual_purchase_qty) || 0;
        const receivedQty = parseFloat(item.received_qty) || 0;
        const isFullyReceived = receivedQty === actualPurchaseQty;
        
        return {
          id: item.id,
          purchase_schedule_id: item.purchase_schedule_id || item.id,
          demand_no: item.demand_no || "N/A",
          item_name: item.item_name || "N/A",
          item_code: item.item_code || "N/A",
          scheduled_qty: item.purchase_qty || 0,
          actual_purchase_qty: actualPurchaseQty,
          received_qty: receivedQty,
          pending_qty: Math.max(0, actualPurchaseQty - receivedQty),
          price: item.rate || item.price || 0,
          purchase_amount: receivedQty * (item.rate || item.price || 0),
          purchase_status: item.purchase_status || "Received",
          is_fully_received: isFullyReceived,
          latest_receive_date: item.latest_receive_date,
          receive_history_count: item.receive_history_count || 0,
        };
      });

      setPurchaseData(prev => ({ 
        ...prev, 
        items,
        mpn_date: new Date().toISOString().split('T')[0]
      }));

      // Fetch vendor options
      await fetchVendors();
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const vendorsData = await vendorAPI.getCashVendor();
      const options = vendorsData.map(v => ({ 
        value: v.id, 
        label: v.name,
        ...v 
      }));
      setVendors(options);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setPurchaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setPurchaseData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { 
            ...item, 
            [field]: field === 'price' ? parseFloat(value) || 0 : value 
          };
          
          // Auto-calculate purchase_amount when price changes
          if (field === 'price') {
            updatedItem.purchase_amount = updatedItem.received_qty * updatedItem.price;
          }
          
          return updatedItem;
        }
        return item;
      }),
    }));

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setPurchaseData(prev => ({ ...prev, invoice_attachment: files }));
  };

  const validateForm = () => {
    const errors = {};

    if (!purchaseData.vendor) {
      errors.vendor = "Please select a vendor";
    }

    if (!purchaseData.mpn_date) {
      errors.date = "Please select MPN date";
    }

   

    // Validate prices
    purchaseData.items.forEach(item => {
      if (item.price <= 0) {
        errors[item.id] = "Price must be greater than 0";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const payload = {
        vendor_id: purchaseData.vendor.value,
        mpn_date: purchaseData.mpn_date,
        market_purchase_ids: purchaseData.items.map(item => item.id),
        items: purchaseData.items.map(item => ({
          market_purchase_id: item.id,
          purchase_schedule_id: item.purchase_schedule_id,
          actual_purchase_qty: item.received_qty, // Use received quantity for MPN
          rate: item.price,
          amount: item.purchase_amount,
          description: purchaseData.description,
          remarks: purchaseData.final_remarks,
        })),
        description: purchaseData.description,
        final_remarks: purchaseData.final_remarks,
        is_order_mpn: true, // Flag to indicate this is for received orders
      };

      // Call MPN generation API
      const res = await marketPurchaseAPI.generateMPN(payload);
      
      if (res.success) {
        const successMessage = `MPN Generated Successfully: ${res.mpn_no || res.data?.mpn_no}`;
        alert(successMessage);
        
        if (onSubmit) {
          onSubmit(res.data);
        }
        onClose();
      } else {
        alert(res.message || "Failed to generate MPN");
      }
    } catch (err) {
      console.error("MPN Generation Error:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Error generating MPN. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return purchaseData.items.reduce((total, item) => total + item.purchase_amount, 0);
  };

  const calculateTotalReceived = () => {
    return purchaseData.items.reduce((total, item) => total + item.received_qty, 0);
  };

  const customSelectStyles = {
    control: (base) => ({ 
      ...base, 
      minHeight: 40, 
      fontSize: 14,
      borderColor: validationErrors.vendor ? '#ef4444' : '#d1d5db',
      '&:hover': {
        borderColor: validationErrors.vendor ? '#ef4444' : '#9ca3af'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#dcfce7' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
    })
  };

  // Check if all items are fully received
  const allItemsFullyReceived = purchaseData.items.every(item => item.is_fully_received);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Generate MPN for Received Orders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Alert */}
          {!allItemsFullyReceived && (
            <></>
          )}

          {validationErrors.receipt && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{validationErrors.receipt}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vendor and Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vendor *</label>
              <Select
                options={vendors}
                value={purchaseData.vendor}
                onChange={opt => handleInputChange("vendor", opt)}
                placeholder="Select vendor"
                styles={customSelectStyles}
                isSearchable
              />
              {validationErrors.vendor && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.vendor}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">MPN Date *</label>
              <Input
                type="date"
                value={purchaseData.mpn_date}
                onChange={e => handleInputChange("mpn_date", e.target.value)}
                className={`w-full ${validationErrors.date ? 'border-red-500' : ''}`}
              />
              {validationErrors.date && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.date}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Received Items ({purchaseData.items.length})
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-green-600">
                    Total Received: {calculateTotalReceived().toFixed(0)}
                  </div>
                  <div className="text-blue-600 font-medium">
                    Total Amount: {calculateTotalAmount().toFixed(2)}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demand No</TableHead>
                      <TableHead>Item Details</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Received Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price *</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseData.items.map(item => (
                      <TableRow key={item.id} className={
                        item.is_fully_received ? 'bg-green-50' : 'bg-yellow-50'
                      }>
                        <TableCell className="font-medium">
                          {item.demand_no}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            {item.item_code && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Code: {item.item_code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-blue-100 px-2 py-1 rounded text-sm">
                            {item.actual_purchase_qty}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            item.is_fully_received ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.received_qty}
                            {item.receive_history_count > 1 && (
                              <div className="text-xs text-gray-500">
                                ({item.receive_history_count} receipts)
                              </div>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.is_fully_received ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 text-sm">Fully Received</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <span className="text-yellow-700 text-sm">Pending: {item.pending_qty}</span>
                              </>
                            )}
                          </div>
                          {item.latest_receive_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last: {new Date(item.latest_receive_date).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.price}
                            onChange={e => handleItemChange(item.id, "price", e.target.value)}
                            className={`w-28 ${validationErrors[item.id] ? 'border-red-500' : ''}`}
                            placeholder="0.00"
                          />
                          {validationErrors[item.id] && (
                            <div className="text-xs text-red-500 mt-1">
                              {validationErrors[item.id]}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-green-700">
                          {item.purchase_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Description, Remarks & Invoice */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={purchaseData.description}
                  onChange={e => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter purchase description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  rows={3}
                  value={purchaseData.final_remarks}
                  onChange={e => handleInputChange("final_remarks", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter any remarks..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Invoice Attachment (Optional)
              </label>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 pt-4 border-t">
          <Button 
            variant="danger" 
            onClick={onClose} 
            className="flex items-center gap-2 border-gray-300"
            disabled={loading}
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !purchaseData.vendor }
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:bg-gray-400"
          >
            <ShoppingCart className="h-4 w-4" />
            {loading ? "Generating MPN..." : "Generate MPN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateOrderMPNModel;