import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@resonance/ui/components/card"
import { Button } from "@resonance/ui/components/button"
import { Separator } from "@resonance/ui/components/separator"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state"
import Link from "next/link"

export default function DashboardPage() {
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">No applications yet</CardTitle>
            <CardDescription>
              Submit a job posting URL to start tracking an application. The AI
              will parse the job description, analyze your fit, and draft
              tailored materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/applications/new" />}>
              Add your first application
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
