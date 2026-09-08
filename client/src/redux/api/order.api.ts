import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Order, Address } from "@/types";

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};



export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/orders`,
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
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      Order,
      {
        items: { product: string; quantity: number; selectedSize?: string; selectedColor?: string }[];
        address: Address;
        paymentMethod?: string;
        paymentStatus?: string;
        paymentId?: string;
      }
    >({
      query: (data) => ({ url: "", method: "POST", body: data }),
      invalidatesTags: ["Order"],
    }),

    getUserOrders: builder.query<Order[], void>({
      query: () => "",
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<Order, string>({
      query: (id) => `/${id}`,
      providesTags: ["Order"],
    }),

    getAllOrders: builder.query<Order[], void>({
      query: () => "/all",
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),

    getDeletedOrders: builder.query<Order[], void>({
      query: () => "/deleted",
      providesTags: ["Order"],
    }),

    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),

    restoreOrder: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useGetDeletedOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useRestoreOrderMutation,
} = orderApi;
