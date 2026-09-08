"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useGetUserOrdersQuery } from "@/redux/api/order.api";
import { Package, ArrowLeft, Truck, CheckCircle, Clock, Loader2 } from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const { orders: contextOrders } = useOrders();
  const { data: apiOrders = [], isLoading } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 10000,
  });

  const orders = apiOrders.length > 0 ? apiOrders : contextOrders;

  if (!isAuthenticated) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Package size={64} className="mx-auto mb-6 text-white/10" />
              <h1 className="text-3xl font-light text-white mb-3">Sign In Required</h1>
              <p className="text-white/40 mb-8">Please sign in to view your orders.</p>
              <Link href="/auth?redirect=/orders" className="btn-pill btn-pill-gold">Sign In</Link>
            </motion.div>
          </div>
        </main>
      </SmoothScrollProvider>
    );
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={14} className="text-yellow-400" />,
    confirmed: <CheckCircle size={14} className="text-blue-400" />,
    shipped: <Truck size={14} className="text-[#ff6b00]" />,
    delivered: <CheckCircle size={14} className="text-green-400" />,
    cancelled: <Clock size={14} className="text-red-400" />,
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    confirmed: "text-blue-400 bg-blue-400/10",
    shipped: "text-[#ff6b00] bg-[#ff6b00]/10",
    delivered: "text-green-400 bg-green-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <h1 className="text-3xl font-light tracking-tight text-white sm:text-5xl mb-8">
              My <span className="text-[#ff6b00]">Orders</span>
            </h1>

            {isLoading ? (
              <div className="flex h-[50vh] items-center justify-center">
                <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={64} className="mx-auto mb-6 text-white/10" />
                <h2 className="text-xl font-light text-white mb-3">No Orders Yet</h2>
                <p className="text-white/40 mb-8">Start shopping to see your orders here.</p>
                <Link href="/shop" className="btn-pill btn-pill-gold">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const idStr = order._id || order.id;
                  return (
                    <div key={idStr} className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-white/30 mb-1">Order ID</p>
                          <p className="text-sm font-medium text-[#ff6b00]">#{idStr.substring(Math.max(0, idStr.length - 8))}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 mb-4">
                        {order.items?.map((item: any, i: number) => {
                          const productObj = item.product && typeof item.product === 'object' ? item.product : null;
                          const prodName = item.name || productObj?.name || (typeof item.product === 'string' ? item.product : "Product Item");
                          const prodImg = item.image || productObj?.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop";
                          const rawSlug = item.slug || productObj?.slug;
                          const fallbackSlug = prodName && prodName !== "Product Item"
                            ? prodName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
                            : "midnight-oversized-tee";
                          const targetSlug = rawSlug || fallbackSlug;
                          const itemPrice = item.price || productObj?.price || 0;

                          return (
                            <Link key={i} href={`/product/${targetSlug}`} className="block">
                              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 hover:border-[#ff6b00]/40 hover:bg-white/[0.05] transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <img src={prodImg} alt={prodName} className="h-12 w-12 rounded-lg object-cover group-hover:scale-105 transition-transform" />
                                  <div>
                                    <p className="text-xs font-semibold text-white group-hover:text-[#ff6b00] transition-colors flex items-center gap-1.5">
                                      {prodName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.selectedSize && (
                                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/70">
                                          Size: {item.selectedSize}
                                        </span>
                                      )}
                                      {item.selectedColor && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] text-white/40">Color:</span>
                                          <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: item.selectedColor }} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-[#ff6b00]">x{item.quantity}</span>
                                  {itemPrice > 0 && <p className="text-xs text-white/60 font-medium mt-0.5">${itemPrice.toFixed(2)}</p>}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <div className="text-xs text-white/30">
                          {order.createdAt && new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm font-bold text-white">
                          Total: <span className="text-[#ff6b00]">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
