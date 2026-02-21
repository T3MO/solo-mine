"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Globe, Monitor, Smartphone, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const mockUserData = {
  sessions: { total: 15234, new: 8934, returning: 6300, newPercentage: 58.6 },
  geography: [
    { country: "United States", users: 4521, percentage: 29.7 },
    { country: "Germany", users: 2341, percentage: 15.4 },
    { country: "United Kingdom", users: 1876, percentage: 12.3 },
    { country: "Canada", users: 1234, percentage: 8.1 },
    { country: "Australia", users: 987, percentage: 6.5 },
  ],
  devices: [
    { type: "Desktop", percentage: 58, icon: Monitor },
    { type: "Mobile", percentage: 35, icon: Smartphone },
    { type: "Tablet", percentage: 7, icon: Monitor },
  ],
  userFlow: [
    { stage: "Landing Page", users: 10000, dropoff: 0 },
    { stage: "Quiz Started", users: 6500, dropoff: 35 },
    { stage: "Quiz Completed", users: 5200, dropoff: 20 },
    { stage: "Simulator", users: 3800, dropoff: 27 },
    { stage: "Hardware View", users: 2100, dropoff: 45 },
    { stage: "Affiliate Click", users: 420, dropoff: 80 },
  ],
};

function UserFlowFunnel() {
  const maxUsers = mockUserData.userFlow[0].users;

  return (
    <div className="space-y-4">
      {mockUserData.userFlow.map((stage, index) => {
        const isLast = index === mockUserData.userFlow.length - 1;
        const percentage = (stage.users / maxUsers) * 100;
        const dropoffColor = stage.dropoff > 50 ? "text-red-400" : 
                            stage.dropoff > 30 ? "text-amber-400" : 
                            "text-emerald-400";

        return (
          <div key={stage.stage} className="relative">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      {stage.users.toLocaleString()}
                    </span>
                    {stage.dropoff > 0 && (
                      <span className={cn("text-xs", dropoffColor)}>
                        -{stage.dropoff}% drop
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 bg-slate-800 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn(
                      "h-full rounded-lg",
                      index === 0 ? "bg-primary" :
                      index === mockUserData.userFlow.length - 1 ? "bg-emerald-500" :
                      "bg-slate-600"
                    )}
                  />
                </div>
              </div>
              {!isLast && <ArrowRight className="w-4 h-4 text-slate-600" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">User Analytics</h1>
        <p className="text-slate-400 mt-1">Anonymous behavior and session data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {mockUserData.sessions.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">New Visitors</p>
                <p className="text-2xl font-bold text-white">
                  {mockUserData.sessions.new.toLocaleString()}
                </p>
              </div>
            </div>
            <Progress value={mockUserData.sessions.newPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Returning</p>
                <p className="text-2xl font-bold text-white">
                  {mockUserData.sessions.returning.toLocaleString()}
                </p>
              </div>
            </div>
            <Progress value={100 - mockUserData.sessions.newPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">User Flow Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <UserFlowFunnel />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-secondary" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {mockUserData.geography.map((country) => (
                <div key={country.country} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300">{country.country}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{country.users.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 w-12 text-right">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
