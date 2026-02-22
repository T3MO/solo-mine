/**
 * Bitcoin API Service
 * Fetches live network data with caching and fallback strategies
 */

// ============================================================================
// Types
// ============================================================================

export interface BitcoinPrice {
  usd: number;
  change24h: number;
  change24hUsd: number;
  lastUpdated: number;
}

export interface NetworkStats {
  difficulty: number; // in trillions (T)
  difficultyChange: number; // percentage change at next adjustment
  blockHeight: number;
  blocksUntilAdjustment: number;
  adjustmentETA: string;
  hashrate: number; // in EH/s
  hashrateChange24h: number;
  mempoolSize: number; // in MB
  mempoolTxs: number;
  congestionLevel: "low" | "medium" | "high" | "critical";
  lastUpdated: number;
}

export interface RecommendedFees {
  fastestFee: number; // sat/vB - next block
  halfHourFee: number; // sat/vB - ~30 min
  hourFee: number; // sat/vB - ~1 hour
  economyFee: number; // sat/vB - ~few hours
  minimumFee: number; // sat/vB - slow
  lastUpdated: number;
}

export interface MiningEconomics {
  blockSubsidy: number; // BTC per block
  nextHalving: {
    blockHeight: number;
    blocksRemaining: number;
    estimatedDate: string;
  };
  dailyIssuance: number; // BTC per day
  lastUpdated: number;
}

export interface UnifiedBitcoinData {
  price: BitcoinPrice;
  network: NetworkStats;
  fees: RecommendedFees;
  economics: MiningEconomics;
}

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_DURATION = 60 * 1000; // 60 seconds
const CACHE_KEY = "solo-mine-bitcoin-data";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCachedData<T>(): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    
    // Return if not expired
    if (age < CACHE_DURATION) {
      return parsed;
    }
  } catch {
    // Invalid cache, ignore
  }
  return null;
}

function setCachedData<T>(data: T) {
  if (typeof window === "undefined") return;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage failed, ignore
  }
}

// ============================================================================
// API Fetchers with Fallbacks
// ============================================================================

async function fetchWithFallback<T>(
  fetchers: Array<() => Promise<T>>,
  defaultValue: T
): Promise<T> {
  for (const fetcher of fetchers) {
    try {
      const result = await fetcher();
      if (result) return result;
    } catch (error) {
      console.warn("Fetcher failed:", error);
      continue;
    }
  }
  return defaultValue;
}

// Price fetchers
async function fetchCoinGeckoPrice(): Promise<BitcoinPrice> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
    { next: { revalidate: 60 } }
  );
  
  if (!response.ok) throw new Error("CoinGecko API failed");
  
  const data = await response.json();
  const price = data.bitcoin.usd;
  const change24h = data.bitcoin.usd_24h_change;
  
  return {
    usd: price,
    change24h: change24h,
    change24hUsd: price * (change24h / 100),
    lastUpdated: Date.now(),
  };
}

async function fetchCoinCapPrice(): Promise<BitcoinPrice> {
  const response = await fetch(
    "https://api.coincap.io/v2/assets/bitcoin",
    { next: { revalidate: 60 } }
  );
  
  if (!response.ok) throw new Error("CoinCap API failed");
  
  const data = await response.json();
  const price = parseFloat(data.data.priceUsd);
  const change24h = parseFloat(data.data.changePercent24Hr);
  
  return {
    usd: price,
    change24h: change24h,
    change24hUsd: price * (change24h / 100),
    lastUpdated: Date.now(),
  };
}

