import type { Experience } from "@resonance/types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@resonance/ui/components/card"
import { Badge } from "@resonance/ui/components/badge"

/**
 * Compact card showing a STAR summary + skill badges.
 *
 * Used in the Memory Bank sidebar (right column of the chat split-screen).
 * Read-only display — experience creation happens through the chat tool
 * or the ManualEntry dialog.
 */
export function ExperienceCard({
  experience,
}: {
  experience: Experience
}) {
  const star = experience.starStructure

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-sm">
          {experience.rawInput}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {star && (
          <dl className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <StarField label="S" value={star.situation} />
            <StarField label="T" value={star.task} />
            <StarField label="A" value={star.action} />
            <StarField label="R" value={star.result} />
          </dl>
        )}

        {experience.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {experience.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[0.65rem]">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StarField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-semibold text-foreground">{label}:</dt>
      <dd className="line-clamp-2">{value}</dd>
    </div>
  )
}
