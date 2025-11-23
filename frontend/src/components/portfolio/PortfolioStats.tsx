/**
 * Portfolio Statistics Component - Refactored
 * Displays user-specific portfolio stats with real-time data
 */

"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStats } from "@/src/hooks/useApi";
import {
  LoadingCard,
  ErrorCard,
  EmptyState,
} from "@/src/components/ui/feedback";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";

interface PortfolioStatsProps {
  userId: string;
}

const StatCard = memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: typeof Activity;
  }) => (
    <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
);

StatCard.displayName = "StatCard";

const TradeItem = memo(
  ({
    trade,
  }: {
    trade: {
      id: string;
      asset: string;
      action: string;
      quantity: number;
      price: number;
      status: string;
    };
  }) => {
    const isBuy = trade.action === "buy";

    return (
      <div className="flex items-center justify-between p-3 rounded-lg glass-button dark:glass-button-dark">
        <div className="flex items-center gap-3">
          {isBuy ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
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
    );
  }
);

TradeItem.displayName = "TradeItem";

const RuleTriggerItem = memo(
  ({
    trigger,
  }: {
    trigger: {
      id: string;
      name: string;
      asset: string;
      rule_type: string;
      last_triggered: string;
    };
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg glass-button dark:glass-button-dark">
      <div className="flex items-center gap-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
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
  )
);

RuleTriggerItem.displayName = "RuleTriggerItem";

function PortfolioStats({ userId }: PortfolioStatsProps) {
  const { data: stats, loading, error, refetch } = useUserStats(userId);

  if (loading) {
    return <LoadingCard message="Loading portfolio statistics..." />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Statistics Available"
        description="Unable to load your portfolio statistics."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Your Portfolio & Statistics
        </h2>
        <p className="text-sm text-muted-foreground">
          Track your trading performance and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Watchlists"
          value={stats.watchlists}
          subtitle="Asset collections"
          icon={Layers}
        />
        <StatCard
          title="Active Rules"
          value={`${stats.active_rules} / ${stats.total_rules}`}
          subtitle="Monitoring markets 24/7"
          icon={Activity}
        />
        <StatCard
          title="Total Trades"
          value={stats.total_trades}
          subtitle="Executions"
          icon={TrendingUp}
        />
        <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats.agent_active ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <span className="text-lg font-semibold">Active</span>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold text-muted-foreground">
                    Idle
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Assistant status</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                  <TradeItem key={trade.id} trade={trade} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No trades executed yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
                  <RuleTriggerItem key={trigger.id} trigger={trigger} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No rule triggers yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rules will appear here when conditions are met
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(PortfolioStats);
