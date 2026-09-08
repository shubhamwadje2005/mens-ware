"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import ScrollReveal, { StaggerReveal } from "@/components/ui/ScrollReveal";
import { useSendMessageMutation } from "@/redux/api/message.api";
import { useToast } from "@/context/ToastContext";
import {
  Loader2,
  Send,
  User,
  Mail,
  Tag,
  MessageSquare,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

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

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast("Please fill in your name, email, and message.", "error");
      return;
    }

    try {
      const res = await sendMessage(formData).unwrap();
      addToast(
        res.message || "Your message has been sent successfully! We'll get back to you soon.",
        "success"
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      addToast(
        err?.data?.message || "Failed to send message. Please try again.",
        "error"
      );
    }
  };

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-6 md:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left: Info Section */}
            <div className="lg:col-span-5">
              <ScrollReveal animation="fadeRight" distance={60}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-3.5 py-1 text-[11px] font-semibold text-[#ff6b00] uppercase tracking-widest mb-4">
                    <Sparkles size={12} />
                    <span>Get in Touch</span>
                  </div>

                  <h1 className="mb-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
                    Let&apos;s Start a <span className="font-serif italic text-[#ff6b00]">Conversation</span>
                  </h1>

                  <p className="mb-10 text-xs leading-relaxed text-white/50 sm:text-sm max-w-md">
                    Whether you have an inquiry about our bespoke collections, sizing assistance, or custom tailoring, our concierge team is at your disposal.
                  </p>

                  <StaggerReveal
                    animation="fadeUp"
                    stagger={0.12}
                    distance={25}
                    className="space-y-4"
                  >
                    {[
                      {
                        label: "Email Concierge",
                        value: "hello@noirstudio.com",
                        icon: Mail,
                        href: "mailto:hello@noirstudio.com",
                      },
                      {
                        label: "Telephone",
                        value: "+44 20 7946 0958",
                        icon: Phone,
                        href: "tel:+442079460958",
                      },
                      {
                        label: "Flagship Atelier",
                        value: "12 Savile Row, London W1S 3PR",
                        icon: MapPin,
                        href: "#",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 transition-all duration-300 hover:border-[#ff6b00]/40 hover:bg-white/[0.05] hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#ff6b00] transition-colors group-hover:bg-[#ff6b00] group-hover:text-black shadow-xs">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                              {item.label}
                            </p>
                            <p className="text-sm font-medium text-white transition-colors group-hover:text-[#ff6b00]">
                              {item.value}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </StaggerReveal>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Luxury Form Card */}
            <div className="lg:col-span-7">
              <ScrollReveal animation="fadeLeft" distance={60} delay={0.15}>
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0d0d0d]/90 p-6 sm:p-10 md:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                  {/* Subtle Glow Backdrop */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#ff6b00]/15 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#ff6b00]/10 blur-3xl" />

                  <div className="relative z-10 mb-8">
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      Send Us a Message
                    </h2>
                    <p className="mt-1 text-xs text-white/45">
                      Fill out the form below and we will respond within 24 business hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                    {/* Name & Email Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold tracking-wider text-white/70 uppercase">
                          Your Name <span className="text-[#ff6b00]">*</span>
                        </label>
                        <div className="group relative flex items-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-white/20 focus-within:border-[#ff6b00] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#ff6b00]/20 focus-within:shadow-[0_0_20px_rgba(255,107,0,0.12)]">
                          <User size={16} className="absolute left-3.5 text-white/35 transition-colors group-focus-within:text-[#ff6b00]" />
                          <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/25 outline-none sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold tracking-wider text-white/70 uppercase">
                          Email Address <span className="text-[#ff6b00]">*</span>
                        </label>
                        <div className="group relative flex items-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-white/20 focus-within:border-[#ff6b00] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#ff6b00]/20 focus-within:shadow-[0_0_20px_rgba(255,107,0,0.12)]">
                          <Mail size={16} className="absolute left-3.5 text-white/35 transition-colors group-focus-within:text-[#ff6b00]" />
                          <input
                            type="email"
                            required
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/25 outline-none sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-white/70 uppercase">
                        Subject
                      </label>
                      <div className="group relative flex items-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-white/20 focus-within:border-[#ff6b00] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#ff6b00]/20 focus-within:shadow-[0_0_20px_rgba(255,107,0,0.12)]">
                        <Tag size={16} className="absolute left-3.5 text-white/35 transition-colors group-focus-within:text-[#ff6b00]" />
                        <input
                          type="text"
                          placeholder="e.g. Order Inquiry, Custom Sizing, Collaboration"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/25 outline-none sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-white/70 uppercase">
                        Message <span className="text-[#ff6b00]">*</span>
                      </label>
                      <div className="group relative rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-white/20 focus-within:border-[#ff6b00] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#ff6b00]/20 focus-within:shadow-[0_0_20px_rgba(255,107,0,0.12)]">
                        <MessageSquare
                          size={16}
                          className="absolute left-3.5 top-3.5 text-white/35 transition-colors group-focus-within:text-[#ff6b00]"
                        />
                        <textarea
                          required
                          rows={4}
                          placeholder="Please describe your inquiry in detail..."
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          className="w-full resize-none bg-transparent pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/25 outline-none sm:text-sm leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#ff6b00] via-[#ff7a1a] to-[#ff5500] py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_25px_rgba(255,107,0,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(255,107,0,0.55)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} className="transition-transform group-hover:translate-x-1" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
