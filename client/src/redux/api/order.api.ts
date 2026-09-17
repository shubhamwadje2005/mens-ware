import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Order, Address } from "@/types";
import { getBaseUrl } from "@/config/api";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/orders`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const isAdminPath = window.location.pathname.startsWith("/admin");
        const token = isAdminPath
          ? (localStorage.getItem("adminToken") || localStorage.getItem("token"))
          : (localStorage.getItem("token") || localStorage.getItem("adminToken"));
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
        items: {
          product: string;
          variantId?: string;
          name?: string;
          image?: string;
          slug?: string;
          sku?: string;
          quantity: number;
          selectedSize?: string;
          selectedColor?: string;
          colorCode?: string;
          price?: number;
        }[];
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
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        // Instantly patch getAllOrders cache for 0ms delay
        const patchResultAll = dispatch(
          orderApi.util.updateQueryData("getAllOrders", undefined, (draft) => {
            const order = draft.find((o) => (o._id || o.id) === id);
            if (order) {
              order.status = status as any;
              if (status === "delivered") {
                order.paymentStatus = "paid";
              }
            }
          })
        );
        // Instantly patch getOrderById single order cache if loaded
        const patchResultSingle = dispatch(
          orderApi.util.updateQueryData("getOrderById", id, (draft) => {
            if (draft) {
              draft.status = status as any;
              if (status === "delivered") {
                draft.paymentStatus = "paid";
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResultAll.undo();
          patchResultSingle.undo();
        }
      },
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
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResultAll = dispatch(
          orderApi.util.updateQueryData("getAllOrders", undefined, (draft) => {
            const index = draft.findIndex((o) => (o._id || o.id) === id);
            if (index !== -1) draft.splice(index, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResultAll.undo();
        }
      },
      invalidatesTags: ["Order"],
    }),

    restoreOrder: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "PUT",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResultDeleted = dispatch(
          orderApi.util.updateQueryData("getDeletedOrders", undefined, (draft) => {
            const index = draft.findIndex((o) => (o._id || o.id) === id);
            if (index !== -1) draft.splice(index, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResultDeleted.undo();
        }
      },
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
