/**
 * Chat Interface Component - Refactored
 * Real-time AI chat with streaming support
 */

"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner, ErrorAlert } from "@/src/components/ui/feedback";
import { apiService } from "@/src/services/api.service";
import MessageFormatter from "./MessageFormatter";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  userId: string;
}

const ChatMessage = memo(({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="glass dark:glass-dark h-8 w-8 shrink-0">
        <AvatarFallback className="bg-transparent">
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 wrap-break-word overflow-hidden ${
            isUser
              ? "glass-button dark:glass-button-dark"
              : "glass dark:glass-dark"
          }`}
        >
          <MessageFormatter content={message.content} />
        </div>
        <span className="text-xs text-muted-foreground px-2">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedInput = input.trim();
      if (!trimmedInput || loading) return;

      const userMessage: Message = {
        role: "user",
        content: trimmedInput,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setError(null);
      setLoading(true);

      try {
        const response = await apiService.queryAgent(userId, {
          message: trimmedInput,
          stream: false,
        });

        const assistantMessage: Message = {
          role: "assistant",
          content: response.response,
          timestamp: response.timestamp,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);

        // Add error message to chat
        const errorChatMessage: Message = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, userId]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col h-[600px] relative">
      {/* Error Alert */}
      {error && (
        <ErrorAlert error={error} className="mb-4" />
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-4 min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ask about stock prices, market trends, or get trading advice from
              your AI assistant.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="glass dark:glass-dark h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="glass dark:glass-dark rounded-2xl px-4 py-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about stocks, crypto, or market trends..."
          disabled={loading}
          className="glass-input dark:glass-input-dark"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default memo(ChatInterface);
