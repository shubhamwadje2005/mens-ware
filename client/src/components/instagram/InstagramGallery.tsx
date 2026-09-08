"use client";

import Link from "next/link";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";
import { useGetProductsQuery } from "@/redux/api/product.api";

export default function InstagramGallery() {
  const { data: dbProducts = [] } = useGetProductsQuery();

  if (dbProducts.length === 0) {
    return null;
  }

  const posts = dbProducts.slice(0, 6);

  return (
    <section className="relative bg-[#040404] py-24 sm:py-32 lg:py-40">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-14 text-center sm:mb-20">
          <ScrollReveal animation="fadeDown" distance={30}>
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-[#ff6b00]" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
                @noirstudio
              </span>
              <div className="h-px w-8 bg-[#ff6b00]" />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" distance={30} delay={0.1}>
            <h2 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
              Follow Our <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Journey</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Grid */}
        <StaggerReveal
          animation="fadeUp"
          stagger={0.08}
          distance={30}
          className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6"
        >
          {posts.map((product) => (
            <Link
              key={product._id || product.id}
              href={`/product/${product.slug}`}
              className="group relative overflow-hidden border border-white/[0.04]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="preserve-white absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:opacity-100">
                <div className="text-center px-2">
                  <p className="text-[11px] font-medium text-white truncate max-w-[120px]">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#ff6b00]">
                    ${product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
