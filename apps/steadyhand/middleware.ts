import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth

  // Protect all /dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/signup") &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
