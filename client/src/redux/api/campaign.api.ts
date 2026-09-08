import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Campaign {
  _id: string;
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "https://server-mens-ware.vercel.app/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};



export const campaignApi = createApi({
  reducerPath: "campaignApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/campaign`,
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
  tagTypes: ["Campaign"],
  endpoints: (builder) => ({
    getActiveCampaign: builder.query<{ success: boolean; campaign: Campaign }, void>({
      query: () => "/active",
      providesTags: ["Campaign"],
    }),

    getAllCampaigns: builder.query<{ success: boolean; campaigns: Campaign[] }, void>({
      query: () => "/all",
      providesTags: ["Campaign"],
    }),

    createCampaign: builder.mutation<
      { success: boolean; message: string; campaign: Campaign },
      Partial<Campaign>
    >({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),

    updateCampaign: builder.mutation<
      { success: boolean; message: string; campaign: Campaign },
      { id: string; data: Partial<Campaign> }
    >({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),

    deleteCampaign: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
  }),
});

export const {
  useGetActiveCampaignQuery,
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignApi;
