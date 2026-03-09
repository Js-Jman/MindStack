/**
 * @file POST /api/auth/signin - User email/password authentication
 * 
 * This route handler orchestrates HTTP requests for user sign-in/authentication.
 * 
 * Responsibilities (API Layer):
 * 1. Extract and validate HTTP request data (email, password)
 * 2. Call auth service to authenticate user
 * 3. Handle JWT token generation
 * 4. Set secure HTTP-only cookie with token
 * 5. Map business logic errors to HTTP status codes
 */

import { NextRequest, NextResponse } from "next/server";
import { signin } from "@/services/auth.service";
import { COOKIE_NAME } from "@/lib/auth";

/**
 * POST /api/auth/signin
 * 
 * Authenticates user with email and password.
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "userPassword123"
 * }
 * 
 * Response:
 * {
 *   "user": {
 *     "id": 1,
 *     "name": "John Doe",
 *     "email": "user@example.com",
 *     "role": "STUDENT"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 * 
 * Cookies set:
 * - Sets secure HTTP-only cookie with JWT token (7 days expiration)
 *
 * Status Codes:
 * - 200: Login successful
 * - 400: Missing required fields
 * - 401: Invalid credentials
 * - 500: Server error
 * 
 * @param req - Next.js request object
 * @returns JSON with user info and JWT token
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Extract request body
    const { email, password } = await req.json();

    // Step 1.5: Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Step 2: Call auth service to verify credentials and generate token
    // Service handles:
    // - Password verification via bcryptjs
    // - JWT token generation
    // - Email verification
    // - Error handling for invalid credentials
    const result = await signin(email, password);

    // Step 3: Create response with user info and token
    const res = NextResponse.json(
      {
        user: result.user,
        token: result.token,
      },
      { status: 200 }
    );

    // Step 4: Set secure HTTP-only cookie with JWT token
    // Cookie configuration:
    // - httpOnly: true (prevents JavaScript access, mitigates XSS)
    // - secure: true in production (only sent over HTTPS)
    // - sameSite: "lax" (CSRF protection)
    // - maxAge: 7 days
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return res;
  } catch (error: unknown) {
    console.error("Signin error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Map authentication errors to appropriate HTTP status
    if (message === "Invalid credentials") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}