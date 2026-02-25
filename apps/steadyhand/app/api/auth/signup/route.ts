import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db, users } from "@resonance/db"
import { signupSchema } from "@resonance/types"

const BCRYPT_ROUNDS = 12

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { email, password, fullName } = parsed.data

  // Check for existing user
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  })

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    )
  }

  const passwordHash = await hash(password, BCRYPT_ROUNDS)

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, fullName: fullName ?? null })
    .returning({ id: users.id, email: users.email, fullName: users.fullName })

  return NextResponse.json(user, { status: 201 })
}
