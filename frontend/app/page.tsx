"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskProfile, NotificationChannel, UserCreate } from "@/lib/types";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { TrendingUp, Bot, Shield, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Signup form data
  const [signupData, setSignupData] = useState<UserCreate>({
    email: "",
    name: "",
    password: "",
    phone: "",
    risk_profile: "moderate",
    preferred_channels: ["email"],
  });

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createUser(signupData);
      if (response.success) {
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.loginUser(loginData);
      if (response.success) {
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setSignupData((prev) => ({
      ...prev,
      preferred_channels: prev.preferred_channels.includes(channel)
        ? prev.preferred_channels.filter((c) => c !== channel)
        : [...prev.preferred_channels, channel],
    }));
  };

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
              <span className="text-lg font-semibold tracking-tight">Fintech Agent</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 lg:mb-20 stack-lg animate-slide-in-down">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              AI-Powered Trading
              <br />
              <span className="text-muted-foreground">Assistant Platform</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized AI agents that monitor markets, execute strategies, and deliver real-time insights.
            </p>
          </div>


          {/* Auth Section */}
          <div className="max-w-xl mx-auto animate-scale-in">
            <Card className="elevation-4 border border-border bg-card hover-lift">
              <Tabs defaultValue="signup" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-2 h-11 mb-6 bg-muted rounded-lg p-1">
                    <TabsTrigger 
                      value="signup" 
                      className="text-sm font-medium data-[state=active]:elevation-1 data-[state=active]:bg-background rounded-md transition-all duration-140"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger 
                      value="login" 
                      className="text-sm font-medium data-[state=active]:elevation-1 data-[state=active]:bg-background rounded-md transition-all duration-140"
                    >
                      Login
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                {/* Signup Tab */}
                <TabsContent value="signup" className="mt-0">
                  <CardHeader className="space-y-1 pb-6 pt-2">
                    <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
                    <CardDescription className="text-sm">
                      Get your personal AI trading assistant in seconds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <form onSubmit={handleSignup} className="space-y-5">
                      {error && (
                        <Alert variant="destructive" className="border-destructive/50">
                          <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm font-medium">
                          Phone <span className="text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="risk_profile" className="text-sm font-medium">
                          Risk Profile
                        </Label>
                        <Select
                          value={signupData.risk_profile}
                          onValueChange={(value) =>
                            setSignupData({ ...signupData, risk_profile: value as RiskProfile })
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select risk profile" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative" className="text-sm">
                              Conservative - Low risk, stable investments
                            </SelectItem>
                            <SelectItem value="moderate" className="text-sm">
                              Moderate - Balanced growth and safety
                            </SelectItem>
                            <SelectItem value="aggressive" className="text-sm">
                              Aggressive - High growth, higher volatility
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Notification Channels</Label>
                        <div className="flex flex-wrap gap-2">
                          {(["email", "sms", "webhook"] as NotificationChannel[]).map((channel) => (
                            <Badge
                              key={channel}
                              variant={
                                signupData.preferred_channels.includes(channel)
                                  ? "default"
                                  : "outline"
                              }
                              className="cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                              onClick={() => toggleChannel(channel)}
                            >
                              {channel.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-10 font-medium" 
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Creating Account...
                          </span>
                        ) : (
                          "Create My AI Agent"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <CardHeader className="space-y-1 pb-6 pt-2">
                    <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                    <CardDescription className="text-sm">
                      Login to access your AI trading assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                      {error && (
                        <Alert variant="destructive" className="border-destructive/50">
                          <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="john@example.com"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="h-10 elevation-0 hover:elevation-1 focus:elevation-2 transition-all duration-140"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-10 font-medium" 
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Logging in...
                          </span>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 Fintech Agent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
