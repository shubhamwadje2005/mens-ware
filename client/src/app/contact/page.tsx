"use client";

import { useState } from "react";
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-20 pb-16 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          <div className="grid gap-10 sm:gap-16 lg:grid-cols-2">
            {/* Left */}
            <ScrollReveal animation="fadeRight" distance={60}>
              <div>
                <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
                  Get in <span className="text-[#ff6b00]">Touch</span>
                </h1>
                <p className="mb-8 max-w-md text-xs leading-relaxed text-white/40 sm:mb-12 sm:text-sm">
                  Have a question, collaboration idea, or simply want to say hello?
                  We&apos;d love to hear from you.
                </p>

                <StaggerReveal
                  animation="fadeUp"
                  stagger={0.1}
                  distance={30}
                  className="space-y-6 sm:space-y-8"
                >
                  {[
                    {
                      label: "Email",
                      value: "hello@noirstudio.com",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      ),
                    },
                    {
                      label: "Phone",
                      value: "+44 20 7946 0958",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Address",
                      value: "12 Savile Row, London W1S 3PR",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#ff6b00] sm:h-12 sm:w-12">
                        {item.icon}
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-medium tracking-wider text-white/30 uppercase sm:text-[11px]">
                          {item.label}
                        </p>
                        <p className="text-xs text-white sm:text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </StaggerReveal>
              </div>
            </ScrollReveal>

            {/* Right: Form */}
            <ScrollReveal animation="fadeLeft" distance={60} delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {[
                  { name: "name", label: "Your Name", type: "text" },
                  { name: "email", label: "Email Address", type: "email" },
                  { name: "subject", label: "Subject", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="mb-2 block text-[10px] font-medium tracking-wider text-white/30 uppercase sm:text-[11px]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="w-full border-b border-white/10 bg-transparent py-2.5 text-sm text-white outline-none transition-colors focus:border-[#ff6b00] sm:py-3"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-2 block text-[10px] font-medium tracking-wider text-white/30 uppercase sm:text-[11px]">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none border-b border-white/10 bg-transparent py-2.5 text-sm text-white outline-none transition-colors focus:border-[#ff6b00] sm:py-3 sm:rows-5"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-pill btn-pill-gold w-full"
                >
                  {submitted ? "Message Sent!" : "Send Message"}
                </button>
                {submitted && (
                  <p className="mt-2 text-center text-xs text-green-400">
                    Thank you! We&apos;ll get back to you soon.
                  </p>
                )}
              </form>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
