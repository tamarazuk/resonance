"use client";

import { useState, type ReactNode } from "react";
import type { Application } from "@resonance/types";

const tabs = [
  { id: "jd", label: "Job Description" },
  { id: "fit", label: "Fit Analysis" },
  { id: "materials", label: "Materials" },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface ApplicationTabsProps {
  application: Application;
  parsedJDContent: ReactNode;
  fitAnalysisContent: ReactNode;
  materialsContent: ReactNode;
}

export function ApplicationTabs({
  application,
  parsedJDContent,
  fitAnalysisContent,
  materialsContent,
}: ApplicationTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("fit");

  return (
    <div className="space-y-8">
      {/* Tab bar */}
      <div className="border-b border-border px-2">
        <nav
          aria-label="Tabs"
          className="-mb-px flex space-x-8 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-2 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "jd" && (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
          {parsedJDContent}
        </div>
      )}

      {activeTab === "fit" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">{fitAnalysisContent}</div>
          <div className="space-y-8">
            {/* Suggested Actions sidebar */}
            <SuggestedActions application={application} />
          </div>
        </div>
      )}

      {activeTab === "materials" && materialsContent}
    </div>
  );
}

// ─── Sidebar cards (Fit Analysis tab) ────────────────────────────────────────

function SuggestedActions({ application }: { application: Application }) {
  const hasGaps =
    application.fitAnalysis?.missingSkills &&
    application.fitAnalysis.missingSkills.length > 0;
  const recommendations = application.fitAnalysis?.recommendations ?? [];

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
        <h3 className="mb-4 text-base font-semibold text-foreground md:mb-6">
          Suggested Actions
        </h3>
        <ul className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 4).map((rec, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <ActionIcon index={i} className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-light text-muted-foreground">
                  {rec}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm font-light text-muted-foreground">
              No recommendations yet.
            </li>
          )}
        </ul>
      </div>

      {hasGaps && (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
          <h3 className="mb-4 text-base font-semibold text-foreground md:mb-6">
            Skills to Develop
          </h3>
          <div className="flex flex-wrap gap-2">
            {application.fitAnalysis!.missingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ActionIcon({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  // Rotate through a few relevant icons
  const icons = [
    // edit_document
    <svg
      key="edit"
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
    </svg>,
    // mail
    <svg
      key="mail"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>,
    // lightbulb
    <svg
      key="bulb"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>,
    // target
    <svg
      key="target"
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
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>,
  ];
  return icons[index % icons.length];
}
