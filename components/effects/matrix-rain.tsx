"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MatrixRainProps } from "@/types/crypto";

// ============================================================================
// CONSTANTS
// ============================================================================

const CHARACTERS = ["0", "1", "₿"];
const COLORS = {
  normal: "#0F3D0F",     // Dark green
  bright: "#39FF14",     // Neon green (accent)
  highlighted: "#00F0FF", // Cyan
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MatrixRain({
  opacity = 0.3,
  speed = 1,
  density = 0.5,
  interactive = true,
  className,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const dropsRef = useRef<number[]>([]);
  const charsRef = useRef<string[]>([]);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reinitialize drops
      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize);
      dropsRef.current = new Array(columns).fill(1);
      charsRef.current = new Array(columns).fill("").map(() => 
        CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
      );
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Handle mouse movement
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Initialize drops if empty
    if (dropsRef.current.length === 0) {
      dropsRef.current = new Array(columns).fill(1);
      charsRef.current = new Array(columns).fill("").map(() => 
        CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
      );
    }

    let lastTime = 0;
    const frameInterval = 1000 / 30; // 30 FPS for performance

    const draw = (currentTime: number) => {
      // Throttle frame rate
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;

      // Semi-transparent black for fade effect
      ctx.fillStyle = `rgba(3, 3, 5, ${0.05 * speed})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px var(--font-jetbrains-mono)`;

      for (let i = 0; i < dropsRef.current.length; i++) {
        // Skip some columns based on density
        if (Math.random() > density) continue;

        const x = i * fontSize;
        const y = dropsRef.current[i] * fontSize;

        // Calculate distance from mouse for interaction
        let distanceFromMouse = Infinity;
        if (interactive) {
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          distanceFromMouse = Math.sqrt(dx * dx + dy * dy);
        }

        // Determine character and color
        let char = charsRef.current[i];
        let color = COLORS.normal;
        let brightness = 1;

        // Randomly change character
        if (Math.random() > 0.95) {
          char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          charsRef.current[i] = char;
        }

        // Highlight near mouse
        if (interactive && distanceFromMouse < 100) {
          color = COLORS.highlighted;
          brightness = 1.5 - distanceFromMouse / 100;
        } else if (char === "₿" && Math.random() > 0.99) {
          // Occasional bright Bitcoin symbols
          color = COLORS.bright;
          brightness = 1.2;
        } else if (Math.random() > 0.98) {
          // Occasional random highlights
          color = COLORS.bright;
          brightness = 0.8;
        }

        // Draw character
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity * brightness;
        ctx.fillText(char, x, y);
        ctx.globalAlpha = 1;

        // Reset drop when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }

        // Move drop down
        dropsRef.current[i] += 0.5 * speed;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [opacity, speed, density, interactive]);

  // Initialize
  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        className
      )}
      style={{
        background: "transparent",
        maskImage: "radial-gradient(ellipse at center, transparent 0%, black 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, transparent 0%, black 70%)",
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// SIMPLIFIED VARIANT (for mobile/performance)
// ============================================================================

export function MatrixRainSimplified({
  opacity = 0.2,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 20;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    let lastTime = 0;
    const frameInterval = 1000 / 20; // 20 FPS

    const draw = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;

      ctx.fillStyle = "rgba(3, 3, 5, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F3D0F";
      ctx.font = `${fontSize}px monospace`;
      ctx.globalAlpha = opacity;

      for (let i = 0; i < drops.length; i++) {
        // Only draw every other column
        if (i % 2 !== 0) continue;

        const text = Math.random() > 0.95 ? "₿" : "1";
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.3;
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        className
      )}
      aria-hidden="true"
    />
  );
}
