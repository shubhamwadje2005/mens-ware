"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";

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

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Premium Products" },
  { value: "30+", label: "Countries Served" },
  { value: "99%", label: "Satisfaction Rate" },
];

const values = [
  {
    title: "Craftsmanship",
    description: "Every stitch, every seam, every detail is meticulously considered and expertly executed.",
    icon: "✦",
  },
  {
    title: "Sustainability",
    description: "We believe luxury and responsibility can coexist. Our materials are ethically sourced.",
    icon: "◈",
  },
  {
    title: "Innovation",
    description: "Pushing boundaries while respecting tradition. We evolve without compromising our essence.",
    icon: "⬡",
  },
  {
    title: "Community",
    description: "More than a brand — a collective of individuals who share a vision for elevated living.",
    icon: "△",
  },
];

export default function AboutPage() {
  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black">
        {/* Hero */}
        <section className="relative flex h-[60vh] items-center justify-center overflow-hidden sm:h-[70vh]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          <ScrollReveal animation="fadeUp" distance={50}>
            <div className="relative z-10 px-4 text-center">
              <h1 className="mb-4 text-5xl font-light tracking-tight text-white sm:text-6xl md:text-8xl">
                Our <span className="text-[#ff6b00]">Story</span>
              </h1>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/40 sm:max-w-lg sm:text-sm">
                Born from a belief that clothing should be an extension of one&apos;s
                identity, not a costume.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Stats */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
            <StaggerReveal
              animation="fadeUp"
              stagger={0.1}
              distance={30}
              className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="mb-1 text-3xl font-light text-[#ff6b00] sm:mb-2 sm:text-4xl md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="text-[10px] tracking-wider text-white/40 uppercase sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
            <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-2">
              <ScrollReveal animation="fadeRight" distance={60}>
                <div>
                  <span className="mb-3 block text-[10px] font-medium tracking-[0.3em] text-[#ff6b00] uppercase sm:mb-4 sm:text-[11px]">
                    The Beginning
                  </span>
                  <h2 className="mb-4 text-3xl font-light leading-tight tracking-tight text-white sm:mb-6 sm:text-4xl md:text-5xl">
                    Redefining Modern <span className="text-[#ff6b00]">Luxury</span>
                  </h2>
                  <div className="space-y-3 text-xs leading-relaxed text-white/40 sm:space-y-4 sm:text-sm">
                    <p>
                      NOIR—STUDIO was founded on a singular conviction: that true luxury
                      is not about logos or labels, but about the quiet confidence that
                      comes from wearing something exquisitely made.
                    </p>
                    <p>
                      We draw inspiration from the intersection of architecture, art,
                      and the human form. Each piece in our collection is designed to
                      move with you, adapt to you, and ultimately become a part of you.
                    </p>
                    <p>
                      Our commitment extends beyond aesthetics. We work exclusively with
                      mills and workshops that share our values — where artisanal
                      craftsmanship meets progressive sustainability practices.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="fadeLeft" distance={60} delay={0.2}>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop"
                    alt="Our Workshop"
                    className="rounded-2xl object-cover sm:rounded-3xl"
                  />
                  <div className="absolute bottom-4 left-4 rounded-xl bg-[#ff6b00]/10 p-4 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:rounded-2xl sm:p-6">
                    <p className="text-base font-light text-[#ff6b00] sm:text-lg">Est. 2020</p>
                    <p className="text-[10px] text-white/40 sm:text-xs">London, United Kingdom</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
            <ScrollReveal animation="fadeUp" distance={30}>
              <div className="mb-10 text-center sm:mb-16">
                <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
                  What We <span className="text-[#ff6b00]">Stand For</span>
                </h2>
              </div>
            </ScrollReveal>
            <StaggerReveal
              animation="fadeUp"
              stagger={0.1}
              distance={40}
              className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:rounded-2xl sm:p-8"
                >
                  <span className="mb-3 block text-2xl text-[#ff6b00] sm:mb-4 sm:text-3xl">{value.icon}</span>
                  <h3 className="mb-2 text-base font-light text-white sm:mb-3 sm:text-lg">{value.title}</h3>
                  <p className="text-[11px] leading-relaxed text-white/40 sm:text-xs">{value.description}</p>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </section>

        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
