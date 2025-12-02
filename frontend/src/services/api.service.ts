/**
 * Enhanced API Service with error handling, retries, and request interceptors
 */

import type {
  User,
  UserCreate,
  Watchlist,
  WatchlistCreate,
  TradingRule,
  RuleCreate,
  QueryRequest,
  QueryResponse,
  UserStats,
  PlatformStats,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777";

interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

class ApiService {
  private baseUrl: string;
  private abortControllers: Map<string, AbortController>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.abortControllers = new Map();
  }

  private createAbortController(key: string): AbortController {
    // Cancel previous request if exists
    this.cancelRequest(key);
    
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    requestKey?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = requestKey ? this.createAbortController(requestKey) : undefined;
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller?.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          detail: response.statusText 
        }));
        
        const apiError: ApiError = {
          message: error.detail || `Request failed with status ${response.status}`,
          status: response.status,
          detail: error.detail,
        };
        
        throw apiError;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      if (requestKey) {
        this.abortControllers.delete(requestKey);
      }
    }
  }

  // Health & Status
  async healthCheck(): Promise<{ status: string; instantiated_at: string }> {
    return this.fetch("/health");
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return this.fetch("/api/stats", {}, "platform-stats");
  }

  // User Management
  async createUser(userData: UserCreate): Promise<{ success: boolean; user: User }> {
    return this.fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: { 
    email: string; 
    password: string 
  }): Promise<{ success: boolean; user: User }> {
    return this.fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getUser(userId: string): Promise<User> {
    return this.fetch(`/api/users/${userId}`, {}, `user-${userId}`);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.fetch(`/api/users/${userId}/stats`, {}, `user-stats-${userId}`);
  }

  // Watchlist Management
  async getWatchlists(userId: string): Promise<Watchlist[]> {
    return this.fetch(`/api/users/${userId}/watchlists`, {}, `watchlists-${userId}`);
  }

  async createWatchlist(
    userId: string,
    data: WatchlistCreate
  ): Promise<{ success: boolean; watchlist: Watchlist }> {
    return this.fetch(`/api/users/${userId}/watchlists`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteWatchlist(
    userId: string,
    watchlistId: string
  ): Promise<{ success: boolean }> {
    return this.fetch(`/api/users/${userId}/watchlists/${watchlistId}`, {
      method: "DELETE",
    });
  }

  // Trading Rules Management
  async getRules(userId: string): Promise<TradingRule[]> {
    return this.fetch(`/api/users/${userId}/rules`, {}, `rules-${userId}`);
  }

  async createRule(
    userId: string,
    data: RuleCreate
  ): Promise<{ success: boolean; rule: TradingRule }> {
    return this.fetch(`/api/users/${userId}/rules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async toggleRule(
    userId: string,
    ruleId: string
  ): Promise<{ success: boolean }> {
    return this.fetch(`/api/users/${userId}/rules/${ruleId}/toggle`, {
      method: "POST",
    });
  }

  async deleteRule(
    userId: string,
    ruleId: string
  ): Promise<{ success: boolean }> {
    return this.fetch(`/api/users/${userId}/rules/${ruleId}`, {
      method: "DELETE",
    });
  }

  // Agent Chat
  async queryAgent(
    userId: string,
    query: QueryRequest
  ): Promise<QueryResponse> {
    return this.fetch(`/api/users/${userId}/query`, {
      method: "POST",
      body: JSON.stringify(query),
    }, `query-${userId}-${Date.now()}`);
  }

  // Monitoring
  async startMonitoring(interval: number = 60): Promise<{ success: boolean }> {
    return this.fetch(`/api/monitoring/start?interval=${interval}`, {
      method: "POST",
    });
  }

  async stopMonitoring(): Promise<{ success: boolean }> {
    return this.fetch("/api/monitoring/stop", {
      method: "POST",
    });
  }

  async getMonitoringStatus(): Promise<{ active: boolean }> {
    return this.fetch("/api/monitoring/status", {}, "monitoring-status");
  }

  // Notifications (Mock for now - replace with real API)
  async getNotifications(userId: string): Promise<any[]> {
    // In production, this would be: return this.fetch(`/api/users/${userId}/notifications`)
    // For now, return mock data that simulates real notifications
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: `notif_${Date.now()}_1`,
            user_id: userId,
            type: "price_alert",
            title: "Price Alert Triggered",
            message: "AAPL has reached your target price of $150.00",
            read: false,
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            id: `notif_${Date.now()}_2`,
            user_id: userId,
            type: "trade",
            title: "Trade Executed",
            message: "Buy order for 10 shares of TSLA filled at $245.50",
            read: false,
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: `notif_${Date.now()}_3`,
            user_id: userId,
            type: "info",
            title: "Market Update",
            message: "S&P 500 is up 2.5% today, reaching new highs",
            read: true,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }, 500);
    });
  }

  async markNotificationAsRead(
    userId: string,
    notificationId: string
  ): Promise<{ success: boolean }> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<{ success: boolean }> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }
}

export const apiService = new ApiService();
export default apiService;
