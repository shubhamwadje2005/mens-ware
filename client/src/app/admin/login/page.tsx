"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-white mb-2">
            NOIR<span className="text-[#ff6b00]">&mdash;</span>ADMIN
          </h1>
          <p className="text-xs text-white/30">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#ff6b00] py-3.5 text-xs font-bold tracking-[0.15em] text-black uppercase transition-all hover:bg-[#ff7a1a] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Admin Credentials</p>
          <p className="text-xs text-white/40">Email: <span className="text-[#ff6b00]">shubhamwadje2005@gmail.com</span></p>
          <p className="text-xs text-white/40">Pass: <span className="text-[#ff6b00]">admin@3428</span></p>
          <div className="h-px bg-white/5 my-1" />
          <p className="text-xs text-white/40">Email: <span className="text-[#ff6b00]">admin@noirstudio.com</span></p>
          <p className="text-xs text-white/40">Pass: <span className="text-[#ff6b00]">admin123</span></p>
        </div> */}
      </div>
    </div>
  );
}
