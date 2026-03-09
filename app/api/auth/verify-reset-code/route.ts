// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import crypto from "crypto";

// export async function POST(req: Request) {
//   try {
//     const { email, code } = await req.json();

//     if (!email || !code) {
//       return NextResponse.json(
//         { message: "Email and code are required" },
//         { status: 400 }
//       );
//     }

//     const trimmedEmail = email.trim();
//     const trimmedCode = code.trim();

//     const user = await db.user.findUnique({ where: { email: trimmedEmail } });

//     if (!user) {
//       return NextResponse.json(
//         { message: "Invalid code" },
//         { status: 400 }
//       );
//     }

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(trimmedCode)
//       .digest("hex");

//     // to check if there is a valid token (within the current time)
//     const resetToken = await db.passwordResetToken.findFirst({
//       where: {
//         userId: user.id,
//         token: hashedToken,
//         expiresAt: { gt: new Date() },
//       },
//     });

//     // if there is no token within the current time
//     if (!resetToken) {

//       // if there is an expired token
//       const expiredToken = await db.passwordResetToken.findFirst({
//         where: { userId: user.id, token: hashedToken },
//       });

//       if (expiredToken) {
//         return NextResponse.json(
//           { message: "Code has expired. Please request a new one." },
//           { status: 400 }
//         );
//       }
      
//       return NextResponse.json(
//         { message: "Invalid code. Please check and try again." },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Code verified" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Verify code error:", error);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/verify-reset-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { sessionToken, code } = await req.json();

    if (!sessionToken || !code) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Decode the opaque session token to get email
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

    // Hash the submitted code the same way it was stored
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

    // Issue a short-lived reset token for the final step
    const resetToken = Buffer.from(
      JSON.stringify({ userId: user.id, tokenId: record.id, ts: Date.now() })
    ).toString("base64url");

    return NextResponse.json({ resetToken });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}