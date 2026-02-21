/**
 * Quiz Types
 * Types for the "Should I Mine?" eligibility quiz
 */

// ============================================================================
// Quiz Answers
// ============================================================================

export interface QuizAnswers {
  /** Electricity cost per kWh */
  electricityCost: number | null;
  /** Living situation / mining location */
  livingSituation: "apartment" | "garage" | "industrial" | "exploring" | null;
  /** Technical comfort level (1-5) */
  techComfort: number;
  /** Primary goal for mining */
  primaryGoal: "income" | "lottery" | "learn" | "heat" | "decentralization" | null;
  /** Hardware budget range */
  budget: "exploring" | "200-300" | "300-500" | "500-1000" | "1000+" | null;
}

export const DEFAULT_QUIZ_ANSWERS: QuizAnswers = {
  electricityCost: null,
  livingSituation: null,
  techComfort: 3,
  primaryGoal: null,
  budget: null,
};

// ============================================================================
// Quiz Result Types
// ============================================================================

export type QuizResultType =
  | "buy_btc"
  | "education"
  | "home_miner_pool"
  | "solo_miner"
  | "asic_farm";

export interface QuizResult {
  /** Result type identifier */
  type: QuizResultType;
  /** Display title */
  title: string;
  /** Profile name (e.g., "The Home Miner") */
  profileName: string;
  /** Hero icon/emoji */
  icon: string;
  /** Description paragraphs */
  description: string[];
  /** Compatibility percentage (0-100) */
  compatibility: number;
  /** Primary CTA */
  primaryCta: {
    label: string;
    href: string;
  };
  /** Secondary CTAs */
  secondaryCtas: Array<{
    label: string;
    href: string;
  }>;
  /** Recommended hardware IDs (if applicable) */
  recommendedHardware?: string[];
  /** Warning message (if any) */
  warning?: string;
}

// ============================================================================
// Quiz State
// ============================================================================

export type QuizQuestionId =
  | "electricity"
  | "living"
  | "tech"
  | "goal"
  | "budget";

export interface QuizQuestion {
  id: QuizQuestionId;
  title: string;
  description?: string;
  type: "slider" | "single_select" | "range_select";
}

