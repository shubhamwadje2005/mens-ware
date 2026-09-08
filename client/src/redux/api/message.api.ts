import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "https://server-mens-ware.vercel.app/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/messages`,
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
  tagTypes: ["Messages"],
  endpoints: (builder) => ({
    // Public: Send a contact message
    sendMessage: builder.mutation<
      { success: boolean; message: string; data?: MessageItem },
      { name: string; email: string; subject?: string; message: string }
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Messages"],
    }),

    // Admin: Get all messages
    getMessages: builder.query<
      { success: boolean; messages: MessageItem[]; unreadCount: number },
      void
    >({
      query: () => "",
      providesTags: ["Messages"],
    }),

    // Admin: Toggle read/unread
    toggleReadMessage: builder.mutation<
      { success: boolean; message: string; data: MessageItem },
      { id: string; isRead?: boolean }
    >({
      query: ({ id, isRead }) => ({
        url: `/${id}/read`,
        method: "PATCH",
        body: { isRead },
      }),
      invalidatesTags: ["Messages"],
    }),

    // Admin: Delete a message
    deleteMessage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useToggleReadMessageMutation,
  useDeleteMessageMutation,
} = messageApi;
