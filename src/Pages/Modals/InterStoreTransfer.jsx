// components/Modals/InterStoreTransfer.jsx
import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin, FileText, Loader, AlertCircle } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import locationAPI from '@/lib/locationAPI';
import inventoryTransferAPI from '@/lib/InventoryTransferAPI';

const InterStoreTransfer = ({ isOpen, onClose, onSubmit, demand }) => {
  const [formData, setFormData] = useState({
    transferQty: '',
    fromLocation: '', // Changed from toLocation to fromLocation
    toLocation: demand?.location_id || '', // Demand location is fixed as destination
    remarks: '',
    transferDate: new Date().toISOString().split('T')[0]
  });

  const [locations, setLocations] = useState([]);
  const [demandLocation, setDemandLocation] = useState(''); // Location where items are needed
  const [availableQty, setAvailableQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState(false);

  // React Select custom styles
  const customStyles = {
    control: (base) => ({
      ...base,
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      minHeight: '38px',
      boxShadow: 'none',
      fontSize: '14px',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      fontSize: '14px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#f0fdf4' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      fontSize: '14px',
      padding: '8px 12px',
      '&:active': {
        backgroundColor: '#16a34a'
      }
    })
  };

  // Fetch locations and available stock
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && demand) {
        try {
          setLocationsLoading(true);
          setStockLoading(true);
          setStockError(false);
          
          // Fetch all locations from API
          const allLocations = await locationAPI.getAll();
          console.log("Fetched locations:", allLocations);
          
          // Format locations for react-select (exclude demand location)
          const formattedLocations = allLocations
            .filter(location => location.id !== demand.location_id) // Don't show demand location as source
            .map(location => ({
              value: location.id,
              label: location.name || `Location ${location.id}`
            }));
          
          setLocations(formattedLocations);

          // Find demand location name
          const demandLoc = allLocations.find(loc => loc.id === demand.location_id);
          console.log("Demand location found:", demandLoc, "for location_id:", demand.location_id);
          
          if (demandLoc) {
            setDemandLocation(demandLoc.name || `Location ${demandLoc.id}`);
          } else {
            setDemandLocation('Location not found');
          }

          // Set default transfer quantity to approved quantity or quantity
          const defaultQty = demand.approved_quantity || demand.quantity;
          
          setFormData({
            transferQty: defaultQty?.toString() || '1',
            fromLocation: '', // User will select source location
            toLocation: demand.location_id, // Fixed as demand location
            remarks: '',
            transferDate: new Date().toISOString().split('T')[0]
          });

        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load transfer data');
          setDemandLocation('Error loading location');
          setLocations([]);
        } finally {
          setLocationsLoading(false);
          setStockLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen, demand]);

  // Fetch stock when source location is selected
  useEffect(() => {
    const fetchStock = async () => {
      if (formData.fromLocation && demand?.inventory_item_id) {
        try {
          setStockLoading(true);
          setStockError(false);
          
          console.log("Fetching stock for:", {
            itemId: demand.inventory_item_id,
            locationId: formData.fromLocation
          });
          
          const stockData = await inventoryTransferAPI.getStock(demand.inventory_item_id, formData.fromLocation);
          console.log("Stock API response:", stockData);
          
          const stock = stockData.current_stock || 0;
          setAvailableQty(stock);
          
          if (stock === 0) {
            setStockError(true);
            toast.warning('Selected location has zero stock available');
          }

          // Auto-adjust transfer quantity if it exceeds available stock
          if (parseInt(formData.transferQty) > stock) {
            const maxQty = Math.min(stock, demand.approved_quantity || demand.quantity || 0);
            setFormData(prev => ({
              ...prev,
              transferQty: maxQty > 0 ? maxQty.toString() : '1'
            }));
          }

        } catch (error) {
          console.error('Error fetching stock:', error);
          toast.error('Failed to load stock information');
          setStockError(true);
          setAvailableQty(0);
        } finally {
          setStockLoading(false);
        }
      } else {
        setAvailableQty(0);
        setStockLoading(false);
      }
    };

    fetchStock();
  }, [formData.fromLocation, demand?.inventory_item_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fromLocation) {
      toast.error('Please select a source location');
      return;
    }

    // Validate stock availability
    const transferQty = parseInt(formData.transferQty);
    if (availableQty < transferQty) {
      toast.error(`Insufficient stock. Only ${availableQty} units available at selected location.`);
      return;
    }

    setLoading(true);

    try {
      const transferQuantity = parseInt(formData.transferQty);
      console.log('Parsed quantity:', transferQuantity, 'Type:', typeof transferQuantity);

      if (isNaN(transferQuantity) || transferQuantity < 1) {
        toast.error('Please enter a valid quantity');
        return;
      }

      const transferData = {
        from_location_id: formData.fromLocation, // Source location (user selected)
        to_location_id: formData.toLocation,     // Destination (demand location)
        transfer_date: formData.transferDate,
        demand_id: demand.id,
        remarks: formData.remarks,
        inventory_item_id: demand.inventory_item_id,
        quantity: transferQuantity
      };

      console.log('Final transfer data:', transferData);
      
      await onSubmit(transferData);
      
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMaxTransferQty = () => {
    if (!formData.fromLocation) {
      return demand?.approved_quantity || demand?.quantity || 0;
    }
    
    return Math.min(
      demand?.approved_quantity || demand?.quantity || 0,
      availableQty
    );
  };

  const maxTransferQty = getMaxTransferQty();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inter Store Transfer</h2>
              <p className="text-sm text-gray-500 mt-1">
                Transfer items to fulfill demand {demand?.demand_no}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form - Landscape Layout */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Demand Information */}
            <div className="lg:w-2/5">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 h-full">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Demand Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">Demand No:</span>
                      <p className="font-medium text-gray-900 text-sm">{demand?.demand_no}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">Item Name:</span>
                      <p className="font-medium text-gray-900 text-sm truncate" title={demand?.item_name}>
                        {demand?.item_name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">Requested Qty:</span>
                      <p className="font-medium text-gray-900 text-sm">{demand?.quantity}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">Approved Qty:</span>
                      <p className="font-medium text-gray-900 text-sm">{demand?.approved_quantity || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">Demand Location:</span>
                    {locationsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="w-3 h-3 animate-spin" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <p className="font-medium text-purple-700 text-sm">{demandLocation}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">Destination Type:</span>
                    <p className="font-medium text-blue-700 text-sm">Demand Location (Fixed)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Transfer Form */}
            <div className="lg:w-3/5">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Transfer Details
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Location (Source) *
                    </label>
                    {locationsLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading locations...</span>
                      </div>
                    ) : (
                      <Select
                        options={locations}
                        value={locations.find(opt => opt.value === formData.fromLocation)}
                        onChange={(selected) => setFormData({...formData, fromLocation: selected?.value})}
                        placeholder="Select source location..."
                        styles={customStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        required
                        isDisabled={loading || locations.length === 0}
                      />
                    )}
                    {locations.length === 0 && !locationsLoading && (
                      <p className="text-xs text-red-500 mt-1">No source locations available</p>
                    )}
                  </div>

                  {/* Stock Information */}
                  {formData.fromLocation && (
                    <div className="lg:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Available Stock:</span>
                        {stockLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader className="w-3 h-3 animate-spin text-blue-600" />
                            <span className="text-sm text-blue-600">Checking stock...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${
                              availableQty > 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {availableQty} units
                            </span>
                            {stockError && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {stockError && availableQty === 0 && !stockLoading && (
                        <p className="text-xs text-red-600 mt-1">
                          Selected location has no stock available
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max={maxTransferQty}
                      value={formData.transferQty || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setFormData({
                            ...formData,
                            transferQty: value
                          });
                        }
                      }}
                      onBlur={(e) => {
                        if (!e.target.value || parseInt(e.target.value) < 1) {
                          setFormData({
                            ...formData,
                            transferQty: "1"
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                      required
                      placeholder="Enter quantity"
                      disabled={loading || !formData.fromLocation}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Max: {maxTransferQty} units available
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none disabled:opacity-50"
                    placeholder="Add any remarks or notes about this transfer..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
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
              disabled={
                !formData.transferQty || 
                !formData.fromLocation || 
                loading || 
                locationsLoading || 
                isNaN(parseInt(formData.transferQty)) || 
                parseInt(formData.transferQty) < 1 ||
                parseInt(formData.transferQty) > maxTransferQty ||
                availableQty < parseInt(formData.transferQty)
              }
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Confirm Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterStoreTransfer;