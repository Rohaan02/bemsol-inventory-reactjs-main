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

const GateOutL2Approval = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
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
              primary: "#052e16",
              "background-light": "#f8fafc",
              "background-dark": "#020617",
            },
            fontFamily: {
              sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
              DEFAULT: "0.5rem",
            },
          },
        },
      };
    };
    document.head.appendChild(tailwindScript);
  }, []);

  // Requests data
  const requests = [
    {
      id: 1,
      requestId: "GO-25-0001234",
      reason: "High Value Inventory",
      reasonColor: "bg-yellow-100 text-yellow-800",
      items: 3,
      totalValue: "$15,750.00",
      l1Approver: "A. Iqbal",
    },
    {
      id: 2,
      requestId: "GO-25-0001231",
      reason: "Exit Control List",
      reasonColor: "bg-red-100 text-red-800",
      items: 1,
      totalValue: "$5,200.00",
      l1Approver: "S. Ahmed",
    },
    {
      id: 3,
      requestId: "GO-25-0001225",
      reason: "High Value Inventory",
      reasonColor: "bg-yellow-100 text-yellow-800",
      items: 5,
      totalValue: "$21,300.00",
      l1Approver: "A. Iqbal",
    },
  ];

  const handleApprove = (requestId) => {
    console.log("Approving request:", requestId);
    alert(`Approved request: ${requestId}`);
  };

  const handleReject = (requestId) => {
    console.log("Rejecting request:", requestId);
    alert(`Rejected request: ${requestId}`);
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.requestId.toLowerCase().includes(search.toLowerCase()) ||
      request.l1Approver.toLowerCase().includes(search.toLowerCase()) ||
      request.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-light font-sans">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Search and Filter */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Gate Out Request - L2 Approval
              </h2>
              <p className="text-gray-500">
                Review and approve/reject requests pending Level 2
                authorization.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <Input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
              >
                <span className="material-icons mr-2 text-base">
                  filter_list
                </span>
                Filter
              </Button>
            </div>
          </div>

          {/* Requests Table */}
          <Card className="shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 border-b border-gray-200">
                  <TableRow>
                    <TableCell className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                      Request ID
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                      Reason for L2
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                      Items
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                      Total Value
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                      L1 Approver
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {request.requestId}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          className={`${request.reasonColor} px-2 py-1 text-xs font-medium rounded-full`}
                        >
                          {request.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {request.items}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {request.totalValue}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {request.l1Approver}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            onClick={() => handleApprove(request.requestId)}
                            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <span className="material-icons text-sm mr-1">
                              check_circle
                            </span>
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.requestId)}
                            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <span className="material-icons text-sm mr-1">
                              cancel
                            </span>
                            Reject
                          </Button>
                          <button className="text-gray-500 hover:text-gray-800">
                            <span className="material-icons text-xl">
                              more_vert
                            </span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200">
              <span className="text-sm font-normal text-gray-500 mb-4 sm:mb-0">
                Showing <span className="font-semibold text-gray-900">1-3</span>{" "}
                of <span className="font-semibold text-gray-900">15</span>
              </span>
              <nav aria-label="Table navigation">
                <ul className="inline-flex items-center -space-x-px">
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                    >
                      <span className="sr-only">Previous</span>
                      <span className="material-icons text-lg">
                        chevron_left
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`px-3 py-2 leading-tight border ${
                        currentPage === 1
                          ? "z-10 text-green-600 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-700"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      1
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(2)}
                      className={`px-3 py-2 leading-tight border ${
                        currentPage === 2
                          ? "z-10 text-green-600 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-700"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      2
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(3)}
                      className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                    >
                      ...
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(5)}
                      className={`px-3 py-2 leading-tight border ${
                        currentPage === 5
                          ? "z-10 text-green-600 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-700"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      5
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(5, currentPage + 1))
                      }
                      className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                    >
                      <span className="sr-only">Next</span>
                      <span className="material-icons text-lg">
                        chevron_right
                      </span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GateOutL2Approval;
