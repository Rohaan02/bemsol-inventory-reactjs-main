// import React, { useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// const VBRLoadingProcess = () => {
//   useEffect(() => {
//     // Dynamically add Google Material Symbols stylesheet
//     const link = document.createElement("link");
//     link.href =
//       "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
//     link.rel = "stylesheet";
//     document.head.appendChild(link);
//   }, []);

//   return (
//     <main className="flex-1 overflow-y-auto p-8 font-display bg-background-light text-gray-900">
//       {/* Header */}
//       <header className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Loading Process</h1>
//           <p className="text-gray-500">VBR No: 12345XYZ | Vehicle: TR-6789</p>
//         </div>
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="outline"
//             className="bg-gray-200 text-gray-800 hover:bg-gray-300"
//           >
//             Save as Draft
//           </Button>
//           <Button
//             variant="default"
//             className="flex items-center gap-2 bg-primary text-white hover:bg-emerald-700"
//           >
//             <span className="material-symbols-outlined text-lg">send</span>
//             Ready for Dispatch
//           </Button>
//         </div>
//       </header>

//       {/* Shipment Items Section */}
//       <section className="bg-white rounded-lg shadow p-6 mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Shipment Items
//           </h2>
//           <div className="flex items-center space-x-4">
//             <Button className="flex items-center gap-2 bg-blue-100 text-blue-600 hover:bg-blue-200">
//               <span className="material-symbols-outlined text-xl">add</span>
//               Add Waiting Transit Item
//             </Button>
//             <Button className="flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200">
//               <span className="material-symbols-outlined text-xl">add_box</span>
//               Add Inventory Item
//             </Button>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="border-b border-gray-200">
//               <tr className="text-sm text-gray-500">
//                 <th className="py-3 px-4 w-10">
//                   <input
//                     className="rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
//                     type="checkbox"
//                   />
//                 </th>
//                 <th className="py-3 px-4">Item Description</th>
//                 <th className="py-3 px-4">Required Qty</th>
//                 <th className="py-3 px-4">Loaded Qty</th>
//                 <th className="py-3 px-4">Status</th>
//                 <th className="py-3 px-4">Remarks</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               <tr className="hover:bg-gray-50">
//                 <td className="py-3 px-4">
//                   <input
//                     className="rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
//                     type="checkbox"
//                   />
//                 </td>
//                 <td className="py-3 px-4">
//                   <p className="font-medium text-gray-800">
//                     Cement Bags - Grade A
//                   </p>
//                   <p className="text-sm text-gray-500">SKU: CEM-001A</p>
//                 </td>
//                 <td className="py-3 px-4">500</td>
//                 <td className="py-3 px-4">
//                   <input
//                     className="w-24 p-2 rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
//                     type="number"
//                     defaultValue={500}
//                   />
//                 </td>
//                 <td className="py-3 px-4">
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     Loaded
//                   </span>
//                 </td>
//                 <td className="py-3 px-4"></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* Loading Details Section */}
//       <section className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-6">
//           Loading Details
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Left column */}
//           <div className="space-y-6">
//             <div>
//               <Label htmlFor="unloading-instructions">
//                 Unloading Instructions
//               </Label>
//               <textarea
//                 id="unloading-instructions"
//                 rows={4}
//                 placeholder="e.g., Use forklift, handle with care..."
//                 className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
//               />
//             </div>
//             <div>
//               <Label htmlFor="loading-remarks">
//                 Loading Remarks (Shipment Level)
//               </Label>
//               <textarea
//                 id="loading-remarks"
//                 rows={4}
//                 placeholder="e.g., Loading delayed due to rain..."
//                 className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
//               />
//             </div>
//           </div>

//           {/* Middle column */}
//           <div className="space-y-6">
//             <div>
//               <Label htmlFor="acc-person-id">
//                 Accompanying Person (Biometric ID)
//               </Label>
//               <input
//                 type="text"
//                 id="acc-person-id"
//                 placeholder="Enter Biometric ID"
//                 className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
//               />
//             </div>
//             <div>
//               <Label htmlFor="acc-person-name">Name</Label>
//               <input
//                 type="text"
//                 id="acc-person-name"
//                 readOnly
//                 value="John Doe"
//                 className="w-full rounded-md border-gray-300 bg-gray-200"
//               />
//             </div>
//             <div>
//               <Label htmlFor="acc-person-position">Position</Label>
//               <input
//                 type="text"
//                 id="acc-person-position"
//                 readOnly
//                 value="Supervisor"
//                 className="w-full rounded-md border-gray-300 bg-gray-200"
//               />
//             </div>
//             <div>
//               <Label htmlFor="contact-number">
//                 Company Person Contact Number
//               </Label>
//               <input
//                 type="text"
//                 id="contact-number"
//                 readOnly
//                 value="+1 234 567 890"
//                 className="w-full rounded-md border-gray-300 bg-gray-200"
//               />
//             </div>
//           </div>

