import { z } from "zod";

// ==================== User Types ====================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  headline: string | null;
  consentAnalytics: boolean;
  consentAiTraining: boolean;
  consentMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  consentAnalytics: boolean;
  consentAiTraining: boolean;
  consentMarketing: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
}

// ==================== Experience Types ====================

export interface StarStructureOutput {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Experience {
  id: string;
  userId: string;
  rawInput: string;
  starStructure: StarStructureOutput | null;
  skills: string[];
  embedding: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TailoredBullet {
  original: string;
  tailored: string;
  keywords: string[];
}

export interface DraftedMaterials {
  resumeBullets: TailoredBullet[];
  coverLetterParagraphs: string[];
}

// ==================== Job Description Types ====================

export interface ParsedJD {
  title: string;
  company: string;
  location: string | null;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  salary: string | null;
}

export interface FitAnalysis {
  overallScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  strengths: string[];
  gaps: string[];
}

export interface EffortEstimate {
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  requiredMaterials: string[];
  complexity: string;
}

// ==================== Application Types ====================

export type ApplicationStatus =
  | "draft"
  | "ready_to_apply"
  | "applied"
  | "phone_screen"
  | "technical_interview"
  | "final_interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  userId: string;
  externalUrl: string;
  rawHtml: string | null;
  parsedJD: ParsedJD | null;
  embedding: number[] | null;
  fitAnalysis: FitAnalysis | null;
  effortEstimate: EffortEstimate | null;
  draftedMaterials: DraftedMaterials | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Validation Schemas ====================

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const updatePreferencesSchema = z.object({
  consentAnalytics: z.boolean().optional(),
  consentAiTraining: z.boolean().optional(),
  consentMarketing: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createExperienceSchema = z.object({
  rawInput: z
    .string()
    .min(10, "Experience description must be at least 10 characters"),
  starStructure: z
    .object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    })
    .optional(),
  situation: z.string().optional(),
  task: z.string().optional(),
  action: z.string().optional(),
  result: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const updateExperienceSchema = z.object({
  rawInput: z
    .string()
    .min(10, "Experience description must be at least 10 characters")
    .optional(),
  starStructure: z
    .object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
});

export const createApplicationSchema = z
  .object({
    externalUrl: z.string().url("Must be a valid URL").optional(),
    manualJD: z
      .string()
      .trim()
      .min(50, "Job description must be at least 50 characters")
      .optional(),
  })
  .refine(
    ({ externalUrl, manualJD }) =>
      (externalUrl ? 1 : 0) + (manualJD ? 1 : 0) === 1,
    {
      message: "Provide either externalUrl or manualJD",
      path: ["externalUrl"],
    },
  );

export const updateApplicationSchema = z.object({
  status: z
    .enum([
      "draft",
      "ready_to_apply",
      "applied",
      "phone_screen",
      "technical_interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ])
    .optional(),
});

// ==================== LLM Pipeline Types ====================

export interface ParseJDInput {
  rawHtml: string;
}

export interface AnalyzeFitInput {
  parsedJD: ParsedJD;
  userExperiences: Experience[];
}

export interface TailorMaterialsInput {
  parsedJD: ParsedJD;
  selectedExperiences: Experience[];
  fitAnalysis: FitAnalysis;
}

export interface LLMResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: number;
}
