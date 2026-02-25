import type { FitAnalysis as FitAnalysisType } from "@resonance/types"
import { Badge } from "@resonance/ui/components/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@resonance/ui/components/card"

/**
 * Displays the fit analysis results: overall score, matching/missing skills,
 * strengths, gaps, and recommendations.
 */
export function FitAnalysis({ data }: { data: FitAnalysisType }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score */}
      <div className="flex items-center gap-4">
        <ScoreRing score={data.overallScore} />
        <div>
          <p className="text-lg font-semibold">
            {data.overallScore}% Match
          </p>
          <p className="text-sm text-muted-foreground">
            Overall fit score based on your experiences
          </p>
        </div>
      </div>

      {/* Skills comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm text-green-600 dark:text-green-400">
              Matching Skills ({data.matchingSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.matchingSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {data.matchingSkills.length === 0 && (
                <p className="text-xs text-muted-foreground">None identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm text-amber-600 dark:text-amber-400">
              Missing Skills ({data.missingSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
              {data.missingSkills.length === 0 && (
                <p className="text-xs text-muted-foreground">None identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Gaps */}
      {data.strengths.length > 0 && (
        <Section title="Strengths">
          <BulletList items={data.strengths} />
        </Section>
      )}

      {data.gaps.length > 0 && (
        <Section title="Gaps">
          <BulletList items={data.gaps} />
        </Section>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Section title="Recommendations">
          <BulletList items={data.recommendations} />
        </Section>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70
      ? "text-green-500"
      : score >= 40
        ? "text-amber-500"
        : "text-red-500"

  return (
    <div className="relative h-14 w-14">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          strokeWidth="3"
          className="stroke-muted"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-[stroke-dashoffset] duration-500`}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {score}
      </span>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
