import { ReactNode } from "react";

// ============================================================================
// Loading Sequence Types
// ============================================================================

export type LoadingPhase = "void" | "swarm" | "reveal" | "choice" | "complete";

export interface LoadingSequenceProps {
  /** Callback when the user clicks INITIATE and sequence completes */
  onComplete: () => void;
  /** Callback when user skips the intro */
  onSkip?: () => void;
  /** Initial phase to start from (for testing/debugging) */
  initialPhase?: LoadingPhase;
  /** Whether to show the skip button */
  showSkip?: boolean;
}

export interface PhaseConfig {
  duration: number;
  autoAdvance: boolean;
}

export interface LoadingState {
  phase: LoadingPhase;
  progress: number;
  escapeCount: number;
}

// ============================================================================
// Runaway Button Types
// ============================================================================

export interface Position2D {
  x: number;
  y: number;
}

export interface RunawayButtonProps {
  /** Text displayed on the button */
  text?: string;
  /** Callback fired when button successfully escapes */
  onEscape?: (count: number) => void;
  /** Callback fired when button is captured (clicked) */
  onCapture?: () => void;
  /** Target position to fly to after 5 escapes */
  targetPosition: Position2D;
  /** Initial position of the button */
  initialPosition?: Position2D;
  /** Distance threshold in pixels to trigger escape */
  escapeThreshold?: number;
  /** Whether the button is disabled/locked */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface RunawayButtonState {
  position: Position2D;
  escapeCount: number;
  isCapturable: boolean;
  isTransforming: boolean;
  text: string;
}

// ============================================================================
// Scramble Text Types
// ============================================================================

export interface ScrambleTextProps {
  /** Final text to reveal */
  text: string;
  /** Duration of scramble effect in ms */
  duration?: number;
  /** Character set for scrambling */
  charset?: string;
  /** Whether to trigger the animation */
  trigger?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface TypewriterProps {
  /** Text to type out */
  text: string;
  /** Typing speed in ms per character */
  speed?: number;
  /** Whether to trigger the animation */
  trigger?: boolean;
  /** Cursor character */
  cursor?: string;
  /** Cursor blink speed in ms */
  cursorBlinkSpeed?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Particle Field Enhancement Types
// ============================================================================

export interface EnhancedParticleFieldProps {
  /** Number of particles */
  count?: number;
  /** Base color of particles */
  color?: string;
  /** Particle size */
  size?: number;
  /** Animation speed multiplier */
  speedMultiplier?: number;
  /** Whether particles should freeze at end of animation */
  freezeAtEnd?: boolean;
  /** Duration before freezing (ms) */
  freezeDuration?: number;
  /** Callback when freeze completes */
  onFreeze?: () => void;
}

// ============================================================================
// Flash Overlay Types
// ============================================================================

export interface FlashOverlayProps {
  /** Whether to show the flash */
  trigger: boolean;
  /** Duration of flash in ms */
  duration?: number;
  /** Color of flash */
  color?: string;
  /** Callback when flash completes */
  onComplete?: () => void;
}

// ============================================================================
// Grid Floor Types
// ============================================================================

export interface GridFloorProps {
  /** Grid color */
  color?: string;
  /** Animation speed */
  speed?: number;
  /** Perspective value */
  perspective?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Floating Stats Types
// ============================================================================

export interface FloatingStat {
  label: string;
  value: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface FloatingStatsProps {
  stats: FloatingStat[];
  /** Animation delay before showing */
  delay?: number;
}

// ============================================================================
// Hexagon Button Types
// ============================================================================

export interface HexagonButtonProps {
  /** Button text */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Skip Button Types
// ============================================================================

export interface SkipButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Position on screen */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Sound Placeholder Types (for future Howler.js integration)
// ============================================================================

export interface SoundConfig {
  /** Sound file path */
  src: string;
  /** Volume (0-1) */
  volume?: number;
  /** Whether to loop */
  loop?: boolean;
}

export interface LoadingSequenceSounds {
  void?: SoundConfig;
  swarm?: SoundConfig;
  reveal?: SoundConfig;
  choice?: SoundConfig;
  hover?: SoundConfig;
  click?: SoundConfig;
  escape?: SoundConfig;
  capture?: SoundConfig;
}

export interface SoundController {
  play: (soundName: keyof LoadingSequenceSounds) => void;
  stop: (soundName: keyof LoadingSequenceSounds) => void;
  stopAll: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
}
