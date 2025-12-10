// components/inventory/LocationManager.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from 'react-select';
import { Plus, Trash2, MapPin } from "lucide-react";

const LocationManager = ({ 
  itemLocations, 
  setItemLocations, 
  originalLocations, 
  locationOptions,
  customStyles 
}) => {

  console.log("📍 LocationManager Debug:", {
    itemLocations,
    originalLocations,
    locationOptionsCount: locationOptions.length
  });

  // Add new location row
  const addLocation = () => {
    const newLocation = {
      location_id: "",
      aisle: "",
      row: "",
      bin: "",
      quantity: 0,
      reorder_level: 0,
      is_active: true
    };
    
    console.log("➕ Adding new location:", newLocation);
    setItemLocations(prev => [...prev, newLocation]);
  };

  // Remove location row
  const removeLocation = (index) => {
    console.log("🗑️ Removing location at index:", index, itemLocations[index]);
    setItemLocations(prev => prev.filter((_, i) => i !== index));
  };

  // Handle location field changes
  const handleLocationChange = (index, field, value) => {
    console.log(`✏️ Location ${index} ${field} changed to:`, value);
    setItemLocations(prev => 
      prev.map((loc, i) => 
        i === index ? { ...loc, [field]: value } : loc
      )
    );
  };

  // Handle location select changes
  const handleLocationSelectChange = (index, selectedOption) => {
    const locationId = selectedOption ? selectedOption.value : "";
    console.log(`📍 Location ${index} selected:`, locationId, selectedOption?.label);
    
    setItemLocations(prev => 
      prev.map((loc, i) => 
        i === index ? { 
          ...loc, 
          location_id: locationId,
          location_name: selectedOption ? selectedOption.label : ""
        } : loc
      )
    );
  };

  // Check if location is already used
  const isLocationUsed = (locationId, currentIndex) => {
    return itemLocations.some((loc, index) => 
      index !== currentIndex && loc.location_id === locationId
    );
  };

  return (
    <Card className="mb-6 border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded"></div>
            Inventory Locations
            <span className="text-sm font-normal text-gray-500">
              ({itemLocations.length} locations)
            </span>
          </CardTitle>
          <Button
            type="button"
            onClick={addLocation}
            className="flex items-center gap-2 bg-primary-color hover:bg-primary-hover text-white"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Add multiple locations with specific quantities and reorder points
        </p>
      </CardHeader>
      <CardContent>
        {itemLocations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No locations added yet</p>
            <p className="text-sm text-gray-500">
              Click "Add Location" to start adding inventory locations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemLocations.map((location, index) => {
              const isDuplicate = isLocationUsed(location.location_id, index);
              const isExisting = location.id;
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">
                      Location {index + 1}
                      {isExisting && (
                        <span className="text-xs text-green-600 ml-2">(Existing - ID: {location.id})</span>
                      )}
                      {isDuplicate && (
                        <span className="text-xs text-red-600 ml-2">(Duplicate Location!)</span>
                      )}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => removeLocation(index)}
                      variant="outline"
                      size="sm"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Location *</Label>
                      <Select
                        options={locationOptions}
                        value={locationOptions.find(option => option.value === location.location_id) || null}
                        onChange={(selectedOption) => handleLocationSelectChange(index, selectedOption)}
                        placeholder="Select Location"
                        styles={{
                          ...customStyles,
                          control: (base, state) => ({
                            ...base,
                            ...customStyles.control(base, state),
                            borderColor: isDuplicate ? '#ef4444' : base.borderColor
                          })
                        }}
                        isSearchable
                      />
                      {isDuplicate && (
                        <p className="text-xs text-red-600 mt-1">
                          This location is already selected elsewhere
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Aisle</Label>
                      <Input
                        value={location.aisle}
                        onChange={(e) => handleLocationChange(index, 'aisle', e.target.value)}
                        placeholder="A-01"
                        className="h-10 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Row</Label>
                      <Input
                        value={location.row}
                        onChange={(e) => handleLocationChange(index, 'row', e.target.value)}
                        placeholder="R-01"
                        className="h-10 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Bin</Label>
                      <Input
                        value={location.bin}
                        onChange={(e) => handleLocationChange(index, 'bin', e.target.value)}
                        placeholder="B-01"
                        className="h-10 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quantity</Label>
                      <Input
                        value={location.quantity}
                        type="number"
                        onChange={(e) => handleLocationChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reorder Point</Label>
                      <Input
                        value={location.reorder_level}
                        type="number"
                        onChange={(e) => handleLocationChange(index, 'reorder_level', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={location.is_active}
                        onChange={(e) => handleLocationChange(index, 'is_active', e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          location.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            location.is_active
                              ? "transform translate-x-5"
                              : "transform translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                    <Label className="text-sm font-medium cursor-pointer">
                      Active Location
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {itemLocations.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Total Quantity Across All Locations:{" "}
                  <span className="font-bold">
                    {itemLocations.reduce((sum, loc) => sum + (parseInt(loc.quantity) || 0), 0)}
                  </span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {itemLocations.filter(loc => loc.location_id).length} location(s) configured •{" "}
                  {itemLocations.filter(loc => loc.id).length} existing •{" "}
                  {itemLocations.filter(loc => !loc.id).length} new
                </p>
              </div>
              <Button
                type="button"
                onClick={addLocation}
                variant="outline"
                className="flex items-center gap-2 bg-primary-color text-white font-bold py-2 px-4 rounded"
              >
                <Plus className="h-4 w-4" />
                Add Another Location
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationManager;