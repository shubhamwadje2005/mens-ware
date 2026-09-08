"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGetProductsQuery } from "@/redux/api/product.api";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: dbProducts = [] } = useGetProductsQuery();

  const galleryItems = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: p._id || p.id,
        image: p.image,
        title: p.name,
        price: `$${p.price}`,
        slug: p.slug,
      }))
    : [
        {
          id: "1",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
          title: "Essential Noir Tee",
          price: "$89",
          slug: "midnight-oversized-tee",
        },
        {
          id: "2",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
          title: "Silk Blend Shirt",
          price: "$245",
          slug: "noir-silk-shirt",
        },
        {
          id: "3",
          image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
          title: "Stealth Bomber",
          price: "$389",
          slug: "stealth-bomber",
        },
      ];

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    let st: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    const setupScroll = () => {
      if (!containerRef.current || !scrollRef.current) return;
      if (window.innerWidth < 768) return;

      // Clean up existing trigger if any
      if (st) st.kill();
      if (tween) tween.kill();

      const scrollTrack = scrollRef.current;
      const getScrollDistance = () => {
        return Math.max(0, scrollTrack.scrollWidth - window.innerWidth + 180);
      };

      tween = gsap.to(scrollTrack, {
        x: () => -getScrollDistance(),
        ease: "none",
      });

      st = ScrollTrigger.create({
        animation: tween,
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 2.5, getScrollDistance() * 1.2)}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();
    };

    setupScroll();

    // ResizeObserver to automatically adjust whenever cards or images load & resize
    const resizeObserver = new ResizeObserver(() => {
      setupScroll();
    });

    resizeObserver.observe(scrollRef.current);

    const timer1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const timer2 = setTimeout(() => ScrollTrigger.refresh(), 1000);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (st) st.kill();
      if (tween) tween.kill();
    };
  }, [dbProducts]);

  return (
    <section
      ref={containerRef}
      className="relative flex h-screen min-h-[620px] max-h-[960px] flex-col justify-between overflow-hidden bg-[#040404] py-6 sm:py-8 md:py-10"
    >
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 z-10 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Header */}
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 md:px-10">
        <motion.div
          className="mb-1.5 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="h-px w-10 bg-[#ff6b00]" />
          <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
            Lookbook
          </span>
        </motion.div>
        <motion.h2
          className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          Scroll to <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Explore</span>
        </motion.h2>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-5 overflow-x-auto px-6 pr-32 scrollbar-none md:overflow-x-visible sm:gap-6 sm:px-8 sm:pr-48 md:px-10"
        style={{ width: "fit-content" }}
      >
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.id || index}
            className="group relative w-[230px] shrink-0 sm:w-[270px] md:w-[310px] lg:w-[330px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.08, 0.4) }}
          >
            <Link href={`/product/${item.slug}`} className="block">
              {/* Image Box */}
              <div className="overflow-hidden border border-white/[0.08] bg-[#0c0c0c] shadow-md transition-all duration-500 group-hover:border-[#ff6b00]/40">
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-[3/4] max-h-[54vh] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Product Info Bar */}
              <div className="mt-3 flex items-baseline justify-between gap-3 px-1 sm:mt-3.5">
                <h3 className="truncate text-[13px] font-medium tracking-wide text-white transition-colors group-hover:text-[#ff6b00] sm:text-sm">
                  {item.title}
                </h3>
                <span className="shrink-0 text-[13px] font-semibold text-[#ff6b00] sm:text-sm">
                  {item.price}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom spacer */}
      <div className="h-1" />
    </section>
  );
}
