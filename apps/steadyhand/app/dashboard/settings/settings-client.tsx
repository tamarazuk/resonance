"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@resonance/ui/components/card";
import { Skeleton } from "@resonance/ui/components/skeleton";

interface Preferences {
  consentAnalytics: boolean;
  consentAiTraining: boolean;
  consentMarketing: boolean;
}

interface SettingsClientProps {
  initialPreferences: Preferences | null;
}

export function SettingsClient({ initialPreferences }: SettingsClientProps) {
  const [preferences, setPreferences] = useState<Preferences | null>(
    initialPreferences,
  );
  const [saving, setSaving] = useState<string | null>(null);

  if (!preferences) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  async function handleToggle(key: keyof Preferences) {
    if (!preferences) return;
    const newValue = !preferences[key];
    setSaving(key);

    const previousPreferences = preferences;
    setPreferences({ ...preferences, [key]: newValue });

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!res.ok) {
        setPreferences(previousPreferences);
      }
    } catch {
      setPreferences(previousPreferences);
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
        onClick={onChange}
        disabled={loading}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-primary" : "bg-input"
        }`}
        role="switch"
        aria-checked={checked}
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
