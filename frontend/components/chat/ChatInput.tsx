"use client"

import { useState, useEffect } from "react"
import { Mic, Paperclip, Send, Sparkles, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"

interface ChatInputProps {
    onMessageSent: (message: string, response: string) => void
    onMessageSending?: (message: string) => void
    onError: (error: string) => void
    initialValue?: string
    onInputChange?: (value: string) => void
}

export function ChatInput({ onMessageSent, onMessageSending, onError, initialValue = "", onInputChange }: ChatInputProps) {
    const { userId } = useAuth()
    const [input, setInput] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setInput(initialValue)
    }, [initialValue])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setInput(newValue)
        onInputChange?.(newValue)
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading || !userId) return

        const message = input
        setInput("")
        
        // Immediately notify that message is being sent
        onMessageSending?.(message)
        
        setIsLoading(true)

        try {
            const response = await apiService.queryAgent(userId, {
                message,
                stream: false,
            })
            onMessageSent(message, response.response)
        } catch (err: unknown) {
            // Enhanced error handling for API quota issues
            const errorMessage = (err instanceof Error ? err.message : String(err)) || "Failed to send message"
            
            if (errorMessage.includes("quota") || errorMessage.includes("high demand") || errorMessage.includes("429")) {
                onError(
                    "🔄 Our AI service is experiencing high demand right now. " +
                    "Please wait a moment and try again. " +
                    "Your message has not been lost."
                )
            } else if (errorMessage.includes("authentication") || errorMessage.includes("API key")) {
                onError("⚠️ Service authentication error. Please contact support.")
            } else {
                onError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="relative flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Textarea
                placeholder="Ask anything about your finances..."
                className="min-h-5 max-h-[200px] w-full resize-none border-0 bg-transparent px-0 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                                <Mic className="h-5 w-5 text-muted-foreground" />
                                <span className="sr-only">Voice input</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice input</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-lg"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send message</span>
                </Button>
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 rounded-full border-primary/20 bg-background/80 px-4 text-xs font-medium text-primary backdrop-blur-sm hover:bg-primary/5 hover:text-primary"
                >
                    <Sparkles className="h-3 w-3" />
                    AI Actions
                </Button>
            </div>
        </div>
    )
}
