"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/components/ui/BrandLogo";

const footerLinks = {
  Shop: [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Best Sellers", href: "/shop" },
    { label: "Oversized T-Shirts", href: "/shop" },
    { label: "Premium Shirts", href: "/shop" },
    { label: "Cargo Pants", href: "/shop" },
    { label: "Hoodies", href: "/shop" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Locations", href: "/about" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/contact" },
    { label: "Shipping Info", href: "/contact" },
    { label: "Returns & Exchanges", href: "/contact" },
    { label: "Size Guide", href: "/shop" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-black pt-16 pb-12 sm:pt-20 sm:pb-16">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        {/* Newsletter */}
        <div className="mb-14 border-b border-white/[0.08] pb-12 sm:mb-20 sm:pb-16">
          <div className="grid items-start gap-8 sm:gap-12 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-2xl font-light tracking-tight text-white sm:text-3xl">
                Stay in the <span className="text-[#ff6b00]">Loop</span>
              </h3>
              <p className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-sm">
                Subscribe for exclusive drops, early access, and a glimpse behind
                the curtain of our creative process.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-[#ff6b00] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (email.trim()) {
                    setSubscribed(true);
                    setTimeout(() => setSubscribed(false), 4000);
                    setEmail("");
                  }
                }}
                className="btn-pill btn-pill-gold"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mb-14 grid grid-cols-2 gap-8 sm:mb-16 sm:gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 mb-4 md:col-span-1 md:mb-0">
            <Link href="/" className="mb-4 inline-flex items-center gap-3 sm:mb-6 group">
              <div className="relative h-12 w-auto flex items-center">
                <BrandLogo
                  width={70}
                  height={48}
                  className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold tracking-[0.16em] text-white uppercase sm:text-xl group-hover:text-[#ff6b00] transition-colors leading-tight">
                  MAITRI
                </span>
                <span className="text-[9.5px] tracking-[0.24em] text-[#ff6b00] font-semibold uppercase leading-tight">
                  MEN&apos;S WEAR
                </span>
              </div>
            </Link>
            <p className="mt-3 max-w-[260px] text-[12px] leading-relaxed text-white/50 sm:mt-4 sm:text-xs">
              The Classy Men&apos;s Wear. Redefining modern luxury through timeless design, authentic elegance, and uncompromising quality.
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-4 sm:mt-6">
              {["Instagram", "Twitter", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-white/50 transition-colors hover:text-[#ff6b00]"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-[11px] font-bold tracking-widest text-white uppercase sm:mb-5 sm:text-xs">
                {title}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[12px] text-white/50 transition-all duration-300 hover:text-[#ff6b00] hover:pl-1 sm:text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 sm:pt-10 md:flex-row">
          <p className="text-[11px] text-white/40 sm:text-xs">
            &copy; 2026 Maitri Men&apos;s Wear. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[11px] text-white/40 transition-all duration-300 hover:text-[#ff6b00] sm:text-xs">
              Privacy Policy
            </a>
            <a href="#" className="text-[11px] text-white/40 transition-all duration-300 hover:text-[#ff6b00] sm:text-xs">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
