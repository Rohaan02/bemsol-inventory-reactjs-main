import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, MoreVertical, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const MPNOrderedDataTable = ({ 
  data, 
  loading, 
  selectedItems, 
  onSelectItem, 
  onSelectAll,
  isAllSelected 
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Partially Received': "bg-yellow-100 text-yellow-800",
      'Ordered': "bg-blue-100 text-blue-800",
      'Received': "bg-green-100 text-green-800",
      'Not Available': "bg-red-100 text-red-800",
      
    };
    
    return (
      <Badge variant="secondary" className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const ActionDropdown = ({ item }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/market-purchase/show/${item.id}`)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/market-purchase/mpn/create/${item.id}`)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Create MPN
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12">
              <div className="flex items-center">
                {isAllSelected ? (
                  <CheckSquare
                    className="h-4 w-4 text-green-600 cursor-pointer"
                    onClick={onSelectAll}
                  />
                ) : (
                  <Square
                    className="h-4 w-4 text-gray-400 cursor-pointer"
                    onClick={onSelectAll}
                  />
                )}
              </div>
            </TableHead>
            <TableHead>Demand No</TableHead>
            <TableHead>Code /Item Name</TableHead>
           
          
            <TableHead>Order Qty</TableHead>
            <TableHead>Received Qty</TableHead>
            <TableHead>Pending Qty</TableHead>
          
            <TableHead>Status</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Last Rec Date</TableHead>
            <TableHead>Remarks</TableHead>
           
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    {selectedItems.has(item.id) ? (
                      <CheckSquare
                        className="h-4 w-4 text-green-600 cursor-pointer"
                        onClick={() => onSelectItem(item.id)}
                      />
                    ) : (
                      <Square
                        className="h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => onSelectItem(item.id)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.demand_no}</TableCell>
                <TableCell>{item.item_code} / {item.item_name}</TableCell>
               
               
                <TableCell>{item.actual_purchase_qty}</TableCell>
                <TableCell>{item.received_qty}</TableCell>
                <TableCell>{item.pending_qty}</TableCell>
              


                <TableCell>{getStatusBadge(item.order_status)}</TableCell>
                <TableCell>
                  {item.order_date ? new Date(item.order_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>{item.latest_receive_date}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {item.purchaser_remarks || '-'}
                </TableCell>
               
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                No pending MPN records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MPNOrderedDataTable;