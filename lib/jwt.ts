// lib/jwt.ts
// npm install jose  (already lighter than jsonwebtoken, works in Edge runtime)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change_this_secret_min_32_chars!!"
);

export interface TokenPayload extends JWTPayload {
  userId: number;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  email: string;
  name: string;
}

/** Create a signed JWT valid for 7 days */
export async function signToken(payload: Omit<TokenPayload, keyof JWTPayload>) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

/** Verify and decode a JWT.  Returns null if invalid / expired. */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}