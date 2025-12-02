"use client"

import { useState } from "react"
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

export function TopNavigation() {
    const router = useRouter()
    const { user } = useAuth()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to search page or filter current page
            router.push(`/?search=${encodeURIComponent(searchQuery)}`)
            setIsSearchOpen(false)
            setSearchQuery("")
        }
    }

    // Mock notifications - in real app, fetch from API
    const notifications = [
        { id: 1, title: "Price Alert", message: "AAPL reached $150", time: "5m ago", unread: true },
        { id: 2, title: "Trade Executed", message: "Buy order filled for TSLA", time: "1h ago", unread: true },
        { id: 3, title: "Market Update", message: "S&P 500 up 2.5%", time: "2h ago", unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secure • 256-bit encrypted</span>
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
                                                {notification.unread && (
                                                    <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">{notification.message}</span>
                                            <span className="text-xs text-muted-foreground">{notification.time}</span>
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
