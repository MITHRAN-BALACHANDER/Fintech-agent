"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface ChatMessageProps {
    role: "user" | "assistant"
    content: React.ReactNode
    timestamp?: string
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
    return (
        <div
            className={cn(
                "flex w-full items-start gap-3",
                role === "user" ? "flex-row-reverse" : "flex-row"
            )}
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                    src={role === "user" ? "https://github.com/shadcn.png" : "/bot-avatar.png"}
                    alt={role}
                />
                <AvatarFallback>{role === "user" ? "U" : "AI"}</AvatarFallback>
            </Avatar>
            <div
                className={cn(
                    "flex max-w-[80%] flex-col gap-1",
                    role === "user" ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                        role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-card text-card-foreground border rounded-tl-sm"
                    )}
                >
                    {content}
                </div>
                {timestamp && (
                    <span className="text-xs text-muted-foreground">{timestamp}</span>
                )}
            </div>
        </div>
    )
}
