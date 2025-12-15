// layout/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [openMenu, setOpenMenu] = useState(null); // Start with no menu open
  const location = useLocation(); // Get current route
  const { loading, hasPermission } = useAuth();

  // Handler to toggle menus
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Check if a route is active
  const isActiveRoute = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Check if any child route is active for dropdown menus
  const isMenuActive = (menuPaths) => {
    return menuPaths.some((path) => isActiveRoute(path));
  };

  // Auto-open menu when route changes
  useEffect(() => {
    // Define menu paths for each dropdown
    const menuPaths = {
      items: ["/inventory", "/untracked-items"],
      vendors: ["/vendors"],
      employees: ["/employees"],
      interTransfer: ["/inter-transfer"],
      sitedemand: [
        "/site-demands",
        "/site-purchases",
        "/purchase-orders",
        "/market-purchases",
      ],
      logistics: [
        "/transit-inventory",
        "/shipments",
        "/vehicle-booking",
        "/waiting-for-transit",
        "/create-shipment",
        "/assets-management",
        "/vbr",
      ],
      settings: [
        "/app-settings",
        "/category",
        "/accounts",
        "/manufacturers",
        "/unit-measurement",
        "/banks",
        "/location",
        "/conditions",
        "/whts",
        "/tax-payer-types",
        "/users",
      ],
    };

    // Find which menu should be open based on current route
    for (const [menuName, paths] of Object.entries(menuPaths)) {
      if (paths.some((path) => isActiveRoute(path))) {
        setOpenMenu(menuName);
        break;
      }
    }
  }, [location.pathname]);

  if (loading) return null;

  console.log("item permissions:", hasPermission("view_item"));
  console.log("employee permission", hasPermission("view_employee"));

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-green-950 fixed inset-y-0 left-0 z-30 w-64 shadow-md transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-700 bg-green-950">
          <div className="flex items-center">
            <img
              src="/src/assets/logo.png"
              alt="Bemsol Opex Logo"
              class
              Name="h-10 w-auto object-contain"
            />
          </div>
          <button
            className="text-green-100 focus:outline-none lg:hidden hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Navigation */}
        <nav className="h-full overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-1">
              {/* Dashboard */}
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-2 rounded-lg transition-colors relative ${
                    isActiveRoute("/dashboard")
                      ? "text-white"
                      : "text-green-100 hover:bg-green-700 hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActiveRoute("/dashboard") && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                  )}
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>

              {/* Items Dropdown */}
              {hasPermission("view_item") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive(["/inventory", "/untracked-items"])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("items")}
                  >
                    {isMenuActive(["/inventory", "/untracked-items"]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Inventory</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "items" ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "items" && (
                    <ul className="pl-9 mt-1 space-y-1">
                      <li>
                        <Link
                          to="/inventory"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/inventory")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/inventory") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Parts
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/untracked-items"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/untracked-items")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/untracked-items") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Untracked Items
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* Vendor dropdown */}
              {hasPermission("view_vendor") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive(["/vendors"])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("vendors")}
                  >
                    {isMenuActive(["/vendors"]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Vendors</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "vendors" ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "vendors" && (
                    <ul className="pl-9 mt-1">
                      <li>
                        <Link
                          to="/vendors"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/vendors")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/vendors") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Vendors List
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* Employees dropdown */}
              {hasPermission("view_employee") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive(["/employees"])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("employees")}
                  >
                    {isMenuActive(["/employees"]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Employees</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "employees" ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "employees" && (
                    <ul className="pl-9 mt-1">
                      <li>
                        <Link
                          to="/employees"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/employees")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/employees") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Employees
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {hasPermission("view_interstoretransfer") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive(["/inter-transfer"])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("interTransfer")}
                  >
                    {isMenuActive(["/inter-transfer"]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Inter-Transfer</span>
                    </div>

                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "interTransfer" ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "interTransfer" && (
                    <ul className="pl-9 mt-1">
                      <li>
                        <Link
                          to="/inter-transfer"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/inter-transfer")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/inter-transfer") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Inter-Transfer
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* sitedemand dropdown */}
              {hasPermission("view_sitedemand") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive([
                        "/site-demands",
                        "/site-purchases",
                        "/purchase-orders",
                        "/market-purchases",
                      ])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("sitedemand")}
                  >
                    {isMenuActive([
                      "/site-demands",
                      "/site-purchases",
                      "/purchase-orders",
                      "/market-purchases",
                    ]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Procurement</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "sitedemand" ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "sitedemand" && (
                    <ul className="pl-9 mt-1 space-y-1">
                      <li>
                        <Link
                          to="/site-demands"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/site-demands")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/site-demands") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Site Demands
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/site-purchases"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/site-purchases")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/site-purchases") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Site Purchase
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/purchase-orders"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/purchase-orders")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/purchase-orders") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Purchase Order
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/market-purchases"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/market-purchases")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/market-purchases") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Market Purchase
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* logistics */}
              {hasPermission("view_item") && (
                <li>
                  <button
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                      isMenuActive([
                        "/transit-inventory",
                        "/shipments",
                        "/vehicle-booking",
                        "/waiting-for-transit",
                        "/create-shipment",
                        "/assets-management",
                        "/vbr",
                      ])
                        ? "text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}
                    onClick={() => toggleMenu("logistics")}
                  >
                    {isMenuActive([
                      "/transit-inventory",
                      "/shipments",
                      "/vehicle-booking",
                      "/waiting-for-transit",
                      "/create-shipment",
                      "/assets-management",
                      "/vbr",
                    ]) && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Logistics</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openMenu === "logistics" ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openMenu === "logistics" && (
                    <ul className="pl-9 mt-1 space-y-1">
                      <li>
                        <Link
                          to="/transit-inventory"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/transit-inventory")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/transit-inventory") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Transit Inventory
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/shipments"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/shipments")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/shipments") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Shipments
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/vehicle-booking"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/vehicle-booking")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/vehicle-booking") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Vehicle Booking
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/waiting-for-transit"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/waiting-for-transit")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/waiting-for-transit") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Waiting For Transit
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/create-shipment"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/create-shipment")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/create-shipment") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Create Shipment
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/assets-management"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/assets-management")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/assets-management") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          Assets Management
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/vbr"
                          className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                            isActiveRoute("/vbr")
                              ? "text-white"
                              : "text-green-100 hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {isActiveRoute("/vbr") && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                          )}
                          VBR List
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* Settings Dropdown */}
              <li>
                <button
                  className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors relative ${
                    isMenuActive([
                      "/app-settings",
                      "/category",
                      "/accounts",
                      "/manufacturers",
                      "/unit-measurement",
                      "/banks",
                      "/location",
                      "/conditions",
                      "/whts",
                      "/tax-payer-types",
                      "/users",
                    ])
                      ? "text-white"
                      : "text-green-100 hover:bg-green-700 hover:text-white"
                  }`}
                  onClick={() => toggleMenu("settings")}
                >
                  {isMenuActive([
                    "/app-settings",
                    "/category",
                    "/accounts",
                    "/manufacturers",
                    "/unit-measurement",
                    "/banks",
                    "/location",
                    "/conditions",
                    "/whts",
                    "/tax-payer-types",
                    "/users",
                  ]) && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-lg"></div>
                  )}
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Settings</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openMenu === "settings" ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openMenu === "settings" && (
                  <ul className="pl-9 mt-1 space-y-1">
                    <li>
                      <Link
                        to="/app-settings"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/app-settings")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/app-settings") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        App Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/category"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/category")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/category") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Item Category
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/accounts"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/accounts")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/accounts") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Accounts
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/manufacturers"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/manufacturers")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/manufacturers") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Manufacturer
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/unit-measurement"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/unit-measurement")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/unit-measurement") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Unit Measurement
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/banks"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/banks")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/banks") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Banks
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/location"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/location")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/location") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Location
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/conditions"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/conditions")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/conditions") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/whts"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/whts")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/whts") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        W.H.T Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tax-payer-types"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/tax-payer-types")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/tax-payer-types") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Taxpayer Type
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/users"
                        className={`flex items-center p-2 text-sm rounded-lg transition-colors relative ${
                          isActiveRoute("/users")
                            ? "text-white"
                            : "text-green-100 hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {isActiveRoute("/users") && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-lg"></div>
                        )}
                        Users
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};
