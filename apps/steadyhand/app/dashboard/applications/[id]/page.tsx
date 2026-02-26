import type { Metadata } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@resonance/types";
import { ParsedJD } from "@/components/applications/ParsedJD";
import { FitAnalysis } from "@/components/applications/FitAnalysis";
import { CoverLetter } from "@/components/applications/CoverLetter";
import { SelectedBullets } from "@/components/applications/SelectedBullets";
import { ApplicationTabs } from "@/components/applications/ApplicationTabs";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state";
import { Button } from "@resonance/ui/components/button";

const getApplication = cache(
  async (id: string): Promise<Application | null> => {
    try {
      const cookieStore = await cookies();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications/${id}`,
        {
          headers: { cookie: cookieStore.toString() },
          cache: "no-store",
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
);

const statusLabels: Record<ApplicationStatus, string> = {
  draft: "Draft",
  ready_to_apply: "Ready to Apply",
  applied: "Applied",
  phone_screen: "Phone Screen",
  technical_interview: "Technical Interview",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    return { title: "Application Detail" };
  }

  const role = application.parsedJD?.title;
  const company = application.parsedJD?.company;

  if (!role) {
    return { title: "Application Detail" };
  }

  return {
    title: company ? `${role} at ${company}` : role,
  };
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const title = application.parsedJD?.title ?? "Application Detail";
  const company = application.parsedJD?.company;
  const location = application.parsedJD?.location;

  return (
    <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1024px] space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary"
          >
            Applications
          </Link>
          <ChevronRightIcon className="mx-2 h-3.5 w-3.5 text-border" />
          <span className="font-medium text-foreground">
            {title}
            {company ? ` at ${company}` : ""}
          </span>
        </nav>

        {/* Header card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex items-start gap-6">
              {/* Company logo placeholder */}
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
                <BusinessIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-light text-muted-foreground">
                  {company && (
                    <span className="flex items-center gap-1.5">
                      <BusinessIcon className="h-4.5 w-4.5" />
                      {company}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-4.5 w-4.5" />
                    {formatDate(application.createdAt)}
                  </span>
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <LocationIcon className="h-4.5 w-4.5" />
                      {location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill
                status={application.status}
                label={statusLabels[application.status]}
              />
              <button className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted">
                <EditIcon className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Tabs + content */}
        <ApplicationTabs
          application={application}
          parsedJDContent={
            application.parsedJD ? (
              <ParsedJD data={application.parsedJD} />
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <FileTextIcon className="h-10 w-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>Not yet parsed</EmptyStateTitle>
                <EmptyStateDescription>
                  The job description will appear here once the scraper
                  processes the posting URL.
                </EmptyStateDescription>
              </EmptyState>
            )
          }
          fitAnalysisContent={
            application.fitAnalysis ? (
              <FitAnalysis data={application.fitAnalysis} />
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <BarChartIcon className="h-10 w-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>Analysis pending</EmptyStateTitle>
                <EmptyStateDescription>
                  The fit analysis will run after the job description is parsed
                  and compared against your Memory Bank.
                </EmptyStateDescription>
                <EmptyStateAction>
                  <Button variant="outline" disabled>
                    Run Analysis
                  </Button>
                </EmptyStateAction>
              </EmptyState>
            )
          }
          materialsContent={
            <div className="space-y-8">
              {/* Cover Letter */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-base font-semibold text-foreground">
                  Cover Letter
                </h3>
                {application.draftedMaterials?.coverLetterParagraphs?.length ? (
                  <CoverLetter
                    paragraphs={
                      application.draftedMaterials.coverLetterParagraphs
                    }
                  />
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>
                      <PenIcon className="h-10 w-10" />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Not yet drafted</EmptyStateTitle>
                    <EmptyStateDescription>
                      Generate a cover letter after the fit analysis is
                      complete.
                    </EmptyStateDescription>
                    <EmptyStateAction>
                      <Button disabled>Generate Draft</Button>
                    </EmptyStateAction>
                  </EmptyState>
                )}
              </div>

              {/* Tailored Bullets */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-base font-semibold text-foreground">
                  Tailored Bullets
                </h3>
                {application.draftedMaterials?.resumeBullets?.length ? (
                  <SelectedBullets
                    bullets={application.draftedMaterials.resumeBullets}
                  />
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>
                      <ListIcon className="h-10 w-10" />
                    </EmptyStateIcon>
                    <EmptyStateTitle>No bullets generated</EmptyStateTitle>
                    <EmptyStateDescription>
                      Tailored resume bullets will be generated from your
                      matched experiences.
                    </EmptyStateDescription>
                  </EmptyState>
                )}
              </div>
            </div>
          }
        />
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusPill({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  const isActive = !["rejected", "withdrawn"].includes(status);
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
      {label}
    </div>
  );
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Applied today";
  if (diffDays === 1) return "Applied 1 day ago";
  if (diffDays < 30) return `Applied ${diffDays} days ago`;
  return `Applied ${d.toLocaleDateString()}`;
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BusinessIcon({ className }: { className?: string }) {
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
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
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

function FileTextIcon({ className }: { className?: string }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
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
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
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
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
      <path d="M3 6h.01" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M8 6h13" />
    </svg>
  );
}
