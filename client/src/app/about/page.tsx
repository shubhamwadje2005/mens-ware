"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";
import { useGetAboutQuery } from "@/redux/api/about.api";
import { Loader2, PackageOpen } from "lucide-react";

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

export default function AboutPage() {
  const { data, isLoading } = useGetAboutQuery();
  const about = data?.about;

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black">
        {/* Loading state */}
        {isLoading && (
          <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="animate-spin text-[#ff6b00]" size={36} />
          </div>
        )}

        {/* Empty state when no about content in DB */}
        {!isLoading && !about && (
          <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8 pt-36 pb-24">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c]/70 p-12 sm:p-20 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#ff6b00]">
                <PackageOpen size={28} />
              </div>
              <h1 className="text-2xl font-light text-white mb-2 sm:text-3xl">
                About Us Coming Soon
              </h1>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-white/40 mb-8 leading-relaxed">
                Our brand story and philosophy will be published soon. Explore our collection in the meantime.
              </p>
              <div className="flex justify-center">
                <Link href="/shop" className="btn-pill btn-pill-gold text-xs">
                  Explore Shop
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content from Backend */}
        {!isLoading && about && (
          <>
            {/* Hero */}
            <section className="preserve-white relative flex h-[60vh] items-center justify-center overflow-hidden sm:h-[70vh]">
              {about.heroImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage: `url(${about.heroImage})`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
              <ScrollReveal animation="fadeUp" distance={50}>
                <div data-overlay className="relative z-10 px-4 text-center">
                  <h1 className="mb-4 text-5xl font-light tracking-tight text-white sm:text-6xl md:text-8xl">
                    {about.heroTitle}
                  </h1>
                  {about.heroSubtitle && (
                    <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/80 sm:max-w-lg sm:text-sm">
                      {about.heroSubtitle}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            </section>

            {/* Stats */}
            {about.stats && about.stats.length > 0 && (
              <section className="py-16 sm:py-20 border-b border-black/5 dark:border-white/[0.04]">
                <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
                  <StaggerReveal
                    animation="fadeUp"
                    stagger={0.1}
                    distance={30}
                    className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4"
                  >
                    {about.stats.map((stat, i) => (
                      <div key={stat.label + i} className="text-center">
                        <p className="mb-1 text-3xl font-bold text-[#ff6b00] sm:mb-2 sm:text-4xl md:text-5xl">
                          {stat.value}
                        </p>
                        <p className="text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-white/40 uppercase sm:text-xs">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </StaggerReveal>
                </div>
              </section>
            )}

            {/* Story */}
            {(about.storyHeading || about.storyParagraphs?.length > 0) && (
              <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
                  <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-2">
                    <ScrollReveal animation="fadeRight" distance={60}>
                      <div>
                        {about.storyBadge && (
                          <span className="mb-3 block text-[10px] font-bold tracking-[0.3em] text-[#ff6b00] uppercase sm:mb-4 sm:text-[11px]">
                            {about.storyBadge}
                          </span>
                        )}
                        {about.storyHeading && (
                          <h2 className="mb-4 text-3xl font-light leading-tight tracking-tight text-neutral-900 dark:text-white sm:mb-6 sm:text-4xl md:text-5xl">
                            {about.storyHeading}
                          </h2>
                        )}
                        <div className="space-y-4 text-xs leading-relaxed text-neutral-600 dark:text-white/60 sm:text-sm">
                          {about.storyParagraphs?.map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                    {about.storyImage && (
                      <ScrollReveal animation="fadeLeft" distance={60} delay={0.2}>
                        <div className="relative">
                          <img
                            src={about.storyImage}
                            alt="Brand Workshop"
                            className="rounded-2xl object-cover sm:rounded-3xl border border-black/10 dark:border-white/[0.08] shadow-lg"
                          />
                          {(about.storyEstYear || about.storyLocation) && (
                            <div
                              data-overlay
                              className="preserve-white absolute bottom-4 left-4 rounded-xl bg-black/85 border border-white/15 p-4 backdrop-blur-md shadow-2xl sm:bottom-6 sm:left-6 sm:rounded-2xl sm:p-6"
                            >
                              {about.storyEstYear && (
                                <p className="text-base font-bold text-[#ff6b00] sm:text-lg">
                                  {about.storyEstYear}
                                </p>
                              )}
                              {about.storyLocation && (
                                <p className="text-[11px] font-medium text-white/80 sm:text-xs">
                                  {about.storyLocation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Values */}
            {about.values && about.values.length > 0 && (
              <section className="py-16 sm:py-24 border-t border-black/5 dark:border-white/[0.04]">
                <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
                  <ScrollReveal animation="fadeUp" distance={30}>
                    <div className="mb-10 text-center sm:mb-16">
                      <h2 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl">
                        {about.valuesHeading || "What We Stand For"}
                      </h2>
                    </div>
                  </ScrollReveal>
                  <StaggerReveal
                    animation="fadeUp"
                    stagger={0.1}
                    distance={40}
                    className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {about.values.map((value, i) => (
                      <div
                        key={value.title + i}
                        className="group rounded-2xl border border-black/10 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 sm:rounded-2xl sm:p-8 shadow-sm dark:shadow-none hover:border-[#ff6b00] dark:hover:border-[#ff6b00] hover:shadow-[0_10px_30px_rgba(255,107,0,0.18)] dark:hover:shadow-[0_10px_30px_rgba(255,107,0,0.12)] transition-all duration-300"
                      >
                        <span className="mb-3 block text-2xl text-[#ff6b00] transition-transform duration-300 group-hover:scale-110 sm:mb-4 sm:text-3xl">
                          {value.icon || "✦"}
                        </span>
                        <h3 className="mb-2 text-base font-bold text-neutral-900 dark:text-white sm:mb-3 sm:text-lg">
                          {value.title}
                        </h3>
                        <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-white/40 sm:text-xs">
                          {value.description}
                        </p>
                      </div>
                    ))}
                  </StaggerReveal>
                </div>
              </section>
            )}
          </>
        )}

        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
