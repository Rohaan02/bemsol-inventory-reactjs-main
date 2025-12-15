import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { Input } from "../../ui/input";
import Checkbox from "../../ui/checkbox";
import AssetReceiving from "./AssetReceiving";

const CreateAsset = () => {
  const [enableTag, setEnableTag] = useState(false);
  const [serialized, setSerialized] = useState(true);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    // 1. Load Google Fonts
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // 2. Load Material Icons
    const iconLink = document.createElement("link");
    iconLink.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    // 3. Load Tailwind CDN with plugins
    const tailwindScript = document.createElement("script");
    tailwindScript.src = "https://cdn.tailwindcss.com?plugins=forms,typography";
    tailwindScript.async = true;

    // Configure Tailwind theme after script loads
    tailwindScript.onload = () => {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#166534",
              "background-light": "#f0f2f5",
              "background-dark": "#1a1a1a",
              "card-light": "#f0fff4",
              "card-dark": "#2d3748",
              "border-light": "#a7f3d0",
              "border-dark": "#4a5568",
              "text-light": "#1f2937",
              "text-dark": "#e2e8f0",
              "text-muted-light": "#6b7280",
              "text-muted-dark": "#a0aec0",
              "input-bg-light": "#ffffff",
              "input-bg-dark": "#2d3748",
              "input-border-light": "#d1d5db",
              "input-border-dark": "#4a5568",
            },
            fontFamily: {
              display: ["Roboto", "sans-serif"],
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

  const tabs = [
    { id: "create", label: "Create New Asset" },
    { id: "receiving", label: "Asset Receiving" },
  ];

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
      <div className="max-w-6xl mx-auto">
        {/* Tabs for Create / Receiving */}
        <Tabs defaultValue="create" className="mb-6">
          <TabsList>
            <TabsTrigger
              value="create"
              className={({ selected }) =>
                `whitespace-nowrap py-4 px-1 font-medium text-sm border-b-2 ${
                  selected
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500"
                }`
              }
            >
              Create New Asset
            </TabsTrigger>
            <TabsTrigger
              value="receiving"
              className={({ selected }) =>
                `whitespace-nowrap py-4 px-1 font-medium text-sm border-b-2 ${
                  selected
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500"
                }`
              }
            >
              Asset Receiving
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <h2 className="text-2xl font-bold mt-6 mb-6 text-text-light dark:text-text-dark">
              Create New Asset
            </h2>
            <div className="space-y-6">
              {/* 1. General Asset Details */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded border border-border-light dark:border-border-dark">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-6">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  1. General Asset Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Item Code (7 Digit){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. 0000002"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Asset Name"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Model Number
                    </label>
                    <Input
                      placeholder="e.g. Makita DGA504"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      UOM (Unit of Measurement){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>Select UOM</option>
                      <option>Piece</option>
                      <option>Set</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>Select Category</option>
                      <option>Power Tools</option>
                      <option>IT Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Manufacturer
                    </label>
                    <Input
                      placeholder="e.g. Bosch, Makita, Dell"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Specifications <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary p-3 text-text-light dark:text-text-dark"
                      rows={4}
                      placeholder="Enter detailed specifications..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 2. Physical Details */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded border border-border-light dark:border-border-dark">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-6">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  2. Physical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {["Weight", "Length", "Width", "Height"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                        {field}
                      </label>
                      <div className="flex">
                        <Input
                          placeholder={field}
                          className="rounded-l bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                        />
                        <select className="rounded-r border-l-0 border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm">
                          <option>cm</option>
                          <option>m</option>
                          <option>in</option>
                          <option>kg</option>
                          <option>g</option>
                          <option>lb</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Financial & Vendor Details */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded border border-border-light dark:border-border-dark">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-6">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  3. Financial & Vendor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. 1500.00"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      GL / Expense Account{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>Select Account</option>
                      <option>Account A</option>
                      <option>Account B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Vendor
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>Select Vendor</option>
                      <option>Vendor X</option>
                      <option>Vendor Y</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Asset Type & Settings */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded border border-border-light dark:border-border-dark">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-6">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  4. Asset Type & Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Asset Type <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>Asset</option>
                      <option>Consumable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Maintenance <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary h-10 px-3 text-sm text-text-light dark:text-text-dark">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <Checkbox
                    checked={enableTag}
                    onChange={setEnableTag}
                    label="Tag Type"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Tag Prefix
                    </label>
                    <Input
                      placeholder="e.g. GL, IT, MCH"
                      className="bg-input-bg-light dark:bg-input-bg-dark border-input-border-light dark:border-input-border-dark"
                    />
                  </div>
                  <Checkbox
                    checked={serialized}
                    onChange={setSerialized}
                    label="Serialized"
                  />
                </div>
              </div>

              {/* Linked Parts & Documentation */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded border border-border-light dark:border-border-dark">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-6">
                  <span className="w-1 h-6 bg-primary mr-3"></span>
                  5. Linked Parts & Documentation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Linked Parts
                    </label>
                    <select
                      className="w-full h-32 rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                      multiple
                    >
                      <option>Battery Pack</option>
                      <option>Blade Set</option>
                      <option>Charger</option>
                      <option>Protective Case</option>
                      <option>User Manual</option>
                      <option>Safety Glasses</option>
                      <option>Extension Cord</option>
                    </select>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                      Hold Ctrl/Cmd to select multiple items
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                        Upload Picture
                      </label>
                      <input
                        type="file"
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-100 dark:file:bg-green-900 file:text-primary dark:file:text-green-300 hover:file:bg-green-200 dark:hover:file:bg-green-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                        Document Attachment
                      </label>
                      <input
                        type="file"
                        multiple
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-100 dark:file:bg-green-900 file:text-primary dark:file:text-green-300 hover:file:bg-green-200 dark:hover:file:bg-green-800"
                      />
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                        Multiple files can be attached
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-text-light dark:text-text-dark">
                      Remarks
                    </label>
                    <textarea
                      className="w-full rounded border border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark focus:ring-primary focus:border-primary p-3 text-text-light dark:text-text-dark"
                      rows={4}
                      placeholder="Additional notes or remarks..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button className="w-full bg-primary text-white font-bold py-3 px-4 rounded hover:bg-green-800 transition-colors duration-200">
                  Create Asset
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="receiving">
            <AssetReceiving />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default CreateAsset;
