import { cookies } from "next/headers"
import { Separator } from "@resonance/ui/components/separator"
import { Button } from "@resonance/ui/components/button"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state"
import Link from "next/link"
import type { Application } from "@resonance/types"
import { ActiveApplicationsTable } from "@/components/dashboard/ActiveApplicationsTable"

// TODO: Replace with real triage action items from a future API endpoint
// import { TriageCard, type TriageAction } from "@/components/dashboard/TriageCard"

async function getApplications(): Promise<Application[]> {
  try {
    const cookieStore = await cookies()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const applications = await getApplications()

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your high-priority action items and active applications.
        </p>
      </div>

      <Separator />

      {/* Action items section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Action Items</h2>
        {/* TODO: Wire up TriageCard when triage API exists */}
        <EmptyState>
          <EmptyStateIcon>
            <CheckIcon className="h-10 w-10" />
          </EmptyStateIcon>
          <EmptyStateTitle>All caught up</EmptyStateTitle>
          <EmptyStateDescription>
            No pending action items. Start a conversation with the Career Coach
            to build your experience bank.
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button nativeButton={false} render={<Link href="/dashboard/chat" />}>
              Open Career Coach
            </Button>
          </EmptyStateAction>
        </EmptyState>
      </section>

      <Separator />

      {/* Active applications section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Applications</h2>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard/applications/new" />}>
            New Application
          </Button>
        </div>

        {applications.length > 0 ? (
          <ActiveApplicationsTable applications={applications} />
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <BriefcaseIcon className="h-10 w-10" />
            </EmptyStateIcon>
            <EmptyStateTitle>No applications yet</EmptyStateTitle>
            <EmptyStateDescription>
              Submit a job posting URL to start tracking an application. The AI
              will parse the job description, analyze your fit, and draft
              tailored materials.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/applications/new" />}>
                Add your first application
              </Button>
            </EmptyStateAction>
          </EmptyState>
        )}
      </section>
    </div>
  )
}

// ─── Inline icons ────────────────────────────────────────────────────────────

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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}
