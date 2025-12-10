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
import { X, ShoppingCart, Building, Package, FileText } from "lucide-react";
import marketPurchaseAPI from "@/lib/MarketPurchaseApi";
import vendorAPI from "@/lib/vendorApi";

const MarketPurchaseNoteModel = ({ isOpen, onClose, selectedItems }) => {
  const [purchaseData, setPurchaseData] = useState({
    vendor: null,
    items: [],
    description: "",
    final_remarks: "",
    invoice_attachment: [],
    mpn_date: new Date().toISOString().split('T')[0] // Default to today
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      // Load selected items with all required fields
      const items = selectedItems.map(item => ({
        id: item.id, // Market purchase ID
        purchase_schedule_id: item.purchase_schedule_id || item.id,
        demand_no: item.demand_no || "N/A",
        item_name: item.item_name || "N/A",
        item_code: item.item_code || "N/A",
        scheduled_qty: item.purchase_qty || 0, // Original scheduled quantity
        actual_purchase_qty: item.actual_purchase_qty || item.purchase_qty || 0, // Can be edited, can be more than scheduled
        price: item.rate || item.price || 0,
        purchase_amount: (item.actual_purchase_qty || item.purchase_qty || 0) * (item.rate || item.price || 0),
        purchase_status: item.purchase_status || "Mark Purchase"
      }));

      setPurchaseData(prev => ({ 
        ...prev, 
        items,
        mpn_date: new Date().toISOString().split('T')[0] // Reset date when modal opens
      }));

      // Fetch vendor options
      fetchVendors();
    }
  }, [isOpen, selectedItems]);

  const fetchVendors = async () => {
    try {
      const vendorsData = await vendorAPI.getCashVendor();
      console.log('vendorsData', vendorsData);
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
            [field]: field === 'actual_purchase_qty' || field === 'price' ? parseFloat(value) || 0 : value 
          };
          
          // Auto-calculate purchase_amount when qty or price changes
          if (field === 'actual_purchase_qty' || field === 'price') {
            updatedItem.purchase_amount = updatedItem.actual_purchase_qty * updatedItem.price;
          }
          
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setPurchaseData(prev => ({ ...prev, invoice_attachment: files }));
  };

  const validateForm = () => {
    if (!purchaseData.vendor) {
      alert("Please select a vendor");
      return false;
    }

    if (!purchaseData.mpn_date) {
      alert("Please select MPN date");
      return false;
    }

    for (const item of purchaseData.items) {
      if (item.actual_purchase_qty <= 0) {
        alert(`Purchase quantity must be greater than 0 for item: ${item.item_name}`);
        return false;
      }
      if (item.price <= 0) {
        alert(`Price must be greater than 0 for item: ${item.item_name}`);
        return false;
      }
    }

    return true;
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
          actual_purchase_qty: item.actual_purchase_qty,
          rate: item.price,
          amount: item.purchase_amount,
          description: purchaseData.description,
          remarks: purchaseData.final_remarks,
        })),
        description: purchaseData.description,
        final_remarks: purchaseData.final_remarks,
        // invoice_attachment will be handled separately if needed
      };

      // Call your MPN generation API
      const res = await marketPurchaseAPI.generateMPN(payload);
      
      if (res.success) {
        alert(`MPN Generated Successfully: ${res.mpn_no}`);
        onClose();
        // You might want to refresh the parent component data here
      } else {
        alert(res.message || "Failed to generate MPN");
      }
    } catch (err) {
      console.error("MPN Generation Error:", err);
      alert("Error generating MPN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return purchaseData.items.reduce((total, item) => total + item.purchase_amount, 0);
  };

  const customSelectStyles = {
    control: (base) => ({ 
      ...base, 
      minHeight: 40, 
      fontSize: 14,
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#dcfce7' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Generate Market Purchase Note (MPN)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">MPN Date *</label>
              <Input
                type="date"
                value={purchaseData.mpn_date}
                onChange={e => handleInputChange("mpn_date", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Selected Items ({selectedItems.length})
                </div>
                <div className="text-sm font-normal text-green-600">
                  Total Amount: ${calculateTotalAmount().toFixed(2)}
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
                      <TableHead>Scheduled Qty</TableHead>
                      <TableHead>Purchase Qty *</TableHead>
                      <TableHead>Price *</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseData.items.map(item => (
                      <TableRow key={item.id}>
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
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {item.scheduled_qty}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.actual_purchase_qty}
                            onChange={e => handleItemChange(item.id, "actual_purchase_qty", e.target.value)}
                            className="w-28"
                            placeholder="Enter qty"
                            readOnly
                          />
                          {item.actual_purchase_qty > item.scheduled_qty && (
                            <div className="text-xs text-orange-600 mt-1">
                              +{(item.actual_purchase_qty - item.scheduled_qty).toFixed(2)} extra
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.price}
                            onChange={e => handleItemChange(item.id, "price", e.target.value)}
                            className="w-28"
                            placeholder="0.00"
                            
                          />
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
            disabled={loading || !purchaseData.vendor || purchaseData.items.length === 0}
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

export default MarketPurchaseNoteModel;