"use client"

import { useCallback, useEffect, useState } from "react"
import type { Experience } from "@resonance/types"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { ExperienceCard } from "@/components/memory/ExperienceCard"
import { ExperienceForm } from "@/components/memory/ExperienceForm"
import { Button } from "@resonance/ui/components/button"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state"

/**
 * Career Coach — Chat-First Interface
 *
 * Split-screen layout:
 * - Left column (60%): Active chat with the AI career coach
 * - Right column (40%): Context/Memory Bank sidebar showing saved experiences
 */
export default function ChatPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExperiences = useCallback(async () => {
    try {
      const res = await fetch("/api/experiences")
      if (res.ok) {
        const data = await res.json()
        setExperiences(data)
      }
    } catch {
      // Silently fail — sidebar is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  return (
    <div className="flex h-full">
      {/* Left column — Chat interface (60%) */}
      <div className="flex w-3/5 flex-col border-r border-border">
        {/* Chat header */}
        <div className="flex h-14 items-center border-b border-border px-6">
          <h1 className="text-lg font-semibold">Career Coach</h1>
        </div>

        {/* Chat window */}
        <ChatWindow onExperienceSaved={fetchExperiences} />
      </div>

      {/* Right column — Memory Bank sidebar (40%) */}
      <div className="flex w-2/5 flex-col">
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Memory Bank</h2>
            <span className="text-xs text-muted-foreground">
              {experiences.length} experience{experiences.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ExperienceForm
            onSaved={fetchExperiences}
            trigger={
              <Button variant="ghost" size="sm">
                <PlusIcon className="mr-1 h-3.5 w-3.5" />
                Manual Entry
              </Button>
            }
          />
        </div>

        {/* Experience cards */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : experiences.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <BrainIcon className="h-10 w-10" />
              </EmptyStateIcon>
              <EmptyStateTitle>No experiences yet</EmptyStateTitle>
              <EmptyStateDescription>
                Experiences you share in the chat will appear here as structured
                STAR stories.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inline icons ────────────────────────────────────────────────────────────

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
  )
}

function BrainIcon({ className }: { className?: string }) {
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
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  )
}
