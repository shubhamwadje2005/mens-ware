"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { testimonials } from "@/data/products";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  return (
    <ScrollReveal animation="fadeUp" distance={50} delay={index * 0.12}>
      <div className="group relative border border-white/[0.06] bg-[#0a0a0a]/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.12] hover:bg-[#0c0c0c]/80 sm:p-8">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 h-px w-12 bg-gradient-to-r from-[#ff6b00]/50 to-transparent transition-all duration-500 group-hover:w-20 group-hover:from-[#ff6b00]" />

        {/* Quote */}
        <div className="mb-5 text-4xl leading-none text-[#ff6b00]/25 sm:mb-7 sm:text-5xl">&ldquo;</div>
        <p className="mb-7 text-[13px] leading-[1.9] tracking-wide text-white/50 sm:mb-9 sm:text-[14px]">
          {testimonial.content}
        </p>
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative h-10 w-10 overflow-hidden border border-white/[0.08] sm:h-11 sm:w-11">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-[13px] font-medium tracking-wide text-white sm:text-sm">{testimonial.name}</p>
            <p className="mt-0.5 text-[11px] text-white/30 sm:text-[12px]">{testimonial.role}</p>
          </div>
        </div>
        {/* Stars */}
        <div className="absolute top-6 right-6 flex gap-0.5 sm:top-8 sm:right-8 sm:gap-1">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="#ff6b00"
              className="sm:w-3 sm:h-3"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative bg-[#060606] py-24 sm:py-32 lg:py-40">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-14 text-center sm:mb-20">
          <ScrollReveal animation="fadeDown" distance={30}>
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-[#ff6b00]" />
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#ff6b00] uppercase sm:text-[11px]">
                Testimonials
              </span>
              <div className="h-px w-8 bg-[#ff6b00]" />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" distance={40} delay={0.1}>
            <h2 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
              Voices of <span className="bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">Luxury</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <motion.div
          className="grid gap-4 sm:gap-5 md:grid-cols-2"
          style={{ y }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
