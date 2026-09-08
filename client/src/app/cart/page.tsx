"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "NOIR10") {
      setDiscount(totalPrice * 0.1);
      addToast("Promo code applied! 10% off");
    } else if (promoCode.toUpperCase() === "WELCOME20") {
      setDiscount(totalPrice * 0.2);
      addToast("Promo code applied! 20% off");
    } else {
      addToast("Invalid promo code", "error");
    }
  };

  const handleRemoveItem = (
    productId: string,
    name: string,
    size?: string,
    color?: string,
    variantId?: string
  ) => {
    removeItem(productId, size, color, variantId);
    addToast(`${name} removed from cart`);
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
              <ShoppingBag size={64} className="mx-auto mb-6 text-white/10" />
              <h1 className="text-3xl font-light text-white mb-3">Your Cart is Empty</h1>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">
                Looks like you haven&apos;t added any items to your cart yet. Explore our collection and find something you love.
              </p>
              <Link href="/shop" className="btn-pill btn-pill-gold">
                Start Shopping
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
                Shopping <span className="text-[#ff6b00]">Bag</span>
              </h1>
              <button
                onClick={() => { clearCart(); addToast("Cart cleared"); }}
                className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => {
                      const prodId = item.product._id || item.product.id || "";
                      const unitPrice = item.price !== undefined ? item.price : item.product.price;
                      const displayImg = item.image || item.product.image;
                      const itemKey = `${prodId}-${item.variantId || ""}-${item.selectedSize || ""}-${item.selectedColor || ""}`;

                      return (
                        <motion.div
                          key={itemKey}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          className="flex gap-4 rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-4 sm:gap-6 sm:p-5"
                        >
                          <Link href={`/product/${item.product.slug}`} className="shrink-0">
                            <img
                              src={displayImg}
                              alt={item.product.name}
                              className="h-24 w-20 rounded-lg object-cover sm:h-32 sm:w-24 border border-white/10"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-semibold tracking-wider text-[#ff6b00]/70 uppercase">
                                  {item.product.category}
                                </p>
                                {item.sku && (
                                  <span className="text-[9px] font-mono text-white/30 tracking-wider">
                                    SKU: {item.sku}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="text-sm font-medium text-white hover:text-[#ff6b00] transition-colors truncate block"
                              >
                                {item.product.name}
                              </Link>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/50">
                                {item.selectedSize && (
                                  <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]">
                                    Size: <strong className="text-white">{item.selectedSize}</strong>
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="inline-flex items-center gap-1.5 rounded bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]">
                                    Color:
                                    <span
                                      className="h-3 w-3 rounded-full border border-white/20 inline-block"
                                      style={{ backgroundColor: item.colorCode || item.selectedColor }}
                                    />
                                    <strong className="text-white">{item.selectedColor}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      prodId,
                                      item.quantity - 1,
                                      item.selectedSize,
                                      item.selectedColor,
                                      item.variantId
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      prodId,
                                      item.quantity + 1,
                                      item.selectedSize,
                                      item.selectedColor,
                                      item.variantId
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-white">${(unitPrice * item.quantity).toFixed(2)}</span>
                                <button
                                  onClick={() =>
                                    handleRemoveItem(
                                      prodId,
                                      item.product.name,
                                      item.selectedSize,
                                      item.selectedColor,
                                      item.variantId
                                    )
                                  }
                                  className="text-white/20 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-6">
                  <h2 className="mb-6 text-lg font-medium text-white">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6 flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-white/60 hover:border-[#ff6b00]/50 hover:text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="space-y-3 border-t border-white/[0.06] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Subtotal ({items.length} items)</span>
                      <span className="text-white">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Shipping</span>
                      <span className="text-green-400">{totalPrice >= 100 ? "Free" : "$9.99"}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Discount</span>
                        <span className="text-green-400">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/[0.06] pt-3 text-base font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-[#ff6b00]">
                        ${(totalPrice - discount + (totalPrice >= 100 ? 0 : 9.99)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff6b00] py-4 text-xs font-bold tracking-[0.15em] text-black uppercase transition-all hover:bg-[#ff7a1a]"
                  >
                    Proceed to Checkout
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href="/shop"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-3.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
