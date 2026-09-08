"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import AnimatedText from "@/components/ui/AnimatedText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useGetProductsQuery } from "@/redux/api/product.api";

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

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

function CategoryCard({
  category,
  index,
}: {
  category: CategoryItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
      <ScrollReveal animation="fadeUp" distance={50} delay={index * 0.1}>
        <div
          ref={ref}
          className="preserve-white group relative overflow-hidden border border-white/[0.06] cursor-pointer rounded-xl shadow-lg"
        >
          <motion.div
            className="relative h-full min-h-[280px] overflow-hidden sm:min-h-[340px]"
            style={{ y }}
          >
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <span className="mb-1.5 text-[10px] font-semibold tracking-[0.3em] text-[#ff6b00] uppercase sm:mb-2 sm:text-[11px]">
                {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
              </span>
              <h3 className="mb-3 text-xl font-light tracking-tight text-white sm:mb-4 sm:text-2xl">
                {category.name}
              </h3>
              <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase transition-all duration-400 group-hover:text-[#ff6b00]">
                Explore
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-400 group-hover:translate-x-2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Hover border accent */}
            <div className="pointer-events-none absolute inset-0 border border-white/0 transition-all duration-500 group-hover:border-white/[0.12]" />
          </motion.div>
        </div>
      </ScrollReveal>
    </Link>
  );
}

export default function Categories() {
  const { data: dbProducts = [] } = useGetProductsQuery();

  const categoryMap = new Map<string, { count: number; image: string }>();

  dbProducts.forEach((p) => {
    if (!p.category) return;
    const existing = categoryMap.get(p.category);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(p.category, {
        count: 1,
        image: p.image || categoryFallbackImages[p.category] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
      });
    }
  });

  const displayCategories: CategoryItem[] = Array.from(categoryMap.entries()).map(([name, info], index) => ({
    id: String(index + 1),
    name,
    productCount: info.count,
    image: info.image,
  }));

  return (
    <section className="relative bg-[#040404] py-24 sm:py-32 lg:py-40">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-14 sm:mb-20">
          <ScrollReveal animation="fadeRight" distance={30}>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-10 bg-[#ff6b00]" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
                Collections
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" distance={40} delay={0.1}>
            <h2 className="mb-5 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <AnimatedText text="Shop by Category" />
            </h2>
          </ScrollReveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {displayCategories.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

