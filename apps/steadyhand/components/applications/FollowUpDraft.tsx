"use client";

import { useEffect, useState } from "react";
import type { FollowUpDraft as FollowUpDraftType } from "@resonance/types";
import { updateFollowUp } from "@/lib/api/client";

interface FollowUpDraftProps {
  applicationId: string;
  draft: FollowUpDraftType;
  onUpdated: (updated: FollowUpDraftType) => void;
}

const typeLabels: Record<FollowUpDraftType["type"], string> = {
  thank_you: "Thank You",
  check_in: "Check-In",
  negotiation: "Negotiation",
};

const statusColors: Record<FollowUpDraftType["status"], string> = {
  draft:
    "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
  approved:
    "border-green-200 bg-green-50 text-green-600 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400",
  sent: "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-400/20 dark:bg-gray-400/10 dark:text-gray-400",
  dismissed:
    "border-red-200 bg-red-50 text-red-500 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400",
};

export function FollowUpDraft({
  applicationId,
  draft,
  onUpdated,
}: FollowUpDraftProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(draft.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setContent(draft.content);
    }
  }, [draft.id, draft.content, editing]);

  async function handleSave() {
    if (saving || content === draft.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFollowUp(applicationId, draft.id, {
        content,
      });
      onUpdated(updated);
      setEditing(false);
    } catch {
      // Revert on failure
      setContent(draft.content);
      setEditing(false);
      setError("Couldn't save this draft. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: "approved" | "dismissed") {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFollowUp(applicationId, draft.id, {
        status,
      });
      onUpdated(updated);
    } catch {
      setError("Couldn't update status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isFinal = draft.status === "sent" || draft.status === "dismissed";

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {typeLabels[draft.type]}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[draft.status]}`}
          >
            {draft.status}
          </span>
        </div>
        {draft.suggestedSendAt && (
          <span className="text-xs text-muted-foreground">
            Send by {new Date(draft.suggestedSendAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm font-light text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm font-light leading-relaxed text-foreground">
          {draft.content}
        </p>
      )}

      {/* Actions */}
      {!isFinal && (
        <div className="flex items-center gap-2 pt-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setContent(draft.content);
                  setEditing(false);
                }}
                disabled={saving}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={saving}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Edit
              </button>
              {draft.status === "draft" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange("approved")}
                  disabled={saving}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Approving..." : "Approve"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStatusChange("dismissed")}
                disabled={saving}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-400/10 disabled:opacity-50"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
