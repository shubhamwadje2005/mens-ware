"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useGetProductBySlugQuery, useGetProductsQuery } from "@/redux/api/product.api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Check, Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Loader2 } from "lucide-react";

const SmoothScrollProvider = dynamic(
  () => import("@/components/layout/SmoothScrollProvider"),
  { ssr: false }
);
const CursorFollower = dynamic(
  () => import("@/components/cursor/CursorFollower"),
  { ssr: false }
);
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: product, isLoading: productLoading } = useGetProductBySlugQuery(slug);
  const { data: allProducts = [] } = useGetProductsQuery();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "returns">("details");

  const { addItem, isInCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addToast } = useToast();

  const relatedProducts = product
    ? allProducts.filter((p) => p.category === product.category && (p._id || p.id) !== (product._id || product.id)).slice(0, 4)
    : [];

  if (productLoading) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#ff6b00]" />
        </main>
        <Footer />
      </SmoothScrollProvider>
    );
  }

  if (!product) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-light text-white mb-4">Product Not Found</h1>
            <p className="text-white/40 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/shop" className="btn-pill btn-pill-gold">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </SmoothScrollProvider>
    );
  }

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);
  const inCart = isInCart(productId, selectedSize || product.sizes?.[0], selectedColor || product.colors?.[0]);
  const isAvailable = product.isAvailable !== false;

  const handleAddToCart = () => {
    if (!isAvailable) {
      addToast(`${product.name} is currently not available`);
      return;
    }
    const size = selectedSize || product.sizes?.[0];
    const color = selectedColor || product.colors?.[0];
    for (let i = 0; i < quantity; i++) {
      addItem(product, size, color);
    }
    addToast(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!isAvailable) {
      addToast(`${product.name} is currently not available`);
      return;
    }
    const size = selectedSize || product.sizes?.[0];
    const color = selectedColor || product.colors?.[0];
    for (let i = 0; i < quantity; i++) {
      addItem(product, size, color);
    }
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    toggleItem(product);
    addToast(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          {/* Breadcrumb */}
          <motion.div
            className="mb-6 flex items-center gap-2 text-xs text-white/30 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white/60">{product.name}</span>
          </motion.div>

          {/* Product Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0c0c0c] border border-white/[0.06]">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`h-full w-full object-cover ${!isAvailable ? "opacity-80 grayscale-[25%]" : ""}`}
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {!isAvailable ? (
                    <div className="rounded-full bg-red-950/80 px-4 py-1.5 backdrop-blur-md border border-red-500/40 shadow-lg">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-red-300 uppercase">
                        Not Available
                      </span>
                    </div>
                  ) : product.badge ? (
                    <div className="rounded-full bg-black/60 px-4 py-1.5 backdrop-blur-md border border-white/[0.08]">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                        {product.badge}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#ff6b00]/70 uppercase">
                  {product.category}
                </p>
                {!isAvailable && (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase text-red-400 border border-red-500/20">
                    Currently Unavailable
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-[#ff6b00] text-[#ff6b00]" />
                  ))}
                </div>
                <span className="text-xs text-white/40">(4.0) · 128 reviews</span>
              </div>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-white/25 line-through">${product.originalPrice}</span>
                    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Availability Notice Banner */}
              {!isAvailable && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
                  <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Out of Stock / Temporarily Unavailable
                  </p>
                  <p className="text-white/60">
                    This item is currently not available in our store. Admin has disabled this item from purchase.
                  </p>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                    Color: <span className="text-white">{selectedColor || "Select"}</span>
                  </p>
                  <div className="flex gap-3">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          (selectedColor || product.colors?.[0]) === color
                            ? "border-[#ff6b00] scale-110"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                    Size: <span className="text-white">{selectedSize || "Select"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          (selectedSize || product.sizes?.[0]) === size
                            ? "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]"
                            : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={!isAvailable}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-white">{quantity}</span>
                  <button
                    disabled={!isAvailable}
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                {isAvailable ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                        inCart
                          ? "bg-[#ff6b00]/20 border border-[#ff6b00]/50 text-[#ff6b00]"
                          : "btn-pill btn-pill-gold"
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check size={16} />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold tracking-[0.15em] uppercase bg-[#ff6b00] text-black hover:bg-[#ff7a1a] transition-all duration-300 shadow-[0_4px_20px_rgba(255, 107, 0,0.3)]"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold tracking-[0.15em] uppercase bg-red-500/20 text-red-300 border border-red-500/40 cursor-not-allowed opacity-80"
                  >
                    Not Available in Store
                  </button>
                )}
                <button
                  onClick={handleToggleWishlist}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
                    inWishlist
                      ? "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]"
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8 border-y border-white/10 py-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Truck size={18} className="text-[#ff6b00]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Shield size={18} className="text-[#ff6b00]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <RotateCcw size={18} className="text-[#ff6b00]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Easy Returns</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-white/10 mb-6">
                {(["details", "shipping", "returns"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab === "details" ? "Details" : tab === "shipping" ? "Shipping" : "Returns"}
                  </button>
                ))}
              </div>

              <div className="text-sm leading-relaxed text-white/50">
                {activeTab === "details" && (
                  <div>
                    <p className="mb-4">
                      {product.description || `Premium quality ${product.name} from NOIR--STUDIO. Crafted with the finest materials for a luxurious feel and lasting comfort.`}
                    </p>
                    <ul className="space-y-2">
                      <li>• Premium materials</li>
                      <li>• Relaxed, modern fit</li>
                      <li>• Designed in London</li>
                      <li>• Model is 6&apos;1&quot; wearing size M</li>
                    </ul>
                  </div>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-3">
                    <p>• <strong className="text-white/70">Standard Shipping:</strong> 5-7 business days (Free over $100)</p>
                    <p>• <strong className="text-white/70">Express Shipping:</strong> 2-3 business days ($15)</p>
                    <p>• <strong className="text-white/70">Next Day Delivery:</strong> Order before 2pm ($25)</p>
                  </div>
                )}
                {activeTab === "returns" && (
                  <div className="space-y-3">
                    <p>• 30-day return policy</p>
                    <p>• Free returns on all orders</p>
                    <p>• Items must be unworn with tags attached</p>
                    <p>• Refund processed within 5-7 business days</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              className="mt-20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-8 text-2xl font-light text-white">You May Also Like</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <Link key={p._id || p.id} href={`/product/${p.slug}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#0c0c0c] border border-white/[0.06] mb-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <p className="text-xs text-white/40 mb-1">{p.category}</p>
                    <p className="text-sm text-white">{p.name}</p>
                    <p className="text-sm font-bold text-[#ff6b00] mt-1">${p.price}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
