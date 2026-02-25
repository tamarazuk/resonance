"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@resonance/ui/components/button";
import { Input } from "@resonance/ui/components/input";
import { Textarea } from "@resonance/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@resonance/ui/components/dialog";

/**
 * New Application — URL input + Manual Entry fallback
 *
 * Zen Minimalist restyle: centered layout with back link, heading,
 * card container, sage-green submit, and security footer.
 */
export default function NewApplicationPage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [manualJD, setManualJD] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalUrl: url }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create application");
      return;
    }

    const application = await res.json();
    router.push(`/dashboard/applications/${application.id}`);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualJD: manualJD.trim() }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create application");
      return;
    }

    const application = await res.json();
    setDialogOpen(false);
    setManualJD("");
    router.push(`/dashboard/applications/${application.id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10 sm:px-12">
      <div className="w-full max-w-2xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-light tracking-tight text-foreground">
            Start Your Application
          </h1>
          <p className="mx-auto max-w-xl text-base font-light text-muted-foreground">
            Paste a job posting URL and we&apos;ll scrape the listing, parse the
            job description, and analyze your fit.
          </p>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
          {/* Decorative header bar */}
          <div className="flex h-28 items-end bg-gradient-to-br from-primary/20 via-secondary to-primary/10 p-6">
            <div>
              <span className="mb-1.5 inline-block rounded bg-primary/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-foreground backdrop-blur-sm">
                New Entry
              </span>
              <h2 className="text-lg font-medium text-foreground">
                Job Posting
              </h2>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 md:p-10">
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-8">
              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* URL section */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-primary">
                    <LinkIcon className="size-4" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Job Posting URL
                  </h3>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    URL
                  </span>
                  <Input
                    type="url"
                    placeholder="https://example.com/jobs/software-engineer"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="font-light"
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md sm:flex-1"
                >
                  {loading ? (
                    "Scraping..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Analyze
                      <ArrowRightIcon className="size-4" />
                    </span>
                  )}
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="px-6 py-3 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
                      />
                    }
                  >
                    Enter Manually
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleManualSubmit}>
                      <DialogHeader>
                        <DialogTitle>Enter Job Description</DialogTitle>
                        <DialogDescription>
                          Paste or type the job description directly.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        {error && (
                          <p className="mb-3 text-sm text-destructive">
                            {error}
                          </p>
                        )}
                        <Textarea
                          placeholder="Paste the job description here..."
                          value={manualJD}
                          onChange={(e) => setManualJD(e.target.value)}
                          rows={12}
                          required
                          className="font-light"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Processing..." : "Submit"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </div>
        </div>

        {/* Security footer */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LockIcon className="size-3.5" />
            <span>Your data is encrypted and secure.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────────

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
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
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
