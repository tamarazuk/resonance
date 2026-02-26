"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type SpeechRecognitionResultAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };

  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

function resizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;

  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
}

function combineTranscript(base: string, dictated: string) {
  const normalizedBase = base.trimEnd();
  const normalizedDictated = dictated.trim();

  if (!normalizedDictated) {
    return base;
  }

  if (!normalizedBase) {
    return normalizedDictated;
  }

  return `${normalizedBase} ${normalizedDictated}`;
}

function mapSpeechError(errorCode: string) {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission is blocked. Allow access and try again.";
    case "audio-capture":
      return "No microphone was detected. Check your microphone settings.";
    case "network":
      return "Voice dictation lost connection. Please try again.";
    case "no-speech":
      return "No speech detected. Try speaking a little louder.";
    default:
      return "Voice dictation failed. Please try again.";
  }
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
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const dictationBaseRef = useRef("");
  const finalTranscriptRef = useRef("");
  const hadRecognitionErrorRef = useRef(false);
  const isDictatingRef = useRef(false);

  const stopDictation = useCallback((mode: "stop" | "abort" = "stop") => {
    isDictatingRef.current = false;

    if (mode === "abort") {
      recognitionRef.current?.abort();
      return;
    }

    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    setIsVoiceSupported(getSpeechRecognitionConstructor() !== null);
  }, []);

  useEffect(() => {
    if (!disabled || !isListening) {
      return;
    }

    stopDictation();
  }, [disabled, isListening, stopDictation]);

  useEffect(() => {
    return () => {
      stopDictation("abort");
      recognitionRef.current = null;
    };
  }, [stopDictation]);

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      if (!isDictatingRef.current) {
        return;
      }

      let interimTranscript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const segment = result[0]?.transcript?.trim() ?? "";

        if (!segment) {
          continue;
        }

        if (result.isFinal) {
          finalTranscriptRef.current = combineTranscript(
            finalTranscriptRef.current,
            segment,
          );
        } else {
          interimTranscript = combineTranscript(interimTranscript, segment);
        }
      }

      const combinedDictation = combineTranscript(
        finalTranscriptRef.current,
        interimTranscript,
      );
      const nextValue = combineTranscript(
        dictationBaseRef.current,
        combinedDictation,
      );

      setInput(nextValue);
      resizeTextarea(textareaRef.current);
    };

    recognition.onerror = (event) => {
      isDictatingRef.current = false;
      hadRecognitionErrorRef.current = true;
      setVoiceStatusMessage(mapSpeechError(event.error));
      setIsListening(false);
    };

    recognition.onend = () => {
      isDictatingRef.current = false;
      setIsListening(false);
      if (!hadRecognitionErrorRef.current) {
        setVoiceStatusMessage(null);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    if (isListening) {
      stopDictation();
    }

    onSend(trimmed);
    setInput("");
    dictationBaseRef.current = "";
    finalTranscriptRef.current = "";
    setVoiceStatusMessage(null);
    resizeTextarea(textareaRef.current);
  }, [input, disabled, isListening, onSend, stopDictation]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (voiceStatusMessage) {
      setVoiceStatusMessage(null);
    }

    setInput(e.target.value);
    resizeTextarea(e.target);
  }

  function handleVoiceToggle() {
    if (disabled) {
      return;
    }

    if (isListening) {
      stopDictation();
      return;
    }

    const recognition = ensureRecognition();
    if (!recognition) {
      setVoiceStatusMessage(
        "Voice dictation is not supported in this browser.",
      );
      return;
    }

    dictationBaseRef.current = input;
    finalTranscriptRef.current = "";
    hadRecognitionErrorRef.current = false;
    setVoiceStatusMessage("Listening...");

    try {
      recognition.start();
      isDictatingRef.current = true;
      setIsListening(true);
    } catch {
      isDictatingRef.current = false;
      hadRecognitionErrorRef.current = true;
      setVoiceStatusMessage(
        "Unable to start voice dictation. Please try again.",
      );
      setIsListening(false);
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
          disabled={disabled || !isVoiceSupported}
          onClick={handleVoiceToggle}
          className={`p-3 transition-colors disabled:text-muted-foreground/30 ${
            isListening
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
            isListening ? "Stop voice dictation" : "Start voice dictation"
          }
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
