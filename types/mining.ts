/**
 * Mining Types
 * Interfaces and types for the Variance Simulator and mining calculations
 */

// ============================================================================
// Device Configuration
// ============================================================================

export interface DeviceConfig {
  id: string;
  name: string;
  hashrate: number; // in GH/s
  wattage: number; // in watts
  efficiency: number; // J/TH
  price?: number; // USD
  releaseDate?: string;
}

export type DevicePreset = 
  | "bitaxe600" 
  | "nerdqaxe4t" 
  | "avalonnano" 
  | "bitmainantminers9" 
  | "custom";

// ============================================================================
// Mining Inputs
// ============================================================================

export interface MiningInputs {
  /** Hashrate in GH/s */
  hashrate: number;
  /** Power consumption in watts */
  wattage: number;
  /** Electricity cost in USD per kWh */
  electricityCost: number;
  /** Current BTC price in USD */
  btcPrice: number;
  /** Network difficulty (trillions) */
  difficulty: number;
  /** Whether to apply heat reuse savings (30% reduction) */
  heatReuseEnabled: boolean;
  /** Block reward in BTC (default 3.125) */
  blockReward?: number;
}

export interface MiningInputsWithNetwork extends MiningInputs {
  /** Network hashrate in EH/s */
  networkHashrate: number;
}

// ============================================================================
// Calculation Results
// ============================================================================

export interface PoolCalculationResult {
  /** Daily BTC earned */
  dailyBtc: number;
  /** Daily revenue in USD */
  dailyRevenue: number;
  /** Daily electricity cost in USD */
  dailyEnergyCost: number;
  /** Daily profit in USD */
  dailyProfit: number;
  /** Monthly projection in USD */
  monthlyProfit: number;
  /** Yearly projection in USD */
  yearlyProfit: number;
  /** Energy consumption in kWh per day */
  dailyEnergyKwh: number;
  /** Break-even days (if profitable) */
  breakEvenDays: number | null;
  /** Whether mining is profitable */
  isProfitable: boolean;
  /** Profit margin percentage */
  profitMargin: number;
}

export interface SoloCalculationResult {
  /** Probability of finding a block in one year (0-100) */
  yearlyProbability: number;
  /** Probability as decimal (0-1) */
  probabilityDecimal: number;
  /** Expected days to find a block */
  expectedDaysToBlock: number;
  /** Block reward value in USD */
  blockRewardValue: number;
  /** Expected value per day in USD (block reward * probability / 365) */
  expectedDailyValue: number;
  /** Whether probability is reasonable (< 100 years) */
  isReasonable: boolean;
  /** Human-readable wait time */
  waitTimeFormatted: string;
}

export interface MiningComparisonResult {
  pool: PoolCalculationResult;
  solo: SoloCalculationResult;
  /** Recommendation: 'pool' | 'solo' | 'none' */
  recommendation: MiningRecommendation;
  /** Risk level: 'low' | 'medium' | 'high' | 'extreme' */
  riskLevel: RiskLevel;
}

export type MiningRecommendation = "pool" | "solo" | "none";
export type RiskLevel = "low" | "medium" | "high" | "extreme";

// ============================================================================
// Monte Carlo Simulation
// ============================================================================

export interface MonteCarloParams {
  /** Number of simulation trials */
  trials: number;
  /** Probability of success per trial (0-1) */
  probability: number;
  /** Number of days to simulate */
  days: number;
}

export interface MonteCarloResult {
  /** Array of daily outcomes (0 or block reward) */
  outcomes: number[];
  /** Cumulative outcomes over time */
  cumulative: number[];
  /** Number of blocks found */
  blocksFound: number;
  /** Average days between blocks */
  averageBlockInterval: number;
  /** Longest streak without blocks */
  longestDrySpell: number;
}

export interface DistributionPoint {
  /** Number of blocks found */
  blocks: number;
  /** Frequency of this outcome */
  frequency: number;
  /** Percentage of trials */
  percentage: number;
}

// ============================================================================
// Chart Data
// ============================================================================

export interface ProjectionDataPoint {
  /** Day number (1-365) */
  day: number;
  /** Pool cumulative earnings */
  poolCumulative: number;
  /** Solo cumulative earnings */
  soloCumulative: number;
  /** Solo daily outcome (0 or jackpot) */
  soloDaily: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  tension?: number;
}

export interface ProjectionChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// ============================================================================
// Electricity Presets
// ============================================================================

export interface ElectricityPreset {
  label: string;
  value: number;
  region?: string;
}

