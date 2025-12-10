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
import { MoreVertical, Eye, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const MPNDatatable = ({ 
  data, 
  loading 
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Ordered': "bg-green-100 text-green-800",
      'Completed': "bg-blue-100 text-blue-800",
      'Pending': "bg-yellow-100 text-yellow-800",
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
          onClick={() => navigate(`/market-purchase/mpn/${item.mpn_no}`)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View MPN Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/market-purchase/show/${item.id}`)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          View Demand
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
            <TableHead>MPN No</TableHead>
            <TableHead>Demand No</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead>Purchase Qty</TableHead>
            <TableHead>Actual Qty</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>MPN Date</TableHead>
            <TableHead>Status</TableHead>
           
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    {item.mpn_no}
                  </div>
                </TableCell>
                <TableCell>{item.demand_no}</TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.item_code}</TableCell>
                <TableCell>{item.purchase_qty}</TableCell>
                <TableCell>{item.actual_purchase_qty}</TableCell>
                <TableCell>{parseFloat(item.rate || 0).toFixed(2)}</TableCell>
                <TableCell>${parseFloat(item.amount || 0).toFixed(2)}</TableCell>

                <TableCell>{item.vendor_name}</TableCell>
                <TableCell>
                  {item.mpn_date ? new Date(item.mpn_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(item.purchase_status)}</TableCell>
                
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                No MPN records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MPNDatatable;