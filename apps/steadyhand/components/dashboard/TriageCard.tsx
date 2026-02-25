import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@resonance/ui/components/card"
import { Badge } from "@resonance/ui/components/badge"
import { Button } from "@resonance/ui/components/button"
import Link from "next/link"

/**
 * Card for a single high-priority action item on the triage dashboard.
 *
 * Examples: "Review AI-generated STAR story", "Follow up with Company X",
 * "Complete fit analysis for Senior Engineer @ Acme".
 */

type TriageAction = {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  type: "review_story" | "follow_up" | "complete_analysis" | "general"
  href: string
}

const priorityStyles = {
  high: "destructive",
  medium: "outline",
  low: "secondary",
} as const

const typeLabels: Record<TriageAction["type"], string> = {
  review_story: "Review",
  follow_up: "Follow Up",
  complete_analysis: "Analysis",
  general: "Action",
}

export function TriageCard({ action }: { action: TriageAction }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{action.title}</CardTitle>
        <CardAction>
          <Badge variant={priorityStyles[action.priority]}>
            {action.priority}
          </Badge>
        </CardAction>
        <CardDescription className="text-xs">
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge variant="outline" className="text-[0.65rem]">
          {typeLabels[action.type]}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={action.href} />}
        >
          View
          <ArrowRightIcon className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

export type { TriageAction }

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
