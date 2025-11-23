/**
 * Auth Context for managing user authentication state
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/src/hooks/useAsync";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useLocalStorage<string | null>("userId", null);
  const [userName, setUserName] = useLocalStorage<string | null>("userName", null);

  // Initialize user state from localStorage values
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && userId && userName) {
      return {
        id: userId,
        name: userName,
        email: "",
        risk_profile: "moderate" as const,
        preferred_channels: [],
        agent_id: userId,
        created_at: new Date().toISOString(),
      };
    }
    return null;
  });

  const [isLoading] = useState(false);

  const login = useCallback(
    (userData: User) => {
      setUser(userData);
      setUserId(userData.id);
      setUserName(userData.name);
    },
    [setUserId, setUserName]
  );

  const logout = useCallback(() => {
    setUser(null);
    setUserId(null);
    setUserName(null);
  }, [setUserId, setUserName]);

  const value: AuthContextType = {
    user,
    userId,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
