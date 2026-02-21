"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Zap, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ============================================================================
// Region Data
// ============================================================================

interface RegionData {
  id: string;
  name: string;
  rate: number;
  currency: string;
  description: string;
  category: "cheap" | "average" | "expensive" | "very_expensive";
  examples: string[];
}

const REGIONS: RegionData[] = [
  {
    id: "iceland",
    name: "Iceland",
    rate: 0.043,
    currency: "$0.043/kWh",
    description: "Geothermal power makes Iceland a mining paradise",
    category: "cheap",
    examples: ["Very favorable for mining"],
  },
  {
    id: "quebec",
    name: "Quebec, Canada",
    rate: 0.055,
    currency: "$0.055/kWh",
    description: "Abundant hydroelectric power",
    category: "cheap",
    examples: ["Many mining operations"],
  },
  {
    id: "washington",
    name: "Washington State",
    rate: 0.075,
    currency: "$0.075/kWh",
    description: "Columbia River hydro power",
    category: "cheap",
    examples: ["Former mining hub"],
  },
  {
    id: "texas",
    name: "Texas",
    rate: 0.088,
    currency: "$0.088/kWh",
    description: "Deregulated market with competitive rates",
    category: "average",
    examples: ["Current mining hub"],
  },
  {
    id: "us_average",
    name: "US National Average",
    rate: 0.12,
    currency: "$0.12/kWh",
    description: "Mixed sources, residential rates",
    category: "average",
    examples: ["Most of the US"],
  },
  {
    id: "germany",
    name: "Germany",
    rate: 0.19,
    currency: "$0.19/kWh",
    description: "High taxes and transition costs",
    category: "expensive",
    examples: ["Taxes make up 50% of bill"],
  },
  {
    id: "california",
    name: "California",
    rate: 0.22,
    currency: "$0.22/kWh",
    description: "High demand, environmental policies",
    category: "expensive",
    examples: ["Tiered pricing"],
  },
  {
    id: "hawaii",
    name: "Hawaii",
    rate: 0.32,
    currency: "$0.32/kWh",
    description: "Island logistics, imported fuel",
    category: "very_expensive",
    examples: ["Worst state for mining"],
  },
  {
    id: "denmark",
    name: "Denmark",
    rate: 0.34,
    currency: "$0.34/kWh",
    description: "Highest in Europe",
    category: "very_expensive",
    examples: ["Green taxes"],
  },
];

const CATEGORY_COLORS: Record<RegionData["category"], { bg: string; border: string; text: string; badge: string }> = {
  cheap: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500",
  },
  average: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500",
  },
  expensive: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500",
  },
  very_expensive: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500",
  },
};

// ============================================================================
// Props
// ============================================================================

interface ElectricityMapProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (rate: number) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ElectricityMap({ isOpen, onClose, onSelect }: ElectricityMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none"
          >
            <Card className="w-full max-w-4xl max-h-full overflow-hidden pointer-events-auto flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Global Electricity Rates
                    </CardTitle>
                    <CardDescription>
                      Select your region to set your electricity cost
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Cheap (&lt;$0.10)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Average ($0.10-$0.14)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Expensive ($0.15-$0.20)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Very Expensive ($0.20+)</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REGIONS.map((region, i) => {
                    const colors = CATEGORY_COLORS[region.category];
                    const isSelected = selectedRegion?.id === region.id;

                    return (
                      <motion.button
                        key={region.id}
                        onClick={() => setSelectedRegion(region)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          colors.bg,
                          colors.border,
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold">{region.name}</h3>
                              <div className={cn("w-2 h-2 rounded-full", colors.badge)} />
                            </div>
                            <p className="text-sm text-muted-foreground">{region.description}</p>
                            <div className="flex gap-2 mt-2">
                              {region.examples.map((ex) => (
                                <span
                                  key={ex}
                                  className="text-xs px-2 py-0.5 rounded-full bg-background/50"
                                >
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={cn("text-right", colors.text)}>
                            <div className="flex items-center gap-1 font-mono font-bold">
                              <DollarSign className="w-4 h-4" />
                              {region.rate.toFixed(3)}
                            </div>
                            <div className="text-xs text-muted-foreground">/kWh</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Tip */}
                <div className="mt-6 p-4 rounded-lg bg-muted/50 flex gap-3">
                  <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How to find your rate</p>
                    <p>
                      Check your electric bill for the rate per kWh (kilowatt-hour). Look for
                      "Rate" or "Price per kWh". Residential rates are usually tiered - use your
                      highest tier rate for conservative estimates.
                    </p>
                  </div>
                </div>
              </CardContent>

              {/* Footer */}
              <div className="p-4 border-t flex justify-between items-center bg-muted/30">
                <div className="text-sm text-muted-foreground">
                  {selectedRegion ? (
                    <span>
                      Selected: <span className="text-foreground font-medium">{selectedRegion.name}</span>
                      {" "}({selectedRegion.currency})
                    </span>
                  ) : (
                    "Select a region to continue"
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedRegion && onSelect(selectedRegion.rate)}
                    disabled={!selectedRegion}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Use This Rate
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
