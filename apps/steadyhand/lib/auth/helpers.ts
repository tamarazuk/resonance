import { redirect } from "next/navigation"
import { auth } from "./config"

/**
 * Get the current session or redirect to login.
 * Use in Server Components and Route Handlers that require authentication.
 *
 * Next.js 16 note: `auth()` internally awaits async request APIs
 * (cookies, headers), so callers must `await` this function.
 */
export async function getRequiredSession() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return session
}
