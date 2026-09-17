"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAdmin } from "@/context/AdminContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
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
  ChevronRight,
  Menu,
  X,
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
      <div
        className={`flex items-center border-b border-black/10 dark:border-white/[0.06] transition-all duration-300 ${
          collapsed
            ? "justify-center px-2 py-4"
            : "justify-between px-4 py-4"
        }`}
      >
        {collapsed ? (
          /* Collapsed State: Logo with normal subtle chevron on hover */
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg p-1 text-neutral-500 hover:text-black hover:bg-black/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            {/* Logo Image */}
            <BrandLogo
              width={40}
              height={28}
              className="h-7 w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
              priority
            />

            {/* Hover Expand Icon: Normal chevron directly on the logo */}
            <ChevronRight
              size={18}
              className="absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          </button>
        ) : (
          /* Expanded State: Full Logo + Brand Name + Collapse Button */
          <>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 group shrink-0"
              title="Maitri Men's Wear Dashboard"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <BrandLogo
                  width={48}
                  height={32}
                  className="h-8.5 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 dark:text-white leading-tight truncate">
                  MAITRI<span className="text-[#ff6b00]">&mdash;</span>ADMIN
                </span>
                <span className="text-[7.5px] tracking-[0.2em] text-[#ff6b00] font-semibold uppercase leading-tight">
                  MEN&apos;S WEAR
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                  setCollapsed(true);
                } else {
                  setMobileOpen(false);
                }
              }}
              className="rounded-lg p-1.5 text-neutral-500 hover:text-black hover:bg-black/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <span className="hidden lg:inline-flex"><ChevronLeft size={16} /></span>
              <span className="lg:hidden inline-flex"><X size={18} /></span>
            </button>
          </>
        )}
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
      {/* Mobile top header bar with Brand Logo */}
      <div className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-black/10 dark:border-white/[0.06] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md px-4 lg:hidden shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-white/5 p-2 text-neutral-700 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <BrandLogo width={36} height={24} className="h-7 w-auto object-contain" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 dark:text-white">
              MAITRI<span className="text-[#ff6b00]">&mdash;</span>ADMIN
            </span>
          </Link>
        </div>
        <ThemeToggle variant="icon" />
      </div>

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
