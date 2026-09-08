"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function SplitScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section ref={ref} className="relative bg-[#040404] py-24 sm:py-32 lg:py-40">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="mb-14 text-center sm:mb-20 lg:mb-24">
          <ScrollReveal animation="fadeDown" distance={30}>
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-[#ff6b00]" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
                Editorial
              </span>
              <div className="h-px w-8 bg-[#ff6b00]" />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" distance={40} delay={0.1}>
            <h2 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Worn by <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Confidence</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Split Layout */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {/* Left */}
          <motion.div className="relative overflow-hidden" style={{ y: leftY }}>
            <ScrollReveal animation="fadeRight" distance={80}>
              <div className="preserve-white relative overflow-hidden border border-white/[0.06] rounded-xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=1200&fit=crop"
                  alt="Editorial 1"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <ScrollReveal animation="fadeUp" distance={30} delay={0.3}>
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
                    <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[11px]">
                      Look 01
                    </p>
                    <h3 className="mt-2 text-xl font-light tracking-tight text-white sm:mt-3 sm:text-2xl">
                      Midnight Formal
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/70 sm:text-[13px]">
                      Tailored blazer with silk-finish trousers
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>
          </motion.div>

          {/* Right */}
          <motion.div
            className="relative sm:mt-20 lg:mt-32"
            style={{ y: rightY }}
          >
            <ScrollReveal animation="fadeLeft" distance={80} delay={0.1}>
              <div className="preserve-white relative overflow-hidden border border-white/[0.06] rounded-xl shadow-2xl">
                <img
                  src="/images/urban_shadow_editorial.jpg"
                  alt="Urban Shadow Editorial"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <ScrollReveal animation="fadeUp" distance={30} delay={0.4}>
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
                    <p className="text-[10px] font-semibold tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[11px]">
                      Look 02
                    </p>
                    <h3 className="mt-2 text-xl font-light tracking-tight text-white sm:mt-3 sm:text-2xl">
                      Urban Shadow
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/70 sm:text-[13px]">
                      Oversized hoodie with cargo silhouette
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
