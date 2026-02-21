import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Edge Runtime Configuration
// ============================================================================

export const runtime = "edge";
export const preferredRegion = "iad1"; // US East (low latency for most users)

// Cache configuration
const CACHE_MAX_AGE = 60; // 1 minute
const STALE_WHILE_REVALIDATE = 300; // 5 minutes

// ============================================================================
// Types
// ============================================================================

interface BitcoinData {
  price: {
    usd: number;
    change24h: number;
    change24hUsd: number;
    lastUpdated: number;
  };
  network: {
    difficulty: number;
    difficultyChange: number;
    blockHeight: number;
    blocksUntilAdjustment: number;
    adjustmentETA: string;
    hashrate: number;
    mempoolSize: number;
    mempoolTxs: number;
    congestionLevel: "low" | "medium" | "high" | "critical";
    lastUpdated: number;
  };
  fees: {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
    lastUpdated: number;
  };
  economics: {
    blockSubsidy: number;
    nextHalving: {
      blockHeight: number;
      blocksRemaining: number;
      estimatedDate: string;
    };
    dailyIssuance: number;
    lastUpdated: number;
  };
}

// ============================================================================
// Data Fetchers (Server-side)
// ============================================================================

async function fetchPrice(): Promise<BitcoinData["price"]> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      {
        headers: { "Accept": "application/json" },
      }
    );

    if (!response.ok) throw new Error("CoinGecko failed");

    const data = await response.json();
    const price = data.bitcoin.usd;
    const change24h = data.bitcoin.usd_24h_change;

    return {
      usd: price,
      change24h,
      change24hUsd: price * (change24h / 100),
      lastUpdated: Date.now(),
    };
  } catch {
    // Fallback to CoinCap
    try {
      const response = await fetch("https://api.coincap.io/v2/assets/bitcoin");
      const data = await response.json();
      
      return {
        usd: parseFloat(data.data.priceUsd),
        change24h: parseFloat(data.data.changePercent24Hr),
        change24hUsd: parseFloat(data.data.priceUsd) * (parseFloat(data.data.changePercent24Hr) / 100),
        lastUpdated: Date.now(),
      };
    } catch {
      // Return cached/default if both fail
      return {
        usd: 65000,
        change24h: 0,
        change24hUsd: 0,
        lastUpdated: Date.now(),
      };
    }
  }
}

async function fetchNetwork(): Promise<BitcoinData["network"]> {
  try {
    const [difficultyRes, heightRes, mempoolRes] = await Promise.all([
      fetch("https://mempool.space/api/v1/difficulty"),
      fetch("https://mempool.space/api/blocks/tip/height"),
      fetch("https://mempool.space/api/mempool"),
    ]);

    if (!difficultyRes.ok || !heightRes.ok || !mempoolRes.ok) {
      throw new Error("Mempool.space failed");
    }

    const [difficulty, height, mempool] = await Promise.all([
      difficultyRes.json(),
      heightRes.text(),
      mempoolRes.json(),
    ]);

    const blockHeight = parseInt(height);
    const blocksUntilAdjustment = 2016 - (blockHeight % 2016);
    const mempoolSizeMB = mempool.vsize / 1024 / 1024;

    let congestionLevel: BitcoinData["network"]["congestionLevel"] = "low";
    if (mempoolSizeMB > 100) congestionLevel = "critical";
    else if (mempoolSizeMB > 50) congestionLevel = "high";
    else if (mempoolSizeMB > 20) congestionLevel = "medium";

    return {
      difficulty: difficulty.currentDifficulty / 1e12,
      difficultyChange: difficulty.difficultyChange || 0,
      blockHeight,
      blocksUntilAdjustment,
      adjustmentETA: new Date(Date.now() + blocksUntilAdjustment * 10 * 60 * 1000).toISOString(),
      hashrate: (difficulty.currentDifficulty / 1e12) * Math.pow(2, 32) / 600 / 1e18,
      mempoolSize: Math.round(mempoolSizeMB),
      mempoolTxs: mempool.count,
      congestionLevel,
      lastUpdated: Date.now(),
    };
  } catch {
    // Fallback defaults
    return {
      difficulty: 83,
      difficultyChange: 0,
      blockHeight: 890000,
      blocksUntilAdjustment: 1000,
      adjustmentETA: new Date(Date.now() + 1000 * 10 * 60 * 1000).toISOString(),
      hashrate: 600,
      mempoolSize: 30,
      mempoolTxs: 50000,
      congestionLevel: "medium",
      lastUpdated: Date.now(),
    };
  }
}

async function fetchFees(): Promise<BitcoinData["fees"]> {
  try {
    const response = await fetch("https://mempool.space/api/v1/fees/recommended");
    
    if (!response.ok) throw new Error("Mempool.space fees failed");

    const data = await response.json();

    return {
      fastestFee: data.fastestFee,
      halfHourFee: data.halfHourFee,
      hourFee: data.hourFee,
      economyFee: data.economyFee,
      minimumFee: data.minimumFee,
      lastUpdated: Date.now(),
    };
  } catch {
    return {
      fastestFee: 50,
      halfHourFee: 30,
      hourFee: 20,
      economyFee: 10,
      minimumFee: 5,
      lastUpdated: Date.now(),
    };
  }
}

function calculateEconomics(network: BitcoinData["network"]): BitcoinData["economics"] {
  const nextHalvingBlock = Math.ceil(network.blockHeight / 210000) * 210000;
  const blocksRemaining = nextHalvingBlock - network.blockHeight;
  const halvings = Math.floor(network.blockHeight / 210000);
  const blockSubsidy = 50 / Math.pow(2, halvings);

  return {
    blockSubsidy,
    nextHalving: {
      blockHeight: nextHalvingBlock,
      blocksRemaining,
      estimatedDate: new Date(Date.now() + blocksRemaining * 10 * 60 * 1000).toISOString(),
    },
    dailyIssuance: blockSubsidy * 144,
    lastUpdated: Date.now(),
  };
}

// ============================================================================
// Main Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel
    const [price, network, fees] = await Promise.all([
      fetchPrice(),
      fetchNetwork(),
      fetchFees(),
    ]);

    const economics = calculateEconomics(network);

    const data: BitcoinData = {
      price,
      network,
      fees,
      economics,
    };

    // Return with caching headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        "CDN-Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}`,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}`,
      },
    });
  } catch (error) {
    console.error("Bitcoin API error:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch Bitcoin data" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

// ============================================================================
// CORS Preflight
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
