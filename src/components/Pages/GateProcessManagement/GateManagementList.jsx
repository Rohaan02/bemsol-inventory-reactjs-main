import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GateManagementList = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const iconLink = document.createElement("link");
    iconLink.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    const tailwindScript = document.createElement("script");
    tailwindScript.src = "https://cdn.tailwindcss.com?plugins=forms,typography";
    tailwindScript.async = true;
    tailwindScript.onload = () => {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#19e66b",
              "background-light": "#f6f8f7",
              "background-dark": "#112117",
            },
            fontFamily: {
              display: ["Roboto", "sans-serif"],
            },
          },
        },
      };
    };
    document.head.appendChild(tailwindScript);
  }, []);

  // Table data - EXACTLY matching your HTML structure
  const tableData = [
    {
      id: "SH-12345",
      type: "Shipment",
      origin: "Karachi Port",
      destination: "Warehouse A",
      vehicle: "LEA-23-4567",
      driver: "John Doe",
      status: "Pending Gate In",
      statusColor: "bg-yellow-100 text-yellow-800",
      action: "Gate Inward Details",
      actionEnabled: true,
    },
    {
      id: "VBR-0092",
      type: "VBR",
      origin: "Warehouse A",
      destination: "Client Site B",
      vehicle: "KHI-12-3456",
      driver: "Jane Smith",
      status: "Pending Gate Out",
      statusColor: "bg-blue-100 text-blue-800",
      action: "Gate Outward Process",
      actionEnabled: true,
    },
    {
      id: "SH-12348",
      type: "Shipment",
      origin: "Lahore Hub",
      destination: "Warehouse A",
      vehicle: "LHR-99-8877",
      driver: "Ali Khan",
      status: "In-Transit",
      statusColor: "bg-indigo-100 text-indigo-800",
      action: "View Details",
      actionEnabled: false,
    },
    {
      id: "VBR-0095",
      type: "VBR",
      origin: "Islamabad",
      destination: "Warehouse A",
      vehicle: "ISL-11-2233",
      driver: "Muhammad Ahmed",
      status: "Pending Gate In",
      statusColor: "bg-yellow-100 text-yellow-800",
      action: "Gate Inward Details",
      actionEnabled: true,
    },
    {
      id: "SH-12350",
      type: "Shipment",
      origin: "Warehouse A",
      destination: "Multan Depot",
      vehicle: "MN-55-6677",
      driver: "Rizwan Ullah",
      status: "Pending Gate Out",
      statusColor: "bg-blue-100 text-blue-800",
      action: "Gate Outward Process",
      actionEnabled: true,
    },
  ];

  // Filter data based on search and filter
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      search === "" ||
      row.id.toLowerCase().includes(search.toLowerCase()) ||
      row.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      row.driver.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Gate In" && row.status.includes("Gate In")) ||
      (filter === "Gate Out" && row.status.includes("Gate Out"));

    return matchesSearch && matchesFilter;
  });

  const totalPages = 3; // Based on your HTML showing 3 pages

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-display">
      {/* Header - matching your HTML structure */}
      <header className="bg-white shadow-sm">
        <div className="px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Gate In/Out Management
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters Card */}
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    Filters:
                  </span>
                  {["All", "Gate In", "Gate Out"].map((f) => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        filter === f
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      variant={filter === f ? "default" : "outline"}
                    >
                      {f}
                    </Button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-400">search</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by ID, Vehicle No, or Driver..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID#
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle No.
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver Name
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.type}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.origin}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.destination}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.vehicle}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.driver}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={`${row.statusColor} px-2 py-1 text-xs font-semibold rounded-full`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="link"
                          className={`font-bold hover:underline ${
                            row.actionEnabled
                              ? "text-primary hover:text-green-900"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!row.actionEnabled}
                        >
                          {row.action}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Updated with exact HTML colors */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{filteredData.length}</span>{" "}
                    of <span className="font-medium">20</span> results
                  </p>
                </div>
                <div>
                  <nav
                    aria-label="Pagination"
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Previous</span>
                      <span className="material-icons text-sm">
                        chevron_left
                      </span>
                    </button>

                    {[1, 2, 3].map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-primary/10 border-primary text-primary"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Next</span>
                      <span className="material-icons text-sm">
                        chevron_right
                      </span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GateManagementList;
