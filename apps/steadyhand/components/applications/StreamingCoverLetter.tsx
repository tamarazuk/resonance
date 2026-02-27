"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StreamingCoverLetterProps {
  applicationId: string;
  onComplete?: (paragraphs: string[]) => void;
  autoStart?: boolean;
}

interface SseMessage {
  type: "text" | "finish" | "error";
  value?: string;
  accumulated?: string;
  paragraphs?: string[];
  message?: string;
}

export function StreamingCoverLetter({
  applicationId,
  onComplete,
  autoStart = false,
}: StreamingCoverLetterProps) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const startGeneration = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setParagraphs([]);
    setIsComplete(false);
    contentRef.current = "";

    abortRef.current = new AbortController();

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/stream-cover-letter`,
        {
          method: "POST",
          signal: abortRef.current.signal,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate cover letter");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: SseMessage = JSON.parse(line.slice(6));

              if (data.type === "text") {
                const accumulated = data.accumulated ?? contentRef.current;
                contentRef.current = accumulated;
                const liveParagraphs = accumulated
                  .split("\n\n")
                  .map((p) => p.replace(/\n/g, " ").trim())
                  .filter(Boolean);
                setParagraphs(
                  liveParagraphs.length ? liveParagraphs : [accumulated],
                );
              } else if (data.type === "finish") {
                setIsComplete(true);
                if (data.paragraphs) {
                  setParagraphs(data.paragraphs);
                  onComplete?.(data.paragraphs);
                }
              } else if (data.type === "error") {
                throw new Error(
                  data.message || "Failed to generate cover letter",
                );
              }
            } catch {
              // Ignore parse errors for incomplete messages
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      abortRef.current = null;
    }
  }, [applicationId, onComplete]);

  useEffect(() => {
    if (autoStart && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      void startGeneration();
    }
  }, [autoStart, startGeneration]);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      const fullText = paragraphs.join("\n\n");
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
        <button
          type="button"
          onClick={startGeneration}
          className="rounded-full border border-primary bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isLoading && paragraphs.length === 0 && !isComplete) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Generate a cover letter tailored to this position.
        </div>
        <button
          onClick={startGeneration}
          className="rounded-full border border-primary bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Generate Cover Letter
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {paragraphs.length > 0
            ? `${paragraphs.length} paragraph${paragraphs.length !== 1 ? "s" : ""}`
            : "Generating..."}
        </p>
        {paragraphs.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium transition-all hover:border-primary/50 hover:text-primary"
          >
            {copyError ? (
              <span className="text-destructive">Failed</span>
            ) : copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-background p-6 text-sm font-light leading-relaxed text-foreground">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}

        {isLoading && !isComplete && (
          <span className="inline-block h-4 w-2 animate-pulse bg-primary/50" />
        )}
      </div>

      {isComplete && (
        <button
          onClick={startGeneration}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
        >
          Regenerate
        </button>
      )}
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