// Network stats fetchers
async function fetchMempoolSpaceStats(): Promise<Partial<NetworkStats>> {
  const [difficultyRes, blocksRes, mempoolRes] = await Promise.all([
    fetch("https://mempool.space/api/v1/difficulty"),
    fetch("https://mempool.space/api/blocks/tip/height"),
    fetch("https://mempool.space/api/mempool"),
  ]);

  if (!difficultyRes.ok || !blocksRes.ok || !mempoolRes.ok) {
    throw new Error("Mempool.space API failed");
  }

  const difficulty = await difficultyRes.json();
  const blockHeight = await blocksRes.text();
  const mempool = await mempoolRes.json();

  // Calculate difficulty change
  const difficultyChange = difficulty.difficultyChange || 0;
  const blocksUntilAdjustment = 2016 - (parseInt(blockHeight) % 2016);
  
  // Estimate adjustment time (assuming ~10 min per block)
  const adjustmentMs = blocksUntilAdjustment * 10 * 60 * 1000;
  const adjustmentDate = new Date(Date.now() + adjustmentMs);

  // Calculate congestion level
  const mempoolSizeMB = mempool.vsize / 1024 / 1024;
  let congestionLevel: NetworkStats["congestionLevel"] = "low";
  if (mempoolSizeMB > 100) congestionLevel = "critical";
  else if (mempoolSizeMB > 50) congestionLevel = "high";
  else if (mempoolSizeMB > 20) congestionLevel = "medium";

  return {
    difficulty: difficulty.currentDifficulty / 1e12, // Convert to T
    difficultyChange,
    blockHeight: parseInt(blockHeight),
    blocksUntilAdjustment,
    mempoolSize: Math.round(mempoolSizeMB),
    mempoolTxs: mempool.count,
    congestionLevel,
  };
}

async function fetchBlockchainInfoStats(): Promise<Partial<NetworkStats>> {
  const response = await fetch("https://blockchain.info/q/getdifficulty");
  if (!response.ok) throw new Error("Blockchain.info API failed");
  
  const difficulty = await response.text();
  
  return {
    difficulty: parseFloat(difficulty) / 1e12,
  };
}

// Fee fetchers
async function fetchMempoolSpaceFees(): Promise<RecommendedFees> {
  const response = await fetch("https://mempool.space/api/v1/fees/recommended");
  if (!response.ok) throw new Error("Mempool.space fees API failed");
  
  const data = await response.json();
  
  return {
    fastestFee: data.fastestFee,
    halfHourFee: data.halfHourFee,
    hourFee: data.hourFee,
    economyFee: data.economyFee,
    minimumFee: data.minimumFee,
    lastUpdated: Date.now(),
  };
}

async function fetchBlockchairFees(): Promise<RecommendedFees> {
  const response = await fetch("https://api.blockchair.com/bitcoin/stats");
  if (!response.ok) throw new Error("Blockchair API failed");
  
  const data = await response.json();
  const feePerByte = data.data.suggested_transaction_fee_per_byte_sat;
  
  return {
    fastestFee: Math.ceil(feePerByte * 1.5),
    halfHourFee: Math.ceil(feePerByte),
    hourFee: Math.ceil(feePerByte * 0.8),
    economyFee: Math.ceil(feePerByte * 0.5),
    minimumFee: Math.ceil(feePerByte * 0.3),
    lastUpdated: Date.now(),
  };
}

// ============================================================================
// Main Data Fetching Functions
// ============================================================================

export async function fetchBitcoinPrice(): Promise<BitcoinPrice> {
  // Check cache first
  const cached = getCachedData<UnifiedBitcoinData>();
  if (cached?.data.price && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.price;
  }

  return fetchWithFallback(
    [fetchCoinGeckoPrice, fetchCoinCapPrice],
    {
      usd: 65000, // Fallback default
      change24h: 0,
      change24hUsd: 0,
      lastUpdated: Date.now(),
    }
  );
}

export async function fetchNetworkStats(): Promise<NetworkStats> {
  const cached = getCachedData<UnifiedBitcoinData>();
  if (cached?.data.network && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.network;
  }

  const mempoolData = await fetchWithFallback(
    [fetchMempoolSpaceStats, fetchBlockchainInfoStats],
    {}
  );

  // Calculate hashrate estimate from difficulty
  const hashrate = (mempoolData.difficulty || 83) * Math.pow(2, 32) / 600 / 1e18;

  return {
    difficulty: mempoolData.difficulty || 83,
    difficultyChange: mempoolData.difficultyChange || 0,
    blockHeight: mempoolData.blockHeight || 890000,
    blocksUntilAdjustment: mempoolData.blocksUntilAdjustment || 1000,
    adjustmentETA: mempoolData.blocksUntilAdjustment 
      ? new Date(Date.now() + mempoolData.blocksUntilAdjustment * 10 * 60 * 1000).toISOString()
      : new Date().toISOString(),
    hashrate,
    hashrateChange24h: 0, // Would need historical data
    mempoolSize: mempoolData.mempoolSize || 30,
    mempoolTxs: mempoolData.mempoolTxs || 50000,
    congestionLevel: mempoolData.congestionLevel || "medium",
    lastUpdated: Date.now(),
  };
}

