import type { TalkingPoint } from "@resonance/types";

interface TalkingPointsProps {
  points: TalkingPoint[];
}

export function TalkingPoints({ points }: TalkingPointsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
      <h3 className="mb-6 text-base font-semibold text-foreground">
        Talking Points
      </h3>
      <ul className="space-y-4">
        {points.map((tp, i) => (
          <li key={i} className="flex items-start gap-4">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
              {i + 1}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{tp.point}</p>
              {tp.supportingExperience && (
                <p className="text-xs font-light text-muted-foreground">
                  Backed by: {tp.supportingExperience}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
