"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

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
        const result = await login(form.email, form.password);
        if (result.success) {
          addToast("Welcome back!");
          router.push(redirect);
        } else {
          addToast(result.error || "Login failed", "error");
        }
      } else {
        if (!form.name.trim()) {
          addToast("Please enter your name", "error");
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) {
          addToast("Account created! Welcome to NOIR--STUDIO");
          router.push(redirect);
        } else {
          addToast(result.error || "Registration failed", "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
      <div className="w-full max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-white mb-2">
              NOIR<span className="text-[#ff6b00]">&mdash;</span>STUDIO
            </h1>
            <p className="text-xs text-white/30">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-11 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#ff6b00] py-4 text-xs font-bold tracking-[0.15em] text-black uppercase transition-all hover:bg-[#ff7a1a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/30">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#ff6b00] hover:text-[#ff7a1a] transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          {isLogin && (
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Demo</p>
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
          <div className="text-white/40">Loading...</div>
        </main>
      }>
        <AuthForm />
      </Suspense>
    </SmoothScrollProvider>
  );
}
