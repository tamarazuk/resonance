import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                AI-Powered Career Toolkit
              </div>

              <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Job hunting,{" "}
                <span className="font-normal italic text-primary">
                  simplified by AI
                </span>
                .
              </h1>

              <p className="mt-2 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
                Experience a calmer, more organized approach to your career
                search. We bring tranquility to the chaos of applications.
              </p>

              <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
                <Link
                  href="/signup"
                  className="flex h-12 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-none transition-all hover:opacity-90"
                >
                  Start Free Trial
                </Link>
                <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-transparent px-8 font-medium text-foreground transition-all hover:border-primary hover:text-primary">
                  <PlayIcon className="size-5" />
                  View Demo
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative mt-20 sm:mt-24">
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl">
                <Image
                  src="/hero-stones.png"
                  alt="Zen stones balanced in harmony — representing a calm, steady approach to career growth"
                  width={1920}
                  height={1080}
                  className="h-auto w-full object-cover"
                  priority
                />
                {/* Soft fade at bottom edge */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
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
                  Everything You Need
                </h2>
                <p className="mt-4 text-lg font-light text-muted-foreground">
                  Tools designed to keep your job search organized and
                  stress-free.
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
                    Why Steadyhand?
                  </h2>
                  <p className="text-lg font-light text-muted-foreground">
                    We&rsquo;ve reimagined the job search process to remove
                    anxiety. Focus on your career goals while our AI handles the
                    details.
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
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-primary transition-colors hover:opacity-80"
                >
                  Get started for free
                  <ArrowRightIcon className="size-4" />
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
                Bringing peace to the professional journey.
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
    title: "Smart Tracking",
    description:
      "Paste a job URL and we parse the listing automatically. Track every application status in one clean dashboard.",
    icon: ClipboardCheckIcon,
  },
  {
    title: "AI Career Coach",
    description:
      "Chat with an AI that knows your experience and goals. Get personalized advice, interview prep, and motivation.",
    icon: SparklesIcon,
  },
  {
    title: "Fit Analysis",
    description:
      "Instantly see how well your profile matches each role — keyword gaps, skill alignment, and actionable suggestions.",
    icon: TargetIcon,
  },
  {
    title: "Resume Tailoring",
    description:
      "Generate a tailored resume for every application with one click. Highlight the right skills for each role.",
    icon: FileTextIcon,
  },
  {
    title: "Cover Letters",
    description:
      "AI-crafted cover letters that match your voice and the job requirements. Edit, refine, and export in seconds.",
    icon: PenToolIcon,
  },
  {
    title: "Calm Interface",
    description:
      "Designed with cognitive load in mind. A clean, minimal workspace that reduces job search anxiety.",
    icon: SpaIcon,
  },
];

const whyItems = [
  {
    title: "Smart Tracking",
    description:
      "Automatically organize every application in one dashboard. No more spreadsheet chaos.",
    icon: CheckCircleIcon,
  },
  {
    title: "AI Optimization",
    description:
      "Tailor your resume and cover letter for every role with one click.",
    icon: SparklesIcon,
  },
  {
    title: "Calm Interface",
    description:
      "Designed with cognitive load in mind. Reduce the anxiety of job hunting.",
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
