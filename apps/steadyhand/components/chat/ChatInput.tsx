"use client";

import { useState, useRef, useCallback } from "react";
import { useVoiceDictation } from "@/components/chat/useVoiceDictation";

function resizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;

  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
}

/**
 * Chat text input with bottom-border style, + button, voice dictation, and send arrow.
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

  const resizeCurrentTextarea = useCallback(() => {
    resizeTextarea(textareaRef.current);
  }, []);

  const {
    isVoiceSupported,
    isListening,
    voiceStatusMessage,
    clearVoiceStatusMessage,
    toggleVoiceDictation,
    stopVoiceDictation,
    resetVoiceDictation,
  } = useVoiceDictation({
    disabled,
    inputValue: input,
    onInputChange: setInput,
    onAfterInputChange: resizeCurrentTextarea,
  });

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    if (isListening) {
      stopVoiceDictation();
    }

    onSend(trimmed);
    setInput("");
    resetVoiceDictation();
    resizeCurrentTextarea();
  }, [
    input,
    disabled,
    isListening,
    onSend,
    stopVoiceDictation,
    resetVoiceDictation,
    resizeCurrentTextarea,
  ]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (voiceStatusMessage) {
      clearVoiceStatusMessage();
    }

    setInput(e.target.value);
    resizeTextarea(e.target);
  }

  function handleVoiceToggle() {
    toggleVoiceDictation();
  }

  function handleVoiceKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (
      (e.key === "Enter" || e.key === " ") &&
      !isVoiceSupported &&
      !disabled
    ) {
      e.preventDefault();
      handleVoiceToggle();
    }
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
          readOnly={isListening}
          rows={1}
          className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent px-2 py-3 text-base font-light leading-6 text-foreground outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default"
        />

        {/* Voice dictation */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleVoiceToggle}
          onKeyDown={handleVoiceKeyDown}
          className={`p-3 transition-colors disabled:text-muted-foreground/30 ${
            !isVoiceSupported
              ? "cursor-not-allowed text-muted-foreground/30"
              : isListening
                ? "text-primary"
                : "text-muted-foreground/50 hover:text-primary"
          }`}
          title={
            !isVoiceSupported
              ? "Voice dictation is not supported in this browser"
              : isListening
                ? "Stop voice dictation"
                : "Start voice dictation"
          }
          aria-label={
            !isVoiceSupported
              ? "Voice dictation is not supported in this browser"
              : isListening
                ? "Stop voice dictation"
                : "Start voice dictation"
          }
          tabIndex={disabled ? -1 : 0}
          aria-pressed={isListening}
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
        {voiceStatusMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-1 text-xs font-light text-muted-foreground"
          >
            {voiceStatusMessage}
          </p>
        ) : null}
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
