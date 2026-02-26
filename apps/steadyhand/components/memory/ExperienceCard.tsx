import type { Experience } from "@resonance/types";

/**
 * Memory Bank experience card — displayed in the sidebar.
 *
 * Richer layout matching Stitch design: status indicator, STAR fields
 * with left-border accent, category metadata, hover-reveal edit/delete buttons.
 */
export function ExperienceCard({
  experience,
  onEdit,
  onDelete,
}: {
  experience: Experience;
  onEdit?: (experience: Experience) => void;
  onDelete?: (experience: Experience) => void;
}) {
  const star = experience.starStructure;
  const hasAllStarFields =
    star?.situation && star?.task && star?.action && star?.result;

  return (
    <div className="group cursor-pointer border-b border-primary/20 py-6">
      {/* Status + metadata row */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {hasAllStarFields ? (
            <>
              <CheckIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Verified
              </span>
            </>
          ) : (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Drafting
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Edit experience"
            className="text-muted-foreground/30 opacity-0 transition-all hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            onClick={() => onEdit?.(experience)}
          >
            <EditIcon className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Delete experience"
            className="text-muted-foreground/30 opacity-0 transition-all hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            onClick={() => onDelete?.(experience)}
          >
            <TrashIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-medium text-foreground transition-colors group-hover:text-primary">
        {experience.rawInput}
      </h3>

      {/* Description — show if star structure is incomplete */}
      {!hasAllStarFields && star && (
        <p className="mb-4 text-sm font-light leading-relaxed text-muted-foreground">
          Refining the STAR format for this experience.
        </p>
      )}

      {/* STAR fields with left border accent */}
      {star && (
        <div className="space-y-3 border-l border-primary/20 pl-3">
          {star.situation && (
            <StarField label="Situation" value={star.situation} />
          )}
          {star.task && (
            <StarField
              label="Task"
              value={star.task}
              highlight={!hasAllStarFields}
            />
          )}
          {star.action && <StarField label="Action" value={star.action} />}
          {star.result && (
            <StarField label="Result" value={star.result} highlight />
          )}
        </div>
      )}

      {/* Skill badges */}
      {experience.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {experience.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-sm bg-card/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StarField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-[10px] font-medium uppercase tracking-wider ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <p className="line-clamp-2 text-sm font-light text-foreground/70">
        {value}
      </p>
    </div>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────────

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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
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
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
