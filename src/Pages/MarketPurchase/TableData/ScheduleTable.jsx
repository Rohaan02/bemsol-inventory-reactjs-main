import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckSquare, Square, MoreVertical, Eye, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ScheduleTable = ({ 
  schedules = [],
  selectedSchedules = new Set(),
  onScheduleSelect,
  onSelectAll,
  loading = false,
  meta = {},
  onActionClick,
  fetchSchedules
}) => {

  // Handle schedule selection
  const handleSelectSchedule = (scheduleId) => {
    if (onScheduleSelect) {
      onScheduleSelect(scheduleId);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  // Schedule Action Dropdown
  const ScheduleActionDropdown = ({ schedule }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white shadow-lg border border-gray-200 rounded-lg"
      >
        <DropdownMenuItem
          onClick={() => onActionClick("estimate_price", schedule)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span>Add Estimate</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onActionClick("view_details", schedule)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onActionClick("mark_purchased", schedule)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span>Mark Purchased</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Calculate quantities with detailed logging
  const calculateQuantities = (schedule) => {
    const demand = schedule.site_demand;
    
    if (!demand) {
      console.warn(`Schedule ${schedule.id}: No demand data found`);
      return {
        approvedQty: 0,
        scheduledQty: 0,
        totalPurchasedQty: 0,
        pendingScheduleQty: 0,
        pendingPurchaseQty: 0
      };
    }

    // 1. Get approved quantity from fulfillment_types where type = market_purchase
    const approvedQty = calculateApprovedQty(demand);
    
    // 2. Get scheduled quantity from purchase_schedules table
    const scheduledQty = parseFloat(schedule.scheduled_qty) || 0;
    
    // 3. Calculate total purchased quantity from market_purchases
    const totalPurchasedQty = calculateTotalPurchasedQty(schedule);
    
    // 4. Calculate pending schedule quantity (approved_qty - scheduled_qty)
    const pendingScheduleQty = Math.max(0, approvedQty - scheduledQty);
    
    // 5. Calculate pending purchase quantity (scheduled_qty - total_purchased_qty)
    const pendingPurchaseQty = Math.max(0, scheduledQty - totalPurchasedQty);

    // Log detailed calculation
    console.log(`=== Schedule ${schedule.id} Quantity Calculation ===`);
    console.log('Demand Data:', {
      demandId: demand.id,
      demandNo: demand.demand_no,
      approvedQty,
      fulfillmentTypes: demand.fulfillment_types
    });
    console.log('Schedule Data:', {
      scheduleId: schedule.id,
      scheduledQty,
      marketPurchases: schedule.market_purchases?.length || 0
    });
    console.log('Purchase Data:', {
      totalPurchasedQty,
      marketPurchases: schedule.market_purchases?.map(p => ({
        id: p.id,
        actual_purchase_qty: p.actual_purchase_qty,
        status: p.purchase_status
      })) || []
    });
    console.log('Calculated Quantities:', {
      pendingScheduleQty,
      pendingPurchaseQty,
      formula: {
        pendingSchedule: `${approvedQty} - ${scheduledQty} = ${pendingScheduleQty}`,
        pendingPurchase: `${scheduledQty} - ${totalPurchasedQty} = ${pendingPurchaseQty}`
      }
    });
    console.log(`=== End Schedule ${schedule.id} Calculation ===`);

    return {
      approvedQty,
      scheduledQty,
      totalPurchasedQty,
      pendingScheduleQty,
      pendingPurchaseQty
    };
  };

  // Calculate approved quantity from fulfillment_types
  const calculateApprovedQty = (demand) => {
    if (!demand.fulfillment_types || !Array.isArray(demand.fulfillment_types)) {
      console.log(`Demand ${demand.id}: No fulfillment types found`);
      return 0;
    }

    const marketPurchaseFulfillment = demand.fulfillment_types.find(
      ft => ft.type === 'market_purchase'
    );

    const approvedQty = marketPurchaseFulfillment ? 
      parseFloat(marketPurchaseFulfillment.qty) || 0 : 0;

    console.log(`Demand ${demand.id}: Approved Qty Calculation`, {
      fulfillmentTypes: demand.fulfillment_types,
      marketPurchaseFulfillment,
      approvedQty
    });

    return approvedQty;
  };

  // Calculate total purchased quantity from market_purchases
  const calculateTotalPurchasedQty = (schedule) => {
    if (!schedule.market_purchases || !Array.isArray(schedule.market_purchases)) {
      console.log(`Schedule ${schedule.id}: No market purchases found`);
      return 0;
    }

    const totalPurchased = schedule.market_purchases.reduce((sum, purchase) => {
      const purchaseQty = parseFloat(purchase.actual_purchase_qty) || 0;
      console.log(`Schedule ${schedule.id}: Purchase ${purchase.id}`, {
        purchaseId: purchase.id,
        actualPurchaseQty: purchase.actual_purchase_qty,
        parsedQty: purchaseQty,
        status: purchase.purchase_status
      });
      return sum + purchaseQty;
    }, 0);

    console.log(`Schedule ${schedule.id}: Total Purchased`, {
      totalPurchased,
      purchaseCount: schedule.market_purchases.length,
      purchases: schedule.market_purchases.map(p => ({
        id: p.id,
        qty: p.actual_purchase_qty,
        status: p.purchase_status
      }))
    });

    return totalPurchased;
  };

  // Helper function to get schedule data for columns
  const getScheduleCellData = (schedule, columnKey) => {
    const demand = schedule.site_demand;
    const quantities = calculateQuantities(schedule);
    
    switch (columnKey) {
      case 'demand_no':
        return demand?.demand_no || '-';
      case 'date':
        return demand?.date ? new Date(demand.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) : '-';
      case 'required_date':
        return demand?.required_date ? new Date(demand.required_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) : '-';
      case 'location':
        return demand?.location?.name || '-';
      case 'item_name':
        return (
          <div>
            <div className="font-medium">{demand?.item_name || '-'}</div>
            {demand?.inventory_item?.item_code && (
              <div className="text-xs text-gray-500">
                Code: {demand.inventory_item.item_code}
              </div>
            )}
          </div>
        );
      case 'total_qty':
        return quantities.approvedQty > 0 ? quantities.approvedQty.toFixed(2) : '-';
      case 'pending_qty':
        // This should show pending purchase quantity (scheduled - purchased)
        return quantities.pendingPurchaseQty > 0 ? (
          <span className="font-medium text-orange-600">{quantities.pendingPurchaseQty.toFixed(2)}</span>
        ) : (
          <span className="font-medium text-green-600">0.00</span>
        );
      case 'scheduled_purchase_date':
        return schedule.scheduled_date ? new Date(schedule.scheduled_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) : "-";
      case 'purchase_status':
        // Auto-determine status based on quantities
        let status = schedule.status || 'Scheduled';
        
        if (quantities.totalPurchasedQty >= quantities.scheduledQty) {
          status = 'Completed';
        } else if (quantities.totalPurchasedQty > 0) {
          status = 'In Progress';
        }
        
        console.log(`Schedule ${schedule.id}: Status Determination`, {
          originalStatus: schedule.status,
          finalStatus: status,
          totalPurchased: quantities.totalPurchasedQty,
          scheduledQty: quantities.scheduledQty,
          isCompleted: quantities.totalPurchasedQty >= quantities.scheduledQty,
          isInProgress: quantities.totalPurchasedQty > 0 && quantities.totalPurchasedQty < quantities.scheduledQty
        });
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
            status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
            status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        );
      case 'purchase_qty':
        return quantities.scheduledQty > 0 ? quantities.scheduledQty.toFixed(2) : '-';
      case 'actual_purchase_qty':
        return quantities.totalPurchasedQty > 0 ? quantities.totalPurchasedQty.toFixed(2) : '-';
      case 'pending_schedule_qty':
        // Show pending schedule quantity (approved - scheduled)
        return quantities.pendingScheduleQty > 0 ? (
          <span className="font-medium text-red-600">{quantities.pendingScheduleQty.toFixed(2)}</span>
        ) : (
          <span className="font-medium text-green-600">0.00</span>
        );
      case 'deliver_to':
        return schedule.delivery_location?.name || '-';
      case 'scheduled_by':
        return schedule.scheduled_by?.name || '-';
      default:
        return '-';
    }
  };

  // Column configuration for schedules
  const scheduleColumns = [
    { key: 'demand_no', label: 'Demand No' },
    { key: 'date', label: 'Demand Date' },
    { key: 'required_date', label: 'Required Date' },
    { key: 'location', label: 'Location' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'total_qty', label: 'Approved Qty' },
    { key: 'purchase_qty', label: 'Scheduled Qty' },
    { key: 'actual_purchase_qty', label: 'Purchased Qty' },
    { key: 'pending_qty', label: 'Pending Purchase' },
    { key: 'pending_schedule_qty', label: 'Pending Schedule' },
    { key: 'scheduled_purchase_date', label: 'Scheduled Date' },
    { key: 'purchase_status', label: 'Status' },
    { key: 'deliver_to', label: 'Deliver To' },
    { key: 'scheduled_by', label: 'Scheduled By' },
    { key: 'actions', label: 'Actions' },
  ];

  // Log initial schedule data analysis
  React.useEffect(() => {
    if (schedules.length > 0 && !loading) {
      console.log('=== SCHEDULES DATA ANALYSIS START ===');
      console.log('Total schedules:', schedules.length);
      
      schedules.forEach((schedule, index) => {
        const quantities = calculateQuantities(schedule);
        
        console.log(`\n--- Schedule ${index + 1} Summary ---`);
        console.log('Basic Info:', {
          scheduleId: schedule.id,
          demandId: schedule.site_demand?.id,
          demandNo: schedule.site_demand?.demand_no
        });
        console.log('Quantities Summary:', {
          approvedQty: quantities.approvedQty,
          scheduledQty: quantities.scheduledQty,
          totalPurchasedQty: quantities.totalPurchasedQty,
          pendingSchedule: quantities.pendingScheduleQty,
          pendingPurchase: quantities.pendingPurchaseQty
        });
        console.log('Data Quality Check:', {
          hasDemand: !!schedule.site_demand,
          hasFulfillmentTypes: !!schedule.site_demand?.fulfillment_types,
          hasMarketPurchases: !!schedule.market_purchases,
          marketPurchaseCount: schedule.market_purchases?.length || 0
        });
      });
      
      console.log('=== SCHEDULES DATA ANALYSIS END ===');
    }
  }, [schedules, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading schedules...</span>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200 bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12 py-3">
                  <div className="flex items-center">
                    {selectedSchedules.size === schedules.length && schedules.length > 0 ? (
                      <CheckSquare
                        className="h-4 w-4 text-primary-color cursor-pointer"
                        onClick={handleSelectAll}
                      />
                    ) : (
                      <Square
                        className="h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={handleSelectAll}
                      />
                    )}
                  </div>
                </TableHead>
                {scheduleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="py-3 text-left font-semibold text-gray-700"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <TableRow
                    key={`schedule-${schedule.id}`}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        {selectedSchedules.has(schedule.id) ? (
                          <CheckSquare
                            className="h-4 w-4 text-primary-color cursor-pointer"
                            onClick={() => handleSelectSchedule(schedule.id)}
                          />
                        ) : (
                          <Square
                            className="h-4 w-4 text-gray-400 cursor-pointer"
                            onClick={() => handleSelectSchedule(schedule.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                    {scheduleColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="py-3 text-sm text-gray-700"
                      >
                        {column.key === 'actions' ? (
                          <ScheduleActionDropdown schedule={schedule} />
                        ) : (
                          getScheduleCellData(schedule, column.key)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={scheduleColumns.length + 1}
                    className="text-center py-8 text-gray-500"
                  >
                    No schedules found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTable;