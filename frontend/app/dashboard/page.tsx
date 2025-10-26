"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, LogOut, User } from "lucide-react";
import ChatInterface from "@/components/chat-interface";
import WatchlistManager from "@/components/watchlist-manager";
import RulesManager from "@/components/rules-manager";
import PortfolioStats from "@/components/portfolio-stats";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    
    if (!storedUserId) {
      router.push("/");
    } else {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    router.push("/");
  };

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Fintech Agent Platform</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-600" />
                <span className="font-medium">{userName}</span>
                <Badge variant="outline">AI Agent Active</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="chat">Chat with Agent</TabsTrigger>
            <TabsTrigger value="watchlists">Watchlists</TabsTrigger>
            <TabsTrigger value="rules">Trading Rules</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Chat with Your AI Trading Assistant</CardTitle>
                <CardDescription>
                  Ask about market trends, get stock analysis, or request trading advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatInterface userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlists" className="space-y-4">
            <WatchlistManager userId={userId} />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <RulesManager userId={userId} />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <PortfolioStats userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
