"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Clock, CheckCircle, XCircle, Eye, Loader2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { StatCardsSkeleton, TableSkeleton } from "@/components/admin/AdminSkeletons";
import { useGetAllOrdersQuery } from "@/redux/api/order.api";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { useGetAllUsersQuery } from "@/redux/api/user.api";

export default function AdminDashboard() {
  const { data: apiOrders = [], isLoading: isLoadingOrders } = useGetAllOrdersQuery(undefined, { pollingInterval: 10000 });
  const { data: apiProducts = [], isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: apiUsers = [], isLoading: isLoadingUsers } = useGetAllUsersQuery();

  const totalRevenue = apiOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = apiOrders.length;
  const pendingOrders = apiOrders.filter(
    (o) => o.status === "pending" || (o.paymentStatus === "pending" && o.status !== "cancelled")
  ).length;
  const paidOrders = apiOrders.filter(
    (o) => o.paymentStatus === "paid" || o.status === "delivered" || o.status === "confirmed"
  ).length;
  const cancelledOrders = apiOrders.filter((o) => o.status === "cancelled").length;

  const recentOrders = apiOrders.slice(0, 5);
  const topProducts = apiProducts.slice(0, 5);

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingUsers;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      subtitle: "Gross store sales",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      badgeColor: "text-emerald-400",
      topGlow: "from-emerald-500/50 via-teal-400/20 to-transparent",
      pillText: "Revenue",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      subtitle: "All orders placed",
      icon: ShoppingCart,
      color: "text-[#ff6b00]",
      bg: "bg-[#ff6b00]/10 border-[#ff6b00]/30",
      badgeColor: "text-[#ff6b00]",
      topGlow: "from-[#ff6b00]/60 via-[#ff8533]/30 to-transparent",
      pillText: "Orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      subtitle: "Awaiting fulfillment",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      badgeColor: "text-amber-400",
      topGlow: "from-amber-500/50 via-yellow-400/20 to-transparent",
      pillText: "Pending",
    },
    {
      label: "Paid Orders",
      value: paidOrders.toString(),
      subtitle: "Payment confirmed",
      icon: CheckCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      badgeColor: "text-blue-400",
      topGlow: "from-blue-500/50 via-indigo-400/20 to-transparent",
      pillText: "Settled",
    },
    {
      label: "Cancelled Orders",
      value: cancelledOrders.toString(),
      subtitle: "Voided or cancelled",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      badgeColor: "text-red-400",
      topGlow: "from-red-500/50 via-rose-400/20 to-transparent",
      pillText: "Voided",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-1 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/40">
          Welcome back, Admin. Live orders overview and store metrics.
        </p>
      </motion.div>

      {/* Stats - Live Order Metrics */}
      {isLoading ? (
        <StatCardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.07,
                ease: [0.21, 1.02, 0.49, 0.99],
              }}
              whileHover={{
                y: -4,
                scale: 1.015,
                transition: { duration: 0.2 },
              }}
              className={`group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#0a0a0a] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
            >
              {/* Luminous Top Glow Line */}
              <div
                className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.topGlow} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 leading-tight">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${card.bg} group-hover:scale-110 transition-transform duration-200`}
                >
                  <card.icon size={15} className={card.color} />
                </div>
              </div>

              <div className="mt-3 min-w-0">
                <p
                  title={card.value}
                  className={`text-xl sm:text-2xl 2xl:text-3xl font-black tracking-tight leading-none truncate ${card.badgeColor}`}
                >
                  {card.value}
                </p>
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/[0.04]">
                  <span className="text-[10px] text-neutral-500 dark:text-white/40 truncate font-medium">
                    {card.subtitle}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-white/60 border border-black/5 dark:border-white/10">
                    {card.pillText}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Products */}
        <div className="lg:col-span-2 rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Top Products</h3>
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] hover:text-[#ff7a1a]">
              View All
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-white/30 py-6 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product._id || product.id} className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop"}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop";
                      }}
                      className="h-10 w-10 rounded-lg object-cover bg-neutral-100 dark:bg-white/5 border border-white/10"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-md">{product.name}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-white/40 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#ff6b00]">₹{product.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Quick Actions</h3>
            <span className="text-[10px] font-semibold text-[#ff6b00] uppercase tracking-wider">Shortcuts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 flex-1">
            <Link
              href="/admin/products"
              className="group flex items-center justify-between rounded-xl border border-black/10 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-3.5 hover:border-[#ff6b00]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6b00]/10 text-[#ff6b00]">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Products Studio</p>
                  <p className="text-[10px] text-neutral-500 dark:text-white/40">Manage & create products</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-white/30 group-hover:text-[#ff6b00] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/admin/orders"
              className="group flex items-center justify-between rounded-xl border border-black/10 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-3.5 hover:border-[#ff6b00]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6b00]/10 text-[#ff6b00]">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Orders Manager</p>
                  <p className="text-[10px] text-neutral-500 dark:text-white/40">Track customer orders</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-white/30 group-hover:text-[#ff6b00] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/admin/messages"
              className="group flex items-center justify-between rounded-xl border border-black/10 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-3.5 hover:border-[#ff6b00]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6b00]/10 text-[#ff6b00]">
                  <Eye size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Customer Inquiries</p>
                  <p className="text-[10px] text-neutral-500 dark:text-white/40">View contact messages</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-white/30 group-hover:text-[#ff6b00] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] hover:text-[#ff7a1a]">
            View All
          </Link>
        </div>
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-white/30 py-6 text-center">No orders yet in database</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/[0.06]">
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Order ID</th>
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Customer</th>
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Items</th>
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Total</th>
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Payment</th>
                  <th className="pb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-900 dark:text-neutral-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/[0.04]">
                {recentOrders.map((order: any) => {
                  const orderIdStr = order._id || order.id;
                  const customerName = order.address?.name || (order.user && typeof order.user === "object" ? order.user.name : "Customer");
                  const isOnline = order.paymentMethod?.toLowerCase().includes("online") || order.paymentMethod?.toLowerCase().includes("razorpay");

                  return (
                    <tr key={orderIdStr} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 text-xs font-mono font-bold text-[#ff6b00]">
                        #{orderIdStr.substring(Math.max(0, orderIdStr.length - 8))}
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-neutral-900 dark:text-white">{customerName}</td>
                      <td className="py-3.5 text-xs text-neutral-600 dark:text-white/60">{order.items?.length || 0} items</td>
                      <td className="py-3.5 text-xs font-bold text-neutral-900 dark:text-white">₹{order.total?.toLocaleString() || 0}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isOnline ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                          {isOnline ? "Online" : "COD"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${order.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                          order.status === "shipped" ? "bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20" :
                            order.status === "confirmed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}>{order.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
