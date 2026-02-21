"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  blurDataUrl?: string;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

interface LazyImageProps extends Omit<OptimizedImageProps, "priority"> {
  threshold?: number;
  rootMargin?: string;
}

// ============================================================================
// Optimized Image Component
// ============================================================================

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  blurDataUrl,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate blur placeholder if not provided
  const placeholder = blurDataUrl ? "blur" : "empty";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill && "absolute inset-0",
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-muted animate-pulse"
          />
        )}
      </AnimatePresence>

      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Failed to load image</span>
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataUrl}
          className={cn(
            "transition-opacity duration-500",
            !isLoaded && "opacity-0",
            isLoaded && "opacity-100",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

// ============================================================================
// Lazy Image Component (Intersection Observer)
// ============================================================================

export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = "50px",
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={props.containerClassName}>
      {isInView ? (
        <OptimizedImage {...props} src={src} alt={alt} />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}
    </div>
  );
}

// ============================================================================
// Hardware Product Image Component
// ============================================================================

interface HardwareImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function HardwareImage({ src, alt, className, priority = false }: HardwareImageProps) {
  // Generate a simple blur data URL for hardware images
  const blurDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PC9zdmc+";

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      blurDataUrl={blurDataUrl}
      objectFit="contain"
      containerClassName={cn("relative bg-muted/50", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
    />
  );
}

// ============================================================================
// Avatar/Icon Image Component
// ============================================================================

interface AvatarImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function AvatarImage({ src, alt, size = "md", className }: AvatarImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={96}
      height={96}
      className={cn("rounded-full", sizeClasses[size], className)}
      objectFit="cover"
      sizes="96px"
    />
  );
}
