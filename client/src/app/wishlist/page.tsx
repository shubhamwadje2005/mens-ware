"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const handleMoveToCart = (product: typeof items[0]["product"]) => {
    const size = product.sizes?.[0];
    const color = product.colors?.[0];
    addItem(product, size, color);
    removeItem(product.id);
    addToast(`${product.name} moved to cart`);
  };

  const handleRemove = (product: typeof items[0]["product"]) => {
    removeItem(product.id);
    addToast(`${product.name} removed from wishlist`);
  };

  if (items.length === 0) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Heart size={64} className="mx-auto mb-6 text-white/10" />
              <h1 className="text-3xl font-light text-white mb-3">Your Wishlist is Empty</h1>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">
                Save your favorite items here. Browse our collection and tap the heart icon to add items.
              </p>
              <Link href="/shop" className="btn-pill btn-pill-gold">
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </SmoothScrollProvider>
    );
  }

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <h1 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
                My <span className="text-[#ff6b00]">Wishlist</span>
              </h1>
              <button
                onClick={() => { clearWishlist(); addToast("Wishlist cleared"); }}
                className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#0c0c0c] border border-white/[0.06] mb-3">
                      <Link href={`/product/${item.product.slug}`}>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveToCart(item.product)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b00] text-black transition-transform hover:scale-110"
                          title="Move to cart"
                        >
                          <ShoppingBag size={12} />
                        </button>
                        <button
                          onClick={() => handleRemove(item.product)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition-transform hover:scale-110 hover:bg-red-500/80"
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <Link href={`/product/${item.product.slug}`}>
                      <p className="text-[10px] font-semibold tracking-wider text-[#ff6b00]/60 uppercase mb-1">{item.product.category}</p>
                      <p className="text-sm text-white truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-white">${item.product.price}</span>
                        {item.product.originalPrice && (
                          <span className="text-xs text-white/25 line-through">${item.product.originalPrice}</span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
