"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  if (isAuthenticated) {
    router.push(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(form.email, form.password);
        if (res.success) {
          addToast("Welcome back!", "success");
          router.push(redirect);
        } else {
          addToast(res.error || "Invalid credentials", "error");
        }
      } else {
        if (!form.name.trim()) {
          addToast("Please enter your name", "error");
          setLoading(false);
          return;
        }
        if (form.phone.trim() && form.phone.trim().length !== 10) {
          addToast("Phone number must be 10 digits", "error");
          setLoading(false);
          return;
        }
        const res = await register(form.name, form.email, form.password, form.phone.trim());
        if (res.success) {
          addToast("Account created successfully!", "success");
          router.push(redirect);
        } else {
          addToast(res.error || "Registration failed", "error");
        }
      }
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f2] dark:bg-black pt-24 pb-16 sm:pt-32 transition-colors duration-300">
      <div className="mx-auto max-w-md px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 shadow-sm dark:shadow-none transition-colors duration-300"
        >
          {/* Tabs */}
          <div className="mb-8 flex rounded-full bg-black/5 dark:bg-white/5 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                isLogin ? "bg-[#ff6b00] text-black shadow-md" : "text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                !isLogin ? "bg-[#ff6b00] text-black shadow-md" : "text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="mb-2 text-2xl font-light text-neutral-900 dark:text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mb-6 text-xs text-neutral-500 dark:text-white/40">
            {isLogin
              ? "Sign in to access your account and orders."
              : "Create an account to track orders and save your delivery details."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-white/50">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required={!isLogin}
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/20 outline-none focus:border-[#ff6b00] transition-colors"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-white/50">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, phone: digits });
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter 10-digit phone number"
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/20 outline-none focus:border-[#ff6b00] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-white/50">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/20 outline-none focus:border-[#ff6b00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-white/50">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 py-3 pl-10 pr-10 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/20 outline-none focus:border-[#ff6b00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill btn-pill-gold w-full mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-black/10 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-white/40">
              {isLogin
                ? "Manage your orders and delivery addresses seamlessly."
                : "Your personal information is secure and private."}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <ToastContainer />
      <Suspense fallback={
        <main className="min-h-screen bg-[#f8f7f2] dark:bg-black pt-32 pb-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
        </main>
      }>
        <AuthForm />
      </Suspense>
    </SmoothScrollProvider>
  );
}
