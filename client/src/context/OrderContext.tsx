"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Order, CartItem, Address, OrderItem } from "@/types";

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], total: number, address: Address, paymentMethod: string) => Order;
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = useCallback(
    (items: CartItem[], total: number, address: Address, paymentMethod: string): Order => {
      const orderItems: OrderItem[] = items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        price: item.product.price,
      }));

      const order: Order = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        user: "",
        items: orderItems,
        total,
        status: "confirmed",
        address,
        paymentMethod,
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    []
  );

  const getOrder = useCallback(
    (id: string) => {
      return orders.find((o) => o.id === id);
    },
    [orders]
  );

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
