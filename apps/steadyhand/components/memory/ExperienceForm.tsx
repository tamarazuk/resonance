"use client";

import { useEffect, useState } from "react";
import type { Experience } from "@resonance/types";
import { Button } from "@resonance/ui/components/button";
import { Input } from "@resonance/ui/components/input";
import { Textarea } from "@resonance/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@resonance/ui/components/dialog";

/**
 * STAR data-entry form — supports both create and edit modes.
 *
 * Create mode: Pass `trigger` to render a dialog trigger button.
 * Edit mode: Pass `experience` + `open`/`onOpenChange` for controlled dialog.
 *
 * On submit, POSTs (create) or PUTs (edit) to the experiences API and calls
 * `onSaved` so the parent can refresh the Memory Bank.
 */
export function ExperienceForm({
  experience,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSaved,
  trigger,
}: {
  experience?: Experience;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
  trigger?: React.ReactElement;
}) {
  const isEditing = !!experience;

  // Support both controlled (edit) and uncontrolled (create) dialog state
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawInput, setRawInput] = useState("");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [skills, setSkills] = useState("");

  // Pre-fill form fields when editing or when experience changes
  useEffect(() => {
    if (experience && open) {
      setRawInput(experience.rawInput);
      setSituation(experience.starStructure?.situation ?? "");
      setTask(experience.starStructure?.task ?? "");
      setAction(experience.starStructure?.action ?? "");
      setResult(experience.starStructure?.result ?? "");
      setSkills(experience.skills.join(", "));
      setError(null);
    }
  }, [experience, open]);

  function resetForm() {
    setRawInput("");
    setSituation("");
    setTask("");
    setAction("");
    setResult("");
    setSkills("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const skillsList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const url = experience
        ? `/api/experiences/${experience.id}`
        : "/api/experiences";

      const body = experience
        ? {
            rawInput,
            starStructure: {
              situation: situation || "",
              task: task || "",
              action: action || "",
              result: result || "",
            },
            skills: skillsList,
          }
        : {
            rawInput,
            situation: situation || undefined,
            task: task || undefined,
            action: action || undefined,
            result: result || undefined,
            skills: skillsList,
          };

      const res = await fetch(url, {
        method: experience ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save experience");
        return;
      }

      if (!isEditing) resetForm();
      setOpen(false);
      onSaved?.();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Experience" : "Manual Experience Entry"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the STAR fields for this experience."
                : "Add a professional experience directly using the STAR format."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <FormField label="Experience Summary" required>
              <Textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Briefly describe the experience..."
                rows={2}
                required
              />
            </FormField>

            <FormField label="Situation">
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What was the context or background?"
                rows={2}
              />
            </FormField>

            <FormField label="Task">
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What was required or the challenge faced?"
                rows={2}
              />
            </FormField>

            <FormField label="Action">
              <Textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What specific steps did you take?"
                rows={2}
              />
            </FormField>

            <FormField label="Result">
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What were the measurable outcomes?"
                rows={2}
              />
            </FormField>

            <FormField label="Skills">
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Leadership, CI/CD (comma-separated)"
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Experience"
                  : "Save Experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
    </div>
  );
}
