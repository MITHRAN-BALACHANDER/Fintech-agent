"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, TrendingUp, Shield, Zap, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const response = await apiService.loginUser({ email, password })
            if (response.success) {
                login(response.user)
                router.push("/")
            } else {
                setError("Invalid credentials")
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong")
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
                                Welcome back to intelligent trading
                            </h1>
                            <p className="text-lg text-primary-foreground/80 leading-relaxed">
                                Access your AI-powered trading assistant and continue making smarter investment decisions.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {[
                                { icon: Shield, text: "Bank-grade security" },
                                { icon: Zap, text: "Real-time market insights" },
                                { icon: TrendingUp, text: "AI-powered analytics" },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-primary-foreground/90">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
                                        <feature.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">{feature.text}</span>
                                </div>
                            ))}
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
                        <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-slide-in-down">
                                <p className="font-medium">Authentication failed</p>
                                <p className="text-xs mt-1 opacity-90">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Link
                                        href="#"
                                        className="text-sm font-medium text-primary hover:underline transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="h-12 transition-all duration-200"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button 
                            className="h-12 w-full text-base font-medium group" 
                            type="submit" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    New to FinSIght?
                                </span>
                            </div>
                        </div>

                        <Link href="/signup">
                            <Button 
                                variant="outline" 
                                className="h-12 w-full text-base font-medium" 
                                type="button"
                            >
                                Create an account
                            </Button>
                        </Link>
                    </form>

                    {/* Trust Indicators */}
                    <div className="pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">
                            Protected by enterprise-grade encryption. Your data is secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
