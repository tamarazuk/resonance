"use client";

import { useState } from "react";
import { toast } from "sonner";
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
 * Traditional STAR data-entry form — used inside a "Manual Entry" dialog.
 *
 * Not rendered as a standalone page. This is the accessibility/speed fallback
 * for users who prefer direct form input over chat-based entry.
 *
 * On submit, POSTs to the experiences API and calls `onSaved` so the parent
 * can refresh the Memory Bank.
 */
export function ExperienceForm({
  onSaved,
  trigger,
}: {
  onSaved?: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawInput, setRawInput] = useState("");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [skills, setSkills] = useState("");

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
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput,
          situation: situation || undefined,
          task: task || undefined,
          action: action || undefined,
          result: result || undefined,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const message = data.error ?? "Failed to save experience";
        setError(message);
        toast.error(message);
        return;
      }

      resetForm();
      setOpen(false);
      toast.success("Experience saved to Memory Bank");
      onSaved?.();
    } catch (error) {
      const message = "Network error — please try again";
      setError(message);
      toast.error(message);
      console.error("Save experience error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.JSX.Element} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Manual Experience Entry</DialogTitle>
            <DialogDescription>
              Add a professional experience directly using the STAR format.
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
              {loading ? "Saving..." : "Save Experience"}
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
