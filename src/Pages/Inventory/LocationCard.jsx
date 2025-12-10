// components/LocationsCard.jsx
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Bell,
  SlidersHorizontal,
  Truck,
  ShoppingCart,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import AddToPOModal from "../Modals/AddToPOModal";
import StockAdjustmentModal from "../Modals/StockAdjustmentModal";
import ItemTransferToLocation from "../Modals/ItemTransferToLocation";
import inventoryItemAPI from "@/lib/InventoryItemApi";

const LocationsCard = ({ item }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch locations data when component mounts or item changes
  useEffect(() => {
    const fetchLocationsData = async () => {
      if (!item?.id) return;

      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Fetching locations data for item:", item.id);

        const response = await inventoryItemAPI.track(item.id);
        console.log("📍 Locations data received:", response);

        if (response.success && response.data) {
          setLocationsData(response.data.locations || []);
        } else {
          throw new Error(response.message || "Failed to load locations data");
        }
      } catch (err) {
        console.error("❌ Error fetching locations data:", err);
        setError(err.message || "Failed to load locations data");
        setLocationsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationsData();
  }, [item?.id]);

  const handleStockAdjust = (location) => {
    setSelectedLocation(location);
    setIsAdjustModalOpen(true);
  };

  const handleAddToPO = (location) => {
    setSelectedLocation(location);
    setIsPOModalOpen(true);
  };

  const handleTransfer = (location) => {
    setSelectedLocation(location);
    setIsTransferModalOpen(true);
  };

  const LocationRow = ({ location }) => (
    <div className="w-full bg-white border rounded-xl shadow-sm p-4 text-black">
      <div className="flex justify-between items-start mb-3">
        <div>
          <a
            href={`/locations/${location.location_id}`}
            className="text-green-600 font-semibold text-lg hover:underline"
          >
            {location.name}
          </a>
          {location.aisle || location.row || location.bin ? (
            <div className="mt-1 text-sm text-gray-500">
              {[location.aisle, location.row, location.bin]
                .filter(Boolean)
                .join(" • ")}
            </div>
          ) : null}
          {location.status && (
            <div className="mt-2">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  location.status === "Out of Stock"
                    ? "bg-red-100 text-red-600"
                    : location.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {location.status}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            title="Add user"
            aria-label="Add user"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-green-600" />
          </button>

          <button
            title="Watch"
            aria-label="Watch"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-4 h-4 text-green-600" />
          </button>

          <button
            title="Adjust"
            aria-label="Adjust"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
            onClick={() => handleStockAdjust(location)}
          >
            <SlidersHorizontal className="w-4 h-4 text-green-600" />
          </button>

          <button
            title="Transfer"
            aria-label="Transfer"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
            onClick={() => handleTransfer(location)}
          >
            <Truck className="w-4 h-4 text-green-600" />
          </button>

          <button
            title="Add to PO"
            aria-label="Add to PO"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
            onClick={() => handleAddToPO(location)}
          >
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </button>

          <button
            title="More"
            aria-label="More"
            className="p-2 rounded-md border hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div>
          <p className="text-sm font-medium text-gray-600">Current Qty</p>
          <p
            className={`text-xl font-semibold ${
              location.isOutOfStock ? "text-red-600" : "text-gray-900"
            }`}
          >
            {location.currentQty}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Reorder Point</p>
          <p className="text-xl font-semibold text-gray-900">
            {location.reorderPoint || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">Pending PO Qty</p>
          <p className="text-xl font-semibold text-gray-900">
            {location.pendingPOQty || 0}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600">WO Current Qty</p>
          <p className="text-xl font-semibold text-gray-900">
            {location.woCurrentQty || 0}
          </p>
        </div>
      </div>

      {!location.is_active && (
        <div className="mt-2">
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            Inactive Location
          </span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border rounded-xl shadow-md p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-green-600 font-bold text-lg">Locations</h2>
          <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
          <span className="text-gray-600">Loading locations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-xl shadow-md p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-green-600 font-bold text-lg">Locations</h2>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Error loading locations: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border rounded-xl shadow-md p-6 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-green-600 font-bold text-lg">
            Locations
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({locationsData.length} location
              {locationsData.length !== 1 ? "s" : ""})
            </span>
          </h2>
          <button className="px-4 py-1 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
            Manage
          </button>
        </div>

        {locationsData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No locations configured for this item.</p>
            <p className="text-sm mt-1">Add locations in the item edit page.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {locationsData.map((location) => (
              <LocationRow
                key={location.id || location.location_id}
                location={location}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        item={item}
        location={selectedLocation}
      />

      {/* Add to Purchase Order Modal */}
      <AddToPOModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        item={item}
        location={selectedLocation}
      />

      {/* Transfer to Location Modal */}
      <ItemTransferToLocation
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        item={item}
        fromLocation={selectedLocation}
      />
    </>
  );
};

export default LocationsCard;
