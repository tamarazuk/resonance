"use client";

import { useState, useCallback } from "react";
import type {
  FollowUpDraft as FollowUpDraftType,
  FollowUpType,
} from "@resonance/types";
import { createFollowUp } from "@/lib/api/client";
import { FollowUpDraft } from "./FollowUpDraft";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state";

interface FollowUpListProps {
  applicationId: string;
  initialDrafts: FollowUpDraftType[];
}

const generateOptions: { type: FollowUpType; label: string }[] = [
  { type: "thank_you", label: "Thank You" },
  { type: "check_in", label: "Check-In" },
  { type: "negotiation", label: "Negotiation" },
];

export function FollowUpList({
  applicationId,
  initialDrafts,
}: FollowUpListProps) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [generating, setGenerating] = useState<FollowUpType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(type: FollowUpType) {
    if (generating) return;
    setError(null);
    setGenerating(type);
    try {
      const draft = await createFollowUp(applicationId, type);
      setDrafts((prev) => [draft, ...prev]);
    } catch {
      setError("Failed to generate follow-up. Please try again.");
    } finally {
      setGenerating(null);
    }
  }

  const handleDraftUpdated = useCallback((updated: FollowUpDraftType) => {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Generate buttons */}
      <div className="flex flex-wrap gap-2">
        {generateOptions.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleGenerate(opt.type)}
            disabled={generating !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary disabled:opacity-50"
          >
            {generating === opt.type ? (
              <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlusIcon className="h-3.5 w-3.5" />
            )}
            Generate {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Draft list */}
      {drafts.length > 0 ? (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <FollowUpDraft
              key={draft.id}
              applicationId={applicationId}
              draft={draft}
              onUpdated={handleDraftUpdated}
            />
          ))}
        </div>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <MailIcon className="h-10 w-10" />
          </EmptyStateIcon>
          <EmptyStateTitle>No follow-ups yet</EmptyStateTitle>
          <EmptyStateDescription>
            Generate a follow-up message to send after your interview. Choose a
            type above to get started.
          </EmptyStateDescription>
        </EmptyState>
      )}
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

function SpinnerIcon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
