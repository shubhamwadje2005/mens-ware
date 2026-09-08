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
import { Product, ProductVariant, ProductColor } from "@/types";
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
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colors
  const [colorOptions, setColorOptions] = useState<ProductColor[]>([
    { name: "Light Grey", hex: "#D3D3D3", images: [], skuCode: "LG" },
    { name: "Navy Blue", hex: "#001F3F", images: [], skuCode: "NB" },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

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

  // Open Create Studio
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setStudioTab("basic");
    setFeedback(null);

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
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop",
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

    setShowStudioModal(true);
  };

  // Open Edit Studio
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setStudioTab("basic");
    setFeedback(null);

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
    setGalleryImages(p.images && p.images.length > 0 ? p.images : [p.image || ""]);

    // Populate colors
    if (p.colorOptions && p.colorOptions.length > 0) {
      setColorOptions(p.colorOptions);
    } else if (p.colors && p.colors.length > 0) {
      setColorOptions(
        p.colors.map((c) => ({
          name: c.startsWith("#") ? "Color" : c,
          hex: c.startsWith("#") ? c : "#1A1A1A",
          images: [],
          skuCode: c.slice(0, 2).toUpperCase(),
        }))
      );
    } else {
      setColorOptions([{ name: "Black", hex: "#000000", images: [], skuCode: "BLK" }]);
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
      // Auto-generate variants for legacy product
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
      sizes.forEach((sz) => {
        // Check if combination already existed to preserve custom values
        const existing = variants.find(
          (v) => v.color.toLowerCase() === col.name.toLowerCase() && v.size.toLowerCase() === sz.toLowerCase()
        );

        if (existing) {
          generated.push(existing);
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
            images: col.images || [],
            isActive: true,
          });
        }
      });
    });

    setVariants(generated);
    setFeedback({ type: "success", message: `Generated ${generated.length} variant combinations!` });
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

  // Device file upload reader
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        if (!primaryImage) {
          setPrimaryImage(base64);
        }
        setGalleryImages((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
    setFeedback({ type: "success", message: "Image(s) loaded from device." });
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
    if (!primaryImage) {
      setFeedback({ type: "error", message: "At least one primary image is required." });
      setStudioTab("media");
      return;
    }

    try {
      const priceNum = Number(basePrice);
      const mrpNum = baseOriginalPrice ? Number(baseOriginalPrice) : undefined;
      const tagsArray = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

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

        image: primaryImage,
        hoverImage: hoverImage || undefined,
        images: galleryImages,

        colorOptions,
        colors: colorOptions.map((c) => c.name),
        sizes,

        variants,

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
                            src={p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100"}
                            alt={p.name}
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                          Upload Images from Device or URL
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleDeviceUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-3 py-1.5 text-xs font-bold text-[#ff6b00] hover:bg-[#ff6b00]/20"
                        >
                          <Upload size={14} /> Upload from Device
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none focus:border-[#ff6b00]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newGalleryUrl.trim()) return;
                            if (!primaryImage) setPrimaryImage(newGalleryUrl.trim());
                            setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
                            setNewGalleryUrl("");
                          }}
                          className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Image Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {galleryImages.map((img, index) => {
                        const isPrimary = primaryImage === img;
                        return (
                          <div
                            key={index}
                            className={`group relative rounded-2xl overflow-hidden border-2 bg-[#0c0c0c] aspect-[3/4] flex flex-col justify-between p-2 transition-all ${
                              isPrimary ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/30" : "border-white/10"
                            }`}
                          >
                            <img src={img} alt={`Gallery ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                            
                            <div className="relative z-10 flex justify-between items-start">
                              {isPrimary ? (
                                <span className="rounded bg-[#ff6b00] text-black text-[9px] font-extrabold px-1.5 py-0.5">
                                  PRIMARY
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(img)}
                                  className="rounded bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Set Primary
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setGalleryImages((prev) => prev.filter((_, i) => i !== index));
                                  if (primaryImage === img) {
                                    setPrimaryImage(galleryImages.find((_, i) => i !== index) || "");
                                  }
                                }}
                                className="h-6 w-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            <span className="relative z-10 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white/80 w-fit">
                              Image #{index + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. COLORS CONFIGURATION */}
                {studioTab === "colors" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                        Add Product Color
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Light Grey, Navy Blue)"
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

                    {/* Active Colors List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {colorOptions.map((c, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-8 w-8 rounded-full border-2 border-white/20 shadow-md shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{c.name}</p>
                              <p className="text-[10px] font-mono text-white/40">HEX: {c.hex} · SKU: {c.skuCode || c.name.slice(0, 3)}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setColorOptions((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-white/30 hover:text-red-400 p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
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
                  <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 max-w-4xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#ff6b00] mb-4 flex items-center gap-2">
                      <Eye size={15} /> Live Customer Storefront Preview
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10 relative">
                        <img
                          src={primaryImage || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                        {badge && (
                          <span className="absolute top-4 left-4 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold text-[#ff6b00] border border-[#ff6b00]/30">
                            {badge}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-[#ff6b00] uppercase">
                            {brand} · {category}
                          </p>
                          <h3 className="text-2xl font-light text-white mt-1 mb-2">{name || "Product Title"}</h3>
                          
                          <div className="flex items-baseline gap-3 my-4">
                            <span className="text-3xl font-bold text-white">₹{Number(basePrice || 0).toLocaleString()}</span>
                            {baseOriginalPrice && Number(baseOriginalPrice) > Number(basePrice) && (
                              <span className="text-base text-white/30 line-through">
                                ₹{Number(baseOriginalPrice).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="space-y-4 my-6">
                            <div>
                              <p className="text-xs text-white/50 uppercase font-semibold mb-2">Available Colors:</p>
                              <div className="flex gap-2">
                                {colorOptions.map((c) => (
                                  <div key={c.name} className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs">
                                    <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                    <span>{c.name}</span>
                                  </div>
                                ))}
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
