import { Product } from "./product";
import { Address, User } from "./user";

export interface OrderItem {
  product: Product | string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  price: number;
}

export interface Order {
  _id: string;
  id: string;
  user: User | string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: Address;
  paymentMethod: string;
  paymentStatus?: "pending" | "paid" | "failed" | string;
  paymentId?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
