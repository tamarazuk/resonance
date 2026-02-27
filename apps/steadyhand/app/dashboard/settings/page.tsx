import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings",
};

async function getPreferences() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/preferences`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const preferences = await getPreferences();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-10">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          Manage your account preferences and privacy settings.
        </p>
      </div>

      <SettingsClient initialPreferences={preferences} />
    </div>
  );
}
