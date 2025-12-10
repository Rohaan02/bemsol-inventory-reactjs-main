import React, { useState, useEffect } from 'react';
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotifications } from '../../hooks/useNotifications';

export const Header = ({ sidebarOpen, setSidebarOpen, auth }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Use the notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    formatTime,
    getNotificationIcon
  } = useNotifications();

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return "U";
  };

  const userName = getUserName();

  // Handle notification click
  // Handle notification click
const handleNotificationClick = async (notification) => {
  // Mark as read
  if (notification.is_click === 0) {
    await markAsRead(notification.id);
  }
  
  // Navigate to target URL or view page
  if (notification.target_url) {
    navigate(notification.target_url);
  } else {
    // Default to view page if no target_url
    navigate(`/site-demands/show/${notification.related_id}`);
  }
  
  setIsNotificationsOpen(false);
};

  // Handle view all notifications
  const handleViewAllNotifications = () => {
    // You can create a dedicated notifications page later
    navigate('/site-demands');
    setIsNotificationsOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4 md:px-6 md:py-4">
        {/* Left section: Menu button, Logo, and Title */}
        <div className="flex items-center">
          <button
            className="text-gray-500 focus:outline-none lg:hidden mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 ml-3">Bemsol Opex</h1>
        </div>

        {/* Center section: Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-900 sm:text-sm"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right section: Icons and User Profile */}
        <div className="flex items-center space-x-4">
          {/* Message Notification Icon */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-600 text-xs text-white flex items-center justify-center">3</span>
          </button>
          
          {/* Bell Notification Icon with Dropdown */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <div className="p-3 border-b border-gray-200 bg-green-600 text-white flex justify-between items-center">
                  <h3 className="text-sm font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-sm">Loading notifications...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500 text-sm">
                      {error}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => {
                      const { icon, bgColor, textColor } = getNotificationIcon(notification.type);
                      const isUnread = notification.is_click === 0;
                      
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            isUnread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                              {icon}
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className={`text-sm font-medium ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-green-600">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                <button 
                  onClick={handleViewAllNotifications}
                  className="block w-full bg-gray-100 text-center text-sm text-green-600 font-medium py-2 hover:bg-gray-200"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
          
          {/* User Profile with Dropdown */}
          <div className="ml-4 relative">
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                {getUserInitials()}
              </div>
              <span className="ml-2 text-gray-700 hidden md:inline">{userName}</span>
              <svg className="ml-1 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </div>
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My History
                  </div>
                </a>
                <div className="border-t border-gray-100"></div>
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 cursor-pointer"
                onClick={() => {
                  logout();           // clears user/token
                  navigate("/login"); // redirect to login page
                }}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Close dropdowns when clicking outside */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};