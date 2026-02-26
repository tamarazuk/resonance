"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@resonance/ui/components/button";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@resonance/ui/components/empty-state";

type ApplicationsErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ApplicationsErrorPage({
  error,
  reset,
}: ApplicationsErrorPageProps) {
  useEffect(() => {
    console.error("Applications route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-12 lg:px-10">
      <div className="w-full rounded-2xl border border-border bg-card p-2">
        <EmptyState>
          <EmptyStateIcon>
            <BriefcaseAlertIcon className="size-10" />
          </EmptyStateIcon>
          <EmptyStateTitle>
            Couldn&apos;t load this application view
          </EmptyStateTitle>
          <EmptyStateDescription>
            Steadyhand ran into an issue while opening this application page.
            You can retry now or start a new application.
          </EmptyStateDescription>
          <EmptyStateAction className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Retry</Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/applications/new" />}
            >
              New application
            </Button>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Back to dashboard
            </Button>
          </EmptyStateAction>
        </EmptyState>
      </div>
    </div>
  );
}

function BriefcaseAlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
      <path d="M12 11v3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
