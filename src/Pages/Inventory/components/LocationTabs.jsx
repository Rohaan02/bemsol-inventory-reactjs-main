// src/components/inventory/LocationTabs.jsx
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const LocationTabs = ({ 
  locations, 
  activeTab, 
  onTabChange, 
}) => {
  const [visibleTabs, setVisibleTabs] = useState(5);
  const showMore = locations.length > visibleTabs;

  const displayedLocations = locations.slice(0, visibleTabs);
  const hiddenLocations = locations.slice(visibleTabs);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
      {/* Location Tabs - Left Side */}
      <div className="flex-1 min-w-0">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button
            onClick={() => onTabChange("All")}
            className={`px-3 py-1 text-sm font-medium whitespace-nowrap relative 
              ${activeTab === "All" ? "text-primary-color after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary-color" : "text-gray-600 hover:text-gray-800"}`}
          >
            All Locations
          </button>
          
          {displayedLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onTabChange(loc.id.toString())}
              className={`px-3 py-1 text-sm font-medium whitespace-nowrap relative 
                ${activeTab === loc.id.toString() ? "text-primary-color after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary-color" : "text-gray-600 hover:text-gray-800"}`}
            >
              {loc.name}
            </button>
          ))}
          
          {showMore && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-600 hover:text-gray-800 flex items-center gap-1">
                  More <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {hiddenLocations.map((loc) => (
                  <DropdownMenuItem
                    key={loc.id}
                    onClick={() => onTabChange(loc.id.toString())}
                  >
                    {loc.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTabs;