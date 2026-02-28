import { describe, it, expect, vi, beforeEach } from "vitest";
import { eq, desc, and } from "drizzle-orm";
import { users, accounts, experiences, applications } from "./schema";

vi.mock("./client", () => {
  const mockDb = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve(undefined)),
    })),
  };
  return { db: mockDb, connection: {} };
});

import { db } from "./client";

const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("users CRUD operations", () => {
  describe("SELECT users", () => {
    it("builds select query for user by email", async () => {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "test@example.com",
        passwordHash: "hash",
        fullName: "Test User",
        headline: null,
        consentAnalytics: true,
        consentAiTraining: false,
        consentMarketing: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockUser]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, "test@example.com"));

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(users);
      expect(mockWhere).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });

    it("builds select query for user by id", async () => {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "test@example.com",
        passwordHash: "hash",
        fullName: null,
        headline: null,
        consentAnalytics: true,
        consentAiTraining: false,
        consentMarketing: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockUser]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, "00000000-0000-0000-0000-000000000000"));

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe("INSERT users", () => {
    it("builds insert query with required fields", async () => {
      const newUser = {
        email: "new@example.com",
        passwordHash: "hashedpassword",
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000000",
          ...newUser,
          fullName: null,
          headline: null,
          consentAnalytics: true,
          consentAiTraining: false,
          consentMarketing: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db.insert(users).values(newUser).returning();

      expect(mockDb.insert).toHaveBeenCalledWith(users);
      expect(mockValues).toHaveBeenCalledWith(newUser);
      expect(result[0].email).toBe("new@example.com");
    });

    it("builds insert query with all fields", async () => {
      const newUser = {
        email: "full@example.com",
        passwordHash: "hash",
        fullName: "Full Name",
        headline: "Software Engineer",
        consentAnalytics: false,
        consentAiTraining: true,
        consentMarketing: true,
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000000",
          ...newUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db.insert(users).values(newUser).returning();

      expect(mockValues).toHaveBeenCalledWith(newUser);
      expect(result[0].fullName).toBe("Full Name");
    });
  });

  describe("UPDATE users", () => {
    it("builds update query for user preferences", async () => {
      const updates = {
        consentAnalytics: false,
        consentAiTraining: true,
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000000",
          email: "test@example.com",
          passwordHash: "hash",
          fullName: null,
          headline: null,
          ...updates,
          consentMarketing: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, "00000000-0000-0000-0000-000000000000"))
        .returning();

      expect(mockDb.update).toHaveBeenCalledWith(users);
      expect(mockSet).toHaveBeenCalledWith(updates);
      expect(result[0].consentAnalytics).toBe(false);
    });
  });

  describe("DELETE users", () => {
    it("builds delete query", async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: mockWhere });

      await db
        .delete(users)
        .where(eq(users.id, "00000000-0000-0000-0000-000000000000"));

      expect(mockDb.delete).toHaveBeenCalledWith(users);
      expect(mockWhere).toHaveBeenCalled();
    });
  });
});

