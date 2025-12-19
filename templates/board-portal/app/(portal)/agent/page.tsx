"use client"

import { useEffect, useRef, type FormEvent, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, Loader2 } from "lucide-react"

export default function BoardAgentPage() {
  const [inputValue, setInputValue] = useState("")
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/board-agent" }),
  })

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isLoading = status === "in_progress"

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue("")
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* Messages area - full width, no card wrapper */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-4 font-medium text-sm sm:text-base">How can I help?</h2>
            <p className="mt-2 max-w-xs text-xs sm:text-sm text-muted-foreground">
              Meetings, governance, fiduciary duties, or board prep.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 w-full max-w-sm">
              {[
                "When is the next board meeting?",
                "Who is on the Finance Committee?",
                "What docs are ready for Q4?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage({ text: suggestion })}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-2 text-xs sm:text-sm hover:bg-secondary transition-colors text-left sm:text-center"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md",
                  )}
                >
                  {message.parts?.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
                          {part.text}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs sm:text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input - sticky bottom, no card wrapper */}
      <div className="border-t border-border bg-background p-3 sm:p-4">
        <form onSubmit={onSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-muted border-0 text-sm h-10 sm:h-11"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
