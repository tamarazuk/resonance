import type { CompanyResearch } from "@resonance/types";

interface CompanyBriefProps {
  research: CompanyResearch;
}

export function CompanyBrief({ research }: CompanyBriefProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
      <h3 className="mb-6 text-base font-semibold text-foreground">
        Company Brief
      </h3>
      <div className="space-y-5">
        <InfoRow label="Overview" value={research.overview} />
        <InfoRow label="Culture" value={research.culture} />
        <InfoRow label="Industry" value={research.industry} />
        <InfoRow label="Company Size" value={research.size} />
        <InfoRow label="Recent News" value={research.recentNews} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-light leading-relaxed text-foreground">
        {value}
      </p>
    </div>
  );
}
