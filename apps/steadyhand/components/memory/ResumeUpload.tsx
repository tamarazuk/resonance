"use client";

import { useRef, useState } from "react";
import { Button } from "@resonance/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@resonance/ui/components/dialog";
import { Upload } from "lucide-react";

interface ParsedExperience {
  rawInput: string;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  skills: string[];
}

export function ResumeUpload({ onUploaded }: { onUploaded?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedExperiences, setParsedExperiences] = useState<
    ParsedExperience[]
  >([]);
  const [open, setOpen] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to parse resume");
        return;
      }

      const data = await res.json();
      setParsedExperiences(data.experiences);
      if (data.experiences.length > 0) {
        setOpen(true);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveExperiences = async () => {
    setLoading(true);
    setError(null);

    try {
      for (const exp of parsedExperiences) {
        const res = await fetch("/api/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exp),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to save experience");
          return;
        }
      }

      setOpen(false);
      setParsedExperiences([]);
      onUploaded?.();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <Upload className="h-4 w-4" />
        {loading ? "Processing..." : "Import Resume"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Experiences from Resume</DialogTitle>
            <DialogDescription>
              We found {parsedExperiences.length} experience(s) in your resume.
              Review and save them to your Memory Bank.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            {parsedExperiences.map((exp, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="font-medium text-foreground">{exp.rawInput}</p>
                {exp.skills.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Skills: {exp.skills.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExperiences} disabled={loading}>
              {loading
                ? "Saving..."
                : `Save ${parsedExperiences.length} Experience(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
