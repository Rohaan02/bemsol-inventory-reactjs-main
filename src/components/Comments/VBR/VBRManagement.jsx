import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Loader from "@/components/ui/loader";

const GateIn = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          VBR: Vehicle Arrived / Gate In
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Confirm vehicle arrival and capture initial weight information.
        </p>
      </header>

      {/* Tabs (example usage, can customize) */}
      <Tabs defaultValue={activeTab}>
        <TabsList className="mb-6">
          {["All", "Pending", "Approved"].map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          {/* Could render content per tab here */}
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Booking Details */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              Booking Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">VBR Number</p>
                <p className="font-medium">VBR-2024-00781</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Vehicle Number
                </p>
                <p className="font-medium">KA-01-AB-1234</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Driver Name
                </p>
                <p className="font-medium">Rajesh Kumar</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Origin</p>
                <p className="font-medium">Main Warehouse, Bangalore</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Destination
                </p>
                <p className="font-medium">Regional Hub, Chennai</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Booking Status
                </p>
                <p className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                  Approved
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Weight Requirement
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Unloaded Weight Required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gate-In Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Capture Gate-In Information
            </h3>
            <form className="space-y-6">
              {/* Weight Input */}
              <div>
                <label
                  htmlFor="unloaded-weight"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Unloaded Weight
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="unloaded-weight"
                    name="unloaded-weight"
                    placeholder="Enter vehicle weight"
                    className="w-full pl-3 pr-12 rounded-md border-slate-300 dark:border-slate-600 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary dark:focus:ring-green-400 dark:focus:border-green-400"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <select
                      id="weight-unit"
                      name="weight-unit"
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-slate-500 dark:text-slate-400 focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option>kg</option>
                      <option>tons</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label
                  htmlFor="weigh-slip-upload"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Picture of the Weigh Slip
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary dark:focus-within:ring-offset-slate-900"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end items-center gap-4">
                <Button variant="outline" size="default" type="button" className="bg-white">
                  Save as Draft
                </Button>
                <Button variant="success" size="default" type="submit">
                  <span className="material-symbols-outlined text-base mr-2">
                    login
                  </span>
                  Mark Vehicle as 'Gate In'
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GateIn;
