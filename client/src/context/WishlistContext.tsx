"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WishlistItem, Product } from "@/types";

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("noir-wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("noir-wishlist", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback((product: Product) => {
    const productId = product._id || product.id;
    setItems((prev) => {
      if (prev.some((item) => (item.product._id || item.product.id) === productId)) {
        return prev;
      }
      return [...prev, { product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => (item.product._id || item.product.id) !== productId));
  }, []);

  const toggleItem = useCallback(
    (product: Product) => {
      const productId = product._id || product.id;
      if (items.some((item) => (item.product._id || item.product.id) === productId)) {
        removeItem(productId);
      } else {
        addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => (item.product._id || item.product.id) === productId);
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        totalItems: items.length,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