export const ELECTRICITY_PRESETS: ElectricityPreset[] = [
  { label: "Very Low", value: 0.05, region: "Iceland, Quebec" },
  { label: "Low", value: 0.08, region: "US Average" },
  { label: "Medium", value: 0.12, region: "EU Average" },
  { label: "High", value: 0.20, region: "Germany, Denmark" },
  { label: "Very High", value: 0.30, region: "Peak Hours" },
];

// ============================================================================
// Device Presets Data
// ============================================================================

export const DEVICE_PRESETS: Record<DevicePreset, DeviceConfig> = {
  bitaxe600: {
    id: "bitaxe600",
    name: "Bitaxe 600",
    hashrate: 600, // 600 GH/s = 0.6 TH/s
    wattage: 60,
    efficiency: 100, // 60W / 0.6TH = 100 J/TH
    price: 150,
    releaseDate: "2024",
  },
  nerdqaxe4t: {
    id: "nerdqaxe4t",
    name: "NerdQaxe 4.8T",
    hashrate: 4800, // 4800 GH/s = 4.8 TH/s
    wattage: 80,
    efficiency: 16.67, // 80W / 4.8TH = 16.67 J/TH
    price: 350,
    releaseDate: "2024",
  },
  avalonnano: {
    id: "avalonnano",
    name: "Avalon Nano 3",
    hashrate: 3000, // 3 TH/s
    wattage: 140,
    efficiency: 46.67,
    price: 200,
    releaseDate: "2024",
  },
  bitmainantminers9: {
    id: "bitmainantminers9",
    name: "Bitmain S9 (refurb)",
    hashrate: 14000, // 14 TH/s
    wattage: 1320,
    efficiency: 94.29,
    price: 300,
    releaseDate: "2016",
  },
  custom: {
    id: "custom",
    name: "Custom Setup",
    hashrate: 1000,
    wattage: 100,
    efficiency: 0,
  },
};

// ============================================================================
// Network Constants
// ============================================================================

export interface NetworkConstants {
  /** Current block reward in BTC */
  BLOCK_REWARD: number;
  /** Block time in seconds (10 minutes) */
  BLOCK_TIME: number;
  /** Seconds per day */
  SECONDS_PER_DAY: number;
  /** Network hashrate in EH/s */
  NETWORK_HASHRATE_EH: number;
  /** GH/s per TH/s */
  GH_PER_TH: number;
  /** TH/s per PH/s */
  TH_PER_PH: number;
  /** PH/s per EH/s */
  PH_PER_EH: number;
}

export const NETWORK_CONSTANTS: NetworkConstants = {
  BLOCK_REWARD: 3.125,
  BLOCK_TIME: 600,
  SECONDS_PER_DAY: 86400,
  NETWORK_HASHRATE_EH: 600,
  GH_PER_TH: 1000,
  TH_PER_PH: 1000,
  PH_PER_EH: 1000,
};

// ============================================================================
// Simulation State
// ============================================================================

export interface SimulationState {
  /** Current day in simulation (1-365) */
  currentDay: number;
  /** Whether simulation is running */
  isRunning: boolean;
  /** Pool cumulative earnings at current day */
  poolEarnings: number;
  /** Solo cumulative earnings at current day */
  soloEarnings: number;
  /** Whether solo hit jackpot on current day */
  soloJackpot: boolean;
  /** Playback speed multiplier */
  speed: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface VarianceSimulatorProps {
  /** Initial inputs for the simulator */
  initialInputs?: Partial<MiningInputs>;
  /** Callback when inputs change */
  onInputsChange?: (inputs: MiningInputs) => void;
  /** Whether to show advanced options */
  showAdvanced?: boolean;
}

export interface ProjectionChartProps {
  /** Pool data - array of 365 daily cumulative values */
  poolData: number[];
  /** Solo data - array of 365 daily cumulative values */
  soloData: number[];
  /** Color for pool line (default: cyan) */
  colorPool?: string;
  /** Color for solo line (default: orange) */
  colorSolo?: string;
  /** Height of chart in pixels */
  height?: number;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}

export interface MiningMetricsCardProps {
  /** Title of the card */
  title: string;
  /** Color scheme: 'pool' (cyan) or 'solo' (orange) */
  variant: "pool" | "solo";
  /** Primary metric value */
  primaryValue: string;
  /** Primary metric label */
  primaryLabel: string;
  /** Secondary metrics array */
  secondaryMetrics: Array<{
    label: string;
    value: string;
    trend?: "up" | "down" | "neutral";
  }>;
  /** Status badge text */
  statusText: string;
  /** Whether showing warning state */
  isWarning?: boolean;
}
