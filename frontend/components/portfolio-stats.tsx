"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { UserStats } from "@/lib/types";
import { TrendingUp, TrendingDown, Activity, CheckCircle, Clock, Layers, AlertTriangle } from "lucide-react";

interface PortfolioStatsProps {
  userId: string;
}

export default function PortfolioStats({ userId }: PortfolioStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await apiClient.getUserStats(userId);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>;
  }

  if (error) {
    return (
      <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Your Portfolio & Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Track your trading performance and activity
        </p>
      </div>

      {stats && (
        <>
          {/* Stats Overview Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Watchlists</CardTitle>
                <Layers className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.watchlists}</div>
                <p className="text-xs text-muted-foreground">
                  Asset collections
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_rules} / {stats.total_rules}</div>
                <p className="text-xs text-muted-foreground">
                  Monitoring markets 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_trades}</div>
                <p className="text-xs text-muted-foreground">
                  Executions
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">AI Agent</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {stats.agent_active ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                      <span className="text-lg font-semibold">Active</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg font-semibold text-muted-foreground">Idle</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assistant status
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Trades */}
            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Trades</CardTitle>
                <CardDescription>Your latest trade executions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recent_trades.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recent_trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-3 rounded-lg glass-button dark:glass-button-dark"
                      >
                        <div className="flex items-center gap-3">
                          {trade.action === "buy" ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {trade.action.toUpperCase()} {trade.asset}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {trade.quantity} @ ${trade.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            trade.status === "executed"
                              ? "default"
                              : trade.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {trade.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No trades executed yet</p>
                    <p className="text-xs mt-1">
                      Set up trading rules to start automating
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Rule Triggers */}
            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Rule Triggers</CardTitle>
                <CardDescription>Rules that activated recently</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recent_rule_triggers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recent_rule_triggers.map((trigger) => (
                      <div
                        key={trigger.id}
                        className="flex items-center justify-between p-3 rounded-lg glass-button dark:glass-button-dark"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{trigger.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {trigger.asset} - {trigger.rule_type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(trigger.last_triggered).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trigger.last_triggered).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No rule triggers yet</p>
                    <p className="text-xs mt-1">
                      Rules will appear here when conditions are met
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
