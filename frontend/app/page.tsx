"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { useAuth } from "@/src/store/auth.context"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  timestamp: string
}

function ChatPage() {
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
  
  // Get initial input based on action parameter
  const action = searchParams.get("action")
  const getInitialInput = () => {
    if (action === "trade") return "I want to buy "
    if (action === "analyse") return "Analyse my portfolio"
    return ""
  }
  const [initialInput, setInitialInput] = useState(getInitialInput())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleMessageSending = (userMessage: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages(prev => [
      ...prev,
      { role: "user", content: userMessage, timestamp },
      { role: "assistant", content: "Thinking...", timestamp }
    ])
  }

  const handleMessageSent = (userMessage: string, response: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Replace the "Thinking..." message with actual response
    setMessages(prev => {
      const newMessages = [...prev]
      // Remove the loading message
      newMessages.pop()
      // Add the actual response
      newMessages.push({ role: "assistant", content: response, timestamp })
      return newMessages
    })
  }

  const handleError = (error: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Replace the "Thinking..." message with error
    setMessages(prev => {
      const newMessages = [...prev]
      // Remove the loading message
      newMessages.pop()
      // Add the error message
      newMessages.push({
        role: "assistant",
        content: <span className="text-destructive">Error: {error}</span>,
        timestamp
      })
      return newMessages
    })
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
            onMessageSending={handleMessageSending}
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

export default function Page() {
  return (
    <Suspense fallback={<ChatLayout><div className="flex items-center justify-center h-full">Loading...</div></ChatLayout>}>
      <ChatPage />
    </Suspense>
  )
}
