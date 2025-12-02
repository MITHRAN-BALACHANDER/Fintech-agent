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
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useLocalStorage<string | null>("userId", null);
  const [userName, setUserName] = useLocalStorage<string | null>("userName", null);
  const [avatarUrl, setAvatarUrl] = useLocalStorage<string | null>("avatarUrl", null);

  // Initialize user state from localStorage values
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && userId && userName) {
      return {
        id: userId,
        name: userName,
        email: "",
        avatar_url: avatarUrl || undefined,
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
      if (userData.avatar_url) {
        setAvatarUrl(userData.avatar_url);
      }
    },
    [setUserId, setUserName, setAvatarUrl]
  );

  const logout = useCallback(() => {
    setUser(null);
    setUserId(null);
    setUserName(null);
    setAvatarUrl(null);
  }, [setUserId, setUserName, setAvatarUrl]);

  const updateUser = useCallback(
    (userData: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...userData };
        if (userData.avatar_url) {
          setAvatarUrl(userData.avatar_url);
        }
        return updated;
      });
    },
    [setAvatarUrl]
  );

  const value: AuthContextType = {
    user,
    userId,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
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
