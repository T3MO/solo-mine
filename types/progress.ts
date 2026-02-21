/**
 * Progress Tracking Types
 * Interfaces for user progress, achievements, and journey tracking
 */

// ============================================================================
// Progress Schema Version
// ============================================================================

export const PROGRESS_SCHEMA_VERSION = 1;

// ============================================================================
// Lesson Progress
// ============================================================================

export type LessonId = "sha256" | "simulator" | "hardware" | "quiz";

export interface LessonProgress {
  /** Whether lesson is completed */
  completed: boolean;
  /** Timestamp when completed */
  completedAt?: number;
  /** Progress percentage (0-100) */
  percentComplete: number;
  /** Last visited timestamp */
  lastVisited?: number;
  /** Sections viewed within lesson */
  sectionsViewed: string[];
}

export interface LessonsProgress {
  sha256: LessonProgress;
  simulator: LessonProgress;
  hardware: LessonProgress;
  quiz: LessonProgress;
}

export const DEFAULT_LESSONS_PROGRESS: LessonsProgress = {
  sha256: { completed: false, percentComplete: 0, sectionsViewed: [] },
  simulator: { completed: false, percentComplete: 0, sectionsViewed: [] },
  hardware: { completed: false, percentComplete: 0, sectionsViewed: [] },
  quiz: { completed: false, percentComplete: 0, sectionsViewed: [] },
};

// ============================================================================
// User Stats
// ============================================================================

export interface UserStats {
  /** Number of variance simulations run */
  simulationsRun: number;
  /** Number of unique hardware devices viewed */
  devicesViewed: number;
  /** Number of blocks found in SHA-256 visualizer */
  blocksFound: number;
  /** Number of hashes computed in visualizer */
  hashesComputed: number;
  /** Number of quizzes completed */
  quizzesCompleted: number;
  /** Total time spent on platform (minutes) */
  totalTimeMinutes: number;
  /** First visit timestamp */
  firstVisit: number;
  /** Last visit timestamp */
  lastVisit: number;
}

export const DEFAULT_USER_STATS: UserStats = {
  simulationsRun: 0,
  devicesViewed: 0,
  blocksFound: 0,
  hashesComputed: 0,
  quizzesCompleted: 0,
  totalTimeMinutes: 0,
  firstVisit: Date.now(),
  lastVisit: Date.now(),
};

// ============================================================================
// Achievements
// ============================================================================

export type AchievementId =
  | "hash-master"
  | "risk-analyst"
  | "hardware-scout"
  | "smart-miner"
  | "speed-runner"
  | "diamond-hands"
  | "educator"
  | "completest";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "hash-master",
    name: "Hash Master",
    description: "Found a block with 2+ leading zeros in the SHA-256 visualizer",
    icon: "🔐",
    condition: "blocksFound >= 1",
  },
  {
    id: "risk-analyst",
    name: "Risk Analyst",
    description: "Ran 5+ variance simulations to compare Pool vs Solo",
    icon: "📊",
    condition: "simulationsRun >= 5",
  },
  {
    id: "hardware-scout",
    name: "Hardware Scout",
    description: "Viewed all 6 hardware devices in the showcase",
    icon: "🔍",
    condition: "devicesViewed >= 6",
  },
  {
    id: "smart-miner",
    name: "Smart Miner",
    description: "Only viewed hardware that's profitable at your electricity rate",
    icon: "🧠",
    condition: "profitableOnlyViews",
  },
  {
    id: "speed-runner",
    name: "Speed Runner",
    description: "Completed all 3 lessons in under 30 minutes",
    icon: "⚡",
    condition: "fastCompletion",
  },
  {
    id: "diamond-hands",
    name: "Diamond Hands",
    description: "Saved 3+ different mining configurations",
    icon: "💎",
    condition: "savedConfigs >= 3",
  },
  {
    id: "educator",
    name: "Educator",
    description: "Revisited SHA-256 lesson after completing it",
    icon: "📚",
    condition: "revisitedLesson",
  },
  {
    id: "completest",
    name: "The Completest",
    description: "Completed all lessons, all achievements, viewed all hardware",
    icon: "👑",
    condition: "100% complete",
  },
];

// ============================================================================
// Saved Configurations
// ============================================================================

