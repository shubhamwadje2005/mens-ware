"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
        const success = await login(form.email, form.password);
        if (success) {
          addToast("Welcome back!", "success");
          router.push(redirect);
        } else {
          addToast("Invalid credentials", "error");
        }
      } else {
        if (!form.name.trim()) {
          addToast("Please enter your name", "error");
          setLoading(false);
          return;
        }
        const success = await register(form.name, form.email, form.password);
        if (success) {
          addToast("Account created successfully!", "success");
          router.push(redirect);
        } else {
          addToast("Registration failed", "error");
        }
      }
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-md px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 sm:p-8"
        >
          {/* Tabs */}
          <div className="mb-8 flex rounded-full bg-white/5 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                isLogin ? "bg-[#ff6b00] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                !isLogin ? "bg-[#ff6b00] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="mb-2 text-2xl font-light text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mb-6 text-xs text-white/40">
            {isLogin
              ? "Sign in to access your account and orders."
              : "Create an account to track orders and save your wishlist."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-xs text-white/50">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required={!isLogin}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs text-white/50">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/50">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#ff6b00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
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

          {isLogin ? (
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-white/40">
                Demo: Sign in with any email and password.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-white/40">
                Register a new account to get started. All data is saved in your browser.
              </p>
            </div>
          )}
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
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
        </main>
      }>
        <AuthForm />
      </Suspense>
    </SmoothScrollProvider>
  );
}
