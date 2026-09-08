"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getBaseUrl } from "@/config/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noir-admin");
      const token = localStorage.getItem("token");
      if (saved && token) {
        try {
          return JSON.parse(saved);
        } catch {
          localStorage.removeItem("noir-admin");
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("noir-admin");
    const token = localStorage.getItem("token");
    if (saved && token) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        setAdmin(null);
        localStorage.removeItem("noir-admin");
      }
    } else {
      setAdmin(null);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const API_BASE = getBaseUrl();
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || "Login failed" };

      const userObj = data.user || data.result || { name: "Admin", email, role: "admin" };
      const adminData: AdminUser = {
        id: userObj.id || userObj._id || "admin-1",
        name: userObj.name || "Admin",
        email: userObj.email || email,
        role: userObj.role || "admin",
      };

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminToken", data.token);
      }
      localStorage.setItem("noir-admin", JSON.stringify(adminData));
      setAdmin(adminData);
      return { success: true };
    } catch (err) {
      console.error("Admin Login Error:", err);
      return { success: false, error: "Server unreachable" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const API_BASE = getBaseUrl();
      await fetch(`${API_BASE}/auth/admin-logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Admin Logout API call error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("noir-admin");
      setAdmin(null);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAdminAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

