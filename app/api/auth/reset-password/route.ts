import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { resetToken, newPassword } = await req.json();

    if (!resetToken || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    let userId: number;
    let tokenId: number;
    try {
      const decoded = JSON.parse(Buffer.from(resetToken, "base64url").toString());
      userId = decoded.userId;
      tokenId = decoded.tokenId;
      if (Date.now() - decoded.ts > 10 * 60 * 1000) {
        return NextResponse.json({ error: "Reset token expired" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { id: tokenId },
    });

    if (!record || record.userId !== userId || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashed = await hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    await prisma.passwordResetToken.delete({ where: { id: tokenId } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}