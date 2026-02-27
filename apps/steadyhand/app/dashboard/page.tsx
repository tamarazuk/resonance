import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Button } from "@resonance/ui/components/button";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state";
import Link from "next/link";
import type { Application, TriageAction } from "@resonance/types";
import { ActiveApplicationsTable } from "@/components/dashboard/ActiveApplicationsTable";
import { TriageCard } from "@/components/dashboard/TriageCard";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getApplications(): Promise<Application[]> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getTriageActions(): Promise<TriageAction[]> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/triage`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [applications, triageActions] = await Promise.all([
    getApplications(),
    getTriageActions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          Your high-priority action items and active applications.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Action items */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Action Items
          </h2>
          {triageActions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {triageActions.map((action) => (
                <TriageCard key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-1">
              <EmptyState>
                <EmptyStateIcon>
                  <CheckIcon className="size-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>All caught up</EmptyStateTitle>
                <EmptyStateDescription>
                  No pending action items. Start a conversation with the Career
                  Coach to build your experience bank.
                </EmptyStateDescription>
                <EmptyStateAction>
                  <Button
                    nativeButton={false}
                    render={<Link href="/dashboard/chat" />}
                    className="rounded-full"
                  >
                    Open Career Coach
                  </Button>
                </EmptyStateAction>
              </EmptyState>
            </div>
          )}
        </section>

        {/* Active applications */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active Applications
            </h2>
            <Link
              href="/dashboard/applications/new"
              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 sm:px-5"
            >
              <PlusIcon className="size-4" />
              New Application
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <ActiveApplicationsTable applications={applications} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-1">
              <EmptyState>
                <EmptyStateIcon>
                  <BriefcaseIcon className="size-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>No applications yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Submit a job posting URL to start tracking an application. The
                  AI will parse the job description, analyze your fit, and draft
                  tailored materials.
                </EmptyStateDescription>
                <EmptyStateAction>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/dashboard/applications/new" />}
                    className="rounded-full"
                  >
                    Add your first application
                  </Button>
                </EmptyStateAction>
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

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
