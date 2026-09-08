import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Product } from "@/types";

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};



export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/products`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      Product[],
      { category?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.category) q.set("category", params.category);
        if (params?.search) q.set("search", params.search);
        if (params?.sort) q.set("sort", params.sort);
        if (params?.minPrice) q.set("minPrice", String(params.minPrice));
        if (params?.maxPrice) q.set("maxPrice", String(params.maxPrice));
        const qs = q.toString();
        return `${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Product"],
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: ["Product"],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/${id}`,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (data) => ({ url: "", method: "POST", body: data }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({ url: `/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),

    getDeletedProducts: builder.query<Product[], void>({
      query: () => "/deleted",
      providesTags: ["Product"],
    }),

    restoreProduct: builder.mutation<Product, string>({
      query: (id) => ({ url: `/${id}/restore`, method: "PUT" }),
      invalidatesTags: ["Product"],
    }),

    toggleProductAvailability: builder.mutation<
      { message: string; product: Product },
      { id: string; isAvailable?: boolean }
    >({
      query: ({ id, isAvailable }) => ({
        url: `/${id}/toggle-availability`,
        method: "PATCH",
        body: isAvailable !== undefined ? { isAvailable } : {},
      }),
      invalidatesTags: ["Product"],
    }),

    getCategories: builder.query<string[], void>({
      query: () => "/categories",
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetDeletedProductsQuery,
  useRestoreProductMutation,
  useToggleProductAvailabilityMutation,
  useGetCategoriesQuery,
} = productApi;
