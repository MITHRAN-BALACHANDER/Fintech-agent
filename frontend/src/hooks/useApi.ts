/**
 * API-specific hooks for data fetching
 */

import { useCallback } from "react";
import { useAsync } from "./useAsync";
import { apiService } from "@/src/services/api.service";
import type {
  User,
  UserStats,
  Watchlist,
  TradingRule,
  PlatformStats,
} from "@/lib/types";

export function useUser(userId: string | null) {
  return useAsync<User>(
    () => {
      if (!userId) throw new Error("No user ID provided");
      return apiService.getUser(userId);
    },
    [userId],
    !!userId
  );
}

export function useUserStats(userId: string | null) {
  return useAsync<UserStats>(
    () => {
      if (!userId) throw new Error("No user ID provided");
      return apiService.getUserStats(userId);
    },
    [userId],
    !!userId
  );
}

export function useWatchlists(userId: string | null) {
  return useAsync<Watchlist[]>(
    () => {
      if (!userId) throw new Error("No user ID provided");
      return apiService.getWatchlists(userId);
    },
    [userId],
    !!userId
  );
}

export function useRules(userId: string | null) {
  return useAsync<TradingRule[]>(
    () => {
      if (!userId) throw new Error("No user ID provided");
      return apiService.getRules(userId);
    },
    [userId],
    !!userId
  );
}

export function usePlatformStats() {
  return useAsync<PlatformStats>(
    () => apiService.getPlatformStats(),
    []
  );
}

// Mutation hooks
export function useCreateWatchlist(userId: string) {
  const createWatchlist = useCallback(
    async (data: { name: string; assets: string[]; asset_type: "stock" | "crypto" }) => {
      return apiService.createWatchlist(userId, data);
    },
    [userId]
  );

  return { createWatchlist };
}

export function useDeleteWatchlist(userId: string) {
  const deleteWatchlist = useCallback(
    async (watchlistId: string) => {
      return apiService.deleteWatchlist(userId, watchlistId);
    },
    [userId]
  );

  return { deleteWatchlist };
}

export function useCreateRule(userId: string) {
  const createRule = useCallback(
    async (data: {
      name: string;
      description?: string;
      asset: string;
      asset_type: "stock" | "crypto";
      rule_type: "price_above" | "price_below" | "momentum_positive" | "momentum_negative" | "volume_spike" | "technical_signal";
      condition: Record<string, unknown>;
      actions: ("notify_email" | "notify_sms" | "buy_trigger" | "sell_trigger")[];
      priority: number;
    }) => {
      return apiService.createRule(userId, data);
    },
    [userId]
  );

  return { createRule };
}

export function useToggleRule(userId: string) {
  const toggleRule = useCallback(
    async (ruleId: string) => {
      return apiService.toggleRule(userId, ruleId);
    },
    [userId]
  );

  return { toggleRule };
}

export function useDeleteRule(userId: string) {
  const deleteRule = useCallback(
    async (ruleId: string) => {
      return apiService.deleteRule(userId, ruleId);
    },
    [userId]
  );

  return { deleteRule };
}
