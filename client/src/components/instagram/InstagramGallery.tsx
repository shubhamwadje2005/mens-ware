"use client";

import { instagramPosts } from "@/data/products";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";

export default function InstagramGallery() {
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
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden border border-white/[0.04]"
            >
              <img
                src={post.image}
                alt={`Instagram post ${post.id}`}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="preserve-white absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:opacity-100">
                <div className="flex gap-5 text-white">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {(post.likes / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
