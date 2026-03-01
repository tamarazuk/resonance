import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Application, PrepPacket } from "@resonance/types";
import { PrepView } from "@/components/prep/PrepView";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state";

async function getApplication(id: string): Promise<Application | null> {
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
}

async function getPrep(id: string): Promise<PrepPacket | null> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications/${id}/prep`,
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplication(id);

  const company = application?.parsedJD?.company;
  return {
    title: company ? `Prep: ${company}` : "Interview Prep",
  };
}

export default async function PrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, prepPacket] = await Promise.all([
    getApplication(id),
    getPrep(id),
  ]);

  if (!application) {
    notFound();
  }

  const title = application.parsedJD?.title ?? "Application";
  const company = application.parsedJD?.company;

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
          <Link
            href={`/dashboard/applications/${id}`}
            className="transition-colors hover:text-primary"
          >
            {title}
            {company ? ` at ${company}` : ""}
          </Link>
          <ChevronRightIcon className="mx-2 h-3.5 w-3.5 text-border" />
          <span className="font-medium text-foreground">Interview Prep</span>
        </nav>

        {prepPacket ? (
          <PrepView packet={prepPacket} />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8">
            <EmptyState>
              <EmptyStateIcon>
                <PrepIcon className="h-10 w-10" />
              </EmptyStateIcon>
              <EmptyStateTitle>No prep packet yet</EmptyStateTitle>
              <EmptyStateDescription>
                Generate your interview prep packet from the application detail
                page by clicking &quot;Prep for Interview&quot;.
              </EmptyStateDescription>
            </EmptyState>
          </div>
        )}
      </div>
    </main>
  );
}

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
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PrepIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  );
}
