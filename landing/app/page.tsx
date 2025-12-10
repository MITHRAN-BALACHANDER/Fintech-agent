"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Shield, Zap, Brain, TrendingUp, Bell, Lock, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

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
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-lg tracking-tight">FinSIght</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            <motion.a 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#how-it-works" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              How It Works
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Pricing
            </motion.a>
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
            <Button size="sm" className="shadow-md">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <motion.div 
              className="inline-block px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium tracking-wide uppercase shadow-sm"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              AI-Powered Trading Platform
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            >
              Your Personal AI
              <br />
              <span className="text-primary">Trading Co-Pilot</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
            >
              Scalable multi-tenant platform that creates personalized AI agents for each trader. 
              Monitor markets, execute rules, and get intelligent insights 24/7.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }}
            >
              <Button size="lg" className="shadow-lg group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="shadow-md">
                View Demo
              </Button>
            </motion.div>
            <motion.div 
              className="pt-8 text-sm text-muted-foreground"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 }}
            >
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2 ml-6">
                <Check className="h-4 w-4 text-primary" />
                14-day free trial
              </span>
            </motion.div>
          </div>

          {/* Hero Image/Demo */}
          <motion.div 
            className="mt-16"
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          >
            <Card className="p-4 shadow-2xl">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Platform Dashboard Preview</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading 
            title="Intelligent Trading Automation" 
            description="Everything you need to automate your trading strategy with confidence"
          />

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
          <SectionHeading 
            title="How It Works" 
            description="Get started in three simple steps"
          />

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
      <section id="pricing" className="py-20 px-4">
        <CTACard />
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
                <li><FooterLink href="#features">Features</FooterLink></li>
                <li><FooterLink href="#pricing">Pricing</FooterLink></li>
                <li><FooterLink href="#">API Docs</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><FooterLink href="#">About</FooterLink></li>
                <li><FooterLink href="#">Blog</FooterLink></li>
                <li><FooterLink href="#">Contact</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><FooterLink href="#">Privacy</FooterLink></li>
                <li><FooterLink href="#">Terms</FooterLink></li>
                <li><FooterLink href="#">Security</FooterLink></li>
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card className="p-6 hover:shadow-lg transition-shadow duration-250 group">
          <motion.div 
            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {icon}
          </motion.div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="relative">
      <motion.div 
        className="text-6xl font-bold text-primary/10 mb-4"
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {number}
      </motion.div>
      <motion.h3 
        className="font-semibold text-xl mb-3"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-muted-foreground leading-relaxed"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
      >
        {description}
      </motion.p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div 
        className="text-4xl font-bold text-primary mb-2"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {number}
      </motion.div>
      <div className="text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.h2 
        className="text-4xl font-bold mb-4"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {title}
      </motion.h2>
      <motion.p 
        className="text-muted-foreground text-lg max-w-2xl mx-auto"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      >
        {description}
      </motion.p>
    </div>
  );
}

function CTACard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="container mx-auto max-w-4xl">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
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
      </motion.div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a 
      href={href} 
      className="hover:text-foreground transition-colors inline-block"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.a>
  );
}
