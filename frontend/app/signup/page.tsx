"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, TrendingUp, Shield, Zap, ArrowRight, Check, Users, BarChart3, Lock, Phone, Mail, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignupPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        risk_profile: "moderate" as "conservative" | "moderate" | "aggressive",
        preferred_channels: ["email"] as ("email" | "sms" | "webhook")[],
    })

    const toggleChannel = (channel: "email" | "sms" | "webhook") => {
        setFormData(prev => ({
            ...prev,
            preferred_channels: prev.preferred_channels.includes(channel)
                ? prev.preferred_channels.filter(c => c !== channel)
                : [...prev.preferred_channels, channel]
        }))
    }

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all required fields")
            return false
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address")
            return false
        }
        setError("")
        return true
    }

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2)
        }
    }

    const handlePrevStep = () => {
        setError("")
        setStep(1)
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        // Validate at least one notification channel is selected
        if (formData.preferred_channels.length === 0) {
            setError("Please select at least one notification channel")
            setIsLoading(false)
            return
        }

        try {
            const response = await apiService.createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                risk_profile: formData.risk_profile,
                preferred_channels: formData.preferred_channels,
            })
            if (response.success) {
                login(response.user)
                router.push("/")
            } else {
                setError("Failed to create account")
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Column - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/80">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-size-[4rem_4rem]" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
                    {/* Logo & Brand */}
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">FinSIght</span>
                        </Link>
                    </div>

                    {/* Hero Content */}
                    <div className="space-y-8 max-w-md">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight tracking-tight">
                                Start your intelligent trading journey
                            </h1>
                            <p className="text-lg text-primary-foreground/80 leading-relaxed">
                                Join thousands of traders leveraging AI to make smarter, data-driven investment decisions.
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield, text: "Bank-grade security", desc: "Enterprise encryption" },
                                { icon: Zap, text: "Real-time insights", desc: "Live market data" },
                                { icon: BarChart3, text: "AI analytics", desc: "Smart predictions" },
                                { icon: Users, text: "Expert support", desc: "24/7 assistance" },
                            ].map((feature, i) => (
                                <div key={i} className="space-y-2 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                                        <feature.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{feature.text}</p>
                                        <p className="text-xs text-primary-foreground/60">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 pt-4 border-t border-primary-foreground/10">
                            <div>
                                <p className="text-2xl font-bold">10K+</p>
                                <p className="text-xs text-primary-foreground/60">Active traders</p>
                            </div>
                            <div className="h-8 w-px bg-primary-foreground/20" />
                            <div>
                                <p className="text-2xl font-bold">$2.5M+</p>
                                <p className="text-xs text-primary-foreground/60">Daily volume</p>
                            </div>
                            <div className="h-8 w-px bg-primary-foreground/20" />
                            <div>
                                <p className="text-2xl font-bold">4.9★</p>
                                <p className="text-xs text-primary-foreground/60">User rating</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-primary-foreground/60">
                        © 2025 FinSIght. All rights reserved.
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />
            </div>

            {/* Right Column - Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-background">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">FinSIght</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
                        <p className="text-muted-foreground">
                            Step {step} of 2: {step === 1 ? "Personal Details" : "Trading Preferences"}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex gap-2">
                        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                    </div>

                    {/* Form */}
                    <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : onSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-slide-in-down">
                                <p className="font-medium">{step === 1 ? "Validation Error" : "Registration failed"}</p>
                                <p className="text-xs mt-1 opacity-90">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Full name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        required
                                        className="h-11 transition-all duration-200"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        required
                                        className="h-11 transition-all duration-200"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Phone number <span className="text-muted-foreground">(optional)</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        autoComplete="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className="h-11 transition-all duration-200"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        required
                                        className="h-11 transition-all duration-200"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        autoComplete="new-password"
                                        placeholder="Re-enter your password"
                                        required
                                        className="h-11 transition-all duration-200"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Lock className="h-3 w-3" />
                                        Minimum 8 characters with uppercase, lowercase, and numbers
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Trading Preferences */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Risk profile
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Choose your trading risk tolerance
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: "conservative", label: "Conservative", desc: "Low risk" },
                                            { value: "moderate", label: "Moderate", desc: "Balanced" },
                                            { value: "aggressive", label: "Aggressive", desc: "High risk" },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, risk_profile: option.value as typeof prev.risk_profile }))}
                                                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                                    formData.risk_profile === option.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                                disabled={isLoading}
                                            >
                                                <p className="text-sm font-medium">{option.label}</p>
                                                <p className="text-xs text-muted-foreground">{option.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Notification preferences
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Select how you want to receive trading alerts
                                    </p>
                                    <div className="space-y-2 rounded-lg border border-border p-4">
                                        {([
                                            { value: "email" as const, label: "Email notifications", icon: Mail },
                                            { value: "sms" as const, label: "SMS alerts", icon: Phone },
                                            { value: "webhook" as const, label: "Webhook integration", icon: MessageSquare },
                                        ] as const).map((channel) => (
                                            <div key={channel.value} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={channel.value}
                                                    checked={formData.preferred_channels.includes(channel.value)}
                                                    onCheckedChange={() => toggleChannel(channel.value)}
                                                    disabled={isLoading}
                                                />
                                                <label
                                                    htmlFor={channel.value}
                                                    className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    <channel.icon className="h-4 w-4 text-muted-foreground" />
                                                    {channel.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Terms - Show on Step 2 */}
                        {step === 2 && (
                            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                By creating an account, you agree to our{" "}
                                <Link href="#" className="text-primary hover:underline font-medium">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-primary hover:underline font-medium">
                                    Privacy Policy
                                </Link>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            {step === 2 && (
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    className="h-11 flex-1 text-base font-medium" 
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                            )}
                            
                            <Button 
                                className="h-11 flex-1 text-base font-medium group" 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : step === 1 ? (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <Check className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-1 text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <Link href="/login">
                            <Button 
                                variant="outline" 
                                className="h-12 w-full text-base font-medium" 

                                type="button"
                            >
                                Sign in instead
                            </Button>
                        </Link>
                    </form>

                    {/* Trust Indicators */}
                    {/* <div className="pt-6 border-t border-border space-y-3"> */}
                        {/* {/* <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground"> */} 
                            {/* <div className="flex items-center gap-1.5"> */}
                                {/* <Check className="h-3.5 w-3.5 text-primary" /> */}
                                {/* <span>No credit card required</span> */}
                            {/* </div> */}
                            {/* <div className="h-3 w-px bg-border" /> */}
                            {/* <div className="flex items-center gap-1.5"> */}
                                {/* <Check className="h-3.5 w-3.5 text-primary" /> */}
                                {/* <span>Free forever plan</span> */}
                            {/* </div> */}
                        {/* </div> */}
                    {/* </div> */}
                </div>
            </div>
        </div>
    )
}
