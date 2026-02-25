"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/applications", label: "Applications", matchPrefix: true },
  { href: "/dashboard/chat", label: "Career Coach" },
] as const;

export function TopNav({ userInitial }: { userInitial: string }) {
  const pathname = usePathname();

  function isActive(link: (typeof navLinks)[number]) {
    if ("matchPrefix" in link && link.matchPrefix) {
      return pathname.startsWith(link.href);
    }
    return pathname === link.href;
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/90 px-6 py-3 backdrop-blur-md lg:px-10">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <SteadyhandIcon className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Steadyhand
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative flex w-full min-w-[280px] items-center">
            <span className="absolute left-3 flex items-center text-muted-foreground">
              <SearchIcon className="size-4" />
            </span>
            <input
              className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Right: Nav + CTA + Avatar */}
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link)
                  ? "text-sm font-semibold text-primary"
                  : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/applications/new"
            className="hidden sm:flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            <PlusIcon className="mr-1.5 size-4" />
            New Application
          </Link>

          <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground ring-2 ring-card">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────────

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

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M12 5v14" />
    </svg>
  );
}
