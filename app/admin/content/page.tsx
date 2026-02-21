"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, BookOpen, Settings, Save, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<"hardware" | "content" | "quiz">("hardware");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Content Management</h1>
        <p className="text-slate-400 mt-1">Manage hardware, lessons, and quiz settings</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 w-fit">
        {[
          { id: "hardware", label: "Hardware", icon: Cpu },
          { id: "content", label: "Education", icon: BookOpen },
          { id: "quiz", label: "Quiz Logic", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Hardware Editor */}
      {activeTab === "hardware" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Hardware Devices</CardTitle>
              <CardDescription>Edit device specs and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Bitaxe Gamma", "NerdQaxe++ 4T", "Avalon Nano 3"].map((device) => (
                <div
                  key={device}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{device}</h4>
                      <p className="text-sm text-slate-400">In stock • $299</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href="#" target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Edit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Price</Label>
                  <Input type="number" placeholder="299" className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Stock Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm text-slate-400">In Stock</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Content Editor */}
      {activeTab === "content" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Educational Content</CardTitle>
              <CardDescription>Manage lessons and guides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "SHA-256 Explained", views: 4521, status: "Published" },
                { title: "Pool vs Solo Mining", views: 3890, status: "Published" },
                { title: "Mining Profitability", views: 3245, status: "Draft" },
              ].map((lesson) => (
                <div
                  key={lesson.title}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <div>
                      <h4 className="font-medium text-white">{lesson.title}</h4>
                      <p className="text-sm text-slate-400">{lesson.views.toLocaleString()} views</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lesson.status === "Published" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {lesson.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz Settings */}
      {activeTab === "quiz" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quiz Algorithm Settings</CardTitle>
              <CardDescription>Adjust recommendation weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-slate-300">Electricity Threshold for &quot;Buy BTC&quot;</Label>
                    <span className="text-sm text-slate-400">$0.20/kWh</span>
                  </div>
                  <Slider defaultValue={[20]} max={50} step={1} />
                  <p className="text-xs text-slate-500">
                    Users with electricity above this threshold will be recommended to buy BTC instead
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-slate-300">Minimum Budget for Solo Mining</Label>
                    <span className="text-sm text-slate-400">$500</span>
                  </div>
                  <Slider defaultValue={[500]} max={2000} step={50} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div>
                    <p className="text-white font-medium">Enable Experimental Devices</p>
                    <p className="text-sm text-slate-400">Show pre-release hardware in recommendations</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