//           {/* Right column */}
//           <div className="space-y-6">
//             <div>
//               <Label htmlFor="arrival-datetime">
//                 Estimated Arrival Time and Date
//               </Label>
//               <input
//                 type="datetime-local"
//                 id="arrival-datetime"
//                 className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
//               />
//             </div>
//             <div>
//               <Label htmlFor="dropzone-file">
//                 Picture of the Loaded Vehicle (3 or more)
//               </Label>
//               <div className="flex items-center justify-center w-full">
//                 <label
//                   htmlFor="dropzone-file"
//                   className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
//                 >
//                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                     <span className="material-symbols-outlined text-4xl text-gray-500">
//                       cloud_upload
//                     </span>
//                     <p className="mb-2 text-sm text-gray-500">
//                       <span className="font-semibold">Click to upload</span> or
//                       drag and drop
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       SVG, PNG, JPG (3+ files)
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     id="dropzone-file"
//                     multiple
//                     className="hidden"
//                   />
//                 </label>
//               </div>

//               {/* Images */}
//               <div className="grid grid-cols-3 gap-2 mt-2">
//                 <img
//                   alt="Side view of a loaded truck"
//                   className="rounded-md object-cover h-16 w-full"
//                   src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxlCFN9wDSgpD1GLMzD8lSEg0dGF19GaB4a6XdkN7KShc1JXpSh7l7NrHp88X1N4ZsD3N9DlZgiLFWZoGjBzt9W4_Fc2PoKyQhCUndicw6cN3Q9zpQxHlq7RpKNuKO19dkUNOnhJA0NK08pdxaf5nsd8Ii1rs7_Ja_yQbF4aK4V5gyNBbD8M7LEsscnuT5PQPMipYg8AeD86vybwLNQz1TsdiZQVvi5MlXH1GaTobPO7REEHKMyGuXvjA1dUZ86rg1QQpyo9Ys4q8"
//                 />
//                 <img
//                   alt="Rear view of a loaded truck with doors open"
//                   className="rounded-md object-cover h-16 w-full"
//                   src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2cBZLQIkD8dNwKhGGyIbcCDL-CCx3YrF7pqdUaZ8GBJIOu5eJgzifDdDMwstCrJSZKGr7vdyJLk2gTQhTHCKTu4P6-93DmpEcE4goN7ahK91ZZ_SQSLK8T155r3VJx4oNZ9iE5OXxmN0hkwNkkcxKpNy_1fRCokNQcJDLN4e2PlMzTy831fZlztPUIuUiJoZ4KpddZ1rdqL49ZaMzONnh3OYpmiP0SdPNCZqNRcIRuEBvJtHIhtAmKpA9s_36-d8CLrB9Id07ppg"
//                 />
//                 <img
//                   alt="Close-up of secured cargo inside a truck"
//                   className="rounded-md object-cover h-16 w-full"
//                   src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh8YAjAu51cVMV0jFKw_O98WxrHSItLw_MJR4V9Rf38FNUGuaaQ0gB7p5_IKwHbET5djavbhEQP27u8QFICOrdU79rYsKadDFZvcp4J_6VgzdbuRpbdVFrhzHc3uQmTqoQAKjl_aIVtW6AaZq25L1nPRdW4i_iIBzqBmr6jPNtz2UYOfJzC0qCFCpjT9f4gscfJTDTSreequd-jeQKPOOL3HCffjAYDIWwWWNdu198anipBqoGvo_ujhBWQX7L05pqS5YfNnCjkmg"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default VBRLoadingProcess;
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const VBRLoadingProcess = () => {
  useEffect(() => {
    // Dynamically add Google Material Symbols stylesheet
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-8 font-display bg-background-light text-gray-900">
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Loading Process
          </h1>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                VBR No.
              </span>
              <p className="text-lg font-bold text-gray-800">12345XYZ</p>
            </div>
            <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Vehicle
              </span>
              <p className="text-lg font-bold text-gray-800">TR-6789</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <Button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium transition-colors duration-200">
            Save as Draft
          </Button>
          <Button className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">send</span>
            Ready for Dispatch
          </Button>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6 space-x-4">
        <Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 font-medium transition-colors duration-200">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Waiting Transit Item
        </Button>
        <Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 font-medium transition-colors duration-200">
          <span className="material-symbols-outlined text-xl">add_box</span>
          Add Inventory Item
        </Button>
      </div>

      {/* Shipment Items */}
      <section className="bg-white rounded-lg shadow border border-gray-200 mb-8 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              local_shipping
            </span>
            Shipment 1:{" "}
            <span className="font-normal text-gray-600">SHP-001</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6 w-10">
                  <input
                    className="rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
                    type="checkbox"
                  />
                </th>
                <th className="py-3 px-6">Item Description</th>
                <th className="py-3 px-6">Required Qty</th>
                <th className="py-3 px-6">Loaded Qty</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-4 px-6">
                  <input
                    className="rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
                    type="checkbox"
                  />
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-800">
                    Cement Bags - Grade A
                  </p>
                  <p className="text-sm text-gray-500">SKU: CEM-001A</p>
                </td>
                <td className="py-4 px-6">500</td>
                <td className="py-4 px-6">
                  <input
                    type="number"
                    defaultValue={500}
                    className="w-24 p-2 rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
                  />
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Loaded
                  </span>
                </td>
                <td className="py-4 px-6"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Loading Details Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Loading Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="unloading-instructions">
                Unloading Instructions
              </Label>
              <textarea
                id="unloading-instructions"
                rows={4}
                placeholder="e.g., Use forklift, handle with care..."
                className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="loading-remarks">
                Loading Remarks (Shipment Level)
              </Label>
              <textarea
                id="loading-remarks"
                rows={4}
                placeholder="e.g., Loading delayed due to rain..."
                className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Middle column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="acc-person-id">
                Accompanying Person (Biometric ID)
              </Label>
              <input
                type="text"
                id="acc-person-id"
                placeholder="Enter Biometric ID"
                className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="acc-person-name">Name</Label>
              <input
                type="text"
                id="acc-person-name"
                readOnly
                value="John Doe"
                className="w-full rounded-md border-gray-300 bg-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="acc-person-position">Position</Label>
              <input
                type="text"
                id="acc-person-position"
                readOnly
                value="Supervisor"
                className="w-full rounded-md border-gray-300 bg-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="contact-number">
                Company Person Contact Number
              </Label>
              <input
                type="text"
                id="contact-number"
                readOnly
                value="+1 234 567 890"
                className="w-full rounded-md border-gray-300 bg-gray-200"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="arrival-datetime">
                Estimated Arrival Time and Date
              </Label>
              <input
                type="datetime-local"
                id="arrival-datetime"
                className="w-full rounded-md border-gray-300 bg-gray-100 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="dropzone-file">
                Picture of the Loaded Vehicle (3 or more)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-symbols-outlined text-4xl text-gray-500">
                      cloud_upload
                    </span>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG (3+ files)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="dropzone-file"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
              {/* Uploaded Images */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <img
                  alt="Side view of a loaded truck"
                  className="rounded-md object-cover h-16 w-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxlCFN9wDSgpD1GLMzD8lSEg0dGF19GaB4a6XdkN7KShc1JXpSh7l7NrHp88X1N4ZsD3N9DlZgiLFWZoGjBzt9W4_Fc2PoKyQhCUndicw6cN3Q9zpQxHlq7RpKNuKO19dkUNOnhJA0NK08pdxaf5nsd8Ii1rs7_Ja_yQbF4aK4V5gyNBbD8M7LEsscnuT5PQPMipYg8AeD86vybwLNQz1TsdiZQVvi5MlXH1GaTobPO7REEHKMyGuXvjA1dUZ86rg1QQpyo9Ys4q8"
                />
                <img
                  alt="Rear view of a loaded truck with doors open"
                  className="rounded-md object-cover h-16 w-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2cBZLQIkD8dNwKhGGyIbcCDL-CCx3YrF7pqdUaZ8GBJIOu5eJgzifDdDMwstCrJSZKGr7vdyJLk2gTQhTHCKTu4P6-93DmpEcE4goN7ahK91ZZ_SQSLK8T155r3VJx4oNZ9iE5OXxmN0hkwNkkcxKpNy_1fRCokNQcJDLN4e2PlMzTy831fZlztPUIuUiJoZ4KpddZ1rdqL49ZaMzONnh3OYpmiP0SdPNCZqNRcIRuEBvJtHIhtAmKpA9s_36-d8CLrB9Id07ppg"
                />
                <img
                  alt="Close-up of secured cargo inside a truck"
                  className="rounded-md object-cover h-16 w-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh8YAjAu51cVMV0jFKw_O98WxrHSItLw_MJR4V9Rf38FNUGuaaQ0gB7p5_IKwHbET5djavbhEQP27u8QFICOrdU79rYsKadDFZvcp4J_6VgzdbuRpbdVFrhzHc3uQmTqoQAKjl_aIVtW6AaZq25L1nPRdW4i_iIBzqBmr6jPNtz2UYOfJzC0qCFCpjT9f4gscfJTDTSreequd-jeQKPOOL3HCffjAYDIWwWWNdu198anipBqoGvo_ujhBWQX7L05pqS5YfNnCjkmg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VBRLoadingProcess;
