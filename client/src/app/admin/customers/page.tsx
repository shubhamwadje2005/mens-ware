"use client";

import { useState } from "react";
import { Search, Users, Mail, MapPin, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useGetAllUsersQuery, useDeleteUserMutation } from "@/redux/api/user.api";

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useGetAllUsersQuery();
  const [deleteUserApi] = useDeleteUserMutation();
  const [search, setSearch] = useState("");

  const customersOnly = customers.filter((c) => c.role !== "admin");

  const filtered = customersOnly.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c._id || c.id)?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Remove this customer?")) {
      try {
        await deleteUserApi(id).unwrap();
      } catch (err: any) {
        console.error("Failed to delete user:", err);
        alert(err?.data?.message || "Failed to delete user.");
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Customers</h1>
          <p className="text-sm text-white/40">Total registered customers in database: <span className="font-bold text-[#ff6b00]">{customersOnly.length}</span></p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#ff6b00]" />
        </div>
      )}

      {!isLoading && filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] py-16 text-center">
          <Users size={40} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30">No customers found</p>
        </div>
      ) : !isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const userIdStr = c._id || c.id || "";
            return (
              <div key={userIdStr} className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5 hover:border-white/20 transition-all shadow-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-base font-bold border border-[#ff6b00]/30 shadow-md">
                      {c.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-white">{c.name || "Unnamed User"}</p>
                        {c.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#ff6b00] bg-[#ff6b00]/10 px-2.5 py-0.5 rounded-full border border-[#ff6b00]/30">
                            <ShieldCheck size={11} /> ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                            CUSTOMER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-white/40 mt-0.5 select-all">
                        ID: <span className="text-white/70">{userIdStr}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(userIdStr)}
                    className="rounded-lg p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center gap-2.5 text-xs text-white/70">
                    <Mail size={14} className="text-[#ff6b00] shrink-0" />
                    <span className="font-semibold text-white/40">Email:</span>
                    <span className="truncate text-white">{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <span className="text-[#ff6b00] shrink-0 font-bold text-xs">📞</span>
                      <span className="font-semibold text-white/40">Phone:</span>
                      <span className="text-white">{c.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-white/70">
                    <MapPin size={14} className="text-[#ff6b00] shrink-0" />
                    <span className="font-semibold text-white/40">Saved Addresses:</span>
                    <span className="text-white">{c.addresses?.length || 0}</span>
                  </div>
                </div>

                {c.addresses && c.addresses.length > 0 && (
                  <div className="border-t border-white/[0.06] pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b00] mb-1">Default Address</p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {c.addresses.find((a: any) => a.isDefault)?.addressLine1 || c.addresses[0]?.addressLine1},
                      {" "}{c.addresses.find((a: any) => a.isDefault)?.city || c.addresses[0]?.city}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