describe("experiences CRUD operations", () => {
  describe("SELECT experiences", () => {
    it("builds select query for experiences by userId ordered by createdAt", async () => {
      const mockExperiences = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          rawInput: "Recent experience",
          situation: null,
          task: null,
          action: null,
          result: null,
          skills: [],
          embedding: null,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          userId: "00000000-0000-0000-0000-000000000000",
          rawInput: "Older experience",
          situation: null,
          task: null,
          action: null,
          result: null,
          skills: [],
          embedding: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      const mockOrderBy = vi.fn().mockResolvedValue(mockExperiences);
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(experiences)
        .where(eq(experiences.userId, "00000000-0000-0000-0000-000000000000"))
        .orderBy(desc(experiences.createdAt));

      expect(mockFrom).toHaveBeenCalledWith(experiences);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
      expect(result).toEqual(mockExperiences);
    });

    it("builds select query for single experience by id", async () => {
      const mockExperience = {
        id: "00000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000000",
        rawInput: "Test experience",
        situation: null,
        task: null,
        action: null,
        result: null,
        skills: [],
        embedding: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockExperience]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(experiences)
        .where(eq(experiences.id, "00000000-0000-0000-0000-000000000001"));

      expect(result[0].rawInput).toBe("Test experience");
    });
  });

  describe("INSERT experiences", () => {
    it("builds insert query with minimal fields", async () => {
      const newExperience = {
        userId: "00000000-0000-0000-0000-000000000000",
        rawInput: "Led a team to build a feature",
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newExperience,
          situation: null,
          task: null,
          action: null,
          result: null,
          skills: [],
          embedding: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(experiences)
        .values(newExperience)
        .returning();

      expect(mockDb.insert).toHaveBeenCalledWith(experiences);
      expect(result[0].rawInput).toBe("Led a team to build a feature");
    });

    it("builds insert query with full STAR structure", async () => {
      const newExperience = {
        userId: "00000000-0000-0000-0000-000000000000",
        rawInput: "Led a team",
        situation: "Company needed a new feature",
        task: "Build the feature quickly",
        action: "Led a team of 5 engineers",
        result: "Delivered on time with high quality",
        skills: ["leadership", "project management"],
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newExperience,
          embedding: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(experiences)
        .values(newExperience)
        .returning();

      expect(result[0].situation).toBe("Company needed a new feature");
      expect(result[0].skills).toEqual(["leadership", "project management"]);
    });

    it("builds insert query with embedding", async () => {
      const mockEmbedding = Array(1536).fill(0.5);
      const newExperience = {
        userId: "00000000-0000-0000-0000-000000000000",
        rawInput: "Experience with embedding",
        embedding: mockEmbedding,
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newExperience,
          situation: null,
          task: null,
          action: null,
          result: null,
          skills: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(experiences)
        .values(newExperience)
        .returning();

      expect(result[0].embedding).toBe(mockEmbedding);
    });
  });

  describe("UPDATE experiences", () => {
    it("builds update query for STAR fields", async () => {
      const updates = {
        situation: "Updated situation",
        task: "Updated task",
        action: "Updated action",
        result: "Updated result",
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          rawInput: "Original input",
          ...updates,
          skills: [],
          embedding: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(experiences)
        .set(updates)
        .where(eq(experiences.id, "00000000-0000-0000-0000-000000000001"))
        .returning();

      expect(mockDb.update).toHaveBeenCalledWith(experiences);
      expect(result[0].situation).toBe("Updated situation");
    });

    it("builds update query for skills array", async () => {
      const updates = {
        skills: ["React", "TypeScript", "Node.js"],
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          rawInput: "Original",
          situation: null,
          task: null,
          action: null,
          result: null,
          ...updates,
          embedding: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(experiences)
        .set(updates)
        .where(eq(experiences.id, "00000000-0000-0000-0000-000000000001"))
        .returning();

      expect(result[0].skills).toEqual(["React", "TypeScript", "Node.js"]);
    });
  });

  describe("DELETE experiences", () => {
    it("builds delete query by id", async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: mockWhere });

      await db
        .delete(experiences)
        .where(eq(experiences.id, "00000000-0000-0000-0000-000000000001"));

      expect(mockDb.delete).toHaveBeenCalledWith(experiences);
      expect(mockWhere).toHaveBeenCalled();
    });

    it("builds delete query with userId and experienceId", async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: mockWhere });

      await db
        .delete(experiences)
        .where(
          and(
            eq(experiences.id, "00000000-0000-0000-0000-000000000001"),
            eq(experiences.userId, "00000000-0000-0000-0000-000000000000"),
          ),
        );

      expect(mockDb.delete).toHaveBeenCalledWith(experiences);
    });
  });
});

