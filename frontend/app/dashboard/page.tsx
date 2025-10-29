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
    <div className="min-h-screen relative">
      {/* Glassmorphic Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-1/2 bg-neutral-200/30 dark:bg-neutral-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-1/2 bg-neutral-300/30 dark:bg-neutral-700/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass-header dark:glass-header-dark sticky top-0 z-50 smooth-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg glass-button dark:glass-button-dark flex items-center justify-center smooth-transition">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Fintech Agent</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg glass-button dark:glass-button-dark">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userName}</span>
                <Badge variant="outline" className="text-xs border-foreground/20 bg-transparent">
                  AI Active
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2 h-9 font-medium glass-button dark:glass-button-dark border-0 hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto h-10 glass-button dark:glass-button-dark border-0">
            <TabsTrigger value="chat" className="text-sm data-[state=active]:glass dark:data-[state=active]:glass-dark">
              Chat
            </TabsTrigger>
            <TabsTrigger value="watchlists" className="text-sm data-[state=active]:glass dark:data-[state=active]:glass-dark">
              Watchlists
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-sm data-[state=active]:glass dark:data-[state=active]:glass-dark">
              Rules
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-sm data-[state=active]:glass dark:data-[state=active]:glass-dark">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Chat with Your AI Trading Assistant</CardTitle>
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
