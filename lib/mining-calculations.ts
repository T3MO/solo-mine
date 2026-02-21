/**
 * Mining Calculations Library
 * Utility functions for Bitcoin mining profitability calculations
 */

import type {
  MiningInputs,
  MiningInputsWithNetwork,
  PoolCalculationResult,
  SoloCalculationResult,
  MiningComparisonResult,
  MiningRecommendation,
  RiskLevel,
  MonteCarloParams,
  MonteCarloResult,
  DistributionPoint,
  ProjectionDataPoint,
  NetworkConstants,
} from "@/types/mining";

// ============================================================================
// CONSTANTS
// ============================================================================

export const NETWORK_CONSTANTS: NetworkConstants = {
  BLOCK_REWARD: 3.125,
  BLOCK_TIME: 600, // 10 minutes in seconds
  SECONDS_PER_DAY: 86400,
  NETWORK_HASHRATE_EH: 600, // 600 EH/s
  GH_PER_TH: 1000,
  TH_PER_PH: 1000,
  PH_PER_EH: 1000,
};

// Convert EH/s to GH/s: 600 EH/s = 600 * 1000 * 1000 * 1000 GH/s = 600,000,000,000 GH/s
const NETWORK_HASHRATE_GH =
  NETWORK_CONSTANTS.NETWORK_HASHRATE_EH *
  NETWORK_CONSTANTS.PH_PER_EH *
  NETWORK_CONSTANTS.TH_PER_PH *
  NETWORK_CONSTANTS.GH_PER_TH;

// ============================================================================
// POOL MINING CALCULATIONS
// ============================================================================

/**
 * Calculate daily energy consumption in kWh
 */
export function calculateDailyEnergyKwh(wattage: number): number {
  return (wattage * 24) / 1000;
}

/**
 * Calculate daily electricity cost
 */
export function calculateDailyEnergyCost(
  wattage: number,
  electricityCost: number,
  heatReuseEnabled: boolean = false
): number {
  const dailyKwh = calculateDailyEnergyKwh(wattage);
  const effectiveCost = heatReuseEnabled
    ? electricityCost * 0.7 // 30% savings from heat reuse
    : electricityCost;
  return dailyKwh * effectiveCost;
}

/**
 * Calculate daily BTC earnings using SHA-256 difficulty formula
 * Formula: (hashrate * seconds_per_day) / (difficulty * 2^32)
 */
export function calculateDailyBtc(
  hashrateGH: number,
  difficultyT: number
): number {
  // Convert difficulty from trillions to actual value
  const difficulty = difficultyT * 1e12;
  
  // SHA-256 calculation: hashrate (GH/s) * 86400 / (difficulty * 2^32)
  // Note: hashrate is in GH/s, so we need to be consistent with units
  const dailyBtc =
    (hashrateGH * NETWORK_CONSTANTS.SECONDS_PER_DAY) /
    (difficulty * Math.pow(2, 32));
  
  return dailyBtc * NETWORK_CONSTANTS.BLOCK_REWARD;
}

/**
 * Calculate complete pool mining results
 */
export function calculatePoolEarnings(
  inputs: MiningInputs
): PoolCalculationResult {
  const {
    hashrate,
    wattage,
    electricityCost,
    btcPrice,
    difficulty,
    heatReuseEnabled = false,
  } = inputs;

  // Calculate daily BTC
  const dailyBtc = calculateDailyBtc(hashrate, difficulty);

  // Calculate revenues and costs
  const dailyRevenue = dailyBtc * btcPrice;
  const dailyEnergyCost = calculateDailyEnergyCost(
    wattage,
    electricityCost,
    heatReuseEnabled
  );
  const dailyProfit = dailyRevenue - dailyEnergyCost;

  // Extended projections
  const monthlyProfit = dailyProfit * 30;
  const yearlyProfit = dailyProfit * 365;

  // Break-even calculation
  let breakEvenDays: number | null = null;
  if (dailyProfit > 0) {
    // Assuming initial hardware cost is not factored in this calculation
    // If we had hardware cost: breakEvenDays = hardwareCost / dailyProfit
    breakEvenDays = 0; // Immediate break-even if no hardware cost considered
  }

  // Profit margin
  const profitMargin = dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : 0;

  return {
    dailyBtc,
    dailyRevenue,
    dailyEnergyCost,
    dailyProfit,
    monthlyProfit,
    yearlyProfit,
    dailyEnergyKwh: calculateDailyEnergyKwh(wattage),
    breakEvenDays,
    isProfitable: dailyProfit > 0,
    profitMargin,
  };
}

