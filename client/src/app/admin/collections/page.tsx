"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from "@/redux/api/collection.api";
import { Collection } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Layers,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminCollectionsPage() {
  const { data: collections = [], isLoading } = useGetAllCollectionsQuery();
  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "SS 2026",
    description: "",
    image: "",
    link: "/shop",
    isActive: true,
    order: 0,
  });

  const openAdd = () => {
    setEditingCollection(null);
    setForm({
      title: "",
      subtitle: "SS 2026",
      description: "",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
      link: "/shop",
      isActive: true,
      order: collections.length + 1,
    });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (c: Collection) => {
    setEditingCollection(c);
    setForm({
      title: c.title,
      subtitle: c.subtitle || "SS 2026",
      description: c.description || "",
      image: c.image,
      link: c.link || "/shop",
      isActive: c.isActive !== false,
      order: c.order || 0,
    });
    setError(null);
    setShowModal(true);
  };

  const handleToggleActive = async (c: Collection) => {
    const cId = c._id || c.id;
    if (!cId) return;
    setTogglingId(cId);
    try {
      await updateCollection({
        id: cId,
        data: { isActive: !c.isActive },
      }).unwrap();
    } catch (err: any) {
      console.error("Failed to toggle collection status:", err);
      alert(err?.data?.message || "Failed to update collection status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this collection? It will be removed from the store collections page.")) {
      try {
        await deleteCollection(id).unwrap();
      } catch (err: any) {
        console.error("Failed to delete collection:", err);
        alert(err?.data?.message || "Failed to delete collection.");
      }
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!form.title.trim() || !form.image.trim()) {
      setError("Collection Title and Image URL are required.");
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        link: form.link.trim() || "/shop",
        isActive: form.isActive,
        order: Number(form.order) || 0,
      };

      if (editingCollection) {
        const id = editingCollection._id || editingCollection.id;
        if (!id) return;
        await updateCollection({ id, data: payload }).unwrap();
      } else {
        await createCollection(payload).unwrap();
      }
      setShowModal(false);
    } catch (err: any) {
      console.error("Failed to save collection:", err);
      setError(err?.data?.message || "Failed to save collection.");
    }
  };

  const activeCount = collections.filter((c) => c.isActive !== false).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Layers className="text-[#ff6b00]" size={24} /> Collections Management
          </h1>
          <p className="text-sm text-white/40">
            Manage featured seasonal collections displayed on the storefront collections page ({activeCount} active of {collections.length} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/collections"
            target="_blank"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={13} /> View Live Page
          </Link>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-xs font-bold tracking-[0.1em] text-black uppercase hover:bg-[#ff7a1a] transition-colors shadow-lg"
          >
            <Plus size={14} /> Add Collection
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#ff6b00]" />
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] py-20 text-center">
          <Sparkles size={48} className="mx-auto mb-3 text-white/20" />
          <p className="text-base text-white/50 mb-2">No collections added yet</p>
          <p className="text-xs text-white/30 mb-6">Create your first featured seasonal collection to showcase on the website</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-xs font-bold uppercase text-black"
          >
            <Plus size={14} /> Add First Collection
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((col, idx) => {
            const cId = col._id || col.id;
            const isTogglingThis = togglingId === cId;
            const isActive = col.isActive !== false;

            return (
              <motion.div
                key={cId || idx}
                className={`relative overflow-hidden rounded-2xl border bg-[#0c0c0c] transition-all duration-300 shadow-xl ${
                  isActive ? "border-white/[0.08]" : "border-red-500/20 opacity-75"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                {/* Image Banner */}
                <div className="preserve-white relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Top Status & Order Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold text-white uppercase backdrop-blur-md border border-white/10">
                      Order #{col.order || idx + 1}
                    </span>

                    <button
                      onClick={() => handleToggleActive(col)}
                      disabled={isTogglingThis}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase backdrop-blur-md transition-all border ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                      title={isActive ? "Click to disable collection" : "Click to activate collection"}
                    >
                      {isTogglingThis ? (
                        <Loader2 size={11} className="animate-spin text-[#ff6b00]" />
                      ) : (
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-amber-400"}`} />
                      )}
                      <span>{isActive ? "Active in Store" : "Disabled"}</span>
                    </button>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff6b00] mb-1">
                      {col.subtitle || "Season"}
                    </p>
                    <h3 className="text-2xl font-light text-white sm:text-3xl mb-1">
                      {col.title}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-2">
                      {col.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Card Controls & Details Bar */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border-t border-white/[0.04]">
                  <div className="text-xs text-white/40 flex items-center gap-1">
                    <span>Target Link:</span>
                    <span className="text-white/80 font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded">
                      {col.link || "/shop"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(col)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/10"
                    >
                      <Edit2 size={13} className="text-[#ff6b00]" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cId)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/20"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
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
              className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-[#ff6b00]" />
                  {editingCollection ? "Edit Collection" : "Add New Collection"}
                </h2>
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
                {/* Live Image Preview */}
                {form.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black border border-white/10">
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[10px] font-bold text-[#ff6b00] uppercase tracking-wider">{form.subtitle || "Subtitle"}</p>
                      <p className="text-lg font-bold text-white">{form.title || "Collection Title Preview"}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Collection Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      placeholder="e.g. Shadow Realm"
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Subtitle / Season
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      placeholder="e.g. SS 2026 or FW 2025"
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Target Link
                    </label>
                    <input
                      type="text"
                      value={form.link}
                      placeholder="/shop or /shop?category=..."
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={form.order}
                      placeholder="1"
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Where darkness meets elegance..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors resize-none"
                  />
                </div>

                {/* Active Toggle Selector */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Storefront Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: true })}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold uppercase transition-all border ${
                        form.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm"
                          : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 size={14} /> Active on Website
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: false })}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold uppercase transition-all border ${
                        !form.isActive
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                          : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                      }`}
                    >
                      <XCircle size={14} /> Hidden / Disabled
                    </button>
                  </div>
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
                  disabled={isCreating || isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#ff7a1a] transition-all disabled:opacity-50"
                >
                  <Save size={14} /> {editingCollection ? "Update Collection" : "Save Collection"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
