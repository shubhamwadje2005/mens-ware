"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import ProductCard from "@/components/ui/ProductCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { SlidersHorizontal, ChevronDown, X, Loader2, PackageOpen } from "lucide-react";
import Link from "next/link";

const SmoothScrollProvider = dynamic(
  () => import("@/components/layout/SmoothScrollProvider"),
  { ssr: false }
);
const CursorFollower = dynamic(
  () => import("@/components/cursor/CursorFollower"),
  { ssr: false }
);
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

type SortOption = "featured" | "price-low" | "price-high" | "newest" | "name";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "name", label: "Name: A to Z" },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useGetProductsQuery({
    category: activeCategory !== "All" ? activeCategory : undefined,
    sort: sortBy !== "featured" ? sortBy : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
  });

  const allCategories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 500;

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-20 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          {/* Header */}
          <ScrollReveal animation="fadeUp" distance={40}>
            <div className="mb-10 sm:mb-16">
              <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl">
                Shop <span className="text-[#ff6b00]">All</span>
              </h1>
              <p className="max-w-md text-xs leading-relaxed text-white/40 sm:text-sm">
                Explore our complete collection of premium menswear. Each piece
                designed for those who refuse to compromise.
              </p>
            </div>
          </ScrollReveal>

          {/* Filters Bar */}
          <ScrollReveal animation="fadeUp" distance={30} delay={0.1}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 flex-1">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-[11px] ${
                      activeCategory === category
                        ? "bg-[#ff6b00] text-black shadow-md"
                        : "border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-neutral-700 dark:text-white/60 hover:border-[#ff6b00]/60 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 pr-8 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-800 dark:text-white/70 outline-none focus:border-[#ff6b00]/60 transition-colors cursor-pointer sm:text-[11px] shadow-xs"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-white/40 pointer-events-none" />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all sm:text-[11px] ${
                    showFilters
                      ? "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]"
                      : "border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-700 dark:text-white/60 hover:border-[#ff6b00]/50 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  Filters
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Price Range Filter */}
          <AnimatePresence>
            {showFilters && (
              <div className="mb-6">
                <div className="rounded-xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] p-5 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-white/50">Price Range</h3>
                    <button onClick={() => setPriceRange([0, maxPrice])} className="text-[10px] text-neutral-500 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
                      Reset
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] text-neutral-500 dark:text-white/30 mb-1 block">Min ($)</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]/50"
                        min={0}
                        max={priceRange[1]}
                      />
                    </div>
                    <span className="text-neutral-400 dark:text-white/20 mt-4">—</span>
                    <div className="flex-1">
                      <label className="text-[10px] text-neutral-500 dark:text-white/30 mb-1 block">Max ($)</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]/50"
                        min={priceRange[0]}
                        max={maxPrice}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[100, 200, 300, 500].map((price) => (
                      <button
                        key={price}
                        onClick={() => setPriceRange([0, price])}
                        className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                          priceRange[1] === price
                            ? "bg-[#ff6b00]/20 text-[#ff6b00]"
                            : "bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-white/30 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        Under ${price}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Results count */}
          {!isLoading && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-white/30">
                Showing {products.length} {products.length === 1 ? "product" : "products"}
              </p>
              {(activeCategory !== "All" || priceRange[1] < maxPrice) && (
                <button
                  onClick={() => { setActiveCategory("All"); setPriceRange([0, maxPrice]); }}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
                >
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex h-[55vh] items-center justify-center">
              <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
            </div>
          )}

          {/* Products */}
          {!isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <div key={product._id || product.id}>
                    <ScrollReveal animation="fadeUp" distance={40} delay={index * 0.05}>
                      <ProductCard product={product} index={index} />
                    </ScrollReveal>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0c0c]/70 p-12 sm:p-16 text-center backdrop-blur-sm my-8 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00]">
                <PackageOpen size={28} />
              </div>
              <h3 className="text-xl font-light text-neutral-900 dark:text-white mb-2 sm:text-2xl">
                No Products Found
              </h3>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-neutral-600 dark:text-white/40 mb-6 leading-relaxed">
                {activeCategory !== "All"
                  ? `No products found in the "${activeCategory}" category at this moment.`
                  : "No products are currently available in this collection. Please check back soon."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => { setActiveCategory("All"); setPriceRange([0, maxPrice]); setSortBy("featured"); }}
                  className="btn-pill btn-pill-gold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
