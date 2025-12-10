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
import { X, ShoppingCart, Building, Loader2 } from "lucide-react";
import siteDemandApi from "@/lib/siteDemandApi";
import marketPurchaseApi from "../../lib/MarketPurchaseApi";

const ItemPurchaseModel = ({ isOpen, onClose, onSubmit, selectedItems, locations }) => {
  const [purchaseData, setPurchaseData] = useState({
    delivery_location: "",
    items: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarketPurchaseData = async () => {
      if (isOpen && selectedItems.length > 0) {
        setLoading(true);
        try {
          const initializedItems = await Promise.all(
            selectedItems.map(async (item) => {
              let marketPurchaseQty = 0;
              let alreadyPurchasedQty = 0;
              let remainingQty = 0;
              
              // Fetch market purchase fulfillment data for this demand ID
              try {
                const fulfillmentData = await marketPurchaseApi.getMarketPurchaseFulfillmentTypes(item.id);
                console.log(`Market purchase data for demand ${item.id}:`, fulfillmentData);
                
                // Calculate total market purchase quantity for this demand
                if (fulfillmentData && Array.isArray(fulfillmentData)) {
                  marketPurchaseQty = fulfillmentData.reduce((total, fulfillment) => {
                    // Only sum quantities where type is 'market_purchase'
                    if (fulfillment.type === 'market_purchase') {
                      return total + parseFloat(fulfillment.qty || 0);
                    }
                    return total;
                  }, 0);
                }

                // Get already purchased quantity from the item data
                alreadyPurchasedQty = parseFloat(item.purchase_qty) || 0;
                
                // Calculate remaining quantity available for purchase
                remainingQty = marketPurchaseQty - alreadyPurchasedQty;
                
                console.log(`Demand ${item.id}:`, {
                  marketPurchaseAllocation: marketPurchaseQty,
                  alreadyPurchased: alreadyPurchasedQty,
                  remainingAvailable: remainingQty
                });

              } catch (error) {
                console.error(`Error fetching market purchase data for demand ${item.id}:`, error);
              }

              return {
                id: item.id,
                demand_no: item.demand_no || item.id,
                item_code: item.inventory_item?.item_code || "N/A",
                item_name: item.item_name || "N/A",
                purchase_qty: remainingQty > 0 ? remainingQty : 0, // Set to remaining quantity, not total allocation
                market_purchase_qty: marketPurchaseQty, // Total allocation
                already_purchased_qty: alreadyPurchasedQty, // Already purchased
                remaining_qty: remainingQty, // Available for purchase
              };
            })
          );

          // Show values in console
          console.log("Final purchase data:", initializedItems);
          initializedItems.forEach((row) => {
            console.log(`Demand ${row.demand_no}:`, {
              "Total Market Purchase Allocation": row.market_purchase_qty,
              "Already Purchased": row.already_purchased_qty,
              "Remaining Available": row.remaining_qty,
              "Purchase Qty set to": row.purchase_qty
            });
          });

          setPurchaseData((prev) => ({
            ...prev,
            items: initializedItems,
          }));
        } catch (error) {
          console.error("Error fetching market purchase data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMarketPurchaseData();
  }, [isOpen, selectedItems]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPurchaseData({
        delivery_location: "",
        items: [],
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setPurchaseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemQtyChange = (itemId, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setPurchaseData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          // Don't allow purchase quantity to exceed remaining available quantity
          const maxAllowed = item.remaining_qty || 0;
          return { 
            ...item, 
            purchase_qty: Math.min(qty, maxAllowed) 
          };
        }
        return item;
      }),
    }));
  };

  const handleSubmit = async () => {
    if (!purchaseData.delivery_location) {
      alert("Please select a delivery location");
      return;
    }

    // Validate that purchase quantities don't exceed remaining available quantities
    const invalidItems = purchaseData.items.filter(item => 
      item.purchase_qty > item.remaining_qty
    );

    if (invalidItems.length > 0) {
      alert("Purchase quantity cannot exceed remaining available quantity");
      return;
    }

    if (purchaseData.items.some(item => item.purchase_qty <= 0)) {
      alert("All purchase quantities must be greater than 0");
      return;
    }

    // Calculate total purchase quantities (new purchase + already purchased)
    const itemsWithTotalPurchase = purchaseData.items.map(item => ({
      ...item,
      total_purchase_qty: (item.already_purchased_qty || 0) + item.purchase_qty
    }));

    const submitData = {
      delivery_location: purchaseData.delivery_location,
      items: itemsWithTotalPurchase.map(item => ({
        id: item.id,
        purchase_qty: item.total_purchase_qty // Send the cumulative total
      })),
      selected_ids: selectedItems.map(item => item.id),
    };

    console.log("Submitting purchase data:", submitData);

    try {
      const response = await marketPurchaseApi.storePurchaeSchedule(submitData);
      if (response.success) {
        alert("Purchase scheduled successfully!");
        onSubmit?.(purchaseData);
        onClose();
      } else {
        alert("Schedule failed, please try again.");
      }
    } catch (error) {
      console.error("Schedule error:", error);
      alert("An error occurred while scheduling purchase.");
    }
  };

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name || `Location ${location.id}`,
  }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      fontSize: "14px",
    }),
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Schedule Purchase 
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading purchase data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Schedule Market Purchase 
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Delivery Location *
            </label>
            <Select
              options={locationOptions}
              value={
                locationOptions.find(
                  (opt) => opt.value === purchaseData.delivery_location
                ) || null
              }
              onChange={(option) =>
                handleInputChange("delivery_location", option?.value || "")
              }
              placeholder="Select delivery location"
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Market Purchase Items ({selectedItems.length})
              </CardTitle>
              <p className="text-sm text-gray-600">
                Purchase quantities are pre-filled with remaining available quantities
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demand No</TableHead>
                      <TableHead>Item Code/Name</TableHead>
                      <TableHead>Total Allocation</TableHead>
                      <TableHead>Already Purchased</TableHead>
                      <TableHead>Available Qty</TableHead>
                      <TableHead>Purchase Qty *</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.demand_no}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            {item.item_code && item.item_code !== "N/A" && (
                              <div className="text-sm text-gray-500">
                                {item.item_code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-semibold text-blue-600">
                            {item.market_purchase_qty || 0}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-semibold text-gray-600">
                            {item.already_purchased_qty || 0}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <span className={`font-semibold ${
                            item.remaining_qty > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.remaining_qty || 0}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.remaining_qty}
                            value={item.purchase_qty}
                            onChange={(e) =>
                              handleItemQtyChange(item.id, e.target.value)
                            }
                            className="w-24"
                            title={`Maximum available: ${item.remaining_qty}`}
                          />
                          {item.remaining_qty > 0 ? (
                            <div className="text-xs text-gray-500 mt-1">
                              Max: {item.remaining_qty}
                            </div>
                          ) : (
                            <div className="text-xs text-red-500 mt-1">
                              No quantity available
                            </div>
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

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="danger" onClick={onClose} className="flex items-center gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!purchaseData.delivery_location || purchaseData.items.some(item => item.purchase_qty <= 0)}
            className="text-white flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Schedule Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPurchaseModel;