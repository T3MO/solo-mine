"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { calculatePoolEarnings, formatCurrency } from "@/lib/mining-calculations";
import type { HardwareDevice } from "@/types/hardware";
import {
  Zap,
  Bitcoin,
  Volume2,
  TrendingUp,
  TrendingDown,
  Calculator,
  ExternalLink,
  HelpCircle,
  Award,
  Sparkles,
} from "lucide-react";

interface HardwareCardProps {
  device: HardwareDevice;
  electricityCost: number;
  onOpenModeGuide: (device: HardwareDevice) => void;
  className?: string;
}

export function HardwareCard({
  device,
  electricityCost,
  onOpenModeGuide,
  className,
}: HardwareCardProps) {
  // Calculate profitability at user's electricity rate
  const profitability = calculatePoolEarnings({
    hashrate: device.hashrate,
    wattage: device.wattage,
    electricityCost,
    btcPrice: 65000,
    difficulty: 83,
    heatReuseEnabled: false,
  });

  const isProfitable = profitability.isProfitable;

  // Check if device is new (within 30 days)
  const isNew =
    device.isNew ||
    (new Date().getTime() - new Date(device.releaseDate).getTime()) /
      (1000 * 60 * 60 * 24) <
      30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      <HolographicCard
        className={cn(
          "h-full overflow-hidden",
          "hover:shadow-lg hover:shadow-primary/20 transition-shadow"
        )}
        style={{
          borderColor:
            device.category === "home-miner"
              ? "rgba(255, 107, 0, 0.3)"
              : "rgba(255, 51, 51, 0.3)",
        }}
      >
        {/* Image Area */}
        <div className="relative aspect-video bg-muted/50 overflow-hidden group">
          {/* Placeholder with device emoji */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-muted to-background">
            🔧
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {isNew && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold border border-accent/30">
                <Sparkles className="w-3 h-3" />
                New
              </span>
            )}
            {device.isBestValue && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                <Award className="w-3 h-3" />
                Best Value
              </span>
            )}
          </div>

          {/* Capability badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {device.soloCapable && (
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                Solo Capable
              </span>
            )}
            {device.poolRecommended && (
              <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium border border-secondary/30">
                Pool Ready
              </span>
            )}
            {device.noise < 40 && (
              <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
                Quiet &lt;40dB
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <div className="mb-4">
            <h3 className="font-sans font-bold text-xl text-foreground">
              {device.name}
            </h3>
            <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
          </div>

          {/* Spec Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Hashrate</div>
              <div className="font-mono font-bold text-foreground">
                {device.hashrate}
                <span className="text-xs text-muted-foreground ml-0.5">
                  {device.hashrateUnit}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Power</div>
              <div className="font-mono font-bold text-foreground">
                {device.wattage}
                <span className="text-xs text-muted-foreground ml-0.5">W</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Noise</div>
              <div className="font-mono font-bold text-foreground">
                {device.noise}
                <span className="text-xs text-muted-foreground ml-0.5">dB</span>
              </div>
            </div>
          </div>

          {/* Profitability Indicator */}
          <div className="mb-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                isProfitable
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}
            >
              {isProfitable ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Profitable at ${electricityCost.toFixed(2)}/kWh
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Not profitable at ${electricityCost.toFixed(2)}/kWh
                  {electricityCost === 0.12 && (
                    <span className="text-xs opacity-70 ml-auto">
                      Update in simulator
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {device.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-mono font-bold text-foreground">
              ${device.price}
            </span>
            <span className="text-sm text-muted-foreground">USD</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link href={`/tools/variance-simulator?device=${device.id}`}>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                <Calculator className="w-4 h-4" />
                Simulate Profitability
              </button>
            </Link>

            <div className="flex gap-2">
              <a
                href={device.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                View Details
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => onOpenModeGuide(device)}
                className="px-4 py-3 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                title="Pool vs Solo Setup Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </HolographicCard>
    </motion.div>
  );
}
