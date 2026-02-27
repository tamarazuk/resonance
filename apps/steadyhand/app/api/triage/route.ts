import { NextResponse } from "next/server";
import {
  db,
  experiences,
  applications,
  eq,
  and,
  desc,
  lt,
  asc,
  isNull,
} from "@resonance/db";
import type { TriageAction } from "@resonance/types";
import { auth } from "@/lib/auth";
import { subDays } from "date-fns";

function getCompanyName(url: string): string {
  if (url === "Manual Entry") return "your manual entry";
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname;
  } catch {
    return "the company";
  }
}

function priorityFromDaysAgo(daysAgo: number): "high" | "medium" | "low" {
  if (daysAgo >= 7) return "high";
  if (daysAgo >= 3) return "medium";
  return "low";
}

/** GET /api/triage — get action items for the dashboard. */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const threeDaysAgo = subDays(new Date(), 3);

  const actions: TriageAction[] = [];

  const pendingExperiences = await db
    .select()
    .from(experiences)
    .where(
      and(
        eq(experiences.userId, userId),
        isNull(experiences.situation),
        isNull(experiences.task),
        isNull(experiences.action),
        isNull(experiences.result),
      ),
    )
    .orderBy(desc(experiences.createdAt))
    .limit(3);

  for (const exp of pendingExperiences) {
    const truncatedInput =
      exp.rawInput.length > 50
        ? exp.rawInput.slice(0, 50) + "..."
        : exp.rawInput;
    actions.push({
      id: `exp-${exp.id}`,
      title: "Review AI-suggested STAR story",
      description: `"${truncatedInput}" needs your review to complete the STAR structure.`,
      priority: "medium",
      type: "review_story",
      href: "/dashboard/chat",
    });
  }

  const readyToApply = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "ready_to_apply"),
      ),
    )
    .orderBy(desc(applications.createdAt))
    .limit(3);

  for (const app of readyToApply) {
    const company = app.parsedJD?.company ?? getCompanyName(app.externalUrl);
    const title = app.parsedJD?.title ?? "a new position";
    actions.push({
      id: `app-ready-${app.id}`,
      title: `Submit application to ${company}`,
      description: `Your tailored materials for ${title} are ready. Submit when ready.`,
      priority: "high",
      type: "complete_analysis",
      href: `/dashboard/applications/${app.id}`,
    });
  }

  const needsFollowUp = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "applied"),
        lt(applications.updatedAt, threeDaysAgo),
      ),
    )
    .orderBy(asc(applications.updatedAt))
    .limit(3);

  for (const app of needsFollowUp) {
    const company = app.parsedJD?.company ?? getCompanyName(app.externalUrl);
    const daysSinceUpdate = Math.floor(
      (Date.now() - app.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    actions.push({
      id: `app-follow-${app.id}`,
      title: `Follow up with ${company}`,
      description: `It's been ${daysSinceUpdate} days since you applied. Time to check in?`,
      priority: priorityFromDaysAgo(daysSinceUpdate),
      type: "follow_up",
      href: `/dashboard/applications/${app.id}`,
    });
  }

  actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return NextResponse.json(actions.slice(0, 5));
}
