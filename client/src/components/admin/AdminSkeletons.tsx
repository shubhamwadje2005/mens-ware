"use client";

import React from "react";

/**
 * Base Shimmer Skeleton Block with Dual-Theme (Light & Dark) Support
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl transition-colors ${className}`}
    />
  );
}

/**
 * Stat Cards Row Skeleton (Matches Dashboard, Products, Orders metrics)
 */
export function StatCardsSkeleton({ count = 5 }: { count?: number }) {
  const gridCols =
    count === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : count === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

  return (
    <div className={`grid ${gridCols} gap-3.5 sm:gap-4 mb-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-card relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-colors ${
            i === count - 1 && count === 5 ? "sm:col-span-2 lg:col-span-1" : ""
          }`}
        >
          {/* Top subtle glow placeholder */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

          {/* Header row: Label + Icon */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          </div>

          {/* Value + Subtitle */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/[0.04]">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-md shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Product & Orders Table Skeleton
 */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="skeleton-card rounded-2xl border overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase font-bold text-neutral-600 dark:text-white/30 tracking-wider">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Details / Category</th>
              <th className="p-4">Price / Total</th>
              <th className="p-4">Quantity / Items</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                {/* Thumbnail + Title */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-10 rounded-lg shrink-0" />
                    <div className="space-y-1.5 min-w-[140px]">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                </td>

                {/* Details / Category */}
                <td className="p-4">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </td>

                {/* Price */}
                <td className="p-4">
                  <Skeleton className="h-4 w-16 rounded-md" />
                </td>

                {/* Quantity */}
                <td className="p-4">
                  <Skeleton className="h-4 w-14 rounded-md" />
                </td>

                {/* Status */}
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Customer Directory Grid Skeleton
 */
export function CustomerCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card relative overflow-hidden rounded-3xl border p-5 sm:p-6 space-y-4 transition-colors"
        >
          {/* Top row: Avatar + Name/ID + Delete btn */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          </div>

          {/* Details list */}
          <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/[0.06]">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>

          {/* Address box */}
          <div className="pt-3 border-t border-black/5 dark:border-white/[0.06]">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Collections Grid Skeleton
 */
export function CollectionCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card relative overflow-hidden rounded-3xl border flex flex-col justify-between transition-colors"
        >
          {/* 16:9 Banner skeleton */}
          <div className="relative aspect-[16/9] w-full bg-black/5 dark:bg-black/40 overflow-hidden flex flex-col justify-between p-6">
            {/* Top badges */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Bottom titles */}
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-8 w-52 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 bg-black/[0.02] dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/[0.08]">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Campaign Banners Skeleton
 */
export function CampaignCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card relative overflow-hidden rounded-2xl border space-y-4 transition-colors"
        >
          {/* Banner */}
          <Skeleton className="h-56 sm:h-64 w-full rounded-none" />
          {/* Content */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-full rounded-md" />
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Messages List Skeleton
 */
export function MessagesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-2xl border p-4 flex items-start gap-3.5 transition-colors"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3.5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form / Editorial Page Skeleton (For About page, settings)
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tabs placeholder */}
      <div className="flex gap-2 border-b border-black/10 dark:border-white/[0.08] pb-3">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Main card */}
      <div className="skeleton-card rounded-2xl border p-6 space-y-6 transition-colors">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
