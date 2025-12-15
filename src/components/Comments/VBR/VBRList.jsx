import React, { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Pagination } from "@/components/ui/pagination";
import { Loader } from "@/components/ui/loader";
import { useNavigate } from "react-router-dom";

const VBRList = () => {
  const navigate = useNavigate();

  /* ---------------------------------- */
  /* Load Fonts, Icons, Tailwind CDN     */
  /* ---------------------------------- */
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

  /* ---------------------------------- */
  /* State                              */
  /* ---------------------------------- */
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const vbrList = [
    {
      id: "VBR-00123",
      shipments: "S25-00001",
      origin: "Market Purchase",
      destination: "Warehouse A, NY",
      date: "2023-10-27",
    },
    {
      id: "VBR-00124",
      shipments: "S25-00002, S25-00006",
      origin: "Warehouse B, IL",
      destination: "Vendor Supply Co.",
      date: "2023-10-25",
    },
    {
      id: "VBR-00125",
      shipments: "S25-00003, S25-00005",
      origin: "Warehouse A, NY",
      destination: "Warehouse B, IL",
      date: "2023-10-24",
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen p-8 font-display">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">
          VBR
        </h1>

        <Button onClick={() => setOpenDialog(true)}>
          <span className="material-icons-outlined mr-2">add</span>
          Create New
        </Button>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#1C2C23] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 flex flex-col gap-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending VBR</TabsTrigger>
              <TabsTrigger value="approval">Pending Approval</TabsTrigger>
              <TabsTrigger value="booked">Booked</TabsTrigger>
              <TabsTrigger value="transit">In-Transit</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="w-full">
            <Label>Search</Label>
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">
                search
              </span>
              <Input
                className="pl-10"
                placeholder="Search by VBR #, shipment, origin, destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pb-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VBR #</TableHead>
                    <TableHead>Shipments</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {vbrList.map((vbr) => (
                    <TableRow key={vbr.id}>
                      <TableCell>{vbr.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {vbr.shipments}
                      </TableCell>
                      <TableCell>{vbr.origin}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {vbr.destination}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {vbr.date}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="material-icons-outlined">
                                more_horiz
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/vbr-details/${vbr.id}`)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/vbr/edit/${vbr.id}`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 pb-4">
          <Pagination />
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New VBR</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            VBR creation form goes here.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VBRList;
