"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User, Address } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string; removeAvatar?: boolean }) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<Address, "id">) => Promise<Address[] | void> | void;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void> | void;
  removeAddress: (id: string) => Promise<void> | void;
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

import { getBaseUrl } from "@/config/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("noir-current-user");
    let cachedPwd = localStorage.getItem("noir-user-pwd");
    // Clean up any accidentally cached admin password
    if (cachedPwd === "admin@3428") {
      localStorage.removeItem("noir-user-pwd");
      cachedPwd = null;
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.savedPassword === "admin@3428") {
          delete parsed.savedPassword;
        }
        if (!parsed.savedPassword && cachedPwd) {
          parsed.savedPassword = cachedPwd;
        }
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);

    if (token) {
      const API_BASE = getBaseUrl();
      fetch(`${API_BASE.replace(/\/$/, "")}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("noir-current-user");
              localStorage.removeItem("noir-user-pwd");
              setUser(null);
            }
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            let pwd = localStorage.getItem("noir-user-pwd") || undefined;
            if (pwd === "admin@3428") {
              localStorage.removeItem("noir-user-pwd");
              pwd = undefined;
            }
            if (!pwd) {
              const users = getStoredUsers();
              const found = users.find(
                (u) => u.email.toLowerCase() === data.email?.toLowerCase()
              );
              if (found?.password && found.password !== "admin@3428") {
                pwd = found.password;
                localStorage.setItem("noir-user-pwd", pwd);
              }
            }
            const userObj = {
              _id: data._id || data.id,
              id: data._id || data.id,
              name: data.name,
              email: data.email,
              phone: data.phone || (data.addresses && data.addresses[0]?.phone) || "",
              avatar: data.avatar,
              role: data.role,
              savedPassword: pwd,
              addresses: data.addresses || [],
            };
            setUser(userObj);
            localStorage.setItem("noir-current-user", JSON.stringify(userObj));
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
      const API_BASE = getBaseUrl();
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" };
      }
      localStorage.setItem("token", data.token);
      let pwdToSave = password;
      if (email === "shubhamwadje2005@gmail.com" || password === "admin@3428") {
        pwdToSave = "";
      }
      if (pwdToSave) {
        localStorage.setItem("noir-user-pwd", pwdToSave);
      } else {
        localStorage.removeItem("noir-user-pwd");
      }
      const userObj = {
        _id: data.user._id || data.user.id,
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || (data.user.addresses && data.user.addresses[0]?.phone) || "",
        avatar: data.user.avatar,
        role: data.user.role,
        savedPassword: pwdToSave || undefined,
        addresses: data.user.addresses || [],
      };
      setUser(userObj);
      localStorage.setItem("noir-current-user", JSON.stringify(userObj));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone?: string,
      avatar?: string
    ) => {
      try {
        const API_BASE = getBaseUrl();
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, avatar }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || "Registration failed" };
        }
        localStorage.setItem("token", data.token);
        if (password && password !== "admin@3428") {
          localStorage.setItem("noir-user-pwd", password);
        }
        const userObj = {
          _id: data.user._id || data.user.id,
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || phone || "",
          avatar: data.user.avatar || avatar,
          role: data.user.role,
          savedPassword: password && password !== "admin@3428" ? password : undefined,
          addresses: data.user.addresses || [],
        };
        setUser(userObj);
        localStorage.setItem("noir-current-user", JSON.stringify(userObj));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Network error" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("noir-current-user");
    localStorage.removeItem("noir-user-pwd");
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User> & { password?: string; removeAvatar?: boolean }) => {
      if (!user) return { success: false, error: "Not authenticated" };

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const API_BASE = getBaseUrl();
          const res = await fetch(`${API_BASE}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: data.name,
              phone: data.phone,
              avatar: data.avatar,
              password: data.password || undefined,
              removeAvatar: data.removeAvatar,
            }),
          });
          const resData = await res.json();
          if (!res.ok) {
            return {
              success: false,
              error: resData.message || "Failed to update profile",
            };
          }
          let pwd = data.password || user.savedPassword;
          if (pwd === "admin@3428") {
            pwd = undefined;
            localStorage.removeItem("noir-user-pwd");
          } else if (pwd) {
            localStorage.setItem("noir-user-pwd", pwd);
          }
          const updated: User = {
            ...user,
            name: resData.name || data.name || user.name,
            phone: resData.phone !== undefined ? resData.phone : (data.phone ?? user.phone),
            avatar: resData.avatar !== undefined ? resData.avatar : (data.avatar ?? user.avatar),
            savedPassword: pwd,
            addresses: resData.addresses || user.addresses,
          };
          setUser(updated);
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Network error during profile update",
          };
        }
      } else {
        const updated: User = {
          ...user,
          ...data,
          phone: data.phone ?? user.phone,
          savedPassword: data.password || user.savedPassword,
        };
        setUser(updated);
        return { success: true };
      }
    },
    [user]
  );

  const addAddress = useCallback(
    async (address: Omit<Address, "id">) => {
      if (!user) return;
      const tempId = Date.now().toString();
      const newAddress: Address = { ...address, id: tempId, _id: tempId };
      const updated = { ...user, addresses: [...user.addresses, newAddress] };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const API_BASE = getBaseUrl();
          const res = await fetch(`${API_BASE}/auth/address`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(address),
          });
          if (res.ok) {
            const serverAddresses = await res.json();
            if (Array.isArray(serverAddresses)) {
              setUser((prev) => (prev ? { ...prev, addresses: serverAddresses } : prev));
              return serverAddresses;
            }
          }
        } catch (err) {
          console.error("Failed to sync added address with server:", err);
        }
      }
      return updated.addresses;
    },
    [user]
  );

  const updateAddress = useCallback(
    async (id: string, addressData: Partial<Address>) => {
      if (!user) return;
      const updated = {
        ...user,
        addresses: user.addresses.map((a) =>
          ((a._id && a._id === id) || (a.id && a.id === id)) ? { ...a, ...addressData } : a
        ),
      };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token && id.length === 24) {
        try {
          const API_BASE = getBaseUrl();
          const res = await fetch(`${API_BASE}/auth/address/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addressData),
          });
          if (res.ok) {
            const serverAddresses = await res.json();
            if (Array.isArray(serverAddresses)) {
              setUser((prev) => (prev ? { ...prev, addresses: serverAddresses } : prev));
            }
          }
        } catch (err) {
          console.error("Failed to sync updated address with server:", err);
        }
      }
    },
    [user]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      if (!user) return;
      const updated = {
        ...user,
        addresses: user.addresses.filter((a) => (a._id || a.id) !== id),
      };
      setUser(updated);

      const token = localStorage.getItem("token");
      if (token && id.length === 24) {
        try {
          const API_BASE = getBaseUrl();
          const res = await fetch(`${API_BASE}/auth/address/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const serverAddresses = await res.json();
            if (Array.isArray(serverAddresses)) {
              setUser((prev) => (prev ? { ...prev, addresses: serverAddresses } : prev));
            }
          }
        } catch (err) {
          console.error("Failed to remove address on server:", err);
        }
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

      const token = localStorage.getItem("token");
      if (token && id.length === 24) {
        const API_BASE = getBaseUrl();
        fetch(`${API_BASE}/auth/address/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDefault: true }),
        }).catch(() => {});
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
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