export interface QuizState {
  /** Current question index (0-4) */
  currentQuestion: number;
  /** User answers */
  answers: QuizAnswers;
  /** Whether quiz is complete */
  isComplete: boolean;
  /** Calculated result */
  result: QuizResult | null;
  /** Timestamp when started */
  startedAt: number;
  /** Timestamp when completed */
  completedAt?: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface EligibilityQuizProps {
  /** Initial answers (for pre-filling from localStorage) */
  initialAnswers?: Partial<QuizAnswers>;
  /** Callback when quiz completes */
  onComplete?: (result: QuizResult, answers: QuizAnswers) => void;
  /** Callback when user goes back */
  onBack?: () => void;
}

export interface ResultCardProps {
  /** Quiz result data */
  result: QuizResult;
  /** User's answers */
  answers: QuizAnswers;
  /** Callback to retake quiz */
  onRetake: () => void;
}

export interface QuizProgressBarProps {
  /** Current step (0-4) */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
}

export interface QuestionCardProps {
  /** Question data */
  question: QuizQuestion;
  /** Current answer value */
  answer: unknown;
  /** Callback when answer changes */
  onAnswer: (value: unknown) => void;
  /** Whether this is the active question */
  isActive: boolean;
  /** Animation direction */
  direction: "next" | "back";
}

// ============================================================================
// Electricity Presets
// ============================================================================

export interface ElectricityPreset {
  label: string;
  value: number;
  region: string;
  description: string;
}

export const ELECTRICITY_PRESETS: ElectricityPreset[] = [
  {
    label: "I don't know",
    value: 0.12,
    region: "Unknown",
    description: "We'll use the US average. Check your electric bill for the rate per kWh.",
  },
  {
    label: "$0.05-0.08",
    value: 0.065,
    region: "Cheap",
    description: "Iceland, Quebec, Washington State, parts of Texas",
  },
  {
    label: "$0.09-0.13",
    value: 0.11,
    region: "Average",
    description: "US National Average, most of Europe",
  },
  {
    label: "$0.14-0.20",
    value: 0.17,
    region: "Expensive",
    description: "California, New York, Germany",
  },
  {
    label: "$0.21+",
    value: 0.25,
    region: "Very Expensive",
    description: "Hawaii, Denmark, South Australia",
  },
];

// ============================================================================
// Living Situation Options
// ============================================================================

export interface LivingOption {
  id: QuizAnswers["livingSituation"];
  label: string;
  icon: string;
  description: string;
  noiseTolerance: string;
  powerCapacity: string;
}

export const LIVING_OPTIONS: LivingOption[] = [
  {
    id: "apartment",
    label: "Apartment / Bedroom",
    icon: "🏠",
    description: "Shared walls, noise must be minimal",
    noiseTolerance: "Under 40dB (whisper quiet)",
    powerCapacity: "Standard outlet (15A)",
  },
  {
    id: "garage",
    label: "Garage / Basement",
    icon: "🏗️",
    description: "Separated from living space, some noise OK",
    noiseTolerance: "Up to 70dB (vacuum cleaner)",
    powerCapacity: "20A circuit or multiple outlets",
  },
  {
    id: "industrial",
    label: "Warehouse / Industrial",
    icon: "🏭",
    description: "Commercial space, noise not a concern",
    noiseTolerance: "80dB+ (loud machinery)",
    powerCapacity: "240V, 30A+ circuits",
  },
  {
    id: "exploring",
    label: "Just Exploring",
    icon: "📚",
    description: "Not sure yet, learning about options",
    noiseTolerance: "Flexible",
    powerCapacity: "Flexible",
  },
];

// ============================================================================
// Goal Options
// ============================================================================

export interface GoalOption {
  id: QuizAnswers["primaryGoal"];
  label: string;
  icon: string;
  description: string;
  poolCompatibility: number;
  soloCompatibility: number;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "income",
    label: "Earn Steady Income",
    icon: "💰",
    description: "I want reliable, predictable returns",
    poolCompatibility: 100,
    soloCompatibility: 10,
  },
  {
    id: "lottery",
    label: "Lottery / Solo Mining",
    icon: "🎲",
    description: "I accept high risk for chance of big payout",
    poolCompatibility: 20,
    soloCompatibility: 100,
  },
  {
    id: "learn",
    label: "Learn Bitcoin",
    icon: "🎓",
    description: "I want to understand how mining works",
    poolCompatibility: 80,
    soloCompatibility: 80,
  },
  {
    id: "heat",
    label: "Heat My Space",
    icon: "🔥",
    description: "I want to offset heating costs with mining",
    poolCompatibility: 90,
    soloCompatibility: 60,
  },
  {
    id: "decentralization",
    label: "Support Decentralization",
    icon: "🏛️",
    description: "I want to help secure the Bitcoin network",
    poolCompatibility: 40,
    soloCompatibility: 100,
  },
];

// ============================================================================
// Budget Options
// ============================================================================

export interface BudgetOption {
  id: QuizAnswers["budget"];
  label: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  examples: string[];
}

export const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: "exploring",
    label: "Just Looking",
    description: "Not ready to buy yet",
    minAmount: 0,
    maxAmount: 0,
    examples: ["Free education", "Simulator only"],
  },
  {
    id: "200-300",
    label: "$200 - $300",
    description: "Entry-level budget",
    minAmount: 200,
    maxAmount: 300,
    examples: ["Bitaxe Alpha", "Avalon Nano 3"],
  },
  {
    id: "300-500",
    label: "$300 - $500",
    description: "Mid-range home miner",
    minAmount: 300,
    maxAmount: 500,
    examples: ["Bitaxe Gamma", "NerdQaxe 2.4T"],
  },
  {
    id: "500-1000",
    label: "$500 - $1,000",
    description: "Serious home mining",
    minAmount: 500,
    maxAmount: 1000,
    examples: ["NerdQaxe++ 4.8T", "Multiple devices"],
  },
  {
    id: "1000+",
    label: "$1,000+",
    description: "Industrial / ASIC territory",
    minAmount: 1000,
    maxAmount: null,
    examples: ["Antminer S19", "Multiple ASICs"],
  },
];