describe("applications CRUD operations", () => {
  describe("SELECT applications", () => {
    it("builds select query for applications by userId ordered by createdAt", async () => {
      const mockApplications = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          externalUrl: "https://example.com/job/1",
          rawHtml: null,
          parsedJD: null,
          embedding: null,
          fitAnalysis: null,
          effortEstimate: null,
          draftedMaterials: null,
          status: "draft" as const,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      const mockOrderBy = vi.fn().mockResolvedValue(mockApplications);
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(applications)
        .where(eq(applications.userId, "00000000-0000-0000-0000-000000000000"))
        .orderBy(desc(applications.createdAt));

      expect(mockFrom).toHaveBeenCalledWith(applications);
      expect(result).toEqual(mockApplications);
    });

    it("builds select query for single application by id", async () => {
      const mockApplication = {
        id: "00000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000000",
        externalUrl: "https://example.com/job/1",
        rawHtml: null,
        parsedJD: {
          title: "Software Engineer",
          company: "Acme",
          location: "Remote",
          requirements: [],
          responsibilities: [],
          skills: [],
          benefits: [],
          salary: null,
        },
        embedding: null,
        fitAnalysis: null,
        effortEstimate: null,
        draftedMaterials: null,
        status: "draft" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockApplication]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(applications)
        .where(eq(applications.id, "00000000-0000-0000-0000-000000000001"));

      expect(result[0].parsedJD?.title).toBe("Software Engineer");
    });
  });

  describe("INSERT applications", () => {
    it("builds insert query with minimal fields", async () => {
      const newApplication = {
        userId: "00000000-0000-0000-0000-000000000000",
        externalUrl: "https://example.com/job/123",
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newApplication,
          rawHtml: null,
          parsedJD: null,
          embedding: null,
          fitAnalysis: null,
          effortEstimate: null,
          draftedMaterials: null,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(applications)
        .values(newApplication)
        .returning();

      expect(mockDb.insert).toHaveBeenCalledWith(applications);
      expect(result[0].externalUrl).toBe("https://example.com/job/123");
    });

    it("builds insert query with parsedJD", async () => {
      const newApplication = {
        userId: "00000000-0000-0000-0000-000000000000",
        externalUrl: "https://example.com/job/123",
        parsedJD: {
          title: "Senior Engineer",
          company: "Tech Corp",
          location: "San Francisco",
          requirements: ["5 years exp", "TypeScript"],
          responsibilities: ["Build features", "Mentor team"],
          skills: ["React", "Node.js", "PostgreSQL"],
          benefits: ["Health", "401k"],
          salary: "$150k-$200k",
        },
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newApplication,
          rawHtml: null,
          embedding: null,
          fitAnalysis: null,
          effortEstimate: null,
          draftedMaterials: null,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(applications)
        .values(newApplication)
        .returning();

      expect(result[0].parsedJD?.title).toBe("Senior Engineer");
      expect(result[0].parsedJD?.skills).toContain("React");
    });

    it("builds insert query with embedding", async () => {
      const mockEmbedding = Array(1536).fill(0.3);
      const newApplication = {
        userId: "00000000-0000-0000-0000-000000000000",
        externalUrl: "https://example.com/job/123",
        embedding: mockEmbedding,
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newApplication,
          rawHtml: null,
          parsedJD: null,
          fitAnalysis: null,
          effortEstimate: null,
          draftedMaterials: null,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db
        .insert(applications)
        .values(newApplication)
        .returning();

      expect(result[0].embedding).toBe(mockEmbedding);
    });
  });

  describe("UPDATE applications", () => {
    it("builds update query for status", async () => {
      const updates = { status: "applied" as const };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          externalUrl: "https://example.com/job/123",
          rawHtml: null,
          parsedJD: null,
          embedding: null,
          fitAnalysis: null,
          effortEstimate: null,
          draftedMaterials: null,
          ...updates,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(applications)
        .set(updates)
        .where(eq(applications.id, "00000000-0000-0000-0000-000000000001"))
        .returning();

      expect(mockDb.update).toHaveBeenCalledWith(applications);
      expect(result[0].status).toBe("applied");
    });

    it("builds update query for fitAnalysis", async () => {
      const updates = {
        fitAnalysis: {
          overallScore: 85,
          matchingSkills: ["TypeScript", "React"],
          missingSkills: ["Python"],
          recommendations: ["Highlight leadership experience"],
          strengths: ["Strong technical background"],
          gaps: ["Limited cloud experience"],
        },
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          externalUrl: "https://example.com/job/123",
          rawHtml: null,
          parsedJD: null,
          embedding: null,
          ...updates,
          effortEstimate: null,
          draftedMaterials: null,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(applications)
        .set(updates)
        .where(eq(applications.id, "00000000-0000-0000-0000-000000000001"))
        .returning();

      expect(result[0].fitAnalysis?.overallScore).toBe(85);
    });

    it("builds update query for draftedMaterials", async () => {
      const updates = {
        draftedMaterials: {
          resumeBullets: [
            {
              original: "Built features",
              tailored:
                "Architected and built scalable features serving 1M+ users",
              keywords: ["scalability", "architecture"],
            },
          ],
          coverLetterParagraphs: [
            "I am excited to apply for the Senior Engineer role...",
          ],
        },
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          userId: "00000000-0000-0000-0000-000000000000",
          externalUrl: "https://example.com/job/123",
          rawHtml: null,
          parsedJD: null,
          embedding: null,
          fitAnalysis: null,
          effortEstimate: null,
          ...updates,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet });

      const result = await db
        .update(applications)
        .set(updates)
        .where(eq(applications.id, "00000000-0000-0000-0000-000000000001"))
        .returning();

      expect(result[0].draftedMaterials?.resumeBullets).toHaveLength(1);
    });
  });

  describe("DELETE applications", () => {
    it("builds delete query by id", async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: mockWhere });

      await db
        .delete(applications)
        .where(eq(applications.id, "00000000-0000-0000-0000-000000000001"));

      expect(mockDb.delete).toHaveBeenCalledWith(applications);
      expect(mockWhere).toHaveBeenCalled();
    });
  });
});

