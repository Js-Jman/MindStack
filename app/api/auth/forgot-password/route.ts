import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim();
    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a reset code has been sent." },
        { status: 200 }
      );
    }

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // 6-digit numeric code — your original format
    const code = crypto.randomInt(100000, 999999).toString();

    // Hash before storing
    const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME ?? "MindStack"}" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #7c3aed; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #374151;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #374151;">Enter the code below on the password reset page. It expires in <strong>15 minutes</strong>.</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2563eb; margin: 28px 0; text-align: center; background: #eff6ff; padding: 16px; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    const sessionToken = Buffer.from(
      JSON.stringify({ email: trimmedEmail, ts: Date.now() })
    ).toString("base64url");

    return NextResponse.json({
      message: "If that email exists, a reset code has been sent.",
      sessionToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}