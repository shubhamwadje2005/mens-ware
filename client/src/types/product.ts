export interface ProductImageItem {
  url: string;
  type?: "upload" | "url";
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  _id?: string;
  color: string;
  colorCode?: string;
  size: string;
  sku?: string;
  mrp?: number;
  sellingPrice: number;
  discount?: number;
  stock: number;
  images?: (ProductImageItem | string)[];
  isActive?: boolean;
}

export interface ProductColor {
  _id?: string;
  name: string;
  hex: string;
  images?: (ProductImageItem | string)[];
  skuCode?: string;
}

export interface ProductAttributes {
  fabric?: string;
  fit?: string;
  pattern?: string;
  sleeve?: string;
  collar?: string;
  occasion?: string;
  washCare?: string;
  countryOfOrigin?: string;
  material?: string;
  closure?: string;
  customAttributes?: Record<string, string>;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  brand?: string;
  category: string;
  subcategory?: string;
  productType?: string;
  sku?: string;
  tags?: string[];
  gender?: "Men" | "Women" | "Unisex" | "Boys" | "Girls" | "Kids" | string;
  status?: "Draft" | "Active" | "Inactive" | "Out of Stock" | string;

  price: number;
  originalPrice?: number;
  discount?: number;

  image: string;
  hoverImage?: string;
  images?: (ProductImageItem | string)[];

  colorOptions?: ProductColor[];
  colors?: string[];
  sizes?: string[];

  variants?: ProductVariant[];
  attributes?: ProductAttributes;

  stock?: number;
  lowStockThreshold?: number;

  badge?: "NEW" | "SALE" | "PREMIUM" | "LIMITED" | string | null;
  isAvailable?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
