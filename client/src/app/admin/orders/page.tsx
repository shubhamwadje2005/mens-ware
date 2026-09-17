"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Package, Truck, CheckCircle, Clock, CreditCard, Loader2, Eye, X, MapPin, User, Trash2, RotateCcw, AlertTriangle, DollarSign } from "lucide-react";
import {
  useGetAllOrdersQuery,
  useGetDeletedOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useRestoreOrderMutation,
} from "@/redux/api/order.api";
import { Order } from "@/types";
import { StatCardsSkeleton, TableSkeleton } from "@/components/admin/AdminSkeletons";
import { useToast } from "@/context/ToastContext";
import ToastContainer from "@/components/toast/ToastContainer";

export default function AdminOrdersPage() {
  const { data: apiOrders = [], isLoading } = useGetAllOrdersQuery(undefined, { pollingInterval: 10000 });
  const { data: deletedOrders = [], isLoading: isLoadingDeleted } = useGetDeletedOrdersQuery(undefined, { pollingInterval: 10000 });
  const [updateStatusApi] = useUpdateOrderStatusMutation();
  const [deleteOrderApi] = useDeleteOrderMutation();
  const [restoreOrderApi] = useRestoreOrderMutation();

  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const updateStatus = async (orderId: string, newStatus: string) => {
    // Instant optimistic modal update
    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    }
    setUpdatingOrderIds((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateStatusApi({ id: orderId, status: newStatus }).unwrap();
      addToast(`Order #${orderId.substring(Math.max(0, orderId.length - 6))} status updated to ${newStatus.toUpperCase()}`, "success");
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      addToast(err?.data?.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderIds((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderApi(orderId).unwrap();
      setOrderToDelete(null);
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const handleRestoreOrder = async (orderId: string) => {
    try {
      await restoreOrderApi(orderId).unwrap();
    } catch (err) {
      console.error("Failed to restore order:", err);
    }
  };

  const currentList = activeTab === "active" ? apiOrders : deletedOrders;

  const filtered = currentList.filter((o) => {
    const orderIdStr = o._id || o.id || "";
    const customerName = o.address?.name || (o.user && typeof o.user === "object" ? o.user.name : "");
    const matchSearch =
      orderIdStr.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcons: Record<string, any> = {
    pending: <Clock size={12} />,
    confirmed: <CheckCircle size={12} />,
    shipped: <Truck size={12} />,
    delivered: <Package size={12} />,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
    confirmed: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    shipped: "bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20",
    delivered: "bg-green-400/10 text-green-400 border border-green-400/20",
    cancelled: "bg-red-400/10 text-red-400 border border-red-400/20",
  };

  const totalRevenue = apiOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrdersCount = apiOrders.filter((o) => o.status === "pending").length;
  const shippedOrdersCount = apiOrders.filter((o) => o.status === "shipped").length;
  const deliveredOrdersCount = apiOrders.filter((o) => o.status === "delivered").length;

  const orderMetrics = [
    {
      id: "total-orders",
      label: "Total Orders",
      value: apiOrders.length.toLocaleString(),
      fullValue: `${apiOrders.length} Orders`,
      detail: "All active orders in store",
      icon: Package,
      textColor: "text-neutral-900 dark:text-white",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      topGlow: "from-blue-500/50 via-indigo-500/20 to-transparent",
      pillText: "Orders",
      pillStyle: "bg-neutral-100 text-neutral-600 border-black/10 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
    },
    {
      id: "revenue",
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      fullValue: `₹${totalRevenue.toLocaleString()}`,
      detail: "Gross order sales value",
      icon: DollarSign,
      textColor: "text-[#ff6b00]",
      iconColor: "text-[#ff6b00]",
      iconBg: "bg-[#ff6b00]/10 border-[#ff6b00]/30",
      topGlow: "from-[#ff6b00]/60 via-[#ff8533]/30 to-transparent",
      pillText: "Gross Sales",
      pillStyle: "bg-[#ff6b00]/10 text-[#ff8533] border-[#ff6b00]/30",
    },
    {
      id: "pending",
      label: "Pending Orders",
      value: pendingOrdersCount.toLocaleString(),
      fullValue: `${pendingOrdersCount} Pending`,
      detail: "Awaiting fulfillment / COD",
      icon: Clock,
      textColor: "text-amber-400",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      topGlow: "from-amber-500/50 via-yellow-400/20 to-transparent",
      pillText: "Awaiting",
      pillStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      id: "shipped",
      label: "In Transit / Shipped",
      value: shippedOrdersCount.toLocaleString(),
      fullValue: `${shippedOrdersCount} Shipped`,
      detail: "On the way to customer",
      icon: Truck,
      textColor: "text-blue-400",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      topGlow: "from-blue-500/50 via-indigo-400/20 to-transparent",
      pillText: "In Transit",
      pillStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: "delivered",
      label: "Delivered Orders",
      value: deliveredOrdersCount.toLocaleString(),
      fullValue: `${deliveredOrdersCount} Delivered`,
      detail: "Fulfilled customer orders",
      icon: CheckCircle,
      textColor: "text-emerald-400",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      topGlow: "from-emerald-500/50 via-teal-400/20 to-transparent",
      pillText: "Completed",
      pillStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00]">
              <Truck size={22} />
            </span>
            <span>Orders Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/40 mt-1.5">
            {activeTab === "active"
              ? `${apiOrders.length} active orders placed in store`
              : `${deletedOrders.length} deleted orders in history archive`}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-white/[0.04] p-1.5 border border-black/10 dark:border-white/10 self-start sm:self-auto shadow-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === "active"
                ? "bg-[#ff6b00] text-black shadow-[0_4px_16px_rgba(255,107,0,0.35)]"
                : "text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
            }`}
          >
            Active Orders ({apiOrders.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab("deleted")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "deleted"
                ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_4px_16px_rgba(239,68,68,0.25)]"
                : "text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
            }`}
          >
            <Trash2 size={13} /> Deleted History ({deletedOrders.length})
          </motion.button>
        </div>
      </motion.div>

      {/* Metrics Row */}
      {isLoading || isLoadingDeleted ? (
        <StatCardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
        {orderMetrics.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: idx * 0.07,
              ease: [0.21, 1.02, 0.49, 0.99],
            }}
            whileHover={{
              y: -4,
              scale: 1.015,
              transition: { duration: 0.2 },
            }}
            className={`group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#0a0a0a] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between ${
              idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            {/* Luminous Top Glow Line */}
            <div
              className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${m.topGlow} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 leading-tight">
                {m.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${m.iconBg} group-hover:scale-110 transition-transform duration-200`}
              >
                <m.icon size={15} className={m.iconColor} />
              </div>
            </div>

            <div className="mt-3 min-w-0">
              <p
                title={m.fullValue}
                className={`text-xl sm:text-2xl 2xl:text-3xl font-black tracking-tight leading-none truncate ${m.textColor}`}
              >
                {m.value}
              </p>
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 dark:text-white/40 truncate font-medium">
                  {m.detail}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 border ${m.pillStyle}`}
                >
                  {m.pillText}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] py-3 pl-11 pr-4 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]/50 transition-colors shadow-inner"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] px-4 py-3 pr-8 text-sm text-neutral-700 dark:text-white/60 outline-none focus:border-[#ff6b00]/50 transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30 pointer-events-none" />
        </div>
      </motion.div>

      {/* Orders Table */}
      {(isLoading || isLoadingDeleted) ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] py-16 text-center shadow-sm">
          <Package size={40} className="mx-auto mb-3 text-neutral-300 dark:text-white/10" />
          <p className="text-sm text-neutral-500 dark:text-white/30">
            {activeTab === "active" ? "No active orders found" : "No deleted orders in history"}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] overflow-hidden shadow-sm dark:shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/[0.06] bg-neutral-50/80 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Order ID</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Customer</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Products Ordered</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Total</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Payment Method</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Payment Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">
                    {activeTab === "active" ? "Date" : "Deleted Date"}
                  </th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Order Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/30">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/[0.04]">
                {filtered.map((order) => {
                  const orderIdStr = order._id || order.id;
                  const customerName = order.address?.name || (order.user && typeof order.user === "object" ? order.user.name : "Customer");
                  const isOnline = order.paymentMethod?.toLowerCase().includes("online") || order.paymentMethod?.toLowerCase().includes("razorpay");
                  const isPaid = order.paymentStatus === "paid" || order.status === "delivered" || isOnline;

                  return (
                    <tr
                      key={orderIdStr}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 text-xs font-mono font-medium text-[#ff6b00] group-hover:underline">
                        #{orderIdStr.substring(Math.max(0, orderIdStr.length - 8))}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-white">{customerName}</p>
                        {order.address?.phone && (
                          <p className="text-[10px] text-white/60 font-medium">📞 {order.address.phone}</p>
                        )}
                        {typeof order.user === "object" && order.user?.email && (
                          <p className="text-[10px] text-[#ff6b00]/80">{order.user.email}</p>
                        )}
                        {order.address?.city && (
                          <p className="text-[9px] text-white/40 mt-0.5">📍 {order.address.city}, {order.address.state}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {order.items?.map((item: any, idx: number) => {
                            const productObj = item.product && typeof item.product === "object" ? item.product : null;
                            const prodName = item.name || productObj?.name || (typeof item.product === "string" ? item.product : "Product");
                            const prodImg = item.image || productObj?.image || null;
                            return (
                              <div key={idx} className="flex flex-col gap-0.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-1.5">
                                  {prodImg && <img src={prodImg} alt={prodName} className="h-6 w-6 rounded object-cover shrink-0" />}
                                  <span className="text-xs text-white max-w-[120px] truncate font-medium">{prodName}</span>
                                  <span className="text-[10px] text-[#ff6b00] font-bold">x{item.quantity}</span>
                                </div>
                                {(item.selectedColor || item.selectedSize) && (
                                  <span className="text-[10px] text-[#ff8533] font-medium pl-1">
                                    {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-white">${order.total?.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                              <CreditCard size={11} /> Online Payment
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                              <Truck size={11} /> Cash on Delivery
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={10} /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-yellow-400 border border-yellow-500/20">
                            <Clock size={10} /> PENDING (COD)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[10px] text-white/30">
                        {activeTab === "active"
                          ? order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
                          : order.deletedAt ? new Date(order.deletedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[order.status] || "bg-white/10 text-white"}`}>
                          {statusIcons[order.status] || null} {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg p-1.5 text-white/40 hover:text-[#ff6b00] hover:bg-white/5 transition-colors"
                            title="View Full Order Details"
                          >
                            <Eye size={16} />
                          </button>

                          {activeTab === "active" ? (
                            <>
                              <div className="relative flex items-center">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateStatus(orderIdStr, e.target.value)}
                                  className="appearance-none rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] px-2.5 py-1.5 pr-6 text-[10px] font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00] cursor-pointer transition-all shadow-xs"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                                {updatingOrderIds[orderIdStr] ? (
                                  <Loader2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff6b00] animate-spin pointer-events-none" />
                                ) : (
                                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30 pointer-events-none" />
                                )}
                              </div>
                              <button
                                onClick={() => setOrderToDelete(orderIdStr)}
                                className="rounded-lg p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestoreOrder(orderIdStr)}
                              className="rounded-lg px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                              title="Restore Order"
                            >
                              <RotateCcw size={12} /> Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-2xl text-white space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-white">Order Details</h2>
                    <span className="text-xs font-mono text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded-full border border-[#ff6b00]/20">
                      #{selectedOrder._id || selectedOrder.id}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-2 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Update Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[selectedOrder.status] || "bg-white/10 text-white"}`}>
                    {statusIcons[selectedOrder.status]} {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">Change Status:</span>
                  <div className="relative flex items-center">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                      className="appearance-none rounded-lg border border-[#ff6b00]/30 bg-white dark:bg-[#141414] px-3 py-1.5 pr-7 text-xs font-semibold text-[#ff6b00] outline-none focus:border-[#ff6b00] cursor-pointer shadow-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    {updatingOrderIds[selectedOrder._id || selectedOrder.id] ? (
                      <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff6b00] animate-spin pointer-events-none" />
                    ) : (
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff6b00] pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#ff6b00] uppercase tracking-wider mb-1">
                    <User size={14} /> Customer Info
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.address?.name || (typeof selectedOrder.user === "object" ? selectedOrder.user.name : "Customer")}
                  </p>
                  {typeof selectedOrder.user === "object" && selectedOrder.user.email && (
                    <p className="text-xs text-white/50">{selectedOrder.user.email}</p>
                  )}
                  <p className="text-xs text-white/60">Phone: {selectedOrder.address?.phone || "N/A"}</p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#ff6b00] uppercase tracking-wider mb-1">
                    <MapPin size={14} /> Delivery Address
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {selectedOrder.address?.addressLine1}
                    {selectedOrder.address?.addressLine2 ? `, ${selectedOrder.address.addressLine2}` : ""}
                    <br />
                    {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-[#ff6b00]" />
                  <div>
                    <p className="text-xs font-medium text-white/50">Payment Method</p>
                    <p className="text-sm font-semibold text-white">{selectedOrder.paymentMethod || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/50 mb-0.5">Payment Status</p>
                  {selectedOrder.paymentStatus === "paid" || selectedOrder.status === "delivered" || selectedOrder.paymentMethod?.toLowerCase().includes("online") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold uppercase text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={12} /> PAID
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-bold uppercase text-yellow-400 border border-yellow-500/20">
                      <Clock size={12} /> PENDING (COD)
                    </span>
                  )}
                </div>
                {selectedOrder.paymentId && (
                  <div>
                    <p className="text-xs font-medium text-white/50">Transaction ID</p>
                    <p className="text-xs font-mono text-[#ff6b00]">{selectedOrder.paymentId}</p>
                  </div>
                )}
              </div>

              {/* Ordered Products Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Ordered Products</h3>
                <div className="rounded-xl border border-white/[0.06] bg-[#121212] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Item</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Size / Color</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Price</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Qty</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {selectedOrder.items?.map((item: any, i: number) => {
                        const productObj = item.product && typeof item.product === "object" ? item.product : null;
                        const prodName = item.name || productObj?.name || (typeof item.product === "string" ? item.product : "Product");
                        const prodImg = item.image || productObj?.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop";
                        const itemPrice = item.price || productObj?.price || 0;
                        const subtotal = itemPrice * item.quantity;

                        return (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={prodImg} alt={prodName} className="h-10 w-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-xs font-medium text-white">{prodName}</p>
                                  {productObj?.category && (
                                    <p className="text-[10px] text-white/40">{productObj.category}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/60">
                              <div className="flex items-center gap-2">
                                {item.selectedSize && <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">{item.selectedSize}</span>}
                                {item.selectedColor && (
                                  <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white font-medium">
                                    {item.colorCode && (
                                      <span className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: item.colorCode }} />
                                    )}
                                    {item.selectedColor}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-white">${itemPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-xs font-bold text-[#ff6b00]">x{item.quantity}</td>
                            <td className="px-4 py-3 text-xs font-bold text-white">${subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Total */}
              <div className="flex justify-end border-t border-white/[0.06] pt-4">
                <div className="text-right space-y-1">
                  <span className="text-xs text-white/50 block">Grand Total</span>
                  <span className="text-xl font-bold text-[#ff6b00]">${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setOrderToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0d0d0d] p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Delete Order?</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Are you sure you want to delete order <span className="font-mono text-[#ff6b00]">#{orderToDelete.substring(Math.max(0, orderToDelete.length - 8))}</span>? It will be moved to the Deleted Orders History view and hidden from the user.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(orderToDelete)}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
