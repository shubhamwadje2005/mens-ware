"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
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
    const productId = product._id || product.id || product.slug || "";
    setItems((prev) => {
      if (prev.some((item) => (item.product._id || item.product.id || item.product.slug) === productId)) {
        return prev;
      }
      return [...prev, { product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.filter((item) => (item.product._id || item.product.id || item.product.slug) !== productId)
    );
  }, []);

  const toggleItem = useCallback(
    (product: Product) => {
      const productId = product._id || product.id || product.slug || "";
      if (items.some((item) => (item.product._id || item.product.id || item.product.slug) === productId)) {
        removeItem(productId);
      } else {
        addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => (item.product._id || item.product.id || item.product.slug) === productId);
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.length;

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      toggleItem,
      isInWishlist,
      totalItems,
      clearWishlist,
    }),
    [items, addItem, removeItem, toggleItem, isInWishlist, totalItems, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
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
