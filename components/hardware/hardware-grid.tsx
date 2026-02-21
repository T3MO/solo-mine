"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HardwareCard } from "./hardware-card";
import { ModeGuideSheet } from "./mode-guide-sheet";
import { SkeletonBlueprint } from "@/components/ui/skeleton-blueprint";
import { cn } from "@/lib/utils";
import type {
  HardwareDevice,
  HardwareFilters,
  HardwareSortOption,
  HardwareFilterCategory,
  HardwareViewMode,
} from "@/types/hardware";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

interface HardwareGridProps {
  devices: HardwareDevice[];
  electricityCost: number;
}

const FILTER_CATEGORIES: {
  id: HardwareFilterCategory;
  label: string;
  description: string;
}[] = [
  { id: "all", label: "All", description: "Show all devices" },
  {
    id: "beginner",
    label: "Beginner",
    description: "Price < $300, quiet, easy setup",
  },
  {
    id: "solo-capable",
    label: "Solo-Capable",
    description: "Can be configured for solo mining",
  },
  {
    id: "pool-only",
    label: "Pool-Only",
    description: "Pool mining only",
  },
  {
    id: "most-efficient",
    label: "Most Efficient",
    description: "Best GH/s per watt",
  },
  {
    id: "quiet",
    label: "Quiet",
    description: "Under 40dB noise level",
  },
];

const SORT_OPTIONS: { id: HardwareSortOption; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "hashrate-desc", label: "Hashrate: High to Low" },
  { id: "noise-asc", label: "Noise: Low to High" },
  { id: "efficiency-asc", label: "Efficiency: Best First" },
];

export function HardwareGrid({ devices, electricityCost }: HardwareGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [filters, setFilters] = useState<HardwareFilters>({
    search: searchParams.get("search") || "",
    category: (searchParams.get("category") as HardwareFilterCategory) || "all",
    sort: (searchParams.get("sort") as HardwareSortOption) || "featured",
    maxPrice: searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!)
      : null,
    maxNoise: searchParams.get("maxNoise")
      ? parseInt(searchParams.get("maxNoise")!)
      : null,
  });

  const [viewMode, setViewMode] = useState<HardwareViewMode>("grid");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice | null>(null);
  const [isModeGuideOpen, setIsModeGuideOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // -------------------------------------------------------------------------
  // FILTER LOGIC
  // -------------------------------------------------------------------------
  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (device) =>
          device.name.toLowerCase().includes(query) ||
          device.manufacturer.toLowerCase().includes(query) ||
          device.description.toLowerCase().includes(query) ||
          device.bestFor.some((use) => use.toLowerCase().includes(query))
      );
    }

    // Category filter
    switch (filters.category) {
      case "beginner":
        result = result.filter(
          (d) => d.price < 300 && d.noise < 40 && d.difficulty === "beginner"
        );
        break;
      case "solo-capable":
        result = result.filter((d) => d.soloCapable);
        break;
      case "pool-only":
        result = result.filter((d) => !d.soloCapable);
        break;
      case "most-efficient":
        result = result.sort((a, b) => a.efficiency - b.efficiency);
        break;
      case "quiet":
        result = result.filter((d) => d.noise < 40);
        break;
    }

    // Price filter
    if (filters.maxPrice) {
      result = result.filter((d) => d.price <= filters.maxPrice!);
    }

    // Noise filter
    if (filters.maxNoise) {
      result = result.filter((d) => d.noise <= filters.maxNoise!);
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "hashrate-desc":
        result.sort((a, b) => b.hashrate - a.hashrate);
        break;
      case "noise-asc":
        result.sort((a, b) => a.noise - b.noise);
        break;
      case "efficiency-asc":
        result.sort((a, b) => a.efficiency - b.efficiency);
        break;
      case "featured":
      default:
        // Sort by best value first, then by new, then by featured
        result.sort((a, b) => {
          if (a.isBestValue && !b.isBestValue) return -1;
          if (!a.isBestValue && b.isBestValue) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [devices, filters]);

  // -------------------------------------------------------------------------
  // URL SYNC
  // -------------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.sort !== "featured") params.set("sort", filters.sort);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.maxNoise) params.set("maxNoise", filters.maxNoise.toString());

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleFilterChange = <K extends keyof HardwareFilters>(
    key: K,
    value: HardwareFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      sort: "featured",
      maxPrice: null,
      maxNoise: null,
    });
  };

  const handleOpenModeGuide = (device: HardwareDevice) => {
    setSelectedDevice(device);
    setIsModeGuideOpen(true);
  };

  const activeFiltersCount = [
    filters.category !== "all",
    filters.maxPrice !== null,
    filters.maxNoise !== null,
    filters.search !== "",
  ].filter(Boolean).length;

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonBlueprint key={i} rows={4} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-xl border-b border-white/5 py-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search devices..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange("category", cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  filters.category === cat.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={cat.description}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) =>
                  handleFilterChange("sort", e.target.value as HardwareSortOption)
                }
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg bg-muted border border-white/10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={cn(
                "lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors",
                activeFiltersCount > 0
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-white/10 text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {isFiltersExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {FILTER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange("category", cat.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm transition-all",
                        filters.category === cat.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground border border-white/10"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Max Price
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={filters.maxPrice || 1000}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxPrice",
                          parseInt(e.target.value) === 1000
                            ? null
                            : parseInt(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {filters.maxPrice ? `$${filters.maxPrice}` : "No limit"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Max Noise
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      step="5"
                      value={filters.maxNoise || 80}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxNoise",
                          parseInt(e.target.value) === 80
                            ? null
                            : parseInt(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {filters.maxNoise ? `${filters.maxNoise}dB` : "No limit"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {filters.category !== "all" && (
              <button
                onClick={() => handleFilterChange("category", "all")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                Category: {FILTER_CATEGORIES.find((c) => c.id === filters.category)?.label}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.maxPrice && (
              <button
                onClick={() => handleFilterChange("maxPrice", null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                Max: ${filters.maxPrice}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.maxNoise && (
              <button
                onClick={() => handleFilterChange("maxNoise", null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                Noise: {filters.maxNoise}dB
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                Search: "{filters.search}"
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-muted-foreground text-sm hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredDevices.length} of {devices.length} devices
        </div>
      </div>

      {/* Grid */}
      {filteredDevices.length > 0 ? (
        <div
          className={cn(
            "grid gap-6",
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredDevices.map((device) => (
              <HardwareCard
                key={device.id}
                device={device}
                electricityCost={electricityCost}
                onOpenModeGuide={handleOpenModeGuide}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-sans font-bold text-foreground mb-2">
            No devices match your filters
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters to see more results.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Mode Guide Sheet */}
      <ModeGuideSheet
        device={selectedDevice}
        isOpen={isModeGuideOpen}
        onClose={() => setIsModeGuideOpen(false)}
        electricityCost={electricityCost}
      />
    </div>
  );
}
