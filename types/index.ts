import { ReactNode } from "react";

// ============================================================================
// Theme Types
// ============================================================================

export interface ThemeProviderProps {
  children: ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  forcedTheme?: string;
}

// ============================================================================
// Component Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
}

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

// ============================================================================
// 3D Types
// ============================================================================

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MeshProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export interface LocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================================================
// Re-exports from specific type modules
// ============================================================================

// Loading sequence types
export type {
  LoadingPhase,
  LoadingSequenceProps,
  PhaseConfig,
  LoadingState,
  Position2D,
  RunawayButtonProps,
  RunawayButtonState,
  ScrambleTextProps,
  TypewriterProps,
  EnhancedParticleFieldProps,
  FlashOverlayProps,
  GridFloorProps,
  FloatingStat,
  FloatingStatsProps,
  HexagonButtonProps,
  SkipButtonProps,
  SoundConfig,
  LoadingSequenceSounds,
  SoundController,
} from "./loading";

// Mining calculator types
export type {
  DeviceConfig,
  DevicePreset,
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
  ChartDataset as MiningChartDataset,
  ProjectionChartData,
  ElectricityPreset,
  SimulationState,
  VarianceSimulatorProps,
  ProjectionChartProps,
  MiningMetricsCardProps,
} from "./mining";

export { DEVICE_PRESETS, ELECTRICITY_PRESETS, NETWORK_CONSTANTS } from "./mining";

// Cryptography/SHA-256 types
export type {
  HashResult,
  MiningAttempt,
  MiningSession,
  DifficultyLevel,
  DifficultyConfig,
  VisualizerState,
  MiningSpeed,
  MatrixCharacter,
  MatrixRainConfig,
  ScrambleTextProps as CryptoScrambleTextProps,
  ScrambleCharacter,
  AvalancheDemoData,
  Sha256VisualizerProps,
  MatrixRainProps,
  MiningControlsProps,
  HashDisplayProps,
  EducationalTooltipProps,
  HashUpdateCallback,
  MiningStats,
  ChallengeModeState,
} from "./crypto";

export { DIFFICULTY_PRESETS, MINING_SPEEDS } from "./crypto";

// Hardware marketplace types
export type {
  DeviceCategory,
  HardwareDevice,
  HardwareSortOption,
  HardwareFilterCategory,
  HardwareFilters,
  HardwareCardProps,
  HardwareGridProps,
  ModeGuideSheetProps,
  HardwareFiltersProps,
  ProfitabilityResult,
  AffiliateLink,
  HardwareViewMode,
  HardwareViewState,
  HardwareComparisonItem,
  HardwareComparisonState,
} from "./hardware";
