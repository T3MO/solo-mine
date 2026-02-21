"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { cn } from "@/lib/utils";
import type { RunawayButtonProps, Position2D } from "@/types/loading";

// ============================================================================
// CONSTANTS
// ============================================================================

const VIEWPORT_PADDING = 80;
const ESCAPE_THRESHOLD = 150;
const MOBILE_TELEPORT_INTERVAL = 800;
const ESCAPE_VELOCITY = 250;
const SPRING_CONFIG = { stiffness: 300, damping: 25, mass: 0.8 };
const ROTATION_DURATION = 1500;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points
 */
function calculateDistance(p1: Position2D, p2: Position2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate escape position away from mouse
 */
function calculateEscapePosition(
  buttonPos: Position2D,
  mousePos: Position2D,
  velocity: number
): Position2D {
  const dx = buttonPos.x - mousePos.x;
  const dy = buttonPos.y - mousePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return buttonPos;

  const unitX = dx / distance;
  const unitY = dy / distance;

  return {
    x: buttonPos.x + unitX * velocity,
    y: buttonPos.y + unitY * velocity,
  };
}

/**
 * Clamp position within viewport bounds
 */
function clampToViewport(
  pos: Position2D,
  buttonWidth: number,
  buttonHeight: number
): Position2D {
  if (typeof window === "undefined") return pos;

  const maxX = window.innerWidth - buttonWidth - VIEWPORT_PADDING;
  const maxY = window.innerHeight - buttonHeight - VIEWPORT_PADDING;

  return {
    x: Math.max(VIEWPORT_PADDING, Math.min(maxX, pos.x)),
    y: Math.max(VIEWPORT_PADDING, Math.min(maxY, pos.y)),
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RunawayButton({
  text: initialText = "NO",
  onEscape,
  onCapture,
  targetPosition,
  initialPosition,
  escapeThreshold = ESCAPE_THRESHOLD,
  disabled = false,
  className,
}: RunawayButtonProps) {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [escapeCount, setEscapeCount] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>(initialText);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isFlyingToTarget, setIsFlyingToTarget] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [touchPosition, setTouchPosition] = useState<Position2D | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasEscapedRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // MOUSE POSITION
  // -------------------------------------------------------------------------
  const { x: mouseX, y: mouseY } = useMousePosition({
    includeTouch: true,
    throttleMs: 16,
  });

  // -------------------------------------------------------------------------
  // SPRING PHYSICS
  // -------------------------------------------------------------------------
  const x = useMotionValue(initialPosition?.x ?? window.innerWidth * 0.6);
  const y = useMotionValue(initialPosition?.y ?? window.innerHeight * 0.5);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const rotate = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);

  const springRotate = useSpring(rotate, { stiffness: 100, damping: 20 });
  const springScale = useSpring(scale, { stiffness: 200, damping: 20 });

  // Bitcoin symbol rotation animation
  const bitcoinRotation = useTransform(springRotate, (v) => v);

  // -------------------------------------------------------------------------
  // COMPUTED VALUES
  // ------------------------------------------------------------------------
  const buttonDimensions = useMemo(() => {
    if (typeof window === "undefined") return { width: 100, height: 50 };
    // Estimate button size based on viewport
    const width = Math.min(140, window.innerWidth * 0.25);
    const height = 56;
    return { width, height };
  }, []);

  const isNearEscapeThreshold = useCallback((): boolean => {
    const currentPos = { x: springX.get(), y: springY.get() };
    const mousePos = { x: mouseX, y: mouseY };
    const distance = calculateDistance(currentPos, mousePos);
    return distance < escapeThreshold && distance > 0;
  }, [springX, springY, mouseX, mouseY, escapeThreshold]);

  const isNearTouchPosition = useCallback((): boolean => {
    if (!touchPosition) return false;
    const currentPos = { x: springX.get(), y: springY.get() };
    const distance = calculateDistance(currentPos, touchPosition);
    return distance < escapeThreshold * 1.5;
  }, [springX, springY, touchPosition, escapeThreshold]);

  // -------------------------------------------------------------------------
  // ESCAPE LOGIC
  // -------------------------------------------------------------------------
  const performEscape = useCallback(() => {
    if (disabled || isTransforming || isFlyingToTarget) return;

    const currentPos = { x: springX.get(), y: springY.get() };
    const mousePos = { x: mouseX, y: mouseY };

    const escapePos = calculateEscapePosition(currentPos, mousePos, ESCAPE_VELOCITY);
    const clampedPos = clampToViewport(escapePos, buttonDimensions.width, buttonDimensions.height);

    x.set(clampedPos.x);
    y.set(clampedPos.y);

    // Reset escape flag after animation
    hasEscapedRef.current = true;
    setTimeout(() => {
      hasEscapedRef.current = false;
    }, 500);

    // Update escape count
    setEscapeCount((prev) => {
      const newCount = prev + 1;

      // Update text based on escape count
      if (newCount === 3) {
        setCurrentText("NICE TRY");
      }

      // Trigger transformation at 5 escapes
      if (newCount === 5) {
        setIsTransforming(true);
        setTimeout(() => {
          flyToTarget();
        }, 500);
      }

      onEscape?.(newCount);
      return newCount;
    });
  }, [
    disabled,
    isTransforming,
    isFlyingToTarget,
    springX,
    springY,
    mouseX,
    mouseY,
    x,
    y,
    buttonDimensions,
    onEscape,
  ]);

  // -------------------------------------------------------------------------
  // FLY TO TARGET (BITCOIN TRANSFORMATION)
  // -------------------------------------------------------------------------
  const flyToTarget = useCallback(() => {
    setIsFlyingToTarget(true);

    // Start rotation
    rotate.set(720);
    scale.set(0.8);

    // Fly to target
    setTimeout(() => {
      x.set(targetPosition.x);
      y.set(targetPosition.y);
      opacity.set(0);

      setTimeout(() => {
        onCapture?.();
      }, ROTATION_DURATION);
    }, 300);
  }, [targetPosition, x, y, rotate, scale, opacity, onCapture]);

  // -------------------------------------------------------------------------
  // TELEPORT (MOBILE)
  // -------------------------------------------------------------------------
  const teleportRandom = useCallback(() => {
    if (typeof window === "undefined") return;

    const maxX = window.innerWidth - buttonDimensions.width - VIEWPORT_PADDING * 2;
    const maxY = window.innerHeight - buttonDimensions.height - VIEWPORT_PADDING * 2;

    const randomX = VIEWPORT_PADDING + Math.random() * maxX;
    const randomY = VIEWPORT_PADDING + Math.random() * maxY;

    x.set(randomX);
    y.set(randomY);

    setEscapeCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 3) setCurrentText("NICE TRY");
      if (newCount === 5) {
        setIsTransforming(true);
        setTimeout(() => flyToTarget(), 500);
      }
      onEscape?.(newCount);
      return newCount;
    });
  }, [x, buttonDimensions, onEscape, flyToTarget]);

  // -------------------------------------------------------------------------
  // MOUSE ESCAPE EFFECT
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (disabled || isTransforming || isFlyingToTarget || isTouchDevice) return;

    if (isNearEscapeThreshold() && !hasEscapedRef.current) {
      performEscape();
    }
  }, [
    mouseX,
    mouseY,
    disabled,
    isTransforming,
    isFlyingToTarget,
    isTouchDevice,
    isNearEscapeThreshold,
    performEscape,
  ]);

  // -------------------------------------------------------------------------
  // TOUCH DEVICE DETECTION & HANDLING
  // -------------------------------------------------------------------------
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Handle touch position tracking
  useEffect(() => {
    if (!isTouchDevice || disabled || isTransforming || isFlyingToTarget) {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
        touchIntervalRef.current = null;
      }
      return;
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        setTouchPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Start teleport interval
    touchIntervalRef.current = setInterval(() => {
      if (isNearTouchPosition()) {
        teleportRandom();
      }
    }, MOBILE_TELEPORT_INTERVAL);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, [
    isTouchDevice,
    disabled,
    isTransforming,
    isFlyingToTarget,
    isNearTouchPosition,
    teleportRandom,
  ]);

  // -------------------------------------------------------------------------
  // INITIAL POSITION SETUP
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!initialPosition) {
      const startX = window.innerWidth * 0.6;
      const startY = window.innerHeight * 0.5;
      x.set(startX);
      y.set(startY);
    }
  }, [initialPosition, x, y]);

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  const isBitcoinMode = escapeCount >= 5;

  return (
    <>
      {/* Escape Counter Badge */}
      {escapeCount > 0 && escapeCount < 5 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed z-50 pointer-events-none"
          style={{
            x: springX,
            y: springY,
            translateX: buttonDimensions.width + 8,
            translateY: -8,
          }}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold font-mono shadow-lg shadow-destructive/50">
            {escapeCount}
          </div>
        </motion.div>
      )}

      {/* Main Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => {
          if (!isTransforming && !isFlyingToTarget) {
            onCapture?.();
          }
        }}
        disabled={disabled || isFlyingToTarget}
        aria-label={isBitcoinMode ? "Bitcoin symbol, flying to target" : "Escape button, try to catch me"}
        className={cn(
          "fixed z-40 touch-target select-none",
          "font-sans font-bold text-sm md:text-base tracking-wider",
          "backdrop-blur-md transition-shadow duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isBitcoinMode
            ? "text-primary text-4xl md:text-5xl"
            : "px-6 py-4 min-w-[100px] text-destructive-foreground",
          className
        )}
        style={{
          x: springX,
          y: springY,
          rotate: isBitcoinMode ? bitcoinRotation : 0,
          scale: springScale,
          opacity,
          willChange: "transform",
          background: isBitcoinMode
            ? "transparent"
            : "rgba(255, 51, 51, 0.15)",
          border: isBitcoinMode
            ? "none"
            : "1px solid rgba(255, 51, 51, 0.5)",
          borderRadius: isBitcoinMode ? "50%" : "8px",
          boxShadow:
            escapeCount > 0 && !isBitcoinMode
              ? "0 0 20px rgba(255, 51, 51, 0.5), 0 0 40px rgba(255, 51, 51, 0.3)"
              : "none",
          cursor: isFlyingToTarget ? "default" : "pointer",
        }}
        whileHover={
          !isBitcoinMode && !isFlyingToTarget
            ? {
                boxShadow:
                  "0 0 30px rgba(255, 51, 51, 0.6), 0 0 60px rgba(255, 51, 51, 0.4)",
              }
            : undefined
        }
        transition={{ duration: 0.2 }}
      >
        {isBitcoinMode ? (
          <span className="text-glow-primary">₿</span>
        ) : (
          <span className="text-destructive">{currentText}</span>
        )}
      </motion.button>
    </>
  );
}
