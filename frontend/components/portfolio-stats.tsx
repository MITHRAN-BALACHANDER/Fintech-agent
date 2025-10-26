"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { PlatformStats } from "@/lib/types";
import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react";

interface PortfolioStatsProps {
  userId: string;
}

export default function PortfolioStats({ userId }: PortfolioStatsProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Portfolio & Statistics</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Track your trading performance and platform activity
        </p>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Platform-wide users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Activity className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_rules}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Monitoring market conditions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trades Executed</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_trades}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Simulated executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Activity className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_agents}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                AI assistants running
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>Your AI trading assistant capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Real-time Market Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Access live stock and cryptocurrency prices, technical indicators, and market sentiment
              </p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Automated Rule Engine</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Set price alerts, momentum triggers, and automated trading rules that execute 24/7
              </p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Intelligent Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Get AI-powered recommendations based on your risk profile and market conditions
              </p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and rule triggers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">
              Start chatting with your agent or set up trading rules to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
