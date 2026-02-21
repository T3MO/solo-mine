"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UnifiedBitcoinData } from "@/lib/bitcoin-api";

// ============================================================================
// Types
// ============================================================================

interface UseBitcoinDataReturn {
  data: UnifiedBitcoinData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isStale: boolean;
}

interface ProfitabilityParams {
  hashrate: number; // TH/s
  powerConsumption: number; // Watts
  electricityRate: number; // $/kWh
  btcPrice?: number; // Optional override
  difficulty?: number; // Optional override
}

interface ProfitabilityResult {
  dailyRevenue: number; // USD
  dailyCost: number; // USD
  dailyProfit: number; // USD
  monthlyProfit: number; // USD
  yearlyProfit: number; // USD
  breakEvenDays: number | null;
  roi: number; // percentage
  isProfitable: boolean;
}

// ============================================================================
// Main Hook: useBitcoinData
// ============================================================================

export function useBitcoinData(refreshInterval = 60000): UseBitcoinDataReturn {
  const [data, setData] = useState<UnifiedBitcoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      
      // Try to get from cache first (client-side)
      const cached = getCachedData();
      if (cached && Date.now() - cached.timestamp < 30000) { // Use cache if < 30s old
        setData(cached.data);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/bitcoin", {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Bitcoin data");
      }

      const freshData: UnifiedBitcoinData = await response.json();
      
      // Cache the data
      setCachedData(freshData);
      
      setData(freshData);
      setLastFetchTime(Date.now());
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled
      }
      
      console.error("Bitcoin data fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      
      // Try to use stale cache if available
      const cached = getCachedData();
      if (cached) {
        setData(cached.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Check if data is stale (> 5 minutes old)
  const isStale = lastFetchTime > 0 && Date.now() - lastFetchTime > 5 * 60 * 1000;

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isStale,
  };
}

// ============================================================================
// Cache Helpers
// ============================================================================

const CACHE_KEY = "solo-mine-bitcoin-cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: UnifiedBitcoinData;
  timestamp: number;
}

function getCachedData(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CacheEntry = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    
    // Return if not expired
    if (age < CACHE_DURATION) {
      return parsed;
    }
  } catch {
    // Invalid cache
  }
  return null;
}

function setCachedData(data: UnifiedBitcoinData) {
  if (typeof window === "undefined") return;
  
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage failed
  }
}

// ============================================================================
// Profitability Calculator Hook
// ============================================================================

export function useLiveProfitability(
  params: ProfitabilityParams,
  refreshInterval = 60000
): {
  result: ProfitabilityResult | null;
  loading: boolean;
  error: string | null;
  usingLiveData: boolean;
  priceChange: number | null;
  recalculate: () => void;
} {
  const { data, loading, error, refetch } = useBitcoinData(refreshInterval);
  const [result, setResult] = useState<ProfitabilityResult | null>(null);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  // Calculate profitability
  useEffect(() => {
    if (!data) return;

    const btcPrice = params.btcPrice ?? data.price.usd;
    const difficulty = params.difficulty ?? data.network.difficulty * 1e12; // Convert T to actual

    // Check if using live data
    const isLive = !params.btcPrice && !params.difficulty;
    setUsingLiveData(isLive);

    // Detect significant price change (>5%)
    if (isLive && prevPriceRef.current !== null) {
      const change = Math.abs((btcPrice - prevPriceRef.current) / prevPriceRef.current);
      if (change > 0.05) {
        setPriceChange(change * 100);
      } else {
        setPriceChange(null);
      }
    }
    prevPriceRef.current = btcPrice;

    // Calculate mining profitability
    const calculation = calculateProfitability({
      ...params,
      btcPrice,
      difficulty,
    });

    setResult(calculation);
  }, [data, params]);

  const recalculate = useCallback(() => {
    refetch();
    setPriceChange(null);
  }, [refetch]);

  return {
    result,
    loading,
    error,
    usingLiveData,
    priceChange,
    recalculate,
  };
}

// ============================================================================
// Profitability Calculation
// ============================================================================

function calculateProfitability(params: Required<ProfitabilityParams>): ProfitabilityResult {
  const { hashrate, powerConsumption, electricityRate, btcPrice, difficulty } = params;

  // Constants
  const BLOCK_TIME = 600; // seconds (10 minutes)
  const BLOCK_REWARD = 3.125; // BTC (current subsidy)
  const SECONDS_PER_DAY = 86400;

  // Calculate daily BTC earnings
  // Formula: (hashrate / network_hashrate) * blocks_per_day * block_reward
  // Network hashrate can be estimated from difficulty: hash = difficulty * 2^32 / block_time
  const networkHashrate = (difficulty * Math.pow(2, 32)) / BLOCK_TIME; // H/s
  const userHashrate = hashrate * 1e12; // Convert TH/s to H/s

  const blocksPerDay = SECONDS_PER_DAY / BLOCK_TIME;
  const dailyBtc = (userHashrate / networkHashrate) * blocksPerDay * BLOCK_REWARD;

  // Calculate revenue and costs
  const dailyRevenue = dailyBtc * btcPrice;
  const dailyPowerKwh = (powerConsumption * SECONDS_PER_DAY) / (1000 * 3600);
  const dailyCost = dailyPowerKwh * electricityRate;
  const dailyProfit = dailyRevenue - dailyCost;

  // Calculate extended metrics
  const monthlyProfit = dailyProfit * 30;
  const yearlyProfit = dailyProfit * 365;

  // Break-even (assuming hardware cost is not provided, use a placeholder)
  // In real app, you'd pass hardware cost as a parameter
  const hardwareCost = 500; // Placeholder
  const breakEvenDays = dailyProfit > 0 ? Math.ceil(hardwareCost / dailyProfit) : null;

  // ROI (1 year)
  const roi = (yearlyProfit / hardwareCost) * 100;

  return {
    dailyRevenue,
    dailyCost,
    dailyProfit,
    monthlyProfit,
    yearlyProfit,
    breakEvenDays,
    roi,
    isProfitable: dailyProfit > 0,
  };
}

// ============================================================================
// Convenience Hook: usePriceAlert
// ============================================================================

export function usePriceAlert(threshold = 0.1): {
  alert: { type: "increase" | "decrease"; percent: number } | null;
  dismiss: () => void;
} {
  const { data } = useBitcoinData(60000);
  const [alert, setAlert] = useState<{ type: "increase" | "decrease"; percent: number } | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!data) return;

    const change = Math.abs(data.price.change24h) / 100;
    
    // Only trigger if change exceeds threshold and not recently alerted
    if (change > threshold && Date.now() - lastAlertTimeRef.current > 60 * 60 * 1000) {
      setAlert({
        type: data.price.change24h > 0 ? "increase" : "decrease",
        percent: Math.abs(data.price.change24h),
      });
      lastAlertTimeRef.current = Date.now();
    }
  }, [data, threshold]);

  const dismiss = useCallback(() => {
    setAlert(null);
  }, []);

  return { alert, dismiss };
}

// ============================================================================
// Utility Exports
// ============================================================================

export function formatProfit(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatBtc(value: number): string {
  if (value < 0.0001) {
    return `${(value * 1e8).toFixed(0)} sats`;
  }
  return `${value.toFixed(6)} BTC`;
}

export function getCongestionColor(level: UnifiedBitcoinData["network"]["congestionLevel"]): string {
  switch (level) {
    case "low":
      return "text-accent";
    case "medium":
      return "text-yellow-500";
    case "high":
      return "text-orange-500";
    case "critical":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}
