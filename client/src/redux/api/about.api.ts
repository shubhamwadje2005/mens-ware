import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface StatItem {
  value: string;
  label: string;
}

export interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

export interface AboutData {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  stats: StatItem[];
  storyBadge: string;
  storyHeading: string;
  storyParagraphs: string[];
  storyImage: string;
  storyEstYear: string;
  storyLocation: string;
  valuesHeading: string;
  values: ValueItem[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/about`,
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
  tagTypes: ["About"],
  endpoints: (builder) => ({
    getAbout: builder.query<{ success: boolean; about: AboutData | null }, void>({
      query: () => "",
      providesTags: ["About"],
    }),

    getAboutAdmin: builder.query<{ success: boolean; about: AboutData | null }, void>({
      query: () => "/admin",
      providesTags: ["About"],
    }),

    saveAbout: builder.mutation<
      { success: boolean; message: string; about: AboutData },
      Partial<AboutData>
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["About"],
    }),
  }),
});

export const {
  useGetAboutQuery,
  useGetAboutAdminQuery,
  useSaveAboutMutation,
} = aboutApi;
