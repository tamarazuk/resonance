import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-16 lg:px-10">
        <div className="w-full rounded-2xl border border-border bg-card p-10 sm:p-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            404
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            This page is not available.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-muted-foreground">
            The link may be outdated, or the page may have moved. You can return
            to the Steadyhand home page or jump straight to your dashboard.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
