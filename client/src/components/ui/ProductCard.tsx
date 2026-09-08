"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { addItem, isInCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addToast } = useToast();

  const prodId = product._id || product.id || product.slug || "";
  const inWishlist = isInWishlist(prodId);
  const inCart = isInCart(prodId);

  const isAvailable = product.isAvailable !== false;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) {
      addToast(`${product.name} is currently not available`);
      return;
    }
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0] || product.colorOptions?.[0]?.name;
    const defaultVariant = product.variants?.[0];
    const variantImg =
      typeof defaultVariant?.images?.[0] === "string"
        ? defaultVariant.images[0]
        : defaultVariant?.images?.[0]?.url || product.image;

    addItem(
      product,
      defaultSize,
      defaultColor,
      defaultVariant
        ? {
            variantId: defaultVariant._id,
            sku: defaultVariant.sku,
            price: defaultVariant.sellingPrice,
            image: variantImg,
            stock: defaultVariant.stock,
            colorCode: defaultVariant.colorCode,
          }
        : undefined
    );
    addToast(`${product.name} added to cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) {
      addToast(`${product.name} is currently not available`);
      return;
    }
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0] || product.colorOptions?.[0]?.name;
    const defaultVariant = product.variants?.[0];
    const variantImg =
      typeof defaultVariant?.images?.[0] === "string"
        ? defaultVariant.images[0]
        : defaultVariant?.images?.[0]?.url || product.image;

    addItem(
      product,
      defaultSize,
      defaultColor,
      defaultVariant
        ? {
            variantId: defaultVariant._id,
            sku: defaultVariant.sku,
            price: defaultVariant.sellingPrice,
            image: variantImg,
            stock: defaultVariant.stock,
            colorCode: defaultVariant.colorCode,
          }
        : undefined
    );
    router.push("/checkout");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    addToast(
      inWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`
    );
  };

  return (
    <motion.div
      ref={ref}
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <Link href={`/product/${product.slug}`}>
        <motion.div
          className={`relative overflow-hidden rounded-2xl bg-[#0c0c0c] border transition-all duration-500 ${
            !isAvailable
              ? "border-red-500/20 group-hover:border-red-500/40"
              : "border-white/[0.06] group-hover:border-white/[0.14] group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,107,0,0.08)]"
          }`}
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Image Container */}
          <div className="preserve-white relative aspect-[3/4] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&q=80";
              }}
              className={`h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 ${
                !isAvailable ? "opacity-85 grayscale-[20%]" : ""
              }`}
            />
            {product.hoverImage && (
              <img
                src={product.hoverImage}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 ${
                  !isAvailable ? "opacity-85 grayscale-[20%]" : ""
                }`}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

            {/* Top shine line on hover */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Badges: Not Available OR Custom Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 items-start">
              {!isAvailable ? (
                <div className="relative overflow-hidden rounded-full bg-red-950/80 px-3 py-1 backdrop-blur-md border border-red-500/40 sm:px-3.5 sm:py-1.5 shadow-lg">
                  <span className="relative z-10 text-[9px] font-bold tracking-[0.2em] text-red-300 uppercase sm:text-[10px]">
                    Not Available
                  </span>
                </div>
              ) : product.badge ? (
                <div className="relative overflow-hidden rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/[0.08] sm:px-3.5 sm:py-1.5">
                  <span className="relative z-10 text-[9px] font-bold tracking-[0.2em] text-white uppercase sm:text-[10px]">
                    {product.badge}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 to-[#ff6b00]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ) : null}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border opacity-0 scale-90 transition-all duration-400 group-hover:opacity-100 group-hover:scale-100 sm:top-4 sm:right-4 sm:h-10 sm:w-10 ${
                inWishlist
                  ? "bg-[#ff6b00]/90 border-[#ff6b00] text-black"
                  : "bg-black/50 border-white/[0.08] text-white hover:bg-black/70 hover:border-white/20"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={inWishlist ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            {/* Quick Add Actions */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-y-0">
              <div className="bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 pb-4 px-4 sm:px-5 space-y-2">
                {isAvailable ? (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="w-full rounded-full bg-[#ff6b00] py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-black transition-all duration-300 hover:bg-[#ff7a1a] sm:text-[11px]"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className={`w-full rounded-full py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg transition-all duration-300 sm:text-[11px] ${
                        inCart
                          ? "bg-[#ff6b00]/20 border border-[#ff6b00]/50 text-[#ff6b00]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {inCart ? "In Cart" : "Add to Cart"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full rounded-full bg-red-500/20 border border-red-500/40 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-red-300 transition-all duration-300 cursor-not-allowed sm:text-[11px]"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#ff6b00]/70 uppercase sm:text-[11px]">
                {product.category}
              </p>
              {!isAvailable && (
                <span className="text-[9px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Out of Stock
                </span>
              )}
            </div>
            <h3 className="mb-2 text-[14px] font-medium tracking-wide text-white sm:text-[15px] truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] font-bold text-white sm:text-base">${product.price}</span>
              {product.originalPrice && (
                <span className="text-[12px] text-white/25 line-through sm:text-[13px]">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="mt-3 flex gap-2 sm:mt-3.5">
                {product.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-3.5 w-3.5 rounded-full border border-white/[0.12] transition-all duration-300 hover:border-white/40 hover:scale-125 sm:h-4 sm:w-4"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
