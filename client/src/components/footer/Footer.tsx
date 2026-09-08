"use client";

import { useState } from "react";
import Link from "next/link";

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
            <Link href="/" className="mb-4 inline-block sm:mb-6">
              <span className="text-lg font-light tracking-[0.2em] text-white uppercase sm:text-xl sm:tracking-[0.3em]">
                NOIR<span className="ml-1 text-[#ff6b00]">&mdash;</span>STUDIO
              </span>
            </Link>
            <p className="mt-3 max-w-[240px] text-[12px] leading-relaxed text-white/50 sm:mt-4 sm:text-xs">
              Redefining modern luxury through timeless design and uncompromising
              quality.
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
            &copy; 2026 NOIR&mdash;STUDIO. All rights reserved.
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
