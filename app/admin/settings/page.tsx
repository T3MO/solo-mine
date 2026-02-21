"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Shield, Bell, Database, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Admin configuration and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Admin Password</Label>
                <Input type="password" placeholder="••••••••" className="bg-slate-950 border-slate-700" />
                <p className="text-xs text-slate-500">Change your admin password</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Session Timeout</Label>
                <Input type="number" defaultValue={30} className="bg-slate-950 border-slate-700" />
                <p className="text-xs text-slate-500">Minutes of inactivity before auto-logout</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-400">Require 2FA for admin access</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-secondary" />
                Notifications
              </CardTitle>
              <CardDescription>Alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-white font-medium">New Subscribers</p>
                  <p className="text-sm text-slate-400">Email when someone subscribes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-white font-medium">Price Alerts</p>
                  <p className="text-sm text-slate-400">Major BTC price movements</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-white font-medium">System Errors</p>
                  <p className="text-sm text-slate-400">API failures or crashes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-accent" />
                Data Management
              </CardTitle>
              <CardDescription>Backup and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-white font-medium">Auto-Backup</p>
                  <p className="text-sm text-slate-400">Daily backups to cloud storage</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Data Retention</Label>
                <select className="w-full p-2 rounded-md bg-slate-950 border border-slate-700 text-white">
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
                <p className="text-xs text-slate-500">How long to keep detailed analytics</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Export Data
                </Button>
                <Button variant="outline" className="flex-1">
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-500" />
                API Keys
              </CardTitle>
              <CardDescription>External service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">ConvertKit API Key</Label>
                <Input type="password" placeholder="ck_••••••••" className="bg-slate-950 border-slate-700" />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Resend API Key</Label>
                <Input type="password" placeholder="re_••••••••" className="bg-slate-950 border-slate-700" />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Plausible API Key</Label>
                <Input type="password" placeholder="••••••••" className="bg-slate-950 border-slate-700" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
