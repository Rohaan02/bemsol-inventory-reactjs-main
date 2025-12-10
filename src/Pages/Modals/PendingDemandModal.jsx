import { useState, useEffect, useCallback } from "react";
import { X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import purchaseOrderAPI from "../../lib/purchaseOrderApi";

const PendingDemandModal = ({ isOpen, onClose, onSelectItems }) => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    location_id: "",
    demand_date_from: "",
    demand_date_to: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  // Debounce function for search
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch demands when modal opens or filters change
  const fetchDemands = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Filter out empty filters before sending
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      
      console.log("Fetching demands with filters:", cleanFilters);
      console.log("Page:", pagination.current_page);
      
      const response = await purchaseOrderAPI.getPendingPODemand(
        cleanFilters, 
        pagination.current_page, 
        pagination.per_page
      );
      
      console.log("API Response:", response);
      
      // Handle Laravel paginated response
      if (response && response.success !== false) {
        if (response.data) {
          setDemands(response.data);
          setPagination({
            current_page: response.current_page || 1,
            per_page: response.per_page || 15,
            total: response.total || 0,
            last_page: response.last_page || 1
          });
        } 
        else if (Array.isArray(response)) {
          setDemands(response);
          setPagination({
            current_page: 1,
            per_page: pagination.per_page,
            total: response.length,
            last_page: Math.ceil(response.length / pagination.per_page)
          });
        }
      } else {
        toast.error(response?.message || "Failed to fetch pending PO demands");
      }
    } catch (error) {
      console.error("Error fetching pending PO demands:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        toast.error(`Error ${error.response.status}: ${error.response.data?.message || "Failed to load data"}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Failed to load pending PO demands");
      }
      
      setDemands([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, filters, pagination.current_page, pagination.per_page]);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      handleFilterChange("search", value);
    }, 500),
    []
  );

  const handleSearch = (value) => {
    // Update input immediately for better UX
    setFilters(prev => ({ ...prev, search: value }));
    // Trigger debounced filter change
    debouncedSearch(value);
  };

  const handleDateFilter = (fromDate, toDate) => {
    // Ensure toDate is not before fromDate
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      toast.error("To date cannot be before from date");
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      demand_date_from: fromDate,
      demand_date_to: toDate
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSelectItem = (demand, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.id === demand.id);
      if (isSelected) {
        return prev.filter(item => item.id !== demand.id);
      } else {
        return [...prev, demand];
      }
    });
  };

  const handleRowClick = (demand) => {
    handleSelectItem(demand);
  };

  const handleAddSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one demand item");
      return;
    }

    // Transform selected demands to line items format
    const lineItems = selectedItems.map(demand => {
      const isInventory = !!demand.inventory_item_id;
      const itemData = isInventory ? demand.inventoryItem : demand.nonInvenotryItem;
      
      const itemName = itemData?.name || demand.item_name || `Item ${demand.id}`;
      const itemDescription = itemData?.description || demand.item_description || "";
      const itemCode = itemData?.code || demand.demand_number?.replace('DEM-', 'ITEM-') || `ITEM-${demand.id}`;
      const uom = demand.uom || itemData?.uom || "";
      const quantity = demand.fulfillment_types?.[0]?.qty || 0;
      const rate = demand.rate || itemData?.rate || 0;
      
      return {
        id: Date.now() + Math.random(),
        item_id: isInventory ? demand.inventory_item_id?.toString() : demand.non_inventory_item_id?.toString(),
        item_name: itemName,
        item_description: itemDescription,
        item_code: itemCode,
        uom: uom,
        quantity: quantity,
        rate: rate,
        amount: (quantity * rate),
        demand_id: demand.id,
        is_inventory: isInventory
      };
    });

    onSelectItems(lineItems);
    onClose();
    setSelectedItems([]);
    toast.success(`${selectedItems.length} item(s) added to purchase order`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  // Helper functions to extract item data
  const getItemName = (demand) => {
    if (demand.inventoryItem) {
      return demand.inventoryItem.name;
    } else if (demand.nonInvenotryItem) {
      return demand.nonInvenotryItem.name;
    } else if (demand.item_name) {
      return demand.item_name;
    }
    return `Item ${demand.id}`;
  };

  const getItemDescription = (demand) => {
    if (demand.inventoryItem) {
      return demand.inventoryItem.description;
    } else if (demand.nonInvenotryItem) {
      return demand.nonInvenotryItem.description;
    } else if (demand.item_description) {
      return demand.item_description;
    }
    return "";
  };

  const getItemCode = (demand) => {
    if (demand.inventoryItem) {
      return demand.inventoryItem.code;
    } else if (demand.nonInvenotryItem) {
      return demand.nonInvenotryItem.code;
    } else if (demand.demand_number) {
      return demand.demand_number.replace('DEM-', 'ITEM-');
    }
    return `ITEM-${demand.id}`;
  };



  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      location_id: "",
      demand_date_from: "",
      demand_date_to: "",
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col relative z-[10000]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pending PO Demands</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select demand items to add to purchase order
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Search (Demand No, Item Name, Description, etc.)
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by demand number, item name, description..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Searches across demand number, item name, description, and item codes
              </p>
            </div>

            <div>
              <Label htmlFor="date_from" className="text-sm font-medium text-gray-700">
                From Date
              </Label>
              <Input
                id="date_from"
                type="date"
                value={filters.demand_date_from}
                onChange={(e) => handleDateFilter(e.target.value, filters.demand_date_to)}
                className="mt-1 py-2 text-sm"
                max={filters.demand_date_to || undefined}
              />
            </div>

            <div>
              <Label htmlFor="date_to" className="text-sm font-medium text-gray-700">
                To Date
              </Label>
              <Input
                id="date_to"
                type="date"
                value={filters.demand_date_to}
                onChange={(e) => handleDateFilter(filters.demand_date_from, e.target.value)}
                className="mt-1 py-2 text-sm"
                min={filters.demand_date_from || undefined}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {selectedItems.length} item(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="success"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
              <Button
                variant="success"
                type="button"
                onClick={fetchDemands}
                className="flex items-center gap-2 text-white"
              >
                <Search className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Loading demands...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demand ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UOM
                      </th>
                     
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demands.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-8 text-center text-sm text-gray-500">
                          <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No pending PO demands found</p>
                          <p className="text-xs mt-1">Try adjusting your filters or check if there are any demands pending PO fulfillment</p>
                        </td>
                      </tr>
                    ) : (
                      demands.map((demand) => (
                        <tr 
                          key={demand.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedItems.some(item => item.id === demand.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleRowClick(demand)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedItems.some(item => item.id === demand.id)}
                              onChange={(e) => handleSelectItem(demand, e)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {demand.demand_no || `DEM-${demand.id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(demand.required_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{getItemName(demand)}</div>
                              <div className="text-gray-500 text-xs truncate max-w-xs">
                                {getItemDescription(demand)}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Code: {getItemCode(demand)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              demand.inventory_item_id ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {demand.inventory_item_id ? 'Inventory' : 'Non-Inventory'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {demand.fulfillment_types?.[0]?.qty || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {demand.uom || "EA"}
                          </td>
                         
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {demand.location?.name || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Page {pagination.current_page} of {pagination.last_page} • {pagination.total} items
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {pagination.total} demand(s) found • {selectedItems.length} selected
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="danger"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              type="button"
              onClick={handleAddSelected}
              className="text-white"
              disabled={selectedItems.length === 0}
            >
              Add Selected ({selectedItems.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingDemandModal;