"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "@/components/ui/ProductCard";
import AnimatedText from "@/components/ui/AnimatedText";
import { useGetProductsQuery } from "@/redux/api/product.api";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts() {
  const ref = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const { data: allProducts = [] } = useGetProductsQuery();

  useEffect(() => {
    if (!ref.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const featured = allProducts.slice(0, 8);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#060606] py-24 sm:py-32 lg:py-40"
    >
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background accents */}
      <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] bg-[#ff6b00]/[0.03] blur-[100px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[250px] w-[250px] bg-[#ff6b00]/[0.02] blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Section Header */}
        <div ref={headingRef} className="mb-10 sm:mb-16">
          <motion.div
            className="mb-4 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px w-8 bg-[#ff6b00]" />
            <span className="text-[11px] font-medium tracking-[0.3em] text-[#ff6b00] uppercase">
              Featured
            </span>
          </motion.div>
          <h2 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
            <AnimatedText text="Curated Selection" />
          </h2>
          <p className="max-w-md text-[13px] leading-relaxed tracking-wide text-white/50 sm:text-sm">
            Handpicked pieces that define contemporary luxury. Each item
            meticulously crafted for those who demand nothing less than
            extraordinary.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product._id || product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All */}
        <motion.div
          className="mt-12 text-center sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Link href="/shop" className="btn-pill btn-pill-dark inline-flex items-center justify-center gap-2">
            View All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
