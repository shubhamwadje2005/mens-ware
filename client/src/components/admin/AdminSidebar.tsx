"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  Layers,
  BookOpen,
  MessageSquare,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Collections", href: "/admin/collections", icon: Layers },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Campaigns", href: "/admin/campaign", icon: Megaphone },
  { label: "About Us", href: "/admin/about", icon: BookOpen },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/[0.06] px-4 py-5">
        {!collapsed && (
          <Link href="/admin/dashboard" className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
            NOIR<span className="text-[#ff6b00]">&mdash;</span>ADMIN
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-neutral-500 hover:text-black hover:bg-black/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 lg:block"
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 p-3">
        {sidebarLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                active
                  ? "bg-[#ff6b00]/15 text-[#c2410c] dark:text-[#ff6b00] font-bold shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white font-medium"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <link.icon size={18} className={active ? "text-[#c2410c] dark:text-[#ff6b00]" : "text-current"} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User Info */}
      <div className="border-t border-black/10 dark:border-white/[0.06] p-3 space-y-3">
        <div className={`flex items-center justify-between px-2 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">Theme Mode</span>}
          <ThemeToggle variant="switch" />
        </div>
        {!collapsed && (
          <div className="mb-1 px-2">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">{admin?.name}</p>
            <p className="text-[10px] text-neutral-500 dark:text-white/30 truncate">{admin?.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-2 text-neutral-700 dark:text-white/60 lg:hidden shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-64 bg-white dark:bg-[#0a0a0a] border-r border-black/10 dark:border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#0a0a0a] border-r border-black/10 dark:border-white/[0.06] transition-all duration-300 ${collapsed ? "w-[68px]" : "w-64"}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
