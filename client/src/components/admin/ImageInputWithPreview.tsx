"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Link2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { processAndOptimizeImageFile } from "@/utils/imageOptimizer";

export interface ImageInputWithPreviewProps {
  label?: string;
  value?: string;
  onChange?: (url: string) => void;
  // Multiple photos support
  multiple?: boolean;
  values?: string[];
  onChangeMultiple?: (urls: string[]) => void;
  placeholder?: string;
  aspectRatio?: "16/9" | "3/4" | "4/3" | "1/1" | "21/9";
  required?: boolean;
  helpText?: string;
}

export default function ImageInputWithPreview({
  label = "Image",
  value = "",
  onChange,
  multiple = false,
  values = [],
  onChangeMultiple,
  placeholder = "https://images.unsplash.com/...",
  aspectRatio = "3/4",
  required = false,
  helpText,
}: ImageInputWithPreviewProps) {
  const [activeMode, setActiveMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For cursor scrub preview
  const [previewActiveIndex, setPreviewActiveIndex] = useState(0);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const aspectClass = {
    "16/9": "aspect-[16/9]",
    "3/4": "aspect-[3/4]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "21/9": "aspect-[21/9]",
  }[aspectRatio];

  const currentList = multiple ? values : value ? [value] : [];

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    const fileList = Array.from(files);
    const loadedBase64s: string[] = [];

    try {
      for (const file of fileList) {
        try {
          const optimized = await processAndOptimizeImageFile(file);
          loadedBase64s.push(optimized);
        } catch (err: any) {
          console.warn(err);
        }
      }

      if (loadedBase64s.length > 0) {
        if (multiple && onChangeMultiple) {
          onChangeMultiple([...values, ...loadedBase64s]);
        } else if (onChange && loadedBase64s.length > 0) {
          onChange(loadedBase64s[0]);
        }
      } else {
        setErrorMessage("Could not read image(s). Please choose valid JPG, PNG, or WEBP photos.");
      }
    } catch {
      setErrorMessage("Error reading image files. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an image URL.");
      return;
    }

    // Support comma or newline separated multiple URLs
    const splitUrls = trimmed
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (splitUrls.length === 0) return;

    setErrorMessage(null);
    setIsValidating(true);

    // Verify first URL
    const testImg = new Image();
    testImg.onload = () => {
      setIsValidating(false);
      if (multiple && onChangeMultiple) {
        onChangeMultiple([...values, ...splitUrls]);
      } else if (onChange) {
        onChange(splitUrls[0]);
      }
      setUrlInput("");
    };
    testImg.onerror = () => {
      setIsValidating(false);
      setErrorMessage("Cannot load image from this URL. Please verify the URL is public and valid.");
    };
    testImg.src = splitUrls[0];
  };

  const handleRemoveImage = (index: number) => {
    if (multiple && onChangeMultiple) {
      const next = values.filter((_, i) => i !== index);
      onChangeMultiple(next);
      if (previewActiveIndex >= next.length) {
        setPreviewActiveIndex(Math.max(0, next.length - 1));
      }
    } else if (onChange) {
      onChange("");
    }
  };

  const handleSetPrimary = (index: number) => {
    if (!multiple || !onChangeMultiple || index === 0) return;
    const selected = values[index];
    const rest = values.filter((_, i) => i !== index);
    onChangeMultiple([selected, ...rest]);
    setPreviewActiveIndex(0);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    if (!multiple || !onChangeMultiple) return;
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= values.length) return;
    const next = [...values];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChangeMultiple(next);
  };

  // Cursor scrub handler for the interactive preview box
  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewBoxRef.current || currentList.length <= 1) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (width <= 0) return;
    const segment = Math.min(
      Math.max(0, Math.floor((x / width) * currentList.length)),
      currentList.length - 1
    );
    if (segment !== previewActiveIndex) {
      setPreviewActiveIndex(segment);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50">
            {label} {required && <span className="text-[#ff6b00]">*</span>}
          </label>
          {multiple && (
            <span className="text-[10px] text-[#ff6b00] font-medium">
              ({values.length} {values.length === 1 ? "Photo" : "Photos"} added)
            </span>
          )}
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveMode("upload");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${activeMode === "upload"
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${activeMode === "url"
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
            multiple={multiple}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleDeviceUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#ff6b00]/50 disabled:opacity-60 px-4 py-3.5 text-xs font-semibold text-white/80 hover:text-white transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#ff6b00]" />
                <span>Processing & optimizing photos...</span>
              </>
            ) : (
              <>
                <Upload size={15} className="text-[#ff6b00]" />
                <span>
                  {multiple
                    ? "Click to select multiple photos from device (JPG, PNG, WEBP)"
                    : "Click to select image from device (JPG, PNG, WEBP)"}
                </span>
              </>
            )}
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
            placeholder={multiple ? "Paste image URL(s) - separated by comma or newline" : placeholder}
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
                <Check size={13} /> {multiple ? "Add Photo(s)" : "Apply URL"}
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

      {/* MULTIPLE PHOTOS MODE */}
      {multiple ? (
        <div className="space-y-4">
          {/* Interactive Cursor Scrub Preview (When 2+ photos exist) */}
          {currentList.length > 0 && (
            <div className="rounded-2xl border border-[#ff6b00]/25 bg-[#ff6b00]/[0.03] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles size={13} className="text-[#ff6b00]" />
                  <span>Cursor Scrubbing Preview</span>
                </div>
                <span className="text-[10px] font-mono text-[#ff6b00] bg-[#ff6b00]/10 px-2.5 py-0.5 rounded-full border border-[#ff6b00]/20">
                  {previewActiveIndex + 1} / {currentList.length} Photos
                </span>
              </div>
              <p className="text-[11px] text-white/40">
                Move your mouse cursor across the photo box below to test how photos change on customer hover:
              </p>

              {/* Cursor Box */}
              <div
                ref={previewBoxRef}
                data-overlay="true"
                onMouseMove={handlePreviewMouseMove}
                onMouseLeave={() => setPreviewActiveIndex(0)}
                className={`preserve-white relative ${aspectClass} max-h-72 w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-white/20 bg-black cursor-crosshair select-none shadow-xl`}
              >
                <img
                  src={currentList[previewActiveIndex] || currentList[0]}
                  alt={`Photo ${previewActiveIndex + 1}`}
                  className="h-full w-full object-cover transition-all duration-200"
                />

                {/* Top Segment Dash Bars */}
                {currentList.length > 1 && (
                  <div className="absolute top-2.5 left-3 right-3 z-10 flex gap-1 items-center pointer-events-none">
                    {currentList.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-150 ${i === previewActiveIndex
                            ? "bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.8)] scale-y-125"
                            : "bg-white/40 backdrop-blur-sm"
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Counter Pill */}
                {currentList.length > 1 && (
                  <div
                    style={{ color: "#ffffff" }}
                    className="admin-badge-counter absolute top-5 right-2.5 z-10 rounded-full bg-black/85 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold pointer-events-none text-white"
                  >
                    <span style={{ color: "#ff6b00" }} className="text-[#ff6b00] font-bold">{previewActiveIndex + 1}</span> / <span style={{ color: "#ffffff" }} className="text-white font-bold">{currentList.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos Management Grid */}
          {values.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                Manage Photos (Drag / Star Primary / Reorder)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {values.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    data-overlay="true"
                    className={`preserve-white group relative rounded-xl overflow-hidden border-2 bg-[#0c0c0c] aspect-[3/4] p-2 flex flex-col justify-between transition-all ${idx === 0
                        ? "border-[#ff6b00] ring-2 ring-[#ff6b00]/30"
                        : "border-white/10 hover:border-white/30"
                      }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Item ${idx + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Top action row */}
                    <div className="relative z-10 flex items-start justify-between">
                      {idx === 0 ? (
                        <span
                          style={{ color: "#000000" }}
                          className="rounded-lg bg-[#ff6b00] text-[9px] font-extrabold px-2 py-1 flex items-center gap-1 shadow-lg border border-black/10 text-black"
                        >
                          <Star size={10} className="fill-black" color="#000000" /> PRIMARY
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          style={{ color: "#ffffff" }}
                          className="admin-badge-dark rounded-lg bg-black/85 backdrop-blur-md hover:text-[#ff6b00] hover:bg-black text-[9px] font-bold px-2 py-1 border border-white/20 opacity-0 group-hover:opacity-100 transition-all shadow-lg text-white"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ color: "#ffffff" }}
                        className="h-6 w-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20 active:scale-90"
                        title="Delete photo"
                      >
                        <X size={12} color="#ffffff" className="text-white" />
                      </button>
                    </div>

                    {/* Bottom reorder row */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span
                        style={{ color: "#ffffff" }}
                        className="admin-badge-dark text-[9px] font-mono font-bold bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 shadow text-white"
                      >
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "left")}
                            style={{ color: "#ffffff" }}
                            className="admin-badge-dark h-6 w-6 rounded-lg bg-black/85 backdrop-blur-md hover:bg-[#ff6b00] hover:text-black border border-white/20 text-[10px] transition-all active:scale-90 shadow flex items-center justify-center text-white"
                            title="Move Left"
                          >
                            <ChevronLeft size={12} color="#ffffff" className="text-white" />
                          </button>
                        )}
                        {idx < values.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "right")}
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
                ))}
              </div>
            </div>
          ) : (
            <div className={`w-full ${aspectClass} max-h-48 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-white/30 text-xs`}>
              <ImageIcon size={24} className="mb-1.5 opacity-40" />
              <span>No photos added yet</span>
            </div>
          )}
        </div>
      ) : (
        /* SINGLE PHOTO MODE (LEGACY) */
        <div>
          {value ? (
            <div className="relative group rounded-xl overflow-hidden border border-white/15 bg-black/40">
              <div className={`w-full ${aspectClass} overflow-hidden bg-black flex items-center justify-center`}>
                <img src={value} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => onChange && onChange("")}
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
        </div>
      )}

      {helpText && <p className="text-[10px] text-white/40">{helpText}</p>}
    </div>
  );
}
