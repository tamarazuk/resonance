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

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({
  error,
  reset,
}: DashboardErrorPageProps) {
  useEffect(() => {
    console.error("Dashboard route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-16 lg:px-10">
      <div className="w-full rounded-2xl border border-border bg-card p-2">
        <EmptyState>
          <EmptyStateIcon>
            <AlertTriangleIcon className="size-10" />
          </EmptyStateIcon>
          <EmptyStateTitle>Something went wrong</EmptyStateTitle>
          <EmptyStateDescription>
            Steadyhand hit a problem loading this dashboard view. Try again, or
            return to your dashboard home.
          </EmptyStateDescription>
          <EmptyStateAction className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button
              variant="outline"
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

function AlertTriangleIcon({ className }: { className?: string }) {
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
      <path d="m10.29 3.86-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
