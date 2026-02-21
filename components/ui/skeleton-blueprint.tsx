"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonBlueprintProps {
  className?: string;
  rows?: number;
}

export function SkeletonBlueprint({ className, rows = 4 }: SkeletonBlueprintProps) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-primary/10 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-primary/10 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-primary/5 rounded animate-pulse" />
        </div>
      </div>

      {/* Blueprint grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FF6B00 1px, transparent 1px),
            linear-gradient(to bottom, #FF6B00 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-3 rounded-lg border border-dashed border-primary/20"
        >
          {/* Icon placeholder */}
          <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary/20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>

          {/* Text placeholders */}
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 bg-primary/10 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-primary/5 rounded animate-pulse" />
          </div>

          {/* Value placeholder */}
          <div className="h-6 w-20 bg-primary/10 rounded animate-pulse" />
        </motion.div>
      ))}

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/20" />
    </div>
  );
}
