"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useGetProductBySlugQuery, useGetProductsQuery } from "@/redux/api/product.api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import {
  Check,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ruler,
  AlertCircle,
  Sparkles,
  Zap,
  Tag,
  Layers,
  X,
} from "lucide-react";
import { ProductVariant, ProductColor } from "@/types";

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

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "shipping" | "returns">("details");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { addItem, isInCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addToast } = useToast();
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Available Colors list (from colorOptions, variants, or colors)
  const availableColors: ProductColor[] = useMemo(() => {
    if (!product) return [];
    if (product.colorOptions && product.colorOptions.length > 0) {
      return product.colorOptions;
    }
    if (product.variants && product.variants.length > 0) {
      const map = new Map<string, ProductColor>();
      product.variants.forEach((v) => {
        if (!map.has(v.color.toLowerCase())) {
          map.set(v.color.toLowerCase(), {
            name: v.color,
            hex: v.colorCode || "#1A1A1A",
            images: v.images || [],
          });
        }
      });
      return Array.from(map.values());
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c) => ({
        name: c.startsWith("#") ? "Color" : c,
        hex: c.startsWith("#") ? c : "#222222",
        images: [],
      }));
    }
    return [{ name: "Standard", hex: "#111111", images: [] }];
  }, [product]);

  // Available Sizes list
  const availableSizes: string[] = useMemo(() => {
    if (!product) return [];
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes;
    }
    if (product.variants && product.variants.length > 0) {
      return Array.from(new Set(product.variants.map((v) => v.size)));
    }
    return ["Free Size"];
  }, [product]);

  // Set initial selected color and size
  useEffect(() => {
    if (product) {
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0].name);
      }
      if (availableSizes.length > 0 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, availableColors, availableSizes, selectedColor, selectedSize]);

  // Active color gallery images (switches dynamically based on color)
  const activeGallery: string[] = useMemo(() => {
    if (!product) return [];

    const extractUrls = (arr?: any[]): string[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr
        .map((item) => (typeof item === "string" ? item : item?.url || ""))
        .filter(Boolean);
    };

    // 1. Check if active color has dedicated images in colorOptions
    const matchedColorOpt = product.colorOptions?.find(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
    const colorImgs = extractUrls(matchedColorOpt?.images);
    if (colorImgs.length > 0) {
      return colorImgs;
    }

    // 2. Check if active color has images in variants
    const matchedVariantWithImgs = product.variants?.find(
      (v) =>
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        v.images &&
        v.images.length > 0
    );
    const varImgs = extractUrls(matchedVariantWithImgs?.images);
    if (varImgs.length > 0) {
      return varImgs;
    }

    // 3. Fallback to product images list or main image
    const imgs: string[] = [];
    if (product.image) imgs.push(product.image);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const u = typeof img === "string" ? img : img?.url;
        if (u && !imgs.includes(u)) imgs.push(u);
      });
    }
    if (product.hoverImage && !imgs.includes(product.hoverImage)) {
      imgs.push(product.hoverImage);
    }

    return imgs.length > 0 ? imgs : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop"];
  }, [product, selectedColor]);

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor]);

  // Resolve matching variant
  const activeVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    return product.variants.find(
      (v) =>
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        v.size.toLowerCase() === selectedSize.toLowerCase() &&
        v.isActive !== false
    );
  }, [product, selectedColor, selectedSize]);

  // Active pricing, SKU, and stock metrics
  const displayPrice = activeVariant ? activeVariant.sellingPrice : product?.price ?? 0;
  const displayMrp = activeVariant?.mrp ?? product?.originalPrice;
  const displayDiscount = activeVariant
    ? activeVariant.discount || (displayMrp && displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0)
    : product?.discount || (displayMrp && displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0);
  const displaySku = activeVariant?.sku || product?.sku || "";
  const activeStock = activeVariant ? activeVariant.stock : (product?.stock ?? 50);

  const isStoreAvailable = product?.isAvailable !== false;
  const isOutOfStock = !isStoreAvailable || activeStock <= 0;
  const isLowStock = !isOutOfStock && activeStock <= (product?.lowStockThreshold || 5);

  const productId = product?._id || product?.id || "";
  const inWishlist = isInWishlist(productId);
  const inCart = isInCart(productId, selectedSize, selectedColor, activeVariant?._id);

  // Helper for size-specific stock in current color
  const getSizeStock = (size: string): number => {
    if (!product?.variants || product.variants.length === 0) return product?.stock ?? 50;
    const v = product.variants.find(
      (item) =>
        item.color.toLowerCase() === selectedColor.toLowerCase() &&
        item.size.toLowerCase() === size.toLowerCase() &&
        item.isActive !== false
    );
    return v ? v.stock : 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) {
      addToast(`${product.name} (${selectedColor} / ${selectedSize}) is currently out of stock`, "error");
      return;
    }
    const colorObj = availableColors.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase());
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor, {
        variantId: activeVariant?._id,
        sku: displaySku,
        price: displayPrice,
        image: activeGallery[selectedImageIndex] || activeGallery[0] || product.image,
        stock: activeStock,
        colorCode: colorObj?.hex,
      });
    }
    addToast(`${product.name} (${selectedColor} · ${selectedSize}) added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (isOutOfStock) {
      addToast(`${product.name} is currently out of stock`, "error");
      return;
    }
    const colorObj = availableColors.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase());
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor, {
        variantId: activeVariant?._id,
        sku: displaySku,
        price: displayPrice,
        image: activeGallery[selectedImageIndex] || activeGallery[0] || product.image,
        stock: activeStock,
        colorCode: colorObj?.hex,
      });
    }
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleItem(product);
    addToast(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const relatedProducts = product
    ? allProducts
        .filter((p) => p.category === product.category && (p._id || p.id) !== productId)
        .slice(0, 4)
    : [];

  if (productLoading) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#ff6b00]" />
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
          <div className="text-center px-5">
            <h1 className="text-4xl font-light text-white mb-4">Product Not Found</h1>
            <p className="text-white/40 mb-8">The product you are looking for does not exist or has been removed.</p>
            <Link href="/shop" className="btn-pill btn-pill-gold">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </SmoothScrollProvider>
    );
  }

  const currentMainImage = activeGallery[selectedImageIndex] || activeGallery[0] || product.image;

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
            <span className="text-white/40">{product.category}</span>
            <span>/</span>
            <span className="text-white/80 font-medium truncate max-w-xs">{product.name}</span>
          </motion.div>

          {/* Product Hero Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left: Interactive Media Gallery (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Thumbnail strip */}
              {activeGallery.length > 1 && (
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[640px] pb-2 sm:pb-0 scrollbar-thin">
                  {activeGallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 h-20 w-16 sm:h-24 sm:w-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/30 scale-95"
                          : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image with Magnifier Zoom */}
              <div className="flex-1 relative">
                <div
                  ref={mainImageRef}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  className="relative aspect-[3/4] max-h-[680px] w-full overflow-hidden rounded-2xl bg-[#0c0c0c] border border-white/[0.08] cursor-crosshair group select-none"
                >
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-transform duration-200 ${
                      isZoomed ? "scale-150" : "scale-100"
                    } ${isOutOfStock ? "opacity-75 grayscale-[20%]" : ""}`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                          }
                        : undefined
                    }
                  />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-950/90 px-3.5 py-1 text-[10px] font-bold tracking-widest text-red-300 uppercase border border-red-500/40 backdrop-blur-md shadow-lg">
                        Out of Stock
                      </span>
                    ) : product.badge ? (
                      <span className="rounded-full bg-black/70 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#ff6b00] uppercase border border-[#ff6b00]/30 backdrop-blur-md">
                        {product.badge}
                      </span>
                    ) : null}
                    {displayDiscount > 0 && (
                      <span className="rounded-full bg-[#ff6b00] px-3 py-0.5 text-[10px] font-extrabold text-black uppercase shadow-md w-fit">
                        {displayDiscount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Previous / Next buttons */}
                  {activeGallery.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : activeGallery.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 hover:scale-110"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev < activeGallery.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 hover:scale-110"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Product Details & Variant Controls (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Brand & Category */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold tracking-[0.25em] text-[#ff6b00] uppercase">
                    {product.brand || "NOIR STUDIO"} · {product.category}
                  </span>
                  {displaySku && (
                    <span className="text-[10px] font-mono text-white/30 tracking-wider">
                      SKU: {displaySku}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white mb-3 leading-snug">
                  {product.name}
                </h1>

                {/* Ratings & Reviews */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-[#ff6b00] text-[#ff6b00]" />
                    ))}
                  </div>
                  <span className="text-xs text-white/50 font-medium">4.8 · 142 Verified Reviews</span>
                </div>

                {/* Dynamic Price Display */}
                <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0c]/80 p-5 backdrop-blur-sm">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      ₹{displayPrice.toLocaleString()}
                    </span>
                    {displayMrp && displayMrp > displayPrice && (
                      <>
                        <span className="text-lg text-white/30 line-through">
                          ₹{displayMrp.toLocaleString()}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                          Save {displayDiscount}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">Inclusive of all taxes & duties</p>

                  {/* Stock Status Alert */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    {isOutOfStock ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                        <AlertCircle size={14} /> Currently Out of Stock
                      </div>
                    ) : isLowStock ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                        <Zap size={14} className="animate-bounce" /> Hurry, only {activeStock} left in stock!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Check size={14} /> In Stock · Ready to Dispatch
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selector */}
                {availableColors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                        Color: <span className="text-white font-semibold">{selectedColor}</span>
                      </label>
                      <span className="text-[11px] text-[#ff6b00]/80">
                        {availableColors.length} available
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color) => {
                        const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => setSelectedColor(color.name)}
                            className={`group flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all ${
                              isSelected
                                ? "border-[#ff6b00] bg-[#ff6b00]/10 ring-1 ring-[#ff6b00]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-white/20 shadow-sm transition-transform group-hover:scale-110"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-white/70"}`}>
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                        Select Size: <span className="text-white font-semibold">{selectedSize}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(true)}
                        className="inline-flex items-center gap-1 text-xs text-[#ff6b00] hover:underline"
                      >
                        <Ruler size={13} /> Size Guide
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                      {availableSizes.map((size) => {
                        const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
                        const stockForThisSize = getSizeStock(size);
                        const isSizeOut = stockForThisSize <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={isSizeOut}
                            onClick={() => setSelectedSize(size)}
                            className={`relative flex flex-col items-center justify-center rounded-xl py-2.5 px-2 border transition-all text-xs font-medium ${
                              isSelected
                                ? "border-[#ff6b00] bg-[#ff6b00] text-black font-bold shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                                : isSizeOut
                                ? "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed line-through"
                                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            <span>{size}</span>
                            {isSizeOut && (
                              <span className="text-[9px] text-red-400 font-normal no-underline mt-0.5">Sold out</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & CTA Buttons */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-1">
                      <button
                        type="button"
                        disabled={isOutOfStock || quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-white">{quantity}</span>
                      <button
                        type="button"
                        disabled={isOutOfStock || quantity >= activeStock}
                        onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                        isOutOfStock
                          ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                          : inCart
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                          : "btn-pill btn-pill-gold shadow-lg"
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check size={16} /> Added to Bag
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to Cart
                        </>
                      )}
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      className={`h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center transition-all ${
                        inWishlist
                          ? "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]"
                          : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Buy Now Button */}
                  {!isOutOfStock && (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold tracking-widest uppercase bg-[#ff6b00] text-black hover:bg-[#ff7a1a] transition-all shadow-[0_4px_25px_rgba(255,107,0,0.35)] hover:shadow-[0_4px_35px_rgba(255,107,0,0.5)]"
                    >
                      <Zap size={16} fill="currentColor" /> Buy Now
                    </button>
                  )}
                </div>

                {/* Highlights / Trust badges */}
                <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <Truck size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-white/80 uppercase">Free Delivery</span>
                    <span className="text-[9px] text-white/40">Orders over ₹999</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <Shield size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-white/80 uppercase">100% Genuine</span>
                    <span className="text-[9px] text-white/40">Direct from Studio</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <RotateCcw size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-white/80 uppercase">7 Days Return</span>
                    <span className="text-[9px] text-white/40">Hassle-free exchange</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specifications Tabs */}
          <div className="mt-16 border-t border-white/10 pt-10">
            <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto">
              {(
                [
                  { key: "details", label: "Description" },
                  { key: "specs", label: "Specifications & Attributes" },
                  { key: "shipping", label: "Shipping & Delivery" },
                  { key: "returns", label: "Returns & Warranty" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-w-4xl text-sm leading-relaxed text-white/60">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <p className="text-white/80 whitespace-pre-line leading-relaxed">
                    {product.description ||
                      `Crafted with extraordinary precision, the ${product.name} embodies contemporary masculine elegance. Designed with supreme attention to silhouette, texture, and durability.`}
                  </p>
                  {product.shortDescription && (
                    <p className="text-xs text-[#ff6b00]/80 italic">{product.shortDescription}</p>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="pt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/40">Tags:</span>
                      {product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-white/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.attributes ? (
                    <>
                      {product.attributes.fabric && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Fabric / Material</p>
                          <p className="text-white font-medium mt-1">{product.attributes.fabric}</p>
                        </div>
                      )}
                      {product.attributes.fit && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Fit</p>
                          <p className="text-white font-medium mt-1">{product.attributes.fit}</p>
                        </div>
                      )}
                      {product.attributes.pattern && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Pattern</p>
                          <p className="text-white font-medium mt-1">{product.attributes.pattern}</p>
                        </div>
                      )}
                      {product.attributes.sleeve && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Sleeve Length</p>
                          <p className="text-white font-medium mt-1">{product.attributes.sleeve}</p>
                        </div>
                      )}
                      {product.attributes.collar && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Collar Style</p>
                          <p className="text-white font-medium mt-1">{product.attributes.collar}</p>
                        </div>
                      )}
                      {product.attributes.occasion && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Occasion</p>
                          <p className="text-white font-medium mt-1">{product.attributes.occasion}</p>
                        </div>
                      )}
                      {product.attributes.washCare && (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Wash Care</p>
                          <p className="text-white font-medium mt-1">{product.attributes.washCare}</p>
                        </div>
                      )}
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Country of Origin</p>
                        <p className="text-white font-medium mt-1">{product.attributes.countryOfOrigin || "India"}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/40">Standard specifications apply for this product category.</p>
                  )}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-3">
                  <p>• <strong className="text-white">Standard Delivery:</strong> Dispatched in 24-48 hours. Delivered within 3-5 business days.</p>
                  <p>• <strong className="text-white">Express Shipping:</strong> Same day dispatch available for orders placed before 12 PM.</p>
                  <p>• <strong className="text-white">Packaging:</strong> Packed in premium dust bags and rigid presentation boxes.</p>
                </div>
              )}

              {activeTab === "returns" && (
                <div className="space-y-3">
                  <p>• <strong className="text-white">7-Day Free Exchange & Return:</strong> Unused items with original tags can be returned or exchanged.</p>
                  <p>• <strong className="text-white">Doorstep Pickup:</strong> Free reverse pickup arranged at your delivery address.</p>
                  <p>• <strong className="text-white">Instant Refund:</strong> Refund initiated within 24 hours of item pickup.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-white">Complete Your Look</h2>
                <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs text-[#ff6b00] hover:underline">
                  View All {product.category} →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <Link key={p._id || p.id} href={`/product/${p.slug}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0c0c0c] border border-white/[0.08] mb-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-[#ff6b00]/70 uppercase">{p.category}</p>
                    <p className="text-sm text-white font-medium truncate mt-0.5">{p.name}</p>
                    <p className="text-sm font-bold text-white mt-1">₹{p.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ruler size={18} className="text-[#ff6b00]" /> Standard Size Chart (Inches)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/70">
                  <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Chest (in)</th>
                      <th className="p-2.5">Waist (in)</th>
                      <th className="p-2.5">Length (in)</th>
                      <th className="p-2.5">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr><td className="p-2.5 font-sans font-bold text-white">S</td><td className="p-2.5">38</td><td className="p-2.5">34</td><td className="p-2.5">28</td><td className="p-2.5">17.5</td></tr>
                    <tr><td className="p-2.5 font-sans font-bold text-white">M</td><td className="p-2.5">40</td><td className="p-2.5">36</td><td className="p-2.5">29</td><td className="p-2.5">18.0</td></tr>
                    <tr><td className="p-2.5 font-sans font-bold text-white">L</td><td className="p-2.5">42</td><td className="p-2.5">38</td><td className="p-2.5">30</td><td className="p-2.5">18.5</td></tr>
                    <tr><td className="p-2.5 font-sans font-bold text-white">XL</td><td className="p-2.5">44</td><td className="p-2.5">40</td><td className="p-2.5">31</td><td className="p-2.5">19.0</td></tr>
                    <tr><td className="p-2.5 font-sans font-bold text-white">XXL</td><td className="p-2.5">46</td><td className="p-2.5">42</td><td className="p-2.5">32</td><td className="p-2.5">19.5</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="btn-pill btn-pill-gold text-xs px-6"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </SmoothScrollProvider>
  );
}