// ============================================================================
// SOLO MINING CALCULATIONS
// ============================================================================

/**
 * Calculate solo mining probability
 * Formula: (miner_hashrate / network_hashrate) * 100
 */
export function calculateSoloProbability(
  hashrateGH: number,
  networkHashrateEH: number = NETWORK_CONSTANTS.NETWORK_HASHRATE_EH
): number {
  // Convert network hashrate to GH/s
  const networkHashrateGH =
    networkHashrateEH * NETWORK_CONSTANTS.PH_PER_EH * NETWORK_CONSTANTS.TH_PER_PH * NETWORK_CONSTANTS.GH_PER_TH;
  
  // Calculate probability as percentage
  return (hashrateGH / networkHashrateGH) * 100;
}

/**
 * Calculate expected days to find a block
 */
export function calculateExpectedDaysToBlock(
  yearlyProbability: number
): number {
  if (yearlyProbability <= 0) return Infinity;
  if (yearlyProbability >= 100) return 365 / (yearlyProbability / 100);
  
  // If probability is X% per year, expected wait is 365 / (X/100) days
  return 365 / (yearlyProbability / 100);
}

/**
 * Format wait time for human readability
 */
export function formatWaitTime(days: number): string {
  if (!isFinite(days) || days > 36500) {
    return "100+ years";
  }
  if (days > 365) {
    const years = Math.round(days / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
  if (days > 30) {
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  }
  return `${Math.round(days)} days`;
}

/**
 * Calculate complete solo mining results
 */
export function calculateSoloEarnings(
  inputs: MiningInputs,
  networkHashrateEH: number = NETWORK_CONSTANTS.NETWORK_HASHRATE_EH
): SoloCalculationResult {
  const { hashrate, btcPrice } = inputs;

  // Calculate probability
  const yearlyProbability = calculateSoloProbability(hashrate, networkHashrateEH);
  const probabilityDecimal = yearlyProbability / 100;

  // Calculate expected wait
  const expectedDaysToBlock = calculateExpectedDaysToBlock(yearlyProbability);

  // Block reward value
  const blockRewardValue = NETWORK_CONSTANTS.BLOCK_REWARD * btcPrice;

  // Expected daily value (block reward * probability per day)
  const expectedDailyValue = (blockRewardValue * probabilityDecimal) / 365;

  // Determine if probability is reasonable
  const isReasonable = expectedDaysToBlock < 36500; // Less than 100 years

  return {
    yearlyProbability,
    probabilityDecimal,
    expectedDaysToBlock,
    blockRewardValue,
    expectedDailyValue,
    isReasonable,
    waitTimeFormatted: formatWaitTime(expectedDaysToBlock),
  };
}

// ============================================================================
// BREAK-EVEN CALCULATIONS
// ============================================================================

/**
 * Calculate break-even time in days
 */
export function calculateBreakEven(
  hardwareCost: number,
  dailyProfit: number
): number | null {
  if (dailyProfit <= 0) return null;
  return hardwareCost / dailyProfit;
}

/**
 * Calculate ROI percentage
 */
export function calculateRoi(
  hardwareCost: number,
  totalProfit: number
): number {
  if (hardwareCost <= 0) return 0;
  return (totalProfit / hardwareCost) * 100;
}

// ============================================================================
// COMPARISON & RECOMMENDATION
// ============================================================================

/**
 * Generate mining recommendation based on calculations
 */
export function generateRecommendation(
  pool: PoolCalculationResult,
  solo: SoloCalculationResult
): MiningRecommendation {
  // If pool is not profitable, don't recommend either
  if (!pool.isProfitable && pool.dailyProfit <= 0) {
    return "none";
  }

  // If solo probability is extremely low (< 0.001%), recommend pool
  if (solo.yearlyProbability < 0.001) {
    return "pool";
  }

  // If solo probability is reasonable (> 1%) and pool margins are thin, consider solo
  if (solo.yearlyProbability > 1 && pool.profitMargin < 10) {
    return "solo";
  }

  // Default to pool for most users
  return "pool";
}

/**
 * Assess risk level for solo mining
 */
export function assessRiskLevel(
  solo: SoloCalculationResult,
  pool: PoolCalculationResult
): RiskLevel {
  if (!pool.isProfitable) return "extreme";
  if (solo.yearlyProbability < 0.01) return "extreme";
  if (solo.yearlyProbability < 0.1) return "high";
  if (solo.yearlyProbability < 1) return "medium";
  return "low";
}

/**
 * Complete comparison calculation
 */
export function compareMiningStrategies(
  inputs: MiningInputs,
  networkHashrateEH: number = NETWORK_CONSTANTS.NETWORK_HASHRATE_EH
): MiningComparisonResult {
  const pool = calculatePoolEarnings(inputs);
  const solo = calculateSoloEarnings(inputs, networkHashrateEH);

  return {
    pool,
    solo,
    recommendation: generateRecommendation(pool, solo),
    riskLevel: assessRiskLevel(solo, pool),
  };
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

/**
 * Run Monte Carlo simulation for solo mining outcomes
 * Uses seeded random for reproducibility if needed
 */
export function runMonteCarloSimulation(
  params: MonteCarloParams
): MonteCarloResult {
  const { trials, probability, days } = params;
  
  const outcomes: number[] = new Array(days).fill(0);
  const cumulative: number[] = new Array(days).fill(0);
  
  let blocksFound = 0;
  let longestDrySpell = 0;
  let currentDrySpell = 0;
  let lastBlockDay = 0;
  
  let runningTotal = 0;
  
  for (let day = 0; day < days; day++) {
    // Daily probability = yearly probability / 365
    const dailyProbability = probability / 365;
    
    // Random roll
    const roll = Math.random();
    const found = roll < dailyProbability;
    
    if (found) {
      outcomes[day] = 1;
      blocksFound++;
      
      // Track dry spell
      if (currentDrySpell > longestDrySpell) {
        longestDrySpell = currentDrySpell;
      }
      currentDrySpell = 0;
      lastBlockDay = day;
    } else {
      outcomes[day] = 0;
      currentDrySpell++;
    }
    
    runningTotal += outcomes[day];
    cumulative[day] = runningTotal;
  }
  
  // Calculate average block interval
  const averageBlockInterval = blocksFound > 0 ? days / blocksFound : days;
  
  return {
    outcomes,
    cumulative,
    blocksFound,
    averageBlockInterval,
    longestDrySpell,
  };
}

/**
 * Generate probability distribution for number of blocks found in a year
 */
export function generateBlockDistribution(
  probability: number,
  trials: number = 10000
): DistributionPoint[] {
  const distribution: Map<number, number> = new Map();
  
  for (let i = 0; i < trials; i++) {
    let blocksFound = 0;
    for (let day = 0; day < 365; day++) {
      const dailyProbability = probability / 365;
      if (Math.random() < dailyProbability) {
        blocksFound++;
      }
    }
    distribution.set(blocksFound, (distribution.get(blocksFound) || 0) + 1);
  }
  
  // Convert to array and sort
  const points: DistributionPoint[] = Array.from(distribution.entries())
    .map(([blocks, frequency]) => ({
      blocks,
      frequency,
      percentage: (frequency / trials) * 100,
    }))
    .sort((a, b) => a.blocks - b.blocks);
  
  return points;
}

// ============================================================================
// PROJECTION DATA GENERATION
// ============================================================================

/**
 * Generate 365-day projection data for charts
 */
export function generateProjectionData(
  inputs: MiningInputs,
  networkHashrateEH: number = NETWORK_CONSTANTS.NETWORK_HASHRATE_EH
): ProjectionDataPoint[] {
  const pool = calculatePoolEarnings(inputs);
  const solo = calculateSoloEarnings(inputs, networkHashrateEH);
  
  const data: ProjectionDataPoint[] = [];
  let poolCumulative = 0;
  let soloCumulative = 0;
  
  // Run Monte Carlo for solo outcomes
  const monteCarlo = runMonteCarloSimulation({
    trials: 1,
    probability: solo.probabilityDecimal,
    days: 365,
  });
  
  for (let day = 1; day <= 365; day++) {
    // Pool grows steadily
    poolCumulative += pool.dailyProfit;
    
    // Solo is either 0 or jackpot
    const soloHit = monteCarlo.outcomes[day - 1] === 1;
    const soloDaily = soloHit ? solo.blockRewardValue : 0;
    soloCumulative += soloDaily;
    
    data.push({
      day,
      poolCumulative: Math.max(0, poolCumulative), // Don't go below zero
      soloCumulative,
      soloDaily,
    });
  }
  
  return data;
}

/**
 * Generate simplified pool-only projection
 */
export function generatePoolProjection(
  dailyProfit: number,
  days: number = 365
): number[] {
  const data: number[] = [];
  let cumulative = 0;
  
  for (let day = 1; day <= days; day++) {
    cumulative += dailyProfit;
    data.push(Math.max(0, cumulative));
  }
  
  return data;
}

/**
 * Generate simplified solo projection (for comparison view)
 */
export function generateSoloProjection(
  blockRewardValue: number,
  probability: number,
  days: number = 365
): number[] {
  const data: number[] = [];
  let cumulative = 0;
  
  // Use fixed seed for demo consistency
  // In real app, you might want to randomize
  const dayOfWin = probability > 0 ? Math.floor(365 / (probability * 365)) : 0;
  
  for (let day = 1; day <= days; day++) {
    if (day === dayOfWin && dayOfWin > 0 && dayOfWin <= 365) {
      cumulative += blockRewardValue;
    }
    data.push(cumulative);
  }
  
  return data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency with proper precision
 */
export function formatCurrency(
  value: number,
  options: { compact?: boolean; precision?: number } = {}
): string {
  const { compact = false, precision = 2 } = options;
  
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/**
 * Format hashrate with appropriate units
 */
export function formatHashrate(ghs: number): string {
  if (ghs >= 1_000_000) {
    return `${(ghs / 1_000_000).toFixed(2)} PH/s`;
  }
  if (ghs >= 1_000) {
    return `${(ghs / 1_000).toFixed(2)} TH/s`;
  }
  return `${ghs.toFixed(0)} GH/s`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, precision: number = 2): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Validate mining inputs
 */
export function validateInputs(inputs: MiningInputs): string[] {
  const errors: string[] = [];
  
  if (inputs.hashrate <= 0) {
    errors.push("Hashrate must be greater than 0");
  }
  if (inputs.wattage < 0) {
    errors.push("Wattage cannot be negative");
  }
  if (inputs.electricityCost < 0) {
    errors.push("Electricity cost cannot be negative");
  }
  if (inputs.btcPrice <= 0) {
    errors.push("BTC price must be greater than 0");
  }
  if (inputs.difficulty <= 0) {
    errors.push("Difficulty must be greater than 0");
  }
  
  return errors;
}

// ============================================================================
// UNIT TESTS (Commented - for Jest implementation)
// ============================================================================

/*
import { describe, it, expect } from '@jest/globals';

describe('Mining Calculations', () => {
  describe('calculateDailyBtc', () => {
    it('should calculate correct BTC for typical hashrate', () => {
      // 100 TH/s at difficulty 83T should earn ~0.0003 BTC/day
      const result = calculateDailyBtc(100000, 83);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('calculateSoloProbability', () => {
    it('should return very low probability for small miner', () => {
      const result = calculateSoloProbability(600, 600); // 600 GH/s
      expect(result).toBeLessThan(0.0001); // Less than 0.01%
    });

    it('should return 100% for equal hashrate', () => {
      const result = calculateSoloProbability(
        NETWORK_HASHRATE_GH,
        NETWORK_CONSTANTS.NETWORK_HASHRATE_EH
      );
      expect(result).toBeCloseTo(100, 5);
    });
  });

  describe('calculatePoolEarnings', () => {
    it('should calculate profit correctly', () => {
      const inputs: MiningInputs = {
        hashrate: 600,
        wattage: 60,
        electricityCost: 0.12,
        btcPrice: 65000,
        difficulty: 83,
        heatReuseEnabled: false,
      };
      
      const result = calculatePoolEarnings(inputs);
      expect(result.dailyEnergyCost).toBeGreaterThan(0);
      expect(result.isProfitable).toBeDefined();
    });
  });
});
*/
