"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const COLOR_NAMES_MAP: Record<string, string> = {
  white: "#FFFFFF",
  "crisp white": "#FFFFFF",
  black: "#000000",
  "sky blue": "#779ECB",
  blue: "#2563EB",
  navy: "#1E293B",
  gray: "#6B7280",
  grey: "#6B7280",
  charcoal: "#2D3748",
  beige: "#E2D9C8",
  brown: "#78350F",
  green: "#166534",
  olive: "#556B2F",
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<DOMRect | null>(null);
  const imgRectRef = useRef<DOMRect | null>(null);
  const router = useRouter();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 25 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 25 });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSwatchColor, setSelectedSwatchColor] = useState<string | null>(null);
  const { addItem, isInCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addToast } = useToast();

  const prodId = product._id || product.id || product.slug || "";
  const inWishlist = isInWishlist(prodId);
  const inCart = isInCart(prodId);

  // Extract display color swatches with proper hex codes, images, and availability
  const colorSwatches = useMemo(() => {
    if (product.colorOptions && product.colorOptions.length > 0) {
      return product.colorOptions.map((c) => ({
        name: c.name,
        hex: c.hex || (c.name.startsWith("#") ? c.name : COLOR_NAMES_MAP[c.name.trim().toLowerCase()] || "#1a1a1a"),
        isAvailable: c.isAvailable !== false,
        images: (c.images || [])
          .map((img: any) => (typeof img === "string" ? img : img?.url))
          .filter(Boolean),
      }));
    }
    if (product.variants && product.variants.length > 0) {
      const map = new Map<string, { name: string; hex: string; isAvailable: boolean; images: string[] }>();
      product.variants.forEach((v) => {
        if (v.color && !map.has(v.color.toLowerCase())) {
          map.set(v.color.toLowerCase(), {
            name: v.color,
            hex: v.colorCode || (v.color.startsWith("#") ? v.color : COLOR_NAMES_MAP[v.color.trim().toLowerCase()] || "#1a1a1a"),
            isAvailable: v.isActive !== false && v.stock > 0,
            images: (v.images || [])
              .map((img: any) => (typeof img === "string" ? img : img?.url))
              .filter(Boolean),
          });
        }
      });
      if (map.size > 0) return Array.from(map.values());
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c) => {
        if (c.startsWith("#")) return { name: c, hex: c, isAvailable: true, images: [] };
        const lower = c.trim().toLowerCase();
        const mappedHex = COLOR_NAMES_MAP[lower] || lower.replace(/\s+/g, "");
        return { name: c, hex: mappedHex, isAvailable: true, images: [] };
      });
    }
    return [];
  }, [product]);

  const activeSwatch = colorSwatches.find(
    (s) => s.name.toLowerCase() === selectedSwatchColor?.toLowerCase()
  );
  const isAvailable = product.isAvailable !== false && (activeSwatch ? activeSwatch.isAvailable !== false : true);

  // Extract all available photos for multi-photo cursor scrub (prioritizes active color, then main product photos)
  const productImages = useMemo(() => {
    // 1. If a specific color swatch is selected, show ONLY that color's dedicated photos
    if (activeSwatch && activeSwatch.images && activeSwatch.images.length > 0) {
      return activeSwatch.images.filter((u): u is string => typeof u === "string" && Boolean(u.trim()));
    }

    const list: string[] = [];

    // 2. Primary catalog images
    if (product.image && typeof product.image === "string" && product.image.trim()) {
      list.push(product.image.trim());
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach((img: any) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url && typeof url === "string" && url.trim() && !list.includes(url.trim())) {
          list.push(url.trim());
        }
      });
    }

    if (product.hoverImage && typeof product.hoverImage === "string" && product.hoverImage.trim() && !list.includes(product.hoverImage.trim())) {
      list.push(product.hoverImage.trim());
    }

    // 3. If no main photos exist, check first color option
    if (list.length === 0 && product.colorOptions && product.colorOptions[0]?.images) {
      product.colorOptions[0].images.forEach((img: any) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url && typeof url === "string" && url.trim() && !list.includes(url.trim())) {
          list.push(url.trim());
        }
      });
    }

    return list.length > 0
      ? list
      : ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&q=80"];
  }, [product, activeSwatch]);

  const handleMouseEnter = () => {
    if (ref.current) {
      cardRectRef.current = ref.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    let rect = cardRectRef.current;
    if (!rect && ref.current) {
      rect = ref.current.getBoundingClientRect();
      cardRectRef.current = rect;
    }
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    rotateX.set(y * -6);
    rotateY.set(x * 6);
  };

  const handleMouseLeave = () => {
    cardRectRef.current = null;
    imgRectRef.current = null;
    rotateX.set(0);
    rotateY.set(0);
    setActiveImageIndex(0);
  };

  const handleImageMouseEnter = () => {
    if (imgBoxRef.current) {
      imgRectRef.current = imgBoxRef.current.getBoundingClientRect();
    }
  };

  // Cursor scrub across image box horizontally
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (productImages.length <= 1) return;
    let rect = imgRectRef.current;
    if (!rect && imgBoxRef.current) {
      rect = imgBoxRef.current.getBoundingClientRect();
      imgRectRef.current = rect;
    }
    if (!rect || rect.width <= 0) return;
    const x = e.clientX - rect.left;
    const segment = Math.min(
      Math.max(0, Math.floor((x / rect.width) * productImages.length)),
      productImages.length - 1
    );
    if (segment !== activeImageIndex) {
      setActiveImageIndex(segment);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
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

    const buyNowPayload = {
      product,
      quantity: 1,
      selectedSize: defaultSize,
      selectedColor: defaultColor,
      colorCode: defaultVariant?.colorCode,
      variantId: defaultVariant?._id,
      sku: defaultVariant?.sku,
      price: defaultVariant?.sellingPrice || product.price,
      image: variantImg,
      stock: defaultVariant?.stock || product.stock,
    };
    try {
      sessionStorage.setItem("noir-buynow", JSON.stringify(buyNowPayload));
    } catch (err) {
      console.error(err);
    }
    router.push("/checkout?buyNow=true");
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
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <Link href={selectedSwatchColor ? `/product/${product.slug}?color=${encodeURIComponent(selectedSwatchColor)}` : `/product/${product.slug}`}>
        <motion.div
          className={`relative overflow-hidden rounded-2xl bg-[#0c0c0c] border transition-all duration-500 ${
            !isAvailable
              ? "border-red-500/20 group-hover:border-red-500/40"
              : "border-white/[0.06] group-hover:border-white/[0.14] group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,107,0,0.08)]"
          }`}
          style={{
            rotateX: springX,
            rotateY: springY,
          }}
        >
          {/* Image Container with Cursor Scrubbing & Multiple Photos */}
          <div
            ref={imgBoxRef}
            onMouseEnter={handleImageMouseEnter}
            onMouseMove={handleImageMouseMove}
            className="preserve-white relative aspect-[3/4] overflow-hidden select-none"
          >
            <img
              src={productImages[activeImageIndex] || productImages[0]}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&q=80";
              }}
              className={`h-full w-full object-cover transition-all duration-300 ease-out group-hover:scale-105 ${
                !isAvailable ? "opacity-85 grayscale-[20%]" : ""
              }`}
            />

            {/* Segment Indicator Dashes when multiple photos exist */}
            {productImages.length > 1 && (
              <div className="absolute top-2.5 left-3 right-3 z-20 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {productImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all duration-150 ${
                      idx === activeImageIndex
                        ? "bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.8)] scale-y-125"
                        : "bg-white/30 backdrop-blur-sm"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Photo Counter Badge (e.g. 2 / 4) */}
            {productImages.length > 1 && (
              <div className="absolute top-5 left-3 z-20 rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-2 py-0.5 text-[9px] font-mono font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 shadow-lg">
                <span className="text-[#ff6b00]">{activeImageIndex + 1}</span>
                <span className="text-white/40">/</span>
                <span>{productImages.length}</span>
              </div>
            )}

            {/* Next / Previous Buttons on hover */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 h-7 w-7 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff6b00] hover:text-black transition-all shadow-xl active:scale-90"
                  title="Previous Photo"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-7 w-7 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff6b00] hover:text-black transition-all shadow-xl active:scale-90"
                  title="Next Photo"
                >
                  <ChevronRight size={14} />
                </button>
              </>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />

            {/* Top shine line on hover */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

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
              <span className="text-[15px] font-bold text-white sm:text-base">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[12px] text-white/25 line-through sm:text-[13px]">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {colorSwatches.length > 0 && (
              <div className="mt-3 flex items-center justify-between gap-2 sm:mt-3.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorSwatches.map((swatch, i) => {
                    const isSelected = selectedSwatchColor
                      ? selectedSwatchColor.toLowerCase() === swatch.name.toLowerCase()
                      : false;
                    return (
                      <button
                        key={i}
                        type="button"
                        title={`${swatch.name}${!swatch.isAvailable ? " (Out of Stock)" : ""}`}
                        onMouseEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSwatchColor(swatch.name);
                          setActiveImageIndex(0);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSwatchColor(swatch.name);
                          setActiveImageIndex(0);
                        }}
                        className={`relative h-4 w-4 rounded-full border shadow-sm transition-all duration-200 hover:scale-125 ${
                          isSelected
                            ? "ring-2 ring-[#ff6b00] ring-offset-1 ring-offset-black scale-110"
                            : "border-black/20 dark:border-white/25"
                        } ${!swatch.isAvailable ? "opacity-60" : ""}`}
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {!swatch.isAvailable && (
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-bold bg-black/60 rounded-full">
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSwatchColor && (
                  <span className="text-[10px] font-medium text-white/50 truncate max-w-[110px]">
                    {selectedSwatchColor}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
