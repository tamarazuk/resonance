import type { CalmModeData } from "@resonance/types";

interface CalmModeProps {
  data: CalmModeData;
}

export function CalmMode({ data }: CalmModeProps) {
  return (
    <div className="mx-auto max-w-xl space-y-10 py-6">
      {/* Grounding prompt */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center md:p-10">
        <p className="text-lg font-light leading-relaxed text-foreground md:text-xl">
          {data.groundingPrompt}
        </p>
      </div>

      {/* 3 Key Points */}
      <div className="space-y-4">
        <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Remember These Three Things
        </h3>
        <div className="space-y-3">
          {data.keyPoints.map((point, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <p className="text-base font-medium text-foreground">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Opening Story */}
      <div className="space-y-3">
        <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Opening Story
        </h3>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-sm font-semibold text-primary">
            {data.openingStory.title}
          </p>
          <p className="text-sm font-light leading-relaxed text-foreground">
            {data.openingStory.preview}
          </p>
        </div>
      </div>
    </div>
  );
}
