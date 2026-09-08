"use client";

import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
    info: <Info size={18} className="text-blue-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30 bg-emerald-950/40 shadow-[0_10px_30px_rgba(16,185,129,0.15)]",
    error: "border-red-500/30 bg-red-950/40 shadow-[0_10px_30px_rgba(239,68,68,0.15)]",
    info: "border-blue-500/30 bg-blue-950/40 shadow-[0_10px_30px_rgba(59,130,246,0.15)]",
  };

  return (
    <div className="fixed top-6 right-4 sm:top-8 sm:right-8 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border ${borders[toast.type]} bg-[#111111]/90 px-4 py-3.5 backdrop-blur-xl shadow-2xl`}
          >
            {icons[toast.type]}
            <span className="text-xs sm:text-sm font-medium text-white/90 leading-snug">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
