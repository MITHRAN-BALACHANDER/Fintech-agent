"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, Shield, Zap, Brain, TrendingUp, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-lg tracking-tight">FinSIght</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Button size="sm" className="shadow-md">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium tracking-wide uppercase shadow-sm">
              AI-Powered Trading Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Your Personal AI
              <br />
              <span className="text-primary">Trading Co-Pilot</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Scalable multi-tenant platform that creates personalized AI agents for each trader. 
              Monitor markets, execute rules, and get intelligent insights 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="shadow-lg group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="shadow-md">
                View Demo
              </Button>
            </div>
            <div className="pt-8 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2 ml-6">
                <Check className="h-4 w-4 text-primary" />
                14-day free trial
              </span>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16">
            <Card className="p-4 shadow-2xl">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Platform Dashboard Preview</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Intelligent Trading Automation</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to automate your trading strategy with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Personal AI Agent"
              description="One dedicated AI agent per user, customized to your trading style and risk profile"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Real-Time Monitoring"
              description="Continuous evaluation of trading rules across all your assets with instant execution"
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Smart Notifications"
              description="Multi-channel alerts via email, SMS, push, and webhooks when conditions are met"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Multi-Asset Support"
              description="Trade stocks (NSE/BSE, US), cryptocurrencies, forex, and commodities from one platform"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Risk Management"
              description="Built-in safeguards, position limits, and customizable risk controls"
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Secure & Isolated"
              description="Multi-tenant architecture with complete data isolation and bank-level security"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Create Your Profile"
              description="Sign up and configure your risk profile, investment goals, and preferred assets"
            />
            <StepCard
              number="02"
              title="Define Your Rules"
              description="Set up price alerts, momentum triggers, volume spikes, and custom trading conditions"
            />
            <StepCard
              number="03"
              title="Let AI Work"
              description="Your personal AI agent monitors markets 24/7 and executes actions automatically"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="10K+" label="Active Users" />
            <StatCard number="1M+" label="Rules Executed" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="<50ms" label="Avg Response" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Trading?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of traders using AI to make smarter, faster decisions. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="shadow-md">
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">F</span>
                </div>
                <span className="font-bold">FinSIght</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered trading platform for intelligent market automation
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 FinSIght Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="text-6xl font-bold text-primary/10 mb-4">{number}</div>
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
