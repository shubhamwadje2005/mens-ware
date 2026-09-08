"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Loader2,
  Lock,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import { getBaseUrl } from "@/config/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;

  customerName: string;

  customerEmail?: string;

  customerPhone?: string;

  onClose: () => void;

  onSuccess: (
    paymentId: string
  ) => void;
}

export default function RazorpayModal({
  isOpen,
  amount,
  customerName,
  customerEmail = "",
  customerPhone = "",
  onClose,
  onSuccess,
}: RazorpayModalProps) {
  const [isCreatingOrder, setIsCreatingOrder] =
    useState(false);

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const API_URL = getBaseUrl();

  const RAZORPAY_KEY_ID =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  // ============================================
  // RESET
  // ============================================

  useEffect(() => {
    if (!isOpen) {
      setIsCreatingOrder(false);
      setIsVerifying(false);
      setPaymentSuccess(false);
    }
  }, [isOpen]);

  // ============================================
  // LOAD RAZORPAY SCRIPT
  // ============================================

  const loadRazorpayScript =
    (): Promise<boolean> => {
      return new Promise((resolve) => {
        // Already loaded
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            () => resolve(true)
          );

          existingScript.addEventListener(
            "error",
            () => resolve(false)
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => {
          resolve(true);
        };

        script.onerror = () => {
          resolve(false);
        };

        document.body.appendChild(script);
      });
    };

  // ============================================
  // OPEN ACTUAL RAZORPAY CHECKOUT
  // ============================================

  const openRazorpayCheckout =
    async () => {
      try {
        // ----------------------------------------
        // Validate environment
        // ----------------------------------------

        if (!API_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL is missing"
          );
        }

        if (!RAZORPAY_KEY_ID) {
          throw new Error(
            "NEXT_PUBLIC_RAZORPAY_KEY_ID is missing"
          );
        }

        // ----------------------------------------
        // Load Razorpay
        // ----------------------------------------

        const loaded =
          await loadRazorpayScript();

        if (!loaded) {
          throw new Error(
            "Razorpay Checkout failed to load"
          );
        }

        // ----------------------------------------
        // Create Order
        // ----------------------------------------

        setIsCreatingOrder(true);

        const response =
          await fetch(
            `${API_URL}/payment/create-order`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                amount,

                customerName,

                customerEmail,

                customerPhone,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
            "Unable to create Razorpay order"
          );
        }

        const order = data.order;

        console.log(
          "Razorpay Order:",
          order
        );

        setIsCreatingOrder(false);

        // ----------------------------------------
        // Razorpay options
        // ----------------------------------------

        const options = {
          key: RAZORPAY_KEY_ID,

          amount: order.amount,

          currency: order.currency,

          name: "Noir Studio",

          description:
            "Noir Studio Order Payment",

          order_id: order.id,

          prefill: {
            name:
              customerName || "",

            email:
              customerEmail || "",

            contact:
              customerPhone || "",
          },

          notes: {
            customerName:
              customerName || "",

            customerEmail:
              customerEmail || "",
          },

          theme: {
            color: "#2563EB",
          },

          modal: {
            ondismiss: () => {
              console.log(
                "Razorpay Checkout closed"
              );

              setIsCreatingOrder(false);
            },
          },

          // --------------------------------------
          // SUCCESS
          // --------------------------------------

          handler:
            async (
              razorpayResponse: any
            ) => {
              try {
                console.log(
                  "Razorpay Success:",
                  razorpayResponse
                );

                setIsVerifying(true);

                // --------------------------------
                // VERIFY PAYMENT
                // --------------------------------

                const verifyResponse =
                  await fetch(
                    `${API_URL}/payment/verify`,
                    {
                      method: "POST",

                      headers: {
                        "Content-Type":
                          "application/json",
                      },

                      body: JSON.stringify({
                        razorpay_order_id:
                          razorpayResponse.razorpay_order_id,

                        razorpay_payment_id:
                          razorpayResponse.razorpay_payment_id,

                        razorpay_signature:
                          razorpayResponse.razorpay_signature,
                      }),
                    }
                  );

                const verifyData =
                  await verifyResponse.json();

                console.log(
                  "Verification Response:",
                  verifyData
                );

                if (
                  !verifyResponse.ok ||
                  !verifyData.success
                ) {
                  throw new Error(
                    verifyData.message ||
                    "Payment verification failed"
                  );
                }

                // --------------------------------
                // VERIFIED
                // --------------------------------

                setIsVerifying(false);

                setPaymentSuccess(true);

                setTimeout(() => {
                  onSuccess(
                    razorpayResponse.razorpay_payment_id
                  );
                }, 1000);
              } catch (error: any) {
                console.error(
                  "Payment Verification Error:",
                  error
                );

                setIsVerifying(false);

                alert(
                  error.message ||
                  "Payment verification failed"
                );
              }
            },
        };

        // ----------------------------------------
        // CREATE RAZORPAY INSTANCE
        // ----------------------------------------

        const razorpay =
          new window.Razorpay(
            options
          );

        // ----------------------------------------
        // PAYMENT FAILED
        // ----------------------------------------

        razorpay.on(
          "payment.failed",
          (response: any) => {
            const errorObj = response?.error || {};
            const failureReason =
              errorObj.description ||
              errorObj.reason ||
              response?.message ||
              "Payment failed. Please try again.";

            console.warn("Razorpay Payment Failed:", failureReason, {
              code: errorObj.code,
              description: errorObj.description,
              reason: errorObj.reason,
              step: errorObj.step,
              source: errorObj.source,
              order_id: errorObj.metadata?.order_id,
              payment_id: errorObj.metadata?.payment_id,
            });

            setIsCreatingOrder(false);
            setIsVerifying(false);

            alert(failureReason);
          }
        );

        // ----------------------------------------
        // OPEN REAL RAZORPAY
        // ----------------------------------------

        razorpay.open();
      } catch (error: any) {
        console.error(
          "Razorpay Error:",
          error
        );

        setIsCreatingOrder(false);

        setIsVerifying(false);

        alert(
          error.message ||
          "Unable to start Razorpay payment"
        );
      }
    };

  // ============================================
  // MODAL
  // ============================================

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
          }}
          className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-2xl"
        >
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <CreditCard
                  size={20}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-white">
                  Payment
                </h2>

                <p className="text-xs text-white/40">
                  Secure checkout
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={
                isCreatingOrder ||
                isVerifying
              }
              className="rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X size={19} />
            </button>
          </div>

          {/* ================================= */}
          {/* BODY */}
          {/* ================================= */}

          <div className="p-6">
            {isCreatingOrder ? (
              <div className="py-12 text-center">
                <Loader2
                  size={42}
                  className="mx-auto animate-spin text-blue-500"
                />

                <h3 className="mt-5 text-base font-semibold text-white">
                  Opening Razorpay...
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  Creating secure payment order
                </p>
              </div>
            ) : isVerifying ? (
              <div className="py-12 text-center">
                <Loader2
                  size={42}
                  className="mx-auto animate-spin text-blue-500"
                />

                <h3 className="mt-5 text-base font-semibold text-white">
                  Verifying payment...
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  Please wait while we verify your
                  transaction.
                </p>
              </div>
            ) : paymentSuccess ? (
              <div className="py-12 text-center">
                <CheckCircle2
                  size={58}
                  className="mx-auto text-emerald-400"
                />

                <h3 className="mt-5 text-xl font-bold text-white">
                  Payment Successful
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  Your payment has been verified.
                </p>
              </div>
            ) : (
              <>
                {/* CUSTOMER */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/40">
                    Customer
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {customerName}
                  </p>

                  {customerEmail && (
                    <p className="mt-1 text-xs text-white/40">
                      {customerEmail}
                    </p>
                  )}
                </div>

                {/* AMOUNT */}

                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-white">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* SECURITY */}

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <ShieldCheck
                    size={21}
                    className="text-blue-400"
                  />

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Secure Razorpay Checkout
                    </p>

                    <p className="mt-1 text-[10px] text-white/40">
                      UPI • Cards • Netbanking • Wallets
                    </p>
                  </div>
                </div>

                {/* PAY */}

                <button
                  onClick={
                    openRazorpayCheckout
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98]"
                >
                  <Lock size={16} />

                  Pay ₹{amount.toFixed(2)}
                </button>

                <p className="mt-4 text-center text-[10px] text-white/30">
                  Secure payment powered by Razorpay
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}