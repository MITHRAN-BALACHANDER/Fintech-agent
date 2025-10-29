"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import apiClient from "@/lib/api-client";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  userId: string;
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiClient.queryAgent(userId, {
        message: input,
        stream: false,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg glass-button dark:glass-button-dark flex items-center justify-center">
                <Bot className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">Start a conversation with your AI trading assistant</p>
              <p className="text-xs mt-2">
                Try asking: "What's the current price of AAPL?" or "Should I buy Bitcoin?"
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full glass-button dark:glass-button-dark flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <Card
                  className={`px-4 py-3 max-w-[80%] border-0 smooth-transition ${
                    message.role === "user"
                      ? "bg-foreground text-background shadow-lg"
                      : "glass-card dark:glass-card-dark"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap m-0 text-sm leading-relaxed">{message.content}</p>
                  </div>
                </Card>
                {message.role === "user" && (
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full glass-button dark:glass-button-dark flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full glass-button dark:glass-button-dark flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <Card className="px-4 py-3 glass-card dark:glass-card-dark border-0">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-4">
        <Textarea
          placeholder="Ask about stocks, crypto, or market trends..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[60px] resize-none glass-input dark:glass-input-dark"
          disabled={loading}
        />
        <Button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          size="lg"
          className="glass-button dark:glass-button-dark border-0 hover:scale-105"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
