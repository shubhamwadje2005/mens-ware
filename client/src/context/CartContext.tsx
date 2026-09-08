"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem, Product } from "@/types";

interface CartVariantData {
  variantId?: string;
  sku?: string;
  price?: number;
  image?: string;
  stock?: number;
  colorCode?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    size?: string,
    color?: string,
    variantData?: CartVariantData
  ) => void;
  removeItem: (productId: string, size?: string, color?: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
    variantId?: string
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (productId: string, size?: string, color?: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("noir-cart");
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
      localStorage.setItem("noir-cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback(
    (
      product: Product,
      size?: string,
      color?: string,
      variantData?: CartVariantData
    ) => {
      if (product.isAvailable === false) return;
      const productId = product._id || product.id || "";

      setItems((prev) => {
        const existing = prev.find((item) => {
          const itemProdId = item.product._id || item.product.id || "";
          if (variantData?.variantId && item.variantId) {
            return itemProdId === productId && item.variantId === variantData.variantId;
          }
          return (
            itemProdId === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          );
        });

        if (existing) {
          const maxStock = variantData?.stock !== undefined ? variantData.stock : itemMaxStock(existing);
          const nextQty = maxStock > 0 ? Math.min(existing.quantity + 1, maxStock) : existing.quantity + 1;

          return prev.map((item) => {
            const itemProdId = item.product._id || item.product.id || "";
            const isMatch =
              variantData?.variantId && item.variantId
                ? itemProdId === productId && item.variantId === variantData.variantId
                : itemProdId === productId &&
                  item.selectedSize === size &&
                  item.selectedColor === color;

            return isMatch ? { ...item, quantity: nextQty } : item;
          });
        }

        const newItem: CartItem = {
          product,
          quantity: 1,
          selectedSize: size,
          selectedColor: color,
          variantId: variantData?.variantId,
          sku: variantData?.sku,
          price: variantData?.price !== undefined ? variantData.price : product.price,
          image: variantData?.image || product.image,
          stock: variantData?.stock !== undefined ? variantData.stock : product.stock,
          colorCode: variantData?.colorCode,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, size?: string, color?: string, variantId?: string) => {
      setItems((prev) =>
        prev.filter((item) => {
          const itemProdId = item.product._id || item.product.id || "";
          if (variantId && item.variantId) {
            return !(itemProdId === productId && item.variantId === variantId);
          }
          return !(
            itemProdId === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          );
        })
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      size?: string,
      color?: string,
      variantId?: string
    ) => {
      if (quantity <= 0) {
        removeItem(productId, size, color, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          const itemProdId = item.product._id || item.product.id || "";
          const isMatch =
            variantId && item.variantId
              ? itemProdId === productId && item.variantId === variantId
              : itemProdId === productId &&
                item.selectedSize === size &&
                item.selectedColor === color;

          return isMatch ? { ...item, quantity } : item;
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.price !== undefined ? item.price : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const isInCart = useCallback(
    (productId: string, size?: string, color?: string, variantId?: string) => {
      return items.some((item) => {
        const itemProdId = item.product._id || item.product.id || "";
        if (variantId && item.variantId) {
          return itemProdId === productId && item.variantId === variantId;
        }
        return (
          itemProdId === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        );
      });
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function itemMaxStock(item: CartItem): number {
  return item.stock !== undefined ? item.stock : 999;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
