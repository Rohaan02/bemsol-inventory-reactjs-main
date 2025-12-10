// Dashboard.jsx (complete solution with green success sidebar)
import React from 'react';
import { useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";


// Header Component

// StatsCard Component
const StatsCard = ({ title, value, change, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex items-center">
      <div className="rounded-full bg-green-100 p-3 md:p-4 mr-4 text-green-600">
        {icon}
      </div>
      <div>
        <p className="text-sm md:text-base text-gray-500">{title}</p>
        <h3 className="font-bold text-lg md:text-xl mt-1">{value}</h3>
        <p className="text-xs md:text-sm text-green-600 mt-1">{change}</p>
      </div>
    </div>
  );
};

// BarChart Component
// OrderStatusChart Component (Doughnut Chart)
const OrderStatusChart = () => {
  // Order status data
  const data = [
    { label: 'Total Orders', value: 86, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'Received', value: 72, color: 'bg-green-500', textColor: 'text-green-500' },
    { label: 'Pending', value: 14, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { label: 'Cancelled', value: 0, color: 'bg-red-500', textColor: 'text-red-500' }
  ];

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate the circumference for the SVG circle
  const radius = 35; // Smaller radius for doughnut effect
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dash arrays and offsets
  let currentOffset = 0;
  const chartData = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeDasharray = (percentage / 100) * circumference;
    const strokeDashoffset = circumference - strokeDasharray - currentOffset;
    currentOffset += strokeDasharray;
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6">Order Status</h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative w-48 h-48 mb-4 md:mb-0 md:mr-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {chartData.map((item, index) => (
              item.value > 0 && (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={item.strokeDasharray}
                  strokeDashoffset={item.strokeDashoffset}
                  className={item.textColor}
                  transform="rotate(-90 50 50)"
                />
              )
            ))}
            {/* Show a full gray circle if all values are zero */}
            {total === 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-gray-300"
                transform="rotate(-90 50 50)"
              />
            )}
            {/* Center circle for doughnut effect */}
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="white"
              className="text-white"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-bold">{total}</span>
            <span className="text-xs text-gray-500">Total Orders</span>
          </div>
        </div>
        <div className="flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-3 p-2 rounded-lg bg-gray-50">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold mr-2">{item.value}</span>
                <span className="text-xs text-gray-500">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// PieChart Component
// PieChart Component with Stock Status
const PieChart = () => {
  // Stock status data
  const data = [
    { label: 'In Stock', value: 10, color: 'bg-green-500', textColor: 'text-green-500' },
    { label: 'Low Stock', value: 2, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { label: 'Out of Stock', value: 3, color: 'bg-red-500', textColor: 'text-red-500' }
  ];

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate the circumference for the SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dash arrays and offsets
  let currentOffset = 0;
  const chartData = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeDasharray = (percentage / 100) * circumference;
    const strokeDashoffset = circumference - strokeDasharray - currentOffset;
    currentOffset += strokeDasharray;
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6">Stock Status</h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative w-48 h-48 mb-4 md:mb-0 md:mr-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {chartData.map((item, index) => (
              item.value > 0 && (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={item.strokeDasharray}
                  strokeDashoffset={item.strokeDashoffset}
                  className={item.textColor}
                  transform="rotate(-90 50 50)"
                />
              )
            ))}
            {/* Show a full gray circle if all values are zero */}
            {total === 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-gray-300"
                transform="rotate(-90 50 50)"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-bold">{total}</span>
            <span className="text-xs text-gray-500">Total Items</span>
          </div>
        </div>
        <div className="flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-3 p-2 rounded-lg bg-gray-50">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold mr-2">{item.value}</span>
                <span className="text-xs text-gray-500">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({auth}) => {
  console.log(auth);
  const getUserName = () => {
    if (auth?.user?.name) {
      return auth.user.name;
    }

    if (auth?.user?.email) {
      return auth.user.email.split('@')[0];
    }

    return 'User';
  };

  const userName = getUserName();

  console.log("Auth object:", auth);
  console.log("User Name:", userName);


  return (
    <div className="h-full">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatsCard
          title="Total Inventory"
          value="1,248"
          change="+12% from last month"
          icon={<span className="text-indigo-500">📦</span>}
        />
        <StatsCard
          title="Today Orders"
          value="86"
          change="+8% from yesterday"
          icon={<span className="text-green-500">🛒</span>}
        />
        <StatsCard
          title="Pending Orders"
          value="14"
          change="-3% from yesterday"
          icon={<span className="text-yellow-500">⏳</span>}
        />
        <StatsCard
          title="Total Revenue"
          value="$12,846"
          change="+23% from last month"
          icon={<span className="text-blue-500">💰</span>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <OrderStatusChart />
        <PieChart />
      </div>
    </div>
  );
};

export default Dashboard;