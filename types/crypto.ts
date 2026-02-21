/**
 * Cryptography Types
 * Interfaces and types for SHA-256 visualization and educational tools
 */

// ============================================================================
// Hash Result Types
// ============================================================================

export interface HashResult {
  /** The input string that was hashed */
  input: string;
  /** The nonce value used */
  nonce: number;
  /** The resulting SHA-256 hash (64 hex characters) */
  hash: string;
  /** Number of leading zeros in the hash */
  leadingZeros: number;
  /** Whether this hash meets the difficulty target */
  meetsTarget: boolean;
  /** Timestamp when hash was calculated */
  timestamp: number;
}

export interface MiningAttempt {
  /** The nonce value tried */
  nonce: number;
  /** The resulting hash */
  hash: string;
  /** Whether this attempt was successful */
  success: boolean;
  /** Time taken for this attempt (ms) */
  duration: number;
}

export interface MiningSession {
  /** Unique session ID */
  id: string;
  /** Input data being mined */
  input: string;
  /** Difficulty target (number of leading zeros required) */
  target: number;
  /** All attempts made in this session */
  attempts: MiningAttempt[];
  /** The nonce that solved the block (if any) */
  winningNonce: number | null;
  /** Time when mining started */
  startTime: number;
  /** Time when block was found (if found) */
  endTime: number | null;
  /** Whether mining is currently active */
  isActive: boolean;
}

// ============================================================================
// Difficulty & Target Types
// ============================================================================

export type DifficultyLevel = "easy" | "medium" | "hard" | "extreme";

export interface DifficultyConfig {
  /** Internal identifier */
  id: DifficultyLevel;
  /** Display label */
  label: string;
  /** Number of leading zeros required */
  zeros: number;
  /** Description for educational context */
  description: string;
  /** Estimated attempts needed (approximate) */
  estimatedAttempts: number;
  /** Color coding for UI */
  color: string;
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    zeros: 1,
    description: "1 leading zero - Good for demonstrations",
    estimatedAttempts: 16,
    color: "#39FF14", // Green
  },
  medium: {
    id: "medium",
    label: "Medium",
    zeros: 2,
    description: "2 leading zeros - Takes ~256 attempts on average",
    estimatedAttempts: 256,
    color: "#00F0FF", // Cyan
  },
  hard: {
    id: "hard",
    label: "Hard",
    zeros: 4,
    description: "4 leading zeros - Takes ~65,000 attempts",
    estimatedAttempts: 65536,
    color: "#FF6B00", // Orange
  },
  extreme: {
    id: "extreme",
    label: "Extreme",
    zeros: 6,
    description: "6 leading zeros - Takes ~16 million attempts",
    estimatedAttempts: 16777216,
    color: "#FF3333", // Red
  },
};

// ============================================================================
// Visualizer State Types
// ============================================================================

export interface VisualizerState {
  /** Current input text */
  input: string;
  /** Current nonce value */
  nonce: number;
  /** Selected difficulty level */
  difficulty: DifficultyLevel;
  /** Current hash result */
  currentHash: string;
  /** Whether auto-mining is active */
  isAutoMining: boolean;
  /** Auto-mining speed */
  miningSpeed: MiningSpeed;
  /** Total attempts counter */
  totalAttempts: number;
  /** Mining session stats */
  session: MiningSession | null;
  /** Whether a block has been found */
  blockFound: boolean;
}

export type MiningSpeed = "turtle" | "rabbit" | "lightning";

export const MINING_SPEEDS: Record<MiningSpeed, { label: string; rate: number }> = {
  turtle: { label: "Turtle", rate: 1 },      // 1 nonce/sec
  rabbit: { label: "Rabbit", rate: 10 },     // 10 nonces/sec
  lightning: { label: "Lightning", rate: 100 }, // 100 nonces/sec
};

// ============================================================================
// Matrix Rain Types
// ============================================================================

export interface MatrixCharacter {
  /** Character to display (0, 1, or ₿) */
  char: string;
  /** X position (column) */
  x: number;
  /** Y position (row) */
  y: number;
  /** Fall speed (pixels per frame) */
  speed: number;
  /** Opacity (0-1) */
  opacity: number;
  /** Whether this character is highlighted */
  isHighlighted: boolean;
  /** Character color */
  color: string;
}

