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
  id?: string;
  uuid?: string;
}

function getExperienceKey(exp: ParsedExperience): string {
  return (
    exp.id ??
    exp.uuid ??
    [
      exp.rawInput,
      exp.situation ?? "",
      exp.task ?? "",
      exp.action ?? "",
      exp.result ?? "",
      exp.skills.join(","),
    ].join("|")
  );
}

async function getResponseErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return fallbackMessage;
  }

  try {
    const data = (await response.json()) as { error?: unknown };
    return typeof data.error === "string" ? data.error : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
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

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

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
        const errorMessage = await getResponseErrorMessage(
          res,
          "Failed to parse resume",
        );
        setError(errorMessage);
        return;
      }

      const data = await res.json();
      const experiences: ParsedExperience[] = Array.isArray(data.experiences)
        ? data.experiences
        : [];
      setParsedExperiences(experiences);
      if (experiences.length > 0) {
        setOpen(true);
      } else {
        setError("No experiences found in resume.");
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

    const failures: string[] = [];
    let savedCount = 0;

    try {
      for (let i = 0; i < parsedExperiences.length; i++) {
        const exp = parsedExperiences[i];
        try {
          const res = await fetch("/api/experiences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exp),
          });

          if (!res.ok) {
            const errorMessage = await getResponseErrorMessage(
              res,
              "Failed to save experience",
            );
            failures.push(`Experience ${i + 1}: ${errorMessage}`);
          } else {
            savedCount++;
          }
        } catch {
          failures.push(`Experience ${i + 1}: network error`);
        }
      }

      if (failures.length > 0) {
        setError(
          `Saved ${savedCount}/${parsedExperiences.length}. Failed: ${failures.join("; ")}`,
        );
      }

      if (savedCount > 0) {
        onUploaded?.();
      }

      if (failures.length === 0) {
        setOpen(false);
        setParsedExperiences([]);
      }
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

            {parsedExperiences.map((exp) => (
              <div
                key={getExperienceKey(exp)}
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
