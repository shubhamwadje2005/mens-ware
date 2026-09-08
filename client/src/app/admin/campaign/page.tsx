"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  Campaign,
} from "@/redux/api/campaign.api";
import { Plus, Edit2, Trash2, X, Save, CheckCircle2, Eye, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminCampaignPage() {
  const { data, isLoading } = useGetAllCampaignsQuery();
  const campaigns = data?.campaigns || [];

  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    subtitle: "Campaign 2026",
    titleLine1: "BEYOND",
    titleLine2: "Ordinary",
    description:
      "Where convention ends, creativity begins. Our latest campaign captures the essence of those who dare to stand apart.",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
    buttonText: "View Campaign",
    buttonLink: "/collections",
    isActive: true,
  });

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingCampaign(null);
    setForm({
      subtitle: "Campaign 2026",
      titleLine1: "BEYOND",
      titleLine2: "Ordinary",
      description:
        "Where convention ends, creativity begins. Our latest campaign captures the essence of those who dare to stand apart.",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
      buttonText: "View Campaign",
      buttonLink: "/collections",
      isActive: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setForm({
      subtitle: camp.subtitle || "Campaign 2026",
      titleLine1: camp.titleLine1 || "BEYOND",
      titleLine2: camp.titleLine2 || "Ordinary",
      description: camp.description || "",
      image: camp.image || "",
      buttonText: camp.buttonText || "View Campaign",
      buttonLink: camp.buttonLink || "/collections",
      isActive: camp.isActive,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.titleLine1.trim()) {
      setError("Heading Line 1 is required");
      return;
    }
    if (!form.image.trim()) {
      setError("Image URL is required");
      return;
    }

    try {
      if (editingCampaign) {
        await updateCampaign({
          id: editingCampaign._id,
          data: form,
        }).unwrap();
        showNotification("Campaign updated successfully!");
      } else {
        await createCampaign(form).unwrap();
        showNotification("New campaign created successfully!");
      }
      setShowModal(false);
    } catch (err: any) {
      console.error("Save campaign error:", err);
      setError(err?.data?.message || "Failed to save campaign.");
    }
  };

  const handleToggleActive = async (camp: Campaign) => {
    try {
      await updateCampaign({
        id: camp._id,
        data: { isActive: !camp.isActive },
      }).unwrap();
      showNotification(`Campaign set to ${!camp.isActive ? "Active" : "Inactive"}`);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to update campaign status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign banner?")) return;
    try {
      await deleteCampaign(id).unwrap();
      showNotification("Campaign deleted successfully");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete campaign.");
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Sparkles className="text-[#ff6b00]" size={26} />
            Campaign Banner Manager
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Customize the editorial hero campaign section on the homepage with custom photos, titles, and buttons.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-pill btn-pill-gold flex items-center justify-center gap-2 self-start"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-white/20" />
          <h3 className="text-lg font-medium text-white">No campaigns found</h3>
          <p className="mt-1 text-sm text-white/40">
            Create your first campaign to customize the homepage banner.
          </p>
          <button
            onClick={openAddModal}
            className="btn-pill btn-pill-gold mt-6 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campaigns.map((camp) => (
            <div
              key={camp._id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                camp.isActive
                  ? "border-[#ff6b00]/60 bg-[#121212] shadow-[0_10px_35px_rgba(255,107,0,0.15)]"
                  : "border-white/[0.08] bg-[#0a0a0a]"
              }`}
            >
              {/* Preview Banner */}
              <div className="relative h-56 w-full overflow-hidden sm:h-64">
                <img
                  src={camp.image}
                  alt={camp.titleLine1}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Overlay Text Preview */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="mb-1 text-[9px] font-bold tracking-[0.3em] text-[#ff6b00] uppercase sm:text-[10px]">
                    {camp.subtitle}
                  </span>
                  <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
                    {camp.titleLine1} <span className="italic bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">{camp.titleLine2}</span>
                  </h2>
                  <p className="mt-2 line-clamp-2 max-w-md text-xs text-white/70">
                    {camp.description}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    {camp.buttonText}
                  </span>
                </div>

                {/* Active Badge */}
                <div className="absolute top-4 left-4">
                  {camp.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live on Homepage
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-medium text-white/60 backdrop-blur-md">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(camp)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    camp.isActive
                      ? "border border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
                      : "bg-[#ff6b00] text-black hover:bg-[#ff7a1a]"
                  }`}
                >
                  {camp.isActive ? "Deactivate" : "Set as Live"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(camp)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
                    title="Edit Campaign"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(camp._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                    title="Delete Campaign"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add / Edit Campaign */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl sm:p-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingCampaign ? "Edit Campaign Banner" : "Create New Campaign Banner"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Live Preview Box in Modal */}
              <div className="mb-6 rounded-xl border border-white/10 bg-black/60 p-4">
                <p className="mb-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Live Banner Preview
                </p>
                <div className="relative h-44 w-full overflow-hidden rounded-lg">
                  <img
                    src={form.image || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[9px] font-bold tracking-[0.3em] text-[#ff6b00] uppercase">
                      {form.subtitle || "Campaign"}
                    </span>
                    <h3 className="text-xl font-light text-white sm:text-2xl">
                      {form.titleLine1 || "TITLE"}{" "}
                      <span className="italic bg-gradient-to-r from-[#ffa048] via-[#ff6b00] to-[#c2410c] bg-clip-text text-transparent">
                        {form.titleLine2 || "Subtext"}
                      </span>
                    </h3>
                    <p className="mt-1 line-clamp-1 max-w-sm text-[11px] text-white/70">
                      {form.description}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[9px] font-bold text-black">
                      {form.buttonText || "Button"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Subtitle / Label
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="e.g. Campaign 2026"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Heading Line 1 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.titleLine1}
                      onChange={(e) => setForm({ ...form, titleLine1: e.target.value })}
                      placeholder="e.g. BEYOND"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Heading Line 2 (Orange Gradient)
                    </label>
                    <input
                      type="text"
                      value={form.titleLine2}
                      onChange={(e) => setForm({ ...form, titleLine2: e.target.value })}
                      placeholder="e.g. Ordinary"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Background Image URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/70">
                    Campaign Narrative / Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Where convention ends, creativity begins..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={form.buttonText}
                      onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      placeholder="e.g. View Campaign"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Button Link / Destination
                    </label>
                    <input
                      type="text"
                      value={form.buttonLink}
                      onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                      placeholder="e.g. /collections or /shop"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#ff6b00] focus:ring-[#ff6b00]"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs font-medium text-white/80 cursor-pointer">
                    Set this campaign as active on the homepage immediately
                  </label>
                </div>

                {/* Submit / Cancel */}
                <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-5 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="btn-pill btn-pill-gold flex items-center gap-2"
                  >
                    {isCreating || isUpdating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{editingCampaign ? "Update Campaign" : "Publish Campaign"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
