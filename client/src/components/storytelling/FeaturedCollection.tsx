"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FeaturedCollection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#080808] py-24 sm:py-32 lg:py-44"
    >
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Large background text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-[20vw] font-bold tracking-tighter text-white/[0.015] uppercase"
          style={{ x }}
        >
          NOIR
        </motion.span>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        <div className="grid items-center gap-12 sm:gap-20 lg:grid-cols-2 lg:gap-28">
          {/* Left: Text */}
          <motion.div style={{ opacity }} className="">
            <ScrollReveal animation="fadeRight" distance={40}>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-[#ff6b00]" />
                <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase">
                  Featured Collection
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" distance={50} delay={0.1}>
              <h2 className="mb-5 text-4xl font-light leading-[1.05] tracking-tight text-white sm:mb-7 sm:text-5xl md:text-6xl lg:text-7xl">
                The Art of
                <br />
                <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Dark Elegance</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" distance={40} delay={0.2}>
              <p className="mb-8 max-w-md text-[14px] leading-[1.8] tracking-wide text-white/45 sm:mb-10 sm:text-[15px]">
                A symphony of shadow and light. Each piece in this collection
                whispers luxury through its impeccable construction and
                uncompromising attention to detail.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" distance={30} delay={0.3}>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                <Link href="/shop" className="btn-pill btn-pill-gold inline-flex items-center justify-center gap-2">
                  Shop Collection
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/about" className="btn-pill btn-pill-outline inline-flex items-center justify-center">
                  View Story
                </Link>
              </div>
            </ScrollReveal>
          </motion.div>

          {/* Right: Image */}
          <motion.div className="relative" style={{ scale }}>
            <ScrollReveal animation="fadeLeft" distance={60} delay={0.2}>
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=1000&fit=crop"
                  alt="Featured Collection"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              </div>
            </ScrollReveal>

            {/* Floating card */}
            <ScrollReveal animation="fadeUp" distance={40} delay={0.4}>
              <div className="glass-strong absolute -bottom-5 -left-5 z-20 rounded-xl p-4 shadow-2xl sm:-bottom-6 sm:-left-6 sm:rounded-2xl sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[11px]">
                    New Season
                  </p>
                </div>
                <p className="mt-1 text-base font-light tracking-tight text-[var(--text-primary)] sm:text-lg">
                  48 New Pieces
                </p>
              </div>
            </ScrollReveal>

            {/* Corner accent lines */}
            <div className="pointer-events-none absolute -top-3 -right-3 h-8 w-8 rounded-tr-lg border-t-2 border-r-2 border-[#ff6b00]/40" />
            <div className="pointer-events-none absolute -bottom-3 -right-3 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-[#ff6b00]/40" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
