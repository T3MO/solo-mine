"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  HelpCircle,
  Calculator,
  Cpu,
  Mail,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StatCard, MiniSparkline, ProgressBar } from "@/components/admin/stat-card";
import { useAdminAnalytics, exportToCSV } from "@/hooks/useAdminAnalytics";

// ============================================================================
// Helper Components
// ============================================================================

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {action}
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
      isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
    )}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}

// ============================================================================
// Main Dashboard
// ============================================================================

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useAdminAnalytics(60000);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => stats && exportToCSV([stats.traffic.history], "traffic.csv")}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Visitors"
          value={stats?.traffic.today.toLocaleString() || "-"}
          change={stats ? ((stats.traffic.today - stats.traffic.yesterday) / stats.traffic.yesterday) * 100 : 0}
          changeLabel="vs yesterday"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          trend="up"
          color="default"
        />

        <StatCard
          title="Quiz Completions"
          value={stats?.quiz.completed.toLocaleString() || "-"}
          subtitle={`${stats?.quiz.conversionRate.toFixed(1)}% conversion rate`}
          icon={<HelpCircle className="w-5 h-5" />}
          loading={loading}
          color="success"
        />

        <StatCard
          title="Simulator Runs"
          value={stats?.simulator.totalRuns.toLocaleString() || "-"}
          subtitle={`Most tested: ${stats?.simulator.mostTestedDevice}`}
          icon={<Calculator className="w-5 h-5" />}
          loading={loading}
          color="default"
        />

        <StatCard
          title="Hardware Views"
          value={stats?.hardware.mostViewed[0]?.views.toLocaleString() || "-"}
          subtitle={`Top: ${stats?.hardware.mostViewed[0]?.name}`}
          change={stats?.hardware.mostViewed[0]?.trend}
          icon={<Cpu className="w-5 h-5" />}
          loading={loading}
          trend="up"
          color="default"
        />

        <StatCard
          title="Email Subscribers"
          value={stats?.email.totalSubscribers.toLocaleString() || "-"}
          change={stats ? ((stats.email.thisWeek / (stats.email.totalSubscribers - stats.email.thisWeek)) * 100) : 0}
          changeLabel="this week"
          icon={<Mail className="w-5 h-5" />}
          loading={loading}
          trend="up"
          color="default"
        />

        <StatCard
          title="Est. Revenue"
          value={`$${stats?.revenue.estimatedRevenue.toLocaleString() || "-"}`}
          subtitle={`${stats?.revenue.estimatedClicks} affiliate clicks`}
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
          color="success"
        />
      </div>

      {/* Charts & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic History */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Traffic (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 bg-slate-800 rounded animate-pulse" />
            ) : stats?.traffic.history ? (
              <MiniSparkline
                data={stats.traffic.history.map((h) => h.visitors)}
                color="#FF6B00"
                height={120}
              />
            ) : null}
            <div className="flex justify-between mt-4 text-xs text-slate-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Results Breakdown */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-secondary" />
              Quiz Results Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.quiz.results.map((result) => (
              <ProgressBar
                key={result.type}
                value={result.count}
                max={stats.quiz.completed}
                label={`${result.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} (${result.percentage}%)`}
                color={
                  result.type === "home_miner_pool" ? "bg-emerald-500" :
                  result.type === "buy_btc" ? "bg-amber-500" :
                  result.type === "solo_miner" ? "bg-purple-500" :
                  result.type === "education" ? "bg-blue-500" :
                  "bg-primary"
                }
              />
            ))}
          </CardContent>
        </Card>

        {/* Top Hardware */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" />
              Top Hardware Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 rounded animate-pulse" />
                      <div className="flex-1 h-8 bg-slate-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : stats?.hardware.mostViewed.map((device, index) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{device.name}</span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                        Hot
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{device.views.toLocaleString()}</span>
                    <TrendBadge value={device.trend} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">API Status</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                stats?.system.apiStatus === "healthy" ? "bg-emerald-500/20 text-emerald-400" :
                stats?.system.apiStatus === "degraded" ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              )}>
                {stats?.system.apiStatus === "healthy" ? "● Healthy" :
                 stats?.system.apiStatus === "degraded" ? "● Degraded" : "● Down"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">Last Build</span>
              <span className="text-slate-300 text-sm">
                {stats?.system.lastBuild 
                  ? new Date(stats.system.lastBuild).toLocaleString() 
                  : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">Data Freshness</span>
              <span className="text-slate-300 text-sm">
                {stats?.system.lastUpdated 
                  ? `${Math.floor((Date.now() - stats.system.lastUpdated) / 60000)}m ago`
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "View All Users", href: "/admin/users", color: "bg-blue-500/10 text-blue-400" },
          { label: "Edit Content", href: "/admin/content", color: "bg-purple-500/10 text-purple-400" },
          { label: "Detailed Analytics", href: "/admin/analytics", color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Settings", href: "/admin/settings", color: "bg-slate-700 text-slate-300" },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={cn(
              "p-4 rounded-xl text-center font-medium transition-all",
              "hover:scale-[1.02] hover:shadow-lg",
              action.color
            )}
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  );
}
