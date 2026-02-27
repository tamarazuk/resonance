"use client";

import { useCallback, useEffect, useState } from "react";
import type { Experience } from "@resonance/types";
import { toast } from "sonner";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ExperienceCard } from "@/components/memory/ExperienceCard";
import { ExperienceForm } from "@/components/memory/ExperienceForm";
import { ResumeUpload } from "@/components/memory/ResumeUpload";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@resonance/ui/components/alert-dialog";
import { Button } from "@resonance/ui/components/button";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state";

/**
 * Career Coach — Chat-First Interface
 *
 * Split-screen layout:
 * - Left column (60%): Active chat with the AI career coach
 * - Right column (40%): Context/Memory Bank sidebar showing saved experiences
 */
export default function ChatPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // Edit/delete state
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null,
  );
  const [deletingExperience, setDeletingExperience] =
    useState<Experience | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExperiences = useCallback(async () => {
    try {
      const res = await fetch("/api/experiences");
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch {
      // Silently fail — sidebar is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  function handleExperienceSaved(
    experience: Experience,
    meta?: {
      mode: "create" | "update";
      optimistic?: boolean;
      tempId?: string;
    },
  ) {
    if (meta?.mode === "create" && meta.optimistic) {
      setExperiences((prev) => [experience, ...prev]);
      return;
    }

    if (meta?.mode === "create" && meta.tempId) {
      setExperiences((prev) => {
        const index = prev.findIndex((item) => item.id === meta.tempId);
        if (index === -1) {
          return [experience, ...prev];
        }
        const next = [...prev];
        next[index] = experience;
        return next;
      });
      return;
    }

    if (meta?.mode === "update") {
      setExperiences((prev) =>
        prev.map((item) => (item.id === experience.id ? experience : item)),
      );
    }
  }

  function handleExperienceSaveError(meta: {
    mode: "create" | "update";
    tempId?: string;
  }) {
    if (meta.mode !== "create" || !meta.tempId) return;

    setExperiences((prev) => prev.filter((item) => item.id !== meta.tempId));
  }

  async function handleDelete() {
    if (!deletingExperience) return;
    const experienceToDelete = deletingExperience;
    const previousIndex = experiences.findIndex(
      (item) => item.id === experienceToDelete.id,
    );

    setExperiences((prev) =>
      prev.filter((item) => item.id !== experienceToDelete.id),
    );
    setDeletingExperience(null);
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/experiences/${experienceToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Experience deleted");
      } else {
        setExperiences((prev) => {
          if (prev.some((item) => item.id === experienceToDelete.id)) {
            return prev;
          }
          const next = [...prev];
          const insertIndex =
            previousIndex < 0
              ? prev.length
              : Math.min(previousIndex, prev.length);
          next.splice(insertIndex, 0, experienceToDelete);
          return next;
        });
        toast.error("Failed to delete experience. Please try again.");
      }
    } catch {
      setExperiences((prev) => {
        if (prev.some((item) => item.id === experienceToDelete.id)) {
          return prev;
        }
        const next = [...prev];
        const insertIndex =
          previousIndex < 0
            ? prev.length
            : Math.min(previousIndex, prev.length);
        next.splice(insertIndex, 0, experienceToDelete);
        return next;
      });
      toast.error("Network error — please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Filter tabs — "All" plus unique categories extracted from experiences
  const filterTabs = ["All", "Leadership", "Technical", "Conflict"];

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left column — Chat interface (60%) */}
      <div className="flex w-full flex-col border-b border-border bg-card lg:w-3/5 lg:border-b-0 lg:border-r">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-card/90 px-8 py-5 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-medium text-foreground">
              Coaching Session
            </h1>
            <p className="mt-0.5 text-sm font-light text-muted-foreground">
              Leadership &amp; STAR Method
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Active
            </span>
            <button className="rounded p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground">
              <MoreHorizIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat window */}
        <ChatWindow onExperienceSaved={fetchExperiences} />
      </div>

      {/* Right column — Memory Bank sidebar (40%) */}
      <div className="flex w-full flex-col bg-secondary lg:w-2/5">
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Memory Bank
          </h2>
          <div className="flex items-center gap-3">
            <ResumeUpload onUploaded={fetchExperiences} />
            <ExperienceForm
              onSaved={handleExperienceSaved}
              onSaveError={handleExperienceSaveError}
              trigger={
                <button className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  <PlusIcon className="h-4.5 w-4.5" />
                  New Entry
                </button>
              }
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-4 border-b border-primary/20 px-8">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`whitespace-nowrap border-b-2 pb-2 text-xs font-medium transition-colors ${
                activeFilter === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Experience cards */}
        <div className="flex flex-1 flex-col overflow-y-auto px-8 pb-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState>
                <EmptyStateIcon>
                  <BrainIcon className="h-10 w-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>No experiences yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Experiences you share in the chat will appear here as
                  structured STAR stories.
                </EmptyStateDescription>
              </EmptyState>
            </div>
          ) : (
            experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onEdit={setEditingExperience}
                onDelete={setDeletingExperience}
              />
            ))
          )}
        </div>

        {/* Tip card */}
        <div className="px-8 pb-6">
          <div className="flex items-start gap-3 rounded-sm border border-primary/20 bg-card/50 p-4">
            <LightbulbIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
            <div>
              <p className="mb-1 text-xs font-medium text-foreground">
                Quantify Results
              </p>
              <p className="text-xs font-light leading-relaxed text-muted-foreground">
                Use specific numbers and percentages to increase impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit experience dialog (controlled) */}
      {editingExperience && (
        <ExperienceForm
          experience={editingExperience}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingExperience(null);
          }}
          onSaved={(experience, meta) => {
            handleExperienceSaved(experience, meta);
            setEditingExperience(null);
          }}
          onSaveError={handleExperienceSaveError}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deletingExperience}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingExperience(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this experience from your Memory
              Bank. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
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
  );
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
  );
}

function MoreHorizIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