export interface MatrixRainConfig {
  /** Number of columns */
  columns: number;
  /** Font size in pixels */
  fontSize: number;
  /** Fall speed multiplier */
  speedMultiplier: number;
  /** Probability of Bitcoin symbol appearing (0-1) */
  bitcoinChance: number;
  /** Probability of highlighted character (0-1) */
  highlightChance: number;
}

// ============================================================================
// Scramble Text Types
// ============================================================================

export interface ScrambleTextProps {
  /** Target text to display */
  text: string;
  /** Duration of scramble animation in ms */
  duration?: number;
  /** Delay before starting animation in ms */
  delay?: number;
  /** Stagger between characters in ms */
  staggerDelay?: number;
  /** Character set for scrambling */
  charset?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Whether animation should trigger */
  trigger?: boolean;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
}

export interface ScrambleCharacter {
  /** Target character */
  target: string;
  /** Current displayed character (during animation) */
  current: string;
  /** Whether this character has finished animating */
  isComplete: boolean;
  /** Random characters to cycle through */
  scrambleChars: string[];
}

// ============================================================================
// Avalanche Effect Types
// ============================================================================

export interface AvalancheDemoData {
  /** Original input text */
  original: string;
  /** Modified input (one character changed) */
  modified: string;
  /** Hash of original */
  originalHash: string;
  /** Hash of modified */
  modifiedHash: string;
  /** Characters that differ between hashes */
  diffIndices: number[];
  /** Percentage of characters that changed */
  changePercentage: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface Sha256VisualizerProps {
  /** Initial input text */
  defaultInput?: string;
  /** Initial difficulty level */
  defaultDifficulty?: DifficultyLevel;
  /** Whether to show avalanche demo */
  showAvalancheDemo?: boolean;
  /** Callback when block is found */
  onBlockFound?: (result: HashResult, attempts: number) => void;
  /** Callback when hash updates */
  onHashUpdate?: (result: HashResult) => void;
}

export interface MatrixRainProps {
  /** Canvas opacity (0-1) */
  opacity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Character density (0-1) */
  density?: number;
  /** React to mouse movement */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface MiningControlsProps {
  /** Current nonce value */
  nonce: number;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Whether auto-mining is active */
  isAutoMining: boolean;
  /** Mining speed */
  speed: MiningSpeed;
  /** Callback when nonce changes */
  onNonceChange: (nonce: number) => void;
  /** Callback when difficulty changes */
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  /** Callback to toggle auto-mining */
  onToggleAutoMine: () => void;
  /** Callback when speed changes */
  onSpeedChange: (speed: MiningSpeed) => void;
  /** Total attempts made */
  totalAttempts: number;
  /** Current hash */
  currentHash: string;
  /** Whether block has been found */
  blockFound: boolean;
}

export interface HashDisplayProps {
  /** The hash string to display */
  hash: string;
  /** Number of leading zeros to highlight */
  highlightZeros: number;
  /** Whether to animate the display */
  animate?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

export interface EducationalTooltipProps {
  /** Tooltip title */
  title: string;
  /** Tooltip content */
  content: string;
  /** Position: 'top', 'bottom', 'left', 'right' */
  position?: "top" | "bottom" | "left" | "right";
  /** Children (the element that triggers the tooltip) */
  children: React.ReactNode;
}

// ============================================================================
// Utility Types
// ============================================================================

export type HashUpdateCallback = (result: HashResult) => void;

export interface MiningStats {
  /** Total nonces tried */
  attempts: number;
  /** Time elapsed in seconds */
  elapsedTime: number;
  /** Current hash rate (hashes per second) */
  hashRate: number;
  /** Best result so far (most leading zeros) */
  bestResult: number;
  /** Whether currently mining */
  isMining: boolean;
}

export interface ChallengeModeState {
  /** Whether challenge mode is active */
  isActive: boolean;
  /** Target difficulty */
  target: number;
  /** User's guess for the nonce */
  userGuess: number;
  /** Whether the guess was correct */
  isCorrect: boolean | null;
  /** Number of attempts made */
  attempts: number;
}
