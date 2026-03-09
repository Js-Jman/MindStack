import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { sessionToken, code } = await req.json();

    if (!sessionToken || !code) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let email: string;
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, "base64url").toString());
      email = decoded.email;
      if (Date.now() - decoded.ts > 20 * 60 * 1000) {
        return NextResponse.json(
          { error: "Session expired. Please restart." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const hashedSubmitted = crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");

    const record = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: hashedSubmitted,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const resetToken = Buffer.from(
      JSON.stringify({ userId: user.id, tokenId: record.id, ts: Date.now() })
    ).toString("base64url");

    return NextResponse.json({ resetToken });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}