import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core/columns/vector_extension/vector";
import { relations } from "drizzle-orm";

// ==================== Enums ====================

export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "ready_to_apply",
  "applied",
  "phone_screen",
  "technical_interview",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export const followUpTypeEnum = pgEnum("follow_up_type", [
  "thank_you",
  "check_in",
  "negotiation",
]);

export const followUpStatusEnum = pgEnum("follow_up_status", [
  "draft",
  "approved",
  "sent",
  "dismissed",
]);

// ==================== Users Table ====================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  headline: text("headline"),
  consentAnalytics: boolean("consent_analytics").notNull().default(true),
  consentAiTraining: boolean("consent_ai_training").notNull().default(false),
  consentMarketing: boolean("consent_marketing").notNull().default(false),
  emotionalIntelligenceEnabled: boolean("emotional_intelligence_enabled")
    .notNull()
    .default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Accounts Table ====================

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Experiences Table ====================

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rawInput: text("raw_input").notNull(),
  situation: text("situation"),
  task: text("task"),
  action: text("action"),
  result: text("result"),
  skills: text("skills").array().notNull().default([]),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Applications Table ====================

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  externalUrl: text("external_url").notNull(),
  rawHtml: text("raw_html"),
  parsedJD: jsonb("parsed_jd").$type<{
    title: string;
    company: string;
    location: string | null;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
    benefits: string[];
    salary: string | null;
  }>(),
  embedding: vector("embedding", { dimensions: 1536 }),
  fitAnalysis: jsonb("fit_analysis").$type<{
    overallScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    strengths: string[];
    gaps: string[];
  }>(),
  effortEstimate: jsonb("effort_estimate").$type<{
    difficulty: "easy" | "medium" | "hard";
    estimatedHours: number;
    requiredMaterials: string[];
    complexity: string;
  }>(),
  draftedMaterials: jsonb("drafted_materials").$type<{
    resumeBullets: Array<{
      original: string;
      tailored: string;
      keywords: string[];
    }>;
    coverLetterParagraphs: string[];
  }>(),
  status: applicationStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Prep Packets Table ====================

export const prepPackets = pgTable("prep_packets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  companyResearch: jsonb("company_research").$type<{
    overview: string;
    culture: string;
    recentNews: string;
    industry: string;
    size: string;
  }>(),
  predictedQuestions: jsonb("predicted_questions").$type<
    Array<{
      question: string;
      category: string;
      suggestedStoryId?: string;
      suggestedStoryPreview?: string;
    }>
  >(),
  talkingPoints: jsonb("talking_points").$type<
    Array<{
      point: string;
      supportingExperience?: string;
    }>
  >(),
  calmModeData: jsonb("calm_mode_data").$type<{
    keyPoints: [string, string, string];
    openingStory: { title: string; preview: string };
    groundingPrompt: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Follow-Up Drafts Table ====================

export const followUpDrafts = pgTable("follow_up_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  type: followUpTypeEnum("type").notNull(),
  content: text("content").notNull(),
  suggestedSendAt: timestamp("suggested_send_at"),
  status: followUpStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Relations ====================

export const usersRelations = relations(users, ({ many }) => ({
  experiences: many(experiences),
  applications: many(applications),
  accounts: many(accounts),
  prepPackets: many(prepPackets),
  followUpDrafts: many(followUpDrafts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
  user: one(users, {
    fields: [experiences.userId],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [applications.userId],
      references: [users.id],
    }),
    prepPackets: many(prepPackets),
    followUpDrafts: many(followUpDrafts),
  }),
);

export const prepPacketsRelations = relations(prepPackets, ({ one }) => ({
  user: one(users, {
    fields: [prepPackets.userId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [prepPackets.applicationId],
    references: [applications.id],
  }),
}));

export const followUpDraftsRelations = relations(followUpDrafts, ({ one }) => ({
  user: one(users, {
    fields: [followUpDrafts.userId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [followUpDrafts.applicationId],
    references: [applications.id],
  }),
}));

// ==================== Types ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type PrepPacket = typeof prepPackets.$inferSelect;
export type NewPrepPacket = typeof prepPackets.$inferInsert;

export type FollowUpDraft = typeof followUpDrafts.$inferSelect;
export type NewFollowUpDraft = typeof followUpDrafts.$inferInsert;
