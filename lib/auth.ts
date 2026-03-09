// // lib/auth.ts
// import { cookies } from "next/headers";
// import { NextRequest } from "next/server";
// import { verifyToken, type TokenPayload } from "./jwt";

// export const COOKIE_NAME = "ms_token";

// /** For Server Components and Route Handlers */
// export async function getSession(): Promise<TokenPayload | null> {
//   const cookieStore = await cookies();
//   const token = cookieStore.get(COOKIE_NAME)?.value;
//   if (!token) return null;
//   return verifyToken(token);
// }

// /** For Middleware */
// export async function getSessionFromRequest(
//   req: NextRequest
// ): Promise<TokenPayload | null> {
//   const token = req.cookies.get(COOKIE_NAME)?.value;
//   if (!token) return null;
//   return verifyToken(token);
// }

// lib/auth.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken, type TokenPayload } from "./jwt";

export const COOKIE_NAME = "ms_token";

/** For Server Components and Route Handlers */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** For Middleware */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}