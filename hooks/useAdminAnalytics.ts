"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  // Traffic
  traffic: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    sources: { name: string; value: number }[];
    history: { date: string; visitors: number }[];
  };
  
  // Quiz
  quiz: {
    started: number;
    completed: number;
    conversionRate: number;
    results: { type: string; count: number; percentage: number }[];
  };
  
  // Simulator
  simulator: {
    totalRuns: number;
    mostTestedDevice: string;
    averageElectricityRate: number;
    dailyRuns: { date: string; count: number }[];
  };
  
  // Hardware
  hardware: {
    mostViewed: { id: string; name: string; views: number; trend: number }[];
    clickThroughRate: number;
    affiliateClicks: number;
  };
  
  // Email
  email: {
    totalSubscribers: number;
    thisWeek: number;
    openRate: number;
    topSubjects: { subject: string; opens: number }[];
  };
  
  // Revenue
  revenue: {
    estimatedClicks: number;
    estimatedConversions: number;
    estimatedRevenue: number;
  };
  
  // System
  system: {
    lastUpdated: number;
    apiStatus: "healthy" | "degraded" | "down";
    lastBuild: string;
  };
}

// ============================================================================
// Mock Data (Replace with actual API calls)
// ============================================================================

function generateMockStats(): DashboardStats {
  const now = new Date();
  
  return {
    traffic: {
      today: 1247,
      yesterday: 1089,
      thisWeek: 8234,
      lastWeek: 7654,
      sources: [
        { name: "Direct", value: 45 },
        { name: "Search", value: 32 },
        { name: "Social", value: 15 },
        { name: "Referral", value: 8 },
      ],
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        visitors: Math.floor(Math.random() * 500) + 800,
      })),
    },
    
    quiz: {
      started: 3421,
      completed: 2890,
      conversionRate: 84.5,
      results: [
        { type: "home_miner_pool", count: 1250, percentage: 43.3 },
        { type: "education", count: 720, percentage: 24.9 },
        { type: "buy_btc", count: 520, percentage: 18.0 },
        { type: "solo_miner", count: 280, percentage: 9.7 },
        { type: "asic_farm", count: 120, percentage: 4.1 },
      ],
    },
    
    simulator: {
      totalRuns: 15234,
      mostTestedDevice: "Bitaxe Gamma",
      averageElectricityRate: 0.134,
      dailyRuns: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        count: Math.floor(Math.random() * 200) + 800,
      })),
    },
    
    hardware: {
      mostViewed: [
        { id: "bitaxe-gamma", name: "Bitaxe Gamma", views: 4521, trend: 12.5 },
        { id: "nerdqaxe-4t", name: "NerdQaxe++ 4T", views: 3890, trend: 8.3 },
        { id: "avalon-nano-3", name: "Avalon Nano 3", views: 3245, trend: -2.1 },
        { id: "bitaxe-alpha", name: "Bitaxe Alpha", views: 2890, trend: 5.7 },
        { id: "nerdqaxe-2t", name: "NerdQaxe 2.4T", views: 2134, trend: 3.2 },
      ],
      clickThroughRate: 18.5,
      affiliateClicks: 1245,
    },
    
    email: {
      totalSubscribers: 1234,
      thisWeek: 89,
      openRate: 42.3,
      topSubjects: [
        { subject: "Your Mining Assessment", opens: 523 },
        { subject: "Weekly Profitability Update", opens: 412 },
        { subject: "Price Drop Alert: Bitaxe Gamma", opens: 389 },
        { subject: "Setup Guide: NerdQaxe", opens: 298 },
      ],
    },
    
    revenue: {
      estimatedClicks: 1245,
      estimatedConversions: 62,
      estimatedRevenue: 1860,
    },
    
    system: {
      lastUpdated: Date.now(),
      apiStatus: "healthy",
      lastBuild: new Date().toISOString(),
    },
  };
}

// ============================================================================
// Main Hook
// ============================================================================

export function useAdminAnalytics(refreshInterval = 60000) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, fetch from your analytics API
      // const response = await fetch("/api/admin/analytics");
      // const data = await response.json();
      
      // For now, use mock data with a small delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = generateMockStats();
      
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// ============================================================================
// Individual Metric Hooks
// ============================================================================

export function useTrafficStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.traffic,
    loading,
    error,
  };
}

export function useQuizStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.quiz,
    loading,
    error,
  };
}

export function useSimulatorStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.simulator,
    loading,
    error,
  };
}

export function useHardwareStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.hardware,
    loading,
    error,
  };
}

export function useEmailStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.email,
    loading,
    error,
  };
}

export function useRevenueStats() {
  const { stats, loading, error } = useAdminAnalytics();
  return {
    data: stats?.revenue,
    loading,
    error,
  };
}

// ============================================================================
// Export Utilities
// ============================================================================

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape values containing commas or quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
