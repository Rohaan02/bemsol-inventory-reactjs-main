import React, { useEffect, useState } from "react";

const AssetReceiving = () => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // 1. Load Google Fonts (Inter)
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // 2. Load Material Icons
    const iconLink = document.createElement("link");
    iconLink.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    // 3. Load Tailwind CDN
    const tailwindScript = document.createElement("script");
    tailwindScript.src = "https://cdn.tailwindcss.com?plugins=forms,typography";
    tailwindScript.async = true;

    tailwindScript.onload = () => {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#166534",
              "background-light": "#f0f2f5",
              "background-dark": "#111827",
            },
            fontFamily: {
              display: ["Inter", "sans-serif"],
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

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-display">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Select Asset */}
        <section className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-lg shadow-sm border border-green-200/50 dark:border-green-800/20">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <span className="w-1 bg-primary h-6 mr-3 rounded-full"></span>
            1. Select Asset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 required-label">
                Asset Name
              </label>
              <select className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary">
                <option>Select Asset</option>
                <option>Angle Grinder Makita DGA504</option>
                <option>Dell Latitude 7420 Laptop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 required-label">
                Receiving Date
              </label>
              <input
                type="date"
                className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* 2. Receiving Details */}
        <section className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-lg shadow-sm border border-green-200/50 dark:border-green-800/20">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <span className="w-1 bg-primary h-6 mr-3 rounded-full"></span>
            2. Receiving Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 required-label">
                Quantity to Receive
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 required-label">
                Default Location
              </label>
              <select className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary">
                <option>Select Location</option>
                <option>Warehouse A</option>
                <option>Office B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Received By
              </label>
              <input
                type="text"
                placeholder="Person's Name"
                className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* 3. Additional Information */}
        <section className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-lg shadow-sm border border-green-200/50 dark:border-green-800/20">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <span className="w-1 bg-primary h-6 mr-3 rounded-full"></span>
            3. Additional Information
          </h2>
          <textarea
            placeholder="Any additional notes about this receiving..."
            rows={4}
            className="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
          ></textarea>
        </section>

        {/* Submit button */}
        <button className="w-full bg-primary text-white py-3 px-4 rounded-md font-semibold hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark transition-colors">
          Receive Assets
        </button>

        {/* Recent Receivings */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Receivings
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No receiving history found.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AssetReceiving;
