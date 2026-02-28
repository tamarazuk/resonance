import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  createExperienceSchema,
  updateExperienceSchema,
  createApplicationSchema,
  updateApplicationSchema,
  updatePreferencesSchema,
} from "./index";

describe("signupSchema", () => {
  it("validates correct input", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      fullName: "John Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid email", () => {
    const result = signupSchema.safeParse({
      email: "user@domain.co",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Pass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 8 characters");
    }
  });

  it("rejects password without uppercase", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("uppercase");
    }
  });

  it("rejects password without lowercase", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "PASSWORD1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("lowercase");
    }
  });

  it("rejects password without number", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("number");
    }
  });

  it("accepts optional fullName", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short fullName", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      fullName: "A",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("fullName");
    }
  });
});

describe("loginSchema", () => {
  it("validates correct input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("email")),
      ).toBe(true);
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("email")),
      ).toBe(true);
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });
});

describe("createExperienceSchema", () => {
  it("validates correct input with rawInput", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers to build a new product feature",
    });
    expect(result.success).toBe(true);
  });

  it("validates input with starStructure", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers",
      starStructure: {
        situation: "Company needed new feature",
        task: "Build it fast",
        action: "Led team",
        result: "Shipped on time",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates input with separate star fields", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers",
      situation: "Company needed new feature",
      task: "Build it fast",
      action: "Led team",
      result: "Shipped on time",
    });
    expect(result.success).toBe(true);
  });

  it("validates input with skills array", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers",
      skills: ["Leadership", "React", "Node.js"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects starStructure missing result key", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers to deliver feature work",
      starStructure: {
        situation: "Need",
        task: "Build",
        action: "Led",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects starStructure with non-string values", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers",
      starStructure: {
        situation: 123,
        task: "Build",
        action: "Led",
        result: "Done",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects skills with non-string entries", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "Led a team of 5 engineers",
      skills: ["React", 123],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short rawInput", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 10 characters",
      );
    }
  });

  it("rejects empty rawInput", () => {
    const result = createExperienceSchema.safeParse({
      rawInput: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("rawInput")),
      ).toBe(true);
    }
  });
});

describe("updateExperienceSchema", () => {
  it("validates correct input with all fields", () => {
    const result = updateExperienceSchema.safeParse({
      rawInput: "Updated experience description here",
      starStructure: {
        situation: "New situation",
        task: "New task",
        action: "New action",
        result: "New result",
      },
      skills: ["React", "TypeScript"],
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with only rawInput", () => {
    const result = updateExperienceSchema.safeParse({
      rawInput: "Just updating the description",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with only starStructure", () => {
    const result = updateExperienceSchema.safeParse({
      starStructure: {
        situation: "New situation",
        task: "New task",
        action: "New action",
        result: "New result",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with only skills", () => {
    const result = updateExperienceSchema.safeParse({
      skills: ["Leadership"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects starStructure missing keys in update", () => {
    const result = updateExperienceSchema.safeParse({
      starStructure: {
        situation: "Need",
        task: "Build",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects skills with non-string entries in update", () => {
    const result = updateExperienceSchema.safeParse({
      skills: ["React", { skill: "Node" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short rawInput when provided", () => {
    const result = updateExperienceSchema.safeParse({
      rawInput: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("rawInput")),
      ).toBe(true);
    }
  });

  it("accepts empty object (no fields)", () => {
    const result = updateExperienceSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createApplicationSchema", () => {
  it("validates correct input with externalUrl", () => {
    const result = createApplicationSchema.safeParse({
      externalUrl: "https://example.com/job/123",
    });
    expect(result.success).toBe(true);
  });

  it("validates correct input with manualJD", () => {
    const result = createApplicationSchema.safeParse({
      manualJD:
        "This is a job description with enough characters to pass validation. It has more than 50 characters total.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when both externalUrl and manualJD provided", () => {
    const result = createApplicationSchema.safeParse({
      externalUrl: "https://example.com/job/123",
      manualJD:
        "This is a valid job description with more than fifty characters in it.",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "either externalUrl or manualJD",
      );
    }
  });

  it("rejects when neither externalUrl nor manualJD provided", () => {
    const result = createApplicationSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid URL", () => {
    const result = createApplicationSchema.safeParse({
      externalUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("externalUrl");
    }
  });

  it("rejects short manualJD", () => {
    const result = createApplicationSchema.safeParse({
      manualJD: "Too short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 50 characters",
      );
    }
  });

  it("rejects whitespace-only manualJD", () => {
    const result = createApplicationSchema.safeParse({
      manualJD: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("manualJD")),
      ).toBe(true);
    }
  });
});

describe("updateApplicationSchema", () => {
  it("validates correct status", () => {
    const result = updateApplicationSchema.safeParse({
      status: "applied",
    });
    expect(result.success).toBe(true);
  });

  it("validates all status values", () => {
    const statuses = [
      "draft",
      "ready_to_apply",
      "applied",
      "phone_screen",
      "technical_interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ] as const;

    statuses.forEach((status) => {
      const result = updateApplicationSchema.safeParse({ status });
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid status", () => {
    const result = updateApplicationSchema.safeParse({
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("status")),
      ).toBe(true);
    }
  });

  it("accepts empty object", () => {
    const result = updateApplicationSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("updatePreferencesSchema", () => {
  it("validates with consentAnalytics", () => {
    const result = updatePreferencesSchema.safeParse({
      consentAnalytics: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates with consentAiTraining", () => {
    const result = updatePreferencesSchema.safeParse({
      consentAiTraining: false,
    });
    expect(result.success).toBe(true);
  });

  it("validates with consentMarketing", () => {
    const result = updatePreferencesSchema.safeParse({
      consentMarketing: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates with multiple preferences", () => {
    const result = updatePreferencesSchema.safeParse({
      consentAnalytics: true,
      consentAiTraining: false,
      consentMarketing: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updatePreferencesSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "At least one preference field",
      );
    }
  });
});
