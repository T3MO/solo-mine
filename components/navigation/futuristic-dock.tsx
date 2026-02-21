"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Calculator,
  Cpu,
  Trophy,
  Menu,
  X,
  HelpCircle,
  Search,
} from "lucide-react";
import { CommandPalette, SearchButton } from "@/components/search/command-palette";

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  requiresPulse?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "learn", label: "Learn", href: "/learn", icon: BookOpen },
  { id: "simulator", label: "Simulator", href: "/tools/variance-simulator", icon: Calculator, requiresPulse: true },
  { id: "quiz", label: "Should I Mine?", href: "/quiz", icon: HelpCircle },
  { id: "hardware", label: "Hardware", href: "/hardware", icon: Cpu },
  { id: "dashboard", label: "Progress", href: "/dashboard", icon: Trophy },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function FuturisticDock() {
  const pathname = usePathname();
  const { progress, stats, calculateCompletion, isLoaded } = useProgress();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Calculate completion percentage for progress ring
  const completionPercent = isLoaded ? calculateCompletion() : 0;

  // Check if simulator needs pulse (never run)
  const needsSimulatorPulse = isLoaded && stats.simulationsRun === 0;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show dock after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hide on scroll down (optional - can be removed if always visible preferred)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Always show dock on mobile or near bottom
      if (isMobile || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY) {
          // Scrolling down - keep visible but could hide if desired
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Determine active item
  const getActiveItem = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/learn")) return "learn";
    if (pathname.startsWith("/tools")) return "simulator";
    if (pathname === "/quiz") return "quiz";
    if (pathname.startsWith("/hardware")) return "hardware";
    if (pathname === "/dashboard") return "dashboard";
    return "home";
  };

  const activeItem = getActiveItem();

  // Progress ring circumference
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPercent / 100) * ringCircumference;

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Floating menu button */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-muted/90 backdrop-blur-xl border border-white/10",
              "shadow-2xl shadow-primary/30",
              "transition-all duration-300",
              isMobileMenuOpen && "bg-primary/20 border-primary/30"
            )}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </motion.div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.nav
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center justify-center h-full gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Button */}
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-muted text-foreground hover:bg-muted/80 transition-all duration-300"
                >
                  <Search className="w-8 h-8" />
                  <span className="text-2xl font-bold">Search</span>
                </motion.button>

                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeItem === item.id;
                  const Icon = item.icon;

                  return (
                    <Link key={item.id} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + (index + 1) * 0.05 }}
                        className={cn(
                          "flex items-center gap-4 px-8 py-4 rounded-2xl",
                          "transition-all duration-300",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        )}
                      >
                        <Icon className="w-8 h-8" />
                        <span className="text-2xl font-bold">{item.label}</span>
                        {item.id === "dashboard" && completionPercent > 0 && (
                          <span className="ml-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                            {completionPercent}%
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Palette for Mobile */}
        <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Safe area padding for content */}
        <div className="pb-20" />
      </>
    );
  }

  // Desktop dock
  return (
    <>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-1 px-3 py-2",
          "bg-muted/80 backdrop-blur-xl rounded-full",
          "border border-white/10",
          "shadow-2xl shadow-primary/20"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          const showPulse = item.requiresPulse && needsSimulatorPulse && !isActive;

          return (
            <div key={item.id} className="relative">
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-background border border-white/10 text-sm font-medium text-foreground whitespace-nowrap shadow-xl"
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary/20"
                    : "hover:bg-white/5"
                )}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Progress ring for dashboard */}
                {item.id === "dashboard" && completionPercent > 0 && (
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 44 44"
                  >
                    {/* Background ring */}
                    <circle
                      cx="22"
                      cy="22"
                      r={ringRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="22"
                      cy="22"
                      r={ringRadius}
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      className="transition-all duration-500"
                    />
                  </svg>
                )}

                {/* Pulse animation for simulator */}
                {showPulse && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </>
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    color: isActive ? "#FF6B00" : isHovered ? "#F8FAFC" : "#6B7280",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
              </Link>
            </div>
          );
        })}

        {/* Search Button */}
        <div className="w-px h-8 bg-border/50 mx-1" />
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full hover:bg-white/5 transition-all duration-300"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
      </motion.nav>

      {/* Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Safe area padding for content */}
      <div className="pb-24" />
    </>
  );
}
