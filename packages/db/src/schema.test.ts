import { describe, it, expect, expectTypeOf } from "vitest";
import {
  users,
  accounts,
  experiences,
  applications,
  applicationStatusEnum,
  followUpTypeEnum,
  followUpStatusEnum,
  prepPackets,
  followUpDrafts,
  usersRelations,
  accountsRelations,
  experiencesRelations,
  applicationsRelations,
  type User,
  type NewUser,
  type Account,
  type NewAccount,
  type Experience,
  type NewExperience,
  type Application,
  type NewApplication,
} from "./schema";

describe("applicationStatusEnum", () => {
  it("contains all expected status values", () => {
    const expectedStatuses = [
      "draft",
      "ready_to_apply",
      "applied",
      "phone_screen",
      "technical_interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ];
    expect(applicationStatusEnum.enumValues).toEqual(expectedStatuses);
  });
});

describe("follow-up enums", () => {
  it("contains all expected follow-up type values", () => {
    expect(followUpTypeEnum.enumValues).toEqual([
      "thank_you",
      "check_in",
      "negotiation",
    ]);
  });

  it("contains all expected follow-up status values", () => {
    expect(followUpStatusEnum.enumValues).toEqual([
      "draft",
      "approved",
      "sent",
      "dismissed",
    ]);
  });
});

describe("compile-time type inference", () => {
  it("validates inferred User and NewUser types", () => {
    expectTypeOf<User["id"]>().toEqualTypeOf<string>();
    expectTypeOf<User["email"]>().toEqualTypeOf<string>();
    expectTypeOf<User["passwordHash"]>().toEqualTypeOf<string | null>();
    expectTypeOf<User["fullName"]>().toEqualTypeOf<string | null>();
    expectTypeOf<User["headline"]>().toEqualTypeOf<string | null>();
    expectTypeOf<User["consentAnalytics"]>().toEqualTypeOf<boolean>();
    expectTypeOf<NewUser["email"]>().toEqualTypeOf<string>();
    expectTypeOf<NewUser["passwordHash"]>().toEqualTypeOf<
      string | null | undefined
    >();
  });

  it("validates inferred Experience and Application nullable fields", () => {
    expectTypeOf<Experience["skills"]>().toEqualTypeOf<string[]>();
    expectTypeOf<Experience["embedding"]>().toEqualTypeOf<number[] | null>();
    expectTypeOf<Application["parsedJD"]>().toEqualTypeOf<{
      title: string;
      company: string;
      location: string | null;
      requirements: string[];
      responsibilities: string[];
      skills: string[];
      benefits: string[];
      salary: string | null;
    } | null>();
    expectTypeOf<Application["status"]>().toEqualTypeOf<
      | "draft"
      | "ready_to_apply"
      | "applied"
      | "phone_screen"
      | "technical_interview"
      | "final_interview"
      | "offer"
      | "rejected"
      | "withdrawn"
    >();
    expectTypeOf<NewApplication["embedding"]>().toEqualTypeOf<
      number[] | null | undefined
    >();
  });

  it("validates inferred Account optional token fields", () => {
    expectTypeOf<Account["provider"]>().toEqualTypeOf<string>();
    expectTypeOf<Account["accessToken"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Account["refreshToken"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Account["idToken"]>().toEqualTypeOf<string | null>();
    expectTypeOf<NewAccount["providerAccountId"]>().toEqualTypeOf<string>();
  });
});

describe("users table", () => {
  it("has correct column definitions", () => {
    expect(users.id).toBeDefined();
    expect(users.email).toBeDefined();
    expect(users.passwordHash).toBeDefined();
    expect(users.fullName).toBeDefined();
    expect(users.headline).toBeDefined();
    expect(users.consentAnalytics).toBeDefined();
    expect(users.consentAiTraining).toBeDefined();
    expect(users.consentMarketing).toBeDefined();
    expect(users.emotionalIntelligenceEnabled).toBeDefined();
    expect(users.createdAt).toBeDefined();
    expect(users.updatedAt).toBeDefined();
  });

  it("infers User type from schema", () => {
    const mockUser: User = {
      id: "00000000-0000-0000-0000-000000000000",
      email: "test@example.com",
      passwordHash: "hash",
      fullName: "Test User",
      headline: "Engineer",
      consentAnalytics: true,
      consentAiTraining: false,
      consentMarketing: false,
      emotionalIntelligenceEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mockUser.email).toBe("test@example.com");
  });

  it("infers NewUser type from schema", () => {
    const newUser: NewUser = {
      email: "new@example.com",
      passwordHash: "hash",
      fullName: "New User",
    };
    expect(newUser.email).toBe("new@example.com");
  });
});

describe("accounts table", () => {
  it("has correct column definitions", () => {
    expect(accounts.id).toBeDefined();
    expect(accounts.userId).toBeDefined();
    expect(accounts.type).toBeDefined();
    expect(accounts.provider).toBeDefined();
    expect(accounts.providerAccountId).toBeDefined();
    expect(accounts.refreshToken).toBeDefined();
    expect(accounts.accessToken).toBeDefined();
    expect(accounts.expiresAt).toBeDefined();
    expect(accounts.tokenType).toBeDefined();
    expect(accounts.scope).toBeDefined();
    expect(accounts.idToken).toBeDefined();
    expect(accounts.createdAt).toBeDefined();
    expect(accounts.updatedAt).toBeDefined();
  });

  it("infers Account type from schema", () => {
    const mockAccount: Account = {
      id: "00000000-0000-0000-0000-000000000000",
      userId: "00000000-0000-0000-0000-000000000001",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
      refreshToken: null,
      accessToken: "token",
      expiresAt: null,
      tokenType: null,
      scope: null,
      idToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mockAccount.provider).toBe("google");
  });

  it("infers NewAccount type from schema", () => {
    const newAccount: NewAccount = {
      userId: "00000000-0000-0000-0000-000000000001",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
    };
    expect(newAccount.provider).toBe("google");
  });
});

describe("experiences table", () => {
  it("has correct column definitions", () => {
    expect(experiences.id).toBeDefined();
    expect(experiences.userId).toBeDefined();
    expect(experiences.rawInput).toBeDefined();
    expect(experiences.situation).toBeDefined();
    expect(experiences.task).toBeDefined();
    expect(experiences.action).toBeDefined();
    expect(experiences.result).toBeDefined();
    expect(experiences.skills).toBeDefined();
    expect(experiences.embedding).toBeDefined();
    expect(experiences.createdAt).toBeDefined();
    expect(experiences.updatedAt).toBeDefined();
  });

  it("infers Experience type from schema", () => {
    const mockExperience: Experience = {
      id: "00000000-0000-0000-0000-000000000000",
      userId: "00000000-0000-0000-0000-000000000001",
      rawInput: "Led a team of engineers",
      situation: "Company needed a new feature",
      task: "Build the feature",
      action: "Led the team to build it",
      result: "Delivered on time",
      skills: ["leadership", "react"],
      embedding: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mockExperience.rawInput).toBe("Led a team of engineers");
  });

  it("infers NewExperience type from schema", () => {
    const newExperience: NewExperience = {
      userId: "00000000-0000-0000-0000-000000000001",
      rawInput: "Built a scalable system",
    };
    expect(newExperience.rawInput).toBe("Built a scalable system");
  });

  it("supports skills as array", () => {
    const experienceWithSkills: NewExperience = {
      userId: "00000000-0000-0000-0000-000000000001",
      rawInput: "Test experience",
      skills: ["TypeScript", "React", "Node.js"],
    };
    expect(experienceWithSkills.skills).toHaveLength(3);
  });

  it("supports embedding as number array", () => {
    const mockEmbedding = Array(1536).fill(0);
    const experienceWithEmbedding: NewExperience = {
      userId: "00000000-0000-0000-0000-000000000001",
      rawInput: "Test experience",
      embedding: mockEmbedding,
    };
    expect(experienceWithEmbedding.embedding).toHaveLength(1536);
  });
});

describe("applications table", () => {
  it("has correct column definitions", () => {
    expect(applications.id).toBeDefined();
    expect(applications.userId).toBeDefined();
    expect(applications.externalUrl).toBeDefined();
    expect(applications.rawHtml).toBeDefined();
    expect(applications.parsedJD).toBeDefined();
    expect(applications.embedding).toBeDefined();
    expect(applications.fitAnalysis).toBeDefined();
    expect(applications.effortEstimate).toBeDefined();
    expect(applications.draftedMaterials).toBeDefined();
    expect(applications.status).toBeDefined();
    expect(applications.createdAt).toBeDefined();
    expect(applications.updatedAt).toBeDefined();
  });

  it("infers Application type from schema", () => {
    const mockApplication: Application = {
      id: "00000000-0000-0000-0000-000000000000",
      userId: "00000000-0000-0000-0000-000000000001",
      externalUrl: "https://example.com/job/123",
      rawHtml: null,
      parsedJD: {
        title: "Software Engineer",
        company: "Acme Corp",
        location: "Remote",
        requirements: ["5 years experience"],
        responsibilities: ["Build features"],
        skills: ["TypeScript", "React"],
        benefits: ["Health insurance"],
        salary: "$100k-$150k",
      },
      embedding: null,
      fitAnalysis: null,
      effortEstimate: null,
      draftedMaterials: null,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mockApplication.parsedJD?.title).toBe("Software Engineer");
  });

  it("infers NewApplication type from schema", () => {
    const newApplication: NewApplication = {
      userId: "00000000-0000-0000-0000-000000000001",
      externalUrl: "https://example.com/job/123",
    };
    expect(newApplication.externalUrl).toBe("https://example.com/job/123");
  });

  it("supports all status values", () => {
    const statuses: Application["status"][] = [
      "draft",
      "ready_to_apply",
      "applied",
      "phone_screen",
      "technical_interview",
      "final_interview",
      "offer",
      "rejected",
      "withdrawn",
    ];
    statuses.forEach((status) => {
      const app: NewApplication = {
        userId: "00000000-0000-0000-0000-000000000001",
        externalUrl: "https://example.com/job",
        status,
      };
      expect(app.status).toBe(status);
    });
  });

  it("supports fitAnalysis jsonb type", () => {
    const appWithFitAnalysis: NewApplication = {
      userId: "00000000-0000-0000-0000-000000000001",
      externalUrl: "https://example.com/job",
      fitAnalysis: {
        overallScore: 85,
        matchingSkills: ["TypeScript", "React"],
        missingSkills: ["Python"],
        recommendations: ["Highlight leadership"],
        strengths: ["Strong technical background"],
        gaps: ["Limited cloud experience"],
      },
    };
    expect(appWithFitAnalysis.fitAnalysis?.overallScore).toBe(85);
  });

  it("supports effortEstimate jsonb type", () => {
    const appWithEffort: NewApplication = {
      userId: "00000000-0000-0000-0000-000000000001",
      externalUrl: "https://example.com/job",
      effortEstimate: {
        difficulty: "medium",
        estimatedHours: 2,
        requiredMaterials: ["resume", "cover letter"],
        complexity: "moderate",
      },
    };
    expect(appWithEffort.effortEstimate?.difficulty).toBe("medium");
  });

  it("supports draftedMaterials jsonb type", () => {
    const appWithMaterials: NewApplication = {
      userId: "00000000-0000-0000-0000-000000000001",
      externalUrl: "https://example.com/job",
      draftedMaterials: {
        resumeBullets: [
          {
            original: "Built features",
            tailored: "Architected and built scalable features",
            keywords: ["leadership", "scalability"],
          },
        ],
        coverLetterParagraphs: ["I am excited to apply..."],
      },
    };
    expect(appWithMaterials.draftedMaterials?.resumeBullets).toHaveLength(1);
  });
});

describe("prep packets and follow-up drafts tables", () => {
  it("has prep packet column definitions", () => {
    expect(prepPackets.id).toBeDefined();
    expect(prepPackets.userId).toBeDefined();
    expect(prepPackets.applicationId).toBeDefined();
    expect(prepPackets.companyResearch).toBeDefined();
    expect(prepPackets.predictedQuestions).toBeDefined();
    expect(prepPackets.talkingPoints).toBeDefined();
    expect(prepPackets.calmModeData).toBeDefined();
    expect(prepPackets.createdAt).toBeDefined();
    expect(prepPackets.updatedAt).toBeDefined();
  });

  it("has follow-up draft column definitions", () => {
    expect(followUpDrafts.id).toBeDefined();
    expect(followUpDrafts.userId).toBeDefined();
    expect(followUpDrafts.applicationId).toBeDefined();
    expect(followUpDrafts.type).toBeDefined();
    expect(followUpDrafts.content).toBeDefined();
    expect(followUpDrafts.suggestedSendAt).toBeDefined();
    expect(followUpDrafts.status).toBeDefined();
    expect(followUpDrafts.createdAt).toBeDefined();
    expect(followUpDrafts.updatedAt).toBeDefined();
  });
});

describe("relations", () => {
  it("defines usersRelations correctly", () => {
    expect(usersRelations).toBeDefined();
  });

  it("defines accountsRelations correctly", () => {
    expect(accountsRelations).toBeDefined();
  });

  it("defines experiencesRelations correctly", () => {
    expect(experiencesRelations).toBeDefined();
  });

  it("defines applicationsRelations correctly", () => {
    expect(applicationsRelations).toBeDefined();
  });
});
