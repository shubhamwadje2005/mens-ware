"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#080808] py-24 sm:py-32 lg:py-44"
    >
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-[#ff6b00]/[0.03] blur-[120px] sm:h-[600px] sm:w-[600px] sm:blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        <motion.div style={{ opacity }}>
          <ScrollReveal animation="fadeDown" distance={30}>
            <div className="mb-8 flex items-center justify-center gap-3 sm:mb-6">
              <div className="h-px w-8 bg-[#ff6b00]" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
                Philosophy
              </span>
              <div className="h-px w-8 bg-[#ff6b00]" />
            </div>
          </ScrollReveal>

          {/* Huge text lines */}
          <div className="overflow-hidden py-2 sm:py-3">
            <motion.h2
              className="text-[clamp(2rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.02em] text-white/80"
              style={{ x: x1 }}
            >
              CRAFTED WITH
            </motion.h2>
          </div>
          <div className="overflow-hidden py-2 sm:py-3">
            <motion.h2
              className="text-[clamp(2rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.02em] bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent"
              style={{ x: x2 }}
            >
              INTENTION
            </motion.h2>
          </div>
          <div className="overflow-hidden py-2 sm:py-3">
            <motion.h2
              className="text-[clamp(2rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.02em] text-white/80"
              style={{ x: x1 }}
            >
              BORN FROM
            </motion.h2>
          </div>
          <div className="overflow-hidden py-2 sm:py-3">
            <motion.h2
              className="text-[clamp(2rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.02em] bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent"
              style={{ x: x2 }}
            >
              VISION
            </motion.h2>
          </div>

          {/* Bottom text */}
          <ScrollReveal animation="fadeUp" distance={30} delay={0.2}>
            <p className="mx-auto mt-12 max-w-2xl text-center text-[14px] leading-[1.9] tracking-wide text-white/40 sm:mt-16 sm:text-[15px]">
              We believe that true luxury lies not in excess, but in the deliberate
              refinement of every detail. Each piece is a testament to our belief
              that clothing should empower, not overwhelm.
            </p>
          </ScrollReveal>
        </motion.div>
      </div>
    </section>
  );
}
