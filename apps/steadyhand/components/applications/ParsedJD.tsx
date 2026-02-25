import type { ParsedJD as ParsedJDType } from "@resonance/types"
import { Badge } from "@resonance/ui/components/badge"

/**
 * Renders a parsed job description in a structured, readable format.
 *
 * Displays the extracted title, company, location, requirements,
 * responsibilities, skills, benefits, and salary from the AI parser.
 */
export function ParsedJD({ data }: { data: ParsedJDType }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        <p className="text-sm text-muted-foreground">
          {data.company}
          {data.location && ` · ${data.location}`}
        </p>
        {data.salary && (
          <p className="text-sm font-medium text-foreground">{data.salary}</p>
        )}
      </div>

      {/* Skills */}
      {data.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Requirements */}
      {data.requirements.length > 0 && (
        <Section title="Requirements">
          <BulletList items={data.requirements} />
        </Section>
      )}

      {/* Responsibilities */}
      {data.responsibilities.length > 0 && (
        <Section title="Responsibilities">
          <BulletList items={data.responsibilities} />
        </Section>
      )}

      {/* Benefits */}
      {data.benefits.length > 0 && (
        <Section title="Benefits">
          <BulletList items={data.benefits} />
        </Section>
      )}
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
