"use client";

import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: <CheckCircle size={16} className="text-green-400" />,
    error: <AlertCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-blue-400" />,
  };

  const borders = {
    success: "border-green-400/30",
    error: "border-red-400/30",
    info: "border-blue-400/30",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 rounded-xl border ${borders[toast.type]} bg-[#111] px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl`}
          >
            {icons[toast.type]}
            <span className="text-sm text-white/90">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
