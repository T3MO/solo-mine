"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { RunawayButton } from "./runaway-button";
import { cn } from "@/lib/utils";
import type {
  LoadingSequenceProps,
  LoadingPhase,
  Position2D,
  FloatingStat,
} from "@/types/loading";

// ============================================================================
// CONSTANTS
// ============================================================================

const PHASES: Record<Exclude<LoadingPhase, "complete">, { duration: number }> =
  {
    void: { duration: 1000 },
    swarm: { duration: 3000 },
    reveal: { duration: 1000 },
    choice: { duration: Infinity },
  };

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}|/\\";

// ============================================================================
// SCRAMBLE TEXT COMPONENT
// ============================================================================

interface ScrambleTextProps {
  text: string;
  trigger: boolean;
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

function ScrambleText({
  text,
  trigger,
  duration = 1500,
  className,
  onComplete,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!trigger || isAnimating) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const textLength = text.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealIndex = Math.floor(progress * textLength);

      let result = "";
      for (let i = 0; i < textLength; i++) {
        if (i < revealIndex) {
          result += text[i];
        } else if (i === revealIndex) {
          result +=
            SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        } else {
          result +=
            SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setIsAnimating(false);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [trigger, text, duration, isAnimating, onComplete]);

  return (
    <span className={className} aria-label={text}>
      {trigger ? displayText : ""}
    </span>
  );
}

// ============================================================================
// TYPEWRITER COMPONENT
// ============================================================================

interface TypewriterProps {
  text: string;
  trigger: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

function Typewriter({
  text,
  trigger,
  speed = 50,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState<string>("");
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    let currentIndex = 0;
    setDisplayText("");
    setIsComplete(false);

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [trigger, text, speed, onComplete]);

  // Cursor blink
  useEffect(() => {
    if (!trigger) return;

    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [trigger]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete || showCursor ? (
        <span className="text-secondary animate-pulse">|</span>
      ) : null}
    </span>
  );
}

// ============================================================================
// FLASH OVERLAY COMPONENT
// ============================================================================

interface FlashOverlayProps {
  trigger: boolean;
  onComplete?: () => void;
}

function FlashOverlay({ trigger, onComplete }: FlashOverlayProps) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, delay: 0.1 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-[100] bg-background pointer-events-none"
          style={{ backgroundColor: "#F8FAFC" }}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// GRID FLOOR COMPONENT
// ============================================================================

function GridFloor() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        initial={{ opacity: 0, rotateX: 90 }}
        animate={{ opacity: 1, rotateX: 60 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          transformOrigin: "center bottom",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 107, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 107, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            transform: "translateY(-50%)",
            height: "200%",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </motion.div>
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// PARTICLE SWARM COMPONENT
// ============================================================================

interface ParticleSwarmProps {
  isActive: boolean;
  onComplete?: () => void;
}

function ParticleSwarm({ isActive, onComplete }: ParticleSwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
    }>
  >([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const particleCount = 150;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * 1000,
      vx: 0,
      vy: 0,
      vz: -5 - Math.random() * 10,
      size: Math.random() * 2 + 1,
    }));

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      ctx.fillStyle = "rgba(3, 3, 5, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particlesRef.current.forEach((p) => {
        // Move particles toward camera (decrease z)
        p.z += p.vz;

        // Reset if behind camera
        if (p.z <= 0) {
          p.z = 1000;
          p.x = (Math.random() - 0.5) * canvas.width * 2;
          p.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        // Project 3D to 2D
        const scale = 1000 / (1000 - p.z);
        const x = centerX + p.x * scale;
        const y = centerY + p.y * scale;
        const size = p.size * scale;

        // Draw particle
        const alpha = Math.min(1, (1000 - p.z) / 500);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 0, ${alpha})`;
        ctx.fill();
      });

      if (elapsed < 2500) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Freeze effect - clear with fade
        ctx.fillStyle = "rgba(3, 3, 5, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ background: "#030305" }}
    />
  );
}

// ============================================================================
// FLOATING STATS COMPONENT
// ============================================================================

function FloatingStats() {
  const stats: FloatingStat[] = [
    { label: "NETWORK DIFFICULTY", value: "83.2T", position: "top-left" },
    { label: "BLOCK HEIGHT", value: "890,123", position: "top-right" },
  ];

  return (
    <>
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={cn(
            "fixed z-50 font-mono text-xs md:text-sm",
            stat.position === "top-left" && "top-4 left-4 md:top-8 md:left-8",
            stat.position === "top-right" && "top-4 right-4 md:top-8 md:right-8"
          )}
        >
          <div className="text-muted-foreground">{stat.label}</div>
          <div className="text-secondary text-glow-secondary">{stat.value}</div>
        </motion.div>
      ))}
    </>
  );
}

// ============================================================================
// HEXAGON BUTTON COMPONENT
// ============================================================================

interface HexagonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function HexagonButton({ children, onClick, disabled }: HexagonButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative px-8 py-4 md:px-12 md:py-6",
        "font-sans font-bold text-base md:text-lg tracking-wider",
        "text-primary-foreground transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      style={{
        background: "transparent",
        clipPath:
          "polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)",
      }}
      aria-label="Initiate the experience"
    >
      {/* Background with glow */}
      <div
        className="absolute inset-0 bg-primary transition-all duration-300 hover:shadow-lg"
        style={{
          clipPath:
            "polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)",
          boxShadow: "0 0 30px rgba(255, 107, 0, 0.5), 0 0 60px rgba(255, 107, 0, 0.3)",
        }}
      />
      {/* Inner border effect */}
      <div
        className="absolute inset-[2px] bg-primary"
        style={{
          clipPath:
            "polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)",
        }}
      />
      <span className="relative z-10 text-primary-foreground">{children}</span>
    </motion.button>
  );
}

// ============================================================================
// SKIP BUTTON COMPONENT
// ============================================================================

interface SkipButtonProps {
  onClick: () => void;
}

function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "fixed top-4 right-4 md:top-8 md:right-8 z-50",
        "font-mono text-xs tracking-wider",
        "text-muted-foreground hover:text-foreground",
        "transition-colors duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
      aria-label="Skip intro sequence"
    >
      SKIP INTRO [ESC]
    </motion.button>
  );
}

// ============================================================================
// MAIN LOADING SEQUENCE COMPONENT
// ============================================================================

export function LoadingSequence({
  onComplete,
  onSkip,
  initialPhase = "void",
  showSkip = true,
}: LoadingSequenceProps) {
  const [phase, setPhase] = useState<LoadingPhase>(initialPhase);
  const [showFlash, setShowFlash] = useState(false);
  const [runawayTarget, setRunawayTarget] = useState<Position2D>({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Calculate target position for runaway button (INITIATE button location)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setRunawayTarget({
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 + 50,
    });
  }, []);

  // Phase management
  useEffect(() => {
    if (prefersReducedMotion && phase === "void") {
      setPhase("choice");
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    switch (phase) {
      case "void":
        timers.push(
          setTimeout(() => setPhase("swarm"), PHASES.void.duration)
        );
        break;
      case "swarm":
        // Swarm phase is handled by ParticleSwarm component
        break;
      case "reveal":
        setShowFlash(true);
        timers.push(
          setTimeout(() => {
            setShowFlash(false);
            setPhase("choice");
          }, PHASES.reveal.duration)
        );
        break;
      case "choice":
        // Choice phase waits for user interaction
        break;
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, prefersReducedMotion]);

  // Keyboard handler for skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers
  const handleSkip = useCallback(() => {
    setPhase("choice");
    onSkip?.();
  }, [onSkip]);

  const handleSwarmComplete = useCallback(() => {
    setPhase("reveal");
  }, []);

  const handleInitiate = useCallback(() => {
    setIsSplitting(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  }, [onComplete]);

  const handleRunawayEscape = useCallback((count: number) => {
    setEscapeCount(count);
  }, []);

  const handleRunawayCapture = useCallback(() => {
    // If captured before 5 escapes, user "wins" - proceed anyway
    handleInitiate();
  }, [handleInitiate]);

  // Render phase content
  const renderPhaseContent = () => {
    switch (phase) {
      case "void":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.3em]"
            >
              INITIALIZING...
            </motion.div>
          </div>
        );

      case "swarm":
        return (
          <ParticleSwarm
            isActive={true}
            onComplete={handleSwarmComplete}
          />
        );

      case "reveal":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-sans font-bold text-glow-primary">
                <ScrambleText
                  text="SOLO MINE"
                  trigger={true}
                  duration={1200}
                />
              </h1>
              <div className="mt-4 md:mt-6 font-mono text-sm md:text-base text-secondary">
                <Typewriter
                  text="Home Mining, Reimagined"
                  trigger={true}
                  speed={60}
                />
              </div>
            </motion.div>
          </div>
        );

      case "choice":
        return (
          <div className="relative flex flex-col items-center justify-center h-full px-4">
            {/* Grid Floor Background */}
            <GridFloor />

            {/* Floating Stats */}
            <FloatingStats />

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 text-center"
            >
              <h2
                className={cn(
                  "text-2xl md:text-4xl lg:text-5xl font-sans font-bold mb-12 md:mb-16",
                  "text-glow-primary animate-pulse"
                )}
              >
                ARE YOU READY FOR THE CHANGE?
              </h2>

              {/* Buttons Container */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                <HexagonButton onClick={handleInitiate}>
                  INITIATE
                </HexagonButton>

                <RunawayButton
                  text="NO"
                  onEscape={handleRunawayEscape}
                  onCapture={handleRunawayCapture}
                  targetPosition={runawayTarget}
                />
              </div>

              {/* Escape hint text */}
              {escapeCount > 0 && escapeCount < 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 font-mono text-xs text-muted-foreground"
                >
                  Try to catch the button... if you can
                </motion.p>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Flash Overlay */}
      <FlashOverlay
        trigger={showFlash}
        onComplete={() => setShowFlash(false)}
      />

      {/* Skip Button */}
      {showSkip && phase !== "choice" && phase !== "complete" && (
        <SkipButton onClick={handleSkip} />
      )}

      {/* Split Transition Overlay */}
      <AnimatePresence>
        {isSplitting && (
          <>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 h-1/2 z-[200] bg-background"
              style={{ borderBottom: "1px solid rgba(255, 107, 0, 0.3)" }}
            />
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "100%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 h-1/2 z-[200] bg-background"
              style={{ borderTop: "1px solid rgba(255, 107, 0, 0.3)" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 1 }}
        animate={{ opacity: isSplitting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed inset-0 z-50 bg-background",
          phase === "void" && "scan-lines"
        )}
      >
        {renderPhaseContent()}
      </motion.div>

      {/* Sound Placeholders - Future Howler.js Integration */}
      {/*
      // Sound Effect Placeholders:
      // - void: ambient_drone.mp3 (low frequency hum)
      // - swarm: particle_rush.mp3 (whooshing particles)
      // - reveal: glitch_reveal.mp3 (digital glitch sound)
      // - choice: ambient_tension.mp3 (tense background)
      // - hover: ui_hover.mp3 (subtle beep)
      // - click: ui_click.mp3 (mechanical click)
      // - escape: error_bleep.mp3 (dismissive tone)
      // - capture: success_chime.mp3 (reward sound)
      
      // Example integration:
      // const soundController = useSoundController();
      // useEffect(() => {
      //   soundController.play(phase);
      // }, [phase]);
      */}
    </>
  );
}
