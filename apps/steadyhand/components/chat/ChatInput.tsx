"use client";

import { useState, useRef, useCallback } from "react";

/**
 * Chat text input with bottom-border style, + button, mic placeholder, and send arrow.
 *
 * Matches Stitch design: minimal bottom-border input, no box border.
 * "AI ASSISTED CONTENT" label centered below.
 */
export function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, disabled, onSend]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div>
      <div className="flex items-center border-b border-border transition-colors focus-within:border-primary">
        {/* Attachment placeholder */}
        <button
          type="button"
          disabled
          className="p-3 pl-0 text-muted-foreground/30 transition-colors hover:text-primary"
          title="Attach file (coming soon)"
          aria-label="Attach file (coming soon)"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your response..."
          disabled={disabled}
          rows={1}
          className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent px-2 py-3 text-base font-light leading-6 text-foreground outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Voice dictation placeholder (non-functional in MVP) */}
        <button
          type="button"
          disabled
          className="p-3 text-muted-foreground/30 transition-colors hover:text-primary"
          title="Voice dictation (coming soon)"
          aria-label="Voice dictation (coming soon)"
        >
          <MicIcon className="h-5 w-5" />
        </button>

        {/* Send button */}
        <button
          type="button"
          disabled={disabled || !input.trim()}
          onClick={handleSend}
          className="p-2 text-primary transition-colors hover:text-primary/70 disabled:text-muted-foreground/30"
          aria-label="Send message"
        >
          <ArrowForwardIcon className="h-5 w-5" />
        </button>
      </div>

      {/* AI assisted label */}
      <div className="mt-3 text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/30">
          AI Assisted Content
        </p>
      </div>
    </div>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

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
  );
}

function ArrowForwardIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
