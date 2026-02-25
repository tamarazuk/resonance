import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db, users } from "@resonance/db";
import { signupSchema } from "@resonance/types";

const BCRYPT_ROUNDS = 12;

function hasErrorCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: unknown; cause?: unknown };

  if (maybeError.code === code) return true;
  if (maybeError.cause) return hasErrorCode(maybeError.cause, code);

  if (error instanceof AggregateError) {
    return error.errors.some((nestedError) => hasErrorCode(nestedError, code));
  }

  return false;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (body === null) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password, fullName } = parsed.data;

  try {
    // Check for existing user
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, fullName: fullName ?? null })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Signup failed", error);

    if (hasErrorCode(error, "ECONNREFUSED")) {
      return NextResponse.json(
        {
          error:
            "Authentication service is temporarily unavailable. Please try again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create account right now. Please try again." },
      { status: 500 },
    );
  }
}
