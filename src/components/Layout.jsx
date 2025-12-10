// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from "./layout/Sidebar";
import { Header } from "./layout/Header";
import { useState } from "react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Scaled content area - removes white space */}
        <div 
          className="flex-1 overflow-auto"
          style={{
            transform: 'scale(0.9)',
            transformOrigin: 'top left',
            width: '111.11%', // 100% / 0.9
            height: '111.11%', // 100% / 0.9
          }}
        >
          <main className="h-full p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;