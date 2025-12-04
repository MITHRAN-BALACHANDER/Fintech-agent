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
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    
    if (!storedUserId) {
      router.push("/login");
    } else {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 elevation-1 bg-background/95 backdrop-blur-sm border-b border-border animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg elevation-2 bg-card flex items-center justify-center hover-lift">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">FinSIght</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg elevation-1 bg-card border border-border">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userName}</span>
                <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5 text-primary">
                  AI Active
                </Badge>
              </div>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2 h-9 font-medium elevation-1 hover:elevation-2 hover-lift transition-all duration-140"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 stack-lg">
        <Tabs defaultValue="chat" className="space-y-6 animate-scale-in">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto h-11 bg-muted rounded-lg p-1 elevation-1">
            <TabsTrigger 
              value="chat" 
              className="text-sm font-medium data-[state=active]:elevation-2 data-[state=active]:bg-background rounded-md transition-all duration-140"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="watchlists" 
              className="text-sm font-medium data-[state=active]:elevation-2 data-[state=active]:bg-background rounded-md transition-all duration-140"
            >
              Watchlists
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="text-sm font-medium data-[state=active]:elevation-2 data-[state=active]:bg-background rounded-md transition-all duration-140"
            >
              Rules
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="text-sm font-medium data-[state=active]:elevation-2 data-[state=active]:bg-background rounded-md transition-all duration-140"
            >
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="elevation-3 border border-border bg-card hover-lift">
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
