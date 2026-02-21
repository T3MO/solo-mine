/**
 * Hardware Types
 * Interfaces for mining hardware devices and marketplace
 */

// ============================================================================
// Device Categories
// ============================================================================

export type DeviceCategory = "home-miner" | "asic" | "industrial";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ============================================================================
// Hardware Device
// ============================================================================

export interface HardwareDevice {
  /** Unique identifier */
  id: string;
  /** Device name */
  name: string;
  /** Manufacturer name */
  manufacturer: string;
  /** Category classification */
  category: DeviceCategory;
  /** Price in USD */
  price: number;
  /** Hashrate value */
  hashrate: number;
  /** Hashrate unit (GH/s, TH/s, PH/s) */
  hashrateUnit: string;
  /** Power consumption in watts */
  wattage: number;
  /** Noise level in decibels */
  noise: number;
  /** Efficiency in J/TH (lower is better) */
  efficiency: number;
  /** Can be configured for solo mining */
  soloCapable: boolean;
  /** Pool mining is recommended (or only option) */
  poolRecommended: boolean;
  /** Setup difficulty level */
  difficulty: DifficultyLevel;
  /** Product image path */
  image: string;
  /** Affiliate purchase URL */
  affiliateUrl: string;
  /** List of advantages */
  pros: string[];
  /** List of disadvantages */
  cons: string[];
  /** Ideal use cases */
  bestFor: string[];
  /** Pool setup instructions (3-4 steps) */
  setupPool: string[];
  /** Solo setup instructions (null if not solo capable) */
  setupSolo: string[] | null;
  /** Human-readable expected time to find block */
  expectedBlockTime: string | null;
  /** Daily profit/loss in USD at $0.12/kWh */
  dailyProfitUsd: number;
  /** Release date */
  releaseDate: string;
  /** Is this a new release (within 30 days) */
  isNew: boolean;
  /** Is this the recommended beginner option */
  isBestValue: boolean;
  /** Product description */
  description: string;
}

// ============================================================================
// Hardware Filters
// ============================================================================

export type HardwareSortOption = 
  | "featured"
  | "price-asc"
  | "price-desc"
  | "hashrate-desc"
  | "noise-asc"
  | "efficiency-asc";

export type HardwareFilterCategory =
  | "all"
  | "beginner"
  | "solo-capable"
  | "pool-only"
  | "most-efficient"
  | "quiet";

export interface HardwareFilters {
  /** Search query */
  search: string;
  /** Category filter */
  category: HardwareFilterCategory;
  /** Sort option */
  sort: HardwareSortOption;
  /** Maximum price */
  maxPrice: number | null;
  /** Maximum noise level */
  maxNoise: number | null;
}

// ============================================================================
// Component Props
// ============================================================================

export interface HardwareCardProps {
  /** Device data */
  device: HardwareDevice;
  /** User's electricity cost per kWh */
  electricityCost: number;
  /** Callback when mode guide is opened */
  onOpenModeGuide: (device: HardwareDevice) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface HardwareGridProps {
  /** List of devices to display */
  devices: HardwareDevice[];
  /** User's electricity cost */
  electricityCost: number;
  /** Callback when mode guide is opened */
  onOpenModeGuide: (device: HardwareDevice) => void;
}

export interface ModeGuideSheetProps {
  /** Selected device */
  device: HardwareDevice | null;
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet closes */
  onClose: () => void;
  /** User's electricity cost for profit calculations */
  electricityCost: number;
}

export interface HardwareFiltersProps {
  /** Current filter values */
  filters: HardwareFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: HardwareFilters) => void;
  /** Total number of devices */
  totalDevices: number;
  /** Number of filtered devices */
  filteredCount: number;
}

// ============================================================================
// Profitability Calculation
// ============================================================================

export interface ProfitabilityResult {
  /** Is this device profitable at given electricity rate */
  isProfitable: boolean;
  /** Daily profit/loss in USD */
  dailyProfit: number;
  /** Monthly profit/loss in USD */
  monthlyProfit: number;
  /** Yearly profit/loss in USD */
  yearlyProfit: number;
  /** Break-even days (null if never) */
  breakEvenDays: number | null;
  /** Electricity cost per day */
  dailyElectricityCost: number;
  /** Revenue per day */
  dailyRevenue: number;
}

// ============================================================================
// Affiliate & Commerce
// ============================================================================

export interface AffiliateLink {
  /** Device ID */
  deviceId: string;
  /** Display text for the link */
  label: string;
  /** Full affiliate URL */
  url: string;
  /** Price at time of listing */
  price: number;
  /** Last verified date */
  lastVerified: string;
}

// ============================================================================
// View State
// ============================================================================

export type HardwareViewMode = "grid" | "list";

export interface HardwareViewState {
  /** Current view mode */
  viewMode: HardwareViewMode;
  /** Currently open device detail (for modal) */
  selectedDevice: HardwareDevice | null;
  /** Whether mode guide is open */
  isModeGuideOpen: boolean;
  /** Expanded filters (mobile) */
  isFiltersExpanded: boolean;
}

// ============================================================================
// Comparison Feature
// ============================================================================

export interface HardwareComparisonItem {
  /** Device being compared */
  device: HardwareDevice;
  /** Whether to highlight this device */
  isHighlighted: boolean;
}

export interface HardwareComparisonState {
  /** Devices in comparison list */
  items: HardwareComparisonItem[];
  /** Maximum allowed comparisons */
  maxComparisons: number;
}