// ============================================================================
// Quiz Results Data
// ============================================================================

export const QUIZ_RESULTS: Record<QuizResultType, Omit<QuizResult, "compatibility">> = {
  buy_btc: {
    type: "buy_btc",
    title: "Buy Bitcoin Instead",
    profileName: "The Stack Holder",
    icon: "💰",
    description: [
      "Based on your electricity cost and budget, direct mining won't be profitable for you.",
      "The most efficient path to Bitcoin ownership is buying and holding (DCA strategy).",
      "However, we still recommend learning about mining - it helps you understand Bitcoin better.",
    ],
    primaryCta: {
      label: "See Why in Simulator",
      href: "/tools/variance-simulator",
    },
    secondaryCtas: [
      { label: "Learn SHA-256 Anyway", href: "/learn/sha256" },
      { label: "Browse Hardware (for fun)", href: "/hardware" },
    ],
  },
  education: {
    type: "education",
    title: "Start with Education",
    profileName: "The Curious Learner",
    icon: "📚",
    description: [
      "Mining is complex. Before spending money, you should understand how it actually works.",
      "Our interactive SHA-256 visualizer will give you hands-on experience with the math.",
      "After the lesson, you'll know if mining is right for you.",
    ],
    primaryCta: {
      label: "Start SHA-256 Course",
      href: "/learn/sha256",
    },
    secondaryCtas: [
      { label: "Try Simulator First", href: "/tools/variance-simulator" },
      { label: "Browse Hardware", href: "/hardware" },
    ],
  },
  home_miner_pool: {
    type: "home_miner_pool",
    title: "Home Pool Mining",
    profileName: "The Home Miner",
    icon: "⛏️",
    description: [
      "You're a perfect candidate for a quiet home miner in a pool.",
      "You'll get steady, predictable payouts without noise complaints.",
      "Start with an Avalon Nano or Bitaxe Gamma - both are apartment-friendly.",
    ],
    primaryCta: {
      label: "See Recommended Hardware",
      href: "/hardware?category=beginner",
    },
    secondaryCtas: [
      { label: "Try the Simulator", href: "/tools/variance-simulator" },
      { label: "Learn Setup Guide", href: "/learn" },
    ],
    recommendedHardware: ["avalon-nano-3", "bitaxe-gamma"],
  },
  solo_miner: {
    type: "solo_miner",
    title: "Solo Lottery Mining",
    profileName: "The Network Guardian",
    icon: "🎰",
    description: [
      "You're willing to support decentralization and accept the lottery odds.",
      "Solo mining is high-risk: 99%+ chance of never finding a block.",
      "But you'll learn a lot and help secure Bitcoin's decentralization.",
    ],
    primaryCta: {
      label: "See Solo Setup Guide",
      href: "/hardware?filter=solo-capable",
    },
    secondaryCtas: [
      { label: "Understand the Odds", href: "/tools/variance-simulator" },
      { label: "Browse Solo Hardware", href: "/hardware" },
    ],
    recommendedHardware: ["bitaxe-gamma", "nerdqaxe-4t"],
    warning: "Warning: Solo mining is a lottery. Expect $0 income.",
  },
  asic_farm: {
    type: "asic_farm",
    title: "ASIC Mining Setup",
    profileName: "The Industrial Miner",
    icon: "🏭",
    description: [
      "You have the space, power, and budget for serious mining.",
      "Consider the Antminer S9 (refurbished) as a starter, or S19 for serious mining.",
      "Ensure you have proper 240V circuits and ventilation.",
    ],
    primaryCta: {
      label: "Browse ASIC Hardware",
      href: "/hardware",
    },
    secondaryCtas: [
      { label: "Calculate Profitability", href: "/tools/variance-simulator" },
      { label: "Learn About Hosting", href: "/learn" },
    ],
    recommendedHardware: ["bitmain-antminer-s9"],
  },
};
