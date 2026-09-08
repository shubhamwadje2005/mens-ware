import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getApiBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "https://server-mens-ware.vercel.app/api";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};



export interface CreateOrderRequest {
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId: string;
  orderId: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/payment`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (data) => ({
        url: "/create-order",
        method: "POST",
        body: data,
      }),
    }),
    verifyRazorpayPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (data) => ({
        url: "/verify",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } = paymentApi;
