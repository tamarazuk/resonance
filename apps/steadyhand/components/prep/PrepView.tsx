"use client";

import { useState } from "react";
import type { PrepPacket } from "@resonance/types";
import { CompanyBrief } from "./CompanyBrief";
import { PredictedQuestions } from "./PredictedQuestions";
import { TalkingPoints } from "./TalkingPoints";
import { CalmMode } from "./CalmMode";

interface PrepViewProps {
  packet: PrepPacket;
}

export function PrepView({ packet }: PrepViewProps) {
  const [calmMode, setCalmMode] = useState(false);

  if (calmMode && packet.calmModeData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Calm Mode
          </h2>
          <button
            type="button"
            onClick={() => setCalmMode(false)}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Exit Calm Mode
          </button>
        </div>
        <CalmMode data={packet.calmModeData} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Interview Prep
        </h2>
        {packet.calmModeData && (
          <button
            type="button"
            onClick={() => setCalmMode(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
          >
            <CalmModeIcon className="h-4 w-4 text-primary" />
            Enter Calm Mode
          </button>
        )}
      </div>

      {packet.companyResearch && (
        <CompanyBrief research={packet.companyResearch} />
      )}

      {packet.predictedQuestions && packet.predictedQuestions.length > 0 && (
        <PredictedQuestions questions={packet.predictedQuestions} />
      )}

      {packet.talkingPoints && packet.talkingPoints.length > 0 && (
        <TalkingPoints points={packet.talkingPoints} />
      )}
    </div>
  );
}

function CalmModeIcon({ className }: { className?: string }) {
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}
