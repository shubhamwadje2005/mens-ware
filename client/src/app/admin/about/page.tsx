"use client";

import { useState, useEffect } from "react";
import {
  useGetAboutAdminQuery,
  useSaveAboutMutation,
  StatItem,
  ValueItem,
} from "@/redux/api/about.api";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  BarChart3,
  HeartHandshake,
} from "lucide-react";

export default function AdminAboutPage() {
  const { data, isLoading, refetch } = useGetAboutAdminQuery();
  const [saveAbout, { isLoading: isSaving }] = useSaveAboutMutation();

  const [activeTab, setActiveTab] = useState<"hero" | "stats" | "story" | "values">("hero");

  // Form states
  const [heroTitle, setHeroTitle] = useState("Our Story");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Born from a belief that clothing should be an extension of one's identity, not a costume."
  );
  const [heroImage, setHeroImage] = useState(
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop"
  );

  const [stats, setStats] = useState<StatItem[]>([
    { value: "50K+", label: "Happy Customers" },
    { value: "200+", label: "Premium Products" },
    { value: "30+", label: "Countries Served" },
    { value: "99%", label: "Satisfaction Rate" },
  ]);

  const [storyBadge, setStoryBadge] = useState("The Beginning");
  const [storyHeading, setStoryHeading] = useState("Redefining Modern Luxury");
  const [storyParagraphsText, setStoryParagraphsText] = useState(
    "NOIR—STUDIO was founded on a singular conviction: that true luxury is not about logos or labels, but about the quiet confidence that comes from wearing something exquisitely made.\n\nWe draw inspiration from the intersection of architecture, art, and the human form. Each piece in our collection is designed to move with you, adapt to you, and ultimately become a part of you.\n\nOur commitment extends beyond aesthetics. We work exclusively with mills and workshops that share our values — where artisanal craftsmanship meets progressive sustainability practices."
  );
  const [storyImage, setStoryImage] = useState(
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop"
  );
  const [storyEstYear, setStoryEstYear] = useState("Est. 2020");
  const [storyLocation, setStoryLocation] = useState("London, United Kingdom");

  const [valuesHeading, setValuesHeading] = useState("What We Stand For");
  const [values, setValues] = useState<ValueItem[]>([
    {
      title: "Craftsmanship",
      description: "Every stitch, every seam, every detail is meticulously considered and expertly executed.",
      icon: "✦",
    },
    {
      title: "Sustainability",
      description: "We believe luxury and responsibility can coexist. Our materials are ethically sourced.",
      icon: "◈",
    },
    {
      title: "Innovation",
      description: "Pushing boundaries while respecting tradition. We evolve without compromising our essence.",
      icon: "⬡",
    },
    {
      title: "Community",
      description: "More than a brand — a collective of individuals who share a vision for elevated living.",
      icon: "△",
    },
  ]);

  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync state when data loads
  useEffect(() => {
    if (data?.about) {
      const a = data.about;
      if (a.heroTitle) setHeroTitle(a.heroTitle);
      if (a.heroSubtitle) setHeroSubtitle(a.heroSubtitle);
      if (a.heroImage) setHeroImage(a.heroImage);
      if (a.stats && a.stats.length > 0) setStats(a.stats);
      if (a.storyBadge) setStoryBadge(a.storyBadge);
      if (a.storyHeading) setStoryHeading(a.storyHeading);
      if (a.storyParagraphs && a.storyParagraphs.length > 0) {
        setStoryParagraphsText(a.storyParagraphs.join("\n\n"));
      }
      if (a.storyImage) setStoryImage(a.storyImage);
      if (a.storyEstYear) setStoryEstYear(a.storyEstYear);
      if (a.storyLocation) setStoryLocation(a.storyLocation);
      if (a.valuesHeading) setValuesHeading(a.valuesHeading);
      if (a.values && a.values.length > 0) setValues(a.values);
      if (a.isActive !== undefined) setIsActive(a.isActive);
    }
  }, [data]);

  // Stat Handlers
  const addStat = () => {
    setStats([...stats, { value: "100+", label: "New Metric" }]);
  };
  const updateStat = (index: number, field: "value" | "label", val: string) => {
    const updated = [...stats];
    updated[index][field] = val;
    setStats(updated);
  };
  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  // Value Handlers
  const addValue = () => {
    setValues([
      ...values,
      {
        title: "New Value",
        description: "Description of your core brand value.",
        icon: "✦",
      },
    ]);
  };
  const updateValue = (index: number, field: "title" | "description" | "icon", val: string) => {
    const updated = [...values];
    updated[index][field] = val;
    setValues(updated);
  };
  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const paragraphs = storyParagraphsText
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const res = await saveAbout({
        heroTitle,
        heroSubtitle,
        heroImage,
        stats,
        storyBadge,
        storyHeading,
        storyParagraphs: paragraphs,
        storyImage,
        storyEstYear,
        storyLocation,
        valuesHeading,
        values,
        isActive,
      }).unwrap();

      if (res.success) {
        setFeedback({ type: "success", message: "About page content saved successfully!" });
        refetch();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.data?.message || "Failed to save about page content.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#ff6b00]" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            About Page Management
          </h1>
          <p className="text-xs text-neutral-500 dark:text-white/40">
            Customize and update the content of your public About Us page.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e05e00] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/10 dark:border-white/[0.08] pb-3">
        {[
          { id: "hero", label: "Hero & Banner", icon: Sparkles },
          { id: "stats", label: "Statistics Counters", icon: BarChart3 },
          { id: "story", label: "Brand Story", icon: BookOpen },
          { id: "values", label: "Core Values", icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isCurrent
                  ? "bg-[#ff6b00] text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: HERO */}
        {activeTab === "hero" && (
          <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#ff6b00]">
              Hero Banner Section
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. Our Story"
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Background Banner Image URL
                </label>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                Hero Subtitle
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Short tagline or philosophy..."
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-4 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
              />
            </div>

            {/* Banner Preview */}
            {heroImage && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 dark:text-white/40">
                  Hero Preview
                </label>
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-neutral-900">
                  <img src={heroImage} alt="Hero Preview" className="h-full w-full object-cover opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-2xl font-light text-white">{heroTitle}</h3>
                    <p className="mt-1 text-xs text-white/60 max-w-md">{heroSubtitle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STATS */}
        {activeTab === "stats" && (
          <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ff6b00]">
                  Key Statistics
                </h2>
                <p className="text-xs text-neutral-500 dark:text-white/40">
                  Highlight key metrics such as customers served, countries, products, etc.
                </p>
              </div>
              <button
                type="button"
                onClick={addStat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-3 py-1.5 text-xs font-semibold text-[#ff6b00] hover:bg-[#ff6b00]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Add Stat
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-black/10 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#ff6b00]">Stat #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="text-red-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500 dark:text-white/40">
                        Value (e.g. 50K+)
                      </label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        className="w-full mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500 dark:text-white/40">
                        Label
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        className="w-full mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STORY */}
        {activeTab === "story" && (
          <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#ff6b00]">
              Brand Story Section
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Badge / Tagline
                </label>
                <input
                  type="text"
                  value={storyBadge}
                  onChange={(e) => setStoryBadge(e.target.value)}
                  placeholder="e.g. The Beginning"
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Story Heading
                </label>
                <input
                  type="text"
                  value={storyHeading}
                  onChange={(e) => setStoryHeading(e.target.value)}
                  placeholder="e.g. Redefining Modern Luxury"
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                Story Paragraphs (Separate each paragraph with an empty line)
              </label>
              <textarea
                rows={7}
                value={storyParagraphsText}
                onChange={(e) => setStoryParagraphsText(e.target.value)}
                placeholder="Write your brand story here..."
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-4 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00] leading-relaxed"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Story / Workshop Image URL
                </label>
                <input
                  type="text"
                  value={storyImage}
                  onChange={(e) => setStoryImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                  Established Text
                </label>
                <input
                  type="text"
                  value={storyEstYear}
                  onChange={(e) => setStoryEstYear(e.target.value)}
                  placeholder="e.g. Est. 2020"
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                Brand Location
              </label>
              <input
                type="text"
                value={storyLocation}
                onChange={(e) => setStoryLocation(e.target.value)}
                placeholder="e.g. London, United Kingdom"
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
              />
            </div>
          </div>
        )}

        {/* TAB 4: VALUES */}
        {activeTab === "values" && (
          <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ff6b00]">
                  Core Brand Values
                </h2>
                <p className="text-xs text-neutral-500 dark:text-white/40">
                  The principles and standards that define your brand.
                </p>
              </div>
              <button
                type="button"
                onClick={addValue}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-3 py-1.5 text-xs font-semibold text-[#ff6b00] hover:bg-[#ff6b00]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Add Value
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-white/80">
                Values Section Heading
              </label>
              <input
                type="text"
                value={valuesHeading}
                onChange={(e) => setValuesHeading(e.target.value)}
                placeholder="e.g. What We Stand For"
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((val, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-black/10 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#ff6b00]">Value #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-red-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500 dark:text-white/40">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={val.icon}
                        onChange={(e) => updateValue(index, "icon", e.target.value)}
                        placeholder="✦"
                        className="w-full mt-1 text-center rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-semibold text-neutral-500 dark:text-white/40">
                        Title
                      </label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => updateValue(index, "title", e.target.value)}
                        placeholder="e.g. Craftsmanship"
                        className="w-full mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 dark:text-white/40">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={val.description}
                      onChange={(e) => updateValue(index, "description", e.target.value)}
                      placeholder="Explain what this value means..."
                      className="w-full mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between border-t border-black/10 dark:border-white/[0.08] pt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-[#ff6b00]"
            />
            <label htmlFor="isActive" className="text-xs text-neutral-700 dark:text-white/70">
              Publish on Live About Page
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ff6b00] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e05e00] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}
