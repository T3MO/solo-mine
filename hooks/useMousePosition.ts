"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MousePosition } from "@/types";

interface UseMousePositionOptions {
  includeTouch?: boolean;
  throttleMs?: number;
}

/**
 * Custom hook for tracking mouse/touch position with normalization
 * @param options - Configuration options for the hook
 * @returns Current mouse position with normalized coordinates (-1 to 1)
 */
export function useMousePosition(
  options: UseMousePositionOptions = {}
): MousePosition {
  const { includeTouch = true, throttleMs = 16 } = options;
  
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const lastUpdateRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      
      if (now - lastUpdateRef.current < throttleMs) {
        return;
      }
      
      lastUpdateRef.current = now;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        
        setPosition({
          x: clientX,
          y: clientY,
          normalizedX: (clientX / innerWidth) * 2 - 1,
          normalizedY: -(clientY / innerHeight) * 2 + 1,
        });
      });
    },
    [throttleMs]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    },
    [updatePosition]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        updatePosition(touch.clientX, touch.clientY);
      }
    },
    [updatePosition]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    if (includeTouch) {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleTouchMove, includeTouch]);

  return position;
}

/**
 * Hook for tracking relative mouse position within a specific element
 */
export function useRelativeMousePosition<T extends HTMLElement>(): {
  ref: React.RefObject<T>;
  position: MousePosition;
} {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPosition({
      x,
      y,
      normalizedX: (x / rect.width) * 2 - 1,
      normalizedY: -(y / rect.height) * 2 + 1,
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return { ref, position };
}