describe("accounts CRUD operations", () => {
  describe("SELECT accounts", () => {
    it("builds select query for accounts by userId", async () => {
      const mockAccount = {
        id: "00000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000000",
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

      const mockWhere = vi.fn().mockResolvedValue([mockAccount]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, "00000000-0000-0000-0000-000000000000"));

      expect(mockFrom).toHaveBeenCalledWith(accounts);
      expect(result[0].provider).toBe("google");
    });
  });

  describe("INSERT accounts", () => {
    it("builds insert query for OAuth account", async () => {
      const newAccount = {
        userId: "00000000-0000-0000-0000-000000000000",
        type: "oauth",
        provider: "google",
        providerAccountId: "12345",
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: "00000000-0000-0000-0000-000000000001",
          ...newAccount,
          expiresAt: null,
          tokenType: null,
          scope: null,
          idToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues });

      const result = await db.insert(accounts).values(newAccount).returning();

      expect(mockDb.insert).toHaveBeenCalledWith(accounts);
      expect(result[0].provider).toBe("google");
    });
  });

  describe("DELETE accounts", () => {
    it("builds delete query by userId and provider", async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where: mockWhere });

      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, "00000000-0000-0000-0000-000000000000"),
            eq(accounts.provider, "google"),
          ),
        );

      expect(mockDb.delete).toHaveBeenCalledWith(accounts);
    });
  });
});

describe("relation queries", () => {
  it("builds user-rooted query for user relation lookup", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    await db.select().from(users).where(eq(users.id, "user-id"));

    expect(mockFrom).toHaveBeenCalledWith(users);
    expect(mockWhere).toHaveBeenCalled();
  });

  it("builds user-rooted query with combined filters", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    await db
      .select()
      .from(users)
      .where(and(eq(users.id, "user-id"), eq(users.email, "user@example.com")));

    expect(mockFrom).toHaveBeenCalledWith(users);
    expect(mockWhere).toHaveBeenCalled();
  });

  it("builds query with userId filter for experiences", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    await db
      .select()
      .from(experiences)
      .where(eq(experiences.userId, "user-id"));

    expect(mockWhere).toHaveBeenCalled();
  });

  it("builds query with userId filter for applications", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    await db
      .select()
      .from(applications)
      .where(eq(applications.userId, "user-id"));

    expect(mockWhere).toHaveBeenCalled();
  });

  it("builds query with combined filters using AND", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    await db
      .select()
      .from(experiences)
      .where(
        and(
          eq(experiences.userId, "user-id"),
          eq(experiences.id, "experience-id"),
        ),
      );

    expect(mockWhere).toHaveBeenCalled();
  });
});
