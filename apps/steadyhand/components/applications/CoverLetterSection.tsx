"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@resonance/types";
import { CoverLetter } from "@/components/applications/CoverLetter";
import { StreamingCoverLetter } from "@/components/applications/StreamingCoverLetter";
import { Button } from "@resonance/ui/components/button";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state";

interface CoverLetterSectionProps {
  application: Application;
}

export function CoverLetterSection({ application }: CoverLetterSectionProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedParagraphs, setGeneratedParagraphs] = useState<
    string[] | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasFitAnalysis = !!application.fitAnalysis;
  const existingParagraphs =
    application.draftedMaterials?.coverLetterParagraphs;

  const displayParagraphs = generatedParagraphs ?? existingParagraphs ?? [];
  const hasGenerated = generatedParagraphs !== null;
  const canSave = hasGenerated && !isSaving;

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedParagraphs(null);
    setSaveError(null);
  };

  const handleComplete = (paragraphs: string[]) => {
    setGeneratedParagraphs(paragraphs);
  };

  const handleSave = async () => {
    if (!generatedParagraphs) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/applications/${application.id}/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverLetterParagraphs: generatedParagraphs }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save");
      }

      setGeneratedParagraphs(null);
      setIsGenerating(false);
      setSaveError(null);
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const canGenerate = hasFitAnalysis && !isGenerating;

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Cover Letter
        </h3>
        {canGenerate && (
          <Button onClick={handleGenerate} size="sm">
            Generate Draft
          </Button>
        )}
      </div>

      {isGenerating ? (
        <div className="space-y-4">
          <StreamingCoverLetter
            applicationId={application.id}
            onComplete={handleComplete}
            autoStart
          />
          {canSave && (
            <div className="space-y-2">
              {saveError && (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  {isSaving ? "Saving..." : "Save to Application"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : displayParagraphs.length > 0 ? (
        <div className="space-y-4">
          <CoverLetter paragraphs={displayParagraphs} />
          {canSave && (
            <div className="space-y-2">
              {saveError && (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  {isSaving ? "Saving..." : "Save to Application"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <PenIcon className="h-10 w-10" />
          </EmptyStateIcon>
          <EmptyStateTitle>Not yet drafted</EmptyStateTitle>
          <EmptyStateDescription>
            {hasFitAnalysis
              ? "Click 'Generate Draft' to create your cover letter."
              : "Generate a cover letter after the fit analysis is complete."}
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button disabled={!hasFitAnalysis} onClick={handleGenerate}>
              Generate Draft
            </Button>
          </EmptyStateAction>
        </EmptyState>
      )}
    </div>
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
