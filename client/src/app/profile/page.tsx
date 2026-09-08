"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types";
import {
  User as UserIcon,
  MapPin,
  Package,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  Camera,
  Upload,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Edit2,
  X,
} from "lucide-react";

const SmoothScrollProvider = dynamic(() => import("@/components/layout/SmoothScrollProvider"), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/cursor/CursorFollower"), { ssr: false });
const Navbar = dynamic(() => import("@/components/navbar/Navbar"));
const Footer = dynamic(() => import("@/components/footer/Footer"));
const ToastContainer = dynamic(() => import("@/components/toast/ToastContainer"));
const SearchModal = dynamic(() => import("@/components/search/SearchModal"));

function ProfileContent() {
  const { user, isAuthenticated, updateProfile, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isRequired = searchParams.get("required") === "true";
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "addresses" || isRequired) {
      setActiveTab("addresses");
      if (isRequired && (!user?.addresses || user.addresses.length === 0)) {
        setShowAddressModal(true);
      }
    }
  }, [searchParams, isRequired, user]);

  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address editing state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
    setPassword("");
    setProfileError(null);
    setIsEditing(false);
  };

  const handleOpenAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddressClick = (addr: Address) => {
    const addrId = addr._id || addr.id || "";
    setEditingAddressId(addrId);
    setAddressForm({
      name: addr.name || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            setAvatar(compressed);
          }
        };
        if (typeof reader.result === "string") {
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // New Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  if (!isAuthenticated) {
    return (
      <SmoothScrollProvider>
        <CursorFollower />
        <Navbar />
        <SearchModal />
        <ToastContainer />
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
          <div className="text-center px-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <UserIcon size={64} className="mx-auto mb-6 text-white/10" />
              <h1 className="text-3xl font-light text-white mb-3">Sign In Required</h1>
              <p className="text-white/40 mb-8">Please sign in to manage your profile and saved addresses.</p>
              <Link href="/auth?redirect=/profile" className="btn-pill btn-pill-gold">
                Sign In
              </Link>
            </motion.div>
          </div>
        </main>
      </SmoothScrollProvider>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    const res = await updateProfile({ name, email, phone, avatar, password });
    setSavingProfile(false);

    if (res.success) {
      setPassword("");
      setIsEditing(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } else {
      setProfileError(res.error || "Failed to update profile.");
    }
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }
    setShowAddressModal(false);
    setEditingAddressId(null);
    setAddressForm({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    if (isRequired) {
      setTimeout(() => {
        router.push("/checkout");
      }, 300);
    }
  };

  return (
    <SmoothScrollProvider>
      <CursorFollower />
      <Navbar />
      <SearchModal />
      <ToastContainer />
      <main className="min-h-screen bg-black pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Home
              </Link>
              <h1 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
                My <span className="text-[#ff6b00]">Account</span>
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-white/10 mb-8 pb-3">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "profile"
                    ? "bg-[#ff6b00] text-black shadow-lg"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <UserIcon size={14} /> Personal Profile
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "addresses"
                    ? "bg-[#ff6b00] text-black shadow-lg"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <MapPin size={14} /> Saved Addresses ({user?.addresses?.length || 0})
              </button>
              <Link
                href="/orders"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition-all ml-auto"
              >
                <Package size={14} /> Order History
              </Link>
            </div>

            {/* Tab Content: Profile Settings */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 sm:p-8">
                  {!isEditing ? (
                    /* View Mode */
                    <div>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 pb-8 border-b border-white/[0.06]">
                        <div className="flex h-24 w-24 overflow-hidden items-center justify-center rounded-full bg-[#ff6b00]/10 text-[#ff6b00] border-2 border-[#ff6b00]/40 font-bold text-3xl shadow-xl">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                          ) : user?.name ? (
                            user.name.charAt(0).toUpperCase()
                          ) : (
                            "U"
                          )}
                        </div>

                        <div className="text-center sm:text-left flex-1">
                          <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                          <p className="text-xs text-white/40 mb-3">{user?.email}</p>
                          {user?.role === "admin" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6b00]/10 px-3 py-1 text-xs font-bold text-[#ff6b00] border border-[#ff6b00]/20">
                              <ShieldCheck size={12} /> Admin Account
                            </span>
                          )}
                        </div>
                      </div>

                      {profileSuccess && (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-400 mb-6">
                          <CheckCircle size={16} /> All profile details updated successfully!
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Full Name</p>
                          <p className="text-sm font-medium text-white">{user?.name}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Email Address</p>
                          <p className="text-sm font-medium text-white">{user?.email}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Phone Number</p>
                          <p className="text-sm font-medium text-white">{user?.phone || "Not set"}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Password</p>
                          <p className="text-sm font-medium text-white">••••••••</p>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded-full bg-[#ff6b00] px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#ff7a1a] transition-colors inline-flex items-center gap-2 shadow-lg"
                        >
                          <Edit2 size={15} /> Update Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode */
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white">Update Account Details</h2>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>

                      {/* Avatar & Device Upload Header */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 pb-8 border-b border-white/[0.06]">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                          title="Click to Upload Profile Picture"
                        >
                          <div className="flex h-24 w-24 overflow-hidden items-center justify-center rounded-full bg-[#ff6b00]/10 text-[#ff6b00] border-2 border-[#ff6b00]/40 font-bold text-3xl shadow-xl transition-all group-hover:border-[#ff6b00]">
                            {avatar ? (
                              <img src={avatar} alt={user?.name} className="h-full w-full object-cover" />
                            ) : user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              "U"
                            )}
                          </div>
                          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider gap-1">
                            <Camera size={18} className="text-[#ff6b00]" />
                            Upload
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />

                        <div className="text-center sm:text-left flex-1">
                          <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                          <p className="text-xs text-white/40 mb-3">{user?.email}</p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-4 py-2 text-xs font-bold text-[#ff6b00] hover:bg-[#ff6b00]/20 transition-all shadow-sm"
                            >
                              <Upload size={14} /> Upload Photo from Device
                            </button>
                            {avatar && (
                              <button
                                type="button"
                                onClick={() => setAvatar("")}
                                className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 size={13} /> Remove Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                            Profile Image URL (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/your-photo.jpg"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type="tel"
                              placeholder="e.g. +91 9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                            New Password (Leave blank to keep current password)
                          </label>
                          <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password (min 6 chars)"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-sm text-white outline-none focus:border-[#ff6b00]/50 transition-colors placeholder:text-white/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {profileError && (
                          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
                            <AlertCircle size={16} /> {profileError}
                          </div>
                        )}

                        <div className="pt-4 flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="btn-pill btn-pill-gold inline-flex items-center gap-2"
                          >
                            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white hover:border-white/40 transition-colors inline-flex items-center gap-2"
                          >
                            <X size={15} /> Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab Content: Saved Addresses */}
            {activeTab === "addresses" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {isRequired && (
                  <div className="flex items-center gap-3 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 p-4 text-xs text-[#ff6b00] shadow-lg">
                    <AlertTriangle size={22} className="shrink-0 text-[#ff6b00]" />
                    <div>
                      <p className="font-bold text-sm text-white">Delivery Address Required</p>
                      <p className="text-white/60">Please add your shipping address below before proceeding to complete your order.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Your Delivery Addresses</h2>
                    <p className="text-xs text-white/40">Manage your saved shipping addresses for faster checkout.</p>
                  </div>
                  <button
                    onClick={handleOpenAddAddressModal}
                    className="flex items-center gap-2 rounded-full bg-[#ff6b00] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#ff7a1a] transition-colors"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>

                {!user?.addresses || user.addresses.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] py-16 text-center">
                    <MapPin size={48} className="mx-auto mb-4 text-white/10" />
                    <h3 className="text-lg font-light text-white mb-2">No Saved Addresses</h3>
                    <p className="text-xs text-white/40 mb-6">Add an address to speed up your future orders.</p>
                    <button
                      onClick={handleOpenAddAddressModal}
                      className="btn-pill btn-pill-gold inline-flex items-center gap-2"
                    >
                      <Plus size={16} /> Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => {
                      const addrId = addr._id || addr.id || "";
                      return (
                        <div
                          key={addrId}
                          className={`relative rounded-2xl border p-5 transition-all ${
                            addr.isDefault
                              ? "border-[#ff6b00]/40 bg-[#ff6b00]/[0.02]"
                              : "border-white/[0.08] bg-[#0c0c0c]"
                          }`}
                        >
                          {addr.isDefault && (
                            <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-[#ff6b00]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#ff6b00] border border-[#ff6b00]/20">
                              <CheckCircle size={10} /> DEFAULT ADDRESS
                            </span>
                          )}

                          <h4 className="text-sm font-bold text-white mb-1">{addr.name}</h4>
                          <p className="text-xs text-white/40 mb-3">{addr.phone}</p>
                          <p className="text-xs text-white/70 leading-relaxed mb-4">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
                            <button
                              onClick={() => handleEditAddressClick(addr)}
                              className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b00] hover:underline flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            {!addr.isDefault && (
                              <button
                                onClick={() => setDefaultAddress(addrId)}
                                className="text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={() => removeAddress(addrId)}
                              className="text-[10px] font-bold uppercase tracking-wider text-red-400/70 hover:text-red-400 transition-colors ml-auto flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Add / Edit Address Modal */}
            <AnimatePresence>
              {showAddressModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                  onClick={() => setShowAddressModal(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-2xl text-white space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <h3 className="text-lg font-bold text-white">
                        {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                      </h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-white/40 hover:text-white"
                      >
                        &times;
                      </button>
                    </div>

                    <form onSubmit={handleAddAddressSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                            Recipient Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Mobile Number"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Flat, House no., Building, Street"
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Landmark, Area, Sector"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="6-digit ZIP"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white outline-none focus:border-[#ff6b00]/50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="accent-[#ff6b00]"
                        />
                        <label htmlFor="isDefault" className="text-xs text-white/70">
                          Set as default delivery address
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="px-4 py-2.5 text-xs text-white/50 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-full bg-[#ff6b00] px-5 py-2.5 text-xs font-bold uppercase text-black hover:bg-[#ff7a1a]"
                        >
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center text-white/40">
          Loading profile...
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
