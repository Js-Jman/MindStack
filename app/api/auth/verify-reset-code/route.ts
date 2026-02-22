import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and code are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    const user = await db.user.findUnique({ where: { email: trimmedEmail } });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid code" },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(trimmedCode)
      .digest("hex");

    // to check if there is a valid token (within the current time)
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: hashedToken,
        expiresAt: { gt: new Date() },
      },
    });

    // if there is no token within the current time
    if (!resetToken) {

      // if there is an expired token
      const expiredToken = await db.passwordResetToken.findFirst({
        where: { userId: user.id, token: hashedToken },
      });

      if (expiredToken) {
        return NextResponse.json(
          { message: "Code has expired. Please request a new one." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { message: "Invalid code. Please check and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Code verified" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}