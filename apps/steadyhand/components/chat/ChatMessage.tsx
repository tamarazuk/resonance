"use client";

import type { UIMessage } from "ai";
import { Badge } from "@resonance/ui/components/badge";
import { cn } from "@resonance/ui/lib/utils";

/**
 * Individual chat message — renders user, assistant, and tool-result variants.
 *
 * Uses the AI SDK v6 `UIMessage` type with `parts` array to render
 * text content and tool invocation results inline.
 */
export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4 group",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary grayscale-[50%]">
          AI
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Name label */}
        <span
          className={cn(
            "text-xs font-medium text-muted-foreground",
            isUser ? "mr-1" : "ml-1",
          )}
        >
          {isUser ? "You" : "Coach Sarah"}
        </span>

        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl p-4 text-[0.95rem] leading-relaxed",
                    isUser
                      ? "rounded-tr-none bg-secondary text-foreground"
                      : "rounded-tl-none border border-border bg-card text-foreground/85",
                  )}
                >
                  {part.text}
                </div>
              );

            case "step-start":
              return null;

            default: {
              // Handle tool invocation parts
              if ("toolCallId" in part && "state" in part) {
                return (
                  <ToolResultBadge
                    key={i}
                    state={part.state}
                    output={
                      part.state === "output-available"
                        ? (part.output as ToolOutput)
                        : undefined
                    }
                  />
                );
              }
              return null;
            }
          }
        })}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground/60">
          You
        </div>
      )}
    </div>
  );
}

type ToolOutput = {
  success: boolean;
  summary?: string;
  skillCount?: number;
};

function ToolResultBadge({
  state,
  output,
}: {
  state: string;
  output?: ToolOutput;
}) {
  if (state === "output-available" && output?.success) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
        <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-muted-foreground">
          {output.summary ?? "Experience saved to Memory Bank"}
        </span>
        {output.skillCount != null && output.skillCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {output.skillCount} skill{output.skillCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        <XCircleIcon className="h-4 w-4 shrink-0" />
        <span>Failed to save experience</span>
      </div>
    );
  }

  // Loading states: input-streaming, input-available
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      <LoadingDots />
      <span>Saving to Memory Bank...</span>
    </div>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function CheckCircleIcon({ className }: { className?: string }) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}
