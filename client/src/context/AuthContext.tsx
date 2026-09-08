"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User, Address } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("noir-users");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem("noir-users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("noir-current-user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
    if (token) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      fetch(`${API_BASE.replace(/\/$/, "")}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("noir-current-user");
              setUser(null);
            }
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            const userObj = {
              _id: data._id || data.id,
              id: data._id || data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              avatar: data.avatar,
              role: data.role,
              addresses: data.addresses || [],
            };
            setUser(userObj);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (mounted && user) {
      localStorage.setItem("noir-current-user", JSON.stringify(user));
    } else if (mounted && !user) {
      localStorage.removeItem("noir-current-user");
    }
  }, [user, mounted]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const API_BASE = rawUrl.replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback to local storage users if offline / dev mock
        const users = getStoredUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (found) {
          const { password: _, ...userData } = found;
          setUser(userData);
          return { success: true };
        }
        return { success: false, error: data.message || "Invalid credentials" };
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      const userObj = {
        _id: data.user.id || data.user._id,
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        avatar: data.user.avatar,
        role: data.user.role,
        addresses: data.user.addresses || [],
      };
      setUser(userObj);
      return { success: true };
    } catch {
      // Offline fallback
      const users = getStoredUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (found) {
        const { password: _, ...userData } = found;
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: "Server unreachable" };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const API_BASE = rawUrl.replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Registration failed" };
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      const userObj = {
        _id: data.user.id || data.user._id,
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        addresses: data.user.addresses || [],
      };
      setUser(userObj);
      return { success: true };
    } catch {
      // Fallback local storage
      const users = getStoredUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email already registered" };
      }
      const newUser: StoredUser = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        name,
        email,
        password,
        addresses: [],
      };
      users.push(newUser);
      saveStoredUsers(users);
      const { password: _, ...userData } = newUser;
      setUser(userData);
      return { success: true };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("noir-current-user");
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User> & { password?: string }) => {
      if (!user) return { success: false, error: "Not authenticated" };
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const API_BASE = rawUrl.replace(/\/$/, "");
          const res = await fetch(`${API_BASE}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
          const contentType = res.headers.get("content-type");
          let resData: any = {};
          if (contentType && contentType.includes("application/json")) {
            resData = await res.json();
          } else {
            const rawText = await res.text();
            return {
              success: false,
              error: rawText.includes("Payload Too Large")
                ? "Image file is too large. Please select a smaller photo."
                : `Server returned invalid response (${res.status}).`,
            };
          }
          if (!res.ok) {
            return { success: false, error: resData.message || "Failed to update profile" };
          }
          const userObj = {
            _id: resData._id || resData.id,
            id: resData._id || resData.id,
            name: resData.name,
            email: resData.email,
            phone: resData.phone,
            avatar: resData.avatar,
            role: resData.role,
            addresses: resData.addresses || [],
          };
          setUser(userObj);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || "Failed to update profile" };
        }
      } else {
        const { password: _, ...profileData } = data;
        const updated = { ...user, ...profileData };
        setUser(updated);
        return { success: true };
      }
    },
    [user]
  );

  const addAddress = useCallback(
    (address: Omit<Address, "id">) => {
      if (!user) return;
      const newAddress: Address = { ...address, id: Date.now().toString() };
      const updated = { ...user, addresses: [...user.addresses, newAddress] };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token) {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const API_BASE = rawUrl.replace(/\/$/, "");
        fetch(`${API_BASE}/auth/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(address),
        }).catch(() => {});
      }
    },
    [user]
  );

  const updateAddress = useCallback(
    (id: string, addressData: Partial<Address>) => {
      if (!user) return;
      const updated = {
        ...user,
        addresses: user.addresses.map((a) =>
          (a._id || a.id) === id ? { ...a, ...addressData } : a
        ),
      };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token && id.length === 24) {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const API_BASE = rawUrl.replace(/\/$/, "");
        fetch(`${API_BASE}/auth/address/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressData),
        }).catch(() => {});
      }
    },
    [user]
  );

  const removeAddress = useCallback(
    (id: string) => {
      if (!user) return;
      const updated = {
        ...user,
        addresses: user.addresses.filter((a) => (a._id || a.id) !== id),
      };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token && id.length === 24) {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const API_BASE = rawUrl.replace(/\/$/, "");
        fetch(`${API_BASE}/auth/address/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    },
    [user]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      if (!user) return;
      const updated = {
        ...user,
        addresses: user.addresses.map((a) => ({
          ...a,
          isDefault: (a._id || a.id) === id,
        })),
      };
      setUser(updated);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
