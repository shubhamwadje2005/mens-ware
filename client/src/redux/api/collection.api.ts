import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Collection } from "@/types";

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};




export const collectionApi = createApi({
  reducerPath: "collectionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/collections`,
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
  tagTypes: ["Collection"],
  endpoints: (builder) => ({
    getActiveCollections: builder.query<Collection[], void>({
      query: () => "",
      providesTags: ["Collection"],
    }),

    getAllCollections: builder.query<Collection[], void>({
      query: () => "/all",
      providesTags: ["Collection"],
    }),

    createCollection: builder.mutation<Collection, Partial<Collection>>({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Collection"],
    }),

    updateCollection: builder.mutation<Collection, { id: string; data: Partial<Collection> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Collection"],
    }),

    deleteCollection: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Collection"],
    }),
  }),
});

export const {
  useGetActiveCollectionsQuery,
  useGetAllCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionApi;
