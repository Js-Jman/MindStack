// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// export async function POST(req: Request) {
//   try {
//     const { email, code, newPassword } = await req.json();

//     if (!email || !code || !newPassword) {
//       return NextResponse.json(
//         { message: "Email, code, and new password are required" },
//         { status: 400 }
//       );
//     }

//     if (newPassword.length < 8) {
//       return NextResponse.json(
//         { message: "Password must be at least 8 characters" },
//         { status: 400 }
//       );
//     }

//     const trimmedEmail = email.trim();
//     const trimmedCode = code.trim();

//     const user = await db.user.findUnique({ where: { email: trimmedEmail } });

//     if (!user) {
//       return NextResponse.json(
//         { message: "Invalid request" },
//         { status: 400 }
//       );
//     }

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(trimmedCode)
//       .digest("hex");

//     const resetToken = await db.passwordResetToken.findFirst({
//       where: {
//         userId: user.id,
//         token: hashedToken,
//         expiresAt: { gt: new Date() },
//       },
//     });

//     if (!resetToken) {
//       return NextResponse.json(
//         { message: "Invalid or expired code" },
//         { status: 400 }
//       );
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await db.user.update({
//       where: { id: user.id },
//       data: { password: hashedPassword },
//     });

//     // delete the used token
//     await db.passwordResetToken.delete({
//       where: { id: resetToken.id },
//     });

//     return NextResponse.json(
//       { message: "Password updated successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Reset password error:", error);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/reset-password/route.ts
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

    // Verify the DB token still exists (one-use)
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

    // Consume the token so it can't be reused
    await prisma.passwordResetToken.delete({ where: { id: tokenId } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}