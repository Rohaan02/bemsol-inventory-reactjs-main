import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";

const VBRGateIn = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
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
        theme: {
          extend: {
            colors: {
              primary: "#19e66b",
              "background-light": "#f6f8f7",
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

  const shipments = [
    {
      id: "GI-25-0000001",
      status: "In-Transit",
      shipment: "SH-123",
      vrn: "LEA-23-4567",
      from: "Main Warehouse",
    },
    {
      id: "GI-25-0000002",
      status: "In-Transit",
      shipment: "SH-124",
      vrn: "LHR-23-9981",
      from: "Port Qasim",
    },
    {
      id: "GI-25-0000003",
      status: "Pending",
      shipment: "SH-125",
      vrn: "KHI-22-1122",
      from: "Lahore Branch",
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light font-display p-8">
      <header className="bg-white shadow-sm flex-shrink-0 p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          VBR Shipments Gate In
        </h2>
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <span className="material-icons-outlined">notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <span className="material-icons-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden mt-4">
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="search"
            />
          </div>

          <ul>
            {shipments.map((s) => (
              <li key={s.id} className="border-b border-gray-200">
                <a href="#" className="block p-4 hover:bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800">{s.id}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        s.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Shipment: {s.shipment} | VRN: {s.vrn}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">From: {s.from}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 overflow-y-auto px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Gate Inward: GI-25-0000001
                </h3>
                <p className="text-gray-500">
                  Vehicle Registration: LEA-23-4567
                </p>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                In-Transit
              </span>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Name
                  </label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CNIC Number
                  </label>
                  <Input placeholder="35202-1234567-8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <Input placeholder="+92 300 1234567" />
                </div>
              </div>

              {/* ===== Vehicle Pictures Upload ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Pictures (Min 3)
                </label>
                <div className="mt-2 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <span className="material-icons text-5xl text-gray-400">
                      image
                    </span>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-green-800 hover:font-bold">
                        <span>Upload files</span>
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                          name="vehicle-pictures"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== CNIC Picture Upload ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CNIC Picture (Min 1)
                </label>
                <div className="mt-2 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <span className="material-icons text-5xl text-gray-400">
                      badge
                    </span>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-green-800 hover:font-bold">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          name="cnic-picture"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Checkbox ===== */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Checkbox label="Unloaded Weight Required" />
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-green-900">
                  <span className="material-icons-outlined mr-2">
                    check_circle_outline
                  </span>
                  Mark Vehicle Reached & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VBRGateIn;
