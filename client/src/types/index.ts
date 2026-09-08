import { Product, ProductVariant, ProductColor, ProductAttributes } from "./product";
import { AuthUser } from "./auth";

export type { Product, ProductVariant, ProductColor, ProductAttributes } from "./product";
export type { Address, User } from "./user";
export type { OrderItem, Order } from "./order";
export type {
  LoginRequest,
  RegisterRequest,
  AuthUser,
  LoginResponse,
  LogoutResponse,
} from "./auth";

export interface Category {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  colorCode?: string;
  variantId?: string;
  sku?: string;
  price?: number;
  image?: string;
  stock?: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Collection {
  _id?: string;
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
