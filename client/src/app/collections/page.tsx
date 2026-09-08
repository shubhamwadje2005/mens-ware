"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { useGetActiveCollectionsQuery } from "@/redux/api/collection.api";
import { PackageOpen, Loader2 } from "lucide-react";

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

const categoryFallbackImages: Record<string, string> = {
  "Oversized T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
  "Premium Shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
  "Formal Shirts": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop",
  "Cargo Pants": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop",
  "Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop",
  "Formal Pants": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop",
  "Hoodies": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop",
  "Jackets": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
  "Sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop",
  "Accessories": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&h=1000&fit=crop",
};

export default function CollectionsPage() {
  const { data: dbProducts = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: dbCollections = [], isLoading: isCollectionsLoading } = useGetActiveCollectionsQuery();

  const isLoading = isProductsLoading || isCollectionsLoading;
  const collectionsList = dbCollections;

  const categoryMap = new Map<string, { count: number; image: string }>();

  dbProducts.forEach((p) => {
    if (!p.category) return;
    const existing = categoryMap.get(p.category);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(p.category, {
        count: 1,
        image:
          p.image ||
          categoryFallbackImages[p.category] ||
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
      });
    }
  });

  const displayCategories = Array.from(categoryMap.entries()).map(([name, info]) => ({
    name,
    productCount: info.count,
    image: info.image,
  }));

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-20 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            className="mb-12 text-center sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl">
              Our <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Collections</span>
            </h1>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/40 sm:max-w-lg sm:text-sm">
              Curated worlds of style. Each collection tells a unique story through
              meticulously designed pieces.
            </p>
          </motion.div>

          {/* Centered Loading Spinner */}
          {isLoading && (
            <div className="flex h-[55vh] items-center justify-center">
              <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
            </div>
          )}

          {/* Featured Collections */}
          {!isLoading && collectionsList.length > 0 && (
            <div className="mb-16 grid gap-5 sm:mb-24 sm:gap-6 md:grid-cols-2">
              {collectionsList.map((collection, i) => (
                <Link key={collection.title + i} href={collection.link || "/shop"}>
                  <motion.div
                    className="preserve-white group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-2xl cursor-pointer"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                  >
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                      <span className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-[#ff6b00] uppercase sm:mb-2 sm:text-[11px]">
                        {collection.subtitle}
                      </span>
                      <h3 className="mb-1.5 text-2xl font-light text-white sm:mb-2 sm:text-3xl lg:text-4xl transition-colors group-hover:text-white">
                        {collection.title}
                      </h3>
                      <p className="text-xs text-white/70 sm:text-sm max-w-md line-clamp-2">
                        {collection.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* All Categories */}
          {!isLoading && displayCategories.length > 0 && (
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-8 bg-[#ff6b00]" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6b00]">
                  Shop By Category
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {displayCategories.map((category, index) => (
                  <Link key={category.name} href={`/shop?category=${encodeURIComponent(category.name)}`}>
                    <motion.div
                      className="preserve-white group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] cursor-pointer shadow-xl"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                        <h3 className="text-lg font-light text-white sm:text-xl transition-colors group-hover:text-[#ff6b00]">
                          {category.name}
                        </h3>
                        <p className="text-[10px] text-white/60 sm:text-xs">
                          {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isLoading && collectionsList.length === 0 && displayCategories.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c]/70 p-12 sm:p-16 text-center backdrop-blur-sm my-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#ff6b00]">
                <PackageOpen size={28} />
              </div>
              <h3 className="text-xl font-light text-white mb-2 sm:text-2xl">
                Collections Coming Soon
              </h3>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-white/40 mb-6 leading-relaxed">
                Our seasonal collections are currently being curated. Explore our shop in the meantime.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/shop" className="btn-pill btn-pill-gold text-xs">
                  Browse Shop
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}

