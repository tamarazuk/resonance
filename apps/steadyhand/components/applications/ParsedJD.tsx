import type { ParsedJD as ParsedJDType } from "@resonance/types";

/**
 * Renders a parsed job description in a structured, readable format.
 *
 * Displays the extracted title, company, location, requirements,
 * responsibilities, skills, benefits, and salary from the AI parser.
 */
export function ParsedJD({ data }: { data: ParsedJDType }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
          {data.title}
        </h3>
        <p className="text-sm font-light text-muted-foreground">
          {data.company}
          {data.location && ` \u00b7 ${data.location}`}
        </p>
        {data.salary && (
          <p className="text-sm font-medium text-primary">{data.salary}</p>
        )}
      </div>

      {/* Skills */}
      {data.skills.length > 0 && (
        <Section title="Required Skills">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
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
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm font-light leading-relaxed text-foreground"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
          {item}
        </li>
      ))}
    </ul>
  );
}
