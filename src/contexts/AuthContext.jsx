import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../lib/BaseUrl";
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const storedRoles = localStorage.getItem("roles");
  const storedPermissions = localStorage.getItem("permissions");

  if (storedToken && storedUser) {
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
    setRoles(storedRoles ? JSON.parse(storedRoles) : []);
    setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
  }

  // Let React complete all state updates first
  setTimeout(() => setLoading(false), 0);
}, []);


  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${baseUrl}/auth/login`,
        credentials
      );

      // Save user, token, roles, and permissions from backend
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("roles", JSON.stringify(res.data.roles || []));
      localStorage.setItem(
        "permissions",
        JSON.stringify(res.data.permissions || [])
      );

      setToken(res.data.token);
      setUser(res.data.user);
      setRoles(res.data.roles || []);
      setPermissions(res.data.permissions || []);

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const hasRole = (role) => roles.includes(role);
  const hasPermission = (permission) => permissions.includes(permission);

  const value = {
    user,
    token,
    roles,
    permissions,
    login,
    logout,
    loading,
    error,
    clearError: () => setError(null),
    isAuthenticated: !!token,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
