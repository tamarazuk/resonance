"use client";

import { useState } from "react";
import type { UserPreferences } from "@resonance/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@resonance/ui/components/card";
import { Button } from "@resonance/ui/components/button";

type Preferences = UserPreferences;

interface SettingsClientProps {
  initialPreferences: Preferences | null;
}

export function SettingsClient({ initialPreferences }: SettingsClientProps) {
  const [preferences, setPreferences] = useState<Preferences | null>(
    initialPreferences,
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!preferences) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-4 py-8">
          <p className="text-sm text-muted-foreground">
            We couldn't load your preferences right now. Please try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleToggle(key: keyof Preferences) {
    if (!preferences) return;
    setError(null);
    const currentValue = preferences[key];
    const newValue = !currentValue;
    setSaving(key);

    setPreferences((prev) => (prev ? { ...prev, [key]: newValue } : null));

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!res.ok) {
        setPreferences((prev) =>
          prev ? { ...prev, [key]: currentValue } : null,
        );

        let errorMessage = "Failed to save preference";
        try {
          const data: unknown = await res.json();
          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string" &&
            data.error.trim()
          ) {
            errorMessage = data.error;
          }
        } catch {
          // Keep fallback error message when response isn't JSON.
        }

        setError(errorMessage);
      }
    } catch {
      setPreferences((prev) =>
        prev ? { ...prev, [key]: currentValue } : null,
      );
      setError("Failed to save preference");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>
            Control how your data is used. These settings affect your account
            privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <ToggleItem
            title="Analytics"
            description="Allow anonymous usage data to help us improve the product."
            checked={preferences.consentAnalytics}
            loading={saving === "consentAnalytics"}
            onChange={() => handleToggle("consentAnalytics")}
          />
          <ToggleItem
            title="AI Training"
            description="Contribute your experience data to improve Steadyhand's AI models. Your data is anonymized and you can opt out at any time."
            checked={preferences.consentAiTraining}
            loading={saving === "consentAiTraining"}
            onChange={() => handleToggle("consentAiTraining")}
          />
          <ToggleItem
            title="Marketing Emails"
            description="Receive updates about new features, career tips, and product announcements."
            checked={preferences.consentMarketing}
            loading={saving === "consentMarketing"}
            onChange={() => handleToggle("consentMarketing")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleItem({
  title,
  description,
  checked,
  loading,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  loading: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={loading}
        aria-label={`${title} toggle`}
        aria-checked={checked}
        aria-busy={loading}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-primary" : "bg-input"
        }`}
        role="switch"
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
