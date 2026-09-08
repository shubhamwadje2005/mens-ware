import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "@/types";
import { getBaseUrl } from "@/config/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/users`,
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => "",
      providesTags: ["User"],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/${id}`,
      providesTags: ["User"],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),

    updateUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} = userApi;
