"use client";

import React, { useState, useRef } from "react";
import { Upload, Link2, X, Check, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageInputWithPreviewProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  aspectRatio?: "16/9" | "3/4" | "4/3" | "1/1" | "21/9";
  required?: boolean;
  helpText?: string;
}

export default function ImageInputWithPreview({
  label = "Image",
  value,
  onChange,
  placeholder = "https://images.unsplash.com/...",
  aspectRatio = "16/9",
  required = false,
  helpText,
}: ImageInputWithPreviewProps) {
  const [activeMode, setActiveMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    "16/9": "aspect-[16/9]",
    "3/4": "aspect-[3/4]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "21/9": "aspect-[21/9]",
  }[aspectRatio];

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size should be less than 10MB.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result as string;
      if (base64) {
        onChange(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an image URL.");
      return;
    }

    setErrorMessage(null);
    setIsValidating(true);

    const testImg = new Image();
    testImg.onload = () => {
      setIsValidating(false);
      onChange(trimmed);
      setUrlInput("");
    };
    testImg.onerror = () => {
      setIsValidating(false);
      setErrorMessage("Cannot load image from this URL. Please verify the URL is public and valid.");
    };
    testImg.src = trimmed;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50">
          {label} {required && <span className="text-[#ff6b00]">*</span>}
        </label>
        
        {/* Toggle Mode Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveMode("upload");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activeMode === "upload"
                ? "bg-[#ff6b00] text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Upload size={11} /> Upload Device
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("url");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activeMode === "url"
                ? "bg-[#ff6b00] text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Link2 size={11} /> Image URL
          </button>
        </div>
      </div>

      {/* Mode 1: Device File Upload */}
      {activeMode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleDeviceUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#ff6b00]/50 px-4 py-3.5 text-xs font-semibold text-white/80 hover:text-white transition-all"
          >
            <Upload size={15} className="text-[#ff6b00]" />
            <span>Click to select image from your device (JPG, PNG, WEBP)</span>
          </button>
        </div>
      )}

      {/* Mode 2: Image URL Input */}
      {activeMode === "url" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setErrorMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#ff6b00]/60 transition-colors placeholder:text-white/20"
          />
          <button
            type="button"
            disabled={isValidating || !urlInput.trim()}
            onClick={handleAddUrl}
            className="rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 px-4 py-2.5 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
          >
            {isValidating ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <Check size={13} /> Apply URL
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          <AlertCircle size={13} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Card */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/15 bg-black/40">
          <div className={`w-full ${aspectClass} overflow-hidden bg-black flex items-center justify-center`}>
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all"
            >
              <X size={13} /> Remove Image
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-mono text-white/80 border border-white/10">
              {value.startsWith("data:") ? "Device Upload" : "Web URL"}
            </span>
          </div>
        </div>
      ) : (
        <div className={`w-full ${aspectClass} rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-white/30 text-xs`}>
          <ImageIcon size={24} className="mb-1.5 opacity-40" />
          <span>No image selected yet</span>
        </div>
      )}

      {helpText && <p className="text-[10px] text-white/40">{helpText}</p>}
    </div>
  );
}
