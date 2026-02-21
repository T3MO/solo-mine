"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Database, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBitcoinData } from "@/hooks/useLiveProfitability";
import { NetworkStatusModal } from "./network-status-modal";

// ============================================================================
// Types
// ============================================================================

interface TickerItemProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  onClick?: () => void;
  flash?: "up" | "down" | null;
}

// ============================================================================
// Ticker Item Component
// ============================================================================

function TickerItem({ label, value, change, icon, onClick, flash }: TickerItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
        "hover:bg-white/5 cursor-pointer",
        flash === "up" && "bg-accent/10",
        flash === "down" && "bg-destructive/10"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex flex-col items-start">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-sm">{value}</span>
          {change !== undefined && (
            <span className={cn(
              "text-xs flex items-center",
              change >= 0 ? "text-accent" : "text-destructive"
            )}>
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Main Live Ticker Component
// ============================================================================

export function LiveTicker() {
  const { data, loading, error } = useBitcoinData(60000); // 60 second refresh
  const [showModal, setShowModal] = useState(false);
  const [flashState, setFlashState] = useState<{ price: "up" | "down" | null }>({ price: null });
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  // Handle price flash animation
  useEffect(() => {
    if (data?.price && prevPrice !== null) {
      const priceChange = data.price.usd - prevPrice;
      const percentChange = Math.abs(priceChange / prevPrice);
      
      // Only flash if change is significant (>0.5%)
      if (percentChange > 0.005) {
        setFlashState({ price: priceChange > 0 ? "up" : "down" });
        setTimeout(() => setFlashState({ price: null }), 1000);
      }
    }
    
    if (data?.price.usd) {
      setPrevPrice(data.price.usd);
    }
  }, [data?.price.usd, prevPrice]);

  // Format helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDifficulty = (diff: number) => {
    return `${diff.toFixed(1)}T`;
  };

  const formatHashrate = (hr: number) => {
    if (hr >= 1000) return `${(hr / 1000).toFixed(2)} ZH/s`;
    return `${hr.toFixed(1)} EH/s`;
  };

  // Calculate time until difficulty adjustment
  const getAdjustmentTime = (blocks: number) => {
    const hours = Math.floor((blocks * 10) / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    return `${hours}h`;
  };

  if (loading && !data) {
    return (
      <div className="w-full bg-muted/50 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="w-full bg-destructive/10 border-b border-destructive/20">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <span className="text-sm text-destructive">
            ⚠️ Live data unavailable. Using cached values.
          </span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { price, network, fees } = data;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 overflow-x-auto scrollbar-hide">
            {/* Scrollable ticker items */}
            <div className="flex items-center gap-2 min-w-max">
              {/* BTC Price */}
              <TickerItem
                label="BTC Price"
                value={formatPrice(price.usd)}
                change={price.change24h}
                icon={<Zap className="w-4 h-4 text-primary" />}
                onClick={() => setShowModal(true)}
                flash={flashState.price}
              />

              <div className="w-px h-8 bg-border/50" />

              {/* Network Difficulty */}
              <TickerItem
                label="Difficulty"
                value={formatDifficulty(network.difficulty)}
                icon={<Database className="w-4 h-4 text-secondary" />}
                onClick={() => setShowModal(true)}
              />

              <div className="w-px h-8 bg-border/50" />

              {/* Block Height */}
              <TickerItem
                label="Block Height"
                value={network.blockHeight.toLocaleString()}
                icon={<Activity className="w-4 h-4 text-accent" />}
                onClick={() => setShowModal(true)}
              />

              <div className="w-px h-8 bg-border/50" />

              {/* Mempool */}
              <TickerItem
                label="Mempool"
                value={`${network.mempoolSize} MB`}
                icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                onClick={() => setShowModal(true)}
              />

              <div className="w-px h-8 bg-border/50" />

              {/* Next Difficulty Adjustment */}
              <TickerItem
                label={`Adjustment ${network.difficultyChange >= 0 ? "+" : ""}${network.difficultyChange.toFixed(1)}%`}
                value={`in ${getAdjustmentTime(network.blocksUntilAdjustment)}`}
                icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
                onClick={() => setShowModal(true)}
              />

              <div className="w-px h-8 bg-border/50" />

              {/* Fees */}
              <TickerItem
                label="Fees"
                value={`${fees.halfHourFee} sat/vB`}
                icon={<Zap className="w-4 h-4 text-muted-foreground" />}
                onClick={() => setShowModal(true)}
              />
            </div>

            {/* Last Updated */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-4">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                network.congestionLevel === "critical" ? "bg-destructive" :
                network.congestionLevel === "high" ? "bg-amber-500" :
                "bg-accent"
              )} />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal scroll indicator */}
        <div className="md:hidden h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      </motion.div>

      {/* Network Status Modal */}
      <NetworkStatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={data}
      />
    </>
  );
}

// ============================================================================
// Compact Ticker (for mobile or constrained spaces)
// ============================================================================

export function CompactLiveTicker() {
  const { data, loading } = useBitcoinData(60000);
  const [showModal, setShowModal] = useState(false);

  if (loading || !data) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-mono font-semibold text-sm">
            ${data.price.usd.toLocaleString()}
          </span>
          <span className={cn(
            "text-xs",
            data.price.change24h >= 0 ? "text-accent" : "text-destructive"
          )}>
            {data.price.change24h >= 0 ? "+" : ""}{data.price.change24h.toFixed(1)}%
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>{data.network.blockHeight.toLocaleString()}</span>
        </div>
      </button>

      <NetworkStatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={data}
      />
    </>
  );
}