export async function fetchRecommendedFees(): Promise<RecommendedFees> {
  const cached = getCachedData<UnifiedBitcoinData>();
  if (cached?.data.fees && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.fees;
  }

  return fetchWithFallback(
    [fetchMempoolSpaceFees, fetchBlockchairFees],
    {
      fastestFee: 50,
      halfHourFee: 30,
      hourFee: 20,
      economyFee: 10,
      minimumFee: 5,
      lastUpdated: Date.now(),
    }
  );
}

export async function fetchMiningEconomics(): Promise<MiningEconomics> {
  const network = await fetchNetworkStats();
  
  // Halving happens every 210,000 blocks
  const nextHalvingBlock = Math.ceil(network.blockHeight / 210000) * 210000;
  const blocksRemaining = nextHalvingBlock - network.blockHeight;
  
  // Current subsidy (started at 50, halves every 210,000 blocks)
  const halvings = Math.floor(network.blockHeight / 210000);
  const blockSubsidy = 50 / Math.pow(2, halvings);
  
  // Estimate date (10 min per block)
  const estimatedDate = new Date(Date.now() + blocksRemaining * 10 * 60 * 1000);
  
  return {
    blockSubsidy,
    nextHalving: {
      blockHeight: nextHalvingBlock,
      blocksRemaining,
      estimatedDate: estimatedDate.toISOString(),
    },
    dailyIssuance: blockSubsidy * 144, // 144 blocks per day
    lastUpdated: Date.now(),
  };
}

export async function fetchAllBitcoinData(): Promise<UnifiedBitcoinData> {
  // Try to get from cache first
  const cached = getCachedData<UnifiedBitcoinData>();
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch all data in parallel
  const [price, network, fees, economics] = await Promise.all([
    fetchBitcoinPrice(),
    fetchNetworkStats(),
    fetchRecommendedFees(),
    fetchMiningEconomics(),
  ]);

  const data: UnifiedBitcoinData = {
    price,
    network,
    fees,
    economics,
  };

  // Cache the result
  setCachedData(data);

  return data;
}

// ============================================================================
// React Hooks (for client-side usage)
// ============================================================================

import { useState, useEffect, useCallback } from "react";

export function useBitcoinPrice(refreshInterval = 60000) {
  const [data, setData] = useState<BitcoinPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const price = await fetchBitcoinPrice();
      setData(price);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch price");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetch, refreshInterval]);

  return { data, loading, error, refetch: fetch };
}

export function useNetworkStats(refreshInterval = 60000) {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const stats = await fetchNetworkStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch network stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetch, refreshInterval]);

  return { data, loading, error, refetch: fetch };
}

export function useRecommendedFees(refreshInterval = 60000) {
  const [data, setData] = useState<RecommendedFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const fees = await fetchRecommendedFees();
      setData(fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch fees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetch, refreshInterval]);

  return { data, loading, error, refetch: fetch };
}

export function useMiningEconomics(refreshInterval = 60000) {
  const [data, setData] = useState<MiningEconomics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const economics = await fetchMiningEconomics();
      setData(economics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch economics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetch, refreshInterval]);

  return { data, loading, error, refetch: fetch };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatBtcPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatHashrate(hashrate: number): string {
  if (hashrate >= 1000) {
    return `${(hashrate / 1000).toFixed(2)} ZH/s`;
  }
  return `${hashrate.toFixed(2)} EH/s`;
}

export function formatDifficulty(difficulty: number): string {
  return `${difficulty.toFixed(1)} T`;
}

export function formatBlockHeight(height: number): string {
  return height.toLocaleString();
}

export function getFeeRecommendation(congestionLevel: NetworkStats["congestionLevel"]): string {
  switch (congestionLevel) {
    case "low":
      return "Fees are low. Good time to transact.";
    case "medium":
      return "Fees are moderate. Standard transactions fine.";
    case "high":
      return "Fees are high. Consider waiting or using economy fee.";
    case "critical":
      return "Network congested! Avoid non-urgent transactions.";
    default:
      return "Check current fees before transacting.";
  }
}

export function getHalvingProgress(blockHeight: number): number {
  const halvingInterval = 210000;
  const currentHalvingBlock = Math.floor(blockHeight / halvingInterval) * halvingInterval;
  const progress = ((blockHeight - currentHalvingBlock) / halvingInterval) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
