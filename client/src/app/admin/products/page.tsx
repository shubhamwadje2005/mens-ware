"use client";

import { useState } from "react";
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
import { Product } from "@/types";
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
  XCircle,
  Power,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
  const { data: productList = [], isLoading } = useGetProductsQuery();
  const { data: deletedProducts = [], isLoading: isLoadingDeleted } = useGetDeletedProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [restoreProduct] = useRestoreProductMutation();
  const [toggleProductAvailability, { isLoading: isToggling }] = useToggleProductAvailabilityMutation();

  const [activeTab, setActiveTab] = useState<"all" | "available" | "unavailable" | "deleted">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    image: "",
    hoverImage: "",
    colors: "",
    sizes: "",
    stock: "50",
    slug: "",
    badge: "",
    description: "",
    isAvailable: true,
  });

  const availableCount = productList.filter((p) => p.isAvailable !== false).length;
  const unavailableCount = productList.filter((p) => p.isAvailable === false).length;

  let currentProducts: Product[] = [];
  if (activeTab === "deleted") {
    currentProducts = deletedProducts;
  } else if (activeTab === "available") {
    currentProducts = productList.filter((p) => p.isAvailable !== false);
  } else if (activeTab === "unavailable") {
    currentProducts = productList.filter((p) => p.isAvailable === false);
  } else {
    currentProducts = productList;
  }

  const filtered = currentProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleAvailability = async (p: Product) => {
    const pId = p._id || p.id;
    const nextStatus = p.isAvailable === false ? true : false;
    setTogglingId(pId);
    try {
      await toggleProductAvailability({ id: pId, isAvailable: nextStatus }).unwrap();
    } catch (err: any) {
      console.error("Failed to toggle availability:", err);
      alert(err?.data?.message || "Failed to toggle product availability.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id).unwrap();
    } catch (err: any) {
      console.error("Failed to restore product:", err);
      alert(err?.data?.message || "Failed to restore product.");
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      image: "",
      hoverImage: "",
      colors: "#000000, #1A1A1A",
      sizes: "28, 30, 32, 34, 36",
      stock: "50",
      slug: "",
      badge: "",
      description: "",
      isAvailable: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      category: p.category,
      image: p.image,
      hoverImage: p.hoverImage || "",
      colors: p.colors && p.colors.length > 0 ? p.colors.join(", ") : "#000000",
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes.join(", ") : "S, M, L, XL",
      stock: p.stock !== undefined ? String(p.stock) : "50",
      slug: p.slug,
      badge: p.badge || "",
      description: p.description || "",
      isAvailable: p.isAvailable !== false,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name || !form.price || !form.category) {
      setError("Name, Price, and Category are required.");
      return;
    }
    try {
      const validBadges = ["NEW", "SALE", "PREMIUM", "LIMITED"];
      const formattedBadge = validBadges.includes(form.badge?.toUpperCase()) ? form.badge.toUpperCase() : undefined;
      const generatedSlug = form.slug
        ? form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        : form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      const colorsArray = form.colors
        ? form.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : ["#000000"];

      const sizesArray = form.sizes
        ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : ["S", "M", "L", "XL"];

      const productData = {
        name: form.name.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category.trim(),
        image: form.image.trim() || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop",
        hoverImage: form.hoverImage.trim() || undefined,
        colors: colorsArray,
        sizes: sizesArray,
        stock: form.stock ? Number(form.stock) : 50,
        slug: generatedSlug,
        badge: formattedBadge,
        description: form.description?.trim() || undefined,
        isAvailable: form.isAvailable,
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct._id || editingProduct.id, data: productData }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }
      setShowModal(false);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to save product. Please check your inputs or login status.";
      setError(errMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? It will be removed from the store for users.")) {
      try {
        await deleteProduct(id).unwrap();
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        alert(err?.data?.message || "Failed to delete product.");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products Management</h1>
          <p className="text-sm text-white/40">
            {activeTab === "all" && `Total ${productList.length} products (${availableCount} available, ${unavailableCount} unavailable)`}
            {activeTab === "available" && `${availableCount} available products in store`}
            {activeTab === "unavailable" && `${unavailableCount} disabled / out of stock products`}
            {activeTab === "deleted" && `${deletedProducts.length} deleted products in history`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/5 p-1 border border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-[#ff6b00] text-black shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              All ({productList.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "available"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <CheckCircle2 size={12} /> Available ({availableCount})
            </button>
            <button
              onClick={() => setActiveTab("unavailable")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "unavailable"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <XCircle size={12} /> Not Available ({unavailableCount})
            </button>
            <button
              onClick={() => setActiveTab("deleted")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "deleted"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trash2 size={12} /> Deleted ({deletedProducts.length})
            </button>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-xs font-bold tracking-[0.1em] text-black uppercase hover:bg-[#ff7a1a] transition-colors shadow-lg"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search products by name, category or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
        />
      </div>

      {/* Loading */}
      {(isLoading || isLoadingDeleted) && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#ff6b00]" />
        </div>
      )}

      {/* Table */}
      {!isLoading && !isLoadingDeleted && filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] py-16 text-center">
          <Package size={40} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30">
            {activeTab === "deleted"
              ? "No deleted products in history"
              : activeTab === "unavailable"
              ? "No unavailable / disabled products"
              : "No products found"}
          </p>
        </div>
      ) : !isLoading && !isLoadingDeleted && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Product</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Category</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Price & Stock</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Store Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Sizes & Colors</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Badge</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((p) => {
                  const pId = p._id || p.id;
                  const isAvailable = p.isAvailable !== false;
                  const isCurrentlyToggling = togglingId === pId;

                  return (
                    <tr
                      key={pId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !isAvailable && activeTab !== "deleted" ? "bg-red-500/[0.015]" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10">
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-red-400 uppercase">OFF</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white flex items-center gap-1.5">
                              {p.name}
                              {!isAvailable && (
                                <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[9px] font-bold text-red-300 border border-red-500/30">
                                  Not Available
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-white/30">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-white/50">{p.category}</td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="text-xs font-bold text-white">${p.price}</span>
                          {p.originalPrice && (
                            <span className="ml-1 text-[10px] text-white/20 line-through">${p.originalPrice}</span>
                          )}
                          <p className="text-[10px] text-white/40">Stock: {p.stock ?? 50}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {activeTab !== "deleted" ? (
                          <button
                            onClick={() => handleToggleAvailability(p)}
                            disabled={isCurrentlyToggling}
                            className={`group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-300 border ${
                              isAvailable
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                            }`}
                            title={isAvailable ? "Click to disable / mark Not Available" : "Click to enable / mark Available"}
                          >
                            {isCurrentlyToggling ? (
                              <Loader2 size={12} className="animate-spin text-[#ff6b00]" />
                            ) : (
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isAvailable ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                                }`}
                              />
                            )}
                            <span>{isAvailable ? "Available" : "Not Available"}</span>
                            <span className="text-[9px] text-white/20 group-hover:text-white/60 transition-colors">
                              (Toggle)
                            </span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-red-400 font-bold uppercase">Deleted</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-1">
                          {p.sizes && p.sizes.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {p.sizes.map((s, idx) => (
                                <span key={idx} className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {p.colors && p.colors.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {p.colors.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="h-3 w-3 rounded-full border border-white/20"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {p.badge ? (
                          <span className="rounded-full bg-[#ff6b00]/10 px-2 py-0.5 text-[10px] font-bold text-[#ff6b00] border border-[#ff6b00]/20">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/20">--</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {activeTab !== "deleted" ? (
                            <>
                              <Link
                                href={`/product/${p.slug}`}
                                target="_blank"
                                className="rounded p-1 text-white/40 hover:text-white transition-colors"
                                title="View Product Page"
                              >
                                <Eye size={14} />
                              </Link>
                              <button
                                onClick={() => openEdit(p)}
                                className="rounded p-1 text-white/40 hover:text-[#ff6b00] transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(pId)}
                                className="rounded p-1 text-white/40 hover:text-red-400 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestore(pId)}
                              className="rounded-lg px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                              title="Restore Product to Store"
                            >
                              <RotateCcw size={12} /> Restore
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Availability Selector Banner */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Store Availability & Status *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isAvailable: true })}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold uppercase transition-all border ${
                        form.isAvailable
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm"
                          : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 size={14} /> Available in Store
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isAvailable: false })}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold uppercase transition-all border ${
                        !form.isAvailable
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                          : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                      }`}
                    >
                      <XCircle size={14} /> Not Available / Disabled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    placeholder="e.g. Noir Silk Shirt"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Price ($) *</label>
                    <input
                      type="number"
                      value={form.price}
                      placeholder="195"
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Original Price</label>
                    <input
                      type="number"
                      value={form.originalPrice}
                      placeholder="240"
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      placeholder="50"
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Category *</label>
                    <input
                      type="text"
                      value={form.category}
                      placeholder="e.g. Formal Pants"
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Badge</label>
                    <select
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    >
                      <option value="">None</option>
                      <option value="NEW">NEW</option>
                      <option value="SALE">SALE</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="LIMITED">LIMITED</option>
                    </select>
                  </div>
                </div>

                {/* Sizes and Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Sizes <span className="text-white/20">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={form.sizes}
                      placeholder="28, 30, 32, 34, 36 or S, M, L, XL"
                      onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Colors <span className="text-white/20">(hex/name, comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={form.colors}
                      placeholder="#000000, #1A1A1A, #ffffff"
                      onChange={(e) => setForm({ ...form, colors: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Main Image URL</label>
                    <input
                      type="text"
                      value={form.image}
                      placeholder="https://..."
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Hover Image URL (optional)</label>
                    <input
                      type="text"
                      value={form.hoverImage}
                      placeholder="https://..."
                      onChange={(e) => setForm({ ...form, hoverImage: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Slug (optional)</label>
                    <input
                      type="text"
                      value={form.slug}
                      placeholder="auto-generated from product name"
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-full border border-white/10 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#ff7a1a] transition-all"
                >
                  <Save size={14} /> {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
