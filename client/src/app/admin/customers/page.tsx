"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Mail,
  MapPin,
  Trash2,
  ShieldCheck,
  Loader2,
  Phone,
  Copy,
  Check,
  MapPinned,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useGetAllUsersQuery, useDeleteUserMutation } from "@/redux/api/user.api";
import { StatCardsSkeleton, CustomerCardsSkeleton } from "@/components/admin/AdminSkeletons";

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useGetAllUsersQuery();
  const [deleteUserApi] = useDeleteUserMutation();
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const customersOnly = customers.filter((c) => c.role !== "admin");

  const filtered = customersOnly.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c._id || c.id)?.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const withAddressesCount = customersOnly.filter((c) => c.addresses && c.addresses.length > 0).length;
  const withPhoneCount = customersOnly.filter((c) => Boolean(c.phone)).length;

  const handleDelete = async (id: string, name?: string) => {
    if (confirm(`Are you sure you want to remove customer "${name || id}"?`)) {
      try {
        await deleteUserApi(id).unwrap();
      } catch (err: any) {
        console.error("Failed to delete user:", err);
        alert(err?.data?.message || "Failed to delete user.");
      }
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const metrics = [
    {
      id: "total",
      label: "Registered Customers",
      value: customersOnly.length.toString(),
      fullValue: `${customersOnly.length} Customers`,
      detail: "Total store shopper accounts",
      icon: Users,
      textColor: "text-neutral-900 dark:text-white",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      topGlow: "from-blue-500/50 via-indigo-500/20 to-transparent",
      pillText: "Accounts",
      pillStyle: "bg-neutral-100 text-neutral-600 border-black/10 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
    },
    {
      id: "addresses",
      label: "With Saved Addresses",
      value: withAddressesCount.toString(),
      fullValue: `${withAddressesCount} with Shipping Address`,
      detail: "Ready for instant checkout",
      icon: MapPinned,
      textColor: "text-[#ff6b00]",
      iconColor: "text-[#ff6b00]",
      iconBg: "bg-[#ff6b00]/10 border-[#ff6b00]/30",
      topGlow: "from-[#ff6b00]/60 via-[#ff8533]/30 to-transparent",
      pillText: "Verified Shipping",
      pillStyle: "bg-[#ff6b00]/10 text-[#ff8533] border-[#ff6b00]/30",
    },
    {
      id: "phone",
      label: "Phone Contact Ready",
      value: withPhoneCount.toString(),
      fullValue: `${withPhoneCount} with Phone Number`,
      detail: "Direct SMS / WhatsApp communication",
      icon: UserCheck,
      textColor: "text-emerald-400",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      topGlow: "from-emerald-500/50 via-teal-400/20 to-transparent",
      pillText: "Direct Reach",
      pillStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen text-neutral-900 dark:text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00]">
              <Users size={22} />
            </span>
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/40 mt-1.5">
            View registered customer profiles, saved delivery addresses, and contact info
          </p>
        </div>
      </motion.div>

      {/* Metrics Row */}
      {isLoading ? (
        <StatCardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: idx * 0.08,
              ease: [0.21, 1.02, 0.49, 0.99],
            }}
            whileHover={{
              y: -4,
              scale: 1.015,
              transition: { duration: 0.2 },
            }}
            className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#0a0a0a] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
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

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="relative mb-8"
      >
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by name, email, phone number, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] py-3.5 pl-11 pr-28 text-sm text-white placeholder-white/30 outline-none focus:border-[#ff6b00]/60 focus:ring-1 focus:ring-[#ff6b00]/30 transition-all shadow-inner"
        />
        {search && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {filtered.length} found
          </span>
        )}
      </motion.div>

      {/* Loading Skeleton / Empty State / Cards Grid */}
      {isLoading ? (
        <CustomerCardsSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/[0.08] bg-[#0c0c0c] py-20 px-4 text-center shadow-2xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] mx-auto mb-4">
            <Users size={30} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No customers found</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            {search ? `No results match "${search}". Try searching with a different name or email.` : "No registered customers yet in the database."}
          </p>
        </motion.div>
      ) : (
        /* Responsive Customer Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((c, idx) => {
            const userIdStr = c._id || c.id || "";
            const defaultAddress = c.addresses?.find((a: any) => a.isDefault) || c.addresses?.[0];
            const emailKey = `email-${userIdStr}`;
            const idKey = `id-${userIdStr}`;

            return (
              <motion.div
                key={userIdStr || idx}
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.05,
                  ease: [0.21, 1.02, 0.49, 0.99],
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#0a0a0a] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-[#ff6b00]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Luminous Top Glow Line */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00]/60 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Customer Info Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar with initial */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b00]/25 via-[#ff6b00]/15 to-amber-500/10 text-[#ff6b00] text-lg font-black border border-[#ff6b00]/30 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {c.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-neutral-900 dark:text-white group-hover:text-[#ff8533] transition-colors truncate">
                            {c.name || "Customer"}
                          </h3>
                          {c.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded-full border border-[#ff6b00]/30">
                              <ShieldCheck size={10} /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              CUSTOMER
                            </span>
                          )}
                        </div>

                        {/* Customer ID with quick copy */}
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-neutral-400 dark:text-white/40">
                          <span>ID:</span>
                          <span className="text-neutral-700 dark:text-white/70 font-semibold truncate max-w-[140px]" title={userIdStr}>
                            {userIdStr.length > 12 ? `${userIdStr.slice(0, 6)}...${userIdStr.slice(-4)}` : userIdStr}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(userIdStr, idKey)}
                            className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                            title="Copy Full ID"
                          >
                            {copiedKey === idKey ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Customer Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleDelete(userIdStr, c.name)}
                      className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-red-500/15 text-white/30 hover:text-red-400 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition-all shrink-0"
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>

                  {/* Customer Contact & Account Details */}
                  <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/[0.06]">
                    {/* Email row with full copy action */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.04]">
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <Mail size={13} className="text-[#ff6b00] shrink-0" />
                        <span className="text-neutral-500 dark:text-white/50 text-[11px] shrink-0 font-medium">Email:</span>
                        <span className="text-neutral-900 dark:text-white text-xs truncate font-medium" title={c.email}>
                          {c.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.email, emailKey)}
                        className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg text-neutral-400 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0"
                        title="Copy Email"
                      >
                        {copiedKey === emailKey ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Phone row if available */}
                    {c.phone && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.04] text-xs">
                        <Phone size={13} className="text-[#ff6b00] shrink-0" />
                        <span className="text-neutral-500 dark:text-white/50 text-[11px] shrink-0 font-medium">Phone:</span>
                        <span className="text-neutral-900 dark:text-white text-xs font-mono font-medium">{c.phone}</span>
                      </div>
                    )}

                    {/* Saved Addresses Count */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.04] text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#ff6b00] shrink-0" />
                        <span className="text-neutral-500 dark:text-white/50 text-[11px] font-medium">Saved Addresses:</span>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                        {c.addresses?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Default Address Section */}
                {defaultAddress ? (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1">
                        <MapPin size={11} /> Primary Shipping Address
                      </span>
                      {defaultAddress.city && (
                        <span className="text-[9px] font-bold text-neutral-600 dark:text-white/50 bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10">
                          {defaultAddress.city}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.05] text-[11px] text-neutral-700 dark:text-white/70 leading-relaxed font-medium">
                      <p className="text-neutral-900 dark:text-white font-semibold mb-0.5">{defaultAddress.name || c.name}</p>
                      <p className="line-clamp-2">
                        {[defaultAddress.addressLine1, defaultAddress.addressLine2, defaultAddress.city, defaultAddress.state, defaultAddress.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/[0.06]">
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.01] border border-dashed border-black/10 dark:border-white/10 text-center text-[10px] text-neutral-400 dark:text-white/30 font-medium">
                      No shipping address saved yet
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