export interface SavedConfig {
  /** Unique ID */
  id: string;
  /** User-provided name */
  name: string;
  /** Device ID */
  deviceId: string;
  /** Device name (denormalized for display) */
  deviceName: string;
  /** Electricity cost per kWh */
  electricityCost: number;
  /** Calculated daily profit */
  dailyProfit: number;
  /** Timestamp */
  savedAt: number;
}

// ============================================================================
// Main Progress State
// ============================================================================

export interface ProgressState {
  /** Schema version for migrations */
  version: number;
  /** Lesson completion status */
  lessons: LessonsProgress;
  /** User statistics */
  stats: UserStats;
  /** Unlocked achievement IDs */
  achievements: AchievementId[];
  /** Saved simulator configurations */
  savedConfigs: SavedConfig[];
  /** IDs of viewed hardware devices */
  viewedDevices: string[];
  /** Last visited page path */
  lastVisited: string;
  /** New hardware timestamp (for badge) */
  newHardwareTimestamp?: number;
}

export const DEFAULT_PROGRESS_STATE: ProgressState = {
  version: PROGRESS_SCHEMA_VERSION,
  lessons: DEFAULT_LESSONS_PROGRESS,
  stats: DEFAULT_USER_STATS,
  achievements: [],
  savedConfigs: [],
  viewedDevices: [],
  lastVisited: "/",
};

// ============================================================================
// Journey Milestones
// ============================================================================

export interface JourneyMilestone {
  id: LessonId | "ready";
  label: string;
  description: string;
  icon: string;
  href: string;
  requires?: LessonId[];
}

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: "sha256",
    label: "SHA-256 Fundamentals",
    description: "Understand the cryptographic foundation",
    icon: "🔐",
    href: "/learn/sha256",
  },
  {
    id: "simulator",
    label: "Pool vs Solo Strategy",
    description: "Compare mining approaches",
    icon: "⚖️",
    href: "/tools/variance-simulator",
  },
  {
    id: "hardware",
    label: "Hardware Selection",
    description: "Choose your mining device",
    icon: "🔧",
    href: "/hardware",
  },
  {
    id: "ready",
    label: "Ready to Mine",
    description: "Start your mining journey",
    icon: "🚀",
    href: "/dashboard",
    requires: ["sha256", "simulator", "hardware"],
  },
];

// ============================================================================
// Component Props
// ============================================================================

export interface FuturisticDockProps {
  /** Current pathname for active state */
  currentPath: string;
}

export interface JourneyTrackerProps {
  /** Current progress state */
  progress: ProgressState;
  /** Whether to allow clicking locked milestones */
  allowClickLocked?: boolean;
}

export interface AchievementToastProps {
  /** Achievement that was just unlocked */
  achievement: Achievement;
  /** Callback when toast closes */
  onClose: () => void;
}

export interface ProgressCardProps {
  /** Card title */
  title: string;
  /** Current value */
  value: number;
  /** Maximum value (for percentage) */
  max?: number;
  /** Unit label */
  unit?: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Color variant */
  variant?: "default" | "accent" | "primary" | "secondary";
}

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseProgressReturn {
  /** Full progress state */
  progress: ProgressState;
  /** Whether data is loaded (hydrated) */
  isLoaded: boolean;
  /** Lesson completion status */
  lessons: LessonsProgress;
  /** User stats */
  stats: UserStats;
  /** Unlocked achievements */
  achievements: AchievementId[];
  /** Saved configs */
  savedConfigs: SavedConfig[];
  /** Complete a lesson */
  completeLesson: (lessonId: LessonId) => void;
  /** Update lesson progress percentage */
  updateLessonProgress: (lessonId: LessonId, percent: number) => void;
  /** Mark a lesson section as viewed */
  viewLessonSection: (lessonId: LessonId, section: string) => void;
  /** Increment a stat counter */
  incrementStat: (statName: keyof UserStats, amount?: number) => void;
  /** Record device view */
  viewDevice: (deviceId: string) => void;
  /** Save a configuration */
  saveConfig: (config: Omit<SavedConfig, "id" | "savedAt">) => void;
  /** Delete a saved configuration */
  deleteConfig: (configId: string) => void;
  /** Check and unlock achievements */
  checkAchievements: () => AchievementId[];
  /** Calculate overall completion percentage */
  calculateCompletion: () => number;
  /** Get recommended next step */
  getRecommendedNext: () => JourneyMilestone | null;
  /** Update last visited page */
  updateLastVisited: (path: string) => void;
  /** Reset all progress (for testing) */
  resetProgress: () => void;
}
