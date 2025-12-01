"use client"

import { Bell, Lock, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function TopNavigation() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secure • 256-bit encrypted</span>
                </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </Button>
            </div>
        </header>
    )
}
