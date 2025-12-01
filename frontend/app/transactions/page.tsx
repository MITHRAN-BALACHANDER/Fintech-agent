"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react"

import { ChatLayout } from "@/components/layout/ChatLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/src/store/auth.context"
import apiClient from "@/src/services/api.service"
import { UserStats } from "@/lib/types"

export default function TransactionsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (user?.id) {
            loadStats(user.id)
        }
    }, [user?.id])

    const loadStats = async (userId: string) => {
        try {
            setError(null)
            const data = await apiClient.getUserStats(userId)
            setStats(data)
        } catch (err: any) {
            setError(err.message || "Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || !isAuthenticated || !user) {
        return null
    }

    return (
        <ChatLayout>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Transaction History</h2>
                        <p className="text-sm text-muted-foreground">
                            View your recent trades and activity
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <Card className="border-destructive/50 bg-destructive/10">
                            <CardContent className="flex items-center gap-4 py-6">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                <p className="text-destructive">{error}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Recent Trades</CardTitle>
                                <CardDescription>Your latest trade executions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.recent_trades && stats.recent_trades.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recent_trades.map((trade) => (
                                            <div
                                                key={trade.id}
                                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${trade.action === "buy" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                                                        }`}>
                                                        {trade.action === "buy" ? (
                                                            <TrendingUp className="h-5 w-5" />
                                                        ) : (
                                                            <TrendingDown className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {trade.action.toUpperCase()} {trade.asset}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(trade.created_at).toLocaleDateString()} • {new Date(trade.created_at).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {trade.quantity} @ ${trade.price.toFixed(2)}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            trade.status === "executed"
                                                                ? "default"
                                                                : trade.status === "pending"
                                                                    ? "secondary"
                                                                    : "outline"
                                                        }
                                                        className="mt-1"
                                                    >
                                                        {trade.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                        <TrendingUp className="mb-4 h-12 w-12 opacity-20" />
                                        <p className="text-lg font-medium">No transactions yet</p>
                                        <p className="text-sm">Trades executed by the agent will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ChatLayout>
    )
}
