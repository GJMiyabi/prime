"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "../_lib/logger";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  principalId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ページロード時にCookieからユーザー情報を復元
    // API経由でユーザー情報を取得
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Cookie を送信
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // 未認証または期限切れ
          setUser(null);
        }
      } catch (error) {
        logger.error("ユーザー情報の取得に失敗", {
          component: "AuthProvider",
          action: "fetchUser",
          error,
        });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
