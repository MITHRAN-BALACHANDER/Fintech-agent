"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { PortfolioChart } from "@/components/chat/RichContent"
import { useAuth } from "@/src/store/auth.context"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  timestamp: string
}

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your personal finance assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [initialInput, setInitialInput] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const action = searchParams.get("action")
    if (action === "trade") {
      setInitialInput("I want to buy ")
    } else if (action === "analyse") {
      setInitialInput("Analyse my portfolio")
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleMessageSent = (userMessage: string, response: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages(prev => [
      ...prev,
      { role: "user", content: userMessage, timestamp },
      { role: "assistant", content: response, timestamp }
    ])
  }

  const handleError = (error: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: <span className="text-destructive">Error: {error}</span>,
        timestamp
      }
    ])
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <ChatLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 pt-0">
          <ChatInput
            onMessageSent={handleMessageSent}
            onError={handleError}
            initialValue={initialInput}
            onInputChange={setInitialInput}
          />
        </div>
      </div>
    </ChatLayout>
  )
}
