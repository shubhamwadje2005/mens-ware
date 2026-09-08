export interface Product {
  _id?: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  hoverImage?: string;
  badge?: string;
  colors?: string[];
  sizes?: string[];
  slug: string;
  description?: string;
  stock?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
