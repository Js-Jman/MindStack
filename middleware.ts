
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const AUTH_PAGES = ["/signin", "/signup"];

const PUBLIC_PATHS = [
  "/",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-code",
  "/reset-password",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/verify-reset-code",
  "/api/auth/reset-password",
  "/api/courses"
];

function roleHome(role: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  if (role === "ADMIN") return "/admin";
  if (role === "INSTRUCTOR") return "/instructor";
  return "/student";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract token from Authorization header or cookie
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = req.cookies.get("ms_token")?.value;
  const token = headerToken || cookieToken;

  let session = null;

  if (token) {
    // Verify JWT token
    session = await verifyToken(token);
  }

  // Keep landing page public for everyone.
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth entry pages.
  if (AUTH_PAGES.includes(pathname) && session) {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  // Allow remaining public paths.
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Role-based guards
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  if (pathname.startsWith("/instructor") && session.role !== "INSTRUCTOR") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  if (pathname.startsWith("/student") && session.role !== "STUDENT") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  // Attach user info to response headers for downstream handlers
  const response = NextResponse.next();
  response.headers.set("x-user-id", String(session.userId));
  response.headers.set("x-user-role", session.role);
  response.headers.set("x-user-email", session.email);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};