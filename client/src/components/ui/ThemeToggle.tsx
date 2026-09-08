"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  variant?: "icon" | "switch" | "pill";
  className?: string;
}

export default function ThemeToggle({
  variant = "icon",
  className = "",
}: ThemeToggleProps) {
  const { isDark, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-full border border-white/10 bg-white/5 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === "switch" || variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className={`group relative flex h-8 w-16 items-center rounded-full border p-1 transition-all duration-300 focus:outline-none ${
          isDark
            ? "border-white/15 bg-black/60 hover:border-[#ff6b00]/60"
            : "border-black/15 bg-[#f0ede6] hover:border-[#ff6b00]/80"
        } ${className}`}
      >
        {/* Background indicator icons */}
        <div className="flex w-full items-center justify-between px-1 text-[10px]">
          <Sun
            size={12}
            className={`transition-colors duration-300 ${
              isDark ? "text-white/30" : "text-[#c2410c]"
            }`}
          />
          <Moon
            size={12}
            className={`transition-colors duration-300 ${
              isDark ? "text-[#ff6b00]" : "text-black/30"
            }`}
          />
        </div>

        {/* Sliding Thumb */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute flex h-6 w-6 items-center justify-center rounded-full shadow-md ${
            isDark
              ? "right-1 bg-gradient-to-tr from-[#ff6b00] to-[#ffa048] text-black"
              : "left-1 bg-gradient-to-tr from-[#111] to-[#333] text-[#ffa048]"
          }`}
        >
          {isDark ? (
            <Moon size={12} strokeWidth={2.5} />
          ) : (
            <Sun size={12} strokeWidth={2.5} />
          )}
        </motion.div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 focus:outline-none md:h-9 md:w-9 ${
        isDark
          ? "border-white/10 bg-white/5 text-white/70 hover:border-[#ff6b00]/50 hover:bg-white/10 hover:text-white"
          : "border-black/10 bg-black/5 text-black/70 hover:border-[#ff6b00]/70 hover:bg-black/10 hover:text-black"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Moon
              size={17}
              strokeWidth={1.8}
              className="text-[#ffa048] transition-transform duration-300 group-hover:scale-110 group-hover:text-[#ff6b00]"
            />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Sun
              size={17}
              strokeWidth={1.8}
              className="text-[#c2410c] transition-transform duration-300 group-hover:scale-110 group-hover:text-[#ff6b00]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle glow highlight on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: isDark
            ? "inset 0 0 8px rgba(255, 107, 0, 0.25)"
            : "inset 0 0 8px rgba(194, 65, 12, 0.3)",
        }}
      />
    </button>
  );
}
