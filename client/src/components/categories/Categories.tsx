"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import AnimatedText from "@/components/ui/AnimatedText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useGetProductsQuery } from "@/redux/api/product.api";

const categoryFallbackImages: Record<string, string> = {
  "Suits & Blazers": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop&q=80",
  "Formal Shirts": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop&q=80",
  "Premium Shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop&q=80",
  "Oversized T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80",
  "Cargo Pants": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop&q=80",
  "Jeans": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop&q=80",
  "Formal Pants": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop&q=80",
  "Hoodies": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&q=80",
  "Jackets": "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop&q=80",
  "Sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop&q=80",
  "Accessories": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&h=1000&fit=crop&q=80",
};

const defaultGlobalImage = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop&q=80";

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
  const fallbackUrl = categoryFallbackImages[category.name] || defaultGlobalImage;
  const [imgSrc, setImgSrc] = useState(category.image || fallbackUrl);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  return (
    <Link href={`/shop?category=${encodeURIComponent(category.name)}`} className="block w-full">
      <ScrollReveal animation="fadeUp" distance={40} delay={index * 0.08}>
        <div
          ref={ref}
          className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c] shadow-xl transition-all duration-500 hover:border-white/[0.2] hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {/* Inner Image Container with subtle parallax */}
          <motion.div
            className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)]"
            style={{ y }}
          >
            <img
              src={imgSrc}
              alt={category.name}
              onError={() => setImgSrc(fallbackUrl)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </motion.div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />

          {/* Top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <span className="mb-2 text-[10px] font-semibold tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[11px]">
              {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
            </span>
            <h3 className="mb-3 text-xl font-light tracking-tight text-white transition-colors duration-300 group-hover:text-white sm:mb-4 sm:text-2xl">
              {category.name}
            </h3>
            <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase transition-all duration-300 group-hover:text-[#ff6b00]">
              Explore
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
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
    const fallback = categoryFallbackImages[p.category] || defaultGlobalImage;
    const resolvedImg = (p.image && !p.image.includes("542272604-787c3835535d")) ? p.image : fallback;

    if (existing) {
      existing.count += 1;
      if (!existing.image || existing.image === defaultGlobalImage) {
        existing.image = resolvedImg;
      }
    } else {
      categoryMap.set(p.category, {
        count: 1,
        image: resolvedImg,
      });
    }
  });

  const displayCategories: CategoryItem[] = Array.from(categoryMap.entries()).map(([name, info], index) => ({
    id: String(index + 1),
    name,
    productCount: info.count,
    image: info.image,
  }));

  if (displayCategories.length === 0) {
    return null;
  }

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

        {/* Grid - Strict Uniform Grid with Equal Proportions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {displayCategories.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
