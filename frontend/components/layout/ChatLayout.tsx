"use client"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopNavigation } from "@/components/layout/TopNavigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface ChatLayoutProps {
    children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopNavigation />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
