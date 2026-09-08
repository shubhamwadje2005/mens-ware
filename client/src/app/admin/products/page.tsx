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
} from "lucide-react";
import Link from "next/link";

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
  const [brand, setBrand] = useState("NOIR STUDIO");
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

  // Colors & Color Specific Media
  const [colorOptions, setColorOptions] = useState<ProductColor[]>([
    { name: "Light Grey", hex: "#D3D3D3", images: [], skuCode: "LG" },
    { name: "Navy Blue", hex: "#001F3F", images: [], skuCode: "NB" },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<number, string>>({});
  const [colorUrlValidating, setColorUrlValidating] = useState<Record<number, boolean>>({});
  const [colorUrlErrors, setColorUrlErrors] = useState<Record<number, string | null>>({});
  const [colorInputModes, setColorInputModes] = useState<Record<number, "upload" | "url">>({});
  const colorFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Preview color state
  const [previewActiveColor, setPreviewActiveColor] = useState<string>("");

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
    setBrand("NOIR STUDIO");
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
      { name: "Light Grey", hex: "#D3D3D3", images: [], skuCode: "LG" },
      { name: "Navy Blue", hex: "#001F3F", images: [], skuCode: "NB" },
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
    setBrand(p.brand || "NOIR STUDIO");
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
      setColorOptions(
        p.colorOptions.map((c) => ({
          name: c.name,
          hex: c.hex,
          skuCode: c.skuCode || c.name.slice(0, 3).toUpperCase(),
          images: (c.images || []).map((img) => (typeof img === "string" ? img : img.url)),
        }))
      );
      setPreviewActiveColor(p.colorOptions[0].name);
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

  // Device File Upload Handler for Main Gallery
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingDevice(true);
    setGalleryUrlError(null);

    const newItems: ProductImageItem[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;
        if (processed === files.length) setIsUploadingDevice(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) {
          newItems.push({
            url: base64,
            type: "upload",
            isPrimary: galleryImages.length === 0 && newItems.length === 0,
            sortOrder: galleryImages.length + newItems.length,
          });
        }
        processed++;
        if (processed === files.length) {
          setGalleryImages((prev) => {
            const combined = [...prev, ...newItems];
            if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
              combined[0].isPrimary = true;
            }
            const pri = combined.find((img) => img.isPrimary)?.url || combined[0]?.url || "";
            setPrimaryImage(pri);
            return combined;
          });
          setIsUploadingDevice(false);
          setFeedback({ type: "success", message: `Successfully loaded ${newItems.length} image(s) from device.` });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Add Image URL for Main Gallery
  const handleAddGalleryUrl = async () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) {
      setGalleryUrlError("Please enter an image URL.");
      return;
    }
    setGalleryUrlError(null);
    setIsValidatingGalleryUrl(true);

    const isValid = await verifyImageLoad(trimmed);
    setIsValidatingGalleryUrl(false);

    if (!isValid) {
      setGalleryUrlError("Unable to load image from this URL. Please verify the link is accessible and is a valid image (JPG, PNG, WEBP).");
      return;
    }

    const isFirst = galleryImages.length === 0;
    const newItem: ProductImageItem = {
      url: trimmed,
      type: "url",
      isPrimary: isFirst,
      sortOrder: galleryImages.length,
    };

    setGalleryImages((prev) => {
      const updated = [...prev, newItem];
      if (isFirst) setPrimaryImage(trimmed);
      return updated;
    });
    setNewGalleryUrl("");
    setFeedback({ type: "success", message: "Image URL validated and added to gallery!" });
  };

  // Set Primary Image in Main Gallery
  const handleSetPrimary = (index: number) => {
    setGalleryImages((prev) => {
      const updated = prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }));
      setPrimaryImage(updated[index].url);
      return updated;
    });
    setFeedback({ type: "success", message: `Image #${index + 1} marked as Primary Image.` });
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
  const handleColorDeviceUpload = (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImgs: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) newImgs.push(base64);
        processed++;
        if (processed === files.length) {
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
          setFeedback({ type: "success", message: `Added ${newImgs.length} image(s) for color ${colorOptions[colorIndex]?.name}.` });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleColorAddUrl = async (colorIndex: number) => {
    const inputUrl = colorUrlInputs[colorIndex]?.trim();
    if (!inputUrl) {
      setColorUrlErrors((prev) => ({ ...prev, [colorIndex]: "Please enter an image URL." }));
      return;
    }
    setColorUrlErrors((prev) => ({ ...prev, [colorIndex]: null }));
    setColorUrlValidating((prev) => ({ ...prev, [colorIndex]: true }));

    const isValid = await verifyImageLoad(inputUrl);
    setColorUrlValidating((prev) => ({ ...prev, [colorIndex]: false }));

    if (!isValid) {
      setColorUrlErrors((prev) => ({
        ...prev,
        [colorIndex]: "Unable to load image from URL. Please ensure it is accessible.",
      }));
      return;
    }

    setColorOptions((prev) =>
      prev.map((c, idx) => {
        if (idx !== colorIndex) return c;
        const existing = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
        return {
          ...c,
          images: [...existing, inputUrl],
        };
      })
    );
    setColorUrlInputs((prev) => ({ ...prev, [colorIndex]: "" }));
    setFeedback({ type: "success", message: `Image URL added to ${colorOptions[colorIndex]?.name}.` });
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
      const normalizedColorOptions = colorOptions.map((c) => ({
        name: c.name.trim(),
        hex: c.hex,
        skuCode: c.skuCode,
        images: (c.images || []).map((img) => (typeof img === "string" ? img : img.url)),
      }));

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
        brand: brand.trim() || "NOIR STUDIO",
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
        hoverImage: hoverImage || (galleryImages[1]?.url || undefined),
        images: galleryImages,

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen text-white">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-3">
            <Package className="text-[#ff6b00]" size={28} /> Product Management Studio
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Create and manage professional products, media galleries, colors, and variant matrices
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-pill btn-pill-gold inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(255,107,0,0.3)] hover:scale-105 transition-all text-xs"
        >
          <Plus size={16} /> Create New Product
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Total Catalog</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{productList.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active & Available</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
            {productList.filter((p) => p.isAvailable !== false).length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Disabled / Out of Stock</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
            {productList.filter((p) => p.isAvailable === false || (p.stock || 0) <= 0).length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Deleted Archive</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-400 mt-1">{deletedProducts.length}</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { key: "all", label: `All (${productList.length})` },
              { key: "available", label: "In Stock & Live" },
              { key: "unavailable", label: "Disabled / Hidden" },
              { key: "deleted", label: `Archive (${deletedProducts.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveListTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                activeListTab === tab.key
                  ? "bg-[#ff6b00] text-black font-bold"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-[#ff6b00] outline-none"
          />
        </div>
      </div>

      {/* Product List Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#ff6b00]" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-white/20" />
          <h3 className="text-base font-semibold text-white">No products found</h3>
          <p className="text-xs text-white/40 mt-1">Try adjusting your search or tab filter.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase font-bold text-white/40 tracking-wider">
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
              <tbody className="divide-y divide-white/5">
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
                          className={`font-semibold ${
                            (p.stock || 0) <= 0
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
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                            isAvailable
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
        </div>
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0c0c0c]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff6b00]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingProduct ? `Edit: ${editingProduct.name}` : "Create New Product Studio"}
                    </h2>
                    <p className="text-[11px] text-white/40">Configure catalog details, media, colors, and variant matrix</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStudioModal(false)}
                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`px-6 py-3 text-xs flex items-center justify-between ${
                    feedback.type === "success"
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
              <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-[#0c0c0c] overflow-x-auto scrollbar-none">
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
                    className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      studioTab === t.key
                        ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <t.icon size={14} /> {t.label}
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
                        placeholder="e.g. NOIR STUDIO"
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
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              mediaActiveInputMode === "upload"
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
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              mediaActiveInputMode === "url"
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
                            className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.04] hover:border-[#ff6b00]/60 p-6 flex flex-col items-center justify-center gap-2 text-center transition-all group"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff6b00] group-hover:scale-110 transition-transform">
                              {isUploadingDevice ? (
                                <Loader2 size={22} className="animate-spin" />
                              ) : (
                                <Upload size={22} />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {isUploadingDevice ? "Processing & reading images..." : "Click to browse & upload images from your device"}
                              </p>
                              <p className="text-[10px] text-white/40 mt-0.5">
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
                              className="flex-1 rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-xs text-white outline-none focus:border-[#ff6b00] transition-colors placeholder:text-white/20"
                            />
                            <button
                              type="button"
                              disabled={isValidatingGalleryUrl || !newGalleryUrl.trim()}
                              onClick={handleAddGalleryUrl}
                              className="rounded-xl bg-[#ff6b00] hover:bg-[#ff8533] disabled:opacity-40 px-5 py-3 text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-lg shrink-0"
                            >
                              {isValidatingGalleryUrl ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Verifying...
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> + Add Image URL
                                </>
                              )}
                            </button>
                          </div>

                          {galleryUrlError && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
                              <AlertCircle size={14} className="shrink-0" />
                              <span>{galleryUrlError}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

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
                                className={`group relative rounded-2xl overflow-hidden border-2 bg-[#0c0c0c] aspect-[3/4] flex flex-col justify-between p-2.5 transition-all shadow-md ${
                                  isPrimary
                                    ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/30 shadow-[#ff6b00]/10"
                                    : "border-white/10 hover:border-white/30"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={`Product image ${index + 1}`}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Card Header / Badges */}
                                <div className="relative z-10 flex items-start justify-between gap-1">
                                  {isPrimary ? (
                                    <span className="rounded-md bg-[#ff6b00] text-black text-[9px] font-extrabold px-2 py-0.5 shadow flex items-center gap-1">
                                      <Star size={10} className="fill-black" /> PRIMARY
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimary(index)}
                                      className="rounded-md bg-black/80 backdrop-blur-sm text-white hover:text-[#ff6b00] hover:bg-black text-[9px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                    >
                                      Set Primary
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    className="h-6 w-6 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                                    title="Remove image"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>

                                {/* Card Footer: Reorder & Type Info */}
                                <div className="relative z-10 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-white/80 border border-white/10">
                                      #{index + 1}
                                    </span>
                                    <span className="text-[8px] font-bold uppercase bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                                      {img.type === "upload" ? "Upload" : "URL"}
                                    </span>
                                  </div>

                                  {/* Reorder Buttons */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveGalleryImage(index, "left")}
                                        className="h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center border border-white/10 text-[10px]"
                                        title="Move Left"
                                      >
                                        <ChevronLeft size={12} />
                                      </button>
                                    )}
                                    {index < galleryImages.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveGalleryImage(index, "right")}
                                        className="h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center border border-white/10 text-[10px]"
                                        title="Move Right"
                                      >
                                        <ChevronRight size={12} />
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
                    </div>

                    {/* Active Colors List with Color-Specific Media Gallery */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
                          Configured Colors & Color-Specific Galleries ({colorOptions.length})
                        </h4>
                        <span className="text-[11px] text-white/40">
                          Each color can have its own dedicated image gallery for customer swatch switching
                        </span>
                      </div>

                      {colorOptions.map((c, idx) => {
                        const colImgs = (c.images || []).map((img) => (typeof img === "string" ? img : img.url));
                        const currentMode = colorInputModes[idx] || "upload";

                        return (
                          <div
                            key={idx}
                            className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 space-y-4 transition-all"
                          >
                            {/* Color Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-8 w-8 rounded-full border-2 border-white/20 shadow-md shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <div>
                                  <p className="font-bold text-white text-sm">{c.name}</p>
                                  <p className="text-[11px] font-mono text-white/40">
                                    HEX: {c.hex} · SKU Code: {c.skuCode || c.name.slice(0, 3)} · {colImgs.length} {colImgs.length === 1 ? "Image" : "Images"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Mode Selector for this color */}
                                <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5 border border-white/10">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setColorInputModes((prev) => ({ ...prev, [idx]: "upload" }))
                                    }
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                      currentMode === "upload"
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
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                      currentMode === "url"
                                        ? "bg-[#ff6b00] text-black"
                                        : "text-white/60 hover:text-white"
                                    }`}
                                  >
                                    <Link2 size={10} className="inline mr-1" /> URL
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setColorOptions((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                  title="Delete color"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Color Image Input Section */}
                            <div className="space-y-3">
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
                                    <span>Upload Photos for {c.name} (from computer)</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Paste image URL for ${c.name}...`}
                                      value={colorUrlInputs[idx] || ""}
                                      onChange={(e) =>
                                        setColorUrlInputs((prev) => ({ ...prev, [idx]: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleColorAddUrl(idx);
                                        }
                                      }}
                                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20"
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
                                      Add URL
                                    </button>
                                  </div>
                                  {colorUrlErrors[idx] && (
                                    <p className="text-[11px] text-red-400">{colorUrlErrors[idx]}</p>
                                  )}
                                </div>
                              )}

                              {/* Color Image Thumbnails */}
                              {colImgs.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                  {colImgs.map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="group relative h-16 w-16 rounded-xl overflow-hidden border border-white/15 bg-black"
                                    >
                                      <img src={imgUrl} alt={`${c.name} ${imgIdx + 1}`} className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        {imgIdx > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => handleColorMoveImage(idx, imgIdx, "left")}
                                            className="h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center text-[10px]"
                                          >
                                            <ChevronLeft size={10} />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleColorRemoveImage(idx, imgIdx)}
                                          className="h-5 w-5 rounded bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px]"
                                        >
                                          <X size={10} />
                                        </button>
                                        {imgIdx < colImgs.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleColorMoveImage(idx, imgIdx, "right")}
                                            className="h-5 w-5 rounded bg-black/80 hover:bg-[#ff6b00] hover:text-black text-white flex items-center justify-center text-[10px]"
                                          >
                                            <ChevronRight size={10} />
                                          </button>
                                        )}
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
                                      className={`w-16 rounded border px-2 py-1 text-xs font-semibold ${
                                        v.stock <= 0
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
                                {brand || "NOIR STUDIO"} · {category}
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
                                          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                            isSelected
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0c0c0c]">
                <button
                  type="button"
                  onClick={() => setShowStudioModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveProduct("Draft")}
                    className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveProduct("Active")}
                    className="btn-pill btn-pill-gold inline-flex items-center gap-2 text-xs px-6 py-2.5 disabled:opacity-40"
                  >
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
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
