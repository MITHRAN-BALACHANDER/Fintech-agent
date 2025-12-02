"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
    Bell, 
    Mail, 
    MessageSquare, 
    Phone, 
    Shield, 
    Loader2, 
    Check,
    Moon,
    Sun,
    Laptop
} from "lucide-react"
import { useAuth } from "@/src/store/auth.context"
import { useTheme } from "next-themes"

export default function SettingsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const { theme, setTheme } = useTheme()
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [settings, setSettings] = useState({
        notifications: {
            email: false,
            sms: false,
            push: false,
            webhook: false,
        },
        trading: {
            autoExecute: false,
            confirmTrades: true,
            riskWarnings: true,
        },
        privacy: {
            dataSharing: false,
            analytics: true,
        }
    })

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (user) {
            // Load user's notification preferences from the database
            setIsLoading(true)
            const userPreferences = user.preferred_channels || []
            setSettings(prev => ({
                ...prev,
                notifications: {
                    email: userPreferences.includes("email"),
                    sms: userPreferences.includes("sms"),
                    push: false, // Push not in preferred_channels type
                    webhook: userPreferences.includes("webhook"),
                }
            }))
            setIsLoading(false)
        }
    }, [user])

    const handleSave = async () => {
        if (!user?.id) return
        
        setIsSaving(true)
        setMessage(null)

        try {
            // Build preferred channels array from notification settings
            const preferredChannels: ("email" | "sms" | "webhook")[] = []
            if (settings.notifications.email) preferredChannels.push("email")
            if (settings.notifications.sms) preferredChannels.push("sms")
            if (settings.notifications.webhook) preferredChannels.push("webhook")

            // In a real app, you would update the user settings via API
            // await apiService.updateUser(user.id, { preferred_channels: preferredChannels })
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setMessage({ type: "success", text: "Settings saved successfully!" })
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            console.error("Failed to save settings:", err)
            setMessage({ type: "error", text: "Failed to save settings" })
        } finally {
            setIsSaving(false)
        }
    }

    if (authLoading || !user || isLoading) {
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
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your application preferences and settings</p>
                    </div>

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

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize how the application looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme" className="flex flex-col space-y-1">
                                <span>Theme</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Select your preferred color scheme
                                </span>
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={theme === "light" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className="gap-2"
                                >
                                    <Sun className="h-4 w-4" />
                                    Light
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className="gap-2"
                                >
                                    <Moon className="h-4 w-4" />
                                    Dark
                                </Button>
                                <Button
                                    variant={theme === "system" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("system")}
                                    className="gap-2"
                                >
                                    <Laptop className="h-4 w-4" />
                                    System
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Bell className="inline h-5 w-5 mr-2" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                                <span className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Notifications
                                </span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Receive notifications via email
                                </span>
                            </Label>
                            <Switch
                                id="email-notifications"
                                checked={settings.notifications.email}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, email: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                                <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    SMS Alerts
                                </span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Receive trading alerts via SMS
                                </span>
                            </Label>
                            <Switch
                                id="sms-notifications"
                                checked={settings.notifications.sms}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, sms: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                                <span className="flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    Push Notifications
                                </span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Browser push notifications
                                </span>
                            </Label>
                            <Switch
                                id="push-notifications"
                                checked={settings.notifications.push}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, push: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="webhook-notifications" className="flex flex-col space-y-1">
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Webhook Integration
                                </span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Send notifications to external services
                                </span>
                            </Label>
                            <Switch
                                id="webhook-notifications"
                                checked={settings.notifications.webhook}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, webhook: checked }
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Trading Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Shield className="inline h-5 w-5 mr-2" />
                            Trading Preferences
                        </CardTitle>
                        <CardDescription>Configure your trading behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-execute" className="flex flex-col space-y-1">
                                <span>Auto-Execute Trades</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Automatically execute trades when rules trigger
                                </span>
                            </Label>
                            <Switch
                                id="auto-execute"
                                checked={settings.trading.autoExecute}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        trading: { ...settings.trading, autoExecute: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="confirm-trades" className="flex flex-col space-y-1">
                                <span>Confirm Before Trading</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Require confirmation before executing trades
                                </span>
                            </Label>
                            <Switch
                                id="confirm-trades"
                                checked={settings.trading.confirmTrades}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        trading: { ...settings.trading, confirmTrades: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="risk-warnings" className="flex flex-col space-y-1">
                                <span>Risk Warnings</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Show warnings for high-risk trades
                                </span>
                            </Label>
                            <Switch
                                id="risk-warnings"
                                checked={settings.trading.riskWarnings}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        trading: { ...settings.trading, riskWarnings: checked }
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy & Data</CardTitle>
                        <CardDescription>Control your data and privacy preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="data-sharing" className="flex flex-col space-y-1">
                                <span>Data Sharing</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Share anonymized data for product improvement
                                </span>
                            </Label>
                            <Switch
                                id="data-sharing"
                                checked={settings.privacy.dataSharing}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        privacy: { ...settings.privacy, dataSharing: checked }
                                    })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="analytics" className="flex flex-col space-y-1">
                                <span>Analytics</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    Allow us to collect usage analytics
                                </span>
                            </Label>
                            <Switch
                                id="analytics"
                                checked={settings.privacy.analytics}
                                onCheckedChange={(checked) =>
                                    setSettings({
                                        ...settings,
                                        privacy: { ...settings.privacy, analytics: checked }
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
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
                </div>
            </div>
        </ChatLayout>
    )
}
