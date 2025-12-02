"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Shield, Loader2, Check, Camera } from "lucide-react"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [avatarUrl, setAvatarUrl] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [userStats, setUserStats] = useState<{
        watchlists: number;
        active_rules: number;
        total_trades: number;
        total_rules: number;
    } | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        risk_profile: "moderate" as "conservative" | "moderate" | "aggressive",
    })

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        const loadUserStats = async () => {
            if (!user?.id) return
            setIsLoading(true)
            try {
                const stats = await apiService.getUserStats(user.id)
                setUserStats(stats)
            } catch (err) {
                console.error("Failed to load user stats:", err)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                risk_profile: user.risk_profile || "moderate",
            })
            setAvatarUrl(user.avatar_url || "")
            loadUserStats()
        }
    }, [user])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // In production, upload to server and get URL
            // For now, create a local preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setAvatarUrl(result)
                updateUser({ avatar_url: result })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) return

        setIsSaving(true)
        setMessage(null)

        try {
            // In a real app, you'd have an update user endpoint
            // await apiService.updateUser(user.id, { ...formData, avatar_url: avatarUrl })
            updateUser({ ...formData, avatar_url: avatarUrl })
            setMessage({ type: "success", text: "Profile updated successfully!" })
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            console.error("Failed to update profile:", err)
            setMessage({ type: "error", text: "Failed to update profile" })
        } finally {
            setIsSaving(false)
        }
    }

    if (authLoading || !user) {
        return (
            <ChatLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ChatLayout>
        )
    }

    return (
        <ChatLayout>
            <div className="flex justify-center w-full">
                <div className="space-y-6 max-w-4xl w-full px-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences</p>
                    </div>

                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage 
                                        src={avatarUrl || user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {user.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1 space-y-2 text-center md:text-left">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                                    <Mail className="h-4 w-4" />
                                    <p>{user.email}</p>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                                        <Phone className="h-4 w-4" />
                                        <p>{user.phone}</p>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <Badge variant="secondary">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {formData.risk_profile}
                                    </Badge>
                                    {user.agent_id && (
                                        <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                                            AI Agent Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                {userStats && !isLoading && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Watchlists</CardDescription>
                                <CardTitle className="text-3xl">{userStats.watchlists || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Active Rules</CardDescription>
                                <CardTitle className="text-3xl">{userStats.active_rules || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Trades</CardDescription>
                                <CardTitle className="text-3xl">{userStats.total_trades || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Rules</CardDescription>
                                <CardTitle className="text-3xl">{userStats.total_rules || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {/* Profile Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {message && (
                                <div
                                    className={`rounded-lg p-4 text-sm ${
                                        message.type === "success"
                                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                            : "bg-destructive/10 text-destructive border border-destructive/20"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {message.type === "success" && <Check className="h-4 w-4" />}
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        <User className="inline h-4 w-4 mr-1" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        <Shield className="inline h-4 w-4 mr-1" />
                                        Risk Profile
                                    </Label>
                                    <div className="flex gap-2">
                                        {(["conservative", "moderate", "aggressive"] as const).map((profile) => (
                                            <Button
                                                key={profile}
                                                type="button"
                                                variant={formData.risk_profile === profile ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFormData({ ...formData, risk_profile: profile })}
                                                disabled={isSaving}
                                                className="flex-1 capitalize"
                                            >
                                                {profile}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                </div>
            </div>
        </ChatLayout>
    )
}
