"use client";

import { useState } from "react";
import type { PredictedQuestion } from "@resonance/types";

interface PredictedQuestionsProps {
  questions: PredictedQuestion[];
}

const categoryColors: Record<string, string> = {
  behavioral:
    "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
  technical:
    "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-400",
  situational:
    "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
  culture_fit:
    "border-green-200 bg-green-50 text-green-600 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400",
  role_specific:
    "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
};

export function PredictedQuestions({ questions }: PredictedQuestionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-8">
      <h3 className="mb-6 text-base font-semibold text-foreground">
        Predicted Questions
      </h3>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {q.question}
                </p>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                    categoryColors[q.category] ??
                    "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-400/20 dark:bg-gray-400/10 dark:text-gray-400"
                  }`}
                >
                  {q.category.replaceAll("_", " ")}
                </span>
              </div>
              <ChevronIcon
                className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  expandedIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedIndex === i && q.suggestedStoryPreview && (
              <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Suggested Story
                </p>
                <p className="text-sm font-light text-foreground">
                  {q.suggestedStoryPreview}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
