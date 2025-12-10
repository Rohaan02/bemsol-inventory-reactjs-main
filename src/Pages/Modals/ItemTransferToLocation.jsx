// components/Modals/ItemTransferToLocation.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader, Building } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import inventoryTransferAPI from '@/lib/InventoryTransferAPI';
import locationAPI from '@/lib/locationAPI';

const ItemTransferToLocation = ({ isOpen, onClose, item, fromLocation, onTransferSuccess }) => {
  const [formData, setFormData] = useState({
    transferQty: '',
    toLocation: '',
    remarks: '',
    transferDate: new Date().toISOString().split('T')[0]
  });

  const [locations, setLocations] = useState([]);
  const [availableQty, setAvailableQty] = useState(0);
  const [locationStocks, setLocationStocks] = useState({}); // { locationId: stockQty }
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);

  // React Select custom styles with location stock display
  const customStyles = {
    control: (base) => ({
      ...base,
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      minHeight: '42px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#f0fdf4' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:active': {
        backgroundColor: '#16a34a'
      }
    })
  };

  // Format option label to show stock quantity
  const formatOptionLabel = (option) => {
    const stock = locationStocks[option.value] || 0;
    return (
      <div className="flex justify-between items-center">
        <span>{option.label}</span>
        <span className={`text-sm ${stock > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          Stock: {stock} units
        </span>
      </div>
    );
  };

  // Fetch locations and stock data
  // Fetch locations and stock data
useEffect(() => {
  const fetchData = async () => {
    if (isOpen && item && fromLocation) {
      try {
        setLocationsLoading(true);
        setStockLoading(true);

        console.log('🔧 DEBUG: fromLocation object:', fromLocation);
        console.log('🔧 DEBUG: fromLocation.id (pivot ID):', fromLocation?.id);
        console.log('🔧 DEBUG: fromLocation.location_id (actual location ID):', fromLocation?.location_id);

        // Fetch all locations
        const allLocations = await locationAPI.getAll();
        console.log('🔧 DEBUG: All locations from API:', allLocations);

        // Filter out current location using location_id (from locations table)
        const availableLocations = allLocations
          .filter(loc => {
            if (!loc || !loc.id) return false;
            if (!fromLocation || !fromLocation.location_id) return true;
            
            // Compare with location_id from pivot table, not the pivot id
            const shouldExclude = String(loc.id) === String(fromLocation.location_id);
            console.log(`🔧 DEBUG: Comparing location ${loc.id} with fromLocation.location_id ${fromLocation.location_id} - exclude: ${shouldExclude}`);
            
            return !shouldExclude;
          })
          .map(loc => ({
            value: loc.id,
            label: loc.name
          }));

        console.log('🔧 DEBUG: Available locations after filter:', availableLocations);
        setLocations(availableLocations);

        // Fetch current stock for source location - use location_id here too
        if (item.id && fromLocation.location_id) {
          const stockData = await inventoryTransferAPI.getStock(item.id, fromLocation.location_id);
          console.log("Stock API Response:", stockData);
          setAvailableQty(stockData.current_stock || 0);
        }

        // Fetch stock for all destination locations
        await fetchLocationStocks(item.id, availableLocations);

        // Reset form
        setFormData({
          transferQty: '',
          toLocation: '',
          remarks: '',
          transferDate: new Date().toISOString().split('T')[0]
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load transfer data');
      } finally {
        setLocationsLoading(false);
        setStockLoading(false);
      }
    }
  };

  fetchData();
}, [isOpen, item, fromLocation]);


  // Fetch stock quantities for all locations
   // In your fetchLocationStocks function, add detailed logging:
const fetchLocationStocks = async (itemId, locationOptions) => {
  try {
    const locationIds = locationOptions.map(loc => loc.value);
    console.log('Fetching stocks for locations:', locationIds);
    
    // Use the new API method to get stock for multiple locations
    const stocks = await inventoryTransferAPI.getStockMultipleLocations(itemId, locationIds);
    console.log('Stock API Response:', stocks);
    
    // Convert array to object for easy lookup
    const stockMap = {};
    stocks.forEach(stock => {
      console.log(`Location ${stock.location_id}: ${stock.current_stock} units`);
      stockMap[stock.location_id] = stock.current_stock || 0;
    });
    
    console.log('Final stock map:', stockMap);
    setLocationStocks(stockMap);
  } catch (error) {
    console.error('Error fetching location stocks:', error);
    // Fallback: fetch stock for each location individually
    await fetchLocationStocksIndividual(itemId, locationOptions);
  }
};

  // Fallback method to fetch stock for each location individually
  const fetchLocationStocksIndividual = async (itemId, locationOptions) => {
    const stockMap = {};
    
    // Fetch stock for each location
    await Promise.all(
      locationOptions.map(async (location) => {
        try {
          const stockData = await inventoryTransferAPI.getStock(itemId, location.value);
          stockMap[location.value] = stockData.current_stock || 0;
        } catch (error) {
          console.error(`Error fetching stock for location ${location.value}:`, error);
          stockMap[location.value] = 0;
        }
      })
    );
    
    setLocationStocks(stockMap);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!item?.id || !fromLocation?.location_id) { // Use location_id here
    toast.error('Invalid item or location data');
    return;
  }

  const qty = Number(formData.transferQty);
  if (isNaN(qty) || qty <= 0) {
    toast.error('Please enter a valid numeric quantity');
    return;
  }

  if (qty > availableQty) {
    toast.error('Transfer quantity exceeds available stock');
    return;
  }

  setLoading(true);

  try {
    const transferData = {
      from_location_id: fromLocation.location_id, // Use location_id here
      to_location_id: formData.toLocation,
      transfer_date: formData.transferDate,
      remarks: formData.remarks,
      inventory_item_id: item.id,
      quantity: qty
    };

    console.log('Final data being sent to backend:', JSON.stringify(transferData, null, 2));

    const response = await inventoryTransferAPI.create(transferData);
    
    toast.success('Transfer completed successfully!');
    
    if (onTransferSuccess) {
      onTransferSuccess(response.data);
    }
    
    onClose();
    
  } catch (error) {
    console.error('Transfer error:', error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to complete transfer';
    
    toast.error(errorMessage);
    
    if (error.response?.data?.errors) {
      Object.values(error.response.data.errors).forEach(messages => {
        messages.forEach(message => toast.error(message));
      });
    }
  } finally {
    setLoading(false);
  }
};

  // Get selected location name
  const getSelectedLocationName = () => {
    return locations.find(loc => loc.value === formData.toLocation)?.label || '';
  };

  // Calculate after-transfer quantities
  const getAfterTransferQuantities = () => {
    const transferQty = parseFloat(formData.transferQty) || 0;
    const sourceAfter = availableQty - transferQty;
    const destinationCurrent = locationStocks[formData.toLocation] || 0;
    const destinationAfter = destinationCurrent + transferQty; // CORRECTED: ADD to destination
    
    return {
      sourceAfter,
      destinationCurrent,
      destinationAfter
    };
  };

  const { sourceAfter, destinationCurrent, destinationAfter } = getAfterTransferQuantities();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transfer Item</h2>
            <p className="text-sm text-gray-500 mt-1">
              Transfer {item?.item_code} to another location
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Item Information Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Number
                </label>
                <input
                  type="text"
                  value={item?.item_code || '—'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={item?.item_name || '—'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Transfer Locations Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer From
                </label>
                <input
                  type="text"
                  value={fromLocation?.name || '—'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {stockLoading ? (
                    <div className="flex items-center gap-1">
                      <Loader className="w-3 h-3 animate-spin" />
                      Loading stock...
                    </div>
                  ) : (
                    <>
                      Available Qty: <span className="font-semibold">{availableQty}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer To *
                </label>
                {locationsLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading locations...</span>
                  </div>
                ) : (
                  <Select
                    options={locations}
                    value={locations.find(opt => opt.value === formData.toLocation)}
                    onChange={(selected) => setFormData({...formData, toLocation: selected?.value})}
                    placeholder="Select destination location..."
                    styles={customStyles}
                    formatOptionLabel={formatOptionLabel}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    required
                    isDisabled={loading}
                  />
                )}
              </div>
            </div>

            {/* Transfer Details Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Quantity *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={availableQty}
                  value={formData.transferQty}
                  onChange={(e) => setFormData({...formData, transferQty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  required
                  placeholder="Enter quantity"
                  disabled={loading || stockLoading}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Max: {availableQty} units
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Date
                </label>
                <input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({...formData, transferDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add any remarks or notes about this transfer..."
                disabled={loading}
              />
            </div>

            {/* Enhanced Summary */}
            {formData.transferQty && formData.toLocation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Transfer Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">From:</span>
                    <p className="font-medium">{fromLocation?.name}</p>
                    <p className="text-xs text-gray-500">
                      Current: {availableQty} → After: <span className={sourceAfter < 0 ? 'text-red-600 font-semibold' : ''}>
                        {sourceAfter} units
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">To:</span>
                    <p className="font-medium">{getSelectedLocationName()}</p>
                    <p className="text-xs text-gray-500">
                      Current: {destinationCurrent} → After: <span className="text-green-600 font-semibold">
                        {destinationAfter} units
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <p className="font-medium">{formData.transferQty} units</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">
                      {new Date(formData.transferDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.transferQty || !formData.toLocation || loading || parseFloat(formData.transferQty) > availableQty}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemTransferToLocation;