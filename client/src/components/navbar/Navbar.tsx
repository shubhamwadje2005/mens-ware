"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, Menu, X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSearch } from "@/context/SearchContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showUserMenu]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "border-b border-transparent bg-black/50 backdrop-blur-md"
        }`}
      >
        <nav className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 md:px-8">
          <div className="flex h-16 items-center justify-between md:h-[72px] lg:h-20">
            {/* Logo - Left */}
            <Link href="/" className="shrink-0">
              <span className="text-[15px] font-light uppercase tracking-[0.18em] text-white sm:text-base md:text-lg lg:text-xl">
                NOIR
                <span className="ml-1 text-[#ff6b00]">&mdash;</span>
                <span className="hidden sm:inline">STUDIO</span>
              </span>
            </Link>

            {/* Nav Items - Center */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex xl:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition-all duration-300 hover:text-white lg:text-[12px] xl:text-[13px]"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#ff6b00] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Icons - Right */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-3.5">
              {/* Theme Switch Toggle */}
              <ThemeToggle />

              {/* Search */}
              <button
                onClick={openSearch}
                aria-label="Search products"
                className="hidden text-white/60 transition-colors hover:text-white lg:block"
              >
                <Search
                  size={18}
                  strokeWidth={1.6}
                  className="transition-transform duration-300 hover:scale-110"
                />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative hidden text-white/60 transition-colors hover:text-white lg:block"
              >
                <Heart
                  size={18}
                  strokeWidth={1.6}
                  className="transition-transform duration-300 hover:scale-110"
                />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b00] text-[9px] font-bold text-black">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative text-white/60 transition-colors hover:text-white"
              >
                <ShoppingBag
                  size={18}
                  strokeWidth={1.6}
                  className="transition-transform duration-300 hover:scale-110"
                />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b00] text-[10px] font-bold text-black shadow-lg">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    aria-label="User profile menu"
                    className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:border-[#ff6b00]/50 hover:text-white"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={14} />
                    )}
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60 transition-all hover:border-[#ff6b00]/50 hover:text-white lg:flex"
                  >
                    <User size={12} />
                    Sign In
                  </Link>
                )}

                <AnimatePresence>
                  {showUserMenu && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 border-b border-white/10 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/10 font-bold text-sm text-[#ff6b00]">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            user?.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-[#ff6b00] transition-colors truncate">{user?.name}</p>
                          <p className="text-xs text-white/40 truncate">{user?.email}</p>
                          <span className="text-[10px] text-[#ff6b00] font-semibold block mt-0.5">Edit Profile &rarr;</span>
                        </div>
                      </Link>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/profile?tab=addresses"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Addresses
                        </Link>

                        {/* Theme row in dropdown */}
                        <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-sm text-white/60">
                          <span>Theme</span>
                          <ThemeToggle variant="switch" />
                        </div>

                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="text-white/60 transition-colors hover:text-white lg:hidden"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-full flex-col items-center justify-center px-6">
              <motion.button
                className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center text-white"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <X size={24} />
              </motion.button>
              <nav className="flex flex-col items-center gap-6 sm:gap-8">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={item.href}
                      className="text-2xl font-light uppercase tracking-[0.25em] text-white transition-all duration-300 hover:translate-x-2 hover:text-[#ff6b00] sm:text-4xl"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Theme Switcher in Mobile Drawer */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 + navItems.length * 0.05, duration: 0.4 }}
                  className="mt-2 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2"
                >
                  <span className="text-xs uppercase tracking-widest text-white/70">Mode</span>
                  <ThemeToggle variant="switch" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 + (navItems.length + 1) * 0.05, duration: 0.4 }}
                  className="mt-2 flex gap-6"
                >
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      openSearch();
                    }}
                    aria-label="Search"
                    className="text-white/60 hover:text-white"
                  >
                    <Search size={20} />
                  </button>
                  <Link
                    href="/wishlist"
                    aria-label="Wishlist"
                    className="relative text-white/60 hover:text-white"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Heart size={20} />
                    {wishlistCount > 0 && (
                      <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#ff6b00] text-[9px] font-bold text-black flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/cart"
                    aria-label="Cart"
                    className="relative text-white/60 hover:text-white"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <ShoppingBag size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-[#ff6b00] text-[10px] font-bold text-black flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </motion.div>
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + (navItems.length + 2) * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href="/auth"
                      className="btn-pill btn-pill-gold mt-2"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                  </motion.div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
