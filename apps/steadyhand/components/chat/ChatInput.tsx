"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@resonance/ui/components/button"

/**
 * Chat text input with send button + non-functional voice dictation placeholder.
 *
 * Manages its own input state and calls `onSend` with the message text.
 * The microphone icon is a UI placeholder for future Web Speech API integration.
 */
export function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void
  disabled?: boolean
}) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput("")
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input, disabled, onSend])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    // Auto-resize textarea
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="flex items-end gap-2 rounded-lg border border-input bg-background px-3 py-2">
      {/* Voice dictation placeholder (non-functional in MVP) */}
      <button
        type="button"
        disabled
        className="mb-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground/50 transition-colors"
        title="Voice dictation (coming soon)"
        aria-label="Voice dictation (coming soon)"
      >
        <MicIcon className="h-4 w-4" />
      </button>

      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Tell me about a professional experience..."
        disabled={disabled}
        rows={1}
        className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />

      <Button
        size="icon-sm"
        disabled={disabled || !input.trim()}
        onClick={handleSend}
        aria-label="Send message"
      >
        <SendIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function MicIcon({ className }: { className?: string }) {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
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
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  )
}
