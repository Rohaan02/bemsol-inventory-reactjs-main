// InventoryActivity.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import inventoryItemAPI from "../../lib/InventoryItemApi";

const InventoryActivity = () => {
  const { id } = useParams();
  const [inventoryData, setInventoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState(null);
  const [selectedAdjustedBy, setSelectedAdjustedBy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    partLocation: true,
    adjustmentType: true,
    adjustmentReason: true,
    vendor: true,
    adjustmentQty: true,
    previousQty: true,
    newQty: true,
    adjustedBy: true
  });

  const itemsPerPage = 5;

  // Dropdown options
  const locations = [
    { value: "all", label: "All Locations" },
    { value: "KCCL", label: "KCCL" },
    { value: "PCL", label: "PCL" },
    { value: "Central Store Manga", label: "Central Store Manga" },
    { value: "Main Warehouse", label: "Main Warehouse" }
  ];

  const adjustmentTypes = [
    { value: "all", label: "All Types" },
    { value: "Transfer", label: "Transfer" },
    { value: "Initial", label: "Initial" },
    { value: "Adjustment", label: "Adjustment" }
  ];

 

  const columnHeaders = [
    { key: "date", label: "Date" },
    { key: "partLocation", label: "Part Location" },
    { key: "adjustmentType", label: "Type" },
    { key: "adjustmentReason", label: "Remarks" },
    { key: "adjustmentQty", label: " Qty" },
    { key: "adjustedBy", label: "Created By" }
  ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #e2e8f0",
      boxShadow: "none",
      backgroundColor: "white",
      minHeight: "40px",
      borderRadius: "6px",
      "&:hover": { borderColor: "#cbd5e1" },
      fontSize: "14px",
      minWidth: state.selectProps.placeholder === "Adjusted By" ? "140px" : "130px"
    }),
    dropdownIndicator: (base) => ({ ...base, color: "#64748b", padding: "6px" }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({
      ...base,
      borderRadius: "6px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)",
      zIndex: 50
    }),
    option: (base) => ({
      ...base,
      fontSize: "14px",
      padding: "8px 12px"
    }),
    placeholder: (base) => ({
      ...base,
      color: "#64748b",
      fontSize: "14px"
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "14px"
    })
  };

  // Fetch inventory activity
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Tracking item id", id);
        const activityData = await inventoryItemAPI.getActivity(id);
        console.log("Fetched activity data:", activityData);
        setInventoryData(activityData);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
        toast.error("Failed to fetch inventory activity");
      }
    };
    fetchData();
  }, [id]);

  // Filter and paginate
  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.adjustedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.adjustmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.adjustmentReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      !selectedLocation ||
      selectedLocation.value === "all" ||
      item.partLocation === selectedLocation.value;
    const matchesAdjustmentType =
      !selectedAdjustmentType ||
      selectedAdjustmentType.value === "all" ||
      item.adjustmentType === selectedAdjustmentType.value;
    const matchesAdjustedBy =
      !selectedAdjustedBy ||
      selectedAdjustedBy.value === "all" ||
      item.adjustedBy === selectedAdjustedBy.value;

    return matchesSearch && matchesLocation && matchesAdjustmentType && matchesAdjustedBy;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        {/* Left Side: Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* Search Input */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search inventory activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           
            <Select
              options={locations}
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Location"
              styles={customStyles}
              isSearchable
              className="min-w-[130px]"
            />
            <Select
              options={adjustmentTypes}
              value={selectedAdjustmentType}
              onChange={setSelectedAdjustmentType}
              placeholder="Type"
              styles={customStyles}
              isSearchable
              className="min-w-[130px]"
            />
          </div>
        </div>

        {/* Right Side: Pagination and Column Settings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* Pagination */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Column Settings */}
          <div className="relative">
            <button 
              onClick={() => setShowColumnSettings(!showColumnSettings)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Columns
            </button>
            {showColumnSettings && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[180px]">
                {columnHeaders.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={() => toggleColumnVisibility(col.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {columnHeaders.map((col) => 
                visibleColumns[col.key] && (
                  <th 
                    key={col.key} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {visibleColumns.date && (
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.date}
                    </td>
                  )}
                  {visibleColumns.partLocation && (
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.partLocation}
                    </td>
                  )}
                  {visibleColumns.adjustmentType && (
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.adjustmentType}
                    </td>
                  )}
                  {visibleColumns.adjustmentReason && (
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.adjustmentReason}
                    </td>
                  )}
                
                  {visibleColumns.adjustmentQty && (
                    <td className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                      item.adjustmentQty > 0 
                        ? "text-green-600" 
                        : item.adjustmentQty < 0 
                        ? "text-red-600" 
                        : "text-gray-900"
                    }`}>
                      {item.adjustmentQty > 0 ? `+${item.adjustmentQty}` : item.adjustmentQty}
                    </td>
                  )}
                 
                  {visibleColumns.adjustedBy && (
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.adjustedBy}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columnHeaders.length} 
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No inventory activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryActivity;