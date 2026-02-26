import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-light">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center text-primary">
              <SteadyhandIcon className="size-7" />
            </div>
            <span className="text-xl font-medium tracking-tight text-foreground">
              Steadyhand
            </span>
          </div>

          <nav className="hidden items-center gap-10 md:flex">
            <a
              className="text-sm font-normal text-muted-foreground transition-colors hover:text-primary"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-normal text-muted-foreground transition-colors hover:text-primary"
              href="#why"
            >
              Why Steadyhand
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden h-10 items-center justify-center px-4 text-sm font-normal text-foreground transition-colors hover:text-primary sm:flex"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-none transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

          {/* Hero image — faint watermark on small screens, full on md+ */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-[0.08] md:w-1/2 md:opacity-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-stones-transparent.png"
              alt=""
              className="absolute bottom-0 right-0 h-[85%] w-auto max-w-none object-contain object-right-bottom"
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex max-w-xl flex-col">
              <p className="mb-8 text-sm font-light italic text-primary/70">
                for when the job search gets heavy
              </p>

              <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                You shouldn&apos;t have to{" "}
                <span className="font-normal italic text-primary">
                  burn out
                </span>{" "}
                before the interview starts.
              </h1>

              <p className="mt-2 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
                Job searching demands your best thinking at your worst moments.
                Steadyhand takes the overhead off your plate — the research, the
                prep, the follow-ups — so you have brainpower left when it
                counts.
              </p>

              <div className="mt-12 flex flex-col gap-5 sm:flex-row">
                <Link
                  href="/signup"
                  className="flex h-12 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-none transition-all hover:opacity-90"
                >
                  Get Started Free
                </Link>
                <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-transparent px-8 font-medium text-foreground transition-all hover:border-primary hover:text-primary">
                  <PlayIcon className="size-5" />
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="border-y border-border bg-card py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  Less noise. More clarity.
                </h2>
                <p className="mt-4 text-lg font-light text-muted-foreground">
                  Every feature exists to take something off your mind, not add
                  to your to-do list.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-none transition-all hover:border-primary/30"
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 text-primary">
                      <feature.icon className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Steadyhand */}
        <section id="why" className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                    Built for how job searching actually feels.
                  </h2>
                  <p className="text-lg font-light text-muted-foreground">
                    Most tools add tasks to your plate and call it organization.
                    Steadyhand is different — it handles the cognitive overhead
                    so you can show up as your best self when it matters.
                  </p>
                </div>

                <div className="space-y-8">
                  {whyItems.map((item) => (
                    <div key={item.title} className="flex gap-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 font-light text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="mt-4 inline-flex items-center text-sm font-medium tracking-wide text-primary transition-colors hover:opacity-80"
                >
                  Start your search with a clear head →
                </Link>
              </div>

              {/* Right side placeholder */}
              <div className="relative min-h-[500px] overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                <div className="flex size-full items-center justify-center text-muted-foreground/30">
                  <NotebookPlaceholderIcon className="size-32" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card pb-12 pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-6 items-center justify-center text-primary">
                  <SteadyhandIcon className="size-5" />
                </div>
                <span className="text-base font-medium text-foreground">
                  Steadyhand
                </span>
              </div>
              <p className="mb-6 text-sm font-light text-muted-foreground">
                A steady hand when yours is shaking.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-foreground">
                Product
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#features"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-foreground">
                Resources
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-foreground">
                Company
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Legal
                  </a>
                </li>
                <li>
                  <a
                    className="text-sm font-light text-muted-foreground hover:text-primary"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm font-light text-muted-foreground">
              &copy; {new Date().getFullYear()} Steadyhand. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a
                className="text-sm font-light text-muted-foreground hover:text-foreground"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-sm font-light text-muted-foreground hover:text-foreground"
                href="#"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    title: "Memory Bank",
    description:
      "Your professional experiences, organized and searchable. Tell Steadyhand about a project you led or a conflict you resolved — it structures, tags, and stores it so you never blank on a story again.",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Triage Engine",
    description:
      "Not every posting deserves a tailored cover letter. Steadyhand analyzes each opportunity for fit, effort, and timing — so you spend energy where it actually matters.",
    icon: SparklesIcon,
  },
  {
    title: "Fit Analysis",
    description:
      "Paste a job posting and get an honest read: how well you match, what your strategic angle is, what the red flags are, and whether it's worth your time.",
    icon: TargetIcon,
  },
  {
    title: "Resume Tailoring",
    description:
      "Resumes generated from your real experiences, not templates. Steadyhand pulls from your Memory Bank to emphasize the stories that matter for each specific role.",
    icon: FileTextIcon,
  },
  {
    title: "Cover Letters",
    description:
      "Drafted in your voice, grounded in your actual experience, and connected to what the company cares about. Review, edit, and send — nothing goes out without your approval.",
    icon: PenToolIcon,
  },
  {
    title: "Calm Mode",
    description:
      "The 30 minutes before an interview is when anxiety peaks and memory fails. Calm Mode strips everything down to three key points, one opening story, and a clear head.",
    icon: SpaIcon,
  },
];

const whyItems = [
  {
    title: "Your career, remembered",
    description:
      "Every experience, project, and story you share gets structured and stored. When an interview asks about handling ambiguity, your best stories are already waiting.",
    icon: CheckCircleIcon,
  },
  {
    title: "Prep without the panic",
    description:
      "Before every interview, Steadyhand builds you a briefing: company research, likely questions matched to your stories, and talking points. You walk in prepared, not overwhelmed.",
    icon: SparklesIcon,
  },
  {
    title: "AI handles the overhead. You handle the moments.",
    description:
      "Research, drafts, follow-ups, deadlines — that's AI's job. The interview, the career decision, the gut feeling about culture fit — that's yours. The line is bright and non-negotiable.",
    icon: SpaIcon,
  },
];

// ─── Icons (inline SVG, Lucide-style) ─────────────────────────────────────────

function SteadyhandIcon({ className }: { className?: string }) {
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
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
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
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
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
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
      strokeWidth={1.5}
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

function PenToolIcon({ className }: { className?: string }) {
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
      <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
      <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
      <path d="m2.3 2.3 7.286 7.286" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function SpaIcon({ className }: { className?: string }) {
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
      <path d="M12 22c-4.97 0-9-2.686-9-6s4.03-6 9-6 9 2.686 9 6-4.03 6-9 6Z" />
      <path d="M12 10c-3.314 0-6-2.35-6-5.25A5.23 5.23 0 0 1 12 2a5.23 5.23 0 0 1 6 2.75C18 7.65 15.314 10 12 10Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function NotebookPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
      <path d="M9 14h4" />
    </svg>
  );
}
