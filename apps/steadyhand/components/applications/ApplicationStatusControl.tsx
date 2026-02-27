"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "@resonance/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

const statusLabels: Record<ApplicationStatus, string> = {
  draft: "Draft",
  ready_to_apply: "Ready to Apply",
  applied: "Applied",
  phone_screen: "Phone Screen",
  technical_interview: "Technical Interview",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const statusOptions: ApplicationStatus[] = [
  "draft",
  "ready_to_apply",
  "applied",
  "phone_screen",
  "technical_interview",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
];

export function ApplicationStatusControl({
  applicationId,
  initialStatus,
}: {
  applicationId: string;
  initialStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);

  function handleStatusChange(nextStatus: ApplicationStatus) {
    if (nextStatus === status) return;

    const previousStatus = status;
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message = getErrorMessage(payload, "Failed to update status");
          setStatus(previousStatus);
          toast.error(message);
          return;
        }

        toast.success(`Status updated to ${statusLabels[nextStatus]}`);
        router.refresh();
      } catch {
        setStatus(previousStatus);
        toast.error("Network error while updating status");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusPill status={status} label={statusLabels[status]} />

      <label className="sr-only" htmlFor="application-status-select">
        Application status
      </label>
      <select
        id="application-status-select"
        value={status}
        onChange={(event) =>
          handleStatusChange(event.target.value as ApplicationStatus)
        }
        disabled={isPending}
        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {statusLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  const isActive = !["rejected", "withdrawn"].includes(status);
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
      {label}
    </div>
  );
}
