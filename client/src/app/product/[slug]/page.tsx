"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { ProductDetailSkeleton } from "@/components/ui/StoreSkeletons";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const initialColorQuery = searchParams ? searchParams.get("color") : null;

  const { data: product, isLoading: productLoading } = useGetProductBySlugQuery(slug, {
    refetchOnMountOrArgChange: true,
  });
  const { data: allProducts = [] } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

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
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);

  const scrollSelectedThumbnailIntoView = (index: number) => {
    if (!thumbnailScrollRef.current) return;
    const container = thumbnailScrollRef.current;
    const thumbElements = container.querySelectorAll<HTMLButtonElement>("button[data-thumb-btn]");
    const targetThumb = thumbElements[index];
    if (targetThumb) {
      const thumbRect = targetThumb.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const delta = thumbRect.left + thumbRect.width / 2 - (containerRect.left + containerRect.width / 2);
      container.scrollTo({
        left: container.scrollLeft + delta,
        behavior: "smooth",
      });
    }
  };

  const navigatePhoto = (direction: "left" | "right") => {
    if (!activeGallery || activeGallery.length <= 1) return;
    if (direction === "left") {
      if (selectedImageIndex <= 0) return;
      const nextIdx = selectedImageIndex - 1;
      setSelectedImageIndex(nextIdx);
      scrollSelectedThumbnailIntoView(nextIdx);
    } else {
      if (selectedImageIndex >= activeGallery.length - 1) return;
      const nextIdx = selectedImageIndex + 1;
      setSelectedImageIndex(nextIdx);
      scrollSelectedThumbnailIntoView(nextIdx);
    }
  };

  const scrollThumbnails = navigatePhoto;

  useEffect(() => {
    scrollSelectedThumbnailIntoView(selectedImageIndex);
  }, [selectedImageIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 45) {
      // Swiped Right -> Previous image
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : activeGallery.length - 1));
    } else if (diff < -45) {
      // Swiped Left -> Next image
      setSelectedImageIndex((prev) => (prev < activeGallery.length - 1 ? prev + 1 : 0));
    }
  };

  const colorThumbTrackRef = useRef<HTMLDivElement>(null);

  const scrollSelectedColorIntoView = (index: number) => {
    if (!colorThumbTrackRef.current) return;
    const container = colorThumbTrackRef.current;
    const cardElements = container.querySelectorAll<HTMLButtonElement>("button[data-color-btn]");
    const targetCard = cardElements[index];
    if (targetCard) {
      const cardRect = targetCard.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const delta = cardRect.left + cardRect.width / 2 - (containerRect.left + containerRect.width / 2);
      container.scrollTo({
        left: container.scrollLeft + delta,
        behavior: "smooth",
      });
    }
  };


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

  const getColorThumbnail = (color: ProductColor): string => {
    // 1. If this color has dedicated images, ALWAYS use its primary angle photo!
    if (color.images && color.images.length > 0) {
      const first = color.images[0];
      const u = typeof first === "string" ? first : first?.url;
      if (u) return u;
    }

    // 2. If variant has dedicated images, use variant image
    const matchedVar = product?.variants?.find(
      (v) => v.color.toLowerCase() === color.name.toLowerCase() && v.images && v.images.length > 0
    );
    if (matchedVar?.images?.[0]) {
      const u = typeof matchedVar.images[0] === "string" ? matchedVar.images[0] : matchedVar.images[0]?.url;
      if (u) return u;
    }

    // 3. Fallback to product primary image
    return product?.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&fit=crop";
  };

  const currentColorIndex = useMemo(() => {
    return availableColors.findIndex(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
  }, [availableColors, selectedColor]);

  const isLeftDisabled = currentColorIndex <= 0;
  const isRightDisabled = currentColorIndex >= availableColors.length - 1 || currentColorIndex === -1;

  const navigateVariant = (direction: "left" | "right") => {
    if (!availableColors || availableColors.length <= 1) return;

    if (direction === "left") {
      if (currentColorIndex <= 0) return;
      const nextIndex = currentColorIndex - 1;
      const nextColor = availableColors[nextIndex];
      if (nextColor) {
        setSelectedColor(nextColor.name);
        setSelectedImageIndex(0);
        scrollSelectedColorIntoView(nextIndex);
      }
    } else {
      if (currentColorIndex >= availableColors.length - 1) return;
      const nextIndex = currentColorIndex + 1;
      const nextColor = availableColors[nextIndex];
      if (nextColor) {
        setSelectedColor(nextColor.name);
        setSelectedImageIndex(0);
        scrollSelectedColorIntoView(nextIndex);
      }
    }
  };

  const scrollColorThumbs = navigateVariant;

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

  // Set initial selected color and size (supporting ?color=... from product card click)
  useEffect(() => {
    if (product && availableColors.length > 0) {
      if (initialColorQuery) {
        const found = availableColors.find(
          (c) => c.name.toLowerCase() === initialColorQuery.toLowerCase()
        );
        if (found) {
          setSelectedColor(found.name);
          setSelectedImageIndex(0);
          return;
        }
      }
      if (!selectedColor) {
        setSelectedColor(availableColors[0].name);
        setSelectedImageIndex(0);
      }
    }
  }, [product, availableColors, initialColorQuery]);

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

  useEffect(() => {
    if (product && availableSizes.length > 0) {
      const currentStock = selectedSize ? getSizeStock(selectedSize) : 0;
      // Automatically default to the first available in-stock size
      if (!selectedSize || currentStock <= 0) {
        const firstInStock = availableSizes.find((s) => getSizeStock(s) > 0);
        if (firstInStock) {
          setSelectedSize(firstInStock);
        } else if (!selectedSize) {
          setSelectedSize(availableSizes[0]);
        }
      }
    }
  }, [product, availableSizes, selectedColor, selectedSize]);

  // Keep selected color thumbnail centered in the variant strip
  useEffect(() => {
    if (!selectedColor || !colorThumbTrackRef.current) return;
    const currentIndex = availableColors.findIndex(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
    if (currentIndex >= 0) {
      scrollSelectedColorIntoView(currentIndex);
    }
  }, [selectedColor, availableColors]);

  // Active gallery images (guarantees primary photo is #1, supports dedicated color photos)
  const activeGallery: string[] = useMemo(() => {
    if (!product) return [];

    const extractUrls = (arr?: any[]): string[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr
        .map((item) => (typeof item === "string" ? item : item?.url || ""))
        .filter(Boolean);
    };

    // Primary photo from product catalog
    const primaryImgUrl = product.image ? product.image.trim() : "";

    // Main product gallery photos (from "Product Image Gallery" in admin)
    const mainImgs: string[] = [];
    if (primaryImgUrl) mainImgs.push(primaryImgUrl);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const u = typeof img === "string" ? img : img?.url;
        if (u && typeof u === "string" && !mainImgs.includes(u.trim())) {
          mainImgs.push(u.trim());
        }
      });
    }
    if (product.hoverImage && typeof product.hoverImage === "string" && !mainImgs.includes(product.hoverImage.trim())) {
      mainImgs.push(product.hoverImage.trim());
    }

    // Check if user is on the default/first color variant
    const isFirstColor =
      !selectedColor ||
      (availableColors.length > 0 &&
        selectedColor.toLowerCase() === availableColors[0].name.toLowerCase());

    // Active color dedicated images
    const matchedColorOpt = product.colorOptions?.find(
      (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
    );
    const colorImgs = extractUrls(matchedColorOpt?.images);

    // Active variant dedicated images
    const matchedVariantWithImgs = product.variants?.find(
      (v) =>
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        v.images &&
        v.images.length > 0
    );
    const varImgs = extractUrls(matchedVariantWithImgs?.images);

    const activeColorImgs = colorImgs.length > 0 ? colorImgs : varImgs;

    // When the selected color has dedicated angle photos, show that color's photos!
    if (activeColorImgs.length > 0) {
      return activeColorImgs;
    }

    if (mainImgs.length > 0) {
      return mainImgs;
    }

    return ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop"];
  }, [product, selectedColor, availableColors]);

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
  const matchedColorOpt = availableColors.find(
    (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
  );
  const isColorAvailable = matchedColorOpt ? matchedColorOpt.isAvailable !== false : true;
  const isOutOfStock = !isStoreAvailable || !isColorAvailable || activeStock <= 0;
  const isLowStock = !isOutOfStock && activeStock <= (product?.lowStockThreshold || 5);

  const productId = product?._id || product?.id || "";
  const inWishlist = isInWishlist(productId);
  const inCart = isInCart(productId, selectedSize, selectedColor, activeVariant?._id);

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
    const buyNowPayload = {
      product,
      quantity,
      selectedSize,
      selectedColor,
      colorCode: colorObj?.hex,
      variantId: activeVariant?._id,
      sku: displaySku,
      price: displayPrice,
      image: activeGallery[selectedImageIndex] || activeGallery[0] || product.image,
      stock: activeStock,
    };
    try {
      sessionStorage.setItem("noir-buynow", JSON.stringify(buyNowPayload));
    } catch (e) {
      console.error("Failed to store buy now item in session", e);
    }
    router.push("/checkout?buyNow=true");
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
        <main className="min-h-screen bg-black pt-24 sm:pt-32 pb-20">
          <ProductDetailSkeleton />
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

      <main className="min-h-screen bg-[#f8f7f2] dark:bg-black text-neutral-900 dark:text-white pt-24 pb-16 sm:pt-32 transition-colors duration-300">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
          {/* Breadcrumb */}
          <motion.div
            className="mb-6 flex items-center gap-2 text-xs text-neutral-500 dark:text-white/40 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-neutral-500 dark:text-white/40">{product.category}</span>
            <span>/</span>
            <span className="text-neutral-800 dark:text-white/80 font-medium truncate max-w-xs">{product.name}</span>
          </motion.div>

          {/* Product Hero Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left: Interactive Media Gallery (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Main Image with Interactive Horizontal Swipe, Top Story Segments & Zoom */}
              <div className="relative w-full">
                <div
                  ref={mainImageRef}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative aspect-[3/4] max-h-[680px] w-full overflow-hidden rounded-2xl bg-[#0c0c0c] border border-white/[0.1] cursor-crosshair group select-none shadow-2xl"
                >
                  {/* Top Interactive Segment Indicators (Dashes) */}
                  {activeGallery.length > 1 && (
                    <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5 pointer-events-auto">
                      {activeGallery.map((_, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedImageIndex(sIdx)}
                          aria-label={`Go to photo ${sIdx + 1}`}
                          className="h-1.5 flex-1 rounded-full cursor-pointer py-1 -my-1 group/seg"
                        >
                          <div
                            className={`h-full w-full rounded-full transition-all duration-200 ${
                              sIdx === selectedImageIndex
                                ? "bg-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.9)] scale-y-125"
                                : "bg-white/35 group-hover/seg:bg-white/70 backdrop-blur-sm"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

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
                  <div className="absolute top-8 left-4 flex flex-col gap-2 pointer-events-none z-20">
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

                  {/* Photo Counter Badge */}
                  {activeGallery.length > 1 && (
                    <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
                      <span className="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center gap-1.5">
                        <span className="text-[#ff6b00] font-extrabold">Photo {selectedImageIndex + 1}</span>
                        <span className="text-white/40">/</span>
                        <span>{activeGallery.length}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Scrollable Thumbnails Strip with Box-Type Navigation Buttons */}
              {activeGallery.length > 1 && (
                <div className="relative flex items-center gap-2 mt-1">
                  {/* Left Box-Type Navigation Button */}
                  <button
                    type="button"
                    disabled={selectedImageIndex <= 0}
                    onClick={() => navigatePhoto("left")}
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all shrink-0 z-10 border ${
                      selectedImageIndex <= 0
                        ? "opacity-25 cursor-not-allowed pointer-events-none bg-neutral-100 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-white/5 scale-95 shadow-none"
                        : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white border-neutral-300 dark:border-white/20 shadow-md hover:bg-[#ff6b00] hover:text-black dark:hover:bg-[#ff6b00] dark:hover:text-black hover:border-[#ff6b00] active:scale-95 cursor-pointer"
                    }`}
                    aria-label="Previous Photo"
                    title={selectedImageIndex <= 0 ? "No previous photo" : "Previous Photo (मागील फोटो)"}
                  >
                    <ChevronLeft size={22} strokeWidth={2.2} />
                  </button>

                  {/* Scrollable Thumbnails Track */}
                  <div
                    ref={thumbnailScrollRef}
                    className="flex-1 flex gap-2.5 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar select-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {activeGallery.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        data-thumb-btn
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative shrink-0 h-20 w-16 sm:h-22 sm:w-20 rounded-xl overflow-hidden border-2 transition-all group cursor-pointer ${
                          selectedImageIndex === idx
                            ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/40 shadow-[0_0_15px_rgba(255,107,0,0.35)] scale-95"
                            : "border-neutral-300 dark:border-white/15 opacity-60 hover:opacity-100 hover:border-neutral-500 dark:hover:border-white/40"
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-white border border-white/10">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Right Box-Type Navigation Button */}
                  <button
                    type="button"
                    disabled={selectedImageIndex >= activeGallery.length - 1}
                    onClick={() => navigatePhoto("right")}
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all shrink-0 z-10 border ${
                      selectedImageIndex >= activeGallery.length - 1
                        ? "opacity-25 cursor-not-allowed pointer-events-none bg-neutral-100 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-white/5 scale-95 shadow-none"
                        : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white border-neutral-300 dark:border-white/20 shadow-md hover:bg-[#ff6b00] hover:text-black dark:hover:bg-[#ff6b00] dark:hover:text-black hover:border-[#ff6b00] active:scale-95 cursor-pointer"
                    }`}
                    aria-label="Next Photo"
                    title={selectedImageIndex >= activeGallery.length - 1 ? "No next photo" : "Next Photo (पुढील फोटो)"}
                  >
                    <ChevronRight size={22} strokeWidth={2.2} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Product Details & Variant Controls (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Brand & Category */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold tracking-[0.25em] text-[#ff6b00] uppercase">
                    {product.brand || "Maitri Men's Wear"} · {product.category}
                  </span>
                  {displaySku && (
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-white/30 tracking-wider">
                      SKU: {displaySku}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-neutral-900 dark:text-white mb-3 leading-snug">
                  {product.name}
                </h1>

                {/* Ratings & Reviews */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-[#ff6b00] text-[#ff6b00]" />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-white/50 font-medium">4.8 · 142 Verified Reviews</span>
                </div>

                {/* Dynamic Price Display */}
                <div className="mb-6 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c]/80 p-5 backdrop-blur-sm shadow-xs">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-white tracking-tight">
                      ₹{displayPrice.toLocaleString()}
                    </span>
                    {displayMrp && displayMrp > displayPrice && (
                      <>
                        <span className="text-lg text-neutral-400 dark:text-white/30 line-through">
                          ₹{displayMrp.toLocaleString()}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Save {displayDiscount}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500 dark:text-white/40">Inclusive of all taxes & duties</p>

                  {/* Stock Status Alert */}
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/[0.06] flex items-center gap-2">
                    {!isColorAvailable ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl">
                        <AlertCircle size={15} />
                        <span>This color ({selectedColor}) is currently Not Available (Out of Stock)</span>
                      </div>
                    ) : isOutOfStock ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400">
                        <AlertCircle size={14} /> Currently Out of Stock
                      </div>
                    ) : isLowStock ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
                        <Zap size={14} className="animate-bounce" /> Hurry, only {activeStock} left in stock!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check size={14} /> In Stock · Ready to Dispatch
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selector with Real Photo Thumbnails (Flipkart/Myntra Style matching Screenshot) */}
                {availableColors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-sm font-semibold text-neutral-800 dark:text-white flex items-center gap-1.5">
                        <span className="text-neutral-500 dark:text-white/70">Selected Color:</span>
                        <span className="text-neutral-950 dark:text-white font-bold">{selectedColor}</span>
                      </label>
                      <span className="text-xs text-[#ff8533] font-medium">
                        {availableColors.length} colors available
                      </span>
                    </div>

                    {/* Horizontal Scrollable Color Photo Cards Strip (Flipkart/Myntra style variant selector) */}
                    <div className="relative flex items-center gap-2 group/colorstrip">
                      {/* Navigate Left Button - disabled when at first variant */}
                      {availableColors.length > 1 && (
                        <button
                          type="button"
                          disabled={isLeftDisabled}
                          onClick={() => navigateVariant("left")}
                          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all shrink-0 z-20 ${
                            isLeftDisabled
                              ? "bg-neutral-100 dark:bg-neutral-900/60 text-neutral-300 dark:text-neutral-600 border border-neutral-200 dark:border-white/10 shadow-none cursor-not-allowed pointer-events-none scale-90"
                              : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 shadow-md hover:bg-[#ff6b00] hover:text-black dark:hover:bg-[#ff6b00] dark:hover:text-black hover:border-[#ff6b00] hover:scale-105 active:scale-90 cursor-pointer"
                          }`}
                          title={isLeftDisabled ? "No previous color" : "Previous Color Variant"}
                          aria-label="Previous Color Variant"
                        >
                          <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>
                      )}

                      {/* Horizontal Track of Color Photos */}
                      <div
                        ref={colorThumbTrackRef}
                        className="flex-1 flex items-center gap-3 overflow-x-auto scroll-smooth py-2 px-1 no-scrollbar select-none"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {availableColors.map((color) => {
                          const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();
                          const isColorAvail = color.isAvailable !== false;
                          const thumbUrl = getColorThumbnail(color);

                          return (
                            <button
                              key={color.name}
                              data-color-btn
                              type="button"
                              onClick={() => {
                                setSelectedColor(color.name);
                                setSelectedImageIndex(0);
                              }}
                              className={`group/cbtn relative shrink-0 rounded-2xl transition-all p-1 bg-neutral-100 dark:bg-[#161616] cursor-pointer ${
                                isSelected
                                  ? "border-2 border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/40 shadow-lg scale-[1.04]"
                                  : isColorAvail
                                  ? "border border-neutral-300 dark:border-white/20 hover:border-neutral-600 dark:hover:border-white/60 hover:scale-[1.02]"
                                  : "border border-red-500/40 opacity-50 hover:opacity-80"
                              }`}
                              style={{ width: "76px", height: "96px" }}
                              title={`${color.name} ${!isColorAvail ? "(Out of Stock)" : ""}`}
                            >
                              <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-200 dark:bg-black/60 flex items-center justify-center">
                                <img
                                  src={thumbUrl}
                                  alt={color.name}
                                  className="w-full h-full object-cover group-hover/cbtn:scale-108 transition-transform duration-300"
                                />

                                {/* Mini Color Dot swatch */}
                                <span
                                  className="absolute top-1.5 left-1.5 h-3.5 w-3.5 rounded-full border border-white/60 shadow-md"
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                />

                                {/* Out of Stock diagonal badge */}
                                {!isColorAvail && (
                                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] flex items-center justify-center p-1">
                                    <span className="text-[8px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded leading-tight text-center">
                                      OUT OF STOCK
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigate Right Button - disabled when at last variant */}
                      {availableColors.length > 1 && (
                        <button
                          type="button"
                          disabled={isRightDisabled}
                          onClick={() => navigateVariant("right")}
                          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all shrink-0 z-20 ${
                            isRightDisabled
                              ? "bg-neutral-100 dark:bg-neutral-900/60 text-neutral-300 dark:text-neutral-600 border border-neutral-200 dark:border-white/10 shadow-none cursor-not-allowed pointer-events-none scale-90"
                              : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 shadow-md hover:bg-[#ff6b00] hover:text-black dark:hover:bg-[#ff6b00] dark:hover:text-black hover:border-[#ff6b00] hover:scale-105 active:scale-90 cursor-pointer"
                          }`}
                          title={isRightDisabled ? "No next color" : "Next Color Variant"}
                          aria-label="Next Color Variant"
                        >
                          <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-white/60">
                        Select Size: <span className="text-neutral-900 dark:text-white font-semibold">{selectedSize}</span>
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
                            onClick={() => {
                              if (!isSizeOut) setSelectedSize(size);
                            }}
                            className={`relative flex flex-col items-center justify-center rounded-xl py-2 px-2 border transition-all text-xs font-medium select-none ${
                              isSizeOut
                                ? isSelected
                                  ? "border-2 border-red-500/80 bg-red-950/20 dark:bg-red-950/40 shadow-sm cursor-not-allowed"
                                  : "border border-dashed border-neutral-300 dark:border-white/15 bg-neutral-100/70 dark:bg-white/[0.02] cursor-not-allowed opacity-75"
                                : isSelected
                                ? "border-2 border-[#ff6b00] bg-[#ff6b00] text-black font-extrabold shadow-[0_0_15px_rgba(255,107,0,0.35)] scale-[1.04] cursor-pointer"
                                : "border-neutral-300 dark:border-white/15 bg-white dark:bg-white/[0.03] text-neutral-800 dark:text-white/80 hover:border-[#ff6b00] hover:text-[#ff6b00] hover:scale-105 shadow-xs cursor-pointer"
                            }`}
                            title={isSizeOut ? `${size} (Sold Out)` : `${size} (${stockForThisSize} in stock)`}
                          >
                            <span
                              className={`text-xs font-bold leading-tight ${
                                isSizeOut
                                  ? "text-neutral-400 dark:text-neutral-500 line-through decoration-red-500/70 decoration-1.5"
                                  : isSelected
                                  ? "text-black font-black text-sm"
                                  : "text-neutral-800 dark:text-white"
                              }`}
                            >
                              {size}
                            </span>
                            {isSizeOut ? (
                              <span className="text-[8.5px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded mt-1 no-underline shadow-xs">
                                Sold out
                              </span>
                            ) : isSelected ? (
                              <span className="text-[7.5px] font-black uppercase tracking-widest text-black/75 mt-0.5">
                                Selected
                              </span>
                            ) : stockForThisSize <= 3 && stockForThisSize > 0 ? (
                              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                {stockForThisSize} left
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & CTA Buttons */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/[0.02] p-1 shadow-xs">
                      <button
                        type="button"
                        disabled={isOutOfStock || quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-700 dark:text-white/60 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-neutral-900 dark:text-white">{quantity}</span>
                      <button
                        type="button"
                        disabled={isOutOfStock || quantity >= activeStock}
                        onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-700 dark:text-white/60 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (inCart) {
                          router.push("/cart");
                        } else {
                          handleAddToCart();
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                        isOutOfStock
                          ? "bg-neutral-200 dark:bg-white/5 text-neutral-400 dark:text-white/30 border border-neutral-300 dark:border-white/10 cursor-not-allowed"
                          : inCart
                          ? "bg-[#062e1e]/80 dark:bg-emerald-950/60 border border-emerald-500/60 text-emerald-400 dark:text-emerald-300 shadow-md hover:bg-emerald-900/60 hover:border-emerald-400"
                          : "btn-pill btn-pill-gold shadow-lg"
                      }`}
                      title={inCart ? "Item in bag. Click to view bag." : "Add to Cart"}
                    >
                      {isOutOfStock ? (
                        <>
                          <AlertCircle size={16} /> {!isColorAvailable ? "Color Out of Stock" : "Out of Stock"}
                        </>
                      ) : inCart ? (
                        <>
                          <Check size={16} className="text-emerald-400" /> ADDED TO BAG
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> ADD TO CART
                        </>
                      )}
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      className={`h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        inWishlist
                          ? "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]"
                          : "border-neutral-300 dark:border-white/10 bg-white dark:bg-transparent text-neutral-600 dark:text-white/50 hover:border-neutral-400 dark:hover:border-white/30 hover:text-neutral-950 dark:hover:text-white"
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
                <div className="grid grid-cols-3 gap-3 border-y border-neutral-200 dark:border-white/10 py-5">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <Truck size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-white/80 uppercase">Free Delivery</span>
                    <span className="text-[9px] text-neutral-500 dark:text-white/40">Orders over ₹999</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <Shield size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-white/80 uppercase">100% Genuine</span>
                    <span className="text-[9px] text-neutral-500 dark:text-white/40">Direct from Studio</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <RotateCcw size={18} className="text-[#ff6b00]" />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-white/80 uppercase">7 Days Return</span>
                    <span className="text-[9px] text-neutral-500 dark:text-white/40">Hassle-free exchange</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specifications Tabs */}
          <div className="mt-16 border-t border-neutral-200 dark:border-white/10 pt-10">
            <div className="flex gap-8 border-b border-neutral-200 dark:border-white/10 mb-8 overflow-x-auto">
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
                  className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                      : "text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-w-4xl text-sm leading-relaxed text-neutral-700 dark:text-white/60">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <p className="text-neutral-800 dark:text-white/80 whitespace-pre-line leading-relaxed">
                    {product.description ||
                      `Crafted with extraordinary precision, the ${product.name} embodies contemporary masculine elegance. Designed with supreme attention to silhouette, texture, and durability.`}
                  </p>
                  {product.shortDescription && (
                    <p className="text-xs text-[#ff6b00]/80 italic">{product.shortDescription}</p>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="pt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-500 dark:text-white/40">Tags:</span>
                      {product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-neutral-200/80 dark:bg-white/5 border border-neutral-300 dark:border-white/10 px-3 py-1 text-[10px] text-neutral-700 dark:text-white/60">
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
