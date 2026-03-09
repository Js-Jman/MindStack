import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Roles } from "@/types/user";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change_this_secret_min_32_chars!!"
);

export interface TokenPayload extends JWTPayload {
  userId: number;
  role: Roles;
  email: string;
  name: string;
}

export async function signToken(payload: Omit<TokenPayload, keyof JWTPayload>) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}