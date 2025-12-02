"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import PortfolioStats from "@/components/portfolio-stats"
import { useAuth } from "@/src/store/auth.context"

export default function PortfolioPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading || !isAuthenticated || !user) {
        return null
    }

    return (
        <ChatLayout>
            <div className="flex-1 overflow-y-auto p-4">
                <PortfolioStats userId={user.id} />
            </div>
        </ChatLayout>
    )
}
