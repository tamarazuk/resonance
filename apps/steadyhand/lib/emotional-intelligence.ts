import type { UserEmotionalContext } from "@resonance/types";
import { db, applications, eq, and, gte, desc, sql } from "@resonance/db";
import { subDays } from "date-fns";

/**
 * Analyze a user's recent activity patterns to determine their emotional context.
 * This is used to adjust tone in triage actions, chat, and dashboard messaging.
 */
export async function analyzeUserState(
  userId: string,
): Promise<UserEmotionalContext> {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  // Count rejections in the last 7 days
  const [recentRejectionsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "rejected"),
        gte(applications.updatedAt, sevenDaysAgo),
      ),
    );

  const recentRejectionsCount = Number(recentRejectionsRow?.count ?? 0);

  // Get most recent activity (any application update)
  const [latestActivity] = await db
    .select({ updatedAt: applications.updatedAt })
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt))
    .limit(1);

  const daysSinceActive = latestActivity
    ? Math.floor(
        (now.getTime() - latestActivity.updatedAt.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 999;

  // Determine activity trend based on recent vs older applications
  const thirtyDaysAgo = subDays(now, 30);
  const fourteenDaysAgo = subDays(now, 14);

  const [recentAppsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        gte(applications.createdAt, fourteenDaysAgo),
      ),
    );

  const [thirtyDayAppsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        gte(applications.createdAt, thirtyDaysAgo),
      ),
    );

  const [recentOffersRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "offer"),
        gte(applications.createdAt, fourteenDaysAgo),
      ),
    );

  const recentCount = Number(recentAppsRow?.count ?? 0);
  const totalThirtyDayCount = Number(thirtyDayAppsRow?.count ?? 0);
  const olderCount = Math.max(0, totalThirtyDayCount - recentCount); // Apps from 14-30 days ago
  const hasRecentOffer = Number(recentOffersRow?.count ?? 0) > 0;

  let activityTrend: UserEmotionalContext["activityTrend"];
  if (daysSinceActive > 7) {
    activityTrend = "inactive";
  } else if (recentCount > olderCount) {
    activityTrend = "increasing";
  } else if (recentCount < olderCount) {
    activityTrend = "decreasing";
  } else {
    activityTrend = "stable";
  }

  // Determine suggested tone
  let suggestedTone: UserEmotionalContext["suggestedTone"];
  if (recentRejectionsCount >= 3) {
    suggestedTone = "supportive";
  } else if (daysSinceActive > 5) {
    suggestedTone = "encouraging";
  } else if (hasRecentOffer) {
    suggestedTone = "celebratory";
  } else {
    suggestedTone = "standard";
  }

  return {
    recentRejections: recentRejectionsCount,
    daysSinceActive,
    activityTrend,
    suggestedTone,
  };
}

/**
 * Generate an emotional context note to append to LLM system prompts.
 */
export function emotionalContextPrompt(context: UserEmotionalContext): string {
  const notes: string[] = [];

  if (context.recentRejections > 0) {
    notes.push(
      `The user received ${context.recentRejections} rejection${context.recentRejections > 1 ? "s" : ""} this week. Be supportive without being patronizing.`,
    );
  }

  if (context.daysSinceActive > 5) {
    notes.push(
      `The user hasn't been active for ${context.daysSinceActive} days. Welcome them back warmly without shaming the gap.`,
    );
  }

  if (context.suggestedTone === "celebratory") {
    notes.push(
      "The user recently received a job offer. Celebrate their achievement.",
    );
  }

  if (context.activityTrend === "decreasing") {
    notes.push(
      "The user's application activity has been declining. Be encouraging without adding pressure.",
    );
  }

  if (notes.length === 0) return "";

  return `\n\n[Emotional Context — adjust your tone accordingly]\n${notes.join("\n")}`;
}
