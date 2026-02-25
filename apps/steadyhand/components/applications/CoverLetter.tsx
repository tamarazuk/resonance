"use client"

import { useState } from "react"
import { Button } from "@resonance/ui/components/button"

/**
 * Displays AI-drafted cover letter paragraphs with a copy-to-clipboard button.
 *
 * Each paragraph is rendered as a separate block for readability.
 * Users can copy the full letter or edit inline (future enhancement).
 */
export function CoverLetter({
  paragraphs,
}: {
  paragraphs: string[]
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const fullText = paragraphs.join("\n\n")
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {paragraphs.length} paragraph{paragraphs.length !== 1 ? "s" : ""}
        </p>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-6 text-sm leading-relaxed">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

// ─── Inline icons ────────────────────────────────────────────────────────────

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
  )
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
  )
}
