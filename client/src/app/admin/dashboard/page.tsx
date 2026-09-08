"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingCart, Users, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useGetAllOrdersQuery } from "@/redux/api/order.api";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { useGetAllUsersQuery } from "@/redux/api/user.api";

export default function AdminDashboard() {
  const { data: apiOrders = [], isLoading: isLoadingOrders } = useGetAllOrdersQuery(undefined, { pollingInterval: 10000 });
  const { data: apiProducts = [], isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: apiUsers = [], isLoading: isLoadingUsers } = useGetAllUsersQuery();

  const totalRevenue = apiOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = apiOrders.length;
  const totalProducts = apiProducts.length;
  const totalCustomers = apiUsers.length;

  const recentOrders = apiOrders.slice(0, 5);
  const topProducts = apiProducts.slice(0, 5);

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingUsers;

  const statCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-[#ff6b00]", bg: "bg-[#ff6b00]/10" },
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-white/40">Welcome back, Admin. Here&apos;s your live store overview.</p>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#ff6b00]" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-white/40">{card.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon size={14} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

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
                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-neutral-100 dark:bg-white/5" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-white/40 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#ff6b00]">${product.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link href="/admin/products" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/[0.06] p-3.5 hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/5 transition-all">
              <Package size={18} className="text-[#ff6b00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-white/70 text-center">Products</span>
            </Link>
            <Link href="/admin/orders" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/[0.06] p-3.5 hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/5 transition-all">
              <ShoppingCart size={18} className="text-[#ff6b00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-white/70 text-center">Orders</span>
            </Link>
            <Link href="/admin/collections" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/[0.06] p-3.5 hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/5 transition-all">
              <Package size={18} className="text-[#ff6b00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-white/70 text-center">Collections</span>
            </Link>
            <Link href="/admin/customers" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/[0.06] p-3.5 hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/5 transition-all">
              <Users size={18} className="text-[#ff6b00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-white/70 text-center">Customers</span>
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
        {recentOrders.length === 0 ? (
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
                      <td className="py-3.5 text-xs font-bold text-neutral-900 dark:text-white">${order.total?.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isOnline ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                          {isOnline ? "Online" : "COD"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          order.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
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
