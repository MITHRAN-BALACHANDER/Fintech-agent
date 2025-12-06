"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Lock, Search, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"
import { WalletButton } from "@/components/wallet/WalletButton"

interface Notification {
    id: string
    title: string
    message: string
    created_at: string
    read: boolean
}

export function TopNavigation() {
    const router = useRouter()
    const { user } = useAuth()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        const loadNotifications = async () => {
            if (!user?.id) return
            try {
                const data = await apiService.getNotifications(user.id)
                // Show only the 3 most recent
                setNotifications(data.slice(0, 3))
            } catch (err) {
                console.error("Failed to load notifications:", err)
            }
        }

        if (user) {
            loadNotifications()
        }
    }, [user])

    const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to search page or filter current page
            router.push(`/?search=${encodeURIComponent(searchQuery)}`)
            setIsSearchOpen(false)
            setSearchQuery("")
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secure </span>
                    {/* <span>Secure • 256-bit encrypted</span> */}
                </div>
            </div>
            
            {/* Search Bar - Expandable on Mobile */}
            <div className="ml-auto flex items-center gap-2">
                {isSearchOpen ? (
                    <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right">
                        <Input
                            type="search"
                            placeholder="Search stocks, crypto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 w-48 md:w-64"
                            autoFocus
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                setIsSearchOpen(false)
                                setSearchQuery("")
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                        
                        {/* Wallet Button */}
                        <WalletButton />

                        {/* Notifications Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <Badge 
                                            variant="destructive" 
                                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                    <span className="sr-only">Notifications</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium text-sm">{notification.title}</span>
                                                {!notification.read && (
                                                    <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">{notification.message}</span>
                                            <span className="text-xs text-muted-foreground">{getTimeAgo(notification.created_at)}</span>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No notifications
                                    </div>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-center justify-center cursor-pointer"
                                    onClick={() => router.push("/notifications")}
                                >
                                    View all notifications
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Settings Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push("/settings")}
                        >
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </>
                )}
            </div>
        </header>
    )
}
