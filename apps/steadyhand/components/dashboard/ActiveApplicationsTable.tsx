import type { Application, ApplicationStatus } from "@resonance/types"
import { Badge } from "@resonance/ui/components/badge"
import { Button } from "@resonance/ui/components/button"
import Link from "next/link"

/**
 * Table listing active job applications with status, company, role,
 * and last activity date.
 *
 * Receives fully-typed Application objects. Extracts display fields
 * from `parsedJD` when available, falls back to the external URL.
 */
export function ActiveApplicationsTable({
  applications,
}: {
  applications: Application[]
}) {
  if (applications.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Company
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Last Activity
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr
              key={app.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-medium">
                {app.parsedJD?.company ?? "—"}
              </td>
              <td className="px-4 py-3">
                {app.parsedJD?.title ?? truncateUrl(app.externalUrl)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(app.updatedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href={`/dashboard/applications/${app.id}`} />
                  }
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draft", variant: "outline" },
  ready_to_apply: { label: "Ready", variant: "secondary" },
  applied: { label: "Applied", variant: "default" },
  phone_screen: { label: "Phone Screen", variant: "default" },
  technical_interview: { label: "Technical", variant: "default" },
  final_interview: { label: "Final Round", variant: "default" },
  offer: { label: "Offer", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function truncateUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "")
    return hostname.length > 30 ? hostname.slice(0, 30) + "..." : hostname
  } catch {
    return url.length > 30 ? url.slice(0, 30) + "..." : url
  }
}
