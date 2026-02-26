"use client";

import { useState, useEffect, useRef } from "react";
import { useSse } from "@ai-sdk/react";

interface StreamingCoverLetterProps {
  applicationId: string;
  onComplete?: (paragraphs: string[]) => void;
}

export function StreamingCoverLetter({
  applicationId,
  onComplete,
}: StreamingCoverLetterProps) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<string>("");

  const { data, isLoading } = useSse({
    api: `/api/applications/${applicationId}/stream-cover-letter`,
    method: "POST",
  });

  useEffect(() => {
    if (!data) return;

    const message = data as {
      type: string;
      value?: string;
      accumulated?: string;
      paragraphs?: string[];
    };

    if (message.type === "text") {
      contentRef.current =
        (message.accumulated || contentRef.current) + (message.value || "");
    } else if (message.type === "finish") {
      setIsComplete(true);
      if (message.paragraphs) {
        setParagraphs(message.paragraphs);
        onComplete?.(message.paragraphs);
      }
    }
  }, [data, onComplete]);

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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!isLoading && paragraphs.length === 0 && !isComplete) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Click "Generate Draft" to create your cover letter.
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
