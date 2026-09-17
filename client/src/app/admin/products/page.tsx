"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProductsQuery,
  useGetDeletedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useRestoreProductMutation,
  useToggleProductAvailabilityMutation,
} from "@/redux/api/product.api";
import { Product, ProductVariant, ProductColor, ProductImageItem } from "@/types";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Palette,
  Ruler,
  Sliders,
  DollarSign,
  Tag,
  Upload,
  ArrowRight,
  RefreshCw,
  Check,
  Zap,
  Link2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  MousePointer,
} from "lucide-react";
import Link from "next/link";
import { processAndOptimizeImageFile } from "@/utils/imageOptimizer";
import { StatCardsSkeleton, TableSkeleton } from "@/components/admin/AdminSkeletons";

type TabKey = "basic" | "media" | "colors" | "sizes" | "variants" | "attributes" | "preview";

export default function AdminProductsPage() {
  const { data: productList = [], isLoading, refetch } = useGetProductsQuery();
  const { data: deletedProducts = [], isLoading: isLoadingDeleted } = useGetDeletedProductsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [restoreProduct] = useRestoreProductMutation();
  const [toggleProductAvailability] = useToggleProductAvailabilityMutation();

  const [activeListTab, setActiveListTab] = useState<"all" | "available" | "unavailable" | "deleted">("all");
  const [search, setSearch] = useState("");
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [studioTab, setStudioTab] = useState<TabKey>("basic");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Studio Form State
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("Maitri Men's Wear");
  const [category, setCategory] = useState("Premium Shirts");
  const [subcategory, setSubcategory] = useState("Casual Shirts");
  const [productType, setProductType] = useState("Apparel");
  const [masterSku, setMasterSku] = useState("");
  const [tagsInput, setTagsInput] = useState("trending, premium, summer");
  const [gender, setGender] = useState("Men");
  const [status, setStatus] = useState("Active");
  const [badge, setBadge] = useState<string>("");

  // Pricing
  const [basePrice, setBasePrice] = useState("1499");
  const [baseOriginalPrice, setBaseOriginalPrice] = useState("2999");

  // Media
  const [primaryImage, setPrimaryImage] = useState("");
  const [hoverImage, setHoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<ProductImageItem[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isValidatingGalleryUrl, setIsValidatingGalleryUrl] = useState(false);
  const [isUploadingDevice, setIsUploadingDevice] = useState(false);
  const [galleryUrlError, setGalleryUrlError] = useState<string | null>(null);
  const [mediaActiveInputMode, setMediaActiveInputMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminScrubIndex, setAdminScrubIndex] = useState(0);
  const adminScrubBoxRef = useRef<HTMLDivElement>(null);

  // Colors & Color Specific Media
  const [colorOptions, setColorOptions] = useState<ProductColor[]>([
    { name: "Light Grey", hex: "#D3D3D3", images: [], skuCode: "LG", isAvailable: true },
    { name: "Navy Blue", hex: "#001F3F", images: [], skuCode: "NB", isAvailable: true },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<number, string>>({});
  const [colorUrlValidating, setColorUrlValidating] = useState<Record<number, boolean>>({});
  const [colorUrlErrors, setColorUrlErrors] = useState<Record<number, string | null>>({});
  const [colorInputModes, setColorInputModes] = useState<Record<number, "upload" | "url">>({});
  const colorFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [colorScrubIndices, setColorScrubIndices] = useState<Record<number, number>>({});
  const colorScrubBoxRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Preview color state & Color Tab Navigation
  const [previewActiveColor, setPreviewActiveColor] = useState<string>("");
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [colorViewMode, setColorViewMode] = useState<"tabs" | "list">("tabs");

  // Sizes
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL", "XXL"]);
  const [newSizeInput, setNewSizeInput] = useState("");

  // Variants Matrix
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Bulk Edit in Variants
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkMrp, setBulkMrp] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  // Attributes
  const [fabric, setFabric] = useState("100% Giza Cotton");
  const [fit, setFit] = useState("Regular Fit");
  const [pattern, setPattern] = useState("Striped");
  const [sleeve, setSleeve] = useState("Full Sleeve");
  const [collar, setCollar] = useState("Spread Collar");
  const [occasion, setOccasion] = useState("Casual / Work");
  const [washCare, setWashCare] = useState("Machine wash warm, tumble dry low");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");

  // Inventory
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  // Filtered List
  const currentProducts: Product[] = useMemo(() => {
    if (activeListTab === "deleted") return deletedProducts;
    if (activeListTab === "available") return productList.filter((p) => p.isAvailable !== false);
    if (activeListTab === "unavailable") return productList.filter((p) => p.isAvailable === false);
    return productList;
  }, [activeListTab, productList, deletedProducts]);

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
    );
  }, [currentProducts, search]);

  // Aggregate variant stock
  const totalCalculatedStock = useMemo(() => {
    if (variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [variants]);

  // Utility to test if image loads
  const verifyImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url || typeof url !== "string") {
        resolve(false);
        return;
      }
      if (url.startsWith("data:image/")) {
        resolve(true);
        return;
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          resolve(false);
          return;
        }
      } catch {
        resolve(false);
        return;
      }
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // Open Create Studio
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setStudioTab("basic");
    setFeedback(null);
    setGalleryUrlError(null);
    setMediaActiveInputMode("upload");

    setName("");
    setShortDescription("");
    setDescription("");
    setBrand("Maitri Men's Wear");
    setCategory("Premium Shirts");
    setSubcategory("Casual Shirts");
    setProductType("Apparel");
    setMasterSku(`NS-${Date.now().toString().slice(-4)}`);
    setTagsInput("trending, summer, luxury");
    setGender("Men");
    setStatus("Active");
    setBadge("NEW");
    setBasePrice("1299");
    setBaseOriginalPrice("2499");
    setPrimaryImage("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop");
    setHoverImage("https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop");

    setGalleryImages([
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop",
        type: "url",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop",
        type: "url",
        isPrimary: false,
        sortOrder: 1,
      },
    ]);

    setColorOptions([
      { name: "Light Grey", hex: "#D3D3D3", images: [], skuCode: "LG", isAvailable: true },
      { name: "Navy Blue", hex: "#001F3F", images: [], skuCode: "NB", isAvailable: true },
    ]);
    setSizes(["S", "M", "L", "XL", "XXL"]);
    setFabric("100% Giza Cotton");
    setFit("Regular Fit");
    setPattern("Striped");
    setSleeve("Full Sleeve");
    setCollar("Spread Collar");
    setOccasion("Casual");
    setWashCare("Machine wash cold");
    setCountryOfOrigin("India");
    setLowStockThreshold("5");

    // Auto generate initial variant matrix
    const initialColors = [
      { name: "Light Grey", hex: "#D3D3D3", skuCode: "LG" },
      { name: "Navy Blue", hex: "#001F3F", skuCode: "NB" },
    ];
    const initialSizes = ["S", "M", "L", "XL", "XXL"];
    const generated: ProductVariant[] = [];
    initialColors.forEach((col) => {
      initialSizes.forEach((sz) => {
        generated.push({
          color: col.name,
          colorCode: col.hex,
          size: sz,
          sku: `NS-${col.skuCode || col.name.slice(0, 2).toUpperCase()}-${sz}`,
          mrp: 2499,
          sellingPrice: 1299,
          discount: 48,
          stock: 20,
          isActive: true,
        });
      });
    });
    setVariants(generated);
    setPreviewActiveColor("Light Grey");

    setShowStudioModal(true);
  };

  // Open Edit Studio
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setStudioTab("basic");
    setFeedback(null);
    setGalleryUrlError(null);
    setMediaActiveInputMode("upload");

    setName(p.name || "");
    setShortDescription(p.shortDescription || "");
    setDescription(p.description || "");
    setBrand(p.brand || "Maitri Men's Wear");
    setCategory(p.category || "Premium Shirts");
    setSubcategory(p.subcategory || "");
    setProductType(p.productType || "Apparel");
    setMasterSku(p.sku || `NS-${Date.now().toString().slice(-4)}`);
    setTagsInput(p.tags ? p.tags.join(", ") : "");
    setGender(p.gender || "Men");
    setStatus(p.status || "Active");
    setBadge(p.badge || "");
    setBasePrice(String(p.price || 1299));
    setBaseOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setPrimaryImage(p.image || "");
    setHoverImage(p.hoverImage || "");

    // Parse existing images into ProductImageItem[]
    const rawImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    const parsedImages: ProductImageItem[] = rawImages.map((img: any, idx: number) => {
      if (typeof img === "string") {
        const isPri = img === p.image || idx === 0;
        return {
          url: img,
          type: img.startsWith("data:") ? "upload" : "url",
          isPrimary: isPri,
          sortOrder: idx,
        };
      } else if (img && typeof img === "object") {
        return {
          url: img.url,
          type: img.type || (img.url?.startsWith("data:") ? "upload" : "url"),
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : (img.url === p.image || idx === 0),
          sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
        };
      }
      return { url: "", type: "url", isPrimary: false, sortOrder: idx };
    }).filter((img) => img.url);

    if (!parsedImages.some((img) => img.isPrimary) && parsedImages.length > 0) {
      parsedImages[0].isPrimary = true;
    }
    setGalleryImages(parsedImages);
    setPrimaryImage(parsedImages.find((img) => img.isPrimary)?.url || p.image || "");

    // Populate colors
    if (p.colorOptions && p.colorOptions.length > 0) {
      const parsedColors = p.colorOptions.map((c) => ({
        name: c.name,
        hex: c.hex,
        skuCode: c.skuCode || c.name.slice(0, 3).toUpperCase(),
        images: (c.images || []).map((img) => (typeof img === "string" ? img : img.url)),
        isAvailable: c.isAvailable !== false,
      }));

      // If variants has colors not in colorOptions, include them
      const existingNames = new Set(parsedColors.map((c) => c.name.toLowerCase()));
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          if (v.color && !existingNames.has(v.color.toLowerCase())) {
            existingNames.add(v.color.toLowerCase());
            parsedColors.push({
              name: v.color,
              hex: v.colorCode || "#1A1A1A",
              skuCode: v.sku?.split("-")[2] || v.color.slice(0, 3).toUpperCase(),
              images: (v.images || []).map((img) => (typeof img === "string" ? img : (img as any).url || "")).filter(Boolean),
              isAvailable: v.isActive !== false,
            });
          }
        });
      }

      setColorOptions(parsedColors);
      setPreviewActiveColor(parsedColors[0].name);
    } else if (p.colors && p.colors.length > 0) {
      setColorOptions(
        p.colors.map((c) => ({
          name: c.startsWith("#") ? "Color" : c,
          hex: c.startsWith("#") ? c : "#1A1A1A",
          images: [],
          skuCode: c.slice(0, 2).toUpperCase(),
        }))
      );
      setPreviewActiveColor(p.colors[0]);
    } else {
      setColorOptions([{ name: "Black", hex: "#000000", images: [], skuCode: "BLK" }]);
      setPreviewActiveColor("Black");
    }

    // Populate sizes
    if (p.sizes && p.sizes.length > 0) {
      setSizes(p.sizes);
    } else {
      setSizes(["S", "M", "L", "XL"]);
    }

    // Populate variants
    if (p.variants && p.variants.length > 0) {
      setVariants(p.variants);
    } else {
      const colList = p.colors && p.colors.length > 0 ? p.colors : ["Standard"];
      const sizeList = p.sizes && p.sizes.length > 0 ? p.sizes : ["Free Size"];
      const gen: ProductVariant[] = [];
      colList.forEach((col) => {
        sizeList.forEach((sz) => {
          gen.push({
            color: col,
            colorCode: col.startsWith("#") ? col : "#1A1A1A",
            size: sz,
            sku: `${p.sku || "PROD"}-${col.slice(0, 2).toUpperCase()}-${sz}`,
            mrp: p.originalPrice || p.price,
            sellingPrice: p.price,
            discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
            stock: Math.floor((p.stock || 50) / (colList.length * sizeList.length)) || 10,
            isActive: true,
          });
        });
      });
      setVariants(gen);
    }

    // Populate attributes
    if (p.attributes) {
      setFabric(p.attributes.fabric || "100% Giza Cotton");
      setFit(p.attributes.fit || "Regular Fit");
      setPattern(p.attributes.pattern || "Solid");
      setSleeve(p.attributes.sleeve || "Full Sleeve");
      setCollar(p.attributes.collar || "Spread Collar");
      setOccasion(p.attributes.occasion || "Casual");
      setWashCare(p.attributes.washCare || "Machine wash");
      setCountryOfOrigin(p.attributes.countryOfOrigin || "India");
    }

    setLowStockThreshold(String(p.lowStockThreshold || 5));
    setShowStudioModal(true);
  };

  // Device File Upload Handler for Main Gallery (Async Canvas Optimizer with Guaranteed Completion)
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingDevice(true);
    setGalleryUrlError(null);

    const fileList = Array.from(files);
    const newItems: ProductImageItem[] = [];
    const failedNames: string[] = [];

    try {
      for (const file of fileList) {
        try {
          const optimized = await processAndOptimizeImageFile(file);
          newItems.push({
            url: optimized,
            type: "upload",
            isPrimary: galleryImages.length === 0 && newItems.length === 0,
            sortOrder: galleryImages.length + newItems.length,
          });
        } catch (err: any) {
          failedNames.push(file.name);
        }
      }

      if (newItems.length > 0) {
        setGalleryImages((prev) => {
          const combined = [...prev, ...newItems];
          if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
            combined[0].isPrimary = true;
          }
          const pri = combined.find((img) => img.isPrimary)?.url || combined[0]?.url || "";
          setPrimaryImage(pri);
          return combined;
        });

        if (failedNames.length > 0) {
          setFeedback({
            type: "error",
            message: `Loaded ${newItems.length} image(s), but ${failedNames.length} image(s) could not be read.`,
          });
        } else {
          setFeedback({
            type: "success",
            message: `Successfully loaded & optimized ${newItems.length} photo(s)!`,
          });
        }
      } else {
        setGalleryUrlError(
          "Could not read the selected image(s). Please choose valid JPG, JPEG, PNG, or WEBP photos."
        );
      }
    } catch (globalErr) {
      setGalleryUrlError("An unexpected error occurred while reading the images. Please try again.");
    } finally {
      setIsUploadingDevice(false);
      e.target.value = "";
    }
  };

  // Admin Cursor Scrub Mouse Handler for Preview
  const handleAdminScrubMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!adminScrubBoxRef.current || galleryImages.length <= 1) return;
    const rect = adminScrubBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (width <= 0) return;
    const segment = Math.min(
      Math.max(0, Math.floor((x / width) * galleryImages.length)),
      galleryImages.length - 1
    );
    if (segment !== adminScrubIndex) {
      setAdminScrubIndex(segment);
    }
  };

  // Add Image URL for Main Gallery (Supports single URL or multiple URLs separated by commas/newlines)
  const handleAddGalleryUrl = async () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) {
      setGalleryUrlError("Please enter an image URL.");
      return;
    }

    const candidateUrls = trimmed
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (candidateUrls.length === 0) {
      setGalleryUrlError("Please enter a valid image URL.");
      return;
    }

    setGalleryUrlError(null);
    setIsValidatingGalleryUrl(true);

    const validUrls: string[] = [];
    const invalidUrls: string[] = [];

    for (const u of candidateUrls) {
      const isValid = await verifyImageLoad(u);
      if (isValid) {
        validUrls.push(u);
      } else {
        invalidUrls.push(u);
      }
    }

    setIsValidatingGalleryUrl(false);

    if (validUrls.length === 0) {
      setGalleryUrlError("Unable to load image(s) from provided URL(s). Please verify links are accessible image files.");
      return;
    }

    setGalleryImages((prev) => {
      const isFirstInitially = prev.length === 0;
      const newItems: ProductImageItem[] = validUrls.map((url, i) => ({
        url,
        type: "url",
        isPrimary: isFirstInitially && i === 0,
        sortOrder: prev.length + i,
      }));
      const updated = [...prev, ...newItems];
      if (isFirstInitially && validUrls.length > 0) {
        setPrimaryImage(validUrls[0]);
      }
      return updated;
    });

    setNewGalleryUrl("");
    if (invalidUrls.length > 0) {
      setFeedback({
        type: "error",
        message: `Added ${validUrls.length} image(s), but ${invalidUrls.length} URL(s) could not be loaded.`,
      });
    } else {
      setFeedback({
        type: "success",
        message: `${validUrls.length} image URL(s) verified and added to cursor gallery!`,
      });
    }
  };

  // Set Primary Image in Main Gallery
  const handleSetPrimary = (index: number) => {
    setGalleryImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const target = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      const reordered = [
        { ...target, isPrimary: true, sortOrder: 0 },
        ...rest.map((img, i) => ({ ...img, isPrimary: false, sortOrder: i + 1 })),
      ];
      setPrimaryImage(target.url);

      // Also synchronize primary photo into the first color option unconditionally
      setColorOptions((prevColors) => {
        if (prevColors.length === 0) return prevColors;
        return prevColors.map((c, cIdx) => {
          if (cIdx === 0) {
            const raw = Array.isArray(c.images) ? c.images.map((img) => (typeof img === "string" ? img : img.url)) : [];
            return {
              ...c,
              images: [target.url, ...raw.filter((u) => u !== target.url)],
            };
          }
          return c;
        });
      });

      // Also synchronize variants of the first color
      setVariants((prevVars) => {
        if (prevVars.length === 0) return prevVars;
        return prevVars.map((v) => {
          const firstColName = colorOptions[0]?.name;
          if (firstColName && v.color.toLowerCase() === firstColName.toLowerCase()) {
            const raw = Array.isArray(v.images) ? v.images.map((img) => (typeof img === "string" ? img : img.url)) : [];
            return {
              ...v,
              images: [target.url, ...raw.filter((u) => u !== target.url)],
            };
          }
          return v;
        });
      });

      return reordered;
    });
    setFeedback({ type: "success", message: `Image marked as Primary Image and moved to #1.` });
  };

  // Remove Image from Main Gallery
  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
        setPrimaryImage(updated[0].url);
      } else if (updated.length === 0) {
        setPrimaryImage("");
      } else {
        const pri = updated.find((img) => img.isPrimary)?.url || updated[0]?.url || "";
        setPrimaryImage(pri);
      }
      return updated;
    });
  };

  // Reorder Main Gallery Image
  const handleMoveGalleryImage = (index: number, direction: "left" | "right") => {
    setGalleryImages((prev) => {
      const targetIdx = direction === "left" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  // Color-Specific Image Handlers
  const handleColorDeviceUpload = async (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newImgs: string[] = [];

    try {
      for (const file of fileList) {
        try {
          const optimized = await processAndOptimizeImageFile(file);
          newImgs.push(optimized);
        } catch {
          // Ignore invalid image
        }
      }

      if (newImgs.length > 0) {
        setColorOptions((prev) =>
          prev.map((c, idx) => {
            if (idx !== colorIndex) return c;
            const existing = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
            return {
              ...c,
              images: [...existing, ...newImgs],
            };
          })
        );
        setFeedback({
          type: "success",
          message: `Added ${newImgs.length} image(s) for color ${colorOptions[colorIndex]?.name}.`,
        });
      }
    } finally {
      e.target.value = "";
    }
  };

  // Cursor Scrub Mouse Handler for Color-Specific Gallery Preview
  const handleColorScrubMouseMove = (colorIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    const box = colorScrubBoxRefs.current[colorIndex];
    const colImgs = colorOptions[colorIndex]?.images || [];
    if (!box || colImgs.length <= 1) return;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (width <= 0) return;
    const segment = Math.min(
      Math.max(0, Math.floor((x / width) * colImgs.length)),
      colImgs.length - 1
    );
    if (segment !== (colorScrubIndices[colorIndex] || 0)) {
      setColorScrubIndices((prev) => ({ ...prev, [colorIndex]: segment }));
    }
  };

  // Toggle Color Availability (Available / Out of Stock) without deleting photos or color
  const handleToggleColorAvailability = (colorIndex: number) => {
    setColorOptions((prev) => {
      const updated = [...prev];
      const targetColor = updated[colorIndex];
      if (!targetColor) return prev;
      const nextAvailable = !(targetColor.isAvailable !== false);
      updated[colorIndex] = {
        ...targetColor,
        isAvailable: nextAvailable,
      };

      // Also automatically synchronize variants of this color
      setVariants((prevVariants) =>
        prevVariants.map((v) => {
          if (v.color.toLowerCase() === targetColor.name.toLowerCase()) {
            return {
              ...v,
              isActive: nextAvailable,
            };
          }
          return v;
        })
      );

      setFeedback({
        type: nextAvailable ? "success" : "error",
        message: `Color "${targetColor.name}" marked as ${nextAvailable ? "Available (In Stock)" : "Not Available (Out of Stock)"
          }. Photos & settings are fully preserved!`,
      });

      return updated;
    });
  };

  // Set Primary Angle Photo for this color
  const handleColorSetPrimary = (colorIndex: number, imgIndex: number) => {
    setColorOptions((prev) =>
      prev.map((c, idx) => {
        if (idx !== colorIndex) return c;
        const existing = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
        if (imgIndex <= 0 || imgIndex >= existing.length) return c;
        const selected = existing[imgIndex];
        const rest = existing.filter((_, i) => i !== imgIndex);
        return {
          ...c,
          images: [selected, ...rest],
        };
      })
    );
    setColorScrubIndices((prev) => ({ ...prev, [colorIndex]: 0 }));
    setFeedback({
      type: "success",
      message: `Photo #${imgIndex + 1} set as primary angle photo for "${colorOptions[colorIndex]?.name}".`,
    });
  };

  // Add Image URL for Color (Supports single URL or multiple URLs separated by commas/newlines)
  const handleColorAddUrl = async (colorIndex: number) => {
    const inputUrl = colorUrlInputs[colorIndex]?.trim();
    if (!inputUrl) {
      setColorUrlErrors((prev) => ({ ...prev, [colorIndex]: "Please enter an image URL." }));
      return;
    }

    const candidateUrls = inputUrl
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (candidateUrls.length === 0) {
      setColorUrlErrors((prev) => ({ ...prev, [colorIndex]: "Please enter a valid image URL." }));
      return;
    }

    setColorUrlErrors((prev) => ({ ...prev, [colorIndex]: null }));
    setColorUrlValidating((prev) => ({ ...prev, [colorIndex]: true }));

    const validUrls: string[] = [];
    const invalidUrls: string[] = [];

    for (const u of candidateUrls) {
      const isValid = await verifyImageLoad(u);
      if (isValid) {
        validUrls.push(u);
      } else {
        invalidUrls.push(u);
      }
    }

    setColorUrlValidating((prev) => ({ ...prev, [colorIndex]: false }));

    if (validUrls.length === 0) {
      setColorUrlErrors((prev) => ({
        ...prev,
        [colorIndex]: "Unable to load image(s) from URL. Please ensure links are accessible.",
      }));
      return;
    }

    setColorOptions((prev) =>
      prev.map((c, idx) => {
        if (idx !== colorIndex) return c;
        const existing = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
        return {
          ...c,
          images: [...existing, ...validUrls],
        };
      })
    );
    setColorUrlInputs((prev) => ({ ...prev, [colorIndex]: "" }));
    setFeedback({
      type: "success",
      message: `${validUrls.length} image URL(s) added to color "${colorOptions[colorIndex]?.name}".`,
    });
  };

  const handleColorRemoveImage = (colorIndex: number, imgIndex: number) => {
    setColorOptions((prev) =>
      prev.map((c, idx) => {
        if (idx !== colorIndex) return c;
        const existing = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
        return {
          ...c,
          images: existing.filter((_, i) => i !== imgIndex),
        };
      })
    );
  };

  const handleColorMoveImage = (colorIndex: number, imgIndex: number, direction: "left" | "right") => {
    setColorOptions((prev) =>
      prev.map((c, idx) => {
        if (idx !== colorIndex) return c;
        const existing = [...((c.images || []).map((img) => (typeof img === "string" ? img : img.url)))];
        const targetIdx = direction === "left" ? imgIndex - 1 : imgIndex + 1;
        if (targetIdx < 0 || targetIdx >= existing.length) return c;
        const temp = existing[imgIndex];
        existing[imgIndex] = existing[targetIdx];
        existing[targetIdx] = temp;
        return {
          ...c,
          images: existing,
        };
      })
    );
  };

  // Reorder colors (Move Left/Earlier, Move Right/Later)
  const handleMoveColor = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= colorOptions.length) return;
    setColorOptions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setActiveColorIndex(target);
    setFeedback({
      type: "success",
      message: `Color order updated! "${colorOptions[index]?.name}" moved ${direction === "left" ? "earlier (आधी)" : "later (मागे)"}.`,
    });
  };


  // Automated Variant Matrix Generation
  const handleGenerateVariants = () => {
    if (colorOptions.length === 0) {
      setFeedback({ type: "error", message: "Please add at least one color before generating variants." });
      return;
    }
    if (sizes.length === 0) {
      setFeedback({ type: "error", message: "Please select at least one size before generating variants." });
      return;
    }

    const priceNum = Number(basePrice) || 999;
    const mrpNum = Number(baseOriginalPrice) || priceNum;
    const discountCalc = mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
    const prefix = masterSku ? masterSku.trim() : "NS";

    const generated: ProductVariant[] = [];
    colorOptions.forEach((col) => {
      const colCode = col.skuCode || col.name.trim().slice(0, 3).toUpperCase();
      const colImgs = (col.images || []).map((img) => (typeof img === "string" ? img : img.url));

      sizes.forEach((sz) => {
        const existing = variants.find(
          (v) => v.color.toLowerCase() === col.name.toLowerCase() && v.size.toLowerCase() === sz.toLowerCase()
        );

        if (existing) {
          generated.push({
            ...existing,
            images: (existing.images && existing.images.length > 0) ? existing.images : colImgs,
          });
        } else {
          generated.push({
            color: col.name,
            colorCode: col.hex,
            size: sz,
            sku: `${prefix}-${colCode}-${sz}`,
            mrp: mrpNum,
            sellingPrice: priceNum,
            discount: discountCalc,
            stock: 20,
            images: colImgs,
            isActive: true,
          });
        }
      });
    });

    setVariants(generated);
    setFeedback({ type: "success", message: `Generated ${generated.length} variant combinations with color images!` });
  };

  // Bulk update variants
  const handleApplyBulk = () => {
    let updated = [...variants];
    if (bulkPrice) {
      const p = Number(bulkPrice);
      updated = updated.map((v) => {
        const mrp = v.mrp || p;
        const disc = mrp > p ? Math.round(((mrp - p) / mrp) * 100) : 0;
        return { ...v, sellingPrice: p, discount: disc };
      });
    }
    if (bulkMrp) {
      const m = Number(bulkMrp);
      updated = updated.map((v) => {
        const sp = v.sellingPrice || m;
        const disc = m > sp ? Math.round(((m - sp) / m) * 100) : 0;
        return { ...v, mrp: m, discount: disc };
      });
    }
    if (bulkStock) {
      const s = Number(bulkStock);
      updated = updated.map((v) => ({ ...v, stock: s }));
    }
    setVariants(updated);
    setFeedback({ type: "success", message: "Bulk settings applied to all variants!" });
  };

  // Add Color
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const exists = colorOptions.some((c) => c.name.toLowerCase() === newColorName.trim().toLowerCase());
    if (exists) {
      setFeedback({ type: "error", message: `Color "${newColorName}" already exists.` });
      return;
    }
    const newColor: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      skuCode: newColorName.trim().slice(0, 3).toUpperCase(),
      images: [],
      isAvailable: true,
    };
    setColorOptions((prev) => [...prev, newColor]);
    if (!previewActiveColor) setPreviewActiveColor(newColor.name);
    setNewColorName("");
    setFeedback({ type: "success", message: `Color "${newColor.name}" added.` });
  };

  // Quick preset sizes
  const handleApplySizePreset = (preset: "clothing" | "shoes" | "waist" | "freesize") => {
    if (preset === "clothing") setSizes(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
    if (preset === "shoes") setSizes(["6", "7", "8", "9", "10", "11", "12"]);
    if (preset === "waist") setSizes(["28", "30", "32", "34", "36", "38"]);
    if (preset === "freesize") setSizes(["Free Size"]);
  };

  // Save Product (Submit)
  const handleSaveProduct = async (overrideStatus?: string) => {
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: "error", message: "Product Name is required." });
      setStudioTab("basic");
      return;
    }
    if (!category.trim()) {
      setFeedback({ type: "error", message: "Category is required." });
      setStudioTab("basic");
      return;
    }

    const resolvedPrimary = galleryImages.find((img) => img.isPrimary)?.url || galleryImages[0]?.url || primaryImage;
    if (!resolvedPrimary) {
      setFeedback({ type: "error", message: "At least one product image is required in Section 2 (Media)." });
      setStudioTab("media");
      return;
    }

    try {
      const priceNum = Number(basePrice);
      const mrpNum = baseOriginalPrice ? Number(baseOriginalPrice) : undefined;
      const tagsArray = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

      // Clean and normalize colorOptions
      const normalizedColorOptions = colorOptions.map((c) => {
        const cImgs = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
        return {
          name: c.name.trim(),
          hex: c.hex,
          skuCode: c.skuCode,
          images: cImgs,
          isAvailable: c.isAvailable !== false,
        };
      });

      // Ensure galleryImages has resolvedPrimary strictly at position 0
      const orderedGallery = [...galleryImages];
      const priIdx = orderedGallery.findIndex((img) => img.url === resolvedPrimary || img.isPrimary);
      if (priIdx > 0) {
        const [pri] = orderedGallery.splice(priIdx, 1);
        orderedGallery.unshift({ ...pri, isPrimary: true, sortOrder: 0 });
      }
      orderedGallery.forEach((img, i) => {
        img.isPrimary = i === 0;
        img.sortOrder = i;
      });

      // Clean and normalize variants
      const normalizedVariants = variants.map((v) => {
        const matchingColor = normalizedColorOptions.find(
          (c) => c.name.toLowerCase() === v.color.toLowerCase()
        );
        const vImgs = (v.images && v.images.length > 0) ? v.images : (matchingColor?.images || []);
        return {
          ...v,
          images: vImgs,
        };
      });

      const payload: Partial<Product> = {
        name: name.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        brand: brand.trim() || "Maitri Men's Wear",
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        productType: productType.trim() || "Apparel",
        sku: masterSku.trim() || undefined,
        tags: tagsArray,
        gender,
        status: overrideStatus || status,
        badge: badge || null,

        price: priceNum,
        originalPrice: mrpNum,

        image: resolvedPrimary,
        hoverImage: hoverImage || (orderedGallery[1]?.url || undefined),
        images: orderedGallery,

        colorOptions: normalizedColorOptions,
        colors: normalizedColorOptions.map((c) => c.name),
        sizes,

        variants: normalizedVariants,

        attributes: {
          fabric: fabric.trim(),
          fit: fit.trim(),
          pattern: pattern.trim(),
          sleeve: sleeve.trim(),
          collar: collar.trim(),
          occasion: occasion.trim(),
          washCare: washCare.trim(),
          countryOfOrigin: countryOfOrigin.trim(),
        },

        lowStockThreshold: Number(lowStockThreshold) || 5,
        stock: totalCalculatedStock > 0 ? totalCalculatedStock : 50,
        isAvailable: status !== "Inactive" && status !== "Draft",
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct._id || editingProduct.id || "", data: payload }).unwrap();
        setFeedback({ type: "success", message: "Product updated successfully!" });
      } else {
        await createProduct(payload).unwrap();
        setFeedback({ type: "success", message: "Product created and published successfully!" });
      }

      setTimeout(() => {
        setShowStudioModal(false);
        refetch();
      }, 1000);
    } catch (err: any) {
      console.error("Save product error:", err);
      setFeedback({
        type: "error",
        message: err?.data?.message || err?.message || "Failed to save product. Please check required fields.",
      });
    }
  };

  const handleToggleAvailability = async (p: Product) => {
    const pId = p._id || p.id || "";
    const nextStatus = p.isAvailable === false ? true : false;
    setTogglingId(pId);
    try {
      await toggleProductAvailability({ id: pId, isAvailable: nextStatus }).unwrap();
    } catch (err: any) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to move this product to deleted archive?")) return;
    try {
      await deleteProduct(id).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete product.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to restore product.");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen text-neutral-900 dark:text-white">
      {/* Top Header & Metrics */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00]">
              <Package size={22} />
            </span>
            <span>Product Management Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-white/40 mt-1.5">
            Create and manage professional products, media galleries, colors, and variant matrices
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(255,107,0,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenCreate}
          className="btn-pill btn-pill-gold inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(255,107,0,0.3)] transition-all text-xs font-bold shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} /> Create New Product
        </motion.button>
      </motion.div>

      {/* Metrics Row */}
      {isLoading ? (
        <StatCardsSkeleton count={5} />
      ) : (() => {
        const totalStockUnits = productList.reduce((acc, p) => acc + (p.stock || 0), 0);
        const totalCatalogValue = productList.reduce((acc, p) => {
          const count = p.stock !== undefined && p.stock > 0 ? p.stock : 1;
          return acc + (p.price || 0) * count;
        }, 0);
        const activeCount = productList.filter((p) => p.isAvailable !== false).length;
        const outOfStockCount = productList.filter((p) => p.isAvailable === false || (p.stock || 0) <= 0).length;

        const metrics = [
          {
            id: "products",
            label: "Total Products",
            value: productList.length.toLocaleString(),
            fullValue: `${productList.length} Products`,
            detail: `${totalStockUnits.toLocaleString()} units in stock`,
            icon: Package,
            textColor: "text-neutral-900 dark:text-white",
            iconColor: "text-blue-400",
            iconBg: "bg-blue-500/10 border-blue-500/20",
            topGlow: "from-blue-500/50 via-indigo-500/20 to-transparent",
            pillText: "Catalog",
            pillStyle: "bg-neutral-100 text-neutral-600 border-black/10 dark:bg-white/5 dark:text-white/60 dark:border-white/10",
          },
          {
            id: "catalog-value",
            label: "Total Catalog Value",
            value: `₹${totalCatalogValue.toLocaleString()}`,
            fullValue: `₹${totalCatalogValue.toLocaleString()}`,
            detail: "Total store inventory value",
            icon: Tag,
            textColor: "text-[#ff6b00]",
            iconColor: "text-[#ff6b00]",
            iconBg: "bg-[#ff6b00]/10 border-[#ff6b00]/30",
            topGlow: "from-[#ff6b00]/60 via-[#ff8533]/30 to-transparent",
            pillText: "Gross Value",
            pillStyle: "bg-[#ff6b00]/10 text-[#ff8533] border-[#ff6b00]/30",
          },
          {
            id: "active",
            label: "Active & Available",
            value: activeCount.toLocaleString(),
            fullValue: `${activeCount} Live Products`,
            detail: "Live and purchasable",
            icon: CheckCircle2,
            textColor: "text-emerald-400",
            iconColor: "text-emerald-400",
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            topGlow: "from-emerald-500/50 via-teal-400/20 to-transparent",
            pillText: "Live Online",
            pillStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          },
          {
            id: "out-of-stock",
            label: "Disabled / Low Stock",
            value: outOfStockCount.toLocaleString(),
            fullValue: `${outOfStockCount} Disabled / Out of Stock`,
            detail: outOfStockCount > 0 ? "Requires restock" : "Inventory healthy",
            icon: AlertCircle,
            textColor: "text-amber-400",
            iconColor: "text-amber-400",
            iconBg: "bg-amber-500/10 border-amber-500/20",
            topGlow: "from-amber-500/50 via-yellow-400/20 to-transparent",
            pillText: outOfStockCount > 0 ? "Attention" : "Healthy",
            pillStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          },
          {
            id: "archive",
            label: "Deleted Archive",
            value: deletedProducts.length.toLocaleString(),
            fullValue: `${deletedProducts.length} Archived Items`,
            detail: "Recoverable items",
            icon: RotateCcw,
            textColor: "text-rose-400",
            iconColor: "text-rose-400",
            iconBg: "bg-rose-500/10 border-rose-500/20",
            topGlow: "from-rose-500/50 via-red-400/20 to-transparent",
            pillText: "Archive",
            pillStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          },
        ];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
            {metrics.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.07,
                  ease: [0.21, 1.02, 0.49, 0.99],
                }}
                whileHover={{
                  y: -4,
                  scale: 1.015,
                  transition: { duration: 0.2 },
                }}
                className={`group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#0a0a0a] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between ${
                  idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Luminous Top Glow Line */}
                <div
                  className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${m.topGlow} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Header: Label + Themed Icon Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50 leading-tight">
                    {m.label}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${m.iconBg} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <m.icon size={15} className={m.iconColor} />
                  </div>
                </div>

                {/* Numerical Value + Detail Row */}
                <div className="mt-3 min-w-0">
                  <p
                    title={m.fullValue}
                    className={`text-xl sm:text-2xl 2xl:text-3xl font-black tracking-tight leading-none truncate ${m.textColor}`}
                  >
                    {m.value}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/[0.04]">
                    <span className="text-[10px] text-neutral-500 dark:text-white/40 truncate font-medium">
                      {m.detail}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 border ${m.pillStyle}`}
                    >
                      {m.pillText}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      })()}

      {/* Controls & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { key: "all", label: "All Products", count: productList.length },
              { key: "available", label: "In Stock & Live", count: productList.filter((p) => p.isAvailable !== false).length },
              { key: "unavailable", label: "Disabled / Hidden", count: productList.filter((p) => p.isAvailable === false || (p.stock || 0) <= 0).length },
              { key: "deleted", label: "Archive", count: deletedProducts.length },
            ] as const
          ).map((tab) => {
            const isActive = activeListTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveListTab(tab.key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-[#ff6b00] text-black font-bold shadow-[0_4px_16px_rgba(255,107,0,0.35)]"
                    : "bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.08] shadow-xs"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive
                      ? "bg-black/20 text-black"
                      : "bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white/60"
                  }`}
                >
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/30 outline-none transition-all shadow-inner"
          />
        </div>
      </motion.div>

      {/* Product List Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] p-12 text-center shadow-sm"
        >
          <Package size={40} className="mx-auto mb-3 text-neutral-300 dark:text-white/20" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">No products found</h3>
          <p className="text-xs text-neutral-500 dark:text-white/40 mt-1">Try adjusting your search or tab filter.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] overflow-hidden shadow-sm dark:shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.02] text-[10px] uppercase font-bold text-neutral-500 dark:text-white/40 tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / MRP</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Total Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProducts.map((p) => {
                  const pId = p._id || p.id || "";
                  const isAvailable = p.isAvailable !== false;
                  const variantCount = p.variants?.length || 0;
                  const colorCount = p.colorOptions?.length || p.colors?.length || 0;

                  return (
                    <tr key={pId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop"}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop";
                            }}
                            className="h-12 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs">{p.name}</p>
                            <p className="text-[10px] font-mono text-white/30">
                              SKU: {p.sku || "N/A"} · Slug: /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <div>
                          <span className="font-bold text-white">₹{p.price.toLocaleString()}</span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="ml-2 text-white/30 line-through text-[10px]">
                              ₹{p.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                            {variantCount > 0 ? `${variantCount} combinations` : `${colorCount} colors`}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-semibold ${(p.stock || 0) <= 0
                              ? "text-red-400"
                              : (p.stock || 0) <= (p.lowStockThreshold || 5)
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                        >
                          {p.stock || 0} units
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(p)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                            }`}
                        >
                          {isAvailable ? "Available" : "Disabled"}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Preview Customer Page"
                          >
                            <Eye size={14} />
                          </Link>

                          {activeListTab !== "deleted" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="p-2 rounded-lg bg-[#ff6b00]/10 hover:bg-[#ff6b00]/20 text-[#ff6b00] transition-colors"
                                title="Edit Product & Variants"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(pId)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Move to Archive"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestore(pId)}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Restore to Active"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* PRODUCT CREATION & VARIANT MANAGEMENT STUDIO MODAL        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showStudioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-6xl rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Studio Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff6b00] shrink-0">
                    <Sparkles size={20} className="text-[#ff6b00]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {editingProduct ? `Edit: ${editingProduct.name}` : "Create New Product Studio"}
                    </h2>
                    <p className="text-[11px] text-neutral-500 dark:text-white/40">Configure catalog details, media, colors, and variant matrix</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStudioModal(false)}
                    className="h-8 w-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 hover:text-neutral-900 dark:text-white/60 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`px-6 py-3 text-xs flex items-center justify-between ${feedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-b border-red-500/20"
                    }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {feedback.message}
                  </div>
                  <button type="button" onClick={() => setFeedback(null)} className="text-white/40 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Step / Section Navigation Tabs */}
              <div className="flex items-center gap-1 px-6 pt-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-[#0c0c0c] overflow-x-auto scrollbar-none">
                {(
                  [
                    { key: "basic", label: "1. Basic Info", icon: Package },
                    { key: "media", label: "2. Images & Gallery", icon: ImageIcon },
                    { key: "colors", label: "3. Colors", icon: Palette },
                    { key: "sizes", label: "4. Sizes", icon: Ruler },
                    { key: "variants", label: "5. Variant Matrix", icon: Sliders },
                    { key: "attributes", label: "6. Attributes", icon: Tag },
                    { key: "preview", label: "7. Customer Preview", icon: Eye },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setStudioTab(t.key)}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${studioTab === t.key
                        ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white"
                      }`}
                  >
                    <t.icon size={14} className={studioTab === t.key ? "text-[#ff6b00]" : "text-neutral-500 dark:text-white/40"} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Studio Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* 1. BASIC INFO */}
                {studioTab === "basic" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Product Title / Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Men Regular Fit Striped Shirt"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maitri Men's Wear"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      >
                        <option value="Premium Shirts">Premium Shirts</option>
                        <option value="Formal Shirts">Formal Shirts</option>
                        <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                        <option value="Cargo Pants">Cargo Pants</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Formal Pants">Formal Pants</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Jackets">Jackets</option>
                        <option value="Sneakers">Sneakers</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Subcategory / Fit Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Casual / Regular Fit"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Master SKU
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SHIRT-STRIPED-001"
                        value={masterSku}
                        onChange={(e) => setMasterSku(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white font-mono focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Base Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="1499"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Base MRP / Original Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="2999"
                        value={baseOriginalPrice}
                        onChange={(e) => setBaseOriginalPrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Gender / Audience
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Boys">Boys</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Product Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      >
                        <option value="Active">Active (Live in Store)</option>
                        <option value="Draft">Draft (Hidden)</option>
                        <option value="Inactive">Inactive (Disabled)</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Badge (Optional)
                      </label>
                      <select
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      >
                        <option value="">None</option>
                        <option value="NEW">NEW</option>
                        <option value="SALE">SALE</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="LIMITED">LIMITED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. summer, cotton, regular-fit"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Short Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lightweight breathable cotton shirt with crisp spread collar"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Full Product Description
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Detailed fabric specifications, styling advice, and craftsmanship..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 2. MEDIA & GALLERY */}
                {studioTab === "media" && (
                  <div className="space-y-6">
                    {/* Top Mode Selection */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <ImageIcon size={15} className="text-[#ff6b00]" /> Add Product Images
                          </h4>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            Support both file uploads from your computer and direct web image URLs
                          </p>
                        </div>

                        {/* Dual Input Mode Toggle Buttons */}
                        <div className="flex items-center gap-1 rounded-xl bg-black/60 p-1 border border-white/10 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMediaActiveInputMode("upload");
                              setGalleryUrlError(null);
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${mediaActiveInputMode === "upload"
                                ? "bg-[#ff6b00] text-black shadow-md"
                                : "text-white/60 hover:text-white"
                              }`}
                          >
                            <Upload size={13} /> Upload Images
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMediaActiveInputMode("url");
                              setGalleryUrlError(null);
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${mediaActiveInputMode === "url"
                                ? "bg-[#ff6b00] text-black shadow-md"
                                : "text-white/60 hover:text-white"
                              }`}
                          >
                            <Link2 size={13} /> Add Image URL
                          </button>
                        </div>
                      </div>


                      {/* Option 1: Device File Upload */}
                      {mediaActiveInputMode === "upload" && (
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleDeviceUpload}
                            className="hidden"
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="cursor-pointer rounded-2xl border-2 border-dashed border-neutral-300 dark:border-white/15 bg-neutral-50/50 dark:bg-white/[0.01] hover:bg-neutral-100 dark:hover:bg-white/[0.04] hover:border-[#ff6b00]/60 p-6 flex flex-col items-center justify-center gap-2 text-center transition-all group"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff6b00] group-hover:scale-110 transition-transform">
                              {isUploadingDevice ? (
                                <Loader2 size={22} className="animate-spin text-[#ff6b00]" />
                              ) : (
                                <Upload size={22} className="text-[#ff6b00]" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                {isUploadingDevice ? "Processing & reading images..." : "Click to browse & upload images from your device"}
                              </p>
                              <p className="text-[10px] text-neutral-500 dark:text-white/40 mt-0.5">
                                Supports JPG, JPEG, PNG, WEBP (Multiple image selection allowed)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Option 2: Image URL Input */}
                      {mediaActiveInputMode === "url" && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/photo-... or any public image URL"
                              value={newGalleryUrl}
                              onChange={(e) => {
                                setNewGalleryUrl(e.target.value);
                                setGalleryUrlError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddGalleryUrl();
                                }
                              }}
                              className="flex-1 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#0c0c0c] px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00] transition-colors placeholder:text-neutral-400 dark:placeholder:text-white/20"
                            />
                            <button
                              type="button"
                              disabled={isValidatingGalleryUrl || !newGalleryUrl.trim()}
                              onClick={handleAddGalleryUrl}
                              className="rounded-xl bg-[#ff6b00] hover:bg-[#ff8533] disabled:opacity-40 px-5 py-3 text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-lg shrink-0 cursor-pointer"
                            >
                              {isValidatingGalleryUrl ? (
                                <>
                                  <Loader2 size={14} className="animate-spin text-black" /> Verifying...
                                </>
                              ) : (
                                <>
                                  <Check size={14} className="text-black" /> + Add Image URL
                                </>
                              )}
                            </button>
                          </div>

                          {galleryUrlError && (
                            <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
                              <AlertCircle size={14} className="shrink-0" />
                              <span>{galleryUrlError}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live Interactive Cursor Scrubbing Preview Box */}
                    {galleryImages.length > 0 && (
                      <div className="rounded-2xl border border-[#ff6b00]/30 bg-[#ff6b00]/[0.03] p-4.5 mb-5 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#ff6b00] animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-1.5">
                              <MousePointer size={13} className="text-[#ff6b00]" />
                              Live Cursor Scrubbing Preview (Storefront Experience)
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 dark:text-white/50 hidden sm:inline">
                            Hover & move mouse horizontally across the preview box to test photo switching
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                          {/* Interactive Scrub Box */}
                          <div
                            ref={adminScrubBoxRef}
                            onMouseMove={handleAdminScrubMouseMove}
                            onMouseLeave={() => {
                              const priIdx = galleryImages.findIndex(
                                (img) => Boolean(img.isPrimary) || img.url === primaryImage
                              );
                              setAdminScrubIndex(priIdx >= 0 ? priIdx : 0);
                            }}
                            className="preserve-white relative w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-neutral-300 dark:border-white/20 hover:border-[#ff6b00] bg-[#0c0c0c] cursor-ew-resize select-none shadow-2xl transition-all group shrink-0"
                            data-overlay="true"
                          >
                            <img
                              src={galleryImages[adminScrubIndex]?.url || galleryImages[0]?.url}
                              alt="Storefront Cursor Scrub Preview"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Top Segment Bars */}
                            {galleryImages.length > 1 && (
                              <div className="absolute top-2.5 inset-x-2.5 flex items-center gap-1 z-20 pointer-events-none">
                                {galleryImages.map((_, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className={`h-1 flex-1 rounded-full transition-all duration-150 ${sIdx === adminScrubIndex
                                        ? "bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.8)] scale-y-125"
                                        : "bg-white/40 backdrop-blur-sm"
                                      }`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Bottom Counter Pill & Primary Badge */}
                            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
                              <span
                                style={{ color: "#ffffff" }}
                                className="admin-badge-counter text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1 text-white"
                              >
                                <span style={{ color: "#ff6b00" }} className="font-extrabold text-[#ff6b00]">{adminScrubIndex + 1}</span>
                                <span style={{ color: "rgba(255,255,255,0.7)" }} className="text-white/70">/</span>
                                <span style={{ color: "#ffffff" }} className="text-white font-bold">{galleryImages.length}</span>
                              </span>
                              {Boolean(galleryImages[adminScrubIndex]?.isPrimary) && (
                                <span
                                  style={{ color: "#000000" }}
                                  className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-[#ff6b00] shadow-lg flex items-center gap-1 border border-black/20 text-black"
                                >
                                  <Star size={10} className="fill-black" color="#000000" /> PRIMARY
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Instructions and Stats */}
                          <div className="flex-1 space-y-2 text-xs text-neutral-600 dark:text-white/70">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              Multiple Photos Cursor Control:
                            </p>
                            <ul className="space-y-1.5 list-disc list-inside text-neutral-600 dark:text-white/60 text-[11px] leading-relaxed">
                              <li>
                                Moving cursor horizontally flips between all <span className="text-[#ff6b00] font-bold">{galleryImages.length} photos</span> in real time.
                              </li>
                              <li>
                                Mouse leave smoothly snaps back to the <span className="text-[#ff6b00] font-bold">Primary Photo</span>.
                              </li>
                              <li>
                                In the cards grid below, you can click <span className="text-neutral-900 dark:text-white font-bold">Set Primary (⭐)</span>, reorder images with <span className="text-neutral-900 dark:text-white font-bold">◀ / ▶</span>, or delete photos anytime.
                              </li>
                            </ul>
                            <div className="pt-2 flex items-center gap-3">
                              <span className="text-[11px] font-mono text-neutral-800 dark:text-white/80 bg-neutral-100 dark:bg-black/60 border border-neutral-300 dark:border-white/15 px-3 py-1 rounded-lg">
                                Active photo: <span className="text-[#ff6b00] font-bold">#{adminScrubIndex + 1}</span>
                              </span>
                              <span className="text-[11px] text-[#ff6b00] font-medium">
                                Total {galleryImages.length} photos under cursor
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Gallery Cards Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                          Product Image Gallery ({galleryImages.length} {galleryImages.length === 1 ? "Image" : "Images"})
                        </p>
                        <span className="text-[11px] text-white/40">
                          First image or starred image is used as the Primary storefront photo
                        </span>
                      </div>

                      {galleryImages.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-10 flex flex-col items-center justify-center text-center">
                          <ImageIcon size={32} className="text-white/20 mb-2" />
                          <p className="text-xs font-semibold text-white/60">No images added yet</p>
                          <p className="text-[11px] text-white/30 max-w-sm mt-1">
                            Upload images from your computer or paste web image URLs above.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {galleryImages.map((img, index) => {
                            const isPrimary = Boolean(img.isPrimary) || primaryImage === img.url;
                            return (
                              <div
                                key={index}
                                data-overlay="true"
                                className={`preserve-white group relative rounded-2xl overflow-hidden border-2 bg-[#0c0c0c] aspect-[3/4] flex flex-col justify-between p-2.5 transition-all shadow-md ${isPrimary
                                    ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/30 shadow-[#ff6b00]/10"
                                    : "border-white/10 hover:border-white/30"
                                  }`}
                              >
                                <img
                                  src={img.url}
                                  alt={`Product image ${index + 1}`}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Card Header / Badges */}
                                <div className="relative z-10 flex items-start justify-between gap-1">
                                  {isPrimary ? (
                                    <span
                                      style={{ color: "#000000" }}
                                      className="rounded-lg bg-[#ff6b00] text-[9px] font-extrabold px-2 py-1 shadow-lg flex items-center gap-1 border border-black/10 text-black"
                                    >
                                      <Star size={10} className="fill-black" color="#000000" /> PRIMARY
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimary(index)}
                                      style={{ color: "#ffffff" }}
                                      className="admin-badge-dark rounded-lg bg-black/85 backdrop-blur-md hover:text-[#ff6b00] hover:bg-black text-[9px] font-bold px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-all border border-white/20 shadow-lg text-white"
                                    >
                                      Set Primary
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    style={{ color: "#ffffff" }}
                                    className="h-6 w-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20 active:scale-90"
                                    title="Remove image"
                                  >
                                    <X size={12} color="#ffffff" className="text-white" />
                                  </button>
                                </div>

                                {/* Card Footer: Reorder & Type Info */}
                                <div className="relative z-10 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span
                                      style={{ color: "#ffffff" }}
                                      className="admin-badge-dark text-[9px] font-mono font-bold bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 shadow text-white"
                                    >
                                      #{index + 1}
                                    </span>
                                    <span
                                      style={{ color: "#ff8533" }}
                                      className="text-[8px] font-bold uppercase bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 shadow text-[#ff8533]"
                                    >
                                      {img.type === "upload" ? "Upload" : "URL"}
                                    </span>
                                  </div>

                                  {/* Reorder Buttons */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveGalleryImage(index, "left")}
                                        style={{ color: "#ffffff" }}
                                        className="admin-badge-dark h-6 w-6 rounded-lg bg-black/85 backdrop-blur-md hover:bg-[#ff6b00] hover:text-black border border-white/20 text-[10px] transition-all active:scale-90 shadow flex items-center justify-center text-white"
                                        title="Move Left"
                                      >
                                        <ChevronLeft size={12} color="#ffffff" className="text-white" />
                                      </button>
                                    )}
                                    {index < galleryImages.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveGalleryImage(index, "right")}
                                        style={{ color: "#ffffff" }}
                                        className="admin-badge-dark h-6 w-6 rounded-lg bg-black/85 backdrop-blur-md hover:bg-[#ff6b00] hover:text-black border border-white/20 text-[10px] transition-all active:scale-90 shadow flex items-center justify-center text-white"
                                        title="Move Right"
                                      >
                                        <ChevronRight size={12} color="#ffffff" className="text-white" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. COLORS & COLOR-SPECIFIC MEDIA */}
                {studioTab === "colors" && (
                  <div className="space-y-6">
                    {/* Add Color Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                        <Palette size={15} className="text-[#ff6b00]" /> Add Product Color
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Light Grey, Navy Blue, Maroon)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2.5 text-xs text-white outline-none focus:border-[#ff6b00]"
                        />
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0c] px-3 py-1.5">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-white/60">{newColorHex}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="btn-pill btn-pill-gold text-xs px-5 py-2.5"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>                    {/* Active Colors List (Stacked Vertically - One below another) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <span>Color Variants & Angle Galleries ({colorOptions.length})</span>
                          </h4>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            All colors are displayed below in order. Use ◀ / ▶ on any color to reorder (आधी-मागे करा).
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-[#ff8533] bg-[#ff6b00]/10 px-2.5 py-1 rounded-lg border border-[#ff6b00]/20">
                          {colorOptions.length} {colorOptions.length === 1 ? "Color Configured" : "Colors Configured"}
                        </span>
                      </div>

                      {colorOptions.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-10 text-center">
                          <Palette size={32} className="text-white/20 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-white/60">No color variants added yet</p>
                          <p className="text-[11px] text-white/30 max-w-sm mx-auto mt-1">
                            Use the form above to add colors like White, Black, Tan, etc.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {colorOptions.map((c, idx) => {
                            const colImgs = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
                            const currentMode = colorInputModes[idx] || "upload";
                            const isColorInStock = c.isAvailable !== false;
                            const isFirstColor = idx === 0;

                            return (
                              <div
                                key={idx}
                                data-overlay="true"
                                className={`preserve-white rounded-2xl border p-5 space-y-4 transition-all shadow-md ${isColorInStock
                                    ? "border-white/10 bg-[#0c0c0c]"
                                    : "border-red-500/30 bg-red-950/[0.04]"
                                  }`}
                              >
                                {/* Color Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className="h-10 w-10 rounded-full border-2 border-white/20 shadow-md shrink-0 relative"
                                      style={{ backgroundColor: c.hex }}
                                    >
                                      {!isColorInStock && (
                                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold bg-black/60 rounded-full">
                                          ✕
                                        </span>
                                      )}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-white text-sm">{c.name}</p>
                                        {isFirstColor && (
                                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#ff6b00]/20 text-[#ff8533] border border-[#ff6b00]/30">
                                            ⭐ Primary Color (Default)
                                          </span>
                                        )}
                                        {!isColorInStock ? (
                                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                                            Not Available (Out of Stock)
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            In Stock
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] font-mono text-white/40">
                                        Color #{idx + 1} of {colorOptions.length} · HEX: {c.hex} · SKU: {c.skuCode || c.name.slice(0, 3)} · {colImgs.length} {colImgs.length === 1 ? "Angle Photo" : "Angle Photos"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Color Reorder Buttons (आधी कर / मागे कर) */}
                                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => handleMoveColor(idx, "left")}
                                        className="px-2 py-1 rounded-lg text-xs font-semibold text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/10 transition-all flex items-center gap-1"
                                        title="Move this color earlier (आधी कर)"
                                      >
                                        <ChevronLeft size={12} />
                                        <span className="hidden sm:inline">Move Earlier</span>
                                      </button>
                                      <span className="text-white/20 text-xs">|</span>
                                      <button
                                        type="button"
                                        disabled={idx === colorOptions.length - 1}
                                        onClick={() => handleMoveColor(idx, "right")}
                                        className="px-2 py-1 rounded-lg text-xs font-semibold text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/10 transition-all flex items-center gap-1"
                                        title="Move this color later (मागे कर)"
                                      >
                                        <span className="hidden sm:inline">Move Later</span>
                                        <ChevronRight size={12} />
                                      </button>
                                    </div>

                                    {/* Availability Toggle Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleColorAvailability(idx)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${isColorInStock
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                                          : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300"
                                        }`}
                                      title={
                                        isColorInStock
                                          ? "Click to mark this color as Not Available / Out of Stock"
                                          : "Click to restore this color as In Stock & Available"
                                      }
                                    >
                                      {isColorInStock ? (
                                        <>
                                          <CheckCircle2 size={13} className="text-emerald-400" />
                                          <span>Available (In Stock)</span>
                                          <span className="text-[10px] text-white/40 ml-1">· Click to Disable</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle size={13} className="text-red-400" />
                                          <span>Not Available (Out of Stock)</span>
                                          <span className="text-[10px] text-white/60 ml-1 font-normal">· Click to Restore</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Mode Selector */}
                                    <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5 border border-white/10">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setColorInputModes((prev) => ({ ...prev, [idx]: "upload" }))
                                        }
                                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${currentMode === "upload"
                                            ? "bg-[#ff6b00] text-black"
                                            : "text-white/60 hover:text-white"
                                          }`}
                                      >
                                        <Upload size={10} className="inline mr-1" /> Upload
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setColorInputModes((prev) => ({ ...prev, [idx]: "url" }))
                                        }
                                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${currentMode === "url"
                                            ? "bg-[#ff6b00] text-black"
                                            : "text-white/60 hover:text-white"
                                          }`}
                                      >
                                        <Link2 size={10} className="inline mr-1" /> URL
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setColorOptions((prev) => prev.filter((_, i) => i !== idx));
                                        setActiveColorIndex((prev) => Math.max(0, prev - 1));
                                      }}
                                      className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                      title="Delete color completely"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>

                                {/* Color Image Input Section */}
                                <div className="space-y-3">
                                  {/* Live Color Angle Scrubbing Preview (if photos added) */}
                                  {colImgs.length > 0 && (
                                    <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                      {/* Interactive Angle Scrub Box */}
                                      <div
                                        ref={(el) => {
                                          colorScrubBoxRefs.current[idx] = el;
                                        }}
                                        onMouseMove={(e) => handleColorScrubMouseMove(idx, e)}
                                        onMouseLeave={() =>
                                          setColorScrubIndices((prev) => ({ ...prev, [idx]: 0 }))
                                        }
                                        className="relative w-28 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 hover:border-[#ff6b00] bg-black cursor-ew-resize select-none shrink-0 group shadow-lg"
                                      >
                                        <img
                                          src={colImgs[colorScrubIndices[idx] || 0] || colImgs[0]}
                                          alt={`${c.name} Angle Preview`}
                                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />

                                        {/* Segment Indicators */}
                                        {colImgs.length > 1 && (
                                          <div className="absolute top-1.5 inset-x-1.5 flex gap-1 z-10 pointer-events-none">
                                            {colImgs.map((_, s) => (
                                              <div
                                                key={s}
                                                className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${s === (colorScrubIndices[idx] || 0)
                                                    ? "bg-[#ff6b00] scale-y-125 shadow"
                                                    : "bg-black/50"
                                                  }`}
                                              />
                                            ))}
                                          </div>
                                        )}

                                        {/* Count */}
                                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white/90 border border-white/10 pointer-events-none">
                                          {(colorScrubIndices[idx] || 0) + 1} / {colImgs.length}
                                        </div>

                                        {!isColorInStock && (
                                          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                                            <span className="text-[9px] font-extrabold uppercase bg-red-500 text-white px-2 py-0.5 rounded shadow">
                                              OUT OF STOCK
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 space-y-1.5 text-xs">
                                        <p className="font-semibold text-white flex items-center gap-1.5">
                                          <MousePointer size={12} className="text-[#ff6b00]" />
                                          {c.name} Angle Scrubbing Preview ({colImgs.length} photos)
                                        </p>
                                        <p className="text-[11px] text-white/60 leading-relaxed">
                                          Hover & move your cursor horizontally across the box to preview how customers will view multiple angle positions (Front, Back, Side, Collar) for the <span className="text-[#ff8533] font-bold">{c.name}</span> color.
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                          {isColorInStock ? (
                                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                              ✓ Available for customers to order
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                              ✕ Marked Out of Stock (Disabled on Storefront)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {currentMode === "upload" ? (
                                    <div>
                                      <input
                                        ref={(el) => {
                                          colorFileInputRefs.current[idx] = el;
                                        }}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={(e) => handleColorDeviceUpload(idx, e)}
                                        className="hidden"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => colorFileInputRefs.current[idx]?.click()}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#ff6b00]/50 py-2.5 px-4 text-xs font-semibold text-white/80 hover:text-white transition-all"
                                      >
                                        <Upload size={13} className="text-[#ff6b00]" />
                                        <span>Upload Angle Photos for {c.name} (Front, Back, Side)</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder={`Paste image URL(s) for ${c.name} (separate with comma)...`}
                                          value={colorUrlInputs[idx] || ""}
                                          onChange={(e) =>
                                            setColorUrlInputs((prev) => ({ ...prev, [idx]: e.target.value }))
                                          }
                                          className="flex-1 rounded-xl border border-white/10 bg-[#0c0c0c] px-3.5 py-2 text-xs text-white outline-none focus:border-[#ff6b00]"
                                        />
                                        <button
                                          type="button"
                                          disabled={colorUrlValidating[idx] || !colorUrlInputs[idx]?.trim()}
                                          onClick={() => handleColorAddUrl(idx)}
                                          className="rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white flex items-center gap-1 shrink-0"
                                        >
                                          {colorUrlValidating[idx] ? (
                                            <Loader2 size={12} className="animate-spin" />
                                          ) : (
                                            <Check size={12} />
                                          )}
                                          Add URL(s)
                                        </button>
                                      </div>
                                      {colorUrlErrors[idx] && (
                                        <p className="text-[11px] text-red-400">{colorUrlErrors[idx]}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Color Image Thumbnails with Reorder & Set Primary */}
                                  {colImgs.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                      {colImgs.map((imgUrl, imgIdx) => (
                                        <div
                                          key={imgIdx}
                                          className={`group relative h-20 w-20 rounded-xl overflow-hidden border-2 bg-black transition-all ${imgIdx === 0
                                              ? "border-[#ff6b00] ring-1 ring-[#ff6b00]/40"
                                              : "border-white/15 hover:border-white/40"
                                            }`}
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={`${c.name} angle ${imgIdx + 1}`}
                                            className="h-full w-full object-cover"
                                          />

                                          {/* Star on first image */}
                                          {imgIdx === 0 && (
                                            <span className="absolute top-1 left-1 bg-[#ff6b00] text-black rounded p-0.5 shadow">
                                              <Star size={8} className="fill-black" />
                                            </span>
                                          )}

                                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                            <div className="flex items-center justify-between">
                                              {imgIdx !== 0 ? (
                                                <button
                                                  type="button"
                                                  onClick={() => handleColorSetPrimary(idx, imgIdx)}
                                                  style={{ color: "#ffffff" }}
                                                  className="admin-badge-dark h-5 px-1.5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-[8px] font-bold text-white shadow"
                                                  title="Set as Main Angle Photo"
                                                >
                                                  Main
                                                </button>
                                              ) : (
                                                <span className="text-[8px] font-bold text-[#ff6b00]">
                                                  Main
                                                </span>
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => handleColorRemoveImage(idx, imgIdx)}
                                                style={{ color: "#ffffff" }}
                                                className="h-5 w-5 rounded bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                                                title="Delete photo"
                                              >
                                                <X size={10} color="#ffffff" className="text-white" />
                                              </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                              {imgIdx > 0 ? (
                                                <button
                                                  type="button"
                                                  onClick={() => handleColorMoveImage(idx, imgIdx, "left")}
                                                  style={{ color: "#ffffff" }}
                                                  className="admin-badge-dark h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center text-[10px] shadow"
                                                  title="Move Left"
                                                >
                                                  <ChevronLeft size={10} color="#ffffff" className="text-white" />
                                                </button>
                                              ) : (
                                                <span />
                                              )}

                                              {imgIdx < colImgs.length - 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleColorMoveImage(idx, imgIdx, "right")}
                                                  style={{ color: "#ffffff" }}
                                                  className="admin-badge-dark h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center text-[10px] shadow"
                                                  title="Move Right"
                                                >
                                                  <ChevronRight size={10} color="#ffffff" className="text-white" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. SIZES CONFIGURATION */}
                {studioTab === "sizes" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                        Quick Preset Size Templates
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleApplySizePreset("clothing")}
                          className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-xs font-semibold text-white/80 hover:border-[#ff6b00] hover:text-[#ff6b00]"
                        >
                          Apparel (XS - 3XL)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySizePreset("waist")}
                          className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-xs font-semibold text-white/80 hover:border-[#ff6b00] hover:text-[#ff6b00]"
                        >
                          Pants / Waist (28 - 38)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySizePreset("shoes")}
                          className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-xs font-semibold text-white/80 hover:border-[#ff6b00] hover:text-[#ff6b00]"
                        >
                          Shoes (UK 6 - 12)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySizePreset("freesize")}
                          className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-xs font-semibold text-white/80 hover:border-[#ff6b00] hover:text-[#ff6b00]"
                        >
                          Free Size
                        </button>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Custom Size (e.g. 42R, XL-Tall, 10.5)"
                          value={newSizeInput}
                          onChange={(e) => setNewSizeInput(e.target.value)}
                          className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-xs text-white outline-none focus:border-[#ff6b00]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSizeInput.trim()) return;
                            if (!sizes.includes(newSizeInput.trim())) {
                              setSizes((prev) => [...prev, newSizeInput.trim()]);
                            }
                            setNewSizeInput("");
                          }}
                          className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white"
                        >
                          + Add Size
                        </button>
                      </div>
                    </div>

                    {/* Active Selected Sizes */}
                    <div className="flex flex-wrap gap-3">
                      {sizes.map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-2 rounded-xl border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-2 text-xs font-bold text-white"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => setSizes((prev) => prev.filter((x) => x !== s))}
                            className="text-white/40 hover:text-red-400"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. VARIANT MATRIX GENERATOR */}
                {studioTab === "variants" && (
                  <div className="space-y-6">
                    {/* Generator CTA & Bulk Tools */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders size={16} className="text-[#ff6b00]" /> Color × Size Combinations
                        </h4>
                        <p className="text-xs text-white/40 mt-0.5">
                          {variants.length} combinations generated · Total Stock: {totalCalculatedStock} units
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateVariants}
                        className="btn-pill btn-pill-gold inline-flex items-center gap-1.5 text-xs px-4 py-2.5"
                      >
                        <RefreshCw size={14} /> Generate All Combinations
                      </button>
                    </div>

                    {/* Bulk controls bar */}
                    {variants.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                          Bulk Edit:
                        </span>
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="MRP (₹)"
                          value={bulkMrp}
                          onChange={(e) => setBulkMrp(e.target.value)}
                          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Stock (Qty)"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulk}
                          className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Apply to All
                        </button>
                      </div>
                    )}

                    {/* Variant Matrix Table */}
                    {variants.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 text-center">
                        <p className="text-xs text-white/40">No variants generated yet.</p>
                        <button
                          type="button"
                          onClick={handleGenerateVariants}
                          className="mt-3 btn-pill btn-pill-gold text-xs"
                        >
                          Generate Combinations Now
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-white/[0.03] text-[10px] uppercase font-bold text-white/40 tracking-wider">
                              <tr>
                                <th className="p-3">Color</th>
                                <th className="p-3">Size</th>
                                <th className="p-3">Variant SKU</th>
                                <th className="p-3">MRP (₹)</th>
                                <th className="p-3">Selling Price (₹)</th>
                                <th className="p-3">Discount</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Active</th>
                                <th className="p-3 text-right">Remove</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {variants.map((v, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="h-4 w-4 rounded-full border border-white/20"
                                        style={{ backgroundColor: v.colorCode || "#000" }}
                                      />
                                      <span className="font-semibold text-white">{v.color}</span>
                                    </div>
                                  </td>

                                  <td className="p-3 font-bold text-[#ff6b00]">{v.size}</td>

                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={v.sku || ""}
                                      onChange={(e) => {
                                        const copy = [...variants];
                                        copy[idx].sku = e.target.value;
                                        setVariants(copy);
                                      }}
                                      className="w-32 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white font-mono"
                                    />
                                  </td>

                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.mrp || ""}
                                      onChange={(e) => {
                                        const copy = [...variants];
                                        const m = Number(e.target.value);
                                        copy[idx].mrp = m;
                                        if (m > (copy[idx].sellingPrice || 0)) {
                                          copy[idx].discount = Math.round(((m - copy[idx].sellingPrice) / m) * 100);
                                        }
                                        setVariants(copy);
                                      }}
                                      className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                                    />
                                  </td>

                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.sellingPrice}
                                      onChange={(e) => {
                                        const copy = [...variants];
                                        const sp = Number(e.target.value);
                                        copy[idx].sellingPrice = sp;
                                        const mrp = copy[idx].mrp || sp;
                                        if (mrp > sp) {
                                          copy[idx].discount = Math.round(((mrp - sp) / mrp) * 100);
                                        }
                                        setVariants(copy);
                                      }}
                                      className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white font-bold text-[#ff6b00]"
                                    />
                                  </td>

                                  <td className="p-3">
                                    <span className="text-[11px] font-bold text-emerald-400">
                                      {v.discount || 0}%
                                    </span>
                                  </td>

                                  <td className="p-3">
                                    <input
                                      type="number"
                                      value={v.stock}
                                      onChange={(e) => {
                                        const copy = [...variants];
                                        copy[idx].stock = Number(e.target.value);
                                        setVariants(copy);
                                      }}
                                      className={`w-16 rounded border px-2 py-1 text-xs font-semibold ${v.stock <= 0
                                          ? "border-red-500/40 bg-red-500/10 text-red-300"
                                          : "border-white/10 bg-white/5 text-white"
                                        }`}
                                    />
                                  </td>

                                  <td className="p-3">
                                    <input
                                      type="checkbox"
                                      checked={v.isActive !== false}
                                      onChange={(e) => {
                                        const copy = [...variants];
                                        copy[idx].isActive = e.target.checked;
                                        setVariants(copy);
                                      }}
                                      className="h-4 w-4 rounded accent-[#ff6b00]"
                                    />
                                  </td>

                                  <td className="p-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                                      className="text-white/30 hover:text-red-400"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. ATTRIBUTES & SPECIFICATIONS */}
                {studioTab === "attributes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Fabric / Material
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 100% Giza Cotton, Linen Blend"
                        value={fabric}
                        onChange={(e) => setFabric(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Fit Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Regular Fit, Slim Fit, Relaxed"
                        value={fit}
                        onChange={(e) => setFit(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Pattern
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Striped, Solid, Checked"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Sleeve Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Full Sleeve, Half Sleeve"
                        value={sleeve}
                        onChange={(e) => setSleeve(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Collar Style
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Spread Collar, Button-Down, Mandarin"
                        value={collar}
                        onChange={(e) => setCollar(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Occasion
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Casual, Formal, Evening"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Wash Care Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Machine wash cold with similar colors"
                        value={washCare}
                        onChange={(e) => setWashCare(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                        Country of Origin
                      </label>
                      <input
                        type="text"
                        placeholder="India"
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#ff6b00] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 7. LIVE CUSTOMER PREVIEW */}
                {studioTab === "preview" && (
                  <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 max-w-4xl mx-auto space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] flex items-center gap-2">
                      <Eye size={15} /> Live Customer Storefront Preview
                    </p>

                    {(() => {
                      const activeColOpt = colorOptions.find(
                        (c) => c.name.toLowerCase() === (previewActiveColor || colorOptions[0]?.name || "").toLowerCase()
                      );
                      const activeColImgs = (activeColOpt?.images || []).map((img) =>
                        typeof img === "string" ? img : img.url
                      );
                      const displayImg =
                        activeColImgs.length > 0
                          ? activeColImgs[0]
                          : galleryImages.find((img) => img.isPrimary)?.url || galleryImages[0]?.url || primaryImage;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10 relative shadow-xl">
                              <img
                                src={displayImg || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                              {badge && (
                                <span className="absolute top-4 left-4 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#ff6b00] border border-[#ff6b00]/30 shadow">
                                  {badge}
                                </span>
                              )}
                              {activeColOpt && (
                                <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90 border border-white/10">
                                  Color: {activeColOpt.name}
                                </span>
                              )}
                            </div>

                            {/* Preview Mini Thumbnails */}
                            {(activeColImgs.length > 0 ? activeColImgs : galleryImages.map((g) => g.url)).length > 1 && (
                              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {(activeColImgs.length > 0 ? activeColImgs : galleryImages.map((g) => g.url)).map(
                                  (thumbUrl, tIdx) => (
                                    <div
                                      key={tIdx}
                                      className="h-12 w-10 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0"
                                    >
                                      <img src={thumbUrl} alt="Thumb" className="h-full w-full object-cover" />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold tracking-widest text-[#ff6b00] uppercase">
                                {brand || "Maitri Men's Wear"} · {category}
                              </p>
                              <h3 className="text-2xl font-light text-white mt-1 mb-2">{name || "Product Title"}</h3>

                              <div className="flex items-baseline gap-3 my-4">
                                <span className="text-3xl font-bold text-white">₹{Number(basePrice || 0).toLocaleString()}</span>
                                {baseOriginalPrice && Number(baseOriginalPrice) > Number(basePrice) && (
                                  <span className="text-base text-white/30 line-through">
                                    ₹{Number(baseOriginalPrice).toLocaleString()}
                                  </span>
                                )}
                                {baseOriginalPrice && Number(baseOriginalPrice) > Number(basePrice) && (
                                  <span className="rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-2 py-0.5 text-xs font-bold text-[#ff6b00]">
                                    {Math.round(((Number(baseOriginalPrice) - Number(basePrice)) / Number(baseOriginalPrice)) * 100)}% OFF
                                  </span>
                                )}
                              </div>

                              <div className="space-y-4 my-6">
                                <div>
                                  <p className="text-xs text-white/50 uppercase font-semibold mb-2">
                                    Select Color Swatch (Click to switch preview):
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((c) => {
                                      const isSelected =
                                        (previewActiveColor || colorOptions[0]?.name).toLowerCase() ===
                                        c.name.toLowerCase();
                                      return (
                                        <button
                                          type="button"
                                          key={c.name}
                                          onClick={() => setPreviewActiveColor(c.name)}
                                          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${isSelected
                                              ? "border-[#ff6b00] bg-[#ff6b00]/15 text-white shadow-md shadow-[#ff6b00]/10"
                                              : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                                            }`}
                                        >
                                          <span
                                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow"
                                            style={{ backgroundColor: c.hex }}
                                          />
                                          <span>{c.name}</span>
                                          {isSelected && <Check size={12} className="text-[#ff6b00]" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-white/50 uppercase font-semibold mb-2">Available Sizes:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {sizes.map((s) => (
                                      <span key={s} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/60">
                              Total calculated inventory across {variants.length} combinations: <strong className="text-white">{totalCalculatedStock} units</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Studio Footer Actions */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
                <button
                  type="button"
                  onClick={() => setShowStudioModal(false)}
                  className="rounded-xl border border-neutral-300 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 dark:text-white/60 dark:hover:text-white bg-white hover:bg-neutral-100 dark:bg-transparent dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveProduct("Draft")}
                    className="rounded-xl border border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-white/5 px-5 py-2.5 text-xs font-bold text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveProduct("Active")}
                    className="btn-pill btn-pill-gold inline-flex items-center gap-2 text-xs px-6 py-2.5 disabled:opacity-40 cursor-pointer shadow-lg"
                  >
                    {isSaving ? <Loader2 size={15} className="animate-spin text-black" /> : <Save size={15} className="text-black" />}
                    {editingProduct ? "Update & Publish" : "Save & Publish Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
