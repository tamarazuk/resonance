"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state";

/**
 * Main chat container — message list + input area.
 *
 * Uses `useChat()` from `@ai-sdk/react` (AI SDK v6) to manage message state,
 * streaming, and tool call rendering. Calls `onExperienceSaved` whenever a
 * tool invocation completes so the parent can refresh the Memory Bank sidebar.
 */
export function ChatWindow({
  onExperienceSaved,
}: {
  onExperienceSaved?: () => void;
}) {
  const { messages, sendMessage, status } = useChat({
    onFinish() {
      // When the assistant finishes a response, check if any tool calls
      // completed successfully — if so, notify the parent to refresh
      // the Memory Bank sidebar.
      onExperienceSaved?.();
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-8 overflow-y-auto p-8"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState>
              <EmptyStateIcon>
                <ChatBubbleIcon className="h-10 w-10" />
              </EmptyStateIcon>
              <EmptyStateTitle>Start a conversation</EmptyStateTitle>
              <EmptyStateDescription>
                Tell the Career Coach about your professional experiences. It
                will extract, structure, and save them to your Memory Bank
                automatically.
              </EmptyStateDescription>
            </EmptyState>
          </div>
        ) : (
          <>
            {/* Timestamp */}
            <div className="flex justify-center">
              <span className="text-xs font-light text-muted-foreground/60">
                Today,{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </>
        )}

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              AI
            </div>
            <div className="flex flex-col gap-1">
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                Coach Sarah
              </span>
              <div className="rounded-xl rounded-tl-none border border-border bg-card px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="bg-card px-8 pb-8 pt-2">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" />
    </span>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}
