"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { useGetProductsQuery } from "@/redux/api/product.api";
import { Product } from "@/types";
import Link from "next/link";

export default function SearchModal() {
  const { isOpen, closeSearch } = useSearch();
  const { data: dbProducts = [] } = useGetProductsQuery();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = dbProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, dbProducts]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeSearch} />
          <motion.div
            className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search size={18} className="shrink-0 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={closeSearch}
                className="shrink-0 rounded-lg border border-white/10 p-1.5 text-white/40 transition-colors hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim().length > 0 && results.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-white/30">No products found for &quot;{query}&quot;</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map((product) => {
                    const isAvailable = product.isAvailable !== false;
                    return (
                      <Link
                        key={product._id || product.id}
                        href={`/product/${product.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`h-full w-full object-cover ${!isAvailable ? "opacity-75 grayscale-[20%]" : ""}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-white">{product.name}</p>
                            {!isAvailable && (
                              <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/30">
                                Not Available
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#ff6b00]">${product.price}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-white/30 line-through">${product.originalPrice}</p>
                          )}
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-white/20" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {query.trim().length === 0 && (
                <div className="p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Hoodie", "Sneakers", "Jacket", "Oversized Tee", "Accessories"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-[#ff6b00]/50 hover:text-white"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
