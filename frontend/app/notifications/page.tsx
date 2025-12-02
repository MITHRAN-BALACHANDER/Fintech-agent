"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Bell, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle2, 
    Info, 
    Loader2,
    Trash2,
    Check
} from "lucide-react"
import { useAuth } from "@/src/store/auth.context"

type NotificationType = "price_alert" | "trade" | "info" | "warning"

interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    time: string
    read: boolean
}

export default function NotificationsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "price_alert",
            title: "Price Alert Triggered",
            message: "AAPL has reached your target price of $150.00",
            time: "5 minutes ago",
            read: false
        },
        {
            id: "2",
            type: "trade",
            title: "Trade Executed",
            message: "Buy order for 10 shares of TSLA filled at $245.50",
            time: "1 hour ago",
            read: false
        },
        {
            id: "3",
            type: "info",
            title: "Market Update",
            message: "S&P 500 is up 2.5% today, reaching new highs",
            time: "2 hours ago",
            read: true
        },
        {
            id: "4",
            type: "warning",
            title: "Risk Alert",
            message: "Your portfolio volatility has increased by 15%",
            time: "3 hours ago",
            read: true
        },
        {
            id: "5",
            type: "trade",
            title: "Watchlist Alert",
            message: "NVDA added to your Tech Stocks watchlist",
            time: "1 day ago",
            read: true
        }
    ])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "price_alert":
                return <TrendingUp className="h-5 w-5 text-blue-500" />
            case "trade":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case "warning":
                return <AlertCircle className="h-5 w-5 text-orange-500" />
            case "info":
                return <Info className="h-5 w-5 text-muted-foreground" />
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    const unreadCount = notifications.filter(n => !n.read).length

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground">
                                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllAsRead}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearAll}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                            <p className="text-sm text-muted-foreground">
                                You&apos;re all caught up! Check back later for new updates.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notification) => (
                            <Card 
                                key={notification.id}
                                className={`transition-colors ${!notification.read ? 'bg-muted/50' : ''}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{notification.title}</h4>
                                                    {!notification.read && (
                                                        <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {notification.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                </div>
            </div>
        </ChatLayout>
    )
}
