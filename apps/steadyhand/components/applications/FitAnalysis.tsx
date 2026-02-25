import type { FitAnalysis as FitAnalysisType } from "@resonance/types";

/**
 * Displays the fit analysis results: large donut score ring, sub-score
 * progress bars, keyword analysis with found/missing badges, and
 * strengths/gaps sections.
 */
export function FitAnalysis({ data }: { data: FitAnalysisType }) {
  const fitLabel =
    data.overallScore >= 80
      ? "Strong Fit"
      : data.overallScore >= 60
        ? "Good Fit"
        : data.overallScore >= 40
          ? "Moderate Fit"
          : "Weak Fit";

  return (
    <div className="space-y-8">
      {/* Overall Match card */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <h3 className="mb-6 text-lg font-semibold text-foreground">
          Overall Match
        </h3>
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start">
          {/* Donut ring */}
          <div className="relative flex size-48 shrink-0 items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                className="text-primary"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${data.overallScore}, 100`}
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-light tracking-tighter text-foreground">
                {data.overallScore}%
              </span>
              <span className="mt-1 text-xs font-medium uppercase tracking-widest text-primary">
                {fitLabel}
              </span>
            </div>
          </div>

          {/* Description + sub-scores */}
          <div className="flex-1 space-y-6">
            {/* Summary text from strengths */}
            {data.strengths.length > 0 && (
              <p className="text-base font-light leading-relaxed text-muted-foreground">
                {data.strengths[0]}
              </p>
            )}

            {/* Sub-score bars */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SubScore
                label="Skills"
                value={
                  data.matchingSkills.length > 0
                    ? Math.min(
                        Math.round(
                          (data.matchingSkills.length /
                            (data.matchingSkills.length +
                              data.missingSkills.length)) *
                            100,
                        ),
                        100,
                      )
                    : 0
                }
              />
              <SubScore
                label="Experience"
                value={Math.min(data.overallScore + 5, 100)}
              />
              <SubScore
                label="Strengths"
                value={
                  data.strengths.length > 0
                    ? Math.min(data.overallScore + 10, 100)
                    : 0
                }
              />
              <SubScore
                label="Gaps"
                value={
                  data.gaps.length === 0
                    ? 100
                    : Math.max(100 - data.gaps.length * 15, 20)
                }
                display={
                  data.gaps.length === 0 ? "None" : `${data.gaps.length} found`
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Analysis card */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Keyword Analysis
          </h3>
        </div>
        <div className="space-y-6">
          {/* Found keywords */}
          {data.matchingSkills.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Found in Resume
              </p>
              <div className="flex flex-wrap gap-2.5">
                {data.matchingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    <CheckSmallIcon className="mr-1.5 h-3.5 w-3.5" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {data.missingSkills.length > 0 && (
            <div className="border-t border-border pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-2.5">
                {data.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400"
                  >
                    <CloseSmallIcon className="mr-1.5 h-3.5 w-3.5" />
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-light italic text-muted-foreground">
                Tip: Try adding these keywords to your resume summary or work
                experience.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Strengths & Gaps (if multiple) */}
      {data.strengths.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.slice(1).map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm font-light text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.gaps.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gaps
          </h3>
          <ul className="space-y-2">
            {data.gaps.map((g, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm font-light text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SubScore({
  label,
  value,
  display,
}: {
  label: string;
  value: number;
  display?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-semibold text-primary">
          {display ?? `${value}%`}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-border">
        <div
          className="h-1 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function CheckSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
