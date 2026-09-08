"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import ProductCard from "@/components/ui/ProductCard";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { Loader2 } from "lucide-react";

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

export default function NewArrivalsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: allProducts = [], isLoading } = useGetProductsQuery();

  const products = allProducts.filter((p) => p.badge === "NEW");

  const allCategories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-20 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          <motion.div
            className="mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl">
              New <span className="text-[#ff6b00]">Arrivals</span>
            </h1>
            <p className="max-w-md text-xs leading-relaxed text-white/40 sm:text-sm">
              The latest additions to our collection. Fresh pieces, same
              uncompromising quality.
            </p>
          </motion.div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#ff6b00]" />
            </div>
          )}

          {!isLoading && allCategories.length > 2 && (
            <motion.div
              className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:mb-12 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-[11px] ${
                    activeCategory === category
                      ? "bg-[#ff6b00] text-black"
                      : "border border-white/10 text-white/50 hover:border-[#ff6b00]/50 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id || product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-white/40 text-sm">No new arrivals yet. Check back soon.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
