"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import Link from "next/link";

const SmoothScrollProvider = dynamic(
  () => import("@/components/layout/SmoothScrollProvider"),
  { ssr: false }
);

const CursorFollower = dynamic(
  () => import("@/components/cursor/CursorFollower"),
  { ssr: false }
);

const Footer = dynamic(() => import("@/components/footer/Footer"));

export default function WomenPage() {
  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <main className="min-h-screen bg-black pt-20 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          <motion.div
            className="flex min-h-[50vh] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl">
              Women&apos;s <span className="text-[#ff6b00]">Coming Soon</span>
            </h1>
            <p className="mb-8 max-w-md text-xs leading-relaxed text-white/40 sm:text-sm">
              Our women&apos;s collection is in the works. Stay tuned for something
              extraordinary.
            </p>
            <Link
              href="/shop"
              className="btn-pill btn-pill-gold"
            >
              Explore Men&apos;s Collection
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
