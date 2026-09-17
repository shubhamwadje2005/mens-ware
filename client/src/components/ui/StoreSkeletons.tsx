"use client";

import React from "react";

/**
 * Base Shimmer Skeleton Block with Dual-Theme (Light & Dark) Support
 */
export function StoreSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl transition-colors ${className}`}
    />
  );
}

/**
 * Single Storefront Product Card Skeleton (Matches ProductCard.tsx)
 */
export function StoreProductCardSkeleton() {
  return (
    <div className="group skeleton-card relative overflow-hidden rounded-2xl border p-3 sm:p-4 flex flex-col justify-between space-y-3.5 transition-colors">
      {/* 3:4 Product Image Placeholder */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
        <StoreSkeleton className="h-full w-full rounded-xl" />
        {/* Top Badges Placeholder */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <StoreSkeleton className="h-5 w-16 rounded-full" />
          <StoreSkeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2 pt-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <StoreSkeleton className="h-3.5 w-20 rounded-md" />
          <StoreSkeleton className="h-3.5 w-12 rounded-md" />
        </div>

        {/* Product Title */}
        <StoreSkeleton className="h-4.5 w-4/5 rounded-md" />

        {/* Color Swatch Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          <StoreSkeleton className="h-4 w-4 rounded-full" />
          <StoreSkeleton className="h-4 w-4 rounded-full" />
          <StoreSkeleton className="h-4 w-4 rounded-full" />
        </div>

        {/* Price & Cart Placeholder */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <StoreSkeleton className="h-5 w-16 rounded-md" />
            <StoreSkeleton className="h-3.5 w-10 rounded-md" />
          </div>
          <StoreSkeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton (Shop Catalog / Featured Products)
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StoreProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product Detail Page Skeleton (Matches product/[slug]/page.tsx)
 */
export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6 sm:mb-8 flex items-center gap-2">
        <StoreSkeleton className="h-4 w-14 rounded-md" />
        <span className="text-neutral-400 dark:text-white/20">/</span>
        <StoreSkeleton className="h-4 w-20 rounded-md" />
        <span className="text-neutral-400 dark:text-white/20">/</span>
        <StoreSkeleton className="h-4 w-32 rounded-md" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Gallery (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="skeleton-card relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden rounded-3xl border p-2">
            <StoreSkeleton className="h-full w-full rounded-2xl" />
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <StoreSkeleton key={i} className="h-20 w-16 sm:h-24 sm:w-20 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Right Column: Details & Purchasing Controls (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Category pill */}
          <div className="flex items-center gap-2">
            <StoreSkeleton className="h-6 w-24 rounded-full" />
            <StoreSkeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Product Title */}
          <div className="space-y-2">
            <StoreSkeleton className="h-8 sm:h-10 w-full rounded-xl" />
            <StoreSkeleton className="h-8 w-3/4 rounded-xl" />
          </div>

          {/* Price Row */}
          <div className="flex items-center gap-3 pt-2">
            <StoreSkeleton className="h-8 w-28 rounded-lg" />
            <StoreSkeleton className="h-5 w-20 rounded-md" />
            <StoreSkeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-2">
            <StoreSkeleton className="h-4 w-28 rounded-md" />
            <StoreSkeleton className="h-4 w-16 rounded-md" />
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-black/10 dark:bg-white/[0.06]" />

          {/* Color Selector */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <StoreSkeleton className="h-4 w-20 rounded-md" />
              <StoreSkeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <StoreSkeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <StoreSkeleton className="h-4 w-20 rounded-md" />
              <StoreSkeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <StoreSkeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Actions: Quantity + CTA buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <StoreSkeleton className="h-12 w-28 rounded-full" />
              <StoreSkeleton className="h-12 flex-1 rounded-full" />
            </div>
            <StoreSkeleton className="h-12 w-full rounded-full" />
          </div>

          {/* Features Accordion Rows */}
          <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/[0.06]">
            {Array.from({ length: 3 }).map((_, i) => (
              <StoreSkeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Store Collections Page Skeleton (Matches collections/page.tsx)
 */
export function StoreCollectionsSkeleton() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Featured Collections 16:9 Banners */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-card relative aspect-[16/9] w-full overflow-hidden rounded-3xl border p-6 sm:p-8 flex flex-col justify-between"
          >
            <div className="flex justify-between">
              <StoreSkeleton className="h-6 w-24 rounded-full" />
              <StoreSkeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <StoreSkeleton className="h-3.5 w-20 rounded-md" />
              <StoreSkeleton className="h-7 sm:h-9 w-60 rounded-xl" />
              <StoreSkeleton className="h-4 w-80 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <StoreSkeleton className="h-6 w-40 rounded-lg" />
          <StoreSkeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-card relative aspect-[4/5] w-full overflow-hidden rounded-2xl border p-5 flex flex-col justify-end"
            >
              <StoreSkeleton className="h-full w-full absolute inset-0" />
              <div className="relative z-10 space-y-1.5">
                <StoreSkeleton className="h-5 w-32 rounded-md" />
                <StoreSkeleton className="h-3.5 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * User Orders Page Skeleton (Matches orders/page.tsx)
 */
export function UserOrdersSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-2xl border p-5 sm:p-6 space-y-4"
        >
          {/* Order Header: ID + Status Pill */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <StoreSkeleton className="h-3.5 w-16 rounded-md" />
              <StoreSkeleton className="h-5 w-28 rounded-md" />
            </div>
            <StoreSkeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Item Row */}
          <div className="flex items-center gap-4 py-3 border-y border-black/5 dark:border-white/[0.04]">
            <StoreSkeleton className="h-16 w-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <StoreSkeleton className="h-4 w-48 rounded-md" />
              <StoreSkeleton className="h-3.5 w-28 rounded-md" />
            </div>
            <StoreSkeleton className="h-5 w-16 rounded-md" />
          </div>

          {/* Order Footer */}
          <div className="flex items-center justify-between pt-1">
            <StoreSkeleton className="h-4 w-32 rounded-md" />
            <StoreSkeleton className="h-5 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * User Profile Page Skeleton (Matches profile/page.tsx)
 */
export function UserProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-8">
      {/* Header with Avatar & Name */}
      <div className="skeleton-card flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 rounded-3xl border">
        <StoreSkeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
          <StoreSkeleton className="h-6 w-48 rounded-lg mx-auto sm:mx-0" />
          <StoreSkeleton className="h-4 w-36 rounded-md mx-auto sm:mx-0" />
          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <StoreSkeleton className="h-8 w-28 rounded-full" />
            <StoreSkeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-black/10 dark:border-white/[0.08] pb-3">
        <StoreSkeleton className="h-10 w-32 rounded-xl" />
        <StoreSkeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Form Card */}
      <div className="skeleton-card rounded-2xl border p-6 space-y-5">
        <div className="space-y-2">
          <StoreSkeleton className="h-3.5 w-20 rounded-md" />
          <StoreSkeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <StoreSkeleton className="h-3.5 w-20 rounded-md" />
          <StoreSkeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <StoreSkeleton className="h-3.5 w-20 rounded-md" />
          <StoreSkeleton className="h-11 w-full rounded-xl" />
        </div>
        <StoreSkeleton className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Store About Us Page Skeleton (Matches about/page.tsx)
 */
export function StoreAboutSkeleton() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[60vh] sm:h-[70vh] w-full bg-black/5 dark:bg-white/[0.02] flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-4">
          <StoreSkeleton className="h-4 w-24 rounded-full mx-auto" />
          <StoreSkeleton className="h-10 sm:h-14 w-80 sm:w-96 rounded-2xl mx-auto" />
          <StoreSkeleton className="h-4 w-full rounded-md mx-auto" />
          <StoreSkeleton className="h-4 w-4/5 rounded-md mx-auto" />
        </div>
      </div>

      {/* 4 Counter Stats Cards */}
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-card rounded-2xl border p-6 text-center space-y-2"
            >
              <StoreSkeleton className="h-8 w-24 rounded-lg mx-auto" />
              <StoreSkeleton className="h-3.5 w-32 rounded-md mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Editorial Story */}
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <StoreSkeleton className="h-96 w-full rounded-3xl" />
          <div className="space-y-4">
            <StoreSkeleton className="h-3.5 w-20 rounded-md" />
            <StoreSkeleton className="h-8 w-64 rounded-xl" />
            <StoreSkeleton className="h-4 w-full rounded-md" />
            <StoreSkeleton className="h-4 w-full rounded-md" />
            <StoreSkeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
